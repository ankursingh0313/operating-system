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

// Safely load initial state from localStorage with robust fallbacks
const getInitialState = (): WidgetsState => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('os_widgets_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.widgets) {
          return parsed;
        }
      } catch (e) {
        // Fallback if JSON parsing fails
      }
    }
  }

  return {
    widgets: {
      clock: { id: 'clock', x: 1000, y: 40, isOpen: true, zIndex: 1 },
      music: { id: 'music', x: 1000, y: 190, isOpen: true, zIndex: 2 },
      git: { id: 'git', x: 1000, y: 380, isOpen: true, zIndex: 3 },
    },
    highestZIndex: 3,
  };
};

const saveState = (state: WidgetsState) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('os_widgets_state', JSON.stringify(state));
  }
};

export const widgetsSlice = createSlice({
  name: 'widgets',
  initialState: getInitialState(),
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
        // Automatically bring to front when opened
        if (state.widgets[id].isOpen) {
          state.highestZIndex += 1;
          state.widgets[id].zIndex = state.highestZIndex;
        }
        saveState(state);
      } else {
        // If a widget ID doesn't exist yet, register it dynamically when toggled on
        state.highestZIndex += 1;
        state.widgets[id] = {
          id,
          x: 1000,
          y: 200 + Object.keys(state.widgets).length * 60,
          isOpen: true,
          zIndex: state.highestZIndex,
        };
        saveState(state);
      }
    },
  },
});

export const { hydrateWidgets, moveWidget, focusWidget, toggleWidget } = widgetsSlice.actions;
export default widgetsSlice.reducer;