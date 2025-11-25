import React from 'react';
import { useNavigate } from 'react-router-dom';
import './index.scss';
import { CloseCircleOutlined } from '@ant-design/icons';


// Props:
// - isOpen: boolean (Trạng thái hiển thị modal)
// - onClose: function (Đóng modal)
// - userStatus: number (0: Free, 1: Paid)
// - trialCount: number (Số lượt đã dùng, KHÔNG phải số lượt còn lại)
function PreInterviewModal({ isOpen, onClose, userStatus, trialCount }) {
  const navigate = useNavigate();

  if (!isOpen) {
    return null; // Không hiển thị nếu isOpen là false
  }

  // 1. Logic Điều Hướng
  const handleContinue = () => {
    // Sau khi xử lý logic, chuyển đến trang thiết lập phỏng vấn
    onClose(); // Đóng modal
    navigate("/setup-interview");
  };

  const handleGoToPricing = () => {
    onClose(); // Đóng modal
    navigate("/pricing"); // Chuyển đến trang mua gói
  };

  // 2. Tính toán trạng thái
  let modalTitle = "";
  let modalContent = null;
    
    // Số lượt dùng thử CÒN LẠI (Nếu BE trả về tổng số lần đã dùng)


  if (userStatus === 1) {
    // TRẠNG THÁI 1: Người dùng đã thanh toán (Paid/Premium)
    modalTitle = "BẮT ĐẦU PHỎNG VẤN";
    modalContent = (
      <div className="paid-content">
        <p>
          Chào mừng bạn đến với phiên phỏng vấn không giới hạn.
          Bạn đang ở trạng thái **Premium**, hãy tự tin luyện tập!
        </p>
        <div className="modal-actions">
          <button className="btn-primary" onClick={handleContinue}>
            BẮT ĐẦU PHỎNG VẤN
          </button>
        </div>
      </div>
    );
  } else if (userStatus === 0 && trialCount > 0) {
    // TRẠNG THÁI 0: Còn lượt dùng thử (> 0)
    modalTitle = "DÙNG THỬ MIỄN PHÍ";
    modalContent = (
      <div className="free-trial-content">
        <p>
          Bạn đang sử dụng **Bản Miễn Phí**. Bạn còn **{trialCount}** lượt thử nghiệm nữa.
          Hãy tận dụng cơ hội để đánh giá hiệu suất của AI!
        </p>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={handleGoToPricing}>
            MUA GÓI NGAY
          </button>
          <button className="btn-primary" onClick={handleContinue}>
            TIẾP TỤC ({trialCount} LƯỢT CÒN LẠI)
          </button>
        </div>
      </div>
    );
  } else {
    // TRẠNG THÁI 0: Đã hết lượt dùng thử (<= 0)
    modalTitle = "HẾT LƯỢT DÙNG THỬ";
    modalContent = (
      <div className="trial-expired-content">
        <p className='danger-text'>
          Bạn đã sử dụng hết ** 3 ** lượt dùng thử miễn phí.
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