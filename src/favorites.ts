/** Favourite songs and the "only favourites" filter, kept on this device. */

const FAVORITES_KEY = 'piano-school:favorites';
const FILTER_KEY = 'piano-school:only-favorites';

let favorites: Set<string> = load();

function load(): Set<string> {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    const list = raw ? (JSON.parse(raw) as unknown) : [];
    return new Set(Array.isArray(list) ? list.filter((x): x is string => typeof x === 'string') : []);
  } catch {
    return new Set();
  }
}

function store(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable: the choice lasts for this visit only.
  }
}

export function isFavorite(id: string): boolean {
  return favorites.has(id);
}

/** Toggle a song's favourite state; returns the new state. */
export function toggleFavorite(id: string): boolean {
  favorites = new Set(favorites);
  if (favorites.has(id)) favorites.delete(id);
  else favorites.add(id);
  store(FAVORITES_KEY, [...favorites]);
  return favorites.has(id);
}

export function onlyFavorites(): boolean {
  try {
    return localStorage.getItem(FILTER_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setOnlyFavorites(value: boolean): void {
  store(FILTER_KEY, value);
}
