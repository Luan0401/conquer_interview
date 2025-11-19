import React, { useEffect, useState, useRef, useCallback } from "react";
import "./index.scss"; // Giữ nguyên SCSS
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

// Dữ liệu Onboarding: Dễ dàng quản lý các bước hướng dẫn
const TOUR_STEPS = [
  {
    step: 1,
    targetClass: "ai-question-box",
    title: "1. Hộp Câu Hỏi AI",
    text: "Đây là nơi AI đưa ra các câu hỏi phỏng vấn. Hãy đọc kỹ và chuẩn bị câu trả lời của bạn.",
  },
  {
    step: 2,
    targetClass: "user-answer-box",
    title: "2. Ô Trả Lời (Voice to Text)",
    text: "Câu trả lời của bạn sẽ được chuyển từ giọng nói thành văn bản và hiển thị tại đây. Bạn cũng có thể gõ trực tiếp.",
  },
  {
    step: 3,
    targetClass: "mic-control-btn", 
    title: "3. Nút Ghi Âm (Mic)",
    text: "Bấm nút này để bắt đầu ghi âm câu trả lời. Sau khi nói xong, bấm lại để tắt Mic, giọng nói của bạn sẽ được chuyển thành văn bản trong ô trả lời.",
  },
  {
    step: 4,
    targetClass: "camera-control-btn", 
    title: "4. Nút Video (Camera)",
    text: "Bấm để bật/tắt camera. AI sẽ sử dụng video để phân tích ngôn ngữ cơ thể của bạn (chức năng phân tích sẽ được kích hoạt sau).",
  },
  {
    step: 5,
    targetClass: "action-buttons",
    title: "5. Các Nút Hành Động",
    text: "Sử dụng các nút này để chuyển sang câu hỏi tiếp theo, nhận gợi ý từ ChatGPT (chức năng đang phát triển), hoặc bấm 'Hoàn thành' để kết thúc phiên phỏng vấn.",
  },
];

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
  
  // *** STATE MỚI: Quản lý bước hướng dẫn ***
  const [tourStep, setTourStep] = useState(1); 
  const currentTourStepData = TOUR_STEPS.find(step => step.step === tourStep);


  // --- LOGIC NHẬN DẠNG GIỌNG NÓI ---
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setIsListening(false);
      console.log("Speech recognition manually stopped.");
    }
  }, []);

  const startListening = useCallback(() => {
    if (!SpeechRecognition) {
      toast.error("Trình duyệt của bạn không hỗ trợ nhận dạng giọng nói.");
      return;
    }
    
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
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        }
      }

      if (finalTranscript.length > 0) {
        setAnswer((prevAnswer) => prevAnswer + finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      console.log("Speech recognition ended.");
      setIsListening(false);
      recognitionRef.current = null;

      if (streamRef.current && streamRef.current.getAudioTracks()[0]?.enabled) {
        console.log("Restarting listening...");
        startListening();
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [setAnswer]); 

  // --- LOGIC TẮT CAMERA VÀ DỌN DẸP ---
  const stopCameraAndAudio = useCallback(() => {
    console.log("Cleanup: Stopping streams and audio context...");
    stopListening();

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, [stopListening]);

  // --- LOGIC BẬT CAMERA VÀ MICRO ---
  const enableCameraAndAudio = useCallback(async () => {
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
  }, [navigate, startListening]);

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

  // *** LOGIC XỬ LÝ TOUR ***
  const handleNextTourStep = () => {
    if (tourStep < TOUR_STEPS.length) {
      setTourStep(tourStep + 1);
    } else {
      setTourStep(TOUR_STEPS.length + 1); // Kết thúc Tour
    }
  };

  // Bắt sự kiện Phím Cách và Click Chuột để chuyển bước tour
  useEffect(() => {
    if (tourStep <= TOUR_STEPS.length) {
      const handleKeyPressOrClick = (event) => {
        // Chỉ xử lý nếu không phải là input hoặc textarea
        if (event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA') {
             if (event.key === ' ' || event.type === 'click') {
                event.preventDefault(); // Ngăn cuộn trang nếu bấm phím cách
                handleNextTourStep();
             }
        }
      };
      
      // Bắt sự kiện Phím Cách
      window.addEventListener('keydown', handleKeyPressOrClick);
      // Bắt sự kiện Click chuột (trừ các vùng tương tác)
      window.addEventListener('click', handleKeyPressOrClick);

      return () => {
        window.removeEventListener('keydown', handleKeyPressOrClick);
        window.removeEventListener('click', handleKeyPressOrClick);
      };
    }
  }, [tourStep]);


  const handleChatGPT = async () => {
    toast.info("Chức năng ChatGPT đang được phát triển!");
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
    stopCameraAndAudio(); 
    
    // Thêm một độ trễ nhỏ để giải phóng tài nguyên WebRTC trước khi chuyển trang
    await new Promise(resolve => setTimeout(resolve, 100)); 

    try {
      await axios.post("http://localhost:8080/api/interview/save", {
        answers: questions.map((q, i) => ({
          questionId: q.id,
          answer: i === questionIndex ? answer : "", 
        })),
      });
      
      toast.success("Đã lưu kết quả phỏng vấn!");
      navigate("/report");
      
    } catch (error) {
      console.error("Lỗi khi lưu kết quả:", error);
      toast.error("Không thể lưu kết quả phỏng vấn.");
      navigate("/");
    }
  };

  // Lấy class cần highlight
  const highlightClass = tourStep <= TOUR_STEPS.length ? currentTourStepData.targetClass : '';
  const isTourActive = tourStep <= TOUR_STEPS.length;


  return (
    <div className="interview-container">
      {/* *** HIỂN THỊ TOUR ONBOARDING OVERLAY *** */}
      {isTourActive && currentTourStepData && (
        <>
          {/* Lớp phủ làm mờ nền */}
          <div className="onboarding-overlay" />
          
          {/* Highlight element (sử dụng CSS để tạo viền đỏ) */}
          <div 
            className={`highlight-box ${highlightClass}`} 
            style={{ 
              // Đảm bảo box được highlight nằm trên cùng
              zIndex: 1000 
            }}
          />

          {/* Pop-up Hướng dẫn */}
          <div className="onboarding-popup">
            <h4>{currentTourStepData.title}</h4>
            <p>{currentTourStepData.text}</p>
            <div className="popup-footer">
              <button onClick={() => setTourStep(TOUR_STEPS.length + 1)} className="btn-skip">
                Bỏ qua hướng dẫn
              </button>
              <button onClick={handleNextTourStep} className="btn-next">
                {tourStep < TOUR_STEPS.length ? 'Tiếp tục (Space/Click)' : 'Bắt đầu phỏng vấn'}
              </button>
            </div>
          </div>
        </>
      )}

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
        <div className={`ai-question-box ${highlightClass === 'ai-question-box' ? 'highlighted' : ''}`}>
          <div className="ai-header">
            <FaRobot className="ai-icon" />
            Câu hỏi {questionIndex + 1} / {questions.length}
          </div>
          <p className="question-text">{question || "Đang tải câu hỏi..."}</p>
        </div>

        {/* Hộp trả lời của người dùng */}
        <div className={`user-answer-box ${highlightClass === 'user-answer-box' ? 'highlighted' : ''}`}>
          <textarea
            placeholder={isListening && micOn ? "Đang lắng nghe giọng nói của bạn..." : "Nhập câu trả lời của bạn tại đây..."}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
        </div>

        {/* Các nút hành động */}
        <div className={`action-buttons ${highlightClass === 'action-buttons' ? 'highlighted' : ''}`}>
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
          {/* Nút Mic - THÊM CLASS ĐỊNH DANH: mic-control-btn */}
          <button
            className={`control-btn ${!micOn ? "off" : ""} ${isListening && micOn ? "listening" : ""} mic-control-btn ${highlightClass === 'mic-control-btn' ? 'highlighted' : ''}`}
            onClick={() => {
              if (streamRef.current) {
                const audioTrack = streamRef.current.getAudioTracks()[0];
                if (audioTrack) {
                  const newMicOnState = !micOn; 
                  audioTrack.enabled = newMicOnState;
                  setMicOn(newMicOnState);

                  if (newMicOnState) {
                    startListening();
                  } else {
                    stopListening();
                  }
                }
              } else {
                enableCameraAndAudio();
              }
            }}
          >
            {micOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
          </button>

          {/* Nút Camera - THÊM CLASS ĐỊNH DANH: camera-control-btn */}
          <button
            className={`control-btn ${!cameraOn ? "off" : ""} camera-control-btn ${highlightClass === 'camera-control-btn' ? 'highlighted' : ''}`}
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