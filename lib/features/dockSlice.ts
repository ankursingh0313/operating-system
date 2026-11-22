import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface DockState {
  dockApps: string[]
  openApps: string[]       // Array of open app IDs (e.g. ['email', 'github'])
  minimizedApps: string[]  // Array of currently minimized app IDs
  maximizedApps: string[]  // Array of currently fullscreen/maximized app IDs
  focusedApp: string | null
  windowOrder: string[]    // Stacking order for zIndex calculation
}

const initialState: DockState = {
  dockApps: ['browser', 'explorer', 'settings', 'code', 'notes'],
  openApps: [],
  minimizedApps: [],
  maximizedApps: [],
  focusedApp: null,
  windowOrder: [],
}

export const dockSlice = createSlice({
  name: 'dock',
  initialState,
  reducers: {
    openApp: (state, action: PayloadAction<string>) => {
      const appId = action.payload

      // Clicking the All Apps button again toggles it closed
      if (appId === 'apps' && state.openApps.includes('apps')) {
        state.openApps = state.openApps.filter((id) => id !== 'apps')
        state.minimizedApps = state.minimizedApps.filter((id) => id !== 'apps')
        state.maximizedApps = state.maximizedApps.filter((id) => id !== 'apps')
        state.windowOrder = state.windowOrder.filter((id) => id !== 'apps')
        if (state.focusedApp === 'apps') {
          const remainingOpen = state.windowOrder.filter(
            (id) => state.openApps.includes(id) && !state.minimizedApps.includes(id)
          )
          state.focusedApp = remainingOpen[remainingOpen.length - 1] ?? null
        }
        return
      }

      if (!state.openApps.includes(appId)) {
        state.openApps.push(appId)
      }
      // Un-minimize if it was minimized
      state.minimizedApps = state.minimizedApps.filter((id) => id !== appId)

      // Bring to front
      state.focusedApp = appId
      state.windowOrder = state.windowOrder.filter((id) => id !== appId)
      state.windowOrder.push(appId)
    },
    closeApp: (state, action: PayloadAction<string>) => {
      const appId = action.payload
      state.openApps = state.openApps.filter((id) => id !== appId)
      state.minimizedApps = state.minimizedApps.filter((id) => id !== appId)
      state.maximizedApps = state.maximizedApps.filter((id) => id !== appId)
      state.windowOrder = state.windowOrder.filter((id) => id !== appId)

      if (state.focusedApp === appId) {
        const remainingOpen = state.windowOrder.filter(
          (id) => state.openApps.includes(id) && !state.minimizedApps.includes(id)
        )
        state.focusedApp = remainingOpen[remainingOpen.length - 1] ?? null
      }
    },
    minimizeApp: (state, action: PayloadAction<string>) => {
      const appId = action.payload
      if (!state.minimizedApps.includes(appId)) {
        state.minimizedApps.push(appId)
      }
      if (state.focusedApp === appId) {
        state.focusedApp =
          state.windowOrder
            .filter((id) => !state.minimizedApps.includes(id) && id !== appId)
            .slice(-1)[0] || null
      }
    },
    toggleMaximizeApp: (state, action: PayloadAction<string>) => {
      const appId = action.payload
      if (state.maximizedApps.includes(appId)) {
        state.maximizedApps = state.maximizedApps.filter((id) => id !== appId)
      } else {
        state.maximizedApps.push(appId)
      }
    },
    setAppMaximized: (
      state,
      action: PayloadAction<{ appId: string; maximized: boolean }>
    ) => {
      const { appId, maximized } = action.payload
      if (maximized) {
        if (!state.maximizedApps.includes(appId)) {
          state.maximizedApps.push(appId)
        }
      } else {
        state.maximizedApps = state.maximizedApps.filter((id) => id !== appId)
      }
    },
    focusApp: (state, action: PayloadAction<string>) => {
      const appId = action.payload
      state.focusedApp = appId
      state.minimizedApps = state.minimizedApps.filter((id) => id !== appId)
      state.windowOrder = state.windowOrder.filter((id) => id !== appId)
      state.windowOrder.push(appId)
    },
  },
})

export const {
  openApp,
  closeApp,
  minimizeApp,
  toggleMaximizeApp,
  setAppMaximized,
  focusApp,
} = dockSlice.actions

export default dockSlice.reducer