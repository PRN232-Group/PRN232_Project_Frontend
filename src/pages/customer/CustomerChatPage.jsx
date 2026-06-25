import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "../../styles/customer/customerChatPage.css";

const CustomerChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        "https://localhost:5001/api/chat/messages"
      );

      setMessages(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Không thể tải tin nhắn");

      // fallback demo data
      setMessages([
        {
          id: 1,
          sender: "staff",
          content: "Xin chào! Tôi có thể giúp gì cho bạn?",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = {
      id: Date.now(),
      sender: "customer",
      content: input,
      createdAt: new Date().toISOString(),
    };

    // optimistic UI
    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    try {
      await axios.post("https://localhost:5001/api/chat/send", {
        content: input,
      });
    } catch (err) {
      console.error(err);
      alert("Gửi tin nhắn thất bại");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-header">
        <h2>Customer Support Chat</h2>
      </div>

      <div className="chat-box">
        {loading && <p>Loading chat...</p>}
        {error && <p className="error">{error}</p>}

        {!loading &&
          !error &&
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`chat-message ${
                msg.sender === "customer" ? "right" : "left"
              }`}
            >
              <div className="bubble">
                <p>{msg.content}</p>
                <span className="time">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}

        <div ref={chatEndRef} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default CustomerChatPage;