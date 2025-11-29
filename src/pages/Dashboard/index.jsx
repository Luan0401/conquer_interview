import React, { useState, useEffect, useCallback } from 'react';
import './index.scss'; 
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import UserManager from './UserManager/index.jsx'; 
import RevenueManager from './RevenueManager/index.jsx'; 
import ReportManager from './ReportManager/index.jsx'; 
import AccountSettings from './AccountSettings/index.jsx';
import { getAllSessionsApi, getAllUsersApi } from '../../config/authApi'; 
import { toast } from 'react-toastify';

// --- Component con: Sidebar ---
const Sidebar = ({ activeTab, setActiveTab }) => {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-chart-line' },
        { id: 'users', label: 'Quản lý User', icon: 'fas fa-users' },
        { id: 'revenue', label: 'Kiểm tra Doanh thu', icon: 'fas fa-wallet' },         
        { id: 'account', label: 'Edit Account', icon: 'fas fa-user-cog' }, 
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
        </div>
    );
};

// --- Dashboard Content ---
const DashboardContent = ({ setApiLoading }) => {
    const VN_OFFSET_MS = 7 * 60 * 60 * 1000;

    const [stats, setStats] = useState({
        totalUsers: 0,
        premiumSubscribers: 0,
        newUsersLast7Days: 0,
        newUsersLast30Days: 0,
        newUsersThisMonth: 0,
        totalInterviews: 0,
        aiModels: 3,
    });

    const [bar7Days, setBar7Days] = useState([]);
    const [bar30Days, setBar30Days] = useState([]);
    const [barMonth, setBarMonth] = useState([]);
    const [pieData, setPieData] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // mặc định tháng hiện tại

    const COLORS = ['#28a745', '#007bff', '#dc3545', '#ffc107'];

    // --- Lấy dữ liệu User ---
    const fetchUserStats = useCallback(async () => {
        try {
            const response = await getAllUsersApi();
            const userList = response.data.data;

            const nowVN = new Date().getTime() + VN_OFFSET_MS;
            const sevenDaysAgo = nowVN - 7 * 24 * 60 * 60 * 1000;
            const thirtyDaysAgo = nowVN - 30 * 24 * 60 * 60 * 1000;

            let totalActiveUsers = 0;
            let premiumCount = 0;
            let newUsers7Days = 0;
            let newUsers30Days = 0;
            let newUsersThisMonth = 0;

            const bar7Map = {};
            const bar30Map = {};
            const barMonthMap = {};

            userList.forEach(user => {
                if (user.status) {
                    totalActiveUsers++;
                    if (user.roles.includes('ADMIN') || user.roles.includes('STAFF')) premiumCount++;

                    const createdTimeVN = new Date(user.created_at).getTime() + VN_OFFSET_MS;
                    const createdDate = new Date(createdTimeVN);
                    const dayStr = createdDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

                    // 7 ngày
                    if (createdTimeVN >= sevenDaysAgo) {
                        newUsers7Days++;
                        bar7Map[dayStr] = (bar7Map[dayStr] || 0) + 1;
                    }

                    // 30 ngày
                    if (createdTimeVN >= thirtyDaysAgo) {
                        newUsers30Days++;
                        bar30Map[dayStr] = (bar30Map[dayStr] || 0) + 1;
                    }

                    // Tháng đã chọn
                    if (createdDate.getMonth() + 1 === selectedMonth) {
                        newUsersThisMonth++;
                        const dayKey = createdDate.getDate();
                        barMonthMap[dayKey] = (barMonthMap[dayKey] || 0) + 1;
                    }
                }
            });

            setStats(prev => ({
                ...prev,
                totalUsers: totalActiveUsers,
                premiumSubscribers: premiumCount,
                newUsersLast7Days: newUsers7Days,
                newUsersLast30Days: newUsers30Days,
                newUsersThisMonth,
            }));

            // Chuyển map sang array cho chart
            const sorted7Days = Object.keys(bar7Map).sort((a, b) => new Date(a) - new Date(b))
                .map(date => ({ name: date, newUsers: bar7Map[date] }));
            setBar7Days(sorted7Days);

            const sorted30Days = Object.keys(bar30Map).sort((a, b) => new Date(a) - new Date(b))
                .map(date => ({ name: date, newUsers: bar30Map[date] }));
            setBar30Days(sorted30Days);

            const sortedMonth = Object.keys(barMonthMap).sort((a, b) => a - b)
                .map(day => ({ name: `Ngày ${day}`, newUsers: barMonthMap[day] }));
            setBarMonth(sortedMonth);

        } catch (error) {
            console.error(error);
            toast.error('Không thể tải dữ liệu User!');
        }
    }, [selectedMonth]);

    // --- Kiểm tra session còn hoạt động ---
    const isSessionActive = (session) => {
        if (session.status !== 'Active') return false;
        const nowVN = new Date().getTime() + VN_OFFSET_MS;
        const startTimeVN = new Date(session.startTime).getTime() + VN_OFFSET_MS;
        const endTimeVN = new Date(session.endTime).getTime() + VN_OFFSET_MS;
        return nowVN >= startTimeVN && nowVN <= endTimeVN;
    };

    // --- Lấy dữ liệu Dashboard ---
    const fetchDashboardData = useCallback(async () => {
        setApiLoading(true);
        try {
            await fetchUserStats();
            const sessionsResponse = await getAllSessionsApi();
            const allSessions = sessionsResponse.data.data;

            let countCompleted = 0, countActive = 0, countFailedOrCancelled = 0, countOther = 0;

            allSessions.forEach(session => {
                if (session.status === 'COMPLETED') countCompleted++;
                else if (isSessionActive(session)) countActive++;
                else if (session.status === 'FAILED' || session.status === 'CANCELLED') countFailedOrCancelled++;
                else countOther++;
            });

            setStats(prev => ({ ...prev, totalInterviews: allSessions.length }));

            const newPieData = [
                { name: 'Đã hoàn thành', value: countCompleted, color: '#28a745' },
                { name: 'Đang hoạt động', value: countActive, color: '#007bff' },
                { name: 'Bỏ dở/Thất bại', value: countFailedOrCancelled, color: '#dc3545' },
                { name: 'Khác/Hết giờ', value: countOther, color: '#ffc107' }
            ].filter(d => d.value > 0);
            setPieData(newPieData);

        } catch (error) {
            console.error(error);
            toast.error('Không thể tải dữ liệu Dashboard!');
        } finally {
            setApiLoading(false);
        }
    }, [fetchUserStats, setApiLoading]);

    useEffect(() => { fetchDashboardData(); }, [fetchDashboardData, selectedMonth]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="label">{label}</p>
                    <p className="intro" style={{ color: payload[0].fill }}>{`Người dùng mới: ${payload[0].value}`}</p>
                </div>
            );
        }
        return null;
    };

    const finalPieData = pieData.length > 0 ? pieData : [{ name: 'Không có dữ liệu', value: 1, color: '#ccc' }];

    return (
        <div className="dashboard">
            <h2 className="dashboard__title">📊 Dashboard Thống Kê</h2>

            {/* Chọn tháng */}
            <div className="month-select">
                <label>Chọn tháng: </label>
                <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                        <option key={m} value={m}>{`Tháng ${m}`}</option>
                    ))}
                </select>
            </div>

            {/* Stat Cards */}
            <div className="dashboard__stat-cards">
                <div className="card stat-card stat-card--blue">
                    <div className="stat-card__icon"><i className="fas fa-users"></i></div>
                    <div className="stat-card__info">
                        <div className="stat-card__label">Tổng Người dùng</div>
                        <div className="stat-card__value">{stats.totalUsers.toLocaleString()}</div>
                    </div>
                </div>
                <div className="card stat-card stat-card--green">
                    <div className="stat-card__icon"><i className="fas fa-crown"></i></div>
                    <div className="stat-card__info">
                        <div className="stat-card__label">Người dùng Premium</div>
                        <div className="stat-card__value">{stats.premiumSubscribers.toLocaleString()}</div>
                    </div>
                </div>
                <div className="card stat-card stat-card--yellow">
                    <div className="stat-card__icon"><i className="fas fa-user-plus"></i></div>
                    <div className="stat-card__info">
                        <div className="stat-card__label">Người dùng mới (7 ngày)</div>
                        <div className="stat-card__value">{stats.newUsersLast7Days.toLocaleString()}</div>
                    </div>
                </div>
                <div className="card stat-card stat-card--purple">
                    <div className="stat-card__icon"><i className="fas fa-graduation-cap"></i></div>
                    <div className="stat-card__info">
                        <div className="stat-card__label">Tổng lượt Phỏng vấn</div>
                        <div className="stat-card__value">{stats.totalInterviews.toLocaleString()}</div>
                    </div>
                </div>
                <div className="card stat-card stat-card--orange">
                    <div className="stat-card__icon"><i className="fas fa-microchip"></i></div>
                    <div className="stat-card__info">
                        <div className="stat-card__label">Số Mô hình AI</div>
                        <div className="stat-card__value">{stats.aiModels}</div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="dashboard__charts">
                {/* 7 ngày */}
                <div className="card chart-card">
                    <h3>Người dùng mới (7 Ngày)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={bar7Days}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="newUsers" name="Người dùng mới" fill="#007bff" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* 30 ngày */}
                <div className="card chart-card">
                    <h3>Người dùng mới (30 Ngày)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={bar30Days}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="newUsers" name="Người dùng mới" fill="#28a745" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Theo tháng đã chọn */}
                <div className="card chart-card">
                    <h3>Người dùng mới - Tháng {selectedMonth}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={barMonth}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="newUsers" name="Người dùng mới" fill="#ffc107" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Pie chart */}
                <div className="card chart-card">
                    <h3>Phân bố Trạng thái Phỏng vấn</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={finalPieData}
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
                                {finalPieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
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

// --- Dashboard chính ---
const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [apiLoading, setApiLoading] = useState(false);

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <DashboardContent setApiLoading={setApiLoading} />;
            case 'users': return <UserManager setApiLoading={setApiLoading} />;
            case 'revenue': return <RevenueManager setApiLoading={setApiLoading} />;
            case 'reports': return <ReportManager setApiLoading={setApiLoading} />;
            case 'account': return <AccountSettings setApiLoading={setApiLoading} />;
            default: return <DashboardContent setApiLoading={setApiLoading} />;
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
