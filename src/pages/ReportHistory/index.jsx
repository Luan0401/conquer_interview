import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { UserPlus, FileText, Home } from "lucide-react"; 
import "./index.scss";

// GIẢ ĐỊNH: Import hàm API lấy lịch sử báo cáo
import { getSessionReportHistoryApi } from "../../config/authApi"; 

// --- Hàm Utility: Chuyển đổi và định dạng thời gian (UTC -> VN Time) ---
const formatSessionDate = (utcDateString) => {
    if (!utcDateString) return 'Chưa rõ ngày';
    try {
        // 1. Tạo đối tượng Date. Nếu chuỗi là ISO 8601 (như "2025-11-24T08:30:45"), 
        // nó được hiểu là UTC.
        const date = new Date(utcDateString);
        
        // 2. BÙ TRỪ MÚI GIỜ (+7 GIỜ cho Việt Nam)
        // Lấy thời gian UTC tính bằng milliseconds
        const utcMilliseconds = date.getTime();
        // Tính toán độ lệch 7 giờ (7 * 60 phút * 60 giây * 1000 ms)
        const offsetMilliseconds = 7 * 60 * 60 * 1000;
        
        // Áp dụng độ lệch (tạo một đối tượng Date mới đã được bù giờ)
        // Lưu ý: Nếu máy chủ của bạn đã xử lý việc chuyển đổi múi giờ, 
        // bạn chỉ cần new Date(utcDateString) mà thôi. 
        // Dòng dưới đây là để fix nếu máy chủ trả về giờ UTC thô.
        const localDate = new Date(utcMilliseconds + offsetMilliseconds);
        
        // 3. Định dạng lại
        // Sử dụng toLocaleString để đảm bảo định dạng 2 chữ số (DD/MM/YYYY HH:MM)
        return localDate.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false, // Dùng định dạng 24h
        });
        
    } catch (e) {
        console.error("Lỗi định dạng ngày:", e);
        return 'Ngày không hợp lệ';
    }
};
// ----------------------------------------------------------------------------------

// --- Hàm ánh xạ dữ liệu từ JSON API sang định dạng hiển thị của Card (string[]) ---
const mapReportToDisplay = (report) => {
    const overall = [report.overallAssessment];
    const facial = [report.facialExpression];
    const speedClarity = [report.speakingSpeedClarity, `Thời gian trả lời: ${report.responseDurationPerQuestion}`];
    const expertise = [report.expertiseExperience];
    const problemSolving = [report.problemSolvingSkills];
    const comparison = [report.comparisonWithOtherCandidates];
    const contentAnalysis = [report.answerContentAnalysis];
    
    return {
        overall, facial, speedClarity, expertise, problemSolving, comparison, contentAnalysis,
    };
};
// ----------------------------------------------------------------------------------

export default function ReportHistory() {
  const navigate = useNavigate();
  
  const [historyData, setHistoryData] = useState([]); 
  
  const [selectedSessionId, setSelectedSessionId] = useState(null); 
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); 
  
  const [displayData, setDisplayData] = useState(null); 
  const [loading, setLoading] = useState(true);

  const selectedSession = historyData.find(s => s.sessionId === selectedSessionId);
  const currentReport = selectedSession?.reports[currentQuestionIndex];


  // --- Logic Chuyển câu hỏi trong cùng Session (Đã fix) ---
  const handleNextItem = useCallback(() => {
    if (!selectedSession) return;
    
    const totalQuestions = selectedSession.reports.length;
    
    if (currentQuestionIndex < totalQuestions - 1) {
      // Chuyển sang câu hỏi tiếp theo trong Session hiện tại
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Đã là câu cuối, nút sẽ là "Tạo lộ trình cá nhân hóa" (được xử lý trong JSX)
            // Nếu người dùng cố tình bấm "TIẾP TỤC" khi nút đã chuyển đổi (lỗi front-end/UI), 
            // ta gọi hàm tạo lộ trình thay vì chuyển câu.
      handleCreatePersonalization(selectedSessionId);
    }
  }, [selectedSession, currentQuestionIndex, selectedSessionId]);
  
  // Hàm xử lý nút "Tạo lộ trình cá nhân hóa" (Giữ nguyên)
  const handleCreatePersonalization = useCallback((sessionId) => {
    if (sessionId) {
      toast.info(`Đang tạo lộ trình cá nhân hóa cho Session ID: ${sessionId}`);
    } else {
      toast.error("Không tìm thấy Session ID để tạo lộ trình.");
    }
  }, []);


  // --- API Call: Lấy dữ liệu lịch sử báo cáo thật (Giữ nguyên) ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSessionReportHistoryApi(); 
      const historyList = res.data.data; 
      
      if (historyList && historyList.length > 0) {
        const sortedList = historyList.sort((a, b) => b.sessionId - a.sessionId);
        setHistoryData(sortedList);
        // Mặc định chọn Session đầu tiên
        setSelectedSessionId(sortedList[0].sessionId); 
      } else {
        toast.info("Bạn chưa có lịch sử phỏng vấn nào.");
      }
      
    } catch (err) {
      console.error("API error:", err.response?.data || err.message);
      toast.error("Lỗi khi tải lịch sử báo cáo.");
      setHistoryData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Hook để cập nhật DisplayData khi vị trí Index thay đổi
  useEffect(() => {
    if (currentReport) {
      const mappedData = mapReportToDisplay(currentReport);
      setDisplayData(mappedData);
    } else if (selectedSessionId && historyData.length > 0) {
      setCurrentQuestionIndex(0); 
    }
  }, [currentReport, selectedSessionId, historyData]);

  
  // Logic kiểm tra câu hỏi cuối cùng của Session hiện tại
  const totalQuestions = selectedSession?.reports?.length || 0;
  const isLastQuestionInCurrentSession = selectedSession && 
                     currentQuestionIndex === totalQuestions - 1;

  // Component render card (Giữ nguyên)
  const renderBox = (title, content) => ( 
    <div className="info-card">
      <h3 className="card-title">{title}</h3>
      <div className="card-content">
        {loading || !currentReport ? (
          <span className="placeholder">Đang tải...</span>
        ) : content && Array.isArray(content) && content.length > 0 ? (
          <ul>
            {content.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        ) : (
          <span className="placeholder">Dữ liệu chưa phân tích hoặc không áp dụng.</span>
        )}
      </div>
    </div>
  );

  const totalSessions = historyData.length;
  
  if (loading) {
    return <div className="report-page loading-screen">Đang tải lịch sử báo cáo...</div>;
  }
  
  if (totalSessions === 0) {
    return <div className="report-page error-screen">Không có dữ liệu lịch sử phỏng vấn.</div>;
  }
  
  const currentQuestionNumber = currentQuestionIndex + 1;


  return (
    <div className="history-detail-container">
      {/* -------------------- CỘT 1: DANH SÁCH SESSIONS (SIDEBAR) -------------------- */}
      <div className="session-sidebar">
        
        
        
        <h2 className="sidebar-title">Lịch Sử ({totalSessions} Phiên)</h2>
        <div className="session-list">
          {historyData.map((session) => (
            <div 
              key={session.sessionId}
              className={`session-item ${session.sessionId === selectedSessionId ? 'active' : ''}`}
              onClick={() => {
                setSelectedSessionId(session.sessionId);
                setCurrentQuestionIndex(0); // Reset câu hỏi khi chọn Session mới
              }}
            >
              <div className="item-info">
                <FileText size={16} />
                <span>{formatSessionDate(session.sessionDate)}</span> 
              </div>
              <small>{session.jobPosition || 'Kỹ sư'}</small>
            </div>
          ))}
        </div>
      </div>

      {/* -------------------- CỘT 2: HIỂN THỊ BÁO CÁO CHI TIẾT -------------------- */}
      <div className="report-main-content">
        <header className="header">
          <h1 className="main-report-title">Báo Cáo Chi Tiết Phiên Phỏng Vấn</h1>
          
          {/* NÚT QUAY LẠI TRANG CHỦ */}
          <button className="btn-back-home" onClick={() => navigate('/')}>
            <Home size={18} style={{ marginRight: 5 }}/> Quay lại Trang chủ
          </button>
        </header>

        <div className="question-section">
          <h2 className="question-text">
            {`[PHIÊN: ${formatSessionDate(selectedSession?.sessionDate)}] Câu ${currentQuestionNumber} / ${totalQuestions}: ${currentReport?.questionText || 'Đang tải...'}`}
          </h2>
          <p className="attempt-number">
            {`Vị trí: ${selectedSession?.jobPosition || 'Chưa xác định'}`}
          </p>
        </div>

        <div className="analysis-grid">
          {renderBox("Đánh giá tổng quan", displayData?.overall)} 
          {renderBox("Biểu cảm", displayData?.facial)}
          {renderBox("Tốc độ nói và thời lượng", displayData?.speedClarity)} 
          {renderBox("Chuyên môn & Kinh nghiệm", displayData?.expertise)} 
          {renderBox("Phân tích Nội dung", displayData?.contentAnalysis)} 
          {renderBox("So sánh với ứng viên khác", displayData?.comparison)} 
          {renderBox("Kỹ năng Xử lý Tình huống", displayData?.problemSolving)}
          {renderBox("Lộ trình cải thiện cá nhân", ["Nhận gợi ý và bài tập cá nhân hóa."])}
          {renderBox("Phân tích bổ sung", ["Phân tích ngữ điệu và mức độ thuyết phục."])}
        </div>

        {/* Nút hành động (Xử lý logic isLastQuestionInCurrentSession) */}
        <div className="continue-action">
          {isLastQuestionInCurrentSession ? (
            // Nút khi đã xem hết Session hiện tại: TẠO LỘ TRÌNH CÁ NHÂN HÓA
            <button className="create-personalization-button" onClick={() => handleCreatePersonalization(selectedSessionId)}>
              <UserPlus size={20} style={{ marginRight: 8 }}/>
              TẠO LỘ TRÌNH CÁ NHÂN HÓA
            </button>
          ) : (
            // Nút khi còn câu hỏi để xem: TIẾP TỤC
            <button className="continue-button" onClick={handleNextItem}>
              TIẾP TỤC (Câu sau)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}