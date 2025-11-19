import React, { useState, useEffect, useCallback } from 'react';
import './index.scss'; 

const UserManager = ({ setApiLoading }) => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // **VỊ TRÍ GỌI API:** Lấy danh sách người dùng
    const fetchUsers = useCallback(async () => {
        setApiLoading(true);
        try {
            // Thay thế URL này bằng API gốc của bạn: GET /api/admin/users
            // const response = await fetch('/api/admin/users'); 
            // const data = await response.json(); 
            // setUsers(data.users); 

            // Dữ liệu giả định
            const mockData = [
                { id: 1, name: 'Nguyễn Văn A', email: 'a@example.com', role: 'admin', status: 'Active', created: '2023-01-15' },
                { id: 2, name: 'Trần Thị B', email: 'b@example.com', role: 'premium', status: 'Active', created: '2023-03-20' },
                { id: 3, name: 'Lê Văn C', email: 'c@example.com', role: 'basic', status: 'Inactive', created: '2023-05-10' },
            ];
            setUsers(mockData);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách người dùng:', error);
        } finally {
            setApiLoading(false);
        }
    }, [setApiLoading]);

    // **VỊ TRÍ GỌI API:** Xóa người dùng
    const handleDeleteUser = async (userId) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa người dùng ID: ${userId}?`)) return;
        setApiLoading(true);
        try {
            // Thay thế URL này bằng API gốc của bạn: DELETE /api/admin/users/{userId}
            // await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
            
            // Giả định thành công và cập nhật UI
            setUsers(users.filter(user => user.id !== userId));
            alert(`Đã xóa người dùng ID: ${userId}`);
        } catch (error) {
            console.error('Lỗi khi xóa người dùng:', error);
        } finally {
            setApiLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

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
                <button className="btn btn--primary">Thêm Người dùng mới</button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên</th>
                        <th>Email</th>
                        <th>Quyền (Role)</th>
                        <th>Trạng thái</th>
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
                            <td><span className={`badge badge--${user.role}`}>{user.role.toUpperCase()}</span></td>
                            <td><span className={`badge badge--${user.status.toLowerCase()}`}>{user.status}</span></td>
                            <td>{user.created}</td>
                            <td>
                                <button className="btn btn--edit">Sửa</button>
                                <button
                                    className="btn btn--delete"
                                    onClick={() => handleDeleteUser(user.id)}
                                >
                                    Xóa
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