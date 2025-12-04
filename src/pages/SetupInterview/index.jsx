import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./index.scss";
import { createSessionInterviewApi } from "../../config/authApi";

// Thời gian trả lời mặc định cho mỗi câu hỏi (phút)
const TIME_PER_QUESTION_MINUTES = 2;

// DỮ LIỆU CỐ ĐỊNH CHO PAYLOAD (HARDCODED VALUES)
const HARDCODED_JOB_POSITION = "Công nghệ thông tin";
const HARDCODED_TOPIC = "Kỹ sư Phần mềm (Backend)";
const HARDCODED_INDUSTRY = "Tài chính/Fintech";

// DỮ LIỆU HIỂN THỊ (CHO DROP-DOWN)
const DISPLAY_DATA = {
    jobPositions: ["Intern Developer", "Fresher Developer", "Junior Developerm", "Mid-Level Developer", "Senior Developer"],
    topics: ["Backend", "DevOps / Cloud", "Fullstack"],
    industries: ["Kỹ thuật phần mềm"],
};

export default function SetupInterview() {
    const navigate = useNavigate();

    // NEW STATE: Quản lý trạng thái loading
    const [isLoading, setIsLoading] = useState(false); 

    // 1. STATE ĐIỀU KHIỂN DROPDOWN (Giá trị người dùng nhìn thấy)
    const [jobPositionDisplay, setJobPositionDisplay] = useState(DISPLAY_DATA.jobPositions[0]);
    const [topicDisplay, setTopicDisplay] = useState(DISPLAY_DATA.topics[0]);
    const [industryDisplay, setIndustryDisplay] = useState(DISPLAY_DATA.industries[0]);
    
    // Dữ liệu người dùng nhập
    const [questionEasy, setQuestionEasy] = useState(5);
    const [questionDifficult, setQuestionDifficult] = useState(3); 
    // Dữ liệu tính toán
    const [durationMinutes, setDurationMinutes] = useState(0); 
    
    // 2. LOGIC LẤY USER ID AN TOÀN TỪ SESSION STORAGE
    const userIdString = sessionStorage.getItem("userId");
    const initialUserId = parseInt(userIdString) || 1; // Parse an toàn, mặc định là 1
    const [userId] = useState(initialUserId);

    // --- LOGIC TÍNH TOÁN THỜI LƯỢNG ---
    useEffect(() => {
        const easy = parseInt(questionEasy) || 0;
        const difficult = parseInt(questionDifficult) || 0;
        const totalQuestions = easy + difficult;
        const calculatedDuration = totalQuestions * TIME_PER_QUESTION_MINUTES;
        setDurationMinutes(calculatedDuration);
    }, [questionEasy, questionDifficult]);

    // --- HÀM XỬ LÝ KHI BẤM BẮT ĐẦU ---
    const handleStartSession = async (e) => {
        e.preventDefault();

        const totalQuestions = (parseInt(questionEasy) || 0) + (parseInt(questionDifficult) || 0);

        if (totalQuestions <= 0) {
            toast.error("Vui lòng nhập số lượng câu hỏi.");
            return;
        }

        if (isLoading) return; 

        setIsLoading(true); 
        let toastId = toast.loading("Đang tạo phiên phỏng vấn AI, vui lòng đợi...");

        const payload = {
            // GỬI GIÁ TRỊ HARDCODED CHO API
            userId: userId,
            jobPosition: HARDCODED_JOB_POSITION, 
            topic: HARDCODED_TOPIC, 
            industry: HARDCODED_INDUSTRY, 
            durationMinutes: durationMinutes,
            questionEasy: parseInt(questionEasy) || 0,
            questionDifficult: parseInt(questionDifficult) || 0,
        };

        try {
            const response = await createSessionInterviewApi(payload);
            const responseData = response.data.data;

            const sessionId = responseData?.sessionId;
            const questionsList = responseData?.questions;

            if (!sessionId || !questionsList || questionsList.length === 0) {
                toast.update(toastId, { render: "Lỗi: Không nhận được câu hỏi.", type: "error", isLoading: false, autoClose: 3000 });
                return;
            }

            toast.update(toastId, { render: `Đã khởi tạo phiên thành công!`, type: "success", isLoading: false, autoClose: 3000 });
            
            navigate("/InterviewPage", {
                state: { sessionId: sessionId, questions: questionsList } 
            });
        } catch (error) {
            console.error("Lỗi khi khởi tạo phiên:", error.response ? error.response.data : error.message);
            toast.update(toastId, { render: "Lỗi: Không thể khởi tạo phiên phỏng vấn.", type: "error", isLoading: false, autoClose: 3000 });
        } finally {
            setIsLoading(false);
        }
    };
    
    // --- HÀM VALIDATE INPUT ---
    const handleChange = (e, setter) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) {
            setter(value);
        }
    };

    // --- HÀM RENDER DROPDOWN CUSTOM ---
    const renderSelect = (label, value, setter, options) => (
        <div className="form-group">
            <label>{label}</label>
            <select
                value={value}
                onChange={(e) => setter(e.target.value)}
                className="custom-select"
            >
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );
    
    // --- GIAO DIỆN ---
    return (
        <div className="setup-interview-container">
            <form className="setup-form" onSubmit={handleStartSession}>
                <h2>Thiết Lập Phiên Phỏng Vấn</h2>
                <p className="form-description">
                    Cài đặt các thông số để AI tạo ra kịch bản phỏng vấn phù hợp nhất với bạn.
                </p>

                {/* --- THÔNG TIN CỐ ĐỊNH (DROPDOWN HIỂN THỊ) --- */}
                {renderSelect("Vị trí Tuyển dụng", jobPositionDisplay, setJobPositionDisplay, DISPLAY_DATA.jobPositions)}
                {renderSelect("Chủ đề (Topic)", topicDisplay, setTopicDisplay, DISPLAY_DATA.topics)}
                {renderSelect("Ngành nghề (Industry)", industryDisplay, setIndustryDisplay, DISPLAY_DATA.industries)}

                {/* --- THÔNG TIN INPUT CỦA NGƯỜI DÙNG --- */}
                <div className="input-row">
                    <div className="form-group">
                        <label htmlFor="easy">Số câu hỏi Dễ (Easy)</label>
                        <input
                            id="easy" 
                            type="number" 
                            placeholder="Số câu hỏi dễ (VD: 5)"
                            value={questionEasy} 
                            onChange={(e) => handleChange(e, setQuestionEasy)} 
                            min="0"
                            // >>> ĐÃ THÊM: Giới hạn tối đa là 20
                            max="20" 
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="difficult">Số câu hỏi Khó (Difficult)</label>
                        <input
                            id="difficult" 
                            type="number" 
                            placeholder="Số câu hỏi khó (VD: 3)"
                            value={questionDifficult} 
                            onChange={(e) => handleChange(e, setQuestionDifficult)} 
                            min="0"
                            // >>> ĐÃ THÊM: Giới hạn tối đa là 20
                            max="20" 
                        />
                    </div>
                </div>

                {/* --- HIỂN THỊ THỜI LƯỢNG (Dựa trên tính toán) --- */}
                <div className="form-summary">
                    <p className="summary-item">Tổng số câu hỏi: 
                        <span>{(parseInt(questionEasy) || 0) + (parseInt(questionDifficult) || 0)} câu</span>
                    </p>
                    <p className="summary-item total-duration">Thời lượng ước tính ({TIME_PER_QUESTION_MINUTES} phút/câu): 
                        <span>{durationMinutes} phút</span>
                    </p>
                </div>
                
                <button type="submit" className="btn-start" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <span className="spinner"></span>
                            ĐANG XỬ LÝ...
                        </>
                    ) : (
                        "BẮT ĐẦU PHỎNG VẤN AI"
                    )}
                </button>
            </form>
        </div>
    );
}