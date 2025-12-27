import { useState } from 'react'
import {
  Send, Sparkles, Plus, Code, Image, FileText, Settings,
  User, Bot, Copy, Check, Trash2, Edit3, ChevronDown
} from 'lucide-react'

function App() {
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', content: '你好！我是 AI 助手，有什么可以帮你的吗？' }
  ])
  const [input, setInput] = useState('')
  const [copiedId, setCopiedId] = useState(null)

  // 模型选项
  const models = [
    { id: 'gpt4', name: 'GPT-4', desc: '最强大的模型' },
    { id: 'gpt35', name: 'GPT-3.5', desc: '快速经济' },
    { id: 'claude', name: 'Claude', desc: '擅长写作' }
  ]

  // 快捷功能
  const quickActions = [
    { icon: Code, label: '代码生成', color: 'bg-blue-500' },
    { icon: Image, label: '图像分析', color: 'bg-purple-500' },
    { icon: FileText, label: '文档总结', color: 'bg-green-500' }
  ]

  const handleSend = () => {
    if (!input.trim()) return
    const newMessage = { id: Date.now(), role: 'user', content: input }
    setMessages([...messages, newMessage])
    setInput('')

    // 模拟 AI 响应
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: '我收到了你的消息："' + input + '"\n\n这是一个演示界面，展示扁平风格设计。'
      }])
    }, 500)
  }

  const copyMessage = (id, content) => {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* 顶部导航栏 */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-200">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800">AI Assistant</h1>
            <p className="text-xs text-slate-400">Powered by Intelligence</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* 模型选择器 */}
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors">
            <span className="text-sm font-medium text-slate-700">{models[0].name}</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <Settings className="w-5 h-5 text-slate-500" />
          </button>

          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-medium text-sm shadow-md">
            U
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 侧边栏 */}
        <aside className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col">
          <button className="flex items-center gap-2 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 text-white font-medium shadow-lg shadow-violet-200 hover:shadow-xl hover:shadow-violet-300 transition-all">
            <Plus className="w-5 h-5" />
            新对话
          </button>

          <div className="mt-6">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">快捷操作</h3>
            <div className="space-y-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-slate-100 transition-colors group"
                >
                  <div className={`w-9 h-9 rounded-lg ${action.color} flex items-center justify-center shadow-md`}>
                    <action.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-slate-700 group-hover:text-slate-900">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">历史对话</h3>
            <div className="space-y-1">
              {['项目构思', '代码重构', '文案优化'].map((item) => (
                <button
                  key={item}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors text-left"
                >
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600 truncate">{item}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* 对话区域 */}
        <main className="flex-1 flex flex-col">
          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* 头像 */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-emerald-400 to-cyan-500'
                    : 'bg-gradient-to-br from-violet-500 to-blue-500'
                } shadow-md`}>
                  {message.role === 'user' ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>

                {/* 消息内容 */}
                <div className={`flex-1 max-w-2xl ${message.role === 'user' ? 'flex justify-end' : ''}`}>
                  <div className="relative group">
                    <div className={`px-5 py-4 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                        : 'bg-white text-slate-700 shadow-sm border border-slate-100'
                    }`}>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                    </div>

                    {/* 操作按钮 */}
                    <div className={`absolute top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                      message.role === 'user' ? 'right-full mr-2' : 'left-full ml-2'
                    }`}>
                      <button
                        onClick={() => copyMessage(message.id, message.content)}
                        className="p-2 rounded-lg bg-white shadow-md border border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        {copiedId === message.id ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                      <button className="p-2 rounded-lg bg-white shadow-md border border-slate-100 hover:bg-slate-50 transition-colors">
                        <Edit3 className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 输入区域 */}
          <div className="p-6 border-t border-slate-200 bg-white">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-end gap-3 p-3 bg-slate-100 rounded-2xl border-2 border-transparent focus-within:border-violet-400 focus-within:bg-white transition-all">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  placeholder="输入你的问题... (Enter 发送, Shift+Enter 换行)"
                  className="flex-1 bg-transparent resize-none outline-none text-slate-700 placeholder-slate-400 text-sm leading-relaxed"
                  rows={1}
                  style={{ minHeight: '24px', maxHeight: '120px' }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className={`p-3 rounded-xl transition-all ${
                    input.trim()
                      ? 'bg-gradient-to-r from-violet-500 to-blue-500 text-white shadow-lg shadow-violet-200 hover:shadow-xl hover:scale-105'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-2 text-center">
                AI 可能产生错误，请核实重要信息
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
