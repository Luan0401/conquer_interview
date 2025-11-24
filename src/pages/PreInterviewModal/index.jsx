import React from 'react';
import { useNavigate } from 'react-router-dom';
import './index.scss';
import { CloseCircleOutlined } from '@ant-design/icons';

// Giả định: FREE_TRIAL_LIMIT là số lần dùng thử miễn phí
const FREE_TRIAL_LIMIT = 3;

// Props:
// - isOpen: boolean (Trạng thái hiển thị modal)
// - onClose: function (Đóng modal)
// - userStatus: number (0: Free, 1: Paid)
// - trialCount: number (Số lần đã dùng thử, chỉ cần khi userStatus = 0)
function PreInterviewModal({ isOpen, onClose, userStatus, trialCount }) {
    const navigate = useNavigate();

    if (!isOpen) {
        return null; // Không hiển thị nếu isOpen là false
    }

    // 1. Logic Điều Hướng
    const handleContinue = () => {
        // Sau khi xử lý logic, chuyển đến trang phỏng vấn
        onClose(); // Đóng modal
        navigate("/setup-interview");
    };

    const handleGoToPricing = () => {
        onClose(); // Đóng modal
        navigate("/pricing"); // Chuyển đến trang mua gói
    };

    // 2. Nội dung hiển thị
    let modalTitle = "";
    let modalContent = null;

    if (userStatus === 1) {
        // TRẠNG THÁI 1: Người dùng đã thanh toán (Paid/Premium)
        modalTitle = "BẮT ĐẦU PHỎNG VẤN";
        modalContent = (
            <div className="paid-content">
                <p>
                    Chào mừng bạn đến với phiên phỏng vấn không giới hạn.
                    Bạn đang ở trạng thái Premium, hãy tự tin luyện tập!
                </p>
                <div className="modal-actions">
                    <button className="btn-primary" onClick={handleContinue}>
                        BẮT ĐẦU PHỎNG VẤN
                    </button>
                </div>
            </div>
        );
    } else {
        // TRẠNG THÁI 0: Người dùng miễn phí (Free Trial)
        const remainingTrials = FREE_TRIAL_LIMIT - trialCount;

        if (remainingTrials > 0) {
            // Còn lượt dùng thử
            modalTitle = "DÙNG THỬ MIỄN PHÍ";
            modalContent = (
                <div className="free-trial-content">
                    <p>
                        Bạn đang sử dụng **Bản Miễn Phí**. Bạn còn **{remainingTrials}** lượt thử nghiệm nữa.
                        Hãy tận dụng cơ hội để đánh giá hiệu suất của AI!
                    </p>
                    <div className="modal-actions">
                        <button className="btn-secondary" onClick={handleGoToPricing}>
                            MUA GÓI NGAY
                        </button>
                        <button className="btn-primary" onClick={handleContinue}>
                            TIẾP TỤC ({remainingTrials} LƯỢT CÒN LẠI)
                        </button>
                    </div>
                </div>
            );
        } else {
            // Đã hết lượt dùng thử
            modalTitle = "HẾT LƯỢT DÙNG THỬ";
            modalContent = (
                <div className="trial-expired-content">
                    <p className='danger-text'>
                        Bạn đã sử dụng hết **{FREE_TRIAL_LIMIT}** lượt dùng thử miễn phí.
                        Để tiếp tục luyện tập không giới hạn và nhận báo cáo chuyên sâu,
                        vui lòng nâng cấp tài khoản.
                    </p>
                    <div className="modal-actions full-width">
                        <button className="btn-primary full-width" onClick={handleGoToPricing}>
                            MUA GÓI PREMIUM
                        </button>
                    </div>
                </div>
            );
        }
    }


    return (
        <div className="pre-interview-modal-overlay">
            <div className="pre-interview-modal">
                <button className="close-btn" onClick={onClose}>
                    <CloseCircleOutlined />
                </button>
                <h3 className="modal-title">{modalTitle}</h3>
                <div className="modal-divider"></div>
                {modalContent}
            </div>
        </div>
    );
}

export default PreInterviewModal;