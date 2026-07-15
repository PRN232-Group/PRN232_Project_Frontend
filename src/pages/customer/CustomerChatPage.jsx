import React, { useEffect, useRef, useState } from "react";
import "../../styles/customer/customerChatPage.css";
import { chatService } from "../../application/services";

const isMine = (msg) => {
  const s = (msg.sender || msg.senderRole || "").toString().toLowerCase();
  return s === "customer" || s === "user" || s === "me";
};

const CustomerChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await chatService.getMessages();
      const list = res.data || [];
      setMessages(
        list.length
          ? list
          : [
              {
                id: 1,
                senderRole: "Sales",
                content:
                  "Xin chào! Interior Studio có thể tư vấn sản phẩm, báo giá hoặc thiết kế giúp bạn.",
                createdAt: new Date().toISOString(),
              },
            ]
      );
    } catch {
      setMessages([
        {
          id: 1,
          senderRole: "Sales",
          content:
            "Xin chào! Interior Studio có thể tư vấn sản phẩm, báo giá hoặc thiết kế giúp bạn.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;

    const optimistic = {
      id: Date.now(),
      senderRole: "Customer",
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput("");

    try {
      await chatService.send({ content: text, senderRole: "Customer" });
      // mock auto-reply feel
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            senderRole: "Sales",
            content:
              "Cảm ơn bạn! Nhân viên kinh doanh sẽ phản hồi sớm. Bạn cũng có thể xem Sản phẩm hoặc yêu cầu thiết kế 3D.",
            createdAt: new Date().toISOString(),
          },
        ]);
      }, 600);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-header">
        <h2>Hỗ trợ khách hàng</h2>
        <p className="chat-subtitle">
          Nhắn với đội Sales — hỏi sản phẩm, đơn hàng, báo giá hoặc thiết kế.
        </p>
      </div>

      <div className="chat-box">
        {loading && <p>Đang tải hội thoại...</p>}

        {!loading &&
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`chat-message ${isMine(msg) ? "right" : "left"}`}
            >
              <div className="bubble">
                {!isMine(msg) && (
                  <div className="bubble-role">Tư vấn Interior Studio</div>
                )}
                <p>{msg.content}</p>
                <span className="time">
                  {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}

        <div ref={chatEndRef} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Nhập tin nhắn..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return;
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <button type="button" onClick={sendMessage}>
          Gửi
        </button>
      </div>
    </div>
  );
};

export default CustomerChatPage;
