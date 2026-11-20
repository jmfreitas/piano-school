import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseSong, SongParseError, octaveRange, letterLabel } from '../app/js/song.js';
import { LIBRARY } from '../app/js/library.js';

test('parses header, parts, rests and octaves', () => {
  const song = parseSong(`
    titulo: Teste
    tom: C
    G3:We C4:wish C4:you . D4:a   // comentário
    C:Year
  `, 'teste');
  assert.equal(song.title, 'Teste');
  assert.equal(song.key, 'C');
  assert.equal(song.parts.length, 2);
  const [p1, p2] = song.parts;
  assert.deepEqual(p1.map((i) => i.kind), ['note', 'note', 'note', 'rest', 'note']);
  assert.equal(p1[0].letter, 'G');
  assert.equal(p1[0].octave, 3);
  assert.equal(p1[0].midi, 55);
  assert.equal(p1[1].syllable, 'wish');
  assert.equal(p2[0].octave, 4, 'octave defaults to 4');
});

test('sharps and flats are spelled with sharps', () => {
  const [part] = parseSong('F#4 Bb3 E#4 Cb4').parts;
  assert.deepEqual(part.map((n) => `${letterLabel(n)}${n.octave}`), ['F#4', 'A#3', 'F4', 'B3']);
});

test('drops leading, trailing and doubled rests', () => {
  const [part] = parseSong('. C4 . . D4 .').parts;
  assert.deepEqual(part.map((i) => i.kind), ['note', 'rest', 'note']);
});

test('reports bad tokens with the line number', () => {
  assert.throws(() => parseSong('titulo: X\nC4 H4'), (err) => err instanceof SongParseError && err.line === 2);
});

test('octave range includes the home octave', () => {
  const song = parseSong('G3 C4 D4');
  assert.deepEqual(octaveRange(song, 4), [3, 4]);
});

test('built-in library parses', () => {
  assert.ok(LIBRARY.length >= 5);
  for (const song of LIBRARY) {
    assert.ok(song.title, song.id);
    assert.ok(song.parts.length > 0, song.id);
  }
});
