import { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./index.css";

const ChatAi = () => {
  const [questions, setQuestions] = useState("");
  const [answer, setAnswer] = useState("");
  const [copied, setCopied] = useState(false);
  const [fileData, setFileData] = useState(null);
  const [fileName, setFileName] = useState("");


const generateAnswer = async () => {
  setAnswer("loading...");

  const parts = [{ text: questions }];

  if (fileData) {
    parts.push({
      inlineData: {
        mimeType: fileData.mimeType,
        data: fileData.data,
      },
    });
  }

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.REACT_APP_API_KEY}`,
    {
      contents: [{ parts }],
    }
  );

  setAnswer(response.data.candidates[0].content.parts[0].text);
};


  const handleCopy = () => {
    navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // reset
  };

  return (
    <div className="chat-div">
      <h1 className="head">Chat with AI</h1>
      <div className="chat">
        <div className="text-container">
  {/* + button with file input */}
  <label className="chat-plus">
    +
    <input
      type="file"
      accept="image/*,.pdf,.docx,.txt"
      style={{ display: "none" }}
     onChange={(e) => {
  const file = e.target.files[0];
  if (file) {
    setFileName(file.name); // store name

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileData({
          mimeType: file.type,
          data: reader.result.split(",")[1],
        });
      };
      reader.readAsDataURL(file);
    } else {
      setFileData(null);
    }
  }
}}

    />
  </label>

  {/* Textarea */}
  <textarea
    className="text-area"
    value={questions}
    onChange={(e) => {
      setQuestions(e.target.value);
      e.target.style.height = "auto"; 
      e.target.style.height = e.target.scrollHeight + "px"; 
      e.target.parentNode.style.height = e.target.scrollHeight + "px";
    }}
    placeholder="Ask any thing"
    rows="5"
  />  
  {fileName && (
  <div className="file-chip">
   {fileName}
    <button
      onClick={() => {
        setFileName("");
        setFileData(null);
      }}
      className="remove-file"
    >
      ✕
    </button>
  </div>
)}

</div>

        <button className="buttn" onClick={generateAnswer}>
          Generate Answer
        </button>
        {answer && (
          <div className="answer-box">
          
            <button className="copy-btn" onClick={handleCopy}>
              ⿻ {copied ? "Copied!" : "Copy code"}
            </button>

          <div className="answer-container">
            <ReactMarkdown  remarkPlugins={[remarkGfm]}>{answer}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
      <p className="para">@ashwin5638</p>
    </div>
  );
};

export default ChatAi;
