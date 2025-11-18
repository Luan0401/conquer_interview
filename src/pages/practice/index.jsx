import React, { useState, useEffect } from 'react';
import './index.scss'; // Chúng ta sẽ dùng SCSS để code đẹp hơn

// --- Dữ liệu giả lập (Mock Data) ---
// Trong thực tế, bạn sẽ gọi API và set dữ liệu này vào 'sessionData'
// --- Dữ liệu giả lập (Mock Data) ---
// Dữ liệu này giả lập kết quả AI trả về sau khi phân tích một buổi phỏng vấn trước đó của người dùng.
const MOCK_API_DATA = {
  1: {
    title: '05/10/2025: Cải thiện Ngôn ngữ hình thể',
    exercises: [
      { 
        id: 1, 
        text: 'Bài 1 – Điều chỉnh giao tiếp bằng mắt (Eye Contact)', 
        details: [
          'Phân tích của AI: Bạn có xu hướng nhìn xuống (3.5 giây) mỗi khi suy nghĩ về câu hỏi khó, làm giảm sự tự tin.',
          'Mục tiêu: Duy trì giao tiếp mắt ổn định với camera, ngay cả khi đang suy nghĩ, để thể hiện sự tập trung và trung thực.'
        ] 
      },
      { 
        id: 2, 
        text: 'Bài 2 – Kiểm soát tốc độ nói và từ đệm', 
        details: [
          'Phân tích của AI: Tốc độ nói trung bình của bạn là 160 từ/phút (hơi nhanh) và bạn đã dùng 18 từ đệm ("ờm", "à").',
          'Mục tiêu: Giảm tốc độ nói xuống còn ~140 từ/phút và loại bỏ ít nhất 90% từ đệm để tăng sự rõ ràng và chuyên nghiệp.'
        ] 
      },
    ]
  },
  2: {
    title: '15/10/2025: Tối ưu hóa nội dung trả lời (STAR)',
    exercises: [
      { 
        id: 3, 
        text: 'Bài 3 – Kỹ thuật trả lời STAR (Phần "Result")', 
        details: [
          'Phân tích của AI: Khi trả lời câu hỏi hành vi, bạn mô tả Tình huống (S) và Nhiệm vụ (T) tốt, nhưng thường bỏ qua Kết quả (R).',
          'Mục tiêu: Luyện tập 3 câu hỏi hành vi, đảm bảo mỗi câu trả lời đều kết thúc bằng một "Kết quả" có thể đo lường được (ví dụ: "giảm 15% thời gian xử lý").'
        ] 
      },
      { 
        id: 4, 
        text: 'Bài 4 – Thêm chiều sâu cho câu trả lời kỹ thuật', 
        details: [
          'Phân tích của AI: Các câu trả lời kỹ thuật của bạn chính xác nhưng hơi ngắn. Bạn định nghĩa được "Hook là gì" nhưng không nêu được "Tại sao dùng Hook".',
          'Mục tiêu: Tập trung vào việc giải thích "Tại sao" (Why) đằng sau mỗi khái niệm kỹ thuật, không chỉ là "Cái gì" (What).'
        ] 
      },
    ]
  },
  3: {
    title: '05/11/2025: Xử lý câu hỏi tình huống',
    exercises: [
      { 
        id: 5, 
        text: 'Bài 5 – Xử lý tình huống bất ngờ', 
        details: [
          'Phân tích của AI: Khi nhận được câu hỏi "Nếu bạn không biết câu trả lời...", bạn có dấu hiệu lúng túng 2.2 giây.',
          'Mục tiêu: Chuẩn bị một chiến lược trả lời cho các câu hỏi bạn không biết, tập trung vào cách bạn sẽ tìm ra giải pháp.'
        ] 
      },
      {
        id: 6,
        text: 'Bài 6 – Trả lời về điểm yếu',
        details: [
            'Phân tích của AI: Câu trả lời về "điểm yếu" của bạn quá chung chung ("Tôi quá cầu toàn").',
            'Mục tiêu: Xây dựng một câu trả lời trung thực về một điểm yếu thực tế và cách bạn đang tích cực cải thiện nó.'
        ]
      }
    ]
  },
  4: {
    title: 'Lần 4: Phỏng vấn mô phỏng toàn diện',
    exercises: [
      { 
        id: 7, 
        text: 'Bài 7 – Thực hành phỏng vấn 30 phút (Tổng hợp)', 
        details: [
          'Phân tích của AI: Bạn đã sẵn sàng cho một bài kiểm tra tổng hợp để đánh giá các kỹ năng đã luyện tập.',
          'Mục tiêu: Hoàn thành một buổi phỏng vấn mô phỏng 30 phút, kết hợp cả 3 nhóm kỹ năng: Ngôn ngữ hình thể, Nội dung STAR và Xử lý tình huống.'
        ] 
      },
      {
        id: 8,
        text: 'Bài 8 – Chuẩn bị câu hỏi cho Nhà tuyển dụng',
        details: [
            'Phân tích của AI: Bạn chưa chuẩn bị câu hỏi để hỏi ngược lại nhà tuyển dụng.',
            'Mục tiêu: Soạn 3 câu hỏi thông minh, tập trung vào văn hóa công ty, thách thức của vị trí, và định hướng của team.'
        ]
      }
    ]
  }
};
function Practice() {
  // State để quản lý lần luyện tập đang được chọn
  const [selectedSession, setSelectedSession] = useState(1);
  // State để lưu dữ liệu của lần được chọn (giả lập từ API)
  const [sessionData, setSessionData] = useState(null);
  // State để lưu các lần đã hoàn thành (giả lập)
  const [completedSessions, setCompletedSessions] = useState([2, 4]); // Giả sử lần 2 và 4 đã xong

  // Giả lập gọi API mỗi khi 'selectedSession' thay đổi
  useEffect(() => {
    // Hiển thị loading (nếu cần)
    setSessionData(null); 
    
    // Giả lập độ trễ của API
    const timer = setTimeout(() => {
      setSessionData(MOCK_API_DATA[selectedSession]);
    }, 300); // 300ms delay

    return () => clearTimeout(timer); // Cleanup
  }, [selectedSession]);

  const sessionList = [1, 2, 3, 4]; // Danh sách các lần luyện tập

  return (
    <div className="practice-page-container">
      {/* --- CỘT BÊN TRÁI: DANH SÁCH CÁC LẦN --- */}
      <div className="practice-sidebar">
        <h3>Cá nhân hóa</h3>
        {sessionList.map((sessionNum) => (
          <button
            key={sessionNum}
            className={`session-item 
              ${selectedSession === sessionNum ? 'active' : ''} 
              ${completedSessions.includes(sessionNum) ? 'completed' : ''}
            `}
            onClick={() => setSelectedSession(sessionNum)}
          >
            Bài luyện tập {sessionNum}
            {completedSessions.includes(sessionNum) && <span className="checkmark">✓</span>}
          </button>
        ))}
      </div>

      {/* --- CỘT BÊN PHẢI: NỘI DUNG CHÍNH --- */}
      <div className="practice-content">
        {sessionData ? (
          <>
            <h2 className="content-title">{sessionData.title}</h2>
            
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

            <button className="start-button">
              Bắt đầu luyện tập
            </button>
          </>
        ) : (
          <div className="loading-spinner">Đang tải dữ liệu...</div> // Hiển thị loading
        )}
      </div>
    </div>
  );
}

export default Practice;