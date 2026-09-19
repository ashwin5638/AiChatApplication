import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

const STORAGE_KEY = 'luminash-history'
const newId = () => Date.now().toString()

const Chat = () => {
    const [conversations, setConversations] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] 
        } catch {
            return []
        }
    })
    const [activeId, setActiveId] = useState(null)
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)

    const active = conversations.find(c => c.id === activeId) 

    const startNewChat = () => {
        setActiveId(null)
        setInput('')
        setMenuOpen(false)
    }

    const deleteConversation = (id) => {
        const next = conversations.filter(c => c.id !== id)
        setConversations(next)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        if (activeId === id) setActiveId(null)
    }

    const sendMessage = async () => {
        const text = input.trim()
        if (!text || loading) return

        setLoading(true)
        setInput('')
        setMenuOpen(false)

        let reply
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            })
            const data = await res.json()
            reply = data.reply
        } catch {
            reply = 'Error: could not reach server'
        }

        const convo = active
            ? {
                ...active,
                messages: [...active.messages, { role: 'user', content: text }, { role: 'ai', content: reply }]
            }
            : {
                id: newId(),
                title: text.slice(0, 40),
                messages: [{ role: 'user', content: text }, { role: 'ai', content: reply }]
            }

        const next = conversations.some(c => c.id === convo.id)
            ? conversations.map(c => c.id === convo.id ? convo : c)
            : [...conversations, convo]

        setConversations(next)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        setActiveId(convo.id)
        setLoading(false)
    }

    return (
        <div className="app">
            <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h1 className="logo">Luminash AI</h1>
                    <button className="sidebar-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <line x1="6" y1="6" x2="18" y2="18" />
                            <line x1="18" y1="6" x2="6" y2="18" />
                        </svg>
                    </button>
                </div>
                <button className="new-chat" onClick={startNewChat}>+ New Chat</button>
                <div className="history">
                    {conversations.length === 0 && <p className="empty-history">No chats yet</p>}
                    {conversations.map(c => (
                        <div key={c.id} className={`history-item ${c.id === activeId ? 'active' : ''}`}>
                            <button
                                className="history-title"
                                onClick={() => { setActiveId(c.id); setMenuOpen(false) }}
                                title={c.title}
                            >
                                {c.title}
                            </button>
                            <button
                                className="history-delete"
                                onClick={() => deleteConversation(c.id)}
                                aria-label="Delete"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            </aside>

            <div className={`backdrop ${menuOpen ? 'show' : ''}`} onClick={() => setMenuOpen(false)} />

            <main className="main">
                <div className="topbar">
                    <button className="menu-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>
                    <span className="topbar-title">Luminash AI</span>
                </div>
                {!active ? (
                    <div className="welcome">
                        <h2>Hello, I'm Luminash AI</h2>
                        <p>Ask me anything.</p>
                    </div>
                ) : (
                    <div className="messages">
                        {active.messages.map((m, i) => (
                            <div key={i} className={`message ${m.role}`}>
                                <div className="bubble">
                                    {m.role === 'ai'
                                        ? <ReactMarkdown>{m.content}</ReactMarkdown>
                                        : m.content}
                                </div>
                            </div>
                        ))}
                        {loading && <div className="message ai"><div className="bubble typing">Thinking...</div></div>}
                    </div>
                )}

                <div className="composer">
                    <textarea
                        className="input"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                sendMessage()
                            }
                        }}
                        placeholder="Type your message..."
                        rows={2}
                    />
                    <button
                        className="send-btn"
                        onClick={sendMessage}
                        disabled={loading}
                    >
                        {loading ? <span className="spinner" aria-label="Loading"></span> : 'Send'}
                    </button>
                </div>
            </main>
        </div>
    )
}

export default Chat