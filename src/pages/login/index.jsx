import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../redux/userSlice";
import { Form, Input, Button } from "antd";
import { toast } from "react-toastify";
import {
  GoogleOutlined,
  FacebookOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import {loginApi} from "../../config/authApi";

import "./index.scss";

function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (values) => {
    try {
      const response = await loginApi(values);
      const { accessToken, user } = response.data.data;

      sessionStorage.setItem("token", accessToken);
      sessionStorage.setItem("user", JSON.stringify(user));
      sessionStorage.setItem("userStatus", user.status);
      dispatch(
        login({
          accountID: user.userId,
          fullName: user.fullName,
          email: user.email,
          roleName: user.roles,
          phomeNumber: user.phoneNumber,
          dateOfBirth: user.dateOfBirth,
          avatarUrl: user.avatarUrl,
        })
      );

      toast.success("Đăng nhập thành công");
      navigate("/"); 
    } catch (error) {
      const errorMsg = error.response?.data?.Message || "Đăng nhập thất bại";
      toast.error(errorMsg);
    }
  };

  return (
    <div className="login">
      <div className="back-button" onClick={() => navigate("/")}>
        <ArrowLeftOutlined style={{ fontSize: "28px", color: "#fff" }} />
      </div>

      <div className="login-title-wrapper">
        <h2 className="login-title">CONQUER INTERVIEW</h2>
      </div>

      <div className="login-page">
        <div className="login-page__content">
          <Form onFinish={handleLogin} className="form" layout="vertical">
            <Form.Item
              label="Tên đăng nhập"
              name="userName"
              rules={[
                { required: true, message: "Vui lòng nhập tên đăng nhập!" },
              ]}
            >
              <Input placeholder="Vui lòng nhập tên đăng nhập" />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            >
              <Input placeholder="Vui lòng nhập mật khẩu" type="password"/>
            </Form.Item>

            <div className="form-footer">
              <Link to="/recoveryPassword" className="forgot-link">
                Quên mật khẩu
              </Link>
            </div>

            <div className="buttons">
              <Button type="primary" htmlType="submit" className="login-btn">
                Đăng nhập
              </Button>
              <Button
                type="default"
                className="register-btn"
                style={{ backgroundColor: "yellow", marginLeft: "10px" }}
              >
                <Link to="/register">Đăng ký</Link>
              </Button>
            </div>
          </Form>

          {/* Login social */}
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

export default LoginPage;
