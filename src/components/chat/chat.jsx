import { useState } from 'react'

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

    const active = conversations.find(c => c.id === activeId) || null

    const startNewChat = () => {
        setActiveId(null)
        setInput('')
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
        setLoading(false)
    }

    return (
        <div className="app">
            <aside className="sidebar">
                <h1 className="logo">Luminash AI</h1>
                <button className="new-chat" onClick={startNewChat}>+ New Chat</button>
                <div className="history">
                    {conversations.length === 0 && <p className="empty-history">No chats yet</p>}
                    {conversations.map(c => (
                        <div key={c.id} className={`history-item ${c.id === activeId ? 'active' : ''}`}>
                            <button
                                className="history-title"
                                onClick={() => setActiveId(c.id)}
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

            <main className="main">
                {!active ? (
                    <div className="welcome">
                        <h2>Hello, I'm Luminash AI</h2>
                        <p>Ask me anything.</p>
                    </div>
                ) : (
                    <div className="messages">
                        {active.messages.map((m, i) => (
                            <div key={i} className={`message ${m.role}`}>
                                <div className="bubble">{m.content}</div>
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
                        Send
                    </button>
                </div>
            </main>
        </div>
    )
}

export default Chat