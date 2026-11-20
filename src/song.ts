import { type Letter, fromMidi, toMidi } from './notes.js';

/*
 * Song text format (see README):
 *
 *   titulo: We Wish You a Merry Christmas
 *   tom: C
 *
 *   G3:We C4:wish C4:you . D4:a C4:mer- B3:ry A3:Christ- A3:mas
 *   ...
 *
 * - Header lines `titulo:`, `tom:`, `autor:` (case-insensitive).
 * - Every other non-empty line is one part (one screen).
 * - Note token: letter A–G, optional `#` or `b`, optional octave (default 4),
 *   optional `:syllable`. A trailing `-` in the syllable joins it to the next.
 * - `.` is a rest between two notes.
 * - `//` starts a comment until the end of the line.
 */

export interface Note {
  kind: 'note';
  letter: Letter;
  sharp: boolean;
  octave: number;
  midi: number;
  syllable: string;
}

export interface Rest {
  kind: 'rest';
}

export type Item = Note | Rest;

export interface Song {
  id: string;
  title: string;
  key: string;
  author: string;
  parts: Item[][];
}

export class SongParseError extends Error {
  constructor(message: string, readonly line: number) {
    super(`Linha ${line}: ${message}`);
    this.name = 'SongParseError';
  }
}

const HEADER = /^(titulo|título|tom|autor)\s*:\s*(.*)$/i;
const NOTE = /^([A-Ga-g])([#b]?)(-?\d)?(?::(.*))?$/;

export function parseSong(text: string, id = ''): Song {
  const song: Song = { id, title: '', key: '', author: '', parts: [] };

  text.split(/\r?\n/).forEach((rawLine, index) => {
    const lineNo = index + 1;
    const line = stripComment(rawLine).trim();
    if (!line) return;

    const header = HEADER.exec(line);
    if (header) {
      const field = header[1]!.toLowerCase();
      const value = header[2]!.trim();
      if (field === 'tom') song.key = value;
      else if (field === 'autor') song.author = value;
      else song.title = value;
      return;
    }

    const part = line.split(/\s+/).map((token) => parseToken(token, lineNo));
    if (!part.some((item) => item.kind === 'note')) {
      throw new SongParseError('a parte não tem notas', lineNo);
    }
    song.parts.push(trimRests(part));
  });

  if (!song.title) song.title = id || 'Sem título';
  if (song.parts.length === 0) throw new SongParseError('a música não tem notas', 1);
  return song;
}

function stripComment(line: string): string {
  const at = line.indexOf('//');
  return at === -1 ? line : line.slice(0, at);
}

function parseToken(token: string, lineNo: number): Item {
  if (token === '.') return { kind: 'rest' };
  const m = NOTE.exec(token);
  if (!m) throw new SongParseError(`não percebi "${token}"`, lineNo);

  const letter = m[1]!.toUpperCase() as Letter;
  const accidental = m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0;
  const octave = m[3] === undefined ? 4 : Number(m[3]);
  if (octave < 0 || octave > 8) throw new SongParseError(`oitava inválida em "${token}"`, lineNo);

  const midi = toMidi(letter, accidental, octave);
  const spelled = fromMidi(midi);
  return {
    kind: 'note',
    letter: spelled.letter,
    sharp: spelled.sharp,
    octave: spelled.octave,
    midi,
    syllable: (m[4] ?? '').replace(/_/g, ' '),
  };
}

/** Rests only make sense between notes; drop leading/trailing/doubled ones. */
function trimRests(part: Item[]): Item[] {
  const out: Item[] = [];
  for (const item of part) {
    if (item.kind === 'rest' && (out.length === 0 || out[out.length - 1]!.kind === 'rest')) continue;
    out.push(item);
  }
  while (out.length && out[out.length - 1]!.kind === 'rest') out.pop();
  return out;
}

export function notesOf(song: Song): Note[] {
  return song.parts.flat().filter((i): i is Note => i.kind === 'note');
}

/** Lowest and highest octave used, always including the home octave. */
export function octaveRange(song: Song, home: number): [number, number] {
  let lo = home;
  let hi = home;
  for (const n of notesOf(song)) {
    lo = Math.min(lo, n.octave);
    hi = Math.max(hi, n.octave);
  }
  return [lo, hi];
}

/** Text label of a note, e.g. "C", "F#". */
export function letterLabel(n: Pick<Note, 'letter' | 'sharp'>): string {
  return n.letter + (n.sharp ? '#' : '');
}
