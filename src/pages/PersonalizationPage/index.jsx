import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./index.scss";

import { getPersonalizationHistoryApi } from "../../config/authApi";

export default function PersonalizationPage() {
  const navigate = useNavigate();

  const [historyData, setHistoryData] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [sessionData, setSessionData] = useState(null);

  const [loading, setLoading] = useState(true);

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
        console.error("Lỗi định dạng ngày:", e);
        return 'Ngày không hợp lệ';
    }
};

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPersonalizationHistoryApi();
      const historyList = res.data.data;

      if (historyList && historyList.length > 0) {
        const sortedList = historyList.sort(
          (a, b) => b.sessionId - a.sessionId
        );
        setHistoryData(sortedList);
        
        setSelectedSessionId(sortedList[0].sessionId);
      } else {
        toast.info("Không tìm thấy lộ trình cá nhân hóa nào.");
      }
    } catch (error) {
      console.error(
        "Lỗi khi tải lịch sử cá nhân hóa:",
        error.response?.data || error.message
      );
      toast.error("Không thể tải lịch sử cá nhân hóa!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  
  useEffect(() => {
    if (selectedSessionId !== null && historyData.length > 0) {
      const currentSession = historyData.find(
        (s) => s.sessionId === selectedSessionId
      );

      if (currentSession) {
        
        setSessionData({
          title: `Lộ trình cho Phiên: ${formatSessionDate(
            currentSession.sessionDate
          )}`,
          jobPosition: currentSession.jobPosition,
          exercises: currentSession.personalizations.map((p, index) => ({
            id: p.personalizationId,
            text: p.namePractice, 
            questionText: p.questionText, 
            details: [
              ` Mục tiêu: ${p.objective}`,
              ` Thực hành: ${p.practice}`,
              ` Bài tập: ${p.exercise}`,
            ],
          })),
        });
      }
    }
  }, [selectedSessionId, historyData]);

  if (loading) {
    return (
      <div className="practice-page-container full-center">
        <div className="loading-spinner">Đang tải lịch sử cá nhân hóa...</div>
      </div>
    );
  }

  if (historyData.length === 0) {
    return (
      <div className="practice-page-container full-center">
        <div className="loading-spinner">
          Bạn chưa có bất kỳ lộ trình cá nhân hóa nào.
        </div>
        <button onClick={() => navigate("/")} className="start-button mt-4">
          Bắt đầu luyện tập
        </button>
      </div>
    );
  }

  const currentSessionInfo = historyData.find(
    (s) => s.sessionId === selectedSessionId
  );

  return (
    <div className="practice-page-container">
      <div className="practice-sidebar">
        <h3>Lịch Sử Lộ Trình ({historyData.length} Phiên)</h3>
        {historyData.map((session, index) => (
          <button
            key={session.sessionId}
            className={`session-item ${
              selectedSessionId === session.sessionId ? "active" : ""
            }`}
            onClick={() => setSelectedSessionId(session.sessionId)}
          >
            <FileText
              size={16}
              style={{ marginRight: "5px", verticalAlign: "middle" }}
            />
            {formatSessionDate(session.sessionDate)}
          </button>
        ))}
        <button
          className="start-button-sidebar mt-4"
          onClick={() => navigate("/")}
        >
          Quay lại Trang chủ
        </button>
      </div>
      <div className="practice-content">
        {sessionData ? (
          <>
            <h2 className="content-title">
              {sessionData.title}
              <small className="job-title-sidebar">
                ({currentSessionInfo?.jobPosition})
              </small>
            </h2>

            <div className="exercise-list">
              {sessionData.exercises.map((ex) => (
                <div className="exercise-item" key={ex.id}>
                  <h4 className="exercise-title">{ex.text}</h4>                
                  

                  <ul className="exercise-details">
                    {ex.details.map((detail, i) => (
                      <li key={i}>{detail}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <button
              className="start-button"
              onClick={() =>
                toast.info(
                  "Tính năng 'Bắt đầu luyện tập mới' đang được phát triển!"
                )
              }
            >
              Bắt đầu luyện tập mới
            </button>
          </>
        ) : (
          <div className="loading-spinner">
            Chọn một Session để xem lộ trình chi tiết.
          </div>
        )}
      </div>
    </div>
  );
}