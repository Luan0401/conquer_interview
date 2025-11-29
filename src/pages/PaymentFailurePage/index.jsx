import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { XCircle, ArrowLeft } from 'lucide-react'; 
import './index.scss';

// GIẢ ĐỊNH: Import các hàm API và hooks cần thiết
import { cancelPaymentApi } from '../../config/authApi'; 
// Cần import toast và useNavigate nếu chưa import ở đầu
// import { toast } from 'react-toastify'; 

export default function PaymentFailurePage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const orderId = searchParams.get('orderId');
    
    // States quản lý trạng thái hủy
    const [isCancelling, setIsCancelling] = useState(true);
    const [isCancelledSuccessfully, setIsCancelledSuccessfully] = useState(false);
    const [statusMessage, setStatusMessage] = useState('Đang xử lý hủy đơn hàng...');

    // --- LOGIC GỌI API HỦY ĐƠN HÀNG ---
    const handlePaymentFailure = useCallback(async (id) => {
        if (!id) {
            setStatusMessage('Lỗi: Không tìm thấy Order ID.');
            setIsCancelling(false);
            return;
        }

        setIsCancelling(true);
        setStatusMessage(`Đang cập nhật trạng thái hủy cho Order ID: ${id}...`);

        try {
            // Gọi API Backend để cập nhật trạng thái Order thất bại
            await cancelPaymentApi(id); 
            
            // Nếu API trả về 200/204 thành công:
            setIsCancelledSuccessfully(true);
            setStatusMessage(`Giao dịch thất bại. Đơn hàng ${id} đã được hủy thành công trên hệ thống.`);
            toast.error(`Giao dịch thất bại. Đã hủy Order ${id}.`);
            
        } catch (error) {
            // Xử lý lỗi (Có thể lỗi 404 nếu Order không tồn tại hoặc lỗi server)
            setIsCancelledSuccessfully(false);
            setStatusMessage(`Xảy ra lỗi khi hủy đơn hàng ${id}. Vui lòng kiểm tra lại.`);
            toast.error(`Không thể hủy Order ${id}.`);
        } finally {
            setIsCancelling(false);
        }
    }, []);

    // --- Hook Kích hoạt khi component mount ---
    useEffect(() => {
        if (orderId) {
            handlePaymentFailure(orderId);
        }
    }, [orderId, handlePaymentFailure]);


    return (
        <div className="failure-container">
            <div className="failure-card">
                <XCircle size={60} className="icon-fail" />
                
                <h1 className="title">GIAO DỊCH THẤT BẠI</h1>
                
                <p className="message">
                    {isCancelling ? 'Vui lòng chờ đợi trong giây lát.' : statusMessage}
                </p>
                
                {orderId && !isCancelling && (
                    <p className="order-id-display">
                        Order ID: <strong>{orderId}</strong>
                    </p>
                )}

                <div className="actions">
                    <button className="btn-return" onClick={() => navigate('/pricing')} disabled={isCancelling}>
                        <ArrowLeft size={18} style={{ marginRight: 8 }}/>
                        Quay lại Trang Mua Gói
                    </button>
                </div>
            </div>
        </div>
    );
}