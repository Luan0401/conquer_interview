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

// Sửa lỗi: Đảm bảo SpeechRecognition chỉ được định nghĩa một lần
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

export default function InterviewPage() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const recognitionRef = useRef(null);

  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [volume, setVolume] = useState(0);
  const [isListening, setIsListening] = useState(false);

  // --- LOGIC NHẬN DẠNG GIỌNG NÓI ---
  // Sửa lỗi: stopListening không phụ thuộc vào gì cả ngoại trừ ref
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      // Dừng nhận dạng
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setIsListening(false);
      console.log("Speech recognition manually stopped.");
    }
  }, []);

  // Sửa lỗi: Loại bỏ 'isListening' khỏi dependency array để tránh loop
  const startListening = useCallback(() => {
    if (!SpeechRecognition) {
      toast.error("Trình duyệt của bạn không hỗ trợ nhận dạng giọng nói.");
      return;
    }
    
    // Nếu đang nghe, KHÔNG làm gì cả
    if (recognitionRef.current) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "vi-VN";

    recognition.onstart = () => {
      console.log("Speech recognition started.");
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let finalTranscript = "";
      
      // Sửa lỗi: Chỉ cập nhật state 'answer' khi có kết quả FINAL
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        }
        // Lưu ý: Không dùng interimResults để cập nhật state 'answer' 
        // vì nó gây gián đoạn và chớp nháy input.
      }

      if (finalTranscript.length > 0) {
        // Sửa lỗi: Đảm bảo văn bản được NỐI VÀO (append) thay vì ghi đè.
        setAnswer((prevAnswer) => prevAnswer + finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      recognitionRef.current = null; // Reset ref
    };

    recognition.onend = () => {
      console.log("Speech recognition ended.");
      setIsListening(false);
      recognitionRef.current = null; // Reset ref khi kết thúc

      // Sửa lỗi: Tự động khởi động lại nếu mic vẫn BẬT
      if (streamRef.current && streamRef.current.getAudioTracks()[0]?.enabled) {
        console.log("Restarting listening...");
        startListening();
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [setAnswer]); // Chỉ phụ thuộc vào setAnswer

  // --- LOGIC TẮT CAMERA VÀ DỌN DẸP ---
  const stopCameraAndAudio = useCallback(() => {
    console.log("Cleanup: Stopping streams and audio context...");

    // Dừng nhận dạng giọng nói (Đã có trong logic dọn dẹp)
    stopListening();

    // Dừng vòng lặp đo âm lượng
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    // Dừng các track (camera và micro)
    if (streamRef.current) {
      // Sửa lỗi: Dừng tất cả các track để giải phóng camera/mic
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    // Đóng AudioContext
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, [stopListening]);

  // --- LOGIC BẬT CAMERA VÀ MICRO ---
  // Sửa lỗi: Chỉ phụ thuộc vào navigate và stopCameraAndAudio (để cleanup nếu lỗi)
  const enableCameraAndAudio = useCallback(async () => {
    // Nếu stream đang chạy hoặc đang được bật, KHÔNG làm gì cả để tránh chớp tắt
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
      setCameraOn(true);
      setMicOn(true);

      // --- Khởi động Nhận dạng Giọng nói ---
      // CHỈ BẬT NGHE KHI CÓ STREAM VÀ MIC ĐANG MỞ
      if (userStream.getAudioTracks().length > 0) {
          startListening();
      }

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
      toast.error("Không thể truy cập camera hoặc micro. Vui lòng kiểm tra quyền truy cập.");
      navigate("/");
    }
  }, [navigate, startListening]); // startListening là dependency an toàn

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

  // Hook 1: Bật camera khi vào trang và tắt khi unmount (đã sửa lỗi chớp tắt)
  useEffect(() => {
    enableCameraAndAudio();

    return () => {
      // Cleanup chính xác khi component unmount
      stopCameraAndAudio();
    };
  }, [enableCameraAndAudio, stopCameraAndAudio]);

  // Hook 2: Xử lý Back/Forward Cache (bfcache)
  useEffect(() => {
    const handlePageHide = () => {
      console.log("Page is hidden (bfcache or tab switch)");
      stopCameraAndAudio();
    };

    const handlePageShow = (event) => {
      if (event.persisted) {
        console.log("Page is shown from bfcache");
        // Chỉ gọi lại hàm bật camera
        enableCameraAndAudio();
      }
    };

    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [enableCameraAndAudio, stopCameraAndAudio]);

  // Hàm trống giữ chỗ cho logic ChatGPT
  const handleChatGPT = async () => {
    toast.info("Chức năng ChatGPT đang được phát triển!");
    // Logic gọi API ChatGPT để lấy gợi ý/đánh giá
  };

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
  
  // 1. CHẮC CHẮN DỪNG TẤT CẢ TÀI NGUYÊN WEB RẤT QUAN TRỌNG
  stopCameraAndAudio(); 

  // **BỔ SUNG:** Thêm một độ trễ nhỏ (ví dụ 100ms) để cho phép trình duyệt 
  // ghi nhận việc giải phóng tài nguyên WebRTC trước khi chuyển trang.
  await new Promise(resolve => setTimeout(resolve, 100)); // Thêm độ trễ 100ms

  try {
    // Tiến hành lưu dữ liệu
    await axios.post("http://localhost:8080/api/interview/save", {
      answers: questions.map((q, i) => ({
        questionId: q.id,
        // Dùng câu trả lời hiện tại nếu là câu hỏi đang làm việc, nếu không thì bỏ qua
        answer: i === questionIndex ? answer : "", 
      })),
    });
    
    toast.success("Đã lưu kết quả phỏng vấn!");
    navigate("/report");
    
  } catch (error) {
    // Xử lý lỗi (lưu ý: tài nguyên đã được stop ở trên)
    console.error("Lỗi khi lưu kết quả:", error);
    toast.error("Không thể lưu kết quả phỏng vấn.");
    navigate("/");
  }
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
            // Sử dụng isListening để hiển thị trạng thái lắng nghe
            placeholder={isListening && micOn ? "Đang lắng nghe giọng nói của bạn..." : "Nhập câu trả lời của bạn tại đây..."}
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
            {/* Thanh sóng âm chỉ hiển thị khi micOn */}
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
            // Thêm class 'listening' khi đang nghe
            className={`control-btn ${!micOn ? "off" : ""} ${isListening && micOn ? "listening" : ""}`}
            onClick={() => {
              if (streamRef.current) {
                const audioTrack = streamRef.current.getAudioTracks()[0];
                if (audioTrack) {
                  const newMicOnState = !micOn; // Lấy trạng thái mới
                  audioTrack.enabled = newMicOnState;
                  setMicOn(newMicOnState);

                  // --- Bổ sung Logic Nghe/Dừng Nghe ---
                  if (newMicOnState) {
                    startListening();
                  } else {
                    stopListening();
                  }
                }
              } else {
                // Trường hợp người dùng chưa cấp quyền, cố gắng bật lại
                enableCameraAndAudio();
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