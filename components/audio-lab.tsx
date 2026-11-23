'use client';

import { useState } from 'react';
import { getAudioProfile } from '@/lib/audio-profiles';
import { degreeNames, frequency, keys, majorIntervals, minorIntervals, noteMidi, noteNames, pcNames, progressions } from '@/lib/music-theory';
type LabProps = { modelRef?: string };
const passive = new Set(['string-set', 'instrument-cable', 'reed']);
const audioFamilies = new Set(['microphone', 'studio-monitor', 'speaker', 'audio-interface', 'headphones', 'dj-controller']);

function rms(buffer: AudioBuffer) { const data = buffer.getChannelData(0); let sum = 0; for (let i = 0; i < data.length; i++) sum += data[i] * data[i]; return Math.sqrt(sum / data.length); }

export default function AudioLab({ modelRef }: LabProps) {
  const [keyIndex, setKeyIndex] = useState(0); const [scaleKind, setScaleKind] = useState<'major' | 'minor'>('major'); const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false);
  const instrumentProfile = getAudioProfile(modelRef);
  async function getContext() { const Context = window.AudioContext; if (!Context) throw new Error('Web Audio no está disponible en este navegador.'); const context = new Context(); if (context.state === 'suspended') await context.resume(); return context; }
  async function playNote(name: string) {
    setMessage('');
    try {
      const context = await getContext(); const now = context.currentTime; const fundamental = frequency(noteMidi[name]);
      const oscillator = context.createOscillator(); const filter = context.createBiquadFilter(); const gain = context.createGain();
      oscillator.type = instrumentProfile.waveform; oscillator.frequency.value = fundamental; filter.type = 'lowpass'; filter.frequency.value = instrumentProfile.cutoffHz;
      gain.gain.setValueAtTime(0.0001, now); gain.gain.exponentialRampToValueAtTime(0.13, now + instrumentProfile.attackSeconds); gain.gain.exponentialRampToValueAtTime(0.0001, now + instrumentProfile.releaseSeconds);
      oscillator.connect(filter).connect(gain).connect(context.destination); oscillator.start(now); oscillator.stop(now + instrumentProfile.releaseSeconds + 0.03);
      const overtone = context.createOscillator(); const overtoneGain = context.createGain(); overtone.type = 'sine'; overtone.frequency.value = fundamental * 2;
      overtoneGain.gain.setValueAtTime(0.0001, now); overtoneGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, instrumentProfile.overtone), now + instrumentProfile.attackSeconds); overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + instrumentProfile.releaseSeconds * 0.8);
      overtone.connect(overtoneGain).connect(context.destination); overtone.start(now); overtone.stop(now + instrumentProfile.releaseSeconds + 0.03);
      setMessage(name + ': ' + fundamental.toFixed(2) + ' Hz \u00b7 ' + instrumentProfile.label + '; simulaci\u00f3n, no muestra grabada.');
      window.setTimeout(() => { void context.close(); }, 1000);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo iniciar el audio.'); }
  }
  async function playSequence(notes: number[], label: string) {
    if (busy) return; setBusy(true); setMessage(`Reproduciendo ${label} · timbre sintético`);
    try { const context = await getContext(); let time = context.currentTime + 0.04; notes.forEach((midi) => { const oscillator = context.createOscillator(); const filter = context.createBiquadFilter(); const gain = context.createGain(); oscillator.type = instrumentProfile.waveform; oscillator.frequency.value = frequency(midi); filter.type = 'lowpass'; filter.frequency.value = instrumentProfile.cutoffHz; gain.gain.setValueAtTime(0.0001, time); gain.gain.exponentialRampToValueAtTime(0.12, time + 0.03); gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.42); oscillator.connect(filter).connect(gain).connect(context.destination); oscillator.start(time); oscillator.stop(time + 0.44); time += 0.48; }); window.setTimeout(() => { void context.close(); setBusy(false); setMessage(`${label} · audio sintetizado; reproducción terminada.`); }, notes.length * 490); } catch (error) { setBusy(false); setMessage(error instanceof Error ? error.message : 'No se pudo iniciar el audio.'); }
  }
  async function compare(profile: 'A' | 'B') {
    if (!audioFamilies.has(modelRef ?? '')) return;
    try {
      const context = await getContext(); const sampleRate = context.sampleRate; const length = sampleRate * 2;
      const sourceBuffer = context.createBuffer(1, length, sampleRate); const sourceData = sourceBuffer.getChannelData(0);
      for (let i = 0; i < length; i++) { const t = i / sampleRate; sourceData[i] = (Math.sin(2 * Math.PI * 220 * t) + 0.45 * Math.sin(2 * Math.PI * 440 * t) + 0.2 * Math.sin(2 * Math.PI * 880 * t)) * (0.22 + 0.08 * Math.sin(2 * Math.PI * 1.4 * t)); }
      let rendered: AudioBuffer;
      let correction = 1;
      if (profile === 'B') {
        const Offline = window.OfflineAudioContext; if (!Offline) throw new Error('La comparación A/B necesita OfflineAudioContext en este navegador.');
        const offline = new Offline(1, length, sampleRate); const source = offline.createBufferSource(); source.buffer = sourceBuffer;
        const filter = offline.createBiquadFilter(); filter.type = 'peaking'; filter.frequency.value = 1450; filter.Q.value = 0.8; filter.gain.value = 3;
        source.connect(filter).connect(offline.destination); source.start(); rendered = await offline.startRendering(); correction = rms(sourceBuffer) / Math.max(0.000001, rms(rendered));
      } else rendered = sourceBuffer;
      const output = context.createBufferSource(); output.buffer = rendered; const gain = context.createGain(); gain.gain.value = Math.min(4, correction); output.connect(gain).connect(context.destination); output.start();
      setMessage(`Perfil ${profile} · simulación digital sobre la misma señal de 220/440/880 Hz. ${profile === 'B' ? `Corrección RMS aplicada: ${correction.toFixed(3)}× para equiparar nivel;` : 'Nivel de referencia;'} no describe un altavoz real ni una medición acústica.`);
      window.setTimeout(() => { void context.close(); }, 2300);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo reproducir la comparación.'); }
  }
  const key = keys[keyIndex]; const scale = key[scaleKind]; const intervals = scaleKind === 'major' ? majorIntervals : minorIntervals;
  const triads = [0, 1, 2, 3, 4, 5, 6].map((degree) => {
    const root = intervals[degree]; const third = intervals[(degree + 2) % 7] + (degree + 2 >= 7 ? 12 : 0); const fifth = intervals[(degree + 4) % 7] + (degree + 4 >= 7 ? 12 : 0);
    const quality = fifth - root === 7 && third - root === 4 ? 'mayor' : third - root === 3 && fifth - root === 7 ? 'menor' : fifth - root === 6 ? 'disminuido' : 'aumentado';
    return { degree: degreeNames[degree], name: `${scale[degree]} ${quality}`, notes: [60 + key.pc + root, 60 + key.pc + third, 60 + key.pc + fifth] };
  });
  return <div className="audio-lab">
    <div className="notice"><strong>Audio sintético.</strong> Tonos de onda triangular por Web Audio. E♯ comparte frecuencia con F; B♯ suena como C de la octava siguiente. La escritura se conserva en pantalla. No hay muestras originales autorizadas ni grabaciones reales identificadas.</div>
    {passive.has(modelRef ?? '') ? <div className="audio-card"><h3>Accesorio pasivo</h3><p>Este accesorio no tiene timbre propio. No se reproduce una simulación atribuida al cable, juego de cuerdas o caña.</p></div> : <>
      <div className="audio-card"><h3>Notas individuales &#183; {instrumentProfile.label}</h3><div className="note-grid">{noteNames.map((note) => <button type="button" className="button button-outline button-small" key={note} onClick={() => void playNote(note)} aria-label={`Reproducir nota ${note} con ${instrumentProfile.label}`}>{note}</button>)}</div><p className="micro-copy">Simulaci&oacute;n sint&eacute;tica por tipo de instrumento; no hay muestras grabadas autorizadas asociadas a esta ficha. La frecuencia de la nota se conserva al cambiar entre guitarra, teclado y bajo.</p></div>
      <div className="audio-card"><h3>Escalas y triadas · 12 tonalidades</h3><div className="scale-controls"><label>Tonalidad<select value={keyIndex} onChange={(event) => setKeyIndex(Number(event.target.value))}>{keys.map((item, index) => <option value={index} key={item.name}>{item.name}</option>)}</select></label><label>Escala<select value={scaleKind} onChange={(event) => setScaleKind(event.target.value as 'major' | 'minor')}><option value="major">Mayor</option><option value="minor">Menor natural</option></select></label></div><p><strong>{key.name} {scaleKind === 'major' ? 'mayor' : 'menor natural'}:</strong> {scale.map((note, index) => `${degreeNames[index]} ${note}`).join(' · ')}</p><div className="triad-grid">{triads.map((chord) => <button className="triad-button" type="button" key={chord.degree} onClick={() => void playSequence(chord.notes, chord.name)}><small>Grado {chord.degree}</small><strong>{chord.name}</strong><span>{chord.notes.map((n) => pcNames[n % 12]).join(' · ')}</span></button>)}</div></div>
      <div className="audio-card"><h3>Progresiones de ejemplo</h3><div className="progression-row">{progressions.map((sequence) => <button className="button button-outline button-small" type="button" key={sequence.label} disabled={busy} onClick={() => void playSequence(sequence.chords.flatMap((chord) => chord.map((offset) => sequence.root - (sequence.label.startsWith('C') ? 60 : 67) + 60 + offset)), sequence.label)}>▶ {sequence.label}</button>)}</div></div>
      {audioFamilies.has(modelRef ?? '') && <div className="audio-card"><h3>Comparación A/B del mismo sonido</h3><p>Perfil A es la señal de referencia. Perfil B aplica un realce digital moderado en 1,45 kHz. Ambos usan el mismo búfer sintetizado y B recibe corrección RMS calculada en el navegador. Es una simulación educativa; no representa ni mide equipos físicos.</p><div className="progression-row"><button className="button button-outline button-small" type="button" onClick={() => void compare('A')}>Escuchar A · referencia simulada</button><button className="button button-outline button-small" type="button" onClick={() => void compare('B')}>Escuchar B · EQ simulado</button></div></div>}
      {message && <p className="notice" role="status" aria-live="polite">{message}</p>}
    </>}
  </div>;
}
