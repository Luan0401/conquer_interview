import React, { useState, useEffect, useCallback } from 'react';
import './index.scss'; // Tái sử dụng SCSS chung

const RevenueManager = ({ setApiLoading }) => {
    const [summary, setSummary] = useState({ totalRevenue: 0, completedTransactions: 0 });
    const [transactions, setTransactions] = useState([]);
    
    // **VỊ TRÍ GỌI API:** Lấy tổng quan doanh thu và danh sách giao dịch
    const fetchData = useCallback(async () => {
        setApiLoading(true);
        try {
            // Thay thế URL này bằng API gốc của bạn: GET /api/admin/revenue
            // const revenueResponse = await fetch('/api/admin/revenue');
            // const revenueData = await revenueResponse.json();
            // setSummary(revenueData.summary);
            // setTransactions(revenueData.transactions);
            
            // Dữ liệu giả định
            setSummary({ totalRevenue: 154000000, completedTransactions: 1250 });
            const mockTransactions = [
                { id: 101, userEmail: 'user1@mail.com', amount: 500000, type: 'Premium Subscription', date: '2023-10-01', status: 'Completed' },
                { id: 102, userEmail: 'user2@mail.com', amount: 1000000, type: 'Premium Subscription', date: '2023-10-05', status: 'Completed' },
                { id: 103, userEmail: 'user3@mail.com', amount: 50000, type: 'Buy Credits', date: '2023-10-10', status: 'Pending' },
            ];
            setTransactions(mockTransactions);

        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu doanh thu:', error);
        } finally {
            setApiLoading(false);
        }
    }, [setApiLoading]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <div className="manager-section">
            <h2>Kiểm tra Doanh thu và Giao dịch</h2>

            <div className="revenue-summary">
                <div className="summary-card">
                    <h4>Tổng Doanh thu</h4>
                    <p className="summary-value summary-value--green">{summary.totalRevenue.toLocaleString('vi-VN')} VND</p>
                </div>
                <div className="summary-card">
                    <h4>Số GD Hoàn thành</h4>
                    <p className="summary-value">{summary.completedTransactions.toLocaleString()}</p>
                </div>
            </div>

            <h3 style={{ marginTop: '30px' }}>Danh sách Giao dịch gần đây</h3>
            <table>
                <thead>
                    <tr>
                        <th>Mã GD</th>
                        <th>Người dùng</th>
                        <th>Loại GD</th>
                        <th>Số tiền</th>
                        <th>Ngày</th>
                        <th>Trạng thái</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map(tx => (
                        <tr key={tx.id}>
                            <td>{tx.id}</td>
                            <td>{tx.userEmail}</td>
                            <td>{tx.type}</td>
                            <td style={{ fontWeight: 'bold' }}>{tx.amount.toLocaleString('vi-VN')} VND</td>
                            <td>{tx.date}</td>
                            <td><span className={`badge badge--${tx.status.toLowerCase()}`}>{tx.status}</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RevenueManager;