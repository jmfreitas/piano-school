export interface Settings {
  /** Show key letters (C, D, E…). Off: only the note names (Dó, Ré…). */
  showLetters: boolean;
  /** Colour each note. Off: neutral black-on-white cards. */
  showColors: boolean;
  /** Show the song's syllables under the notes. */
  showLyrics: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  showLetters: true,
  showColors: true,
  showLyrics: true,
};

const STORAGE_KEY = 'piano-school:settings';

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      showLetters: parsed.showLetters ?? DEFAULT_SETTINGS.showLetters,
      showColors: parsed.showColors ?? DEFAULT_SETTINGS.showColors,
      showLyrics: parsed.showLyrics ?? DEFAULT_SETTINGS.showLyrics,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Storage can be unavailable (private mode, quota); settings then last for this visit only.
  }
}
