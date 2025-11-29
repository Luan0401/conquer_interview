import React, { useState, useEffect } from 'react';
import './index.scss';
import { getUserByIdApi, updateUserByIdApi } from '../../../config/authApi';

const AccountSettings = ({ setApiLoading }) => {

    const storedUserId = sessionStorage.getItem("userId");
    const userId = storedUserId ? parseInt(storedUserId) : null;

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        fullName: "",
        phoneNumber: "",
        dateOfBirth: "",
        gender: "",
        avatarUrl: ""
    });

    // ===========================
    // 1. LẤY THÔNG TIN USER
    // ===========================
    useEffect(() => {
        if (!userId) return;

        const fetchUser = async () => {
            setApiLoading(true);
            try {
                const res = await getUserByIdApi(userId);

                if (res.data?.data) {
                    const u = res.data.data;
                    setFormData({
                        username: u.username || "",
                        email: u.email || "",
                        fullName: u.fullName || "",
                        phoneNumber: u.phoneNumber || "",
                        dateOfBirth: u.dateOfBirth?.substring(0, 10) || "",
                        gender: u.gender || "",
                        avatarUrl: u.avatarUrl || ""
                    });
                }
            } catch (error) {
                console.error("Lỗi tải thông tin user:", error);
            } finally {
                setApiLoading(false);
            }
        };

        fetchUser();
    }, [userId]);

    // ===========================
    // 2. HANDLE INPUT
    // ===========================
    const handleChange = (e) => {
        setFormData({ 
            ...formData, 
            [e.target.name]: e.target.value 
        });
    };

    // ===========================
    // 3. UPDATE USER PROFILE
    // ===========================
    const handleSubmit = async (e) => {
        e.preventDefault();

        setApiLoading(true);
        try {
            // Gửi tất cả field
            const payload = { ...formData };

            const res = await updateUserByIdApi(userId, payload);

            if (res.data.statusCode === 200) {
                alert("Cập nhật tài khoản thành công!");
            } else {
                alert("Cập nhật thất bại!");
            }

        } catch (error) {
            console.error("Lỗi cập nhật user:", error);
            alert("Không thể cập nhật tài khoản!");
        } finally {
            setApiLoading(false);
        }
    };

    return (
        <div className="manager-section">
            <h2>Chỉnh sửa Tài khoản Admin</h2>

            <form onSubmit={handleSubmit} className="account-form">

                <div className="form-group">
                    <label>Tên đăng nhập</label>
                    <input 
                        type="username" 
                        name="username" 
                        value={formData.username}
                        onChange={handleChange}
                        required 
                    />
                </div>

                <div className="form-group">
                    <label>Email</label>
                    <input 
                        type="email" 
                        name="email"
                        value={formData.email} 
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Họ và Tên</label>
                    <input 
                        type="fullName" 
                        name="fullName" 
                        value={formData.fullName}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label>Số điện thoại</label>
                    <input 
                        type="phoneNumber" 
                        name="phoneNumber" 
                        value={formData.phoneNumber}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label>Ngày sinh</label>
                    <input 
                        type="date" 
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label>Giới tính</label>
                    <select 
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                    >
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                        <option value="Khác">Khác</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Avatar URL</label>
                    <input 
                        type="fullName" 
                        name="avatarUrl" 
                        value={formData.avatarUrl}
                        onChange={handleChange}
                    />
                </div>

                <button type="submit" className="btn btn--primary">
                    Lưu Thay đổi
                </button>
            </form>
        </div>
    );
};

export default AccountSettings;
