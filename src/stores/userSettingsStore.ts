/**
 * 蕾姆精心设计的用户设置 Store
 * 管理用户的全局偏好设置
 *
 * 🎯 支持跨窗口通信：设置窗口保存后，聊天窗口立即生效
 */
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { UserSettings } from '../services/secureStorage'
import { secureStorage } from '../services/secureStorage'

// 默认系统提示词
const DEFAULT_SYSTEM_PROMPT = '你是蕾姆，一个友好的 AI 助手。'

// 🎯 蕾姆：创建跨窗口通信频道
const SETTINGS_CHANNEL = 'user-settings-channel'
let broadcastChannel: BroadcastChannel | null = null

// 安全地创建 BroadcastChannel（浏览器环境检查）
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(SETTINGS_CHANNEL)
  }
} catch (e) {
  console.warn('BroadcastChannel not available:', e)
}

interface UserSettingsState {
  // 状态
  systemPrompt: string

  // Actions
  setSystemPrompt: (prompt: string) => Promise<void>
  resetSystemPrompt: () => Promise<void>
  initialize: () => Promise<void>
  syncFromBroadcast: (data: { systemPrompt: string }) => void
}

/**
 * 用户设置 Store
 * 使用 Zustand + persist 实现状态管理和持久化
 * 🎯 支持跨窗口通信：设置变更时广播给其他窗口
 */
export const useUserSettingsStore = create<UserSettingsState>()(
  devtools(
    persist(
      (set, get) => ({
        // ========== Initial State ==========
        systemPrompt: DEFAULT_SYSTEM_PROMPT,

        // ========== Actions ==========

        /**
         * 设置系统提示词
         * 🎯 保存后广播给其他窗口
         */
        setSystemPrompt: async (prompt: string) => {
          const trimmedPrompt = prompt.trim()
          set({ systemPrompt: trimmedPrompt })

          // 保存到加密存储
          try {
            const currentSettings = await secureStorage.getUserSettings()
            await secureStorage.setUserSettings({
              ...currentSettings,
              systemPrompt: trimmedPrompt,
            })

            // 🎯 广播给其他窗口
            if (broadcastChannel) {
              broadcastChannel.postMessage({ type: 'systemPromptChanged', systemPrompt: trimmedPrompt })
            }
          } catch (error) {
            console.error('保存系统提示词失败:', error)
          }
        },

        /**
         * 重置系统提示词为默认值
         * 🎯 重置后广播给其他窗口
         */
        resetSystemPrompt: async () => {
          set({ systemPrompt: DEFAULT_SYSTEM_PROMPT })

          // 保存到加密存储
          try {
            const currentSettings = await secureStorage.getUserSettings()
            await secureStorage.setUserSettings({
              ...currentSettings,
              systemPrompt: DEFAULT_SYSTEM_PROMPT,
            })

            // 🎯 广播给其他窗口
            if (broadcastChannel) {
              broadcastChannel.postMessage({ type: 'systemPromptChanged', systemPrompt: DEFAULT_SYSTEM_PROMPT })
            }
          } catch (error) {
            console.error('重置系统提示词失败:', error)
          }
        },

        /**
         * 初始化：从加密存储加载用户设置
         * 🎯 同时监听其他窗口的变更
         */
        initialize: async () => {
          try {
            const savedSettings = await secureStorage.getUserSettings()
            if (savedSettings) {
              set({ systemPrompt: savedSettings.systemPrompt || DEFAULT_SYSTEM_PROMPT })
            }
          } catch (error) {
            console.error('加载用户设置失败:', error)
          }

          // 🎯 监听其他窗口的设置变更
          if (broadcastChannel) {
            broadcastChannel.onmessage = (event) => {
              const { type, systemPrompt: newPrompt } = event.data
              if (type === 'systemPromptChanged' && newPrompt !== undefined) {
                // 更新本地状态，但不要再次广播
                set({ systemPrompt: newPrompt })
              }
            }
          }
        },

        /**
         * 🎯 从广播同步设置（内部方法）
         */
        syncFromBroadcast: (data: { systemPrompt: string }) => {
          set({ systemPrompt: data.systemPrompt })
        },
      }),
      {
        name: 'user-settings-storage',
        // 持久化配置
        partialize: (state) => ({
          systemPrompt: state.systemPrompt,
        }),
      }
    ),
    { name: 'UserSettingsStore' }
  )
)

// 导出默认系统提示词
export const DEFAULT_PROMPT = DEFAULT_SYSTEM_PROMPT

// 🎯 导出清理函数（组件卸载时调用）
export const cleanupSettingsChannel = () => {
  if (broadcastChannel) {
    broadcastChannel.close()
    broadcastChannel = null
  }
}
