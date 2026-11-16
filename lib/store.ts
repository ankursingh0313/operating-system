import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './features/themeSlice';
import contextMenuReducer from './features/contextMenuSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      theme: themeReducer,
      contextMenu: contextMenuReducer,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];