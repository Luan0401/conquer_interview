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

  /**
 * Giải mã phần payload của JWT và trích xuất claims.
 * @param {string} token - Access Token (JWT).
 * @returns {object | null} - Đối tượng chứa các claims, hoặc null nếu lỗi.
 */
const decodeJwt = (token) => {
    if (!token) return null;
    try {
        // Token có định dạng header.payload.signature
        const base64Url = token.split('.')[1];
        // Thay thế ký tự không an toàn cho URL và giải mã Base64
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        // Giải mã và parse thành đối tượng JSON
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Lỗi giải mã token:", e);
        return null;
    }
};

  const handleLogin = async (values) => {
    try {
        const response = await loginApi(values);
        const { accessToken, user } = response.data.data;

        // 1. Giải mã Access Token để lấy Claims
        const decodedClaims = decodeJwt(accessToken); 

        // 2. Trích xuất giá trị (Claims đã được đặt tên là userStatus và trialCount ở Backend)
        // LƯU Ý: Giá trị trong Claims luôn là STRING, nên cần lưu trữ dưới dạng STRING
        const statusFromToken = decodedClaims?.userStatus || '0'; 
        const trialCountFromToken = decodedClaims?.trialCount || '0';
        
        // --- LƯU VÀO SESSION STORAGE ---
        sessionStorage.setItem("token", accessToken);
        sessionStorage.setItem("user", JSON.stringify(user));
        
        // 3. LƯU GIÁ TRỊ TỪ TOKEN VÀO sessionStorage
        // Lưu trữ dưới dạng chuỗi để sau đó dùng parseInt() an toàn ở HomePage
        sessionStorage.setItem("userStatus", statusFromToken);
        sessionStorage.setItem("trialCount", trialCountFromToken); 
        sessionStorage.setItem("userId", user.userId); 
        const roles = user.roles || [];
        const isAdmin = roles.includes("ADMIN");

        // console.log("admin", isAdmin);
        // console.log("token", sessionStorage.getItem('token'));
        // console.log("user", sessionStorage.getItem('user'));
        // console.log("userStatus", sessionStorage.getItem('userStatus'));
        // console.log("trialCount", sessionStorage.getItem('trialCount'));
        // console.log("userId", sessionStorage.getItem('userId'));
        // --------------------------------

        // Bỏ dòng chuyển đổi boolean không cần thiết:
        // const userStatusNumeric = user.status === true ? 1 : 0; 
        
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
        if (isAdmin) {
            navigate("/Dashboard"); 
        } else {
            navigate("/"); 
        } 
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
