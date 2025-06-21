// Nhập kiểu dữ liệu Metadata từ thư viện Next.js (dùng để mô tả thông tin trang web)
import type { Metadata } from "next";
// Nhập file CSS để áp dụng style cho toàn bộ trang web
import "./globals.css";
// Nhập Link từ Next.js để tạo các liên kết chuyển trang không bị tải lại trang
import Link from "next/link";

// Định nghĩa thông tin cho trang web (title, mô tả)
export const metadata: Metadata = {
  title: "Chatbot AI", // Tiêu đề trang web
  description: "Một chatbot được tạo bằng Next.js", // Mô tả trang web
};

// Đây là component layout chính, bọc ngoài tất cả các trang con
export default function RootLayout({
  children, // children là nội dung của từng trang con sẽ được hiển thị ở đây
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Thẻ html, lang="vi" để báo cho trình duyệt biết đây là trang tiếng Việt
    <html lang="vi">
      <head>
        {/* Tiêu đề hiển thị trên tab trình duyệt */}
        <title>Chatbot AI</title>
      </head>
      <body>
        {/* site-container là khối bao ngoài toàn bộ giao diện */}
        <div className="site-container">
          {/* Phần đầu trang (header) */}
          <header className="main-header">
            <h1>
              {/* Link về trang chủ */}
              <Link href="/">Chatbot AI</Link>
            </h1>
            {/* Thanh điều hướng (menu) */}
            <nav className="main-nav">
              <ul>
                <li>
                  <Link href="/">Trang Chủ</Link>
                </li>
                <li>
                  <Link href="/about">Giới Thiệu</Link>
                </li>
                <li>
                  <Link href="/chatbot">Chatbot</Link>
                </li>
                <li>
                  <Link href="/contact">Liên Hệ</Link>
                </li>
              </ul>
            </nav>
          </header>

          {/* Phần nội dung chính, sẽ hiển thị nội dung của từng trang con */}
          <main className="main-content">{children}</main>

          {/* Phần chân trang (footer) */}
          <footer className="main-footer">
            <p>Đây là footer</p>
          </footer>
        </div>
      </body>
    </html>
  );
}