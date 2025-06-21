// Định nghĩa kiểu cho nội dung tin nhắn (text hoặc image)
export type MessageContent =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string; detail?: string } };

// Định nghĩa kiểu cho một tin nhắn trong lịch sử chat
export interface Message {
  sender: 'user' | 'assistant'; // Ai gửi tin nhắn
  content: string;              // Nội dung tin nhắn (text)
  image?: string;               // (Tùy chọn) URL ảnh nếu có
} 