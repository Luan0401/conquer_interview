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
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
// GIẢ ĐỊNH: Import các hàm API cần thiết (sử dụng updateSessionStatusApi, sendAnswerApi)
import { updateSessionStatusApi, sendAnswerApi, decrementTrialApi } from "../../config/authApi"; 

const SpeechRecognition =
 window.SpeechRecognition || window.webkitSpeechRecognition;

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
  text: "Sử dụng các nút này để chuyển sang câu hỏi tiếp theo, nhận gợi ý từ ChatGPT, hoặc bấm 'Hoàn thành' để kết thúc phiên.",
 },
];

export default function InterviewPage() {
 const navigate = useNavigate();
 const location = useLocation();
 const [isFinishing, setIsFinishing] = useState(false);
 const sessionId = location.state?.sessionId;
 const initialQuestions = location.state?.questions;

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
 const [tourStep, setTourStep] = useState(1);
    // NEW STATES:
    const [isLoading, setIsLoading] = useState(false);
    const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);


 const currentTourStepData = TOUR_STEPS.find((step) => step.step === tourStep);

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

 const stopCameraAndAudio = useCallback(() => {
  console.log("Cleanup: Stopping media...");
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

 const enableCameraAndAudio = useCallback(async () => {
  if (streamRef.current) return;

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
   navigate("/");
  }
 }, [navigate, startListening]);

 useEffect(() => {
  if (!sessionId || !initialQuestions || initialQuestions.length === 0) {
   toast.error("Không tìm thấy ID phiên hoặc câu hỏi.");
   stopCameraAndAudio();
   navigate("/setup-interview");
   return;
  }

  setQuestions(initialQuestions);
  setQuestion(initialQuestions[0]?.question_text || "");
 }, [sessionId, initialQuestions, navigate, stopCameraAndAudio]);

 useEffect(() => {
  enableCameraAndAudio();
  return () => stopCameraAndAudio();
 }, [enableCameraAndAudio, stopCameraAndAudio]);

 useEffect(() => {
  const handleHide = () => stopCameraAndAudio();
  const handleShow = (event) => {
   if (event.persisted) enableCameraAndAudio();
  };

  window.addEventListener("pagehide", handleHide);
  window.addEventListener("pageshow", handleShow);

  return () => {
   window.removeEventListener("pagehide", handleHide);
   window.removeEventListener("pageshow", handleShow);
  };
 }, [enableCameraAndAudio, stopCameraAndAudio]);

 const handleNextTourStep = () => {
  if (tourStep < TOUR_STEPS.length) {
   setTourStep(tourStep + 1);
  } else {
   setTourStep(TOUR_STEPS.length + 1);
  }
 };

 useEffect(() => {
  if (tourStep <= TOUR_STEPS.length) {
   const handler = (e) => {
    if (
     e.target.tagName !== "INPUT" &&
     e.target.tagName !== "TEXTAREA" &&
     (e.key === " " || e.type === "click")
    ) {
     e.preventDefault();
     handleNextTourStep();
    }
   };

   window.addEventListener("keydown", handler);
   window.addEventListener("click", handler);

   return () => {
    window.removeEventListener("keydown", handler);
    window.removeEventListener("click", handler);
   };
  }
 }, [tourStep]);

 const handleChatGPT = () => {
  toast.info("Chức năng ChatGPT đang phát triển!");
 };

 const handleNextQuestion = async () => {
    const isLastQuestion = questionIndex === questions.length - 1;

    // Nếu là câu cuối, gọi handleFinish để chuyển trang báo cáo
    if (isLastQuestion) {
        return handleFinish(true); 
    }
    
    if (isLoading) return; 

    setIsLoading(true); // Bắt đầu loading
    
    let toastId = null;
    if (!isLastQuestion) {
        // Hiện toast thông báo cho người dùng
        toastId = toast.loading("Đang gửi câu trả lời cho AI, vui lòng đợi..."); 
    }

  if (sessionId && questions.length > 0) {
   const current = questions[questionIndex];
   const payload = {
    sessionId: parseInt(sessionId),
    questionId: parseInt(current.question_id), 
    questionText: current.question_text,
    answerText: answer,
   };
   try {
    await sendAnswerApi(payload);
        
        // Cập nhật Toast thành công
        toast.update(toastId, { render: "Đã gửi câu trả lời thành công!", type: "success", isLoading: false, autoClose: 3000 });

        // Chuyển câu hỏi
    setQuestionIndex(questionIndex + 1);
    setQuestion(questions[questionIndex + 1].question_text);
    setAnswer("");
    setChatResponse("");

   } catch (err) {
    console.error("Lỗi gửi câu trả lời:", err);
        // Cập nhật Toast thất bại
        toast.update(toastId, { render: "Gửi câu trả lời thất bại. Vui lòng thử lại.", type: "error", isLoading: false, autoClose: 3000 });
   } finally {
        setIsLoading(false); 
      }
  } else {
        if (toastId) toast.dismiss(toastId);
        setIsLoading(false); 
    }
 };

 // Đảm bảo bạn đã import hàm API này từ file service của bạn
// import { decrementTrialApi } from "../../config/authApi"; 

const handleFinish = async (isForcedFinish = false) => {
    const isLastQuestion = questionIndex === questions.length - 1;

    // 1. Kiểm tra điều kiện mở Modal
    if (!isLastQuestion && !isForcedFinish) {
        setIsFinishModalOpen(true);
        return;
    }
    
    // Nếu là xác nhận kết thúc sớm từ Modal, bật loading cho modal
    if (isForcedFinish) setIsFinishing(true); 

    // 2. Gửi câu trả lời CUỐI CÙNG (Giữ nguyên)
    if (sessionId && questions.length > 0) {
        const current = questions[questionIndex];
        const payload = {
            sessionId: parseInt(sessionId),
            questionId: parseInt(current.question_id),
            questionText: current.question_text,
            answerText: answer,
        };
        try {
            await sendAnswerApi(payload);
        } catch (err) {
            console.error("Lỗi gửi câu trả lời cuối:", err);
        }
    }

    // --- LOGIC TRỪ LƯỢT DÙNG THỬ MỚI ---
    
    // Giả định: userStatus (0: Free, 1: Paid) được lấy từ sessionStorage
    const userStatus = parseInt(sessionStorage.getItem('userStatus') || '0');
    
    if (userStatus === 0) { // CHỈ TRỪ KHI LÀ TÀI KHOẢN MIỄN PHÍ
        try {
           await decrementTrialApi(); 
        
        // --- BỔ SUNG: CẬP NHẬT THỦ CÔNG ---
        const currentCountStr = sessionStorage.getItem('trialCount');
        const currentCount = parseInt(currentCountStr) || 0;
        
        if (currentCount > 0) {
            const newCount = currentCount - 1;
            sessionStorage.setItem('trialCount', newCount.toString());
            
            // Tùy chọn: Nếu newCount là 0, bạn có thể cập nhật userStatus
            // if (newCount === 0) {
            //     sessionStorage.setItem('userStatus', '1'); // Hoặc trạng thái khác
            // }
        }
        // ----------------------------------

        console.log("Đã gọi API trừ đi 1 lần dùng thử thành công.");

        } catch (error) {
            // Xử lý nếu API trừ lượt dùng thử bị lỗi (ví dụ: đã hết lượt)
            console.warn("Cảnh báo: Không thể trừ lượt dùng thử.", error.response?.data?.Message || error.message);
            // Nếu lỗi là do hết lượt (TrialLimitExceeded), API này sẽ trả về 403, 
            // và logic chuyển đổi trạng thái Free -> Paid sẽ được kích hoạt ở đây hoặc ở BE.
        }
    }
    
    // --- KẾT THÚC LOGIC TRỪ LƯỢT DÙNG THỬ ---
    
    stopCameraAndAudio();
    await new Promise((r) => setTimeout(r, 100));

    // 3. Xử lý sau khi gửi câu trả lời cuối (Logic Hoàn thành/Thất bại)
    // ... (Giữ nguyên logic updateSessionStatusApi và navigate)
    
    // Ví dụ về logic hoàn thành bình thường:
    if (isLastQuestion) {
        // ... (Logic hoàn thành)
        try {
            await updateSessionStatusApi(sessionId, "COMPLETED"); 
            toast.success("Đã hoàn thành phiên phỏng vấn!");
            navigate(`/ReportInterview?sessionId=${sessionId}`);
        } catch (error) {
            toast.error("Lỗi khi hoàn thành phiên.");
            navigate("/");
        }
    } else {
        // ... (Logic kết thúc sớm)
        try {
            await updateSessionStatusApi(sessionId, "FAILED"); 
            sessionStorage.removeItem("sessionId"); 
            toast.warn("Phiên phỏng vấn đã thất bại.");
            navigate("/");
        } catch (error) {
            toast.error("Lỗi khi hủy phiên. Đang chuyển về trang chủ.");
            navigate("/");
        } finally {
             if (isForcedFinish) setIsFinishing(false); 
        }
    }
};

 const highlightClass =
  tourStep <= TOUR_STEPS.length ? currentTourStepData.targetClass : "";

 return (
  <div className="interview-container">
   {tourStep <= TOUR_STEPS.length && currentTourStepData && (
    <>
     <div className="onboarding-overlay" />
     <div className={`highlight-box ${highlightClass}`} />

     <div className="onboarding-popup">
      <h4>{currentTourStepData.title}</h4>
      <p>{currentTourStepData.text}</p>
      <div className="popup-footer">
       <button
        onClick={() => setTourStep(TOUR_STEPS.length + 1)}
        className="btn-skip"
       >
        Bỏ qua
       </button>
       <button onClick={handleNextTourStep} className="btn-next">
        {tourStep < TOUR_STEPS.length
         ? "Tiếp tục (Space/Click)"
         : "Bắt đầu"}
       </button>
      </div>
     </div>
    </>
   )}

   <div className="interview-progress">
    <h3>Lộ trình phỏng vấn</h3>
    <div className="progress-list">
     {questions.map((q, index) => (
      <div
       key={index}
       className={`progress-item
        ${index === questionIndex ? "active" : ""}
        ${index < questionIndex ? "completed" : ""}`}
      >
       Câu {index + 1}
      </div>
     ))}
    </div>
   </div>

   <div className="interview-main">
    <div
     className={`ai-question-box ${
      highlightClass === "ai-question-box" ? "highlighted" : ""
     }`}
    >
     <div className="ai-header">
      <FaRobot />
      Câu hỏi {questionIndex + 1} / {questions.length}
     </div>
     <p className="question-text">{question}</p>
    </div>

    <div
     className={`user-answer-box ${
      highlightClass === "user-answer-box" ? "highlighted" : ""
     }`}
    >
     <textarea
      placeholder={
       isListening && micOn ? "Đang lắng nghe..." : "Nhập câu trả lời..."
      }
      value={answer}
      onChange={(e) => setAnswer(e.target.value)}
     />
    </div>

    <div
     className={`action-buttons ${
      highlightClass === "action-buttons" ? "highlighted" : ""
     }`}
    >
     <button className="btn-secondary" onClick={handleChatGPT}>
      Tôi không biết
     </button>
     <button className="btn-secondary" onClick={handleChatGPT}>
      Không có chuyên môn
     </button>
            {/* Nút chính: Qua câu tiếp theo / Hoàn thành */}
     <button 
                className="btn-primary" 
                onClick={handleNextQuestion}
                disabled={isLoading}
            >
                {isLoading ? (
                    <div className="spinner"></div>
                ) : (
                    questionIndex === questions.length - 1 ? "Hoàn thành" : "Qua câu tiếp theo"
                )}
     </button>
            
            {/* Nút Hoàn thành (Dùng để kích hoạt modal) */}
     <button className="btn-finish" onClick={() => handleFinish(false)}>
      Hoàn thành
     </button>
    </div>
   </div>

   <div className="user-feed-panel">
    <div className="camera-wrapper">
     <video ref={videoRef} autoPlay muted className="camera-feed" />
     {!cameraOn && (
      <div className="camera-off-overlay">
       <FaVideoSlash />
      </div>
     )}
    </div>

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

    <div className="media-controls">
     <button
      className={`control-btn ${!micOn ? "off" : ""} mic-control-btn ${
       highlightClass === "mic-control-btn" ? "highlighted" : ""
      }`}
      onClick={() => {
       if (streamRef.current) {
        const audioTrack = streamRef.current.getAudioTracks()[0];
        if (audioTrack) {
         const newState = !micOn;
         audioTrack.enabled = newState;
         setMicOn(newState);

         if (newState) startListening();
         else stopListening();
        }
       }
      }}
     >
      {micOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
     </button>

     <button
      className={`control-btn ${
       !cameraOn ? "off" : ""
      } camera-control-btn ${
       highlightClass === "camera-control-btn" ? "highlighted" : ""
      }`}
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
        
        {/* MODAL XÁC NHẬN KẾT THÚC SỚM */}
        {isFinishModalOpen && (
            <div className="modal-overlay">
                <div className="finish-modal">
                    <h4 className="modal-title">Xác nhận Kết thúc Phỏng vấn Sớm</h4>
                    <p className="modal-message">
                        Phiên phỏng vấn sẽ bị đánh dấu là **thất bại** và kết quả báo cáo sẽ không đầy đủ. Bạn có chắc chắn muốn kết thúc?
                    </p>
                    <div className="modal-actions">
                        <button 
                            className="modal-action-btn continue-btn" 
                            onClick={() => setIsFinishModalOpen(false)} // Tiếp tục phỏng vấn
                        >
                            Tiếp tục
                        </button>
                        <button 
                            className="modal-action-btn confirm-finish-btn danger" 
                            onClick={() => handleFinish(true)} // Xác nhận kết thúc (isForcedFinish=true)
                            disabled={isFinishing}
                        >
                            {isFinishing ? <div className="spinner"></div> : 'Xác nhận kết thúc'}
                        </button>
                    </div>
                </div>
            </div>
        )}
  </div>
 );
}