import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "../../styles/sales/customerChatManagementPage.css";

const CustomerChatManagementPage = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  // Load customers
  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      fetchMessages(selectedCustomer.id);
    }
  }, [selectedCustomer]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get("/api/chat/customers");
      setCustomers(res.data || []);
    } catch (err) {
      console.error("Load customers error:", err);
    }
  };

  const fetchMessages = async (customerId) => {
    try {
      const res = await axios.get(`/api/chat/messages/${customerId}`);
      setMessages(res.data || []);
    } catch (err) {
      console.error("Load messages error:", err);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedCustomer) return;

    const newMsg = {
      sender: "staff",
      content: input,
      time: new Date().toISOString(),
    };

    try {
      // Optimistic UI
      setMessages((prev) => [...prev, newMsg]);
      setInput("");

      await axios.post("/api/chat/send", {
        customerId: selectedCustomer.id,
        content: input,
      });
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="chat-container">
      {/* LEFT - CUSTOMER LIST */}
      <div className="chat-sidebar">
        <h3>Customers</h3>
        <div className="customer-list">
          {customers.map((c) => (
            <div
              key={c.id}
              className={`customer-item ${
                selectedCustomer?.id === c.id ? "active" : ""
              }`}
              onClick={() => setSelectedCustomer(c)}
            >
              <div className="avatar">{c.name?.charAt(0)}</div>
              <div>
                <div className="name">{c.name}</div>
                <div className="email">{c.email}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT - CHAT BOX */}
      <div className="chat-box">
        {selectedCustomer ? (
          <>
            {/* HEADER */}
            <div className="chat-header">
              <h3>{selectedCustomer.name}</h3>
            </div>

            {/* MESSAGES */}
            <div className="chat-messages">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${
                    msg.sender === "staff" ? "right" : "left"
                  }`}
                >
                  <div className="bubble">{msg.content}</div>
                  <div className="time">
                    {new Date(msg.time).toLocaleTimeString()}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* INPUT */}
            <div className="chat-input">
              <input
                type="text"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </>
        ) : (
          <div className="no-chat">
            Select a customer to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerChatManagementPage;