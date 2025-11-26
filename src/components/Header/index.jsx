import React, { useState, useEffect } from "react";
import {
  Avatar,
  Dropdown,
  Layout,
  Menu,
  Modal,
  Form,
  Input,
  Button,
  DatePicker,
} from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FileTextOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import "./index.scss";
import { logout, updateUser } from "../../pages/redux/userSlice";
import { updateProfileApi } from "../../config/authApi";
import {
  AntDesignOutlined,
  UserOutlined,
  LogoutOutlined,
  LoginOutlined,
  FormOutlined,
} from "@ant-design/icons";

const { Header } = Layout;

const AppHeader = () => {
  const [showModal, setShowModal] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user);
  const isLoggedIn = !!user?.fullName || !!sessionStorage.getItem("token");

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
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("userStatus"); 
      sessionStorage.removeItem("trialCount"); 
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
        key: "report", // Đặt một key duy nhất
        icon: <FileTextOutlined />,
        label: "Báo cáo cá nhân",
      },
      {
        key: "2",
        icon: <LogoutOutlined />,
        label: "Đăng xuất",
        danger: true,
      },
    ],
    onClick: ({ key }) => {
      // Đọc userStatus từ sessionStorage ngay khi sự kiện click xảy ra
      const userStatus = parseInt(sessionStorage.getItem('userStatus') || '0');

      if (key === "1") {
        setShowModal(true);
      } else if (key === "report") {
        // --- LOGIC KIỂM TRA QUYỀN TRUY CẬP MỚI ---
        if (userStatus === 1) {
          // TRẠNG THÁI 1: Premium/Paid -> Cho phép truy cập
          navigate("/ReportHistory");
        } else {
          // TRẠNG THÁI 0: Free Trial -> Chặn và thông báo
          toast.warn("Bạn cần nâng cấp gói Premium để truy cập Báo cáo Cá nhân.");
        }
        // ----------------------------------------
      } else if (key === "2") {
        handleLogout();
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

  // Cập nhật form values khi user thay đổi hoặc modal mở
  useEffect(() => {
    if (showModal && user) {
      form.setFieldsValue({
        fullName: user.fullName || "",
        phoneNumber: user.phomeNumber || "",
        email: user.email || "",
        dateOfBirth: user.dateOfBirth ? dayjs(user.dateOfBirth) : null,
        avatarUrl: user.avatarUrl || "",
      });
    }
  }, [showModal, user, form]);

  // Xử lý cập nhật profile
  const handleUpdateProfile = async (values) => {
  if (!user?.accountID) {
    toast.error("Không tìm thấy thông tin người dùng!");
    return;
  }

  setLoading(true);
  try {
    const profileData = {
      username: values.username,
      email: values.email,
      fullName: values.fullName,
      phoneNumber: values.phoneNumber,
      dateOfBirth: values.dateOfBirth
        ? values.dateOfBirth.format("YYYY-MM-DD")
        : null,
      gender: values.gender,
      avatarUrl: values.avatarUrl || null,
    };

    await updateProfileApi(user.accountID, profileData);

    const updatedUser = { ...user, ...profileData };
    dispatch(updateUser(updatedUser));
    sessionStorage.setItem("user", JSON.stringify(updatedUser));

    toast.success("Cập nhật thông tin thành công!");
    setShowModal(false);
  } catch (error) {
    const errorMsg =
      error.response?.data?.Message || "Cập nhật thông tin thất bại";
    toast.error(errorMsg);
    console.error("Error updating profile:", error);
  } finally {
    setLoading(false);
  }
};

  // Không tự động login từ localStorage - để useAuthCheck xử lý

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
            src={isLoggedIn && user?.avatarUrl ? user.avatarUrl : null}
            icon={
              !user?.avatarUrl ? (
                isLoggedIn ? (
                  <AntDesignOutlined />
                ) : (
                  <UserOutlined />
                )
              ) : null
            }
          />
        </Dropdown>
      </div>

      {/* Modal cập nhật thông tin cá nhân */}
      <Modal
  open={showModal}
  onCancel={() => {
    setShowModal(false);
    form.resetFields();
  }}
  footer={null}
  title="Cập nhật thông tin cá nhân"
  width={600}
>
  <Form
    form={form}
    layout="vertical"
    onFinish={handleUpdateProfile}
    autoComplete="off"
  >
    <Form.Item
      label="Username"
      name="username"
      rules={[
        { required: true, message: "Vui lòng nhập username!" },
        { min: 3, message: "Username phải có ít nhất 3 ký tự!" },
      ]}
    >
      <Input placeholder="Nhập username" />
    </Form.Item>

    <Form.Item
      label="Email"
      name="email"
      rules={[
        { required: true, message: "Vui lòng nhập email!" },
        { type: "email", message: "Email không hợp lệ!" },
      ]}
    >
      <Input placeholder="Nhập email" />
    </Form.Item>

    <Form.Item
      label="Họ và tên"
      name="fullName"
      rules={[
        { required: true, message: "Vui lòng nhập họ và tên!" },
        { min: 2, message: "Họ và tên phải có ít nhất 2 ký tự!" },
      ]}
    >
      <Input placeholder="Nhập họ và tên" />
    </Form.Item>

    <Form.Item
      label="Số điện thoại"
      name="phoneNumber"
      rules={[
        { required: true, message: "Vui lòng nhập số điện thoại!" },
        {
          pattern: /^[0-9]{10,11}$/,
          message: "Số điện thoại không hợp lệ!",
        },
      ]}
    >
      <Input placeholder="Nhập số điện thoại" />
    </Form.Item>

    <Form.Item
      label="Ngày sinh"
      name="dateOfBirth"
      rules={[{ required: false }]}
    >
      <DatePicker
        style={{ width: "100%" }}
        placeholder="Chọn ngày sinh"
        format="YYYY-MM-DD"
        disabledDate={(current) => current && current > dayjs().endOf("day")}
      />
    </Form.Item>

    <Form.Item
      label="Giới tính"
      name="gender"
      rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
    >
      <Input placeholder="Nhập giới tính (nam/nữ)" />
    </Form.Item>

    <Form.Item
      label="URL Ảnh đại diện"
      name="avatarUrl"
      rules={[{ type: "url", message: "URL không hợp lệ!" }]}
    >
      <Input placeholder="Nhập URL ảnh đại diện (tùy chọn)" />
    </Form.Item>

    <Form.Item>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
        <Button
          onClick={() => {
            setShowModal(false);
            form.resetFields();
          }}
        >
          Hủy
        </Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          Cập nhật
        </Button>
      </div>
    </Form.Item>
  </Form>
</Modal>
    </Header>
  );
};

export default AppHeader;
