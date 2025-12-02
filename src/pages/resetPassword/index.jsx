import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Form, Input, Button } from "antd";
import { toast } from "react-toastify";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { resetPasswordApi } from "../../config/authApi";
import "./index.scss";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState("");

  useEffect(() => {
    // Lấy token từ URL query parameter
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      toast.error("Token không hợp lệ hoặc đã hết hạn!");
      setTimeout(() => {
        navigate("/forgot-password");
      }, 2000);
    }
  }, [searchParams, navigate]);

  const handleResetPassword = async (values) => {
    if (!token) {
      toast.error("Token không hợp lệ!");
      return;
    }

    try {
      await resetPasswordApi({
        token: token,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      toast.success("Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      const errorMsg = error.response?.data?.Message || error.response?.data?.message || "Đặt lại mật khẩu thất bại!";
      toast.error(errorMsg);
    }
  };

  return (
    <div className="reset-password">
      <div className="back-button" onClick={() => navigate("/login")}>
        <ArrowLeftOutlined style={{ fontSize: "28px", color: "#fff" }} />
      </div>

      <div className="reset-password-title-wrapper">
        <h2 className="reset-password-title">ĐẶT LẠI MẬT KHẨU</h2>
      </div>

      <div className="reset-password-page">
        <div className="reset-password-page__content">
          <p className="description">
            Vui lòng nhập mật khẩu mới của bạn
          </p>
          {token ? (
            <Form onFinish={handleResetPassword} className="form" layout="vertical">
              <Form.Item
                label="Mật khẩu mới"
                name="newPassword"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                  { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
                ]}
              >
                <Input.Password placeholder="Nhập mật khẩu mới" />
              </Form.Item>

              <Form.Item
                label="Xác nhận mật khẩu"
                name="confirmPassword"
                dependencies={["newPassword"]}
                rules={[
                  { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject("Mật khẩu không khớp!");
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Xác nhận mật khẩu mới" />
              </Form.Item>

              <div className="buttons">
                <Button type="primary" htmlType="submit" className="submit-btn">
                  Đặt lại mật khẩu
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
          ) : (
            <div className="loading-message">
              <p>Đang kiểm tra token...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;

