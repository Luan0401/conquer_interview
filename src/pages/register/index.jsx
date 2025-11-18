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
  // Lấy form instance để có thể set lỗi một cách chủ động
  const [form] = Form.useForm(); 

  const handleRegister = async (values) => {
    try {
      const formattedDate = values.dateOfBirth
        ? values.dateOfBirth.format("YYYY-MM-DD")
        : null;

      await api.post("Auth/register", {
        username: values.username,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        fullName: values.fullName,
        phoneNumber: values.phoneNumber,
        dateOfBirth: formattedDate,
        gender: values.gender,
        avatarUrl: values.avatarUrl,
      });

      toast.success("🎉 Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login");

    } catch (error) {
      // ---- BẮT ĐẦU KHỐI XỬ LÝ LỖI ----
      if (error.response?.data?.errors) {
        // 1. Lỗi là validation (có cấu trúc "errors")
        const validationErrors = error.response.data.errors;
        
        // 2. Chuyển đổi object lỗi từ backend thành mảng mà antd hiểu được
        const errorList = Object.keys(validationErrors).map((field) => ({
          // Chuyển "Password" -> "password" để khớp với `name` của Form.Item
          name: field.charAt(0).toLowerCase() + field.slice(1),
          // Lấy ra các thông báo lỗi (ví dụ: ["lỗi 1", "lỗi 2"])
          errors: validationErrors[field], 
        }));
        
        // 3. Hiển thị lỗi ngay trên form
        form.setFields(errorList); 
        toast.error("Vui lòng kiểm tra lại các thông tin đã nhập!");

      } else {
        // Các trường hợp lỗi khác (mạng, server 500,...)
        const errorMsg = error.response?.data?.message || "Đăng ký thất bại!";
        toast.error(`⚠️ ${errorMsg}`);
      }
      // ---- KẾT THÚC KHỐI XỬ LÝ LỖI ----
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
          {/* Kết nối form instance vào thẻ <Form> */}
          <Form form={form} onFinish={handleRegister} className="form" layout="vertical">
            {/* Các Form.Item của bạn đã rất tốt và không cần thay đổi */}
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