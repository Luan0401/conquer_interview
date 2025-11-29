import React, { useState, useEffect, useCallback } from 'react';
import './index.scss'; 
import { getAllUsersApi, updateUserRoleApi } from '../../../config/authApi';
import { toast } from 'react-toastify';

const UserManager = ({ setApiLoading }) => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = useCallback(async () => {
        setApiLoading(true);
        try {
            const response = await getAllUsersApi();
            const mappedUsers = response.data.data.map(user => ({
                id: user.userId,
                name: user.fullName,
                email: user.email,
                roles: user.roles, 
                created: new Date(user.created_at).toLocaleDateString('vi-VN'),
            }));
            setUsers(mappedUsers);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách người dùng:', error);
            toast.error('Không thể tải danh sách người dùng!');
        } finally {
            setApiLoading(false);
        }
    }, [setApiLoading]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleEditRole = async (user) => {
        // Nếu role hiện tại có ADMIN thì không cho sửa
        if (user.roles.includes('ADMIN')) {
            toast.warn('Không thể chỉnh sửa role ADMIN!');
            return;
        }

        const newRole = prompt(`Nhập role mới cho ${user.name} (ADMIN, STAFF, CUSTOMER):`, user.roles[0]);
        if (!newRole) return;

        setApiLoading(true);
        try {
            const response = await updateUserRoleApi(user.id, newRole.toUpperCase());

            if (response.data.statusCode === 200) {
                toast.success('Cập nhật role thành công!');
                setUsers(prevUsers => prevUsers.map(u => 
                    u.id === user.id ? { ...u, roles: response.data.data.roles } : u
                ));
            } else {
                toast.error('Cập nhật role thất bại!');
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật role:', error);
            toast.error('Cập nhật role thất bại!');
        } finally {
            setApiLoading(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="manager-section">
            <h2>Quản lý Người dùng</h2>
            <div className="manager-toolbar">
                <input
                    type="text"
                    placeholder="Tìm kiếm theo tên hoặc email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên</th>
                        <th>Email</th>
                        <th>Quyền (Role)</th>
                        <th>Ngày tạo</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.map(user => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>
                                {user.roles.map((role, idx) => (
                                    <span key={idx} className={`badge badge--${role.toLowerCase()}`}>
                                        {role.toUpperCase()}
                                    </span>
                                ))}
                            </td>
                            <td>{user.created}</td>
                            <td>
                                <button
                                    className="btn btn--edit"
                                    onClick={() => handleEditRole(user)}
                                    disabled={user.roles.includes('ADMIN')} // disable nút nếu có role ADMIN
                                >
                                    Sửa
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserManager;
