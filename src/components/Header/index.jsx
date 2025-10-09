import React, { useState } from "react";
import { Avatar, Dropdown, Layout, Menu, Modal } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  AntDesignOutlined,
  UserOutlined,
  LogoutOutlined,
  LoginOutlined,
  FormOutlined,
} from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import "./index.scss";
import { logout } from "../../pages/redux/userSlice";

const { Header } = Layout;

const AppHeader = () => {
  const [showModal, setShowModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user);
  const isLoggedIn = !!user?.fullName || !!localStorage.getItem("token");

  // Map đường dẫn sang key menu
  const pathToKey = {
    "/": "1",
    "/practice": "2",
    "/pricing": "3",
    "/support": "4",
    "/feedback": "5",
  };

  // Đăng xuất
  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
      dispatch(logout());
      toast.success("Đăng xuất thành công!");
      navigate("/");
    } catch (err) {
      console.error("Lỗi khi đăng xuất:", err);
      toast.error("Có lỗi xảy ra khi đăng xuất!");
    }
  };

  // Menu khi đã đăng nhập
  const userMenu = {
    items: [
      { key: "1", icon: <UserOutlined />, label: "Thông tin cá nhân" },
      {
        key: "2",
        icon: <LogoutOutlined />,
        label: "Đăng xuất",
        danger: true,
      },
    ],
    onClick: ({ key }) => {
      if (key === "1") setShowModal(true);
      if (key === "2") handleLogout();
    },
  };

  // Menu khi chưa đăng nhập
  const guestMenu = {
    items: [
      {
        key: "login",
        icon: <LoginOutlined />,
        label: <Link to="/login">Đăng nhập</Link>,
      },
      {
        key: "register",
        icon: <FormOutlined />,
        label: <Link to="/register">Đăng ký</Link>,
      },
    ],
  };

  return (
    <Header className="app-header">
      {/* Logo */}
      <div className="logo" onClick={() => navigate("/")}>
        <img src="/image/logo_one.png" alt="Logo" className="logo-img" />
        <span className="logo-text">CONQUER INTERVIEW</span>
      </div>

      {/* Menu điều hướng */}
      <Menu
        className="menu"
        theme="light"
        mode="horizontal"
        selectedKeys={[pathToKey[location.pathname] || "1"]}
        overflowedIndicator={null}
      >
        <Menu.Item key="1">
          <Link to="/">Trang chủ</Link>
        </Menu.Item>
        <Menu.Item key="2">
          <Link to="/practice">Luyện tập</Link>
        </Menu.Item>
        <Menu.Item key="3">
          <Link to="/pricing">Gói đăng ký</Link>
        </Menu.Item>
        <Menu.Item key="4">
          <Link to="/support">Trợ giúp</Link>
        </Menu.Item>
        <Menu.Item key="5">
          <Link to="/feedback">Đóng góp ý kiến</Link>
        </Menu.Item>
      </Menu>

      {/* Avatar người dùng */}
      <div className="user-info">
        {isLoggedIn && (
          <span className="user-fullname" onClick={() => setShowModal(true)}>
            {user?.fullName}
          </span>
        )}

        <Dropdown
          menu={isLoggedIn ? userMenu : guestMenu}
          placement="bottomRight"
          trigger={["click"]}
        >
          <Avatar
            className="user-avatar"
            size={44}
            icon={isLoggedIn ? <AntDesignOutlined /> : <UserOutlined />}
          />
        </Dropdown>
      </div>

      {/* Modal thông tin cá nhân */}
      <Modal
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={null}
        title="Thông tin cá nhân"
      >
        <p>Họ tên: {user?.fullName || "Chưa cập nhật"}</p>
        <p>Số điện thoại: {user?.phomeNumber || "Chưa có"}</p>
        <p>Email: {user?.email || "Chưa có"}</p>
        <p>Ngày sinh: {user?.dateOfBirth || "Chưa có"}</p>
      </Modal>
    </Header>
  );
};

export default AppHeader;
