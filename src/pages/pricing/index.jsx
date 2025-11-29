import React, { useEffect, useState } from "react";
import "./index.scss"; // Tên file SCSS của bạn
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { CheckCircleOutlined } from "@ant-design/icons"; // Dùng icon cho đẹp
import { getSubscriptionPlansApi, createPaymentLinkApi, createOrderApi } from "../../config/authApi";

export default function PricingPage() {
  const navigate = useNavigate();
  const [prices, setPrices] = useState({ free: 0, premium: 0 });
  const currentUserId = parseInt(sessionStorage.getItem('userId') || '0');
  const isAuthenticated = currentUserId !== 0;
  const DEFAULT_PLAN_ID = 1;
  
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await getSubscriptionPlansApi();
        
        // Lấy mảng dữ liệu từ trường 'data' trong JSON API
        const planList = res.data.data; 
        
        if (planList && planList.length > 0) {
          // 1. TÌM GÓI PREMIUM CHÍNH XÁC
          // Tìm phần tử có planName là "Premium"
          const premiumPackage = planList.find((p) => p.planName === "Premium");
          
          setPrices({
            free: 0, // Gói Free luôn là 0đ (không cần xử lý từ JSON)
            // 2. GÁN GIÁ PREMIUM
            // Lấy giá nếu tìm thấy gói Premium, nếu không tìm thấy thì gán 0
            premium: premiumPackage?.price || 0,
          });
        }
      } catch (error) {
        console.error("Lỗi khi lấy giá gói:", error);
        // Toast.error nên sử dụng lỗi cụ thể hơn nếu có
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
    if (!isAuthenticated) {
      toast.warn("Vui lòng đăng nhập để thực hiện nâng cấp gói.");
      navigate('/login');
      return;
    }

    let toastId = toast.loading("Đang khởi tạo đơn hàng và liên kết thanh toán...");

    try {
      // 1. GỌI API TẠO ĐƠN HÀNG (/api/Order)
      const orderResponse = await createOrderApi(currentUserId, DEFAULT_PLAN_ID);
      const orderData = orderResponse.data.data;
      const orderId = orderData.orderId;
      
      if (!orderId) {
        toast.update(toastId, { render: "Lỗi: Không nhận được Order ID.", type: "error", isLoading: false, autoClose: 3000 });
        return;
      }

      // 2. TẠO CÁC URL QUAN TRỌNG
      // Giả định tên miền FrontEnd của bạn là http://localhost:5173
      const baseUrl = window.location.origin;
      const returnUrl = `${baseUrl}/payment-success?orderId=${orderId}`; 
      const cancelUrl = `${baseUrl}/payment-failure?orderId=${orderId}`; 

      // 3. GỌI API TẠO LIÊN KẾT THANH TOÁN (/api/Payment/create-link)
      const paymentLinkResponse = await createPaymentLinkApi(orderId, returnUrl, cancelUrl);
      
      // SỬA LỖI: Thay 'payUrl' thành 'paymentUrl' theo phản hồi API thực tế
      const payUrl = paymentLinkResponse.data.data.paymentUrl; 

      if (payUrl) {
        toast.update(toastId, { render: "Đang chuyển hướng đến cổng thanh toán...", type: "info", isLoading: false, autoClose: 3000 });
        window.location.href = payUrl; 
      } else {
        toast.update(toastId, { render: "Không thể tạo liên kết thanh toán.", type: "error", isLoading: false, autoClose: 3000 });
      }

    } catch (error) {
      console.error("Lỗi quy trình thanh toán:", error.response ? error.response.data : error.message);
      toast.update(toastId, { render: "Lỗi hệ thống khi tạo thanh toán.", type: "error", isLoading: false, autoClose: 3000 });
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