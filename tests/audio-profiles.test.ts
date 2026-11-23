import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getAudioProfile } from '../lib/audio-profiles';
import { frequency, noteMidi } from '../lib/music-theory';

describe('perfiles sintéticos del estudio', () => {
  it('cambia el perfil al seleccionar guitarra, teclado y bajo', () => {
    const guitar = getAudioProfile('acoustic-guitar');
    const keyboard = getAudioProfile('keyboard');
    const bass = getAudioProfile('bass');
    assert.notEqual(guitar.waveform, keyboard.waveform);
    assert.notEqual(guitar.cutoffHz, bass.cutoffHz);
    assert.notEqual(keyboard.overtone, bass.overtone);
    assert.match(guitar.label, /sintética/);
    assert.match(keyboard.label, /sintético/);
    assert.match(bass.label, /sintético/);
  });

  it('conserva la frecuencia base de la misma nota entre perfiles', () => {
    const note = noteMidi.C;
    const pitch = frequency(note);
    for (const model of ['acoustic-guitar', 'keyboard', 'bass']) {
      const profile = getAudioProfile(model);
      assert.ok(profile.cutoffHz > 0);
      assert.equal(frequency(note), pitch);
    }
  });
});
