import { useState } from 'react'

const STORAGE_KEY = 'luminash-history'

const loadHistory = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
    } catch {
        return []
    }
}

const Chat = () => {
    const [conversations, setConversations] = useState(loadHistory)
    const [activeId, setActiveId] = useState(null)
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)

    const active = conversations.find(c => c.id === activeId) || null

    const saveConvos = (convo, newConvos) => {
        let updated
        if (newConvos) {
            updated = newConvos
        } else if (convo) {
            updated = conversations.some(c => c.id === convo.id)
                ? conversations.map(c => c.id === convo.id ? convo : c)
                : [...conversations, convo]
        } else {
            updated = conversations
        }
        setConversations(updated)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    }

    const startNewChat = () => {
        setActiveId(null)
        setInput('')
    }

    const sendMessage = async () => {
        const text = input.trim()
        if (!text || loading) return

        let convo = conversations.find(c => c.id === activeId)
        if (!convo) {
            convo = { id: Date.now().toString(), title: text.slice(0, 40), messages: [] }
            setActiveId(convo.id)
        }

        convo.messages = [...convo.messages, { role: 'user', content: text }]
        setInput('')
        setLoading(true)
        saveConvos(convo)

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            })
            const data = await res.json()
            convo.messages = [...convo.messages, { role: 'ai', content: data.reply }]
        } catch {
            convo.messages = [...convo.messages, { role: 'ai', content: 'Error: could not reach server' }]
        }

        saveConvos(convo)
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
                        <button
                            key={c.id}
                            className={`history-item ${c.id === activeId ? 'active' : ''}`}
                            onClick={() => setActiveId(c.id)}
                            title={c.title}
                        >
                            {c.title}
                        </button>
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
                            if (e.key === 'Enter' && !e.shiftKey) {
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
                        disabled={loading || !input.trim()}
                    >
                        Send
                    </button>
                </div>
            </main>
        </div>
    )
}

export default Chat