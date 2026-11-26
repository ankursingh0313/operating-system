import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface WidgetConfig {
  id: string;
  x: number;
  y: number;
  xRatio?: number;
  yRatio?: number;
  isOpen: boolean;
  zIndex: number;
}

interface WidgetsState {
  widgets: Record<string, WidgetConfig>;
  highestZIndex: number;
}

const DEFAULT_WIDGETS: Record<string, WidgetConfig> = {
  clock: { id: 'clock', x: 1000, y: 40, xRatio: 0.75, yRatio: 0.05, isOpen: true, zIndex: 1 },
  music: { id: 'music', x: 1000, y: 190, xRatio: 0.75, yRatio: 0.25, isOpen: true, zIndex: 2 },
  git: { id: 'git', x: 1000, y: 380, xRatio: 0.75, yRatio: 0.50, isOpen: true, zIndex: 3 },
  gitLanguageRadar: { id: 'gitLanguageRadar', x: 1000, y: 570, xRatio: 0.75, yRatio: 0.75, isOpen: true, zIndex: 4 },
  todo: { id: 'todo', x: 1000, y: 760, xRatio: 0.75, yRatio: 0.85, isOpen: true, zIndex: 5 },
};

// Re-indexes zIndex to 1..N with `bringToFrontId` placed at the top (N)
function applyStackOrder(
  widgets: Record<string, WidgetConfig>,
  bringToFrontId?: string
): number {
  const orderedIds = Object.values(widgets)
    .sort((a, b) => a.zIndex - b.zIndex)
    .map((w) => w.id);

  if (bringToFrontId && widgets[bringToFrontId]) {
    const filtered = orderedIds.filter((id) => id !== bringToFrontId);
    filtered.push(bringToFrontId);
    filtered.forEach((id, idx) => {
      widgets[id].zIndex = idx + 1;
    });
    return filtered.length;
  }

  orderedIds.forEach((id, idx) => {
    widgets[id].zIndex = idx + 1;
  });

  return orderedIds.length;
}

// Safely load initial state from localStorage with robust fallbacks
const getInitialState = (): WidgetsState => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('os_widgets_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.widgets) {
          const count = applyStackOrder(parsed.widgets);
          return {
            widgets: parsed.widgets,
            highestZIndex: count,
          };
        }
      } catch {
        // Fallback if JSON parsing fails
      }
    }
  }

  return {
    widgets: DEFAULT_WIDGETS,
    highestZIndex: Object.keys(DEFAULT_WIDGETS).length,
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
      const nextWidgets = action.payload?.widgets ?? DEFAULT_WIDGETS;
      const count = applyStackOrder(nextWidgets);
      return {
        widgets: nextWidgets,
        highestZIndex: count,
      };
    },
    moveWidget: (
      state,
      action: PayloadAction<{ id: string; x: number; y: number; xRatio: number; yRatio: number }>
    ) => {
      const { id, x, y, xRatio, yRatio } = action.payload;
      if (state.widgets[id]) {
        state.widgets[id].x = x;
        state.widgets[id].y = y;
        state.widgets[id].xRatio = xRatio;
        state.widgets[id].yRatio = yRatio;
        saveState(state);
      }
    },
    focusWidget: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.widgets[id]) {
        state.highestZIndex = applyStackOrder(state.widgets, id);
        saveState(state);
      }
    },
    toggleWidget: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.widgets[id]) {
        state.widgets[id].isOpen = !state.widgets[id].isOpen;
        if (state.widgets[id].isOpen) {
          state.highestZIndex = applyStackOrder(state.widgets, id);
        } else {
          state.highestZIndex = applyStackOrder(state.widgets);
        }
        saveState(state);
      } else {
        const count = Object.keys(state.widgets).length;
        state.widgets[id] = {
          id,
          x: 1000,
          y: 200 + count * 60,
          xRatio: 0.75,
          yRatio: 0.3 + count * 0.15,
          isOpen: true,
          zIndex: count + 1,
        };
        state.highestZIndex = applyStackOrder(state.widgets, id);
        saveState(state);
      }
    },
  },
});

export const { hydrateWidgets, moveWidget, focusWidget, toggleWidget } = widgetsSlice.actions;
export default widgetsSlice.reducer;