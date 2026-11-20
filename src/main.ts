import { LIBRARY, findSong } from './library.js';
import { loadSettings } from './settings.js';
import { mountHome } from './views/home.js';
import { mountPlay } from './views/play.js';

const root = document.getElementById('app')!;
const settings = loadSettings();
let cleanup: () => void = () => {};

/** Hash routes: `#/` (song list) and `#/tocar/<id>` (play a song). */
function route(): void {
  cleanup();
  const match = /^#\/tocar\/(.+)$/.exec(location.hash);
  const song = match ? findSong(decodeURIComponent(match[1]!)) : undefined;

  if (song) {
    document.title = `${song.title} · Piano School`;
    cleanup = mountPlay(root, song, settings, { home: () => { location.hash = '#/'; } });
  } else {
    document.title = 'Piano School';
    cleanup = mountHome(root, LIBRARY, settings);
  }
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', route);
route();

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((err) => console.warn('Service worker não registado:', err));
  });
}
