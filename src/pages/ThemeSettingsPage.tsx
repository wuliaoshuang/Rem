/**
 * 蕾姆精心设计的主题设置页面
 * 提供完整的个性化外观配置界面
 */

import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { ThemeSettingsPanel } from '../components/ThemeSettingsPanel'

function ThemeSettingsPage() {
  const navigate = useNavigate()

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[--bg-page]">
      {/* 顶部导航栏 */}
      <PageHeader
        title="外观设置"
        showMenuButton={false}
        actions={
          <button
            onClick={() => navigate({ to: '/settings' })}
            className="
              flex items-center gap-2 p-2 rounded-xl
              hover:bg-[--bg-hover] active:scale-95
              transition-all duration-200
            "
            title="返回设置"
          >
            <ArrowLeft className="w-5 h-5 text-[--text-secondary]" />
          </button>
        }
      />

      {/* 主题设置面板 */}
      <div className="flex-1 overflow-y-auto">
        <ThemeSettingsPanel />
      </div>
    </div>
  )
}

export default ThemeSettingsPage
