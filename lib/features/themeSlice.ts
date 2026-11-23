import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AccentColor, COLOR_PACKAGES, ThemeMode } from '../themes/colorPackages';

export type WallpaperType =
  | 'squares'
  | 'gradient'
  | 'grid'
  | 'radar'
  | 'stars'
  | 'terrain'
  | 'geometric'
  | 'mesh'
  | 'ripple'
  | 'mosaic';

const VALID_WALLPAPERS: WallpaperType[] = [
  'squares',
  'gradient',
  'grid',
  'radar',
  'stars',
  'terrain',
  'geometric',
  'mesh',
  'ripple',
  'mosaic',
];

interface ThemeState {
  accent: AccentColor;
  mode: ThemeMode;
  wallpaper: WallpaperType;
  hydrated: boolean;
}

const initialState: ThemeState = {
  accent: 'blue',
  mode: 'dark',
  wallpaper: 'squares',
  hydrated: false,
};

export const loadThemeState = (): Partial<ThemeState> | null => {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem('os_theme_state');
    if (!saved) return null;

    const parsed = JSON.parse(saved);
    if (!parsed || typeof parsed !== 'object') return null;

    const result: Partial<ThemeState> = {};

    if (typeof parsed.accent === 'string' && parsed.accent in COLOR_PACKAGES) {
      result.accent = parsed.accent as AccentColor;
    }
    if (parsed.mode === 'dark' || parsed.mode === 'light') {
      result.mode = parsed.mode;
    }
    if (
      typeof parsed.wallpaper === 'string' &&
      VALID_WALLPAPERS.includes(parsed.wallpaper as WallpaperType)
    ) {
      result.wallpaper = parsed.wallpaper as WallpaperType;
    }

    return result;
  } catch (e) {
    console.error('Failed to load theme state', e);
    return null;
  }
};

const saveThemeState = (state: ThemeState) => {
  if (typeof window !== 'undefined') {
    const { hydrated: _hydrated, ...persisted } = state;
    localStorage.setItem('os_theme_state', JSON.stringify(persisted));
  }
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    hydrateTheme: (state, action: PayloadAction<Partial<ThemeState>>) => {
      const { hydrated: _ignored, ...incoming } = action.payload;
      return { ...state, ...incoming, hydrated: true };
    },
    setAccent: (state, action: PayloadAction<AccentColor>) => {
      state.accent = action.payload;
      saveThemeState(state);
    },
    setMode: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload;
      saveThemeState(state);
    },
    toggleMode: (state) => {
      state.mode = state.mode === 'dark' ? 'light' : 'dark';
      saveThemeState(state);
    },
    setWallpaper: (state, action: PayloadAction<WallpaperType>) => {
      state.wallpaper = action.payload;
      saveThemeState(state);
    },
  },
});

export const { hydrateTheme, setAccent, setMode, toggleMode, setWallpaper } = themeSlice.actions;
export default themeSlice.reducer;