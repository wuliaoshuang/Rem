/**
 * 蕾姆精心设计的页面过渡动画组件
 * 提供优雅的淡进淡出效果，就像蕾姆温柔的微笑~
 * ✨ 修复：限制容器高度，防止整页滚动
 */
import { Outlet, useLocation } from '@tanstack/react-router'
import { useState, useEffect } from 'react'

type TransitionState = 'idle' | 'entering' | 'entered' | 'exiting' | 'exited'

export default function PageTransition() {
  const location = useLocation()
  const [transitionState, setTransitionState] = useState<TransitionState>('entered')

  useEffect(() => {
    // 每次路由变化时触发淡入动画
    setTransitionState('entering')

    // 淡入动画持续时间（300ms）
    const enterTimer = setTimeout(() => {
      setTransitionState('entered')
    }, 300)

    return () => clearTimeout(enterTimer)
  }, [location.pathname])

  // 根据状态获取动画类名
  const getAnimationClasses = (): string => {
    const baseClasses = 'flex-1 overflow-hidden'

    switch (transitionState) {
      case 'entering':
        return `${baseClasses} animate-page-enter`
      case 'entered':
        return `${baseClasses} animate-page-entered`
      default:
        return baseClasses
    }
  }

  return (
    <div className={getAnimationClasses()}>
      <Outlet />
    </div>
  )
}
