import React, { useState } from "react";
import "./index.scss";
import axios from "axios";
import { toast } from "react-toastify";

export default function Feedback() {
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !content) {
      toast.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      setLoading(true);
      // 🔽 Thay đường dẫn API thật của bạn ở đây
      const response = await axios.post("http://localhost:8080/api/feedback", {
        email,
        content,
      });

      toast.success("Gửi phản hồi thành công!");
      setEmail("");
      setContent("");
    } catch (error) {
      console.error("Lỗi gửi phản hồi:", error);
      toast.error(
        error.response?.data?.message || "Đã xảy ra lỗi khi gửi phản hồi!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feedback-page">
      <div className="feedback-container">
        <h2>Gửi phản hồi</h2>
        <form onSubmit={handleSubmit}>
          <label>Vui lòng nhập Email</label>
          <input
            type="email"
            placeholder="Vui lòng nhập email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Nội dung phản hồi</label>
          <textarea
            placeholder="Vui lòng nhập phản hồi"
            rows="4"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Đang gửi..." : "Gửi"}
          </button>
        </form>
      </div>
    </div>
  );
}

