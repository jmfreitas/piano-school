/** Natural note letters, in keyboard order. */
export type Letter = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';

export const LETTERS: readonly Letter[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

/** The "home" octave: C4 is middle C (Dó central). */
export const HOME_OCTAVE = 4;

export interface NoteInfo {
  /** Solfège name shown under the letter. */
  name: string;
  /** Light background colour of the note's card. */
  bg: string;
  /** Dark ink colour (text and border) — at least 4.5:1 on `bg`. */
  ink: string;
}

/** Each note keeps the same colour everywhere in the app. */
export const NOTE_INFO: Record<Letter, NoteInfo> = {
  C: { name: 'Dó', bg: '#FFD9D4', ink: '#A8231B' },
  D: { name: 'Ré', bg: '#FFE2BD', ink: '#8F4500' },
  E: { name: 'Mi', bg: '#FFF0A6', ink: '#6E5500' },
  F: { name: 'Fá', bg: '#CFEFD5', ink: '#1B6331' },
  G: { name: 'Sol', bg: '#CFE6FF', ink: '#0A549E' },
  A: { name: 'Lá', bg: '#DEDAFF', ink: '#4636A8' },
  B: { name: 'Si', bg: '#FAD5EC', ink: '#951C66' },
};

/** Semitone offset of each natural letter inside an octave. */
export const LETTER_SEMITONE: Record<Letter, number> = {
  C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11,
};

/** Spelling of the 12 pitch classes, using sharps. */
const PITCH_CLASSES: ReadonlyArray<{ letter: Letter; sharp: boolean }> = [
  { letter: 'C', sharp: false }, { letter: 'C', sharp: true },
  { letter: 'D', sharp: false }, { letter: 'D', sharp: true },
  { letter: 'E', sharp: false },
  { letter: 'F', sharp: false }, { letter: 'F', sharp: true },
  { letter: 'G', sharp: false }, { letter: 'G', sharp: true },
  { letter: 'A', sharp: false }, { letter: 'A', sharp: true },
  { letter: 'B', sharp: false },
];

/** MIDI number of a note (C4 = 60). */
export function toMidi(letter: Letter, accidental: number, octave: number): number {
  return (octave + 1) * 12 + LETTER_SEMITONE[letter] + accidental;
}

/** Spell a MIDI number as letter + sharp + octave. */
export function fromMidi(midi: number): { letter: Letter; sharp: boolean; octave: number } {
  const pc = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return { ...PITCH_CLASSES[pc]!, octave };
}
