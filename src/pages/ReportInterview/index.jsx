import React, { useEffect, useState } from "react";
import axios from "axios";
import { Lock } from "lucide-react";
import "./index.scss";

export default function ReportInterview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Giả sử API: GET /api/interview/report
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/interview/report");
        setData(res.data);
      } catch (err) {
        console.error("API error:", err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const renderBox = (title, content, locked = false) => (
    <div className="bg-[#0D1B2A]/80 border border-slate-600 rounded-2xl p-4 text-white shadow-md flex flex-col justify-between h-48 w-full">
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <div className="flex-1 text-sm overflow-y-auto">
        {locked ? (
          <div className="flex items-center justify-center h-full">
            <Lock size={32} className="opacity-60" />
          </div>
        ) : loading ? (
          "Đang tải..."
        ) : content ? (
          content
        ) : (
          <span className="italic text-gray-400">Dữ liệu chưa phân tích</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[url('/bg-tech.jpg')] bg-cover bg-center text-white px-8 py-10">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#FF4D4D]">CONQUER INTERVIEW</h1>
        <button
          className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg"
          onClick={() => window.history.back()}
        >
          ← Quay lại
        </button>
      </header>

      {/* Question */}
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold">
          Câu 1: Trình bày cho tôi các khái niệm và ví dụ của lập trình hướng đối tượng?
        </h2>
        <p className="text-gray-400">Lần 1</p>
      </div>

      {/* Grid boxes */}
      <div className="grid grid-cols-3 gap-6 max-w-6xl mx-auto">
        {renderBox("Đánh giá tổng quan", data?.overview)}
        {renderBox("Biểu cảm", data?.expression)}
        {renderBox("Tốc độ nói và độ rõ ràng", data?.clarity)}

        {renderBox("Chuyên môn & kinh nghiệm", data?.expertise)}
        {renderBox("Thời lượng trả lời từng câu", data?.duration)}
        {renderBox("Phân tích nội dung câu trả lời", data?.contentAnalysis, true)}

        {renderBox("So sánh với ứng viên khác", data?.comparison, true)}
        {renderBox("Kỹ năng xử lý tình huống", data?.problemSolving, true)}
      </div>

      {/* Continue button */}
      <div className="flex justify-center mt-10">
        <button className="bg-[#00B4D8] hover:bg-[#0096C7] text-white px-6 py-2 rounded-lg text-sm font-semibold">
          TIẾP TỤC
        </button>
      </div>
    </div>
  );
}
