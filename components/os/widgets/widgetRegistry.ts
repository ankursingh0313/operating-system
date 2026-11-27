import type { ComponentType } from 'react'
import ClockWidget from '@/components/os/widgets/ClockWidget'
import MusicWidget from '@/components/os/widgets/MusicWidget'
import GitWidget from '@/components/os/widgets/GitWidget'
import NotesWidget from '@/components/os/widgets/NotesWidget'
import TodoWidget from './TodoWidget'
import GitHubLanguageRadar from './GitHubLanguageRadar'
import SystemInfo from './SystemInfo'

export interface WidgetPosition {
  x: number
  y: number
  xRatio: number
  yRatio: number
}

export interface WidgetRegistryItem {
  id: string
  name: string
  label: string
  previewTitle: string
  previewSubtitle: string
  defaultOpen: boolean
  defaultPos: WidgetPosition
  component: ComponentType
}

const FALLBACK_WIDGET_ITEM: WidgetRegistryItem = {
  id: 'unknown',
  name: 'Unknown Widget',
  label: 'Unknown',
  previewTitle: 'Desktop Widget',
  previewSubtitle: 'Module',
  defaultOpen: false,
  defaultPos: { x: 1000, y: 200, xRatio: 0.75, yRatio: 0.3 },
  component: ClockWidget,
}

export const WIDGET_REGISTRY: Record<string, WidgetRegistryItem> = {
  clock: {
    id: 'clock',
    name: 'Digital Clock & Date',
    label: 'Clock & Date',
    previewTitle: 'Live Time & Date',
    previewSubtitle: 'Clock Widget',
    defaultOpen: true,
    defaultPos: { x: 1000, y: 40, xRatio: 0.75, yRatio: 0.05 },
    component: ClockWidget,
  },
  music: {
    id: 'music',
    name: 'Audio Player',
    label: 'Audio Player',
    previewTitle: 'Audio Player',
    previewSubtitle: 'Desktop Media',
    defaultOpen: true,
    defaultPos: { x: 1000, y: 190, xRatio: 0.75, yRatio: 0.25 },
    component: MusicWidget,
  },
  git: {
    id: 'git',
    name: 'GitHub Contributions',
    label: 'GitHub Activity',
    previewTitle: 'Contribution Heatmap',
    previewSubtitle: 'GitHub Widget',
    defaultOpen: true,
    defaultPos: { x: 1000, y: 380, xRatio: 0.75, yRatio: 0.5 },
    component: GitWidget,
  },
  gitLanguageRadar: {
    id: 'gitLanguageRadar',
    name: 'GitHub Language Radar',
    label: 'GitHub Language Radar',
    previewTitle: 'GitHub Language Radar',
    previewSubtitle: 'GitHub Widget',
    defaultOpen: true,
    defaultPos: { x: 1000, y: 380, xRatio: 0.5, yRatio: 0.5 },
    component: GitHubLanguageRadar,
  },
  notes: {
    id: 'notes',
    name: 'Notes',
    label: 'Notes',
    previewTitle: 'Quick Local Notes',
    previewSubtitle: 'Scratchpad',
    defaultOpen: false,
    defaultPos: { x: 1000, y: 570, xRatio: 0.75, yRatio: 0.75 },
    component: NotesWidget,
  },
  todo: {
    id: 'todo',
    name: 'To-Do List',
    label: 'To-Do List',
    previewTitle: 'Task Checklist',
    previewSubtitle: 'To-Do Widget',
    defaultOpen: false,
    defaultPos: { x: 1000, y: 760, xRatio: 0.75, yRatio: 0.85 },
    component: TodoWidget,
  },
  system: {
    id: 'system',
    name: 'System Information',
    label: 'System Information',
    previewTitle: 'System Info',
    previewSubtitle: 'System Widget',
    defaultOpen: false,
    defaultPos: { x: 1000, y: 760, xRatio: 0.75, yRatio: 0.85 },
    component: SystemInfo,
  },
}

export const WIDGET_LIST: WidgetRegistryItem[] = Object.values(WIDGET_REGISTRY)

export function getWidgetRegistryItem(id: string): WidgetRegistryItem {
  if (Object.prototype.hasOwnProperty.call(WIDGET_REGISTRY, id)) {
    return WIDGET_REGISTRY[id]
  }
  return {
    ...FALLBACK_WIDGET_ITEM,
    id,
    name: id.toUpperCase(),
    label: id.toUpperCase(),
    previewTitle: id.toUpperCase(),
  }
}