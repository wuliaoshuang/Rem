import { useState } from 'react'
import {
  Send, Plus, Code, Image, FileText, Settings,
  User, Bot, Copy, Check, Ellipsis, MessageSquare,
  Paperclip, Mic, Sticker, X, Sidebar
} from 'lucide-react'

function App() {
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', content: '你好！我是 AI 助手，有什么可以帮你的吗？' }
  ])
  const [input, setInput] = useState('')
  const [copiedId, setCopiedId] = useState(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showTools, setShowTools] = useState(false)

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
    <div className="h-screen flex bg-white">
      {/* 侧边栏 */}
      <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-[#f9f9f9] border-r border-black/5 flex flex-col transition-all duration-200`}>
        {/* Logo */}
        <div className="p-3 border-b border-black/5">
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="w-8 h-8 bg-[#95C0EC] rounded-lg flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            {!sidebarCollapsed && (
              <span className="font-semibold text-[#1d1d1f] text-[15px]">Assistant</span>
            )}
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
              >
                <MessageSquare className="w-4 h-4 text-[#86868b] flex-shrink-0" />
                {!sidebarCollapsed && <span className="truncate">{item}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* 底部设置 */}
        <div className="p-2 border-t border-black/5">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="flex items-center justify-center w-full py-2 rounded-lg text-[14px] text-[#1d1d1f] hover:bg-black/[0.03] transition-colors"
          >
            <Sidebar className="w-4 h-4 text-[#86868b]" />
          </button>
        </div>
      </aside>

      {/* 主区域 */}
      <main className="flex-1 flex flex-col bg-white">
        {/* 顶部栏 */}
        <header className="h-12 border-b border-black/5 flex items-center justify-between px-4">
          <h2 className="text-[15px] font-medium text-[#1d1d1f]">新对话</h2>
          <button className="p-2 hover:bg-black/[0.03] rounded-lg transition-colors">
            <Ellipsis className="w-5 h-5 text-[#86868b]" />
          </button>
        </header>

        {/* 消息区域 - 全宽 */}
        <div className="flex-1 overflow-y-auto">
          <div className="py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`group flex gap-4 px-4 py-3 ${message.role === 'user' ? 'bg-[#f5f5f7]' : ''}`}
              >
                {/* 头像 */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user'
                    ? 'bg-[#e5e5ea]'
                    : 'bg-[#95C0EC]'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-[#86868b]" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>

                {/* 消息内容 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-[15px] text-[#1d1d1f] whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => copyMessage(message.id, message.content)}
                        className="p-1.5 hover:bg-black/[0.03] rounded-lg transition-colors"
                        title="复制"
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
              </div>
            ))}
          </div>
        </div>

        {/* 输入区域 - 全宽 */}
        <div className="border-t border-black/5 bg-white">
          <div className="p-3">
            {/* 输入框 */}
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm shadow-black/[0.03] border border-black/10 focus-within:border-[#95C0EC] focus-within:shadow-md focus-within:shadow-[#95C0EC]/10 transition-all">
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
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  placeholder="输入消息... (⌘Enter 发送)"
                  className="flex-1 bg-transparent resize-none outline-none text-[15px] text-[#1d1d1f] placeholder-[#86868b] min-h-[24px] max-h-48 leading-relaxed py-1"
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
        </div>

        {/* 展开工具面板 */}
        {showTools && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-xl border border-black/10 p-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <button
              onClick={() => setShowTools(false)}
              className="absolute top-2 right-2 p-1 hover:bg-black/[0.03] rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-[#86868b]" />
            </button>
            <div className="grid grid-cols-4 gap-1">
              {toolItems.map((item) => (
                <button
                  key={item.label}
                  className="flex flex-col items-center gap-1 px-4 py-2.5 rounded-lg hover:bg-black/[0.03] transition-colors min-w-[70px]"
                >
                  <item.icon className="w-5 h-5 text-[#95C0EC]" />
                  <span className="text-[12px] text-[#1d1d1f]">{item.label}</span>
                  <span className="text-[10px] text-[#86868b]">{item.shortcut}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
