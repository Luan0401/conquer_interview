import React, { useState, useEffect, useCallback } from 'react';
import './index.scss';
import { getRevenueReportApi } from '../../../config/authApi'; // import hàm API

const RevenueManager = ({ setApiLoading }) => {
    const [summary, setSummary] = useState({ totalRevenue: 0, completedTransactions: 0 });
    const [transactions, setTransactions] = useState([]);

    const fetchData = useCallback(async () => {
        setApiLoading(true);
        try {
            const res = await getRevenueReportApi();

            if (res.data.statusCode === 200 && res.data.data) {
                const data = res.data.data;

                // --- Tổng quan
                setSummary({
                    totalRevenue: data.totalRevenue,
                    completedTransactions: data.totalSubscriptions
                });

                // --- Map chi tiết giao dịch
                const mappedTransactions = data.details.map(item => ({
                    id: item.subscriptionId,
                    userEmail: item.userEmail,
                    type: item.planName || 'Subscription',
                    amount: item.price,
                    date: item.startDate,
                    status: item.status // Active / Expired
                }));

                setTransactions(mappedTransactions);
            } else {
                console.warn('API trả về không đúng định dạng:', res.data);
            }
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
                            <td>
                                <span className={`badge badge--${tx.status.toLowerCase()}`}>
                                    {tx.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RevenueManager;
