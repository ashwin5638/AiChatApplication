import {useState} from 'react'


const Chat = () => {
    const [message, setMessage] = useState('')
    const [reply, setReply] = useState('')
    const [loading, setLoading] = useState(false)

    const sendMessage = async () => {
        if (!message.trim()) return

        setLoading(true)
        setReply('')
     
     try{
         const res = await fetch('/api/chat', {
            method : 'POST',
            headers : {'Content-Type' : 'application/json'},
            body : JSON.stringify({message})
         })
          const data = await res.json()
          setReply(data.reply)
     } catch(err){
        setReply("Error" + err.message)
     }
       setLoading(false)
    }

    return (
        <>
        <div>
            <main>
                <h1>luminash AI</h1>
                <div>
                    <p>{loading ? 'Thinking...' : reply}</p>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message..."
                    />
                    <button
                        onClick={sendMessage}
                        disabled={loading || !message.trim()}
                    >
                        {loading ? 'Sending...' : 'Send'}
                    </button>
                </div>
            </main>
        </div>
        </>
    )
}


export default Chat