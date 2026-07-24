import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/customer/customerChatPage.css";
import { chatService } from "../../application/services";
import { notifyError } from "../../application/services/notify";
import UserContext from "../../contexts/UserContext";

const WELCOME = {
  id: "welcome",
  content:
    "Xin chào! Interior Studio có thể tư vấn sản phẩm, báo giá hoặc thiết kế giúp bạn.",
  sentAt: new Date().toISOString(),
  isFromCustomer: false,
  senderName: "Interior Studio",
};

const CustomerChatPage = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true, state: { from: "/chat" } });
      return;
    }
    fetchMessages();
  }, [user, navigate]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await chatService.getMessages();
      const list = res.data || [];
      setMessages(list.length ? list : [WELCOME]);
    } catch {
      notifyError("Không tải được hội thoại");
      setMessages([WELCOME]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setSending(true);
    setInput("");
    try {
      const res = await chatService.send({ content: text });
      const saved = res.data;
      setMessages((prev) => {
        const withoutWelcome = prev.filter((m) => m.id !== "welcome");
        return [...withoutWelcome, saved];
      });
    } catch (err) {
      console.error(err);
      notifyError(err.response?.data?.message || "Gửi tin nhắn thất bại");
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  if (!user) return null;

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
          messages.map((msg) => {
            const mine = !!msg.isFromCustomer;
            const time = msg.sentAt || msg.createdAt;
            return (
              <div
                key={msg.id}
                className={`chat-message ${mine ? "right" : "left"}`}
              >
                <div className="bubble">
                  {!mine && (
                    <div className="bubble-role">
                      {msg.senderName || "Tư vấn Interior Studio"}
                    </div>
                  )}
                  <p>{msg.content}</p>
                  <span className="time">
                    {time
                      ? new Date(time).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </span>
                </div>
              </div>
            );
          })}
        <div ref={chatEndRef} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Nhập tin nhắn..."
          value={input}
          disabled={sending}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button type="button" onClick={sendMessage} disabled={sending}>
          Gửi
        </button>
      </div>
      <p className="chat-hint">
        Xem thêm <Link to="/products">Sản phẩm</Link> ·{" "}
        <Link to="/my-design-requests">Yêu cầu thiết kế</Link>
      </p>
    </div>
  );
};

export default CustomerChatPage;
