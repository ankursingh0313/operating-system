import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ContextMenuItem {
  id: string;
  label: string;
  shortcut?: string;
  danger?: boolean;
  dividerAbove?: boolean;
}

interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  items: ContextMenuItem[];
}

const initialState: ContextMenuState = {
  isOpen: false,
  x: 0,
  y: 0,
  items: [],
};

// Module-level callback map so functions don't go into Redux state
const actionHandlers = new Map<string, () => void>();

export const registerMenuActions = (
  handlers: Record<string, () => void>
) => {
  actionHandlers.clear();
  Object.entries(handlers).forEach(([id, fn]) => actionHandlers.set(id, fn));
};

export const triggerMenuAction = (id: string) => {
  const fn = actionHandlers.get(id);
  if (fn) fn();
};

export const contextMenuSlice = createSlice({
  name: 'contextMenu',
  initialState,
  reducers: {
    openContextMenu: (
      state,
      action: PayloadAction<{ x: number; y: number; items: ContextMenuItem[] }>
    ) => {
      // If no options are passed, do not display anything
      if (!action.payload.items || action.payload.items.length === 0) {
        state.isOpen = false;
        state.items = [];
        return;
      }
      state.isOpen = true;
      state.x = action.payload.x;
      state.y = action.payload.y;
      state.items = action.payload.items;
    },
    closeContextMenu: (state) => {
      state.isOpen = false;
      state.items = [];
    },
  },
});

export const { openContextMenu, closeContextMenu } = contextMenuSlice.actions;
export default contextMenuSlice.reducer;