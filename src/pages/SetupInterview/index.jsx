import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./index.scss"; // Import SCSS
import { createSessionInterviewApi } from "../../config/authApi";

// Thời gian trả lời mặc định cho mỗi câu hỏi (phút)
const TIME_PER_QUESTION_MINUTES = 2;

export default function SetupInterview() {
  const navigate = useNavigate();

  // NEW STATE: Quản lý trạng thái loading
  const [isLoading, setIsLoading] = useState(false); // Dữ liệu mặc định (Không cho người dùng chỉnh sửa)

  const [jobPosition] = useState("Công nghệ thông tin");
  const [topic] = useState("Kỹ sư Phần mềm (Backend)");
  const [industry] = useState("Tài chính/Fintech"); // Dữ liệu người dùng nhập
  const [questionEasy, setQuestionEasy] = useState(5);
  const [questionDifficult, setQuestionDifficult] = useState(3); // Dữ liệu tính toán
  const [durationMinutes, setDurationMinutes] = useState(0); // Giả lập userId, nên được lấy từ Auth Context/Redux
  const [userId] = useState(sessionStorage.getItem("userId") || 1); // --- LOGIC TÍNH TOÁN THỜI LƯỢNG ---

  useEffect(() => {
    const easy = parseInt(questionEasy) || 0;
    const difficult = parseInt(questionDifficult) || 0;
    const totalQuestions = easy + difficult;
    const calculatedDuration = totalQuestions * TIME_PER_QUESTION_MINUTES;
    setDurationMinutes(calculatedDuration);
  }, [questionEasy, questionDifficult]); // --- HÀM XỬ LÝ KHI BẤM BẮT ĐẦU (ĐÃ CẬP NHẬT LOADING) ---

  const handleStartSession = async (e) => {
    e.preventDefault();

    const totalQuestions =
      (parseInt(questionEasy) || 0) + (parseInt(questionDifficult) || 0);

    if (totalQuestions <= 0) {
      toast.error("Vui lòng nhập số lượng câu hỏi.");
      return;
    }

    if (isLoading) return; // Ngăn chặn bấm đúp

    setIsLoading(true); // Bắt đầu loading
    // Sử dụng toast.loading để hiển thị thông báo "đang xử lý"
    let toastId = toast.loading("Đang tạo phiên phỏng vấn AI, vui lòng đợi...");

    const payload = {
      userId: parseInt(userId),
      jobPosition: jobPosition,
      topic: topic,
      industry: industry,
      durationMinutes: durationMinutes,
      questionEasy: parseInt(questionEasy) || 0,
      questionDifficult: parseInt(questionDifficult) || 0,
    };

    try {
      // Gọi API khởi tạo phiên phỏng vấn
      const response = await createSessionInterviewApi(payload);
      const responseData = response.data.data;

      const sessionId = responseData?.sessionId;
      const questionsList = responseData?.questions;

      if (!sessionId || !questionsList || questionsList.length === 0) {
        toast.update(toastId, {
          render: "Lỗi: Không nhận được câu hỏi.",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        return;
      }

      toast.update(toastId, {
        render: `Đã khởi tạo phiên thành công!`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      }); // CHUYỂN HƯỚNG
      navigate("/InterviewPage", {
        state: {
          sessionId: sessionId,
          questions: questionsList,
        },
      });
    } catch (error) {
      console.error(
        "Lỗi khi khởi tạo phiên:",
        error.response ? error.response.data : error.message
      );
      toast.update(toastId, {
        render: "Lỗi: Không thể khởi tạo phiên phỏng vấn.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false); // Tắt loading
    }
  }; // --- HÀM VALIDATE INPUT (Giữ nguyên) ---
  const handleChange = (e, setter) => {
    const value = e.target.value; // Chỉ cho phép nhập số dương
    if (/^\d*$/.test(value)) {
      setter(value);
    }
  }; // --- GIAO DIỆN (ĐÃ CẬP NHẬT NÚT) ---
  return (
    <div className="setup-interview-container">
      {" "}
      <form className="setup-form" onSubmit={handleStartSession}>
        <h2>Thiết Lập Phiên Phỏng Vấn</h2>{" "}
        <p className="form-description">
          Cài đặt các thông số để AI tạo ra kịch bản phỏng vấn phù hợp nhất với
          bạn.{" "}
        </p>
        {/* --- THÔNG TIN CỐ ĐỊNH --- */}{" "}
        <div className="form-group readonly">
          <label>Vị trí Tuyển dụng (Job Position)</label>
          <input type="text" value={jobPosition} readOnly />{" "}
        </div>{" "}
        <div className="form-group readonly">
          <label>Chủ đề (Topic)</label>
          <input type="text" value={topic} readOnly />{" "}
        </div>{" "}
        <div className="form-group readonly">
          <label>Ngành nghề (Industry)</label>
          <input type="text" value={industry} readOnly />{" "}
        </div>
        {/* --- THÔNG TIN INPUT CỦA NGƯỜI DÙNG --- */}{" "}
        <div className="input-row">
          {" "}
          <div className="form-group">
            {" "}
            <label htmlFor="easy">Số câu hỏi Dễ (Easy)</label>{" "}
            <input
              id="easy"
              type="number"
              placeholder="Số câu hỏi dễ (VD: 5)"
              value={questionEasy}
              onChange={(e) => handleChange(e, setQuestionEasy)}
              min="0"
            />{" "}
          </div>{" "}
          <div className="form-group">
            {" "}
            <label htmlFor="difficult">Số câu hỏi Khó (Difficult)</label>{" "}
            <input
              id="difficult"
              type="number"
              placeholder="Số câu hỏi khó (VD: 3)"
              value={questionDifficult}
              onChange={(e) => handleChange(e, setQuestionDifficult)}
              min="0"
            />{" "}
          </div>{" "}
        </div>
        {/* --- HIỂN THỊ THỜI LƯỢNG (Dựa trên tính toán) --- */}{" "}
        <div className="form-summary">
          {" "}
          <p className="summary-item">
            Tổng số câu hỏi:{" "}
            <span>
              {(parseInt(questionEasy) || 0) +
                (parseInt(questionDifficult) || 0)}{" "}
              câu
            </span>{" "}
          </p>{" "}
          <p className="summary-item total-duration">
            Thời lượng ước tính ({TIME_PER_QUESTION_MINUTES} phút/câu):{" "}
            <span>{durationMinutes} phút</span>{" "}
          </p>{" "}
        </div>{" "}
        <button type="submit" className="btn-start" disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="spinner"></span>
              ĐANG XỬ LÝ...
            </>
          ) : (
            "BẮT ĐẦU PHỎNG VẤN AI"
          )}{" "}
        </button>{" "}
      </form>{" "}
    </div>
  );
}
