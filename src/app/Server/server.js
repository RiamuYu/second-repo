// Nhập các thư viện cần thiết
const express = require('express'); // Thư viện tạo server web
const cors = require('cors'); // Cho phép website gọi API từ địa chỉ khác
const path = require('path'); // Thư viện xử lý đường dẫn file
require('dotenv').config(); // Đọc file .env để lấy các thông tin cấu hình
const { OpenAI } = require('openai'); // Thư viện gọi API của OpenAI

// Cấu hình model AI - Bạn có thể thay đổi model ở đây
const AI_CONFIG = {
    // Các model có sẵn (có thể thay đổi model bằng cách sửa MODEL_NAME):
    // 1. GPT-4 (chất lượng tốt nhất):
    //    - gpt-4
    //    - gpt-4-turbo-preview
    //    - gpt-4-0125-preview
    // 2. GPT-3.5 (cân bằng giữa chất lượng và chi phí):
    //    - gpt-3.5-turbo
    //    - gpt-3.5-turbo-16k (cho phép đoạn chat dài hơn)
    //    - gpt-3.5-turbo-0125
    MODEL_NAME: 'gpt-4', // Sử dụng GPT-4 để có chất lượng tốt nhất
    DISPLAY_NAME: 'GPT-4o', // Tên hiển thị trong giao diện
    TEMPERATURE: 0.7, // Độ sáng tạo trong câu trả lời (0-1)
    MAX_TOKENS: 1000 // Độ dài tối đa của câu trả lời
};

// Tạo ứng dụng express
const app = express();

// Cài đặt middleware (phần mềm trung gian)
app.use(cors()); // Cho phép truy cập từ các trang web khác
app.use(express.json()); // Cho phép nhận dữ liệu dạng JSON

// Phục vụ các file tĩnh từ thư mục client
app.use(express.static(path.join(__dirname, '../client')));

// Đường dẫn mặc định trả về file index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

// API để lấy thông tin cấu hình
app.get('/api/config', (req, res) => {
    res.json({
        displayName: AI_CONFIG.DISPLAY_NAME
    });
});

// Kiểm tra xem có API key trong file .env không
if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY không được tìm thấy trong file .env');
    process.exit(1); // Dừng chương trình nếu không có API key
}

// Cấu hình OpenAI API - Cách làm đúng cho phiên bản mới
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Xử lý yêu cầu chat từ người dùng
app.post('/api/chat', async (req, res) => {
    try {
        // Lấy danh sách tin nhắn từ yêu cầu
        const { messages } = req.body;
        
        // Kiểm tra xem messages có hợp lệ không
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Messages không hợp lệ' });
        }

        // Gửi yêu cầu đến OpenAI API
        const response = await openai.chat.completions.create({
            model: AI_CONFIG.MODEL_NAME, // Sử dụng model từ cấu hình
            messages: messages, // Danh sách các tin nhắn
            temperature: AI_CONFIG.TEMPERATURE, // Độ sáng tạo từ cấu hình
            max_tokens: AI_CONFIG.MAX_TOKENS // Độ dài tối đa từ cấu hình
        });
        
        // Trả về kết quả cho người dùng
        res.json(response);
    } catch (error) {
        // Xử lý lỗi nếu có
        console.error('Error:', error);
        res.status(500).json({ 
            error: 'Lỗi server', 
            details: error.message
        });
    }
});

// API kiểm tra server có hoạt động không
app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
});

// Khởi động server
const PORT = process.env.PORT || 3000; // Lấy số cổng từ file .env hoặc dùng 3000
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
    console.log(`Đang sử dụng model: ${AI_CONFIG.MODEL_NAME} (Hiển thị như: ${AI_CONFIG.DISPLAY_NAME})`);
}); 
// Trong server.js (KHÔNG NÊN dùng cho sản phẩm thật)
app.get('/api/show-key', (req, res) => {
    res.json({ key: process.env.OPENAI_API_KEY });
  });