import React from "react";
import { Avatar, Dropdown, Layout, Menu } from "antd";
import { Link } from "react-router-dom";
import "./index.scss"; // SCSS để custom style
import {
  AntDesignOutlined,
  UserOutlined,
  LogoutOutlined,
  LoginOutlined,
  FormOutlined,
} from "@ant-design/icons";
import { useState } from "react";

const { Header } = Layout;

const AppHeader = () => {
  // ✅ Trạng thái đăng nhập (demo)
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Menu khi đã đăng nhập
  const userMenu = {
    items: [
      { key: "1", icon: <UserOutlined />, label: "Thông tin cá nhân" },
      { key: "2", icon: <LogoutOutlined />, label: "Đăng xuất", danger: true },
    ],
    onClick: ({ key }) => {
      if (key === "2") {
        setIsLoggedIn(false); // Đăng xuất
      }
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
      <div className="logo">
        <img src="/image/logo.png" alt="Logo" className="logo-img" />

        <span className="logo-text">CONQUER INTERVIEW</span>
      </div>

      {/* Menu */}
      <Menu
        theme="light"
        mode="horizontal"
        defaultSelectedKeys={["1"]}
        className="menu"
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
      <Dropdown
        menu={isLoggedIn ? userMenu : guestMenu}
        placement="bottomRight"
      >
        <Avatar
          className="user-avatar"
          size={40}
          icon={isLoggedIn ? <AntDesignOutlined /> : <UserOutlined />}
        />
      </Dropdown>
    </Header>
  );
};

export default AppHeader;
