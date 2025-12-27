/**
 * 蕾姆精心设计的公共页面头部组件
 * 提供统一的页面标题、移动端菜单按钮和操作区域
 */
import { ReactNode } from 'react'
import { Menu } from 'lucide-react'
import { useUIStore } from '../stores/uiStore'

interface PageHeaderProps {
  title: string
  actions?: ReactNode
  subtitle?: string
  showMenuButton?: boolean
}

export default function PageHeader({
  title,
  actions,
  subtitle,
  showMenuButton = true,
}: PageHeaderProps) {
  const { setMobileSidebarOpen } = useUIStore()

  return (
    <header className="h-14 bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 border-b border-[#e5e5ea] dark:border-[#3a3a3c]">
      {/* 左侧：菜单按钮 + 标题 */}
      <div className="flex items-center gap-3">
        {/* 移动端菜单按钮 */}
        {showMenuButton && (
          <button
            className="lg:hidden p-2.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-all duration-200"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <Menu className="w-5 h-5 text-[#86868b] dark:text-[#8e8e93]" />
          </button>
        )}

        {/* 标题区域 */}
        <div className="flex flex-col">
          <h1 className="text-[16px] sm:text-[17px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[12px] text-[#86868b] dark:text-[#8e8e93] hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* 右侧：操作按钮 */}
      {actions && (
        <div className="flex items-center gap-1">
          {actions}
        </div>
      )}
    </header>
  )
}
