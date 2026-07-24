import React, { useEffect, useState, useRef } from "react";
import { chatService } from "../../application/services";
import { notifyError } from "../../application/services/notify";

const CustomerChatManagementPage = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (selectedCustomer) fetchMessages(selectedCustomer.customerId);
  }, [selectedCustomer]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchCustomers = async () => {
    try {
      const res = await chatService.getCustomers();
      setCustomers(res.data || []);
    } catch (err) {
      console.error(err);
      notifyError("Không tải được danh sách hội thoại");
    }
  };

  const fetchMessages = async (customerId) => {
    try {
      const res = await chatService.getCustomerMessages(customerId);
      setMessages(res.data || []);
    } catch (err) {
      console.error(err);
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || !selectedCustomer || sending) return;
    setSending(true);
    setInput("");
    try {
      const res = await chatService.send({
        customerId: selectedCustomer.customerId,
        content: text,
      });
      setMessages((prev) => [...prev, res.data]);
      fetchCustomers();
    } catch (err) {
      console.error(err);
      notifyError(err.response?.data?.message || "Gửi tin nhắn thất bại");
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="staff-page">
      <h2>Chăm sóc khách</h2>
      <p className="staff-page-sub">
        Hội thoại với khách trên storefront — cùng tone Interior Studio.
      </p>

      <div className="staff-chat">
        <div className="staff-chat-list">
          <div className="staff-chat-list-head">Khách hàng</div>
          <div className="staff-chat-list-body">
            {customers.map((c) => (
              <button
                key={c.customerId}
                type="button"
                className={
                  selectedCustomer?.customerId === c.customerId
                    ? "staff-chat-person is-active"
                    : "staff-chat-person"
                }
                onClick={() => setSelectedCustomer(c)}
              >
                <span className="staff-chat-avatar">
                  {(c.customerName || "?").charAt(0)}
                </span>
                <div>
                  <strong>{c.customerName}</strong>
                  <span>{c.lastMessage || c.customerEmail}</span>
                </div>
              </button>
            ))}
            {customers.length === 0 && (
              <p className="staff-empty">Chưa có khách chat</p>
            )}
          </div>
        </div>

        <div className="staff-chat-main">
          {selectedCustomer ? (
            <>
              <div className="staff-chat-header">
                {selectedCustomer.customerName}
                <small style={{ display: "block", fontWeight: 400, opacity: 0.7 }}>
                  {selectedCustomer.customerEmail}
                </small>
              </div>
              <div className="staff-chat-messages">
                {messages.map((msg) => {
                  const isStaff = !msg.isFromCustomer;
                  const time = msg.sentAt || msg.createdAt;
                  return (
                    <div
                      key={msg.id}
                      className={
                        isStaff
                          ? "staff-bubble is-staff"
                          : "staff-bubble is-customer"
                      }
                    >
                      <div>{msg.content}</div>
                      <div className="staff-bubble-time">
                        {msg.senderName ? `${msg.senderName} · ` : ""}
                        {time
                          ? new Date(time).toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>
              <div className="staff-chat-compose">
                <input
                  type="text"
                  placeholder="Nhập tin nhắn..."
                  value={input}
                  disabled={sending}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button
                  type="button"
                  className="staff-btn staff-btn-primary"
                  onClick={sendMessage}
                  disabled={sending}
                >
                  Gửi
                </button>
              </div>
            </>
          ) : (
            <div className="staff-empty" style={{ margin: "auto" }}>
              Chọn khách để bắt đầu chat
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerChatManagementPage;
