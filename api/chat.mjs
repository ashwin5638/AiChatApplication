import { GoogleGenAI } from '@google/genai'

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' })
        return
    }

    let body = req.body
    if (typeof body === 'string') {
        try {
            body = JSON.parse(body)
        } catch {
            res.status(400).json({ error: 'Invalid JSON' })
            return
        }
    }

    const { message } = body || {}
    if (!message || typeof message !== 'string') {
        res.status(400).json({ error: 'Message is required' })
        return
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_Key })

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: message
        })
        res.status(200).json({ reply: response.text })
    } catch (err) {
        console.error('Gemini error:', err.status, err.message, err.details)
        res.status(500).json({ err: 'Gemini request failed' })
    }
}