/**
 * 蕾姆精心设计的根路由布局
 * 根据路由路径动态选择布局方式：
 * - Chat 相关路由：独立布局（无 MainSidebar，使用内部 Sidebar）
 * - 其他路由：标准布局（带 MainSidebar）
 * ✨ 新增路由过渡动画，提供丝滑的页面切换体验
 */
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ThemeProvider } from '../contexts/ThemeContext'
import { useUIStore } from '../stores/uiStore'
import MainSidebar from '../components/MainSidebar'
import PageTransition from '../components/PageTransition'
import { useLocation } from '@tanstack/react-router'
import { useMemo, useEffect, useState } from 'react'

function RootComponent() {
  const location = useLocation()

  // 🎯 蕾姆精心设计的防闪烁逻辑
  // 确保 themeStore 从 localStorage 恢复完成后再渲染应用
  const [isThemeReady, setIsThemeReady] = useState(false)

  useEffect(() => {
    // 短暂延迟以确保 Zustand persist 完成 hydration
    const timer = setTimeout(() => {
      setIsThemeReady(true)
    }, 0)

    return () => clearTimeout(timer)
  }, [])

  // 判断当前是否为 Chat 路由（需要独立布局，隐藏 MainSidebar）
  const isChatRoute = useMemo(() => {
    const path = location.pathname
    return path.startsWith('/chat') || path.startsWith('/conversation')
  }, [location.pathname])

  // 🎯 蕾姆的防闪烁保护：主题未准备好时显示加载占位
  if (!isThemeReady) {
    return null // 或者显示一个加载占位符
  }

  return (
    <ThemeProvider>
      <div className="h-screen w-screen overflow-hidden bg-[#f5f5f7] dark:bg-black">
        <div className="h-full flex">
          {/* 主导航侧边栏 - Chat 路由下隐藏 */}
          {!isChatRoute && (
            <MainSidebar currentPath={location.pathname} />
          )}

          {/* ✨ 页面内容区域 - 包含过渡动画 */}
          <PageTransition />
        </div>
      </div>

      {/* 开发环境显示路由调试工具 */}
      {import.meta.env.DEV && <TanStackRouterDevtools position="bottom-right" />}
    </ThemeProvider>
  )
}

// 404 未找到页面组件
function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center bg-[#f5f5f7] dark:bg-black">
      <div className="text-center">
        <h1 className="text-[64px] font-bold text-primary-500 mb-4">404</h1>
        <p className="text-[16px] text-[#86868b] dark:text-[#8e8e93]">
          页面未找到
        </p>
      </div>
    </div>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFound,
})
