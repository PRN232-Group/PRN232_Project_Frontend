import React, { useEffect, useState, useRef } from "react";
import { chatService } from "../../application/services";

const CustomerChatManagementPage = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (selectedCustomer) fetchMessages(selectedCustomer.id);
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
    }
  };

  const fetchMessages = async (customerId) => {
    try {
      const res = await chatService.getCustomerMessages(customerId);
      setMessages(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedCustomer) return;
    const text = input.trim();
    const newMsg = {
      sender: "staff",
      content: text,
      time: new Date().toISOString(),
    };
    try {
      setMessages((prev) => [...prev, newMsg]);
      setInput("");
      await chatService.send({
        customerId: selectedCustomer.id,
        content: text,
      });
    } catch (err) {
      console.error(err);
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
                key={c.id}
                type="button"
                className={
                  selectedCustomer?.id === c.id
                    ? "staff-chat-person is-active"
                    : "staff-chat-person"
                }
                onClick={() => setSelectedCustomer(c)}
              >
                <span className="staff-chat-avatar">
                  {(c.name || "?").charAt(0)}
                </span>
                <div>
                  <strong>{c.name}</strong>
                  <span>{c.email}</span>
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
              <div className="staff-chat-header">{selectedCustomer.name}</div>
              <div className="staff-chat-messages">
                {messages.map((msg, index) => {
                  const isStaff =
                    msg.sender === "staff" ||
                    msg.senderRole === "Sales" ||
                    msg.senderRole === "staff";
                  return (
                    <div
                      key={index}
                      className={
                        isStaff
                          ? "staff-bubble is-staff"
                          : "staff-bubble is-customer"
                      }
                    >
                      <div>{msg.content || msg.message}</div>
                      <div className="staff-bubble-time">
                        {msg.time
                          ? new Date(msg.time).toLocaleTimeString("vi-VN", {
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
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button
                  type="button"
                  className="staff-btn staff-btn-primary"
                  onClick={sendMessage}
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
