/**
 * 蕾姆精心设计的主题配置
 * 集中管理所有主题相关的常量和配置
 */

// ========================================
// 主题模式类型
// ========================================
export type ThemeMode = 'light' | 'dark' | 'system'

// ========================================
// 主题色配置
// ========================================
export interface AccentColor {
  id: string
  name: string
  value: string
  hover: string
  hoverDark: string
  light: string
  shadow: string
}

export const ACCENT_COLORS: Record<string, AccentColor> = {
  'rem-blue': {
    id: 'rem-blue',
    name: '蕾姆蓝',
    value: '#95C0EC',
    hover: '#7aaddd',
    hoverDark: '#b0d4f0',
    light: 'oklch(0.95 0.03 250)',
    shadow: 'rgba(149, 192, 236, 0.3)',
  },
  'violet': {
    id: 'violet',
    name: '紫罗兰',
    value: '#A78BFA',
    hover: '#8B5CF6',
    hoverDark: '#C4B5FD',
    light: 'oklch(0.95 0.05 300)',
    shadow: 'rgba(167, 139, 250, 0.3)',
  },
  'emerald': {
    id: 'emerald',
    name: '翡翠绿',
    value: '#34D399',
    hover: '#10B981',
    hoverDark: '#6EE7B7',
    light: 'oklch(0.95 0.05 150)',
    shadow: 'rgba(52, 211, 153, 0.3)',
  },
  'sakura': {
    id: 'sakura',
    name: '樱花粉',
    value: '#FB7185',
    hover: '#F43F5E',
    hoverDark: '#FDA4AF',
    light: 'oklch(0.95 0.05 20)',
    shadow: 'rgba(251, 113, 133, 0.3)',
  },
  'amber': {
    id: 'amber',
    name: '琥珀黄',
    value: '#FBBF24',
    hover: '#F59E0B',
    hoverDark: '#FCD34D',
    light: 'oklch(0.95 0.05 85)',
    shadow: 'rgba(251, 191, 36, 0.3)',
  },
}

export const ACCENT_COLOR_ARRAY: AccentColor[] = Object.values(ACCENT_COLORS)

// ========================================
// 主题模式配置
// ========================================
export interface ThemeModeOption {
  id: ThemeMode
  name: string
  icon: 'sun' | 'moon' | 'monitor'
  description: string
}

export const THEME_MODES: ThemeModeOption[] = [
  { id: 'light', name: '浅色', icon: 'sun', description: '明亮清爽的界面' },
  { id: 'dark', name: '深色', icon: 'moon', description: '护眼深色模式' },
  { id: 'system', name: '跟随系统', icon: 'monitor', description: '自动切换主题' },
]

// ========================================
// 字体大小配置
// ========================================
export const FONT_SIZE_MIN = 12
export const FONT_SIZE_MAX = 20
export const FONT_SIZE_DEFAULT = 14

// ========================================
// 默认设置
// ========================================
export const DEFAULT_THEME_SETTINGS = {
  mode: 'system' as ThemeMode,
  accentColor: 'rem-blue',
  fontSize: FONT_SIZE_DEFAULT,
  animations: true,
  highRefresh: false,
}

// ========================================
// LocalStorage 键名
// ========================================
export const THEME_STORAGE_KEY = 'onir-theme-storage'
