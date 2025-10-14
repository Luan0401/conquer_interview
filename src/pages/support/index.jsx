import React from "react";
import "./index.scss";
import { FaFacebook } from "react-icons/fa";
import { FaTiktok } from "react-icons/fa6";

export default function SupportPage() {
  return (
    <div className="support-wrapper">
      <h2 className="support-title">Thông tin liên hệ</h2>

      <div className="support-box">
        {/* Thông tin liên hệ */}
        <div className="contact-card">
          <p className="label">THÔNG TIN LIÊN HỆ :</p>
          <p className="phone">0339944297</p>
          <p className="address">
            ĐỊA CHỈ : TÒA S102, VINHOME GRAND PARK, THỦ ĐỨC, HCM
          </p>
        </div>

        {/* Fanpage */}
        <div className="fanpage-card">
          <p className="label">FANPAGE THÔNG TIN LIÊN HỆ</p>
          <div className="fanpage-content">
            <FaTiktok className="tt-icon" />
            <img
              src="/image/ConquerInterview.png"
              alt="QR Code"
              className="qr-code"
            />
          </div>
        </div>

          {/* Fanpage */}
        <div className="fanpage-card">
          <p className="label">FANPAGE THÔNG TIN LIÊN HỆ</p>
          <div className="fanpage-content">
            <FaFacebook className="fb-icon" />
            <img
              src="/image/fanpage.png"
              alt="QR Code"
              className="qr-code"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
