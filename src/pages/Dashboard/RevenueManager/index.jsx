import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './index.scss';
import { getRevenueReportApi, getAllUsersApi } from '../../../config/authApi';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell 
} from 'recharts';
import { toast } from 'react-toastify';

// Offset cho múi giờ Việt Nam (UTC+7)
const VN_OFFSET_MS = 7 * 60 * 60 * 1000;

// Hàm tiện ích: Lấy mốc thời gian bắt đầu của ngày/tuần/tháng/năm theo Giờ Việt Nam
const getVNDateStart = (date, type) => {
    // ... (Giữ nguyên)
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    if (type === 'day') return start.getTime();
    if (type === 'week') {
        const sevenDaysAgo = new Date(start);
        sevenDaysAgo.setDate(start.getDate() - 7);
        return sevenDaysAgo.getTime();
    } 
    if (type === 'month') {
        start.setDate(1); 
        return start.getTime();
    }
    if (type === 'year') {
        start.setDate(1);
        start.setMonth(0); 
        return start.getTime();
    }
    return 0;
};

// Hàm chuyển đổi thời gian API (UTC) sang thời gian VN
const convertToVNTime = (utcTimestamp) => {
    // Đảm bảo utcTimestamp không phải null/undefined
    if (!utcTimestamp) return null;
    const date = new Date(utcTimestamp);
    return new Date(date.getTime() + VN_OFFSET_MS);
};

const getCurrentYear = () => new Date().getFullYear();

const RevenueManager = ({ setApiLoading }) => {
    const [summary, setSummary] = useState({ totalRevenue: 0, completedTransactions: 0 }); 
    const [transactions, setTransactions] = useState([]);
    const [allTransactions, setAllTransactions] = useState([]); 
    const [monthlyRevenue, setMonthlyRevenue] = useState([]);
    
    const [yearFilter, setYearFilter] = useState(getCurrentYear()); 
    const [monthFilter, setMonthFilter] = useState(0); 
    
    // Lưu trữ TOÀN BỘ dữ liệu người dùng 
    const [allUsers, setAllUsers] = useState([]); 
    
    const [userStats, setUserStats] = useState({ 
        newUsersToday: 0, 
        newUsersThisWeek: 0, 
        newUsersThisMonth: 0, 
        newUsersThisYear: 0,
        totalFreeUsers: 0,
        totalPaidUsers: 0,
        totalExpiredUsers: 0,
    });
    
    const PIE_COLORS = ['#007bff', '#28a745', '#ffc107']; 

    // --- LOGIC: Xử lý Doanh thu theo tháng VÀ ÁP DỤNG LỌC NĂM (GIỮ NGUYÊN) ---
    const processRevenueDetails = (details, selectedYear) => {
        const monthlyRevenueMap = {};

        details.forEach(item => {
            if (item.price && item.startDate) {
                const dateVN = convertToVNTime(item.startDate);
                const year = dateVN?.getFullYear(); // Sử dụng optional chaining
                
                if (year === selectedYear) { 
                    const month = dateVN.getMonth() + 1;
                    const key = `${month}/${year}`;
                    const name = `Tháng ${month}`; 

                    if (!monthlyRevenueMap[key]) {
                        monthlyRevenueMap[key] = { name: name, revenue: 0, dateSort: dateVN.getTime() };
                    }
                    
                    monthlyRevenueMap[key].revenue += item.price;
                }
            }
        });
        
        const sortedRevenue = Object.values(monthlyRevenueMap)
            .sort((a, b) => parseInt(a.name.match(/\d+/)[0]) - parseInt(b.name.match(/\d+/)[0]));

        return sortedRevenue;
    };
    // -------------------------------------------------------------

    // --- LOGIC: Tính toán Thống kê Người dùng (CẬP NHẬT LỌC NĂM) ---
    const calculateUserStats = (userList, selectedYear) => {
        let newUsersToday = 0;
        let newUsersThisWeek = 0;
        let newUsersThisMonth = 0;
        let newUsersThisYear = 0;
        let totalFreeUsers = 0;
        let totalPaidUsers = 0;
        let totalExpiredUsers = 0;

        const now = convertToVNTime(new Date());
        const startOfTodayVN = getVNDateStart(now, 'day');
        // Đối với tuần/tháng/năm, ta nên lọc trong phạm vi Năm đang chọn để thống nhất
        const startOfSelectedYear = new Date(selectedYear, 0, 1).getTime();
        
        // 1. Lọc Người dùng theo Năm đang chọn (Dựa vào created_at)
        const usersInSelectedYear = userList.filter(user => {
            const createdDateVN = convertToVNTime(user.created_at);
            return createdDateVN && createdDateVN.getFullYear() === selectedYear;
        });

        // 2. Tính toán Thống kê (Chỉ trên usersInSelectedYear)
        usersInSelectedYear.forEach(user => {
            const createdDateVN = convertToVNTime(user.created_at);
            const createdTimeVN = createdDateVN.getTime();
            
            // Chỉ tính "Người dùng Mới" trong năm đó so với các mốc thời gian hiện tại
            // Lưu ý: Nếu muốn "Mới Hôm Nay" chỉ tính trong năm đó, ta dùng logic dưới:
            if (createdTimeVN >= startOfTodayVN) newUsersToday++;
            // Nếu bạn muốn "Mới Trong Tuần/Tháng" là tuần/tháng HIỆN TẠI:
            const sevenDaysAgoVN = getVNDateStart(now, 'week');
            const startOfMonthVN = getVNDateStart(now, 'month');

            if (createdTimeVN >= sevenDaysAgoVN) newUsersThisWeek++;
            if (createdTimeVN >= startOfMonthVN) newUsersThisMonth++;
            // Nếu là Năm đang được chọn thì luôn là người mới trong năm đó
            if (createdTimeVN >= startOfSelectedYear) newUsersThisYear++;


            // LOGIC PHÂN LOẠI PAID/FREE/EXPIRED (Áp dụng cho người dùng được tạo trong Năm đang chọn)
            if (user.status === true) {
                totalPaidUsers++;
            } else if (user.status === 'Expired') {
                totalExpiredUsers++;
            } else {
                totalFreeUsers++;
            }
        });
        
        // CẬP NHẬT TỶ LỆ DỰA TRÊN TỔNG SỐ NGƯỜI DÙNG CỦA NĂM ĐÓ
        setUserStats({
            newUsersToday,
            newUsersThisWeek,
            newUsersThisMonth,
            newUsersThisYear,
            totalFreeUsers,
            totalPaidUsers,
            totalExpiredUsers,
        });
    };
    // -------------------------------------------------------------

    // Fetch Data chỉ gọi 1 lần để lấy tất cả dữ liệu gốc
    const fetchData = useCallback(async () => {
        setApiLoading(true);

        try {
            const revenueRes = await getRevenueReportApi();
            const userRes = await getAllUsersApi();
            
            // 1. Xử lý Doanh thu và Giao dịch
            if (revenueRes.data && revenueRes.data.statusCode === 200 && revenueRes.data.data) {
                const data = revenueRes.data.data;
                const allMappedTransactions = (data.details || []).map(item => {
                    const dateVN = convertToVNTime(item.startDate);
                    return {
                        id: item.subscriptionId,
                        userEmail: item.userEmail,
                        type: item.planName || 'Subscription',
                        amount: item.price,
                        date: dateVN?.toLocaleDateString('vi-VN') || 'N/A', 
                        dateObject: dateVN, 
                        status: item.status 
                    };
                });
                setAllTransactions(allMappedTransactions);
            } 

            // 2. Xử lý Người dùng (Lưu trữ toàn bộ)
            if (userRes.data && userRes.data.statusCode === 200 && Array.isArray(userRes.data.data)) {
                setAllUsers(userRes.data.data); 
                // Không chạy calculateUserStats ở đây nữa, sẽ chạy trong useEffect
            } 

        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu báo cáo:', error);
            toast.error('Lỗi khi tải dữ liệu báo cáo.');
        } finally {
            setApiLoading(false);
        }
    }, [setApiLoading]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    // --- EFFECT MỚI: KÍCH HOẠT LỌC VÀ TÍNH TOÁN KHI THAY ĐỔI NĂM ---
    useEffect(() => {
        if (allUsers.length > 0) {
            // Cập nhật thống kê người dùng mỗi khi Năm thay đổi
            calculateUserStats(allUsers, yearFilter);
        }
        
        if (allTransactions.length > 0) {
            
            // 1. Cập nhật Biểu đồ Doanh thu (Lọc theo Năm)
            const monthlyData = processRevenueDetails(allTransactions, yearFilter);
            setMonthlyRevenue(monthlyData);
            
            // 2. Lọc Chi tiết Giao dịch (Lọc theo Năm VÀ Tháng)
            let filtered = allTransactions.filter(tx => 
                tx.dateObject && tx.dateObject.getFullYear() === yearFilter
            );
            
            if (monthFilter > 0) {
                filtered = filtered.filter(tx => 
                    tx.dateObject.getMonth() + 1 === monthFilter
                );
            }

            setTransactions(filtered);
        } else {
            setMonthlyRevenue([]);
            setTransactions([]);
        }
        
    }, [yearFilter, monthFilter, allTransactions, allUsers]); // Thêm allUsers và monthFilter vào dependency

    
    // --- CẬP NHẬT TỔNG DOANH THU (GIỮ NGUYÊN) ---
    useEffect(() => {
        const totalRevenue = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
        const completedTransactions = transactions.length;
        
        setSummary({
            totalRevenue: totalRevenue,
            completedTransactions: completedTransactions
        });
    }, [transactions]);
    // ------------------------------------------------------------------------------------------

    const totalUsers = userStats.totalFreeUsers + userStats.totalPaidUsers + userStats.totalExpiredUsers;
    const pieData = useMemo(() => ([
        { name: 'Gói Free', value: userStats.totalFreeUsers, color: PIE_COLORS[0] },
        { name: 'Gói Paid', value: userStats.totalPaidUsers, color: PIE_COLORS[1] },
        { name: 'Hết hạn', value: userStats.totalExpiredUsers, color: PIE_COLORS[2] },
    ].filter(d => d.value > 0)), [userStats]);
    
    // ... (CustomTooltip, getStatusBadgeClass, availableYears giữ nguyên) ...

    const CustomTooltip = ({ active, payload, label }) => { /* ... */ };
    const getStatusBadgeClass = (status) => { /* ... */ };
    const availableYears = useMemo(() => {
        const currentYear = getCurrentYear();
        return Array.from({ length: 4 }, (_, i) => currentYear - i);
    }, []);
    const currentMonthLabel = monthFilter === 0 ? "Tất cả các tháng" : `Tháng ${monthFilter}`;

    return (
        // ... (Phần hiển thị JSX giữ nguyên) ...
        <div className="manager-section revenue-manager">
            
            {/* HIỂN THỊ NĂM VÀ THÁNG ĐANG LỌC Ở ĐẦU */}
            <h2 className="main-title">📈 Báo cáo Doanh thu & Thống kê Chi tiết</h2>
            <div className="current-filter-info">
                Thông tin đang hiển thị: **{currentMonthLabel}, Năm {yearFilter}**
            </div>
            
            <hr style={{marginBottom: '20px'}}/>


            <div className="revenue-summary">
                {/* TỔNG DOANH THU ĐÃ ĐƯỢC CẬP NHẬT THEO LỌC */}
                <div className="summary-card">
                    <h4>Tổng Doanh thu (VND)</h4>
                    <p className="summary-value summary-value--green">{summary.totalRevenue.toLocaleString('vi-VN')}</p>
                </div>
                {/* SỐ GD HOÀN THÀNH ĐÃ ĐƯỢC CẬP NHẬT THEO LỌC */}
                <div className="summary-card">
                    <h4>Số GD Hoàn thành</h4>
                    <p className="summary-value">{summary.completedTransactions.toLocaleString()}</p>
                </div>
            </div>

            <hr/>
            
            {/* TỶ LỆ NGƯỜI DÙNG: ĐÃ ĐƯỢC LỌC THEO NGƯỜI DÙNG TẠO RA TRONG NĂM {yearFilter} */}
            <h3 style={{ marginTop: '30px' }}>📊 Tỷ lệ Người dùng ({yearFilter})</h3>
            <div className="revenue-charts-container">
                <div className="chart-wrapper half-width">
                     {/* Biểu đồ Tỷ lệ người đăng ký */}
                    {totalUsers > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    dataKey="value"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => [`${value.toLocaleString()} người`, 'Số lượng']}/>
                                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p style={{ textAlign: 'center', marginTop: '50px' }}>Không có dữ liệu người dùng để hiển thị tỷ lệ.</p>
                    )}
                </div>
                 {/* Biểu đồ Doanh thu theo tháng */}
                <div className="chart-wrapper half-width">
                    <h3 style={{ marginTop: '30px' }}>Doanh thu theo Từng Tháng ({yearFilter})</h3>
                    {monthlyRevenue.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlyRevenue}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Bar dataKey="revenue" name="Doanh thu" fill="#17a2b8" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p style={{ textAlign: 'center', marginTop: '50px' }}>
                            Không có dữ liệu giao dịch cho năm {yearFilter} để tạo báo cáo doanh thu theo tháng.
                        </p>
                    )}
                </div>
            </div>
            
            <hr/>
            
            {/* Thống kê Người dùng Mới & Hết hạn: ĐÃ ĐƯỢC LỌC THEO NGƯỜI DÙNG TẠO RA TRONG NĂM {yearFilter} */}
            <h3 style={{ marginTop: '30px' }}>👤 Thống kê Người dùng Mới & Hết hạn (Năm {yearFilter})</h3>
            <div className="user-stats-cards">
                <div className="stat-card stat-card--blue">
                    <i className="fas fa-sun"></i>
                    <div className="stat-info">
                        <p>Mới Hôm nay</p>
                        <p className="stat-value">{userStats.newUsersToday.toLocaleString()}</p>
                    </div>
                </div>
                <div className="stat-card stat-card--purple">
                    <i className="fas fa-calendar-week"></i>
                    <div className="stat-info">
                        <p>Mới Trong Tuần</p>
                        <p className="stat-value">{userStats.newUsersThisWeek.toLocaleString()}</p>
                    </div>
                </div>
                 <div className="stat-card stat-card--orange"> 
                    <i className="fas fa-user-slash"></i>
                    <div className="stat-info">
                        <p>Tổng Hết Hạn</p>
                        <p className="stat-value">{userStats.totalExpiredUsers.toLocaleString()}</p>
                    </div>
                </div>
                <div className="stat-card stat-card--red">
                    <i className="fas fa-calendar-check"></i>
                    <div className="stat-info">
                        <p>Mới Trong Năm</p>
                        <p className="stat-value">{userStats.newUsersThisYear.toLocaleString()}</p>
                    </div>
                </div>
            </div>


            <hr/>

            {/* Danh sách Giao dịch + Bộ lọc Năm/Tháng */}
            <div className="transaction-header">
                 <h3 style={{ marginTop: '30px', marginBottom: '10px' }}>Chi tiết Giao dịch</h3>
                 <div className="filter-group">
                    {/* LỌC THEO NĂM */}
                    <label htmlFor="year-filter">Lọc theo Năm:</label>
                    <select
                        id="year-filter"
                        value={yearFilter}
                        onChange={(e) => { setYearFilter(parseInt(e.target.value)); setMonthFilter(0); }} // Reset tháng khi đổi năm
                        style={{ marginRight: '15px' }}
                    >
                        {availableYears.map(year => (
                            <option key={year} value={year}>
                                Năm {year}
                            </option>
                        ))}
                    </select>

                    {/* LỌC THEO THÁNG */}
                    <label htmlFor="month-filter">Lọc theo Tháng:</label>
                    <select
                        id="month-filter"
                        value={monthFilter}
                        onChange={(e) => setMonthFilter(parseInt(e.target.value))}
                    >
                        <option value={0}>Tất cả các tháng</option>
                        {[...Array(12).keys()].map(i => (
                            <option key={i + 1} value={i + 1}>
                                Tháng {i + 1}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            
            <div className="transaction-table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Mã GD</th>
                            <th>Người dùng</th>
                            <th>Loại Gói</th>
                            <th>Số tiền</th>
                            <th>Ngày GD</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.length > 0 ? (
                            transactions.map(tx => (
                                <tr key={tx.id}>
                                    <td>{tx.id}</td>
                                    <td>{tx.userEmail}</td>
                                    <td>{tx.type}</td>
                                    <td style={{ fontWeight: 'bold' }}>{tx.amount.toLocaleString('vi-VN')} VND</td>
                                    <td>{tx.date}</td>
                                    <td>
                                        <span className={`badge ${getStatusBadgeClass(tx.status)}`}>
                                            {tx.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center' }}>
                                    {monthFilter > 0 
                                        ? `Không có giao dịch nào trong Tháng ${monthFilter}, Năm ${yearFilter}.`
                                        : `Không có giao dịch nào trong Năm ${yearFilter}.`}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RevenueManager;