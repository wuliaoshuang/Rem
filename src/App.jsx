import { useState, useRef, useEffect } from 'react'
import {
  Send, Plus, Code, Image, FileText, Settings,
  Copy, Check, Ellipsis, MessageSquare,
  Paperclip, Mic, Sticker, X, PanelLeftClose, PanelLeftOpen, Menu
} from 'lucide-react'

function App() {
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', content: '你好！我是 AI 助手，有什么可以帮你的吗？' }
  ])
  const [input, setInput] = useState('')
  const [copiedId, setCopiedId] = useState(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showTools, setShowTools] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // 光标状态
  const [caretVisible, setCaretVisible] = useState(false)
  const [caretPosition, setCaretPosition] = useState({ x: 0, y: 0 })
  const [tailActive, setTailActive] = useState(false)
  const [textareaRect, setTextareaRect] = useState({ left: 0, top: 0 })
  const textareaRef = useRef(null)
  const mirrorRef = useRef(null)
  const caretRef = useRef(null)
  const lastPosRef = useRef({ x: 0, y: 0 })
  const tailTimeoutRef = useRef(null)

  // 智能预测相关
  const currentPosRef = useRef({ x: 0, y: 0 }) // 当前显示位置
  const targetPosRef = useRef({ x: 0, y: 0 }) // 目标位置（实际光标位置）
  const lastInputTimeRef = useRef(0) // 上次输入时间
  const animationFrameRef = useRef(null) // 动画帧ID
  const moveDirectionRef = useRef(1) // 移动方向：1=向右，-1=向左

  // 同步 mirror 样式和位置
  const syncMirrorStyle = () => {
    const textarea = textareaRef.current
    const mirror = mirrorRef.current
    if (!textarea || !mirror) return

    // 更新 textarea 位置
    const rect = textarea.getBoundingClientRect()
    setTextareaRect({ left: rect.left, top: rect.top })

    const computed = window.getComputedStyle(textarea)

    // 需要同步的所有样式属性
    const properties = [
      'fontFamily', 'fontSize', 'fontWeight', 'fontStyle',
      'letterSpacing', 'lineHeight', 'textTransform',
      'wordSpacing', 'paddingTop', 'paddingBottom',
      'paddingLeft', 'paddingRight', 'borderLeftWidth',
      'borderRightWidth', 'borderTopWidth', 'borderBottomWidth',
      'width', 'maxWidth', 'whiteSpace', 'wordWrap',
      'textAlign', 'textIndent', 'boxSizing'
    ]

    properties.forEach(prop => {
      mirror.style[prop] = computed[prop]
    })
  }

  // 获取光标位置
  const getCaretPosition = () => {
    const textarea = textareaRef.current
    const mirror = mirrorRef.current
    if (!textarea || !mirror) return { x: 0, y: 0 }

    // 直接使用 textarea.value，而不是 input 状态
    // 因为 input 状态更新可能滞后于 selectionStart
    const textBeforeCaret = textarea.value.substring(0, textarea.selectionStart)

    // 清空 mirror 并设置内容
    mirror.textContent = textBeforeCaret

    // 创建零宽字符 span 来定位
    const span = document.createElement('span')
    span.textContent = '\u200B' // 零宽字符
    mirror.appendChild(span)

    const spanRect = span.getBoundingClientRect()
    const textareaCurrentRect = textarea.getBoundingClientRect()

    // 计算相对于 textarea 左上角的位置
    const x = spanRect.left - textareaCurrentRect.left
    const y = spanRect.top - textareaCurrentRect.top

    // 清理
    mirror.removeChild(span)

    return { x, y }
  }

  // 更新光标位置
  const updateCaret = () => {
    const textarea = textareaRef.current
    if (!textarea) return

    const pos = getCaretPosition()
    const rect = textarea.getBoundingClientRect()
    const now = performance.now()

    // 更新 textarea 位置
    setTextareaRect({ left: rect.left, top: rect.top })

    // 计算移动方向（用于尾巴方向）
    const dx = pos.x - lastPosRef.current.x
    if (dx > 0.5) {
      moveDirectionRef.current = 1 // 向右移动（输入）
    } else if (dx < -0.5) {
      moveDirectionRef.current = -1 // 向左移动（删除）
    }

    // 计算移动距离（用于尾巴触发）
    const dy = pos.y - lastPosRef.current.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    // 移动超过阈值时触发尾巴
    if (distance > 3) {
      setTailActive(true)
      if (tailTimeoutRef.current) clearTimeout(tailTimeoutRef.current)
      tailTimeoutRef.current = setTimeout(() => setTailActive(false), 150)
    }

    // 更新上次位置记录
    lastPosRef.current = pos

    // 设置目标位置（全局坐标）
    targetPosRef.current = {
      x: rect.left + pos.x,
      y: rect.top + pos.y
    }

    // 记录输入时间
    lastInputTimeRef.current = now

    setCaretVisible(true)
  }

  // 平滑动画循环 - 带智能速度调整
  useEffect(() => {
    const caretEl = caretRef.current
    if (!caretEl) return

    let lastFrameTime = performance.now()

    const animate = (currentTime) => {
      const frameDelta = currentTime - lastFrameTime
      lastFrameTime = currentTime

      if (caretVisible) {
        // 计算与目标的距离
        const dx = targetPosRef.current.x - currentPosRef.current.x
        const dy = targetPosRef.current.y - currentPosRef.current.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        // 检查是否正在输入（100ms 内有输入）
        const isTyping = (currentTime - lastInputTimeRef.current) < 100
        const frameRatio = Math.min(frameDelta / 16.67, 2)

        let lerpFactor
        if (isTyping) {
          // 输入时快速跟随
          lerpFactor = Math.min(2.0 * frameRatio, 1)
        } else {
          // 停止输入后平滑移动
          lerpFactor = Math.min(0.25 * frameRatio, 1)
        }

        // 距离很小时直接到达
        if (dist < 0.5) {
          currentPosRef.current = { ...targetPosRef.current }
        } else {
          currentPosRef.current = {
            x: currentPosRef.current.x + dx * lerpFactor,
            y: currentPosRef.current.y + dy * lerpFactor
          }
        }

        // 设置位置和方向
        caretEl.style.transform = `translate(${currentPosRef.current.x}px, ${currentPosRef.current.y}px)`
        caretEl.style.setProperty('--move-direction', moveDirectionRef.current.toString())
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [caretVisible])

  // 初始化和窗口变化时同步样式
  useEffect(() => {
    syncMirrorStyle()
    const handleResize = () => syncMirrorStyle()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 监听输入变化
  useEffect(() => {
    updateCaret()
  }, [input])

  const handleInputFocus = () => {
    syncMirrorStyle()
    updateCaret()
    setCaretVisible(true)
  }

  const handleInputBlur = () => {
    setTimeout(() => setCaretVisible(false), 100)
  }

  const quickActions = [
    { icon: Code, label: '代码生成' },
    { icon: Image, label: '图像分析' },
    { icon: FileText, label: '文档总结' }
  ]

  const toolItems = [
    { icon: Paperclip, label: '上传文件', shortcut: '⌘⇧U' },
    { icon: Image, label: '发送图片', shortcut: '⌘⇧I' },
    { icon: Mic, label: '语音输入', shortcut: '⌘⇧V' },
    { icon: Sticker, label: '表情符号', shortcut: '⌘⇧E' },
  ]

  const handleSend = () => {
    if (!input.trim()) return
    const newMessage = { id: Date.now(), role: 'user', content: input }
    setMessages([...messages, newMessage])
    setInput('')

    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: '我收到了你的消息："' + input + '"\n\n这是一个演示界面。'
      }])
    }, 500)
  }

  const copyMessage = (id, content) => {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <>
      {/* 镜像 div - 用于计算光标位置 */}
      <div
        ref={mirrorRef}
        id="caret-mirror"
        style={{
          position: 'fixed',
          visibility: 'hidden',
          zIndex: -10,
          overflow: 'hidden',
          left: textareaRect.left,
          top: textareaRect.top,
        }}
      />

      {/* 自定义光标组件 */}
      {caretVisible && (
        <div
          ref={caretRef}
          className="comet-caret"
          data-direction={moveDirectionRef.current > 0 ? '1' : '-1'}
          style={{
            // 位置由 transform 在动画循环中直接设置
          }}
        >
          {/* 彗星尾巴 */}
          <div className={`comet-tail ${tailActive ? 'active' : ''}`} />

          {/* 尾巴粒子 */}
          {tailActive && [...Array(4)].map((_, i) => (
            <div
              key={i}
              className="comet-particle"
              style={{
                '--particle-offset': `${(i + 1) * 10 + 8}px`,
                width: `${6 - i}px`,
                height: `${6 - i}px`,
                opacity: 0.6 - i * 0.12,
                animation: `particle-fade 0.4s ease-out ${i * 0.03}s both`,
              }}
            />
          ))}

          {/* 主光标 */}
          <div className="comet-caret-main">
            {/* 光标头部光晕 */}
            <div className="comet-caret-glow" />
          </div>
        </div>
      )}

      <div className="h-screen flex bg-white">
        {/* 移动端遮罩 */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* 侧边栏 */}
        <aside className={`
          fixed lg:relative z-50 h-full
          ${sidebarCollapsed ? 'w-16' : 'w-64'}
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          bg-[#f9f9f9] border-r border-black/5 flex flex-col
          transition-all duration-300
        `}>
          {/* Logo + 收起按钮区域 */}
          <div className="p-3 border-b border-black/5">
            <div className="flex items-center justify-between gap-2">
              <div className={`flex items-center ${sidebarCollapsed ? 'justify-center flex-1' : 'gap-3'}`}>
                <div className="w-8 h-8 bg-[#95C0EC] rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                {!sidebarCollapsed && (
                  <span className="font-semibold text-[#1d1d1f] text-[15px]">Assistant</span>
                )}
              </div>
              {/* 桌面端折叠按钮 */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:flex p-1.5 hover:bg-black/[0.03] rounded-lg transition-colors"
                title={sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'}
              >
                {sidebarCollapsed ? (
                  <PanelLeftOpen className="w-4 h-4 text-[#86868b]" />
                ) : (
                  <PanelLeftClose className="w-4 h-4 text-[#86868b]" />
                )}
              </button>
            </div>
          </div>

          {/* 新对话按钮 */}
          <div className="p-2">
            <button className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-2 w-full px-3'} py-2 bg-[#95C0EC] text-white rounded-lg text-[15px] font-medium hover:bg-[#7aaddd] active:scale-[0.98] transition-all`}>
              <Plus className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && <span>新对话</span>}
            </button>
          </div>

          {/* 快捷操作 */}
          {!sidebarCollapsed && (
            <div className="px-2 pb-2">
              <p className="text-[12px] text-[#86868b] px-3 mb-1 font-medium">快捷操作</p>
              <div className="space-y-0.5">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-[14px] text-[#1d1d1f] hover:bg-black/[0.03] transition-colors"
                  >
                    <action.icon className="w-4 h-4 text-[#95C0EC]" />
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 历史记录 */}
          <div className="flex-1 px-2 overflow-y-auto">
            {!sidebarCollapsed && (
              <p className="text-[12px] text-[#86868b] px-3 mb-1 font-medium">历史</p>
            )}
            <div className="space-y-0.5">
              {['项目构思', '代码重构', '文案优化', '技术方案', '产品规划'].map((item) => (
                <button
                  key={item}
                  className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-2 w-full px-3'} py-2 rounded-lg text-[14px] text-[#1d1d1f] hover:bg-black/[0.03] transition-colors`}
                  title={sidebarCollapsed ? item : ''}
                  onClick={() => setMobileSidebarOpen(false)}
                >
                  <MessageSquare className="w-4 h-4 text-[#86868b] flex-shrink-0" />
                  {!sidebarCollapsed && <span className="truncate">{item}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* 底部设置按钮 */}
          <div className="p-2 border-t border-black/5">
            <button className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-[14px] text-[#1d1d1f] hover:bg-black/[0.03] transition-colors">
              <Settings className="w-4 h-4 text-[#86868b]" />
              {!sidebarCollapsed && <span>设置</span>}
            </button>
          </div>
        </aside>

        {/* 主区域 */}
        <main className="flex-1 flex flex-col bg-white min-w-0 relative">
          {/* 顶部栏 */}
          <header className="h-12 border-b border-black/5 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <button
                className="lg:hidden p-2 hover:bg-black/[0.03] rounded-lg transition-colors"
                onClick={() => setMobileSidebarOpen(true)}
              >
                <Menu className="w-5 h-5 text-[#86868b]" />
              </button>
              <h2 className="text-[15px] font-medium text-[#1d1d1f]">新对话</h2>
            </div>
            <button className="p-2 hover:bg-black/[0.03] rounded-lg transition-colors">
              <Ellipsis className="w-5 h-5 text-[#86868b]" />
            </button>
          </header>

          {/* 消息区域 */}
          <div className="flex-1 overflow-y-auto">
            <div className="py-4 max-w-4xl mx-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`group ${message.role === 'user' ? 'flex justify-end px-4 py-3' : 'px-6 py-4'}`}
                >
                  {/* AI 消息 - 平铺全宽，无头像 */}
                  {message.role === 'assistant' && (
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-[15px] text-[#1d1d1f] whitespace-pre-wrap leading-relaxed">
                            {message.content}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <button
                            onClick={() => copyMessage(message.id, message.content)}
                            className="p-1.5 hover:bg-black/[0.03] rounded-lg transition-colors"
                          >
                            {copiedId === message.id ? (
                              <Check className="w-4 h-4 text-[#95C0EC]" />
                            ) : (
                              <Copy className="w-4 h-4 text-[#86868b]" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 用户消息 - 气泡模式，无头像 */}
                  {message.role === 'user' && (
                    <div className="flex items-end gap-3 max-w-2xl ml-auto">
                      <div className="relative group/bubble">
                        <div className="px-4 py-2.5 bg-[#95C0EC] text-white rounded-2xl rounded-br-md">
                          <p className="text-[15px] whitespace-pre-wrap leading-relaxed">
                            {message.content}
                          </p>
                        </div>
                        {/* 复制按钮 */}
                        <div className="absolute top-1/2 -translate-y-1/2 left-full ml-2 opacity-0 group-hover/bubble:opacity-100 transition-opacity">
                          <button
                            onClick={() => copyMessage(message.id, message.content)}
                            className="p-1.5 bg-white border border-black/10 rounded-lg hover:bg-black/[0.03] transition-colors shadow-sm"
                          >
                            {copiedId === message.id ? (
                              <Check className="w-3.5 h-3.5 text-[#95C0EC]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-[#86868b]" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 输入区域 */}
          <div className="border-t border-black/5 bg-white p-3 sm:p-4">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm shadow-black/[0.03] border border-black/10 focus-within:border-[#95C0EC] focus-within:shadow-md focus-within:shadow-[#95C0EC]/10 transition-all relative">
              {/* 工具栏 */}
              <div className="flex items-center gap-1 px-3 py-2 border-b border-black/5">
                <button
                  onClick={() => setShowTools(!showTools)}
                  className="p-1.5 hover:bg-black/[0.03] rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4 text-[#86868b]" />
                </button>
                <button className="p-1.5 hover:bg-black/[0.03] rounded-lg transition-colors">
                  <Paperclip className="w-4 h-4 text-[#86868b]" />
                </button>
                <button className="p-1.5 hover:bg-black/[0.03] rounded-lg transition-colors">
                  <Image className="w-4 h-4 text-[#86868b]" />
                </button>
                <div className="flex-1" />
                <button className="p-1.5 hover:bg-black/[0.03] rounded-lg transition-colors">
                  <Mic className="w-4 h-4 text-[#86868b]" />
                </button>
              </div>

              {/* 文本输入区 */}
              <div className="flex items-end gap-2 px-3 py-2">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value)
                    setTimeout(updateCaret, 0)
                  }}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  onClick={updateCaret}
                  onKeyUp={updateCaret}
                  onSelect={updateCaret}
                  onKeyDown={(e) => {
                    updateCaret()
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  placeholder="输入消息... (⌘Enter 发送)"
                  className="custom-caret-textarea flex-1 bg-transparent resize-none outline-none text-[15px] text-[#1d1d1f] placeholder-[#86868b] min-h-[24px] max-h-48 leading-relaxed py-1"
                  rows={1}
                  style={{ fieldSizing: 'content' }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className={`p-2 rounded-lg transition-all active:scale-95 ${
                    input.trim()
                      ? 'bg-[#95C0EC] text-white hover:bg-[#7aaddd]'
                      : 'bg-[#e5e5ea] text-[#86868b] cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 提示文本 */}
            <div className="flex items-center justify-center gap-3 mt-2">
              <p className="text-[12px] text-[#86868b]">
                AI 可能产生错误，请核实重要信息
              </p>
              <span className="text-[#86868b]">·</span>
              <button className="text-[12px] text-[#95C0EC] hover:underline">
                查看快捷键
              </button>
            </div>
          </div>

          {/* 展开工具面板 - 响应式修复 */}
          {showTools && (
            <div className="absolute bottom-24 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-auto bg-white rounded-xl shadow-xl border border-black/10 p-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <button
                onClick={() => setShowTools(false)}
                className="absolute top-2 right-2 p-1 hover:bg-black/[0.03] rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-[#86868b]" />
              </button>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                {toolItems.map((item) => (
                  <button
                    key={item.label}
                    className="flex flex-col items-center gap-1 px-3 py-2.5 sm:px-4 rounded-lg hover:bg-black/[0.03] transition-colors"
                  >
                    <item.icon className="w-5 h-5 text-[#95C0EC]" />
                    <span className="text-[11px] sm:text-[12px] text-[#1d1d1f]">{item.label}</span>
                    <span className="text-[9px] sm:text-[10px] text-[#86868b] hidden sm:inline">{item.shortcut}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  )
}

export default App
