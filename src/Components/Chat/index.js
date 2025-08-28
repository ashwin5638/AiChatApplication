import { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./index.css";

const ChatAi = () => {
  const [questions, setQuestions] = useState("");
  const [answer, setAnswer] = useState("");

  const generateAnswer = async () => {
    setAnswer("loading...");
    const response = await axios({
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.REACT_APP_API_KEY}`,
      method: "POST",
      data: {
        contents: [
          {
            parts: [{ text: questions }],
          },
        ],
      },
    });

    setAnswer(response.data.candidates[0].content.parts[0].text);
  };

  return (
    <div className="chat-div">
      <h1 className="head">Chat with AI</h1>
      <div className="chat">
        <textarea
          className="text-area"
          value={questions}
          onChange={(e) => setQuestions(e.target.value)}
          placeholder="Ask any thing"
          rows="5"
        ></textarea>
        <button className="buttn" onClick={generateAnswer}>
          Generate Answer
        </button>

        {/* Render AI answer nicely */}
       {answer && (
    <div className="answer-box">
          <ReactMarkdown  remarkPlugins={[remarkGfm]}>
              {answer}
             </ReactMarkdown>
    </div>
)}

      </div>
    </div>
  );
};

export default ChatAi;
