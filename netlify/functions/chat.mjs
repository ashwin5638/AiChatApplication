import { GoogleGenAI } from '@google/genai'

export const config = { path: '/api/chat' }

export const handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
    }

    let body
    try {
        body = JSON.parse(event.body || '{}')
    } catch {
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }
    }

    const { message } = body
    if (!message || typeof message !== 'string') {
        return { statusCode: 400, body: JSON.stringify({ error: 'Message is required' }) }
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_Key })

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: message
        })
        return {
            statusCode: 200,
            body: JSON.stringify({ reply: response.text })
        }
    } catch (err) {
        console.error('Gemini error:', err.status, err.message, err.details)
        return {
            statusCode: 500,
            body: JSON.stringify({ err: 'Gemini request failed' })
        }
    }
}