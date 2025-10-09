import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, DatePicker, Select } from "antd";
import { toast } from "react-toastify";
import {
  GoogleOutlined,
  FacebookOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import api from "../../config/api";
import "./index.scss";
const { Option } = Select;

function RegisterPage() {
  const navigate = useNavigate();
  const handleRegister = async (values) => {
    console.log("Register values:", values);
    try {
     const formattedDate = values.dateOfBirth
  ? values.dateOfBirth.format("YYYY-MM-DD")
  : null;
    console.log("date object:", formattedDate);
    
      const response = await api.post(
        "Auth/register",
        {
          username: values.username,
          email: values.email,
          password: values.password,
          confirmPassword: values.confirmPassword,
          fullName: values.fullName,
          phoneNumber: values.phoneNumber,
          dateOfBirth: formattedDate,
          gender: values.gender,
          avatarUrl: values.avatarUrl,
        })

        
        console.log("Register response:", response);

      const { status, data } = response;
      if (status === 200 && data?.data) {
      toast.success("🎉 Đăng ký thành công!");
      navigate("/login");
    } else {
      // Trường hợp BE trả về nhưng không có data hợp lệ
      const message = data?.message || "Đăng ký thất bại!";
      toast.error(`⚠️ ${message}`);
      console.error("⚠️ Unexpected response:", response);
    }
  } catch (error) {
    console.error("❌ Register error:", error);

    // 👉 Xử lý lỗi cụ thể từ BE
    if (error.response) {
      const { status, data } = error.response;

      console.log("🔴 Error response:", error.response);

      // ⚠️ 409 - Trùng username hoặc email
      if (status === 409) {
        const msg = data?.message || "Tên đăng nhập hoặc email đã tồn tại!";
        toast.error(`⚠️ ${msg}`);
      }
      // ⚠️ 400 - Dữ liệu không hợp lệ
      else if (status === 400) {
        const msg = data?.message || "Dữ liệu không hợp lệ!";
        toast.error(`⚠️ ${msg}`);
      }
      // ⚠️ 500 - Lỗi server
      else if (status >= 500) {
        toast.error("🚨 Lỗi máy chủ. Vui lòng thử lại sau!");
      }
      // ⚠️ Trường hợp khác
      else {
        const msg = data?.message || "Đăng ký thất bại!";
        toast.error(`⚠️ ${msg}`);
      }
    } else if (error.request) {
      // ⚠️ Không có phản hồi từ server
      console.error("🕓 No response received:", error.request);
      toast.error("Không thể kết nối tới máy chủ. Vui lòng kiểm tra mạng!");
    } else {
      // ⚠️ Lỗi khác (ví dụ bug JS)
      toast.error(`Lỗi không xác định: ${error.message}`);
    }
  }
};

  return (
    <div className="register">
      <div className="back-button" onClick={() => navigate("/")}>
        <ArrowLeftOutlined style={{ fontSize: "28px", color: "#fff" }} />
      </div>

      <div className="register-title-wrapper">
        <h2 className="register-title">CONQUER INTERVIEW</h2>
      </div>

      <div className="register-page">
        <div className="register-page__content">
          <Form onFinish={handleRegister} className="form" layout="vertical">
            <Form.Item
              label="Tên đăng nhập"
              name="username"
              rules={[
                { required: true, message: "Vui lòng nhập tên đăng nhập!" },
              ]}
            >
              <Input placeholder="Nhập tên đăng nhập" />
            </Form.Item>

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
              <Input placeholder="Nhập email" />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            >
              <Input type="password" placeholder="Nhập mật khẩu" />
            </Form.Item>

            <Form.Item
              label="Xác nhận mật khẩu"
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject("Mật khẩu không khớp!");
                  },
                }),
              ]}
            >
              <Input type="password" placeholder="Xác nhận mật khẩu" />
            </Form.Item>

            <Form.Item
              label="Họ và tên"
              name="fullName"
              rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
            >
              <Input placeholder="Nhập họ và tên" />
            </Form.Item>

            <Form.Item
              label="Số điện thoại"
              name="phoneNumber"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại!" },
              ]}
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>

            <Form.Item
              label="Ngày sinh"
              name="dateOfBirth"
              rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}
            >
              <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              label="Giới tính"
              name="gender"
              rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
            >
              <Select placeholder="Chọn giới tính">
                <Option value="male">Nam</Option>
                <Option value="female">Nữ</Option>
                <Option value="other">Khác</Option>
              </Select>
            </Form.Item>

            <Form.Item label="Ảnh đại diện (URL)" name="avatarUrl">
              <Input placeholder="Nhập link ảnh đại diện" />
            </Form.Item>

            <div className="buttons">
              <Button type="primary" htmlType="submit" className="register-btn">
                Đăng ký
              </Button>
              <Button type="default" className="login-btn">
                <Link to="/login">Đăng nhập</Link>
              </Button>
            </div>
          </Form>

          {/* Social Login */}
          <div className="social-login">
            <GoogleOutlined
              style={{ fontSize: "24px", marginRight: "12px", color: "red" }}
            />
            <FacebookOutlined style={{ fontSize: "24px", color: "#1877F2" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
