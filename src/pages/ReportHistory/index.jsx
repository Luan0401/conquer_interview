import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { UserPlus, FileText, Home } from "lucide-react"; 
import "./index.scss";

// GIẢ ĐỊNH: Import hàm API lấy lịch sử báo cáo và tạo cá nhân hóa
import { getSessionReportHistoryApi, createPersonalizationPathApi } from "../../config/authApi"; 

// --- Hàm Utility: Định dạng thời gian (Giữ nguyên) ---
const formatSessionDate = (utcDateString) => {
    if (!utcDateString) return 'Chưa rõ ngày';
    try {
        const date = new Date(utcDateString);
        const utcMilliseconds = date.getTime();
        const offsetMilliseconds = 7 * 60 * 60 * 1000;
        const localDate = new Date(utcMilliseconds + offsetMilliseconds);
        
        return localDate.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false, 
        });
    } catch (e) {
        return 'Ngày không hợp lệ';
    }
};

// --- Hàm ánh xạ dữ liệu (Giữ nguyên) ---
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

export default function ReportHistory() {
    const navigate = useNavigate();
    
    const [historyData, setHistoryData] = useState([]); 
    
    const [selectedSessionId, setSelectedSessionId] = useState(null); 
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); 
    
    const [displayData, setDisplayData] = useState(null); 
    const [loading, setLoading] = useState(true);
    
    // NEW STATE: Quản lý trạng thái đang tạo lộ trình
    const [isCreating, setIsCreating] = useState(false); 

    const selectedSession = historyData.find(s => s.sessionId === selectedSessionId);
    const currentReport = selectedSession?.reports[currentQuestionIndex];


    // --- Logic Chuyển câu hỏi trong cùng Session (Đã fix) ---
    const handleNextItem = useCallback(() => {
        if (!selectedSession) return;
        
        const totalQuestions = selectedSession.reports.length;
        
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            handleCreatePersonalization(selectedSessionId);
        }
    }, [selectedSession, currentQuestionIndex, selectedSessionId]);
    
    // Hàm xử lý nút "Tạo lộ trình cá nhân hóa" (ĐÃ CẬP NHẬT LOADING)
    const handleCreatePersonalization = useCallback(async (sessionId) => {
        if (isCreating || !sessionId) {
            if (!sessionId) toast.error("Không tìm thấy Session ID.");
            return;
        }
        
        setIsCreating(true);
        const toastId = toast.loading(`Đang xử lý tạo lộ trình cho Session ${sessionId}, vui lòng đợi...`);

        try {
            // Gọi API tạo lộ trình (POST /api/Personalization/{sessionId}/create-path)
            await createPersonalizationPathApi(sessionId);
            
            toast.update(toastId, { render: "Tạo lộ trình cá nhân hóa thành công!", type: "success", isLoading: false, autoClose: 5000 });
            
            // Tùy chọn: Chuyển hướng người dùng đến trang xem lộ trình cá nhân hóa (ví dụ: /practice)
            navigate("/practice");

        } catch (error) {
            console.error("Lỗi tạo lộ trình:", error.response?.data || error.message);
            
            const errorMsg = error.response?.data?.Message || "Lỗi không xác định khi gọi AI.";
            
            toast.update(toastId, { render: `Thất bại: ${errorMsg}`, type: "error", isLoading: false, autoClose: 5000 });

        } finally {
            setIsCreating(false);
        }
    }, [isCreating, navigate]);


    // --- API Call: Lấy dữ liệu lịch sử báo cáo thật (Giữ nguyên) ---
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getSessionReportHistoryApi(); 
            const historyList = res.data.data; 
            
            if (historyList && historyList.length > 0) {
                const sortedList = historyList.sort((a, b) => b.sessionId - a.sessionId);
                setHistoryData(sortedList);
                setSelectedSessionId(sortedList[0].sessionId); 
            } else {
                toast.info("Bạn không có dữ liệu báo cáo nào.");
            }
        } catch (err) {
            console.error("API error:", err.response?.data || err.message);
            toast.info("Bạn không có dữ liệu báo cáo nào.");
            setHistoryData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Hook để cập nhật DisplayData khi vị trí Index thay đổi (Giữ nguyên)
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
    
    // Xử lý khi không có dữ liệu và tự động điều hướng về Home
    if (totalSessions === 0) {
        setTimeout(() => {
            navigate('/');
        }, 3000); 

        return (
            <div className="report-page error-screen full-center-flex">
                Không có dữ liệu lịch sử phỏng vấn. Đang quay lại Trang chủ...
            </div>
        );
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
                                setCurrentQuestionIndex(0); 
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
                    
                    {/* NÚT QUAY LẠI TRANG CHỦ (Header) */}
                    <button className="btn-back-home" onClick={() => navigate('/')}>
                         <Home size={18} style={{ marginRight: 5 }}/> Trang chủ
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
                    {/* NÚT QUAY LẠI CÂU TRƯỚC */}
                    {currentQuestionIndex > 0 && (
                        <button className="back-button" onClick={() => setCurrentQuestionIndex(prev => prev - 1)}>
                            &#9664; Câu trước đó
                        </button>
                    )}
                    
                    {isLastQuestionInCurrentSession ? (
                        // Nút khi đã xem hết Session hiện tại: TẠO LỘ TRÌNH CÁ NHÂN HÓA
                        <button 
                            className="create-personalization-button" 
                            onClick={() => handleCreatePersonalization(selectedSessionId)}
                            disabled={isCreating}
                        >
                            {isCreating ? (
                                <>
                                    <span className="spinner-small"></span>
                                    ĐANG TẠO...
                                </>
                            ) : (
                                <>
                                    <UserPlus size={20} style={{ marginRight: 8 }}/>
                                    TẠO LỘ TRÌNH CÁ NHÂN HÓA
                                </>
                            )}
                        </button>
                    ) : (
                        // Nút khi còn câu hỏi để xem: TIẾP TỤC
                        <button className="continue-button" onClick={handleNextItem}>
                            TIẾP TỤC
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}