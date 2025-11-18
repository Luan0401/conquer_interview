import React, { useEffect, useState } from "react";
import "./index.scss"; // Tên file SCSS của bạn
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { CheckCircleOutlined } from "@ant-design/icons"; // Dùng icon cho đẹp

export default function PricingPage() {
  const navigate = useNavigate();
  const [prices, setPrices] = useState({ free: 0, premium: 0 });

  // ... (Phần useEffect và functions giữ nguyên) ...
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/subscription");
        if (res.data && res.data.length > 0) {
          const freePackage = res.data.find((p) => p.name === "Miễn phí");
          const premiumPackage = res.data.find((p) => p.name === "Cao cấp");
          setPrices({
            free: freePackage?.price || 0,
            premium: premiumPackage?.price || 0,
          });
        }
      } catch (error) {
        console.error("Lỗi khi lấy giá gói:", error);
        toast.error("Không thể tải giá gói đăng ký!");
      }
    };
    fetchPrices();
  }, []);

  const handleFreeTrial = () => {
    toast.info("Bạn đang dùng gói miễn phí!");
    navigate("/");
  };

  const handlePremiumPayment = async () => {
    try {
      const response = await axios.post("http://localhost:8080/api/payment/momo", {
        amount: prices.premium,
        description: "Thanh toán gói Cao cấp",
      });
      if (response.data && response.data.payUrl) {
        window.location.href = response.data.payUrl;
      } else {
        toast.error("Không thể tạo liên kết thanh toán MoMo.");
      }
    } catch (error) {
      console.error("Lỗi khi tạo thanh toán MoMo:", error);
      toast.error("Đã xảy ra lỗi khi kết nối MoMo.");
    }
  };


  return (
    <div className="pricing-container">
      <h2 className="pricing-title">Lựa Chọn Gói Dịch Vụ Phù Hợp</h2>
      <p className="pricing-subtitle">
        Bắt đầu miễn phí, sau đó nâng cấp để khai phá toàn bộ sức mạnh của AI.
      </p>

      <div className="pricing-cards">
        
        {/* === THẺ CAO CẤP (Nổi bật) === */}
        <div className="pricing-card premium">
          <div className="card-badge">Phổ biến nhất</div>
          <h3>Cao cấp (Premium)</h3>
          
          {/* Cấu trúc giá mới */}
          <div className="price-wrapper">
            <span className="amount">{prices.premium.toLocaleString()}đ</span>
            <span className="duration">/ tháng</span>
          </div>
          
          <p className="card-description">
            Toàn bộ tính năng, không giới hạn, dành cho người muốn chinh phục mọi cuộc phỏng vấn.
          </p>
          
          <button className="btn-premium" onClick={handlePremiumPayment}>
            Nâng Cấp Ngay
          </button>
          
          <ul className="features-list">
            <li><CheckCircleOutlined /> <strong>Không giới hạn</strong> lượt luyện tập</li>
            <li><CheckCircleOutlined /> Mở khoá ngân hàng câu hỏi <strong>chuyên sâu & nâng cao</strong></li>
            <li><CheckCircleOutlined /> <strong>Hội thoại trực tiếp</strong> với AI Agent thông minh</li>
            <li><CheckCircleOutlined /> Nhận <strong>phân tích chi tiết</strong> & báo cáo hiệu suất</li>
            <li><CheckCircleOutlined /> Lưu trữ lịch sử & <strong>theo dõi lộ trình tiến bộ</strong></li>
          </ul>
        </div>

        {/* === THẺ MIỄN PHÍ === */}
        <div className="pricing-card free">
          <h3>Miễn phí (Free)</h3>
          
          {/* Cấu trúc giá mới */}
          <div className="price-wrapper">
            <span className="amount">{prices.free.toLocaleString()}đ</span>
            <span className="duration">/ tháng</span>
          </div>

          <p className="card-description">
            Trải nghiệm các tính năng cơ bản của mô phỏng phỏng vấn AI.
          </p>
          
          <button className="btn-free" onClick={handleFreeTrial}>
            Bắt Đầu Miễn Phí
          </button>
          
          <ul className="features-list">
            <li><CheckCircleOutlined /> <strong>Giới hạn 3 lượt</strong> luyện tập</li>
            <li><CheckCircleOutlined /> Truy cập câu hỏi phỏng vấn <strong>cơ bản</strong></li>
            <li><CheckCircleOutlined /> Xem <strong>báo cáo tổng quan</strong> sau luyện tập</li>
            <li><CheckCircleOutlined /> Trải nghiệm mô phỏng phỏng vấn AI</li>
          </ul>
        </div>
        
      </div>
    </div>
  );
}