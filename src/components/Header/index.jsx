import React, { useState } from "react";
import { Avatar, Dropdown, Layout, Menu } from "antd";
import { Link, useLocation } from "react-router-dom"; // 👈 thêm useLocation
import {
  AntDesignOutlined,
  UserOutlined,
  LogoutOutlined,
  LoginOutlined,
  FormOutlined,
} from "@ant-design/icons";
import "./index.scss";

const { Header } = Layout;

const AppHeader = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation(); // 👈 lấy path hiện tại

  // Map đường dẫn sang key menu
  const pathToKey = {
    "/": "1",
    "/practice": "2",
    "/pricing": "3",
    "/support": "4",
    "/feedback": "5",
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
      if (key === "2") setIsLoggedIn(false);
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
        <img src="/image/logo_one.png" alt="Logo" className="logo-img" />
        <span className="logo-text">CONQUER INTERVIEW</span>
      </div>

      <Menu
        className="menu"
        theme="light"
        mode="horizontal"
        selectedKeys={[pathToKey[location.pathname] || "1"]} // 👈 highlight theo URL
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
        trigger={["click"]}
      >
        <Avatar
          size={44}
          icon={isLoggedIn ? <AntDesignOutlined /> : <UserOutlined />}
        />
      </Dropdown>
    </Header>
  );
};

export default AppHeader;
