export type AccentColor =
  | 'blue'
  | 'red'
  | 'green'
  | 'purple'
  | 'pink'
  | 'orange'
  | 'cyan'
  | 'indigo'
  | 'slate'
  | 'rose';

export type ThemeMode = 'dark' | 'light';

export interface SurfacePackage {
  mode: ThemeMode;
  // App / Workspace Surfaces
  appBg: string;
  cardBg: string;
  cardHoverBg: string;
  subtleBg: string;
  inputBg: string;
  // Window & Dock Surfaces
  windowBg: string;
  windowHeaderBg: string;
  dockBg: string;
  // Text & Borders
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderSubtle: string;
  // Raw CSS Values for inline styles / canvas
  rawBg: string;
  rawSurface: string;
  rawText: string;
  rawBorder: string;
}

export const SURFACE_PACKAGES: Record<ThemeMode, SurfacePackage> = {
  dark: {
    mode: 'dark',
    appBg: 'bg-[#090c12]',
    cardBg: 'bg-[#161b22]',
    cardHoverBg: 'hover:bg-[#1f242c]',
    subtleBg: 'bg-white/[0.04]',
    inputBg: 'bg-white/[0.06]',
    windowBg: 'bg-gray-900/90',
    windowHeaderBg: 'bg-white/[0.04]',
    dockBg: 'rgba(30, 30, 46, 0.75)',
    textPrimary: 'text-slate-100',
    textSecondary: 'text-slate-300',
    textMuted: 'text-slate-400',
    border: 'border-white/15',
    borderSubtle: 'border-white/[0.08]',
    rawBg: '#090c12',
    rawSurface: '#161b22',
    rawText: '#f1f5f9',
    rawBorder: 'rgba(255, 255, 255, 0.14)',
  },
  light: {
    mode: 'light',
    appBg: 'bg-slate-100',
    cardBg: 'bg-white',
    cardHoverBg: 'hover:bg-slate-50',
    subtleBg: 'bg-slate-900/[0.04]',
    inputBg: 'bg-slate-900/[0.06]',
    windowBg: 'bg-white/90',
    windowHeaderBg: 'bg-slate-100/90',
    dockBg: 'rgba(255, 255, 255, 0.78)',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-700',
    textMuted: 'text-slate-500',
    border: 'border-slate-300/80',
    borderSubtle: 'border-slate-200',
    rawBg: '#f1f5f9',
    rawSurface: '#ffffff',
    rawText: '#0f172a',
    rawBorder: 'rgba(15, 23, 42, 0.14)',
  },
};

export function getSurfacePackage(mode?: ThemeMode | null): SurfacePackage {
  return SURFACE_PACKAGES[mode === 'light' ? 'light' : 'dark'];
}

export interface ColorPackage {
  name: string;
  // UI Tailwind Classes
  primaryBg: string;
  primaryText: string;
  borderAccent: string;
  ringAccent: string;
  glow: string;
  gradient: string;
  // Raw CSS Values (for wallpapers, inline styles, or canvas)
  rawPrimary: string;
  rawSecondary: string;
  rawGlow: string;
  rgb: string; // Actual RGB representation (e.g. "rgb(239, 68, 68)")
}

export const COLOR_PACKAGES: Record<AccentColor, ColorPackage> = {
  blue: {
    name: 'Blue',
    primaryBg: 'bg-blue-600 hover:bg-blue-500',
    primaryText: 'text-blue-400',
    borderAccent: 'border-blue-500',
    ringAccent: 'ring-blue-500',
    glow: 'shadow-blue-500/20',
    gradient: 'from-blue-600 to-indigo-600',
    rawPrimary: 'rgba(0, 150, 255, 0.4)',
    rawSecondary: 'rgba(100, 200, 255, 1)',
    rawGlow: 'rgba(0, 150, 255, 0.8)',
    rgb: 'rgb(0, 150, 255)',
  },
  red: {
    name: 'Red',
    primaryBg: 'bg-red-600 hover:bg-red-500',
    primaryText: 'text-red-400',
    borderAccent: 'border-red-500',
    ringAccent: 'ring-red-500',
    glow: 'shadow-red-500/20',
    gradient: 'from-red-600 to-rose-600',
    rawPrimary: 'rgba(239, 68, 68, 0.4)',
    rawSecondary: 'rgba(252, 165, 165, 1)',
    rawGlow: 'rgba(239, 68, 68, 0.8)',
    rgb: 'rgb(239, 68, 68)',
  },
  green: {
    name: 'Green',
    primaryBg: 'bg-emerald-600 hover:bg-emerald-500',
    primaryText: 'text-emerald-400',
    borderAccent: 'border-emerald-500',
    ringAccent: 'ring-emerald-500',
    glow: 'shadow-emerald-500/20',
    gradient: 'from-emerald-600 to-teal-600',
    rawPrimary: 'rgba(16, 185, 129, 0.4)',
    rawSecondary: 'rgba(110, 231, 183, 1)',
    rawGlow: 'rgba(16, 185, 129, 0.8)',
    rgb: 'rgb(16, 185, 129)',
  },
  purple: {
    name: 'Purple',
    primaryBg: 'bg-purple-600 hover:bg-purple-500',
    primaryText: 'text-purple-400',
    borderAccent: 'border-purple-500',
    ringAccent: 'ring-purple-500',
    glow: 'shadow-purple-500/20',
    gradient: 'from-purple-600 to-violet-600',
    rawPrimary: 'rgba(147, 51, 235, 0.4)',
    rawSecondary: 'rgba(216, 180, 254, 1)',
    rawGlow: 'rgba(147, 51, 235, 0.8)',
    rgb: 'rgb(147, 51, 235)',
  },
  pink: {
    name: 'Pink',
    primaryBg: 'bg-pink-600 hover:bg-pink-500',
    primaryText: 'text-pink-400',
    borderAccent: 'border-pink-500',
    ringAccent: 'ring-pink-500',
    glow: 'shadow-pink-500/20',
    gradient: 'from-pink-600 to-rose-500',
    rawPrimary: 'rgba(236, 72, 153, 0.4)',
    rawSecondary: 'rgba(244, 114, 182, 1)',
    rawGlow: 'rgba(236, 72, 153, 0.8)',
    rgb: 'rgb(236, 72, 153)',
  },
  orange: {
    name: 'Orange',
    primaryBg: 'bg-orange-600 hover:bg-orange-500',
    primaryText: 'text-orange-400',
    borderAccent: 'border-orange-500',
    ringAccent: 'ring-orange-500',
    glow: 'shadow-orange-500/20',
    gradient: 'from-orange-600 to-amber-600',
    rawPrimary: 'rgba(249, 115, 22, 0.4)',
    rawSecondary: 'rgba(253, 186, 116, 1)',
    rawGlow: 'rgba(249, 115, 22, 0.8)',
    rgb: 'rgb(249, 115, 22)',
  },
  cyan: {
    name: 'Cyan',
    primaryBg: 'bg-cyan-600 hover:bg-cyan-500',
    primaryText: 'text-cyan-400',
    borderAccent: 'border-cyan-500',
    ringAccent: 'ring-cyan-500',
    glow: 'shadow-cyan-500/20',
    gradient: 'from-cyan-600 to-blue-500',
    rawPrimary: 'rgba(6, 182, 212, 0.4)',
    rawSecondary: 'rgba(103, 232, 249, 1)',
    rawGlow: 'rgba(6, 182, 212, 0.8)',
    rgb: 'rgb(6, 182, 212)',
  },
  indigo: {
    name: 'Indigo',
    primaryBg: 'bg-indigo-600 hover:bg-indigo-500',
    primaryText: 'text-indigo-400',
    borderAccent: 'border-indigo-500',
    ringAccent: 'ring-indigo-500',
    glow: 'shadow-indigo-500/20',
    gradient: 'from-indigo-600 to-slate-700',
    rawPrimary: 'rgba(99, 102, 241, 0.4)',
    rawSecondary: 'rgba(165, 180, 252, 1)',
    rawGlow: 'rgba(99, 102, 241, 0.8)',
    rgb: 'rgb(99, 102, 241)',
  },
  slate: {
    name: 'Slate (Monochrome)',
    primaryBg: 'bg-slate-700 hover:bg-slate-600',
    primaryText: 'text-slate-300',
    borderAccent: 'border-slate-500',
    ringAccent: 'ring-slate-500',
    glow: 'shadow-slate-500/20',
    gradient: 'from-slate-700 to-zinc-900',
    rawPrimary: 'rgba(100, 116, 139, 0.4)',
    rawSecondary: 'rgba(203, 213, 225, 1)',
    rawGlow: 'rgba(100, 116, 139, 0.8)',
    rgb: 'rgb(100, 116, 139)',
  },
  rose: {
    name: 'Rose',
    primaryBg: 'bg-rose-600 hover:bg-rose-500',
    primaryText: 'text-rose-400',
    borderAccent: 'border-rose-500',
    ringAccent: 'ring-rose-500',
    glow: 'shadow-rose-500/20',
    gradient: 'from-rose-600 to-pink-600',
    rawPrimary: 'rgba(244, 63, 94, 0.4)',
    rawSecondary: 'rgba(253, 164, 175, 1)',
    rawGlow: 'rgba(244, 63, 94, 0.8)',
    rgb: 'rgb(244, 63, 94)',
  },
};