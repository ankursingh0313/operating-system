// lib/features/widgetsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface WidgetConfig {
  id: string;
  x: number;
  y: number;
  isOpen: boolean;
  zIndex: number;
}

interface WidgetsState {
  widgets: Record<string, WidgetConfig>;
  highestZIndex: number;
}

const initialState: WidgetsState = {
  widgets: {
    clock: { id: 'clock', x: 1000, y: 40, isOpen: true, zIndex: 1 },
    music: { id: 'music', x: 1000, y: 190, isOpen: true, zIndex: 2 },
    git: { id: 'git', x: 1000, y: 380, isOpen: true, zIndex: 3 },
  },
  highestZIndex: 3,
};

const saveState = (state: WidgetsState) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('os_widgets_state', JSON.stringify(state));
  }
};

export const widgetsSlice = createSlice({
  name: 'widgets',
  initialState,
  reducers: {
    hydrateWidgets: (state, action: PayloadAction<WidgetsState>) => {
      return action.payload;
    },
    moveWidget: (state, action: PayloadAction<{ id: string; x: number; y: number }>) => {
      const { id, x, y } = action.payload;
      if (state.widgets[id]) {
        state.widgets[id].x = x;
        state.widgets[id].y = y;
        saveState(state);
      }
    },
    focusWidget: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.widgets[id]) {
        state.highestZIndex += 1;
        state.widgets[id].zIndex = state.highestZIndex;
        saveState(state);
      }
    },
    toggleWidget: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.widgets[id]) {
        state.widgets[id].isOpen = !state.widgets[id].isOpen;
        saveState(state);
      }
    },
  },
});

export const { hydrateWidgets, moveWidget, focusWidget, toggleWidget } = widgetsSlice.actions;
export default widgetsSlice.reducer;