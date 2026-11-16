// lib/features/themeSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AccentColor } from '../themes/colorPackages';

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

interface ThemeState {
  accent: AccentColor;
  mode: 'dark' | 'light';
  wallpaper: WallpaperType;
  hydrated: boolean;
}

const initialState: ThemeState = {
  accent: 'blue',
  mode: 'dark',
  wallpaper: 'squares',
  hydrated: false,
};

export const loadThemeState = () => {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem('os_theme_state');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load theme state', e);
  }
  return null;
};

const saveThemeState = (state: ThemeState) => {
  if (typeof window !== 'undefined') {
    const { hydrated, ...persisted } = state;
    localStorage.setItem('os_theme_state', JSON.stringify(persisted));
  }
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    hydrateTheme: (state, action: PayloadAction<Partial<ThemeState>>) => {
      return { ...state, ...action.payload, hydrated: true };
    },
    setAccent: (state, action: PayloadAction<AccentColor>) => {
      state.accent = action.payload;
      saveThemeState(state);
    },
    setMode: (state, action: PayloadAction<'dark' | 'light'>) => {
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