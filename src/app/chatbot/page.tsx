"use client"; // Dòng này báo cho Next.js biết đây là component phía client (trình duyệt)

// Nhập các hàm và hook cần thiết từ React
import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import { callBotApi } from "./botApiService";
import { Message } from "./types";
import { FaPaperclip } from "react-icons/fa"; // Thêm icon cho nút gửi tệp

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
  // Thêm biến trạng thái để lưu ảnh người dùng chọn (dạng base64 hoặc null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Hàm cuộn xuống cuối cùng mỗi khi có tin nhắn mới
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Mỗi khi messages thay đổi, tự động cuộn xuống cuối
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Hàm xử lý khi người dùng chọn ảnh
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0]; // Lấy file đầu tiên nếu có
    if (file) {
      const reader = new FileReader(); // Tạo đối tượng đọc file
      // Khi đọc file xong thì lưu vào state
      reader.onloadend = () => {
        setSelectedImage(reader.result as string); // Lưu base64 vào selectedImage
      };
      reader.readAsDataURL(file); // Đọc file thành base64
    }
  };

  // Hàm xử lý khi người dùng gửi tin nhắn
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Tạo tin nhắn mới của người dùng, nếu có ảnh thì thêm vào
    const userMessage: Message = selectedImage
      ? { sender: "user", content: input, image: selectedImage }
      : { sender: "user", content: input };
    const newMessages: Message[] = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Gọi API, nếu có ảnh thì truyền vào
      const aiContent = await callBotApi(input, messages, selectedImage);
      // Đảm bảo đúng kiểu dữ liệu Message cho AI trả lời
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
      setSelectedImage(null); // Sau khi gửi thì xóa ảnh đã chọn
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
            {/* Nếu tin nhắn có ảnh thì hiển thị ảnh */}
            {msg.image && (
              <img
                src={msg.image}
                alt="Hình ảnh người dùng gửi"
                style={{ maxWidth: 120, maxHeight: 120, display: "block", marginBottom: 6, borderRadius: 8 }}
              />
            )}
            {/* Hiển thị nội dung tin nhắn */}
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
        {/* Nút gửi tệp ảnh: dùng label để trang trí, input file sẽ bị ẩn */}
        <label
          htmlFor="file-upload"
          className="file-upload-label"
        >
          <FaPaperclip style={{ marginRight: 6 }} />
          Gửi ảnh
          {/* Input file bị ẩn, chỉ hiện label đẹp */}
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={isLoading}
            style={{ display: "none" }}
          />
        </label>
        {/* Nếu đã chọn ảnh thì hiển thị ảnh nhỏ để xem trước */}
        {selectedImage && (
          <img
            src={selectedImage}
            alt="Ảnh đã chọn"
            style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 6, marginRight: 8 }}
          />
        )}
        {/* Ô nhập tin nhắn */}
        <textarea
          placeholder="Nhập tin nhắn..."
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          disabled={isLoading}
        ></textarea>
        <button type="submit" disabled={isLoading}>
          Gửi
        </button>
      </form>
    </div>
  );
} 