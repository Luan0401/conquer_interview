import React, { useEffect, useState, useRef, useCallback } from "react";
import "./index.scss";
import axios from "axios";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaRobot,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function InterviewPage() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [volume, setVolume] = useState(0);

  // --- LOGIC TẮT CAMERA VÀ DỌN DẸP ---
  // (Đã tách ra thành hàm riêng để tái sử dụng)
  const stopCameraAndAudio = useCallback(() => {
    console.log("Cleanup: Stopping streams and audio context...");

    // Dừng vòng lặp đo âm lượng
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    // Dừng các track (camera và micro)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    // Đóng AudioContext
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []); // useCallback với mảng rỗng vì nó chỉ phụ thuộc vào các ref

  // --- LOGIC BẬT CAMERA VÀ MICRO ---
  // (Đã tách ra thành hàm riêng để tái sử dụng)
  const enableCameraAndAudio = useCallback(async () => {
    // Nếu stream đang chạy rồi thì không làm gì cả
    if (streamRef.current) return;

    console.log("Attempting to enable camera and audio...");
    try {
      const userStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = userStream;
      }
      streamRef.current = userStream;
      setCameraOn(true); // Đảm bảo UI đúng
      setMicOn(true); // Đảm bảo UI đúng

      // --- Logic đo âm lượng ---
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
      const source =
        audioContextRef.current.createMediaStreamSource(userStream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

      const tick = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
          const avg = sum / dataArray.length;
          setVolume(avg);
          animationFrameRef.current = requestAnimationFrame(tick);
        }
      };
      tick();
    } catch (error) {
      toast.error("Không thể truy cập camera hoặc micro.");
      navigate("/"); // Quay về trang chủ nếu không cho phép
    }
  }, [navigate]); // Phụ thuộc vào navigate

  // Gọi API lấy danh sách câu hỏi
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/interview/questions")
      .then((res) => {
        setQuestions(res.data);
        setQuestion(res.data[0]?.content || "Đang tải câu hỏi...");
      })
      .catch(() => toast.error("Không thể tải câu hỏi."));
  }, []);

  // --- USE EFFECT ĐÃ SỬA ---

  // Hook 1: Bật camera khi vào trang và tắt khi unmount (ví dụ: khi navigate)
  useEffect(() => {
    enableCameraAndAudio();

    // Hàm cleanup này sẽ chạy khi component unmount
    // (ví dụ: khi nhấn "Kết thúc" và navigate đi)
    return () => {
      stopCameraAndAudio();
    };
  }, [enableCameraAndAudio, stopCameraAndAudio]); // Phụ thuộc vào các hàm useCallback

  // Hook 2: Xử lý Back/Forward Cache (bfcache)
  // Đây là phần QUAN TRỌNG NHẤT để sửa lỗi của bạn
  useEffect(() => {
    const handlePageHide = () => {
      // Khi trang bị ẩn (vào bfcache), ta phải TẮT camera
      console.log("Page is hidden (bfcache or tab switch)");
      stopCameraAndAudio();
    };

    const handlePageShow = (event) => {
      // Khi quay lại trang (từ bfcache)
      if (event.persisted) {
        console.log("Page is shown from bfcache");
        // BẬT LẠI camera
        enableCameraAndAudio();
      }
    };

    // Gắn listener
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("pageshow", handlePageShow);

    // Dọn dẹp listener
    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [enableCameraAndAudio, stopCameraAndAudio]);

  // ... (Tất cả các hàm handler khác: handleChatGPT, handleNextQuestion, handleFinish giữ nguyên)
  const handleChatGPT = async () => {};

  const handleNextQuestion = () => {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex(questionIndex + 1);
      setQuestion(questions[questionIndex + 1].content);
      setAnswer("");
      setChatResponse("");
    } else {
      toast.info("Bạn đã hoàn thành tất cả câu hỏi!");
    }
  };

  const handleFinish = async () => {
    try {
      await axios.post("http://localhost:8080/api/interview/save", {
        answers: questions.map((q, i) => ({
          questionId: q.id,
          answer: i === questionIndex ? answer : "",
        })),
      });
      toast.success("Đã lưu kết quả phỏng vấn!");
      navigate("/report");
    } catch {
      toast.error("Không thể lưu kết quả phỏng vấn.");
      navigate("/");
    }
    // Lưu ý: stopCameraAndAudio() sẽ tự động được gọi
    // vì hàm cleanup của useEffect (Hook 1) sẽ chạy khi navigate
  };

  return (
    <div className="interview-container">
      {/* --- CỘT 1: LỘ TRÌNH --- */}
      <div className="interview-progress">
        <h3>Lộ trình phỏng vấn</h3>
        <div className="progress-list">
          {questions.length > 0 ? (
            questions.map((q, index) => (
              <div
                key={index}
                className={`progress-item 
                  ${index === questionIndex ? "active" : ""} 
                  ${index < questionIndex ? "completed" : ""}
                `}
              >
                Câu {index + 1}
              </div>
            ))
          ) : (
            <p>Đang tải lộ trình...</p>
          )}
        </div>
      </div>

      {/* --- CỘT 2: TƯƠNG TÁC CHÍNH (Q&A) --- */}
      <div className="interview-main">
        {/* Hộp câu hỏi của AI */}
        <div className="ai-question-box">
          <div className="ai-header">
            <FaRobot className="ai-icon" />
            Câu hỏi {questionIndex + 1} / {questions.length}
          </div>
          <p className="question-text">{question || "Đang tải câu hỏi..."}</p>
        </div>

        {/* Hộp trả lời của người dùng */}
        <div className="user-answer-box">
          <textarea
            placeholder="Nhập câu trả lời của bạn tại đây..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
        </div>

        {/* Các nút hành động */}
        <div className="action-buttons">
          <button className="btn-secondary" onClick={handleChatGPT}>
            Tôi không biết
          </button>
          <button className="btn-secondary" onClick={handleChatGPT}>
            Không có chuyên môn
          </button>
          <button className="btn-primary" onClick={handleNextQuestion}>
            Qua câu tiếp theo
          </button>
          <button className="btn-finish" onClick={handleFinish}>
            Hoàn thành
          </button>
        </div>
      </div>

      {/* --- CỘT 3: VIDEO VÀ ĐIỀU KHIỂN --- */}
      <div className="user-feed-panel">
        {/* Camera */}
        <div className="camera-wrapper">
          <video ref={videoRef} autoPlay muted className="camera-feed" />
          {!cameraOn && (
            <div className="camera-off-overlay">
              <FaVideoSlash />
            </div>
          )}
        </div>

        {/* Sóng âm */}
        <div className="voice-wave-container">
          <p>Âm lượng</p>
          <div className="voice-wave">
            <div
              className="wave-bar"
              style={{ transform: `scaleY(${micOn ? volume / 100 : 0})` }}
            />
            <div
              className="wave-bar"
              style={{ transform: `scaleY(${micOn ? volume / 120 : 0})` }}
            />
            <div
              className="wave-bar"
              style={{ transform: `scaleY(${micOn ? volume / 100 : 0})` }}
            />
          </div>
        </div>

        {/* Nút điều khiển */}
        <div className="media-controls">
          <button
            className={`control-btn ${!micOn ? "off" : ""}`}
            onClick={() => {
              if (streamRef.current) {
                const audioTrack = streamRef.current.getAudioTracks()[0];
                if (audioTrack) {
                  audioTrack.enabled = !micOn;
                  setMicOn(!micOn);
                }
              }
            }}
          >
            {micOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
          </button>

          <button
            className={`control-btn ${!cameraOn ? "off" : ""}`}
            onClick={() => {
              if (streamRef.current) {
                const videoTrack = streamRef.current.getVideoTracks()[0];
                if (videoTrack) {
                  videoTrack.enabled = !cameraOn;
                  setCameraOn(!cameraOn);
                }
              }
            }}
          >
            {cameraOn ? <FaVideo /> : <FaVideoSlash />}
          </button>
        </div>
      </div>
    </div>
  );
}
