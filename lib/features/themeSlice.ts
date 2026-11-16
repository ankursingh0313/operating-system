import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AccentColor } from '../themes/colorPackages';

export type WallpaperType = 'squares' | 'gradient' | 'grid' | 'radar'| 'stars' | 'terrain' | 'geometric' | 'mesh' | 'ripple' | 'mosaic';

interface ThemeState {
  accent: AccentColor;
  mode: 'dark' | 'light';
  wallpaper: WallpaperType;
}

const initialState: ThemeState = {
  accent: 'blue',
  mode: 'dark',
  wallpaper: 'squares', // Default wallpaper
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setAccent: (state, action: PayloadAction<AccentColor>) => {
      state.accent = action.payload;
    },
    setMode: (state, action: PayloadAction<'dark' | 'light'>) => {
      state.mode = action.payload;
    },
    toggleMode: (state) => {
      state.mode = state.mode === 'dark' ? 'light' : 'dark';
    },
    setWallpaper: (state, action: PayloadAction<WallpaperType>) => {
      state.wallpaper = action.payload;
    },
  },
});

export const { setAccent, setMode, toggleMode, setWallpaper } = themeSlice.actions;
export default themeSlice.reducer;