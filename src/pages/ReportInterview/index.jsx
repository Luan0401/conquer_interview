import React, { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import "./index.scss"; // <-- BƯỚC 1: IMPORT FILE SCSS

export default function ReportInterview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Giả sử API trả về dữ liệu có cấu trúc là mảng các chuỗi
  useEffect(() => {
    // ---- Dữ liệu giả để demo, bạn có thể xóa khi kết nối API thật ----
    const mockData = {
      overview: [
        "Mục đích giải: Khá tốt",
        "Bạn có giọng nói rõ ràng, nội dung trả lời mạch lạc và biểu cảm thân thiện.",
        "Giao tiếp mắt chưa ổn định và kết thúc câu trả lời còn thiếu thuyết phục.",
        "Tỉ lệ câu trả lời đáp ứng 90/100% đáp án của hệ thống.",
      ],
      expression: [
        "Thời gian nhìn camera: 38/88s",
        "Tư thế: Ổn định",
        "Cảm xúc: Bình tĩnh, quan sát tốt, tự tin.",
        "Cảm xúc: Bình tĩnh, quan sát tốt, tự tin.",
      ],
      clarity: [
        "Tốc độ: 145 từ/phút",
        "Mức khuyến nghị: 110-140",
        "Độ rõ ràng: 84%",
        "Lỗi âm thanh phát hiện: 4 từ mơ tiếng",
      ],
      expertise: [
        "Từ khoá chuyên ngành: OOP, Agile, Microservices",
        "Số lần xuất hiện: 12",
        "Độ phù hợp: Cao",
      ],
      duration: [
        "Câu 1: 0:54 giây",
        "Câu 2: 2:32 phút",
        "Trung bình: 1:14 phút",
        "Cảnh báo: 3 câu trả lời quá dài",
      ],
      contentAnalysis: null,
      comparison: null,
      problemSolving: null,
    };
    setData(mockData);
    setLoading(false);
    // --------------------------------------------------------------------

    // const fetchData = async () => {
    //   try {
    //     const res = await axios.get("/api/interview/report");
    //     setData(res.data);
    //   } catch (err) {
    //     console.error("API error:", err);
    //     setData(null);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchData();
  }, []);

  // Component render card đã được cập nhật
  const renderBox = (title, content, locked = false) => (
    <div className="info-card">
      <h3 className="card-title">{title}</h3>
      <div className="card-content">
        {locked ? (
          <div className="locked-content">
            <Lock size={32} />
          </div>
        ) : loading ? (
          <span className="placeholder">Đang tải...</span>
        ) : content && Array.isArray(content) ? (
          // Render danh sách nếu content là một mảng
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

  return (
    // Sử dụng class SCSS thay cho Tailwind
    <div className="report-page">
      <header className="header">
        <button className="back-button" onClick={() => window.history.back()}>
          Lần 1 : 05/11/2025
        </button>
      </header>

      <div className="question-section">
        <h2 className="question-text">
          Câu 1: Trình bày cho tôi các khái niệm và ví dụ của lập trình hướng đối tượng?
        </h2>
        <p className="attempt-number">Lần 1</p>
      </div>

      <div className="analysis-grid">
        {renderBox("Đánh giá tổng quan", data?.overview)}
        {renderBox("Biểu cảm", data?.expression)}
        {renderBox("Tốc độ nói và độ rõ ràng", data?.clarity)}
        {renderBox("Chuyên môn & kinh nghiệm", data?.expertise)}
        {renderBox("Thời lượng trả lời từng câu", data?.duration)}
        {renderBox("Phân tích nội dung câu trả lời", data?.contentAnalysis, true)}
        {renderBox("So sánh với ứng viên khác", data?.comparison, true)}
        {renderBox("Kỹ năng xử lý tình huống", data?.problemSolving, true)}
        {renderBox("Phân tích tình huống", "Đây là một card trống để đủ 3x3", true)}
      </div>

      <div className="continue-action">
        <button className="continue-button">TIẾP TỤC</button>
      </div>
    </div>
  );
}