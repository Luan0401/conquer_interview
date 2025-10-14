import React, { useEffect, useState } from "react";
import "./index.scss";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

export default function PricingPage() {
  const navigate = useNavigate();
  const [prices, setPrices] = useState({ free: 0, premium: 0 });

  // Gọi API lấy giá gói
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
      <h2 className="pricing-title">Gói đăng ký</h2>
      <div className="pricing-cards">
        <div className="pricing-card premium">
          <h3>Cao cấp</h3>
          <ul>
            <li>✔ Được chat trực tiếp với AI Agent.</li>
            <li>✔ Phỏng vấn với các câu hỏi từ cơ bản đến nâng cao.</li>
            <li>✔ Xem báo cáo sau buổi luyện tập.</li>
            <li>✔ Lịch sử luyện tập được lưu trữ.</li>
            <li>✔ Lộ trình luyện tập riêng biệt.</li>
          </ul>
          <p className="price">{prices.premium.toLocaleString()}đ / tháng</p>
          <button className="btn-premium" onClick={handlePremiumPayment}>
            ĐĂNG KÍ GÓI NGAY
          </button>
        </div>

        <div className="pricing-card free">
          <h3>Miễn phí</h3>
          <ul>
            <li>✔ Phỏng vấn với các câu hỏi cơ bản.</li>
            <li>✔ Xem báo cáo sau buổi luyện tập.</li>
            <li>✔ Giới hạn 3 lần sử dụng.</li>
          </ul>
          <p className="price">{prices.free.toLocaleString()}đ / tháng</p>
          <button className="btn-free" onClick={handleFreeTrial}>
            DÙNG THỬ MIỄN PHÍ
          </button>
        </div>
      </div>
    </div>
  );
}
