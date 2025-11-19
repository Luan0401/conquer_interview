import React, { useState, useEffect, useCallback } from 'react';
import './index.scss'; // Tái sử dụng SCSS chung

const ReportManager = ({ setApiLoading }) => {
    const [reports, setReports] = useState([]);

    // **VỊ TRÍ GỌI API:** Lấy danh sách báo cáo
    const fetchReports = useCallback(async () => {
        setApiLoading(true);
        try {
            // Thay thế URL này bằng API gốc của bạn: GET /api/admin/reports
            // const response = await fetch('/api/admin/reports');
            // const data = await response.json();
            // setReports(data.reports);

            // Dữ liệu giả định
            const mockData = [
                { id: 201, reporter: 'user1@mail.com', content: 'Lỗi phát âm AI không hoạt động.', status: 'New', date: '2023-11-15' },
                { id: 202, reporter: 'user2@mail.com', content: 'Yêu cầu hoàn tiền gói Premium.', status: 'Processing', date: '2023-11-16' },
                { id: 203, reporter: 'user3@mail.com', content: 'Đánh giá bị chấm sai.', status: 'Resolved', date: '2023-11-17' },
            ];
            setReports(mockData);

        } catch (error) {
            console.error('Lỗi khi lấy danh sách báo cáo:', error);
        } finally {
            setApiLoading(false);
        }
    }, [setApiLoading]);


    // **VỊ TRÍ GỌI API:** Cập nhật trạng thái báo cáo
    const handleUpdateStatus = async (reportId, newStatus) => {
        setApiLoading(true);
        try {
            // Thay thế URL này bằng API gốc của bạn: PUT /api/admin/reports/{reportId}
            // await fetch(`/api/admin/reports/${reportId}`, {
            //     method: 'PUT',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ status: newStatus })
            // });

            // Cập nhật giả định
            setReports(reports.map(report =>
                report.id === reportId ? { ...report, status: newStatus } : report
            ));
            alert(`Cập nhật trạng thái báo cáo ${reportId} thành ${newStatus}`);
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái:', error);
        } finally {
            setApiLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    return (
        <div className="manager-section">
            <h2>Quản lý Báo cáo/Phản hồi</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Người gửi</th>
                        <th>Nội dung Tóm tắt</th>
                        <th>Ngày gửi</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {reports.map(report => (
                        <tr key={report.id}>
                            <td>{report.id}</td>
                            <td>{report.reporter}</td>
                            <td>{report.content.substring(0, 70)}...</td>
                            <td>{report.date}</td>
                            <td><span className={`badge badge--${report.status.toLowerCase()}`}>{report.status}</span></td>
                            <td>
                                <select
                                    value={report.status}
                                    onChange={(e) => handleUpdateStatus(report.id, e.target.value)}
                                >
                                    <option value="New">Mới</option>
                                    <option value="Processing">Đang xử lý</option>
                                    <option value="Resolved">Đã giải quyết</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ReportManager;