# Luminash AI Chat

A minimal AI chat app built with **React (Vite)** on the frontend and **Express + Google Gemini** on the backend.

## Features

- Chat with Google's Gemini model (`gemini-3.6-flash`)
- Conversation history with localStorage (persists across reloads)
- Multiple chats, switch between them, delete old ones
- Simple MVP UI with sidebar + chat area

## Tech Stack

- **Frontend:** React 19, Vite (DEV proxy: `/api` → `localhost:5000`)
- **Backend:** Express 5, Google GenAI SDK, dotenv, cors
- **Styling:** Plain CSS

## Project Structure

```
├── server/api/api.js          # Express backend (Gemini relay)
├── src/components/chat/       # Chat UI (history, sidebar, composer)
├── .env                       # Your API key (gitignored — never commit!)
├── vite.config.js             # Dev proxy to backend
```

## Getting Started

### Prerequisites

- Node.js
- A Google AI API key from [Google AI Studio](https://aistudio.google.com/)

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment file

Create a `.env` file in the project root:

```
API_Key=your-gemini-api-key
```

> The `.env` file is gitignored. It must be created locally on every machine you run the app on.

### 3. Run the backend

```bash
node server/api/api.js
```

Server runs at `http://localhost:5000`.

### 4. Run the frontend (separate terminal)

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

> The Vite dev server proxies `/api/*` requests to the backend at `localhost:5000`, so `cors` only allows `http://localhost:5173`. If you deploy the frontend to a different domain, update the `origin` in `server/api/api.js`.

## Deployment Notes

- Update the **CORS origin** in `server/api/api.js` to your real frontend domain
- Add **rate limiting / auth** to `/api/chat` before exposing publicly
- API key stays **server-side only** — it never ships to the browser
