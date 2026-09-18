import express  from 'express'
import cors from 'cors'
import "dotenv/config"
import { GoogleGenAI } from "@google/genai"

const app = express()
app.use(express.json())

app.use(cors({ origin: 'http://localhost:5173' }))


const ai = new GoogleGenAI({apiKey : process.env.API_Key})


app.post("/api/chat", async (req,res) => {
    const {message} = req.body 

    if(!message || typeof message !== "string"){
        return res.status(400).json({error: "Message is required"})
    }

    try{

        const response = await ai.models.generateContent({
            model : "gemini-3.6-flash",
            contents : message
        })

        res.json({reply : response.text})

    } catch(err){
        console.error("Gemini error:", err.status, err.message, err.details)
          res.status(500).json({ err: 'Gemini request failed' })
    }
})


app.listen(5000, () => {
    console.log("server running at port 5000")
})

