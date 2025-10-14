import React, { useEffect, useState, useRef } from "react";
import "./index.scss";
import axios from "axios";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaRobot } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function InterviewPage() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [stream, setStream] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
    const [volume, setVolume] = useState(0);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
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

  // Bật camera
  useEffect(() => {
    const enableCamera = async () => {
      try {

        const userStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        videoRef.current.srcObject = userStream;
        setStream(userStream);

        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(userStream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

      const tick = () => {
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        const avg = sum / dataArray.length;
        setVolume(avg);
        requestAnimationFrame(tick);
      };
      tick();
      } catch (error) {
        toast.error("Không thể truy cập camera hoặc micro.");
      }
    };
    enableCamera();
    return () => stream && stream.getTracks().forEach((t) => t.stop());
  }, []);

  // ChatGPT API - chat trực tiếp góc trái
  const handleChatGPT = async () => {
    if (!answer.trim()) return toast.info("Vui lòng nhập câu trả lời!");
    try {
      const res = await axios.post("http://localhost:8080/api/chatgpt", {
        message: answer,
      });
      setChatResponse(res.data.reply);
    } catch {
      toast.error("Lỗi khi gọi ChatGPT.");
    }
  };

  // Chuyển câu hỏi tiếp theo
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

  // Kết thúc buổi phỏng vấn
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
  };

  return (
    <div className="interview-page">
      {/* Video Background */}
      <video ref={videoRef} autoPlay muted={!micOn} className="camera-video" />

      {/* Voice Wave góc trái trên */}
      <div className="voice-wave">
    <div className="wave-bar" style={{ height: `${volume / 2}%` }} />
    <div className="wave-bar" style={{ height: `${volume / 2}%` }} />
    <div className="wave-bar" style={{ height: `${volume / 2}%` }} />
    </div>


      {/* ChatGPT góc trái */}
      <div className="chat-box">
        <div className="chat-header">
          <FaRobot /> ChatGPT
        </div>
        <div className="chat-content">
          <p>{chatResponse || "Trò chuyện với AI tại đây..."}</p>
        </div>
      </div>

      {/* Khung câu hỏi */}
      <div className="question-box">
        <p className="question-text">{`Câu ${questionIndex + 1}: ${question}`}</p>
        <textarea
          placeholder="Vui lòng nhập câu trả lời..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
        <div className="actions">
          <button className="btn-chat" onClick={handleChatGPT}>Gửi ChatGPT</button>
          <button className="btn-next" onClick={handleNextQuestion}>Hoàn thành</button>
          <button className="btn-finish" onClick={handleFinish}>Kết thúc</button>
        </div>
      </div>

      {/* Nút điều khiển camera & mic góc phải */}
      <div className="controls">
        <button onClick={() => setMicOn(!micOn)}>
          {micOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
        </button>
        <button onClick={() => {
          if (stream) stream.getVideoTracks()[0].enabled = !cameraOn;
          setCameraOn(!cameraOn);
        }}>
          {cameraOn ? <FaVideo /> : <FaVideoSlash />}
        </button>
      </div>
    </div>
  );
}
