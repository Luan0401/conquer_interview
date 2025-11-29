import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { CheckCircle, Home } from "lucide-react";
import "./index.scss";
import { updateUserStatusApi } from "../../config/authApi";

// LOẠI BỎ: Không cần import hàm API xác nhận

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderId = searchParams.get("orderId");
  const [statusTitle] = useState("THANH TOÁN THÀNH CÔNG");
  const [statusMessage] = useState(
    `Gói dịch vụ của bạn đã được kích hoạt! Hệ thống đang cập nhật tài khoản.`
  );
  const userId = parseInt(sessionStorage.getItem("userId"));

  useEffect(() => {
    if (!orderId) {
      toast.error("Thiếu Order ID. Vui lòng kiểm tra lịch sử đơn hàng.");
    }
  }, [orderId]);

  useEffect(() => {
  if (userId) {
    updateUserStatusApi(userId, true)
      .then(() => {
        console.log("Cập nhật trạng thái thành công!");
        sessionStorage.setItem("userStatus", "1");
      })
      .catch(() => {
        console.log("Lỗi cập nhật trạng thái");
      });
  }
}, [userId]);

  return (
    <div className="success-container">
      <div className="success-card">
        {/* HIỂN THỊ ICON THÀNH CÔNG NGAY LẬP TỨC */}
        <CheckCircle size={60} className="icon-success" />

        <h1 className="title">{statusTitle}</h1>

        <p className="message">{statusMessage}</p>

        {orderId && (
          <p className="order-id-display">
            Order ID: <strong>{orderId}</strong>
          </p>
        )}

        <div className="actions">
          <button
            className="btn-home"
            onClick={() => navigate("/")}
            // Không cần disabled vì không có processing
          >
            <Home size={18} style={{ marginRight: 8 }} />
            Quay về Trang chủ
          </button>
          {/* Tùy chọn: Thêm nút xem chi tiết gói */}
        </div>
      </div>
    </div>
  );
}
