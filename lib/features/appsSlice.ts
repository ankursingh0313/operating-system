import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type AppIconKey =
  | 'widgets'
  | 'github'
  | 'email'
  | 'available'
  | 'profile'
  | 'apps'
  | 'appearance'
  | 'terminal'
  | 'calculator'
  | 'resume'
  | 'drives'

export interface OSAppItem {
  id: string
  title: string
  description: string
  category: 'System' | 'Developer' | 'Web' | 'Personal'
  iconKey: AppIconKey
  installed: boolean
  isSystemApp?: boolean
  defaultWidth: number
  defaultHeight: number
  routeOrView: string
  externalUrl?: string
}

interface AppsState {
  items: Record<string, OSAppItem>
  isAllAppsOpen: boolean
}

const initialState: AppsState = {
  isAllAppsOpen: false,
  items: {
    github: {
      id: 'github',
      title: 'GitHub Explorer',
      description: 'Profile stats, contribution heatmap, and repositories.',
      category: 'Developer',
      iconKey: 'github',
      installed: true,
      defaultWidth: 750,
      defaultHeight: 500,
      routeOrView: 'github',
    },
    available: {
      id: 'available',
      title: 'Available',
      description: 'Ephemeral text and peer-to-peer file sharing app.',
      category: 'Web',
      iconKey: 'available',
      installed: true,
      defaultWidth: 650,
      defaultHeight: 450,
      routeOrView: 'available',
      externalUrl: 'https://available-six.vercel.app/',
    },
    profile: {
      id: 'profile',
      title: 'User Profile',
      description: 'Developer identity, bio, and portfolio overview.',
      category: 'Personal',
      iconKey: 'profile',
      installed: true,
      defaultWidth: 600,
      defaultHeight: 400,
      routeOrView: 'profile',
    },
    email: {
      id: 'email',
      title: 'Email Client',
      description: 'Inbox and communication messages.',
      category: 'Personal',
      iconKey: 'email',
      installed: true,
      defaultWidth: 600,
      defaultHeight: 400,
      routeOrView: 'email',
    },
    appearance: {
      id: 'appearance',
      title: 'Appearance',
      description: 'Customize accent colors, themes, and desktop wallpapers.',
      category: 'System',
      iconKey: 'appearance',
      installed: true,
      isSystemApp: true,
      defaultWidth: 600,
      defaultHeight: 450,
      routeOrView: 'appearance',
    },
    widgets: {
      id: 'widgets',
      title: 'Widgets Manager',
      description: 'Toggle and manage floating desktop widgets.',
      category: 'System',
      iconKey: 'widgets',
      installed: true,
      isSystemApp: true,
      defaultWidth: 550,
      defaultHeight: 420,
      routeOrView: 'widgets',
    },
    terminal: {
      id: 'terminal',
      title: 'Terminal',
      description: 'Command-line interface for system administration.',
      category: 'Developer',
      iconKey: 'terminal',
      installed: true,
      isSystemApp: true,
      defaultWidth: 550,
      defaultHeight: 420,
      routeOrView: 'terminal',
    },
    calculator: {
      id: 'calculator',
      title: 'Calculator',
      description: 'Standard arithmetic and calculation history.',
      category: 'System',
      iconKey: 'calculator',
      installed: true,
      defaultWidth: 390,
      defaultHeight: 540,
      routeOrView: 'calculator',
    },
    resume: {
      id: 'resume',
      title: 'Resume Builder',
      description: 'Create and manage your professional resume.',
      category: 'Personal',
      iconKey: 'resume',
      installed: true,
      defaultWidth: 820,
      defaultHeight: 620,
      routeOrView: 'resume',
    },
    drives: {
      id: 'drives',
      title: 'Disk',
      description: 'File explorer, admin and user space to operate.',
      category: 'System',
      iconKey: 'drives',
      installed: true,
      defaultWidth: 820,
      defaultHeight: 620,
      routeOrView: 'drives',
    },
  },
}

export const appsSlice = createSlice({
  name: 'apps',
  initialState,
  reducers: {
    setAllAppsOpen: (state, action: PayloadAction<boolean>) => {
      state.isAllAppsOpen = action.payload
    },
    toggleAllApps: (state) => {
      state.isAllAppsOpen = !state.isAllAppsOpen
    },
    installApp: (state, action: PayloadAction<string>) => {
      const app = state.items[action.payload]
      if (app) app.installed = true
    },
    uninstallApp: (state, action: PayloadAction<string>) => {
      const app = state.items[action.payload]
      if (app && !app.isSystemApp) {
        app.installed = false
      }
    },
    upsertApp: (state, action: PayloadAction<OSAppItem>) => {
      state.items[action.payload.id] = action.payload
    },
  },
})

export const {
  setAllAppsOpen,
  toggleAllApps,
  installApp,
  uninstallApp,
  upsertApp,
} = appsSlice.actions

export default appsSlice.reducer