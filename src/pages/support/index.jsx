import React from "react";
import "./index.scss"; // Đảm bảo tên file SCSS là chính xác
import { FaFacebook, FaTiktok } from "react-icons/fa6";

export default function SupportPage() {
  return (
    <div className="support-wrapper">
      <h2 className="support-title">Hỗ Trợ & Liên Hệ</h2>

      <div className="support-box">
        
        {/* --- CỘT TRÁI: THÔNG TIN --- */}
        <div className="contact-info-panel">
          
          {/* Thông tin liên hệ */}
          <div className="contact-card">
            <p className="label">Thông Tin Liên Hệ</p>
            <p className="phone">0339 944 297</p>
            <p className="address">
              Tòa S102, Vinhome Grand Park, Thủ Đức, HCM
            </p>
          </div>

          {/* Mạng xã hội */}
          <div className="social-card">
            <p className="label">Theo Dõi Chúng Tôi</p>
            <div className="social-content-wrapper">
              
              <div className="social-item">
                <FaFacebook className="social-icon facebook" />
                <img
                  src="/image/fanpage.png"
                  alt="QR Facebook"
                  className="qr-code"
                />
              </div>
              
              <div className="social-item">
                <FaTiktok className="social-icon tiktok" />
                <img
                  src="/image/ConquerInterview.png"
                  alt="QR Tiktok"
                  className="qr-code"
                />
              </div>

            </div>
          </div>
        </div>

        {/* --- CỘT PHẢI: FAQ (NỘI DUNG MỚI) --- */}
        <div className="faq-panel">
          <h3 className="faq-title">Câu Hỏi Thường Gặp</h3>

          {/* Dùng <details> để tạo accordion đơn giản */}
          <details className="faq-item">
            <summary className="faq-question">
              AI phỏng vấn có đánh giá chính xác không?
            </summary>
            <p className="faq-answer">
              Mô hình AI của chúng tôi được huấn luyện trên hàng triệu bộ dữ liệu, có khả năng phân tích đa chiều từ nội dung, ngữ điệu giọng nói đến ngôn ngữ cơ thể (nếu bạn bật camera). AI đưa ra gợi ý khách quan để bạn cải thiện.
            </p>
          </details>

          <details className="faq-item">
            <summary className="faq-question">
              Tôi có thể xem lại lịch sử các buổi phỏng vấn không?
            </summary>
            <p className="faq-answer">
              Tất cả các buổi luyện tập của bạn đều được lưu lại trong trang "Lịch sử". Với tài khoản Premium, bạn có thể xem lại phân tích chi tiết và báo cáo tiến độ theo thời gian.
            </p>
          </details>

          <details className="faq-item">
            <summary className="faq-question">
              Làm thế nào để nâng cấp lên gói Premium?
            </summary>
            <p className="faq-answer">
              Bạn có thể truy cập trang "Gói Dịch Vụ" từ thanh điều hướng. Chúng tôi hỗ trợ thanh toán tiện lợi qua MoMo và các cổng thanh toán nội địa khác. Tài khoản của bạn sẽ được kích hoạt ngay lập B_TỨC.
            </p>
          </details>

          <details className="faq-item">
            <summary className="faq-question">
              Gói miễn phí có bị giới hạn những gì?
            </summary>
            <p className="faq-answer">
              Gói miễn phí cho phép bạn trải nghiệm 3 lượt phỏng vấn cơ bản. Các tính năng nâng cao như câu hỏi chuyên sâu, phân tích giọng nói, lộ trình cá nhân... sẽ yêu cầu gói Premium.
            </p>
          </details>

        </div>

      </div>
    </div>
  );
}