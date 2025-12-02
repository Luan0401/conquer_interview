import React from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button } from "antd";
import { toast } from "react-toastify";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { forgotPasswordApi } from "../../config/authApi";
import "./index.scss";

function ForgotPasswordPage() {
  const navigate = useNavigate();

  const handleForgotPassword = async (values) => {
    try {
      await forgotPasswordApi({ email: values.email });
      toast.success("Email đặt lại mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư của bạn.");
      // Có thể redirect về login sau vài giây hoặc để người dùng tự quay lại
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.Message || error.response?.data?.message || "Gửi email thất bại!";
      toast.error(errorMsg);
    }
  };

  return (
    <div className="forgot-password">
      <div className="back-button" onClick={() => navigate("/login")}>
        <ArrowLeftOutlined style={{ fontSize: "28px", color: "#fff" }} />
      </div>

      <div className="forgot-password-title-wrapper">
        <h2 className="forgot-password-title">QUÊN MẬT KHẨU</h2>
      </div>

      <div className="forgot-password-page">
        <div className="forgot-password-page__content">
          <p className="description">
            Nhập email của bạn để nhận link đặt lại mật khẩu
          </p>
          <Form onFinish={handleForgotPassword} className="form" layout="vertical">
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  type: "email",
                  message: "Vui lòng nhập email hợp lệ!",
                },
              ]}
            >
              <Input placeholder="Nhập email của bạn" />
            </Form.Item>

            <div className="buttons">
              <Button type="primary" htmlType="submit" className="submit-btn">
                Gửi email
              </Button>
              <Button
                type="default"
                className="back-btn"
                onClick={() => navigate("/login")}
              >
                Quay lại đăng nhập
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;

