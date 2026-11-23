export const noteNames = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B', 'E♯', 'B♯'];
export const noteMidi: Record<string, number> = { C: 60, 'C♯': 61, D: 62, 'D♯': 63, E: 64, F: 65, 'F♯': 66, G: 67, 'G♯': 68, A: 69, 'A♯': 70, B: 71, 'E♯': 65, 'B♯': 72 };
export const keys = [
  { name: 'C', pc: 0, major: ['C','D','E','F','G','A','B'], minor: ['C','D','E♭','F','G','A♭','B♭'] },
  { name: 'C♯', pc: 1, major: ['C♯','D♯','E♯','F♯','G♯','A♯','B♯'], minor: ['C♯','D♯','E','F♯','G♯','A','B'] },
  { name: 'D', pc: 2, major: ['D','E','F♯','G','A','B','C♯'], minor: ['D','E','F','G','A','B♭','C'] },
  { name: 'E♭', pc: 3, major: ['E♭','F','G','A♭','B♭','C','D'], minor: ['E♭','F','G♭','A♭','B♭','C♭','D♭'] },
  { name: 'E', pc: 4, major: ['E','F♯','G♯','A','B','C♯','D♯'], minor: ['E','F♯','G','A','B','C','D'] },
  { name: 'F', pc: 5, major: ['F','G','A','B♭','C','D','E'], minor: ['F','G','A♭','B♭','C','D♭','E♭'] },
  { name: 'F♯', pc: 6, major: ['F♯','G♯','A♯','B','C♯','D♯','E♯'], minor: ['F♯','G♯','A','B','C♯','D','E'] },
  { name: 'G', pc: 7, major: ['G','A','B','C','D','E','F♯'], minor: ['G','A','B♭','C','D','E♭','F'] },
  { name: 'A♭', pc: 8, major: ['A♭','B♭','C','D♭','E♭','F','G'], minor: ['A♭','B♭','C♭','D♭','E♭','F♭','G♭'] },
  { name: 'A', pc: 9, major: ['A','B','C♯','D','E','F♯','G♯'], minor: ['A','B','C','D','E','F','G'] },
  { name: 'B♭', pc: 10, major: ['B♭','C','D','E♭','F','G','A'], minor: ['B♭','C','D♭','E♭','F','G♭','A♭'] },
  { name: 'B', pc: 11, major: ['B','C♯','D♯','E','F♯','G♯','A♯'], minor: ['B','C♯','D','E','F♯','G','A'] },
] as const;
export const majorIntervals = [0, 2, 4, 5, 7, 9, 11] as const;
export const minorIntervals = [0, 2, 3, 5, 7, 8, 10] as const;
export const degreeNames = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'] as const;
export const pcNames = ['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'] as const;
export const progressions = [
  { label: 'C – G – Am – F', root: 60, chords: [[0,4,7],[7,11,14],[9,12,16],[5,9,12]] },
  { label: 'G – D – Em – C', root: 67, chords: [[7,11,14],[2,6,9],[4,7,11],[0,4,7]] },
] as const;
export const frequency = (midi: number) => 440 * 2 ** ((midi - 69) / 12);
