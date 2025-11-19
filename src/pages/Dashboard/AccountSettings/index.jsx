import React, { useState } from 'react';
import './index.scss'; // Tái sử dụng SCSS chung

const AccountSettings = ({ setApiLoading }) => {
    const [formData, setFormData] = useState({
        name: 'Admin Chính',
        email: 'admin@conquerinterview.com',
        newPassword: '',
        confirmPassword: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // **VỊ TRÍ GỌI API:** Cập nhật thông tin Admin
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            alert('Mật khẩu mới và xác nhận mật khẩu không khớp!');
            return;
        }

        setApiLoading(true);
        try {
            // Dữ liệu gửi đi
            const payload = { 
                name: formData.name, 
                // Chỉ gửi password nếu có thay đổi
                ...(formData.newPassword && { password: formData.newPassword })
            };

            // Thay thế URL này bằng API gốc của bạn: PUT /api/admin/profile
            // await fetch('/api/admin/profile', {
            //     method: 'PUT',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(payload)
            // });

            alert('Cập nhật thông tin tài khoản thành công!');
            // Reset mật khẩu sau khi thành công
            setFormData({ ...formData, newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error('Lỗi khi cập nhật tài khoản:', error);
        } finally {
            setApiLoading(false);
        }
    };

    return (
        <div className="manager-section">
            <h2>Chỉnh sửa Tài khoản Admin</h2>
            <form onSubmit={handleSubmit} className="account-form">
                
                <div className="form-group">
                    <label htmlFor="name">Tên hiển thị</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Email (Không thể thay đổi)</label>
                    <input
                        type="email"
                        value={formData.email}
                        disabled
                        style={{ backgroundColor: '#f0f0f0' }}
                    />
                </div>

                <h3>Thay đổi Mật khẩu</h3>

                <div className="form-group">
                    <label htmlFor="newPassword">Mật khẩu mới</label>
                    <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        placeholder="Để trống nếu không muốn thay đổi"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="confirmPassword">Xác nhận Mật khẩu mới</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                    />
                </div>

                <button type="submit" className="btn btn--primary">Lưu Thay đổi</button>
            </form>
        </div>
    );
};

export default AccountSettings;