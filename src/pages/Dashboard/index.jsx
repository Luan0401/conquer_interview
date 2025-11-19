import React, { useState, useEffect, useCallback } from 'react';
import './index.scss'; 
import { NavLink } from 'react-router-dom'; 
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import UserManager from './UserManager/index.jsx'; 
import RevenueManager from './RevenueManager/index.jsx'; 
import ReportManager from './ReportManager/index.jsx'; 
import AccountSettings from './AccountSettings/index.jsx';

// --- MOCK DATA (Dữ liệu giả định) ---
const MOCK_STATS = {
    totalUsers: 7520,
    totalInterviews: 12500,
    aiModels: 3, 
    premiumSubscribers: 1540,
    newUsersLast7Days: 320,
};

const MOCK_BAR_DATA = [
    { name: '13/11', newUsers: 15 }, { name: '14/11', newUsers: 25 }, 
    { name: '15/11', newUsers: 40 }, { name: '16/11', newUsers: 30 }, 
    { name: '17/11', newUsers: 60 }, { name: '18/11', newUsers: 85 }, 
    { name: '19/11', newUsers: 65 },
];

const MOCK_PIE_DATA = [
    { name: 'Đã hoàn thành', value: 4500, color: '#28a745' }, 
    { name: 'Đang chờ đánh giá', value: 1200, color: '#ffc107' }, 
    { name: 'Bỏ dở (dưới 50%)', value: 6800, color: '#dc3545' }, 
];
const COLORS = MOCK_PIE_DATA.map(d => d.color);


// --- Component con: Sidebar ---
const Sidebar = ({ activeTab, setActiveTab }) => {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-chart-line' },
        { id: 'users', label: 'Quản lý User', icon: 'fas fa-users' },
        { id: 'revenue', label: 'Kiểm tra Doanh thu', icon: 'fas fa-wallet' }, // Thêm Doanh thu
        { id: 'reports', label: 'Quản lý Báo cáo', icon: 'fas fa-file-alt' },
        { id: 'account', label: 'Edit Account', icon: 'fas fa-user-cog' }, // Thêm Edit Account
    ];

    return (
        <div className="admin-sidebar">
            <div className="admin-sidebar__header">
                <h3>Admin Panel</h3>
            </div>
            
            <nav className="admin-sidebar__nav">
                {navItems.map((item) => (
                    <div
                        key={item.id}
                        className={`admin-sidebar__link ${activeTab === item.id ? 'admin-sidebar__link--active' : ''}`}
                        onClick={() => setActiveTab(item.id)}
                    >
                        <i className={`${item.icon} admin-sidebar__icon`}></i>
                        {item.label}
                    </div>
                ))}
            </nav>

            <div className="admin-sidebar__footer">
                {/* Giả định / là trang chủ. Dùng NavLink nếu có React Router */}
                <NavLink to="/" className="admin-sidebar__link admin-sidebar__link--return">
                    <i className="fas fa-home admin-sidebar__icon"></i>
                    Về trang chủ
                </NavLink>
            </div>
        </div>
    );
};

// --- Component con: Dashboard Content (Chỉ hiển thị thống kê) ---
const DashboardContent = ({ setApiLoading }) => {
    const [stats, setStats] = useState(MOCK_STATS);
    const [barData, setBarData] = useState(MOCK_BAR_DATA);
    const [pieData, setPieData] = useState(MOCK_PIE_DATA);

    // **VỊ TRÍ GỌI API:** Gọi API lấy dữ liệu thống kê tổng quan
    const fetchDashboardData = useCallback(async () => {
        setApiLoading(true);
        try {
            // Thay thế URL này bằng API gốc của bạn
            // const statsResponse = await fetch('/api/admin/dashboard/stats');
            // setStats(await statsResponse.json());
            // ... Tương tự cho barData và pieData
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu Dashboard:', error);
        } finally {
            setApiLoading(false);
        }
    }, [setApiLoading]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="label">{`${label}`}</p>
                    <p className="intro" style={{ color: payload[0].fill }}>{`Người dùng mới: ${payload[0].value}`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="dashboard">
            <h2 className="dashboard__title">📊 Dashboard Thống Kê</h2>

            {/* --- 1. Stat Cards --- */}
            <div className="dashboard__stat-cards">
                {/* Tổng Người dùng */}
                <div className="card stat-card stat-card--blue">
                    <div className="stat-card__icon"><i className="fas fa-users"></i></div>
                    <div className="stat-card__info">
                        <div className="stat-card__label">Tổng Người dùng</div>
                        <div className="stat-card__value">{stats.totalUsers.toLocaleString()}</div>
                    </div>
                </div>

                {/* Số Mô hình AI */}
                <div className="card stat-card stat-card--orange">
                    <div className="stat-card__icon"><i className="fas fa-microchip"></i></div>
                    <div className="stat-card__info">
                        <div className="stat-card__label">Số Mô hình AI</div>
                        <div className="stat-card__value">{stats.aiModels}</div>
                    </div>
                </div>

                {/* Tổng lượt Phỏng vấn */}
                <div className="card stat-card stat-card--purple">
                    <div className="stat-card__icon"><i className="fas fa-graduation-cap"></i></div>
                    <div className="stat-card__info">
                        <div className="stat-card__label">Tổng lượt Phỏng vấn</div>
                        <div className="stat-card__value">{stats.totalInterviews.toLocaleString()}</div>
                    </div>
                </div>

                {/* Người dùng Premium */}
                <div className="card stat-card stat-card--green">
                    <div className="stat-card__icon"><i className="fas fa-crown"></i></div>
                    <div className="stat-card__info">
                        <div className="stat-card__label">Người dùng Premium</div>
                        <div className="stat-card__value">{stats.premiumSubscribers.toLocaleString()}</div>
                    </div>
                </div>

                {/* Người dùng mới (7 ngày) */}
                <div className="card stat-card stat-card--yellow">
                    <div className="stat-card__icon"><i className="fas fa-user-plus"></i></div>
                    <div className="stat-card__info">
                        <div className="stat-card__label">Người dùng mới (7 ngày)</div>
                        <div className="stat-card__value">{stats.newUsersLast7Days.toLocaleString()}</div>
                    </div>
                </div>
            </div>

            {/* --- 2. Charts Section --- */}
            <div className="dashboard__charts">
                
                {/* Biểu đồ Cột - Người dùng mới */}
                <div className="card chart-card">
                    <h3>Người dùng Mới (7 Ngày)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={barData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="newUsers" name="Người dùng mới" fill="#007bff" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Biểu đồ Tròn - Trạng thái Phỏng vấn */}
                <div className="card chart-card">
                    <h3>Phân bố Trạng thái Phỏng vấn</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value, name, props) => [`${value.toLocaleString()} lượt`, props.payload.name]} />
                            <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

            </div>
        </div>
    );
};

// --- Component Chính: Dashboard (Layout Wrapper) ---
const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [apiLoading, setApiLoading] = useState(false);

    // Render nội dung dựa trên tab đang hoạt động
    const renderContent = () => {
    switch (activeTab) {
        case 'dashboard':
            return <DashboardContent setApiLoading={setApiLoading} />;
            
        case 'users':
            // ✅ HIỂN THỊ TRANG QUẢN LÝ USER
            return <UserManager setApiLoading={setApiLoading} />; 
            
        case 'revenue':
            // ✅ HIỂN THỊ TRANG KIỂM TRA DOANH THU
            return <RevenueManager setApiLoading={setApiLoading} />; 
            
        case 'reports':
            // ✅ HIỂN THỊ TRANG QUẢN LÝ BÁO CÁO
            return <ReportManager setApiLoading={setApiLoading} />; 
            
        case 'account':
            // ✅ HIỂN THỊ TRANG CHỈNH SỬA TÀI KHOẢN ADMIN
            return <AccountSettings setApiLoading={setApiLoading} />; 
            
        default:
            // Luôn quay về Dashboard nếu activeTab không khớp
            return <DashboardContent setApiLoading={setApiLoading} />;
    }
};

    return (
        <div className="admin-layout">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            
            <main className="admin-layout__content">
                {apiLoading && <div className="admin-layout__loading-overlay">Đang tải...</div>}
                {renderContent()}
            </main>
        </div>
    );
};

export default Dashboard;