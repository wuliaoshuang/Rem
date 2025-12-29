/**
 * 蕾姆精心设计的主题状态管理 Store
 * 使用 Zustand + persist 中间件实现持久化
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { ThemeMode } from '../config/theme'

// ========================================
// 类型定义
// ========================================
export interface ThemeSettings {
  // 主题模式
  mode: ThemeMode

  // 主题色 ID
  accentColor: string

  // 字体大小 (12-20px)
  fontSize: number

  // 动画效果开关
  animations: boolean

  // 高刷新率模式
  highRefresh: boolean
}

interface ThemeState extends ThemeSettings {
  // 当前实际应用的主题（深色/浅色，system 模式下会被解析）
  resolvedTheme: 'light' | 'dark'

  // ========== Actions ==========

  // 设置主题模式
  setThemeMode: (mode: ThemeMode) => void

  // 设置主题色
  setAccentColor: (colorId: string) => void

  // 设置字体大小
  setFontSize: (size: number) => void

  // 切换动画效果
  toggleAnimations: () => void
  setAnimations: (enabled: boolean) => void

  // 切换高刷新率模式
  toggleHighRefresh: () => void
  setHighRefresh: (enabled: boolean) => void

  // 重置所有设置
  resetSettings: () => void

  // 初始化主题（检测系统主题）
  initTheme: () => void
}

// ========================================
// 辅助函数
// ========================================

/**
 * 检测系统主题偏好
 */
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light'
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * 解析实际应用的主题（处理 system 模式）
 */
const resolveTheme = (mode: ThemeMode): 'light' | 'dark' => {
  if (mode === 'system') {
    return getSystemTheme()
  }
  return mode
}

// ========================================
// DOM 应用函数
// ========================================

interface DOMThemeApplyOptions {
  mode: ThemeMode
  accentColor: string
  fontSize: number
  animations: boolean
  highRefresh: boolean
}

/**
 * 将主题设置应用到 DOM
 * 这是核心函数，通过修改 data 属性来触发 Tailwind CSS 变体
 */
export const applyThemeToDOM = (
  mode: ThemeMode,
  accentColor: string,
  fontSize: number,
  animations: boolean,
  highRefresh: boolean
) => {
  if (typeof document === 'undefined') return

  const root = document.documentElement

  // 1. 应用主题模式（深色/浅色）
  const resolvedTheme = resolveTheme(mode)

  if (resolvedTheme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }

  // 2. 应用主题色
  root.setAttribute('data-theme-color', accentColor)

  // 3. 应用字体大小
  root.setAttribute('data-font-size', fontSize.toString())

  // 4. 应用动画设置
  root.setAttribute('data-animations', animations.toString())

  // 5. 应用高刷新率模式
  root.setAttribute('data-high-refresh', highRefresh.toString())
}

// ========================================
// Store 创建
// ========================================
export const useThemeStore = create<ThemeState>()(
  devtools(
    persist(
      (set, get) => ({
        // ========== Initial State ==========
        mode: 'system',
        accentColor: 'rem-blue',
        fontSize: 14,
        animations: true,
        highRefresh: false,
        resolvedTheme: 'light',

        // ========== Actions ==========

        setThemeMode: (mode) => {
          set({ mode })
          // 立即更新 resolvedTheme
          const resolved = resolveTheme(mode)
          set({ resolvedTheme: resolved })
          applyThemeToDOM(get().mode, get().accentColor, get().fontSize, get().animations, get().highRefresh)
        },

        setAccentColor: (colorId) => {
          set({ accentColor: colorId })
          applyThemeToDOM(get().mode, colorId, get().fontSize, get().animations, get().highRefresh)
        },

        setFontSize: (size) => {
          // 限制范围
          const clampedSize = Math.max(12, Math.min(20, size))
          set({ fontSize: clampedSize })
          applyThemeToDOM(get().mode, get().accentColor, clampedSize, get().animations, get().highRefresh)
        },

        toggleAnimations: () => {
          const newState = !get().animations
          set({ animations: newState })
          applyThemeToDOM(get().mode, get().accentColor, get().fontSize, newState, get().highRefresh)
        },

        setAnimations: (enabled) => {
          set({ animations: enabled })
          applyThemeToDOM(get().mode, get().accentColor, get().fontSize, enabled, get().highRefresh)
        },

        toggleHighRefresh: () => {
          const newState = !get().highRefresh
          set({ highRefresh: newState })
          applyThemeToDOM(get().mode, get().accentColor, get().fontSize, get().animations, newState)
        },

        setHighRefresh: (enabled) => {
          set({ highRefresh: enabled })
          applyThemeToDOM(get().mode, get().accentColor, get().fontSize, get().animations, enabled)
        },

        resetSettings: () => {
          const defaults = {
            mode: 'system' as ThemeMode,
            accentColor: 'rem-blue',
            fontSize: 14,
            animations: true,
            highRefresh: false,
          }
          set(defaults)
          set({ resolvedTheme: resolveTheme('system') })
          applyThemeToDOM(defaults.mode, defaults.accentColor, defaults.fontSize, defaults.animations, defaults.highRefresh)
        },

        initTheme: () => {
          const state = get()
          const resolved = resolveTheme(state.mode)
          set({ resolvedTheme: resolved })
          applyThemeToDOM(state.mode, state.accentColor, state.fontSize, state.animations, state.highRefresh)
        },
      }),
      {
        name: 'onir-theme-storage',
        // 持久化所有设置
        partialize: (state) => ({
          mode: state.mode,
          accentColor: state.accentColor,
          fontSize: state.fontSize,
          animations: state.animations,
          highRefresh: state.highRefresh,
        }),
      }
    ),
    { name: 'ThemeStore' }
  )
)

// ========================================
// Selectors
// ========================================
export const selectThemeMode = (state: ThemeState) => state.mode
export const selectAccentColor = (state: ThemeState) => state.accentColor
export const selectFontSize = (state: ThemeState) => state.fontSize
export const selectAnimations = (state: ThemeState) => state.animations
export const selectHighRefresh = (state: ThemeState) => state.highRefresh
export const selectResolvedTheme = (state: ThemeState) => state.resolvedTheme
