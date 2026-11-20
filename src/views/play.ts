import { HOME_OCTAVE, LETTERS, NOTE_INFO, toMidi } from '../notes.js';
import { type Item, type Note, type Song, letterLabel, octaveRange } from '../song.js';
import type { Settings } from '../settings.js';
import { ICONS, esc } from '../dom.js';
import { isFavorite, toggleFavorite } from '../favorites.js';
import { favButton } from './home.js';

const NEUTRAL = { bg: '#FFFFFF', ink: '#1F2430' };

/** White-key indexes (inside one octave) that have a black key to their right. */
const BLACK_AFTER = [0, 1, 3, 4, 5];
/** Black key width as a fraction of a white key. */
const BLACK_WIDTH = 0.58;

interface PlayNav {
  home(): void;
}

/**
 * Mount the play screen. The song is shown one part at a time; the child
 * plays it on the real piano and taps "Seguinte" to move on.
 * Returns a cleanup function.
 */
export function mountPlay(root: HTMLElement, song: Song, settings: Settings, nav: PlayNav): () => void {
  const total = song.parts.length;
  let part = 0; // `total` means "finished"

  const go = (next: number) => {
    part = Math.max(0, Math.min(total, next));
    render();
  };

  const actions: Record<string, () => void> = {
    home: () => nav.home(),
    prev: () => go(part - 1),
    next: () => go(part + 1),
    restart: () => go(0),
    fav: () => { toggleFavorite(song.id); render(); },
  };

  function render(): void {
    const focused = (document.activeElement as HTMLElement | null)?.dataset?.action;
    root.innerHTML = view(song, part, settings);
    if (focused) root.querySelector<HTMLElement>(`[data-action="${focused}"]:not(:disabled)`)?.focus();
  }

  const onClick = (event: MouseEvent) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>('[data-action]');
    const action = target?.dataset.action;
    if (action && actions[action] && !(target as HTMLButtonElement).disabled) actions[action]();
  };

  // Keyboard, Bluetooth page-turner pedals and presenters send these keys.
  const onKey = (event: KeyboardEvent) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const onButton = (event.target as HTMLElement).tagName === 'BUTTON';
    if (onButton && (event.key === ' ' || event.key === 'Enter')) return; // the button's own click handles it
    const map: Record<string, string> = {
      ArrowRight: 'next', PageDown: 'next', ' ': 'next', Enter: 'next',
      ArrowLeft: 'prev', PageUp: 'prev',
      Home: 'restart', Escape: 'home',
    };
    const action = map[event.key];
    if (!action) return;
    event.preventDefault();
    if (action === 'prev' && part === 0) return;
    actions[action]!();
  };

  const wakeLock = keepScreenOn();

  root.addEventListener('click', onClick);
  window.addEventListener('keydown', onKey);
  render();

  return () => {
    root.removeEventListener('click', onClick);
    window.removeEventListener('keydown', onKey);
    wakeLock.release();
  };
}

function view(song: Song, part: number, s: Settings): string {
  const total = song.parts.length;
  const done = part >= total;
  const items = done ? [] : song.parts[part]!;
  const progress = Math.round((Math.min(part + 1, total) / total) * 100);
  const label = done ? 'Fim da música' : `Parte ${part + 1} de ${total}`;
  const nextLabel = done ? 'De novo' : part === total - 1 ? 'Terminar' : 'Seguinte';

  return `
  <div class="play">
    <header class="bar">
      <button class="icon-btn" data-action="home" aria-label="Voltar às músicas">${ICONS.back}</button>
      <div class="bar-text">
        <h1 class="song-title">${esc(song.title)}</h1>
        <div class="part-label">${esc(label)}</div>
      </div>
      ${favButton(song.id, isFavorite(song.id), 'bar-fav')}
      <div class="progress" role="progressbar" aria-label="Progresso na música" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}">
        <div style="width:${progress}%"></div>
      </div>
    </header>

    <section class="notes-area" aria-label="Notas a tocar">
      ${done ? doneCard() : notesRow(items, s)}
    </section>

    <section class="kbd-area" aria-label="Teclado de referência">
      ${keyboard(song, items, s)}
    </section>

    <nav class="controls" aria-label="Navegação na música">
      <button class="ctl ctl-prev" data-action="prev" ${part === 0 ? 'disabled' : ''} aria-label="Notas anteriores">
        ${ICONS.prev}<span>Atrás</span>
      </button>
      <button class="ctl ctl-restart" data-action="restart" aria-label="Recomeçar a música">
        ${ICONS.restart}<span>Início</span>
      </button>
      <button class="ctl ctl-next" data-action="${done ? 'restart' : 'next'}">
        <span>${nextLabel}</span>${ICONS.next}
      </button>
    </nav>
  </div>`;
}

function colors(n: Pick<Note, 'letter'>, s: Settings) {
  return s.showColors ? NOTE_INFO[n.letter] : NEUTRAL;
}

function noteName(n: Pick<Note, 'letter' | 'sharp'>): string {
  return NOTE_INFO[n.letter].name + (n.sharp ? '#' : '');
}

function notesRow(items: Item[], s: Settings): string {
  const notes = items.filter((i) => i.kind === 'note').length;
  const rests = items.length - notes;
  const lyrics = s.showLyrics && items.some((i) => i.kind === 'note' && i.syllable);
  // Vertical layout: 4 cards per row; 5 when that fits the part better (5 notes in one row, long parts in 2 rows).
  const cols = notes === 5 || notes > 8 ? 5 : 4;
  const cells = items.map((item) => (item.kind === 'rest' ? restCell() : noteCell(item, s))).join('');
  return `<div class="notes${lyrics ? '' : ' no-lyrics'}" style="--n:${notes};--r:${rests};--cols:${cols}">${cells}</div>`;
}

function restCell(): string {
  return `<div class="rest" role="img" aria-label="pausa"><span></span></div>`;
}

function noteCell(n: Note, s: Settings): string {
  const c = colors(n, s);
  const dir = n.octave > HOME_OCTAVE ? 'up' : n.octave < HOME_OCTAVE ? 'down' : '';
  const octaveText = dir === 'up' ? ', oitava acima' : dir === 'down' ? ', oitava abaixo' : '';
  const main = s.showLetters ? letterLabel(n) : noteName(n);
  const mainClass = s.showLetters ? (n.sharp ? 'tile-main sharp' : 'tile-main') : 'tile-main name';
  return `
    <div class="tile-col">
      <div class="tile ${dir}" style="--bg:${c.bg};--nink:${c.ink}" role="img" aria-label="${esc(noteName(n) + ' (' + letterLabel(n) + ')' + octaveText)}">
        ${dir === 'up' ? `<span class="tile-arrow">${ICONS.up}</span>` : ''}
        <span class="${mainClass}">${esc(main)}</span>
        ${s.showLetters ? `<span class="tile-sub">${esc(noteName(n))}</span>` : ''}
        ${dir === 'down' ? `<span class="tile-arrow">${ICONS.down}</span>` : ''}
      </div>
      <div class="syll">${s.showLyrics ? esc(n.syllable) : ''}</div>
    </div>`;
}

function doneCard(): string {
  return `
    <div class="done" role="status">
      <div class="stars">${ICONS.star}${ICONS.star}${ICONS.star}</div>
      <h2>Muito bem!</h2>
      <p>Tocaste a música toda</p>
      <button class="btn-secondary" data-action="home">Outras músicas</button>
    </div>`;
}

/** Reference keyboard: the octaves the song needs; keys used in this part light up. */
function keyboard(song: Song, items: Item[], s: Settings): string {
  const [lo, hi] = octaveRange(song, HOME_OCTAVE);
  const octaves = hi - lo + 1;
  const whites = octaves * 7;
  const lit = new Set(items.filter((i): i is Note => i.kind === 'note').map((n) => n.midi));

  let whiteKeys = '';
  let blackKeys = '';
  for (let o = lo; o <= hi; o++) {
    LETTERS.forEach((letter, i) => {
      const midi = toMidi(letter, 0, o);
      const on = lit.has(midi);
      const c = s.showColors ? NOTE_INFO[letter] : { bg: '#E9E6DF', ink: '#1F2430' };
      const home = letter === 'C' && o === HOME_OCTAVE;
      const arrow = on && o !== HOME_OCTAVE ? (o > HOME_OCTAVE ? ICONS.up : ICONS.down) : '';
      const label = `Tecla ${NOTE_INFO[letter].name} (${letter}${o})${home ? ', Dó central' : ''}${on ? ', usada agora' : ''}`;
      whiteKeys += `
        <div class="wkey${on ? ' lit' : ''}" style="--bg:${c.bg};--nink:${c.ink}" role="img" aria-label="${esc(label)}">
          ${home ? `<span class="key-star">${ICONS.star}</span>` : ''}
          ${arrow ? `<span class="key-arrow">${arrow}</span>` : ''}
          <span class="key-letter">${letter}</span>
          <span class="key-name">${NOTE_INFO[letter].name}</span>
        </div>`;

      if (BLACK_AFTER.includes(i)) {
        const index = (o - lo) * 7 + i;
        const bMidi = midi + 1;
        const bOn = lit.has(bMidi);
        const width = (BLACK_WIDTH / whites) * 100;
        const left = ((index + 1) / whites) * 100 - width / 2;
        const bc = s.showColors ? NOTE_INFO[letter] : { bg: '#E9E6DF', ink: '#1F2430' };
        blackKeys += `<div class="bkey${bOn ? ' lit' : ''}" style="left:${left.toFixed(3)}%;width:${width.toFixed(3)}%;--bg:${bc.bg};--nink:${bc.ink}" aria-hidden="true"></div>`;
      }
    });
  }
  return `<div class="kbd" style="--whites:${whites}">${whiteKeys}${blackKeys}</div>`;
}

/** Keep the screen awake while playing (Screen Wake Lock API, where supported). */
function keepScreenOn(): { release(): void } {
  type Sentinel = { release(): Promise<void> };
  const api = (navigator as Navigator & { wakeLock?: { request(type: 'screen'): Promise<Sentinel> } }).wakeLock;
  if (!api) return { release() {} };

  let sentinel: Sentinel | null = null;
  let active = true;
  const request = () => {
    if (!active || document.visibilityState !== 'visible') return;
    api.request('screen').then((s) => { sentinel = s; }).catch(() => {});
  };
  const onVisible = () => request();
  document.addEventListener('visibilitychange', onVisible);
  request();
  return {
    release() {
      active = false;
      document.removeEventListener('visibilitychange', onVisible);
      sentinel?.release().catch(() => {});
    },
  };
}
