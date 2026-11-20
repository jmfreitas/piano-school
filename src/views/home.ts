import { NOTE_INFO } from '../notes.js';
import { type Song, letterLabel, notesOf } from '../song.js';
import { type Settings, saveSettings } from '../settings.js';
import { isFavorite, onlyFavorites, setOnlyFavorites, toggleFavorite } from '../favorites.js';
import { ICONS, esc } from '../dom.js';

const OPTIONS: ReadonlyArray<{ key: keyof Settings; label: string; hint: string }> = [
  { key: 'showLetters', label: 'Letras das teclas', hint: 'Mostra C, D, E… Desliga para ver só Dó, Ré, Mi…' },
  { key: 'showColors', label: 'Cores das notas', hint: 'Cada nota tem a sua cor.' },
  { key: 'showLyrics', label: 'Letra da música', hint: 'Mostra as sílabas por baixo das notas.' },
];

/** Song list (with favourites filter) + options. Returns a cleanup function. */
export function mountHome(root: HTMLElement, songs: Song[], settings: Settings): () => void {
  let filterOn = onlyFavorites();

  root.innerHTML = `
  <div class="home">
    <header class="home-bar">
      <h1><img class="logo" src="icons/icon.svg" alt="" width="48" height="48">Piano School</h1>
      <button class="icon-btn" data-action="settings" aria-label="Opções">${ICONS.settings}</button>
    </header>
    <div class="filter" role="group" aria-label="Que músicas mostrar">
      <button class="chip" data-action="filter-all"><span>Todas</span></button>
      <button class="chip" data-action="filter-fav">${ICONS.star}<span>Favoritas</span></button>
    </div>
    <div class="song-list"></div>
  </div>
  <dialog class="settings" aria-labelledby="settings-title">
    <form method="dialog">
      <h2 id="settings-title">Opções</h2>
      ${OPTIONS.map((o) => `
        <label class="switch">
          <input type="checkbox" role="switch" name="${o.key}" ${settings[o.key] ? 'checked' : ''}>
          <span class="switch-track" aria-hidden="true"></span>
          <span class="switch-text"><strong>${o.label}</strong><small>${o.hint}</small></span>
        </label>`).join('')}
      <button class="btn-primary" value="close">Feito</button>
    </form>
  </dialog>`;

  const dialog = root.querySelector('dialog')!;
  const list = root.querySelector<HTMLElement>('.song-list')!;

  function renderList(): void {
    root.querySelector('[data-action="filter-all"]')!.setAttribute('aria-pressed', String(!filterOn));
    root.querySelector('[data-action="filter-fav"]')!.setAttribute('aria-pressed', String(filterOn));
    const shown = filterOn ? songs.filter((s) => isFavorite(s.id)) : songs;
    list.innerHTML = shown.length
      ? `<ul class="song-grid">${shown.map(songCard).join('')}</ul>`
      : `<div class="empty">
           <p><strong>Ainda não tens músicas favoritas.</strong></p>
           <p>Toca na estrela ${ICONS.starOutline} de uma música para a juntares aqui.</p>
           <button class="btn-secondary" data-action="filter-all">Ver todas as músicas</button>
         </div>`;
  }

  const onClick = (event: MouseEvent) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>('[data-action]');
    switch (target?.dataset.action) {
      case 'settings':
        dialog.showModal();
        break;
      case 'filter-all':
      case 'filter-fav':
        filterOn = target.dataset.action === 'filter-fav';
        setOnlyFavorites(filterOn);
        renderList();
        break;
      case 'fav': {
        const id = target.dataset.id!;
        const on = toggleFavorite(id);
        if (filterOn && !on) {
          renderList();
        } else {
          target.outerHTML = favButton(id, on);
          list.querySelector<HTMLElement>(`[data-action="fav"][data-id="${CSS.escape(id)}"]`)?.focus();
        }
        break;
      }
    }
  };
  const onChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.type !== 'checkbox') return;
    settings[input.name as keyof Settings] = input.checked;
    saveSettings(settings);
  };

  renderList();
  root.addEventListener('click', onClick);
  dialog.addEventListener('change', onChange);
  return () => {
    root.removeEventListener('click', onClick);
    dialog.removeEventListener('change', onChange);
  };
}

export function favButton(id: string, on: boolean, extraClass = ''): string {
  return `<button class="fav-btn${on ? ' on' : ''}${extraClass ? ' ' + extraClass : ''}" data-action="fav" data-id="${esc(id)}"
    aria-pressed="${on}" aria-label="Favorita">${on ? ICONS.star : ICONS.starOutline}</button>`;
}

function songCard(song: Song): string {
  const preview = notesOf(song).slice(0, 6);
  const parts = song.parts.length;
  return `
    <li class="song-item">
      <a class="song-card" href="#/tocar/${encodeURIComponent(song.id)}">
        <span class="song-name">${esc(song.title)}</span>
        <span class="song-strip" aria-hidden="true">
          ${preview.map((n) => `<span style="--bg:${NOTE_INFO[n.letter].bg};--nink:${NOTE_INFO[n.letter].ink}">${letterLabel(n)}</span>`).join('')}
        </span>
        <span class="song-meta">${parts} ${parts === 1 ? 'parte' : 'partes'}${song.author ? ' · ' + esc(song.author) : ''}</span>
      </a>
      ${favButton(song.id, isFavorite(song.id))}
    </li>`;
}
