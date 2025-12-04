import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { toast } from "react-toastify";
import { Home } from "lucide-react"; 
import "./index.scss";

// GIẢ ĐỊNH: Import hàm API lấy báo cáo
import { getSessionReportApi } from "../../config/authApi"; 

// --- Hàm ánh xạ dữ liệu từ JSON API sang định dạng hiển thị của Card (string[]) ---
const mapReportToDisplay = (report) => {
 // Chuyển đổi các trường từ JSON báo cáo thành mảng string[]
 const overall = [report.overallAssessment];
 const facial = [report.facialExpression];
 const speedClarity = [report.speakingSpeedClarity, `Thời gian trả lời: ${report.responseDurationPerQuestion}`];
 const expertise = [
  report.expertiseExperience,
  report.problemSolvingSkills // Gộp kỹ năng giải quyết vấn đề vào đây
 ];
 const comparison = [report.comparisonWithOtherCandidates];
 const contentAnalysis = [report.answerContentAnalysis];

 return {
  overall,
  facial,
  speedClarity,
  expertise,
  comparison,
  contentAnalysis,
 };
};
// ----------------------------------------------------------------------------------

export default function ReportInterview() {
const [searchParams] = useSearchParams();
const navigate = useNavigate();
const sessionId = searchParams.get('sessionId');

// State lưu toàn bộ dữ liệu báo cáo từ API
const [fullReportData, setFullReportData] = useState(null); 

// Lấy index từ URL Query Params, mặc định là 0
const initialQuestionIndex = parseInt(searchParams.get('questionIndex')) || 0;
const [currentQuestionIndex, setCurrentQuestionIndex] = useState(initialQuestionIndex); 

// State lưu dữ liệu đã được ánh xạ (mảng string) cho card
const [displayData, setDisplayData] = useState(null); 

const [loading, setLoading] = useState(true);

    // --- HÀM CHUYỂN ĐỔI TRANG DỰA TRÊN INDEX (Pagination) ---
  const handlePageChange = useCallback((index) => {
        const total = fullReportData?.reports?.length || 0;
        if (index >= 0 && index < total) {
            setCurrentQuestionIndex(index);
        }
    }, [fullReportData]);

    // --- HÀM QUAY LẠI CÂU TRƯỚC ĐÓ ---
  const handlePreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [currentQuestionIndex]);

  // --- HÀM QUA CÂU TIẾP THEO ---
  const handleNextQuestion = useCallback(() => {
    if (fullReportData && currentQuestionIndex < fullReportData.reports.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Đã xem hết báo cáo
      toast.info("Bạn đã xem hết báo cáo chi tiết.");
      // Chuyển về trang chủ sau khi hoàn tất xem
      navigate("/"); 
    }
  }, [fullReportData, currentQuestionIndex, navigate]);

// API Call: Lấy dữ liệu báo cáo thật (Giữ nguyên)
const fetchData = useCallback(async () => {
  if (!sessionId) {
    setLoading(false);
    toast.error("Không tìm thấy ID phiên để tạo báo cáo.");
    return navigate("/");
  }
  
 try {
  // GIẢ ĐỊNH: getSessionReportApi đã được tạo và hoạt động
  const res = await getSessionReportApi(sessionId); 
    
    const apiData = res.data.data; // Lấy dữ liệu lồng trong 'data'
    setFullReportData(apiData);
    
 } catch (err) {
  console.error("API error:", err);
  toast.error("Lỗi khi tải báo cáo. Vui lòng kiểm tra API.");
  setFullReportData(null);
 } finally {
  setLoading(false);
 }
}, [sessionId, navigate]);

useEffect(() => {
fetchData();
}, [fetchData]);

 // Hook để cập nhật DisplayData khi FullReportData hoặc Index thay đổi (Giữ nguyên)
 useEffect(() => {
  if (fullReportData?.reports?.length > 0) {
        // Đảm bảo index nằm trong phạm vi (để xử lý trường hợp người dùng chỉnh sửa URL)
        const safeIndex = Math.min(currentQuestionIndex, fullReportData.reports.length - 1);
        
   const currentReport = fullReportData.reports[safeIndex];
   const mappedData = mapReportToDisplay(currentReport);
   setDisplayData(mappedData);

        // Cập nhật lại index nếu nó bị lệch ban đầu
        if (safeIndex !== currentQuestionIndex) {
            setCurrentQuestionIndex(safeIndex);
        }
  }
 }, [fullReportData, currentQuestionIndex]);


// Component render card đã được cập nhật (Giữ nguyên)
const renderBox = (title, content, locked = false) => (
<div className="info-card">
<h3 className="card-title">{title}</h3>
<div className="card-content">
 {locked ? (
 <div className="locked-content">
 <Lock size={32} />
 <p>Nội dung này được hiển thị trong mục "Báo cáo cá nhân"</p>
 </div>
 ) : loading ? (
 <span className="placeholder">Đang tải...</span>
 ) : content && Array.isArray(content) ? (
 <ul>
 {content.map((item, index) => (
 <li key={index}>{item}</li>
 ))}
 </ul>
 ) : (
 <span className="placeholder">Dữ liệu chưa phân tích</span>
 )}
</div>
</div>
);

 if (loading) {
  return <div className="report-page loading-screen">Đang tải báo cáo...</div>;
 }
 
 if (!fullReportData || fullReportData.reports?.length === 0) {
  return <div className="report-page error-screen">Không có dữ liệu báo cáo cho phiên này.</div>;
 }

 const currentReport = fullReportData.reports[currentQuestionIndex];
 const totalQuestions = fullReportData.reports.length;
 const currentQuestionNumber = currentQuestionIndex + 1;


return (
<div className="report-page">
<header className="header">
 
    {/* NÚT QUAY LẠI TRANG CHỦ */}
  <button className="back-button btn-home" onClick={() => navigate('/ReportHistory')}>
  <Home size={18} style={{ marginRight: 5 }}/> Lịch sử
  </button>
    
  <p className="session-id-display">
  {`Phiên ID: ${fullReportData.sessionId}`}
  </p>
</header>

<div className="question-section">
 <h2 className="question-text">
 {`Câu ${currentQuestionNumber} / ${totalQuestions}: ${currentReport.questionText}`}
 </h2>

    {/* --- THANH PHÂN TRANG (PAGINATION) --- */}
    <div className="question-pagination-wrapper">
        {Array.from({ length: totalQuestions }, (_, index) => (
            <button
                key={index}
                className={`pagination-item ${index === currentQuestionIndex ? 'active' : ''}`}
                onClick={() => handlePageChange(index)}
            >
                {index + 1}
            </button>
        ))}
    </div>
    {/* ------------------------------------- */}

 <p className="attempt-number">
   {`Vị trí phỏng vấn: ${fullReportData.jobPosition || 'Chưa xác định'}`}
  </p>
</div>

<div className="analysis-grid">
  {/* Đánh giá Tổng quan (Gộp cả Overall Assessment và các phân tích chung) */}
 {renderBox("Đánh giá tổng quan", displayData?.overall)} 
 {renderBox("Biểu cảm", displayData?.facial)}
 {renderBox("Tốc độ nói và thời lượng", displayData?.speedClarity)} 
 {renderBox("Chuyên môn & Kinh nghiệm", displayData?.expertise)} 
 
  {/* Phân tích Nội dung (Không bị khóa) */}
  {renderBox("Phân tích nội dung câu trả lời", displayData?.contentAnalysis)} 
  
  {/* Các mục Khóa/Premium */}
 {renderBox("So sánh với ứng viên khác", displayData?.comparison, true)} 
 {renderBox("Kỹ năng xử lý tình huống", displayData?.expertise, true)} {/* Dùng expertise nếu không có fields khác */}
 {renderBox("Lộ trình cải thiện cá nhân", ["Chi tiết chỉ có trong gói Premium"], true)}
</div>

<div className="continue-action">
    {/* NÚT QUAY LẠI CÂU TRƯỚC */}
    {currentQuestionIndex > 0 && (
      <button className="back-button" onClick={handlePreviousQuestion}>
        &#9664; Quay lại
      </button>
    )}

 <button className="continue-button btn-primary" onClick={handleNextQuestion}>
 {currentQuestionIndex < totalQuestions - 1 ? 'TIẾP TỤC' : 'HOÀN TẤT XEM BÁO CÁO'}
 </button>
</div>
</div>
);
}