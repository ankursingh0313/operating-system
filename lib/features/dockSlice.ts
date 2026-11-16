import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface DockState {
  dockApps: string[]       // Apps pinned/present in the dock (e.g., ['terminal', 'browser', 'settings'])
  openApps: string[]       // Apps currently running/open
  focusedApp: string | null // The app currently in focus
}

const initialState: DockState = {
  dockApps: ['terminal', 'browser', 'explorer', 'settings', 'code', 'notes'],
  openApps: ['terminal'],
  focusedApp: 'terminal',
}

export const dockSlice = createSlice({
  name: 'dock',
  initialState,
  reducers: {
    openApp: (state, action: PayloadAction<string>) => {
      const appId = action.payload
      if (!state.openApps.includes(appId)) {
        state.openApps.push(appId)
      }
      state.focusedApp = appId
    },
    closeApp: (state, action: PayloadAction<string>) => {
      const appId = action.payload
      state.openApps = state.openApps.filter((id) => id !== appId)
      if (state.focusedApp === appId) {
        state.focusedApp = state.openApps[state.openApps.length - 1] || null
      }
    },
    focusApp: (state, action: PayloadAction<string>) => {
      state.focusedApp = action.payload
    },
    pinToDock: (state, action: PayloadAction<string>) => {
      if (!state.dockApps.includes(action.payload)) {
        state.dockApps.push(action.payload)
      }
    },
    removeFromDock: (state, action: PayloadAction<string>) => {
      state.dockApps = state.dockApps.filter((id) => id !== action.payload)
    },
  },
})

export const { openApp, closeApp, focusApp, pinToDock, removeFromDock } = dockSlice.actions
export default dockSlice.reducer