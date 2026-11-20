// lib/store.ts
import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './features/themeSlice';
import contextMenuReducer from './features/contextMenuSlice';
import dockReducer from './features/dockSlice';
import widgetsReducer from './features/widgetsSlice';
import githubReducer from './features/githubSlice';
import appsReducer from './features/appsSlice'

export const makeStore = () => {
  return configureStore({
    reducer: {
      theme: themeReducer,
      contextMenu: contextMenuReducer,
      dock: dockReducer,
      widgets: widgetsReducer,
      github: githubReducer,
      apps: appsReducer,
    },
    // Completely disable devtools and middleware checks during SSR to stop Math.random() triggers
    devTools: process.env.NODE_ENV !== 'production' && typeof window !== 'undefined',
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];