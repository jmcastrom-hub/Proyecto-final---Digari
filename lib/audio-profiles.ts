export type AudioProfile = {
  label: string;
  waveform: OscillatorType;
  cutoffHz: number;
  overtone: number;
  attackSeconds: number;
  releaseSeconds: number;
};

const profiles: Record<string, AudioProfile> = {
  'acoustic-guitar': { label: 'guitarra acústica sintética', waveform: 'triangle', cutoffHz: 3600, overtone: 0.16, attackSeconds: 0.012, releaseSeconds: 0.72 },
  'electric-guitar': { label: 'guitarra eléctrica sintética', waveform: 'sawtooth', cutoffHz: 2400, overtone: 0.1, attackSeconds: 0.008, releaseSeconds: 0.62 },
  bass: { label: 'bajo sintético', waveform: 'sawtooth', cutoffHz: 780, overtone: 0.05, attackSeconds: 0.018, releaseSeconds: 0.82 },
  ukulele: { label: 'ukelele sintético', waveform: 'triangle', cutoffHz: 4600, overtone: 0.22, attackSeconds: 0.009, releaseSeconds: 0.58 },
  keyboard: { label: 'teclado sintético', waveform: 'sine', cutoffHz: 5600, overtone: 0.28, attackSeconds: 0.006, releaseSeconds: 0.7 },
};

const defaultProfile: AudioProfile = { label: 'teclado sintético', waveform: 'sine', cutoffHz: 5600, overtone: 0.28, attackSeconds: 0.006, releaseSeconds: 0.7 };

export function getAudioProfile(modelRef?: string): AudioProfile {
  return profiles[modelRef ?? ''] ?? defaultProfile;
}
