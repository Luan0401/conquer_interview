import React, { useEffect, useState } from "react";
import "./index.scss"; 
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { CheckCircleOutlined, InfoCircleOutlined } from "@ant-design/icons"; // Thêm icon InfoCircle
import { getSubscriptionPlansApi, createPaymentLinkApi, createOrderApi } from "../../config/authApi";

export default function PricingPage() {
    const navigate = useNavigate();
    const [prices, setPrices] = useState({ free: 0, premium: 0 });
    const currentUserId = parseInt(sessionStorage.getItem('userId') || '0');
    const isAuthenticated = currentUserId !== 0;
    const DEFAULT_PLAN_ID = 1;
    
    // >>> LOGIC MỚI: Đọc trạng thái đăng ký từ sessionStorage
    // Trạng thái: 1 = Đã đăng ký (Subscribed), 0 = Chưa đăng ký (Not Subscribed)
    const subscriptionStatus = sessionStorage.getItem('userStatus');
    const isSubscribed = subscriptionStatus === '1';

    useEffect(() => {
        const fetchPrices = async () => {
            try {
                const res = await getSubscriptionPlansApi();
                
                const planList = res.data.data; 
                
                if (planList && planList.length > 0) {
                    const premiumPackage = planList.find((p) => p.planName === "Premium");
                    
                    setPrices({
                        free: 0,
                        premium: premiumPackage?.price || 0,
                    });
                }
            } catch (error) {
                console.error("Lỗi khi lấy giá gói:", error);
                toast.error("Không thể tải giá gói đăng ký!");
            }
        };
        
        // Chỉ tải giá nếu người dùng chưa đăng ký gói (để tránh lãng phí API)
        if (!isSubscribed) {
            fetchPrices();
        }
    }, [isSubscribed]); // Thêm isSubscribed vào dependency array

    // (Giữ nguyên handleFreeTrial và handlePremiumPayment)
    const handleFreeTrial = () => {
        toast.info("Bạn đang dùng gói miễn phí!");
        navigate("/");
    };

    const handlePremiumPayment = async () => {
        if (!isAuthenticated) {
            toast.warn("Vui lòng đăng nhập để thực hiện nâng cấp gói.");
            navigate('/login');
            return;
        }

        let toastId = toast.loading("Đang khởi tạo đơn hàng và liên kết thanh toán...");

        try {
            const orderResponse = await createOrderApi(currentUserId, DEFAULT_PLAN_ID);
            const orderData = orderResponse.data.data;
            const orderId = orderData.orderId;
            
            if (!orderId) {
                toast.update(toastId, { render: "Lỗi: Không nhận được Order ID.", type: "error", isLoading: false, autoClose: 3000 });
                return;
            }

            const baseUrl = window.location.origin;
            const returnUrl = `${baseUrl}/payment-success?orderId=${orderId}`; 
            const cancelUrl = `${baseUrl}/payment-failure?orderId=${orderId}`; 

            const paymentLinkResponse = await createPaymentLinkApi(orderId, returnUrl, cancelUrl);
            
            const payUrl = paymentLinkResponse.data.data.paymentUrl; 

            if (payUrl) {
                toast.update(toastId, { render: "Đang chuyển hướng đến cổng thanh toán...", type: "info", isLoading: false, autoClose: 3000 });
                window.location.href = payUrl; 
            } else {
                toast.update(toastId, { render: "Không thể tạo liên kết thanh toán.", type: "error", isLoading: false, autoClose: 3000 });
            }

        } catch (error) {
            console.error("Lỗi quy trình thanh toán:", error.response ? error.response.data : error.message);
            toast.update(toastId, { render: "Lỗi hệ thống khi tạo thanh toán.", type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    // --- RENDER CONDITIONAL ---
    
    // Giao diện khi người dùng đã đăng ký gói
    if (isSubscribed) {
        return (
            <div className="pricing-container subscribed-status">
                <div className="alert-card">
                    <InfoCircleOutlined className="alert-icon" />
                    <h2 className="alert-title">🎉 Chúc mừng! Bạn đã đăng ký gói thành công!</h2>
                    <p className="alert-message">
                        Hệ thống đã ghi nhận bạn đang sử dụng **Gói Cao cấp (Premium)**. Bạn có thể tận hưởng 
                        tất cả các tính năng không giới hạn ngay bây giờ.
                    </p>
                    <button className="btn-go-home" onClick={() => navigate('/')}>
                        Bắt đầu luyện tập ngay!
                    </button>
                    <p className="alert-note">
                        Nếu có bất kỳ thắc mắc nào về gói dịch vụ, vui lòng liên hệ bộ phận hỗ trợ.
                    </p>
                </div>
            </div>
        );
    }
    
    // Giao diện mặc định (khi người dùng chưa đăng ký)
    return (
        <div className="pricing-container">
            <h2 className="pricing-title">Lựa Chọn Gói Dịch Vụ Phù Hợp</h2>
            <p className="pricing-subtitle">
                Bắt đầu miễn phí, sau đó nâng cấp để khai phá toàn bộ sức mạnh của AI.
            </p>

            <div className="pricing-cards">
                
                {/* === THẺ CAO CẤP (Nổi bật) === */}
                <div className="pricing-card premium">
                    <div className="card-badge">Phổ biến nhất</div>
                    <h3>Cao cấp (Premium)</h3>
                    
                    <div className="price-wrapper">
                        <span className="amount">{prices.premium.toLocaleString()}đ</span>
                        <span className="duration">/ tháng</span>
                    </div>
                    
                    <p className="card-description">
                        Toàn bộ tính năng, không giới hạn, dành cho người muốn chinh phục mọi cuộc phỏng vấn.
                    </p>
                    
                    <button className="btn-premium" onClick={handlePremiumPayment}>
                        Nâng Cấp Ngay
                    </button>
                    
                    <ul className="features-list">
                        <li><CheckCircleOutlined /> <strong>Không giới hạn</strong> lượt luyện tập</li>
                        <li><CheckCircleOutlined /> Mở khoá ngân hàng câu hỏi <strong>chuyên sâu & nâng cao</strong></li>
                        <li><CheckCircleOutlined /> <strong>Hội thoại trực tiếp</strong> với AI Agent thông minh</li>
                        <li><CheckCircleOutlined /> Nhận <strong>phân tích chi tiết</strong> & báo cáo hiệu suất</li>
                        <li><CheckCircleOutlined /> Lưu trữ lịch sử & <strong>theo dõi lộ trình tiến bộ</strong></li>
                    </ul>
                </div>

                {/* === THẺ MIỄN PHÍ === */}
                <div className="pricing-card free">
                    <h3>Miễn phí (Free)</h3>
                    
                    <div className="price-wrapper">
                        <span className="amount">{prices.free.toLocaleString()}đ</span>
                        <span className="duration">/ tháng</span>
                    </div>

                    <p className="card-description">
                        Trải nghiệm các tính năng cơ bản của mô phỏng phỏng vấn AI.
                    </p>
                    
                    <button className="btn-free" onClick={handleFreeTrial}>
                        Bắt Đầu Miễn Phí
                    </button>
                    
                    <ul className="features-list">
                        <li><CheckCircleOutlined /> <strong>Giới hạn 3 lượt</strong> luyện tập</li>
                        <li><CheckCircleOutlined /> Truy cập câu hỏi phỏng vấn <strong>cơ bản</strong></li>
                        <li><CheckCircleOutlined /> Xem <strong>báo cáo tổng quan</strong> sau luyện tập</li>
                        <li><CheckCircleOutlined /> Trải nghiệm mô phỏng phỏng vấn AI</li>
                    </ul>
                </div>
                
            </div>
        </div>
    );
}