"use client"; // Dòng này báo cho Next.js biết đây là component phía client (trình duyệt)

// Nhập các hàm và hook cần thiết từ React
import React, { useState, useEffect, useRef } from "react";
import { callBotApi } from "./botApiService";
import { Message } from "./types";

// Đây là component giao diện trang Chatbot
export default function ChatbotPage() {
  // Tạo biến trạng thái để lưu các tin nhắn, mặc định có 1 tin nhắn AI giới thiệu
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "assistant",
      content:
        "Xin chào! Tôi là Chatbot AI. Tôi có thể giúp bạn trả lời câu hỏi, trò chuyện, hoặc hỗ trợ bạn về nhiều chủ đề khác nhau. Hãy thử hỏi tôi bất cứ điều gì nhé!",
    },
  ]);
  // Biến trạng thái cho nội dung ô nhập liệu
  const [input, setInput] = useState("");
  // Biến trạng thái để biết AI đang trả lời hay không
  const [isLoading, setIsLoading] = useState(false);
  // Tạo tham chiếu đến cuối danh sách tin nhắn để tự động cuộn xuống
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hàm cuộn xuống cuối cùng mỗi khi có tin nhắn mới
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Mỗi khi messages thay đổi, tự động cuộn xuống cuối
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Hàm xử lý khi người dùng gửi tin nhắn
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Tạo tin nhắn mới của người dùng
    const userMessage: Message = { sender: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Gọi API mới qua service
      const aiContent = await callBotApi(input, messages); // Không truyền image
      const aiMessage: Message = { sender: "assistant", content: aiContent };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Failed to get AI response:", error);
      const errorMessage: Message = {
        sender: "assistant",
        content: "Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      {/* Tiêu đề của khung chat */}
      <div className="chat-header">Trò chuyện với AI</div>
      {/* Khu vực hiển thị các tin nhắn */}
      <div className="chat-messages" id="chat-messages">
        {/* Duyệt qua từng tin nhắn và hiển thị ra màn hình */}
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.sender === "user" ? "user" : "ai"}`}>
            {msg.content}
          </div>
        ))}
        {/* Nếu AI đang trả lời thì hiển thị dấu ... */}
        {isLoading && (
          <div className="message ai">
            <span className="typing-indicator">...</span>
          </div>
        )}
        {/* Thẻ này để cuộn xuống cuối khi có tin nhắn mới */}
        <div ref={messagesEndRef} />
      </div>
      {/* Ô nhập tin nhắn và nút gửi */}
      <form className="chat-input" id="chat-form" onSubmit={handleSubmit}>
        <textarea
          placeholder="Nhập tin nhắn..."
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            // Nhấn Enter để gửi tin nhắn (không cần Shift)
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          disabled={isLoading} // Khi AI đang trả lời thì không cho nhập tiếp
        ></textarea>
        <button type="submit" disabled={isLoading}>
          Gửi
        </button>
      </form>
    </div>
  );
} 