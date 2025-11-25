
import React, { useState } from "react";
import "../../components/Background/index.css";
import "./teamSection.scss";
import { useNavigate } from "react-router-dom";
import { 
  PlayCircleOutlined, 
  ApartmentOutlined, 
  DesktopOutlined, 
  CheckCircleOutlined, 
  CodeOutlined, 
  SolutionOutlined, 
  SyncOutlined,
  DatabaseOutlined,
  AudioOutlined,
  CameraOutlined,
  CloudServerOutlined 
} from "@ant-design/icons";
import PreInterviewModal from "../PreInterviewModal/index.jsx";
import { Link } from "react-router-dom";

const members = {
  system: [
    {
      name: "Trần Minh Luân",
      role: "CTO",
      desc: "Định hướng công nghệ, dẫn dắt đội kỹ thuật. AI, giám sát phát triển sản phẩm cốt lõi an toàn, mở rộng và bền vững.",
      imageUrl: "/image/TRANMINHLUAN.jpg",
    },
    {
      name: "Đặng Minh Chung",
      role: "Technical Staff",
      desc: "Phát triển phần mềm, kiểm thử. Gỡ lỗi, bảo trì hệ thống.",
      imageUrl: "/image/Chung.jpg",
    },
    {
      name: "Trần Minh Hoàng",
      role: "AI Staff",
      desc: "Thiết kế & Phát triển AI: Nghiên cứu, triển khai mô hình AI, quản lý dữ liệu, tích hợp AI vào sản phẩm.",
      imageUrl: "/image/Hoang.jpg",
    },
  ],
  market: [
    {
      name: "Trần Minh Hy",
      role: "CFO",
      desc: "Kế hoạch Tài chính: Dự báo, ngân sách, tối ưu phân bổ tài chính, đảm bảo tuân thủ và dự báo chính xác.",
      imageUrl: "/image/Hy.jpg",
    },
    {
      name: "Huỳnh Phúc Khang",
      role: "CEO",
      desc: "Tầm nhìn & Chiến lược: Định hướng, mục tiêu và lộ trình phát triển, kêu gọi đầu tư, gắn kết đội ngũ.",
      imageUrl: "/image/Khang.jpg",
    },
    {
      name: "Hoàng Bách Phụng",
      role: "Marketing Staff",
      desc: "Tạo nội dung hấp dẫn, quản lý chiến dịch truyền thông và nghiên cứu thị trường.",
      imageUrl: "/image/Phung.jpg",
    },
  ],
};

function HomePage() {
  const navigate = useNavigate(); // Khởi tạo hook useNavigate
  // Dữ liệu giả lập (SẼ THAY THẾ BẰNG REDUX/API TRONG ỨNG DỤNG THỰC TẾ)
  const initialUserStatus = parseInt(sessionStorage.getItem('userStatus'));
    // Lưu ý: trialCount được lưu là số lượt ĐÃ DÙNG
    const initialTrialCount = parseInt(sessionStorage.getItem('trialCount'));

    console.log("--- HOME PAGE STATE INITIALIZATION ---");
    console.log("Session Storage (userStatus):", sessionStorage.getItem('userStatus'));
    console.log("Session Storage (trialCount):", sessionStorage.getItem('trialCount'));
    console.log("Parsed Initial User Status (initialUserStatus):", initialUserStatus);
    console.log("Parsed Initial Trial Count (initialTrialCount):", initialTrialCount);
    console.log("---------------------------------------");
  // *** HÀM KIỂM TRA ĐĂNG NHẬP SỬ DỤNG sessionStorage ***
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [userStatus, setUserStatus] = useState(initialUserStatus); // <-- ĐÃ THAY THẾ GIÁ TRỊ CỨNG
  const [trialCount, setTrialCount] = useState(initialTrialCount);
  const isAuthenticated = () => {
    // Kiểm tra xem 'authToken' (hoặc key token thực tế của bạn) có tồn tại trong sessionStorage không
    const token = sessionStorage.getItem('token'); 
    return token ? true : false;
  };

  const handleStartInterview = () => {
    if (isAuthenticated()) {
      // Nếu đã đăng nhập, chuyển đến trang phỏng vấn
      setIsModalOpen(true);
    } else {
      // Nếu chưa đăng nhập, chuyển đến trang đăng nhập
      // (Thay /login bằng route đăng nhập thực tế của bạn nếu khác)
      navigate("/login"); 
    }
  };

  const handleCloseModal = () => {
      setIsModalOpen(false);
      
  }
  React.useEffect(() => {
        const statusFromStorage = parseInt(sessionStorage.getItem('userStatus') || '0');
        const countFromStorage = parseInt(sessionStorage.getItem('trialCount') || '0');

        if (statusFromStorage !== userStatus) {
            setUserStatus(statusFromStorage);
        }
        if (countFromStorage !== trialCount) {
            setTrialCount(countFromStorage);
        }
        // Có thể cần thêm logic lắng nghe sự kiện storage event nếu muốn cập nhật ngay lập tức
    }, []);
  return (
    <div>
      {/* --- 1. TIÊU ĐỀ --- */}
      <h1 className="title-homepage">
        {" "}
        Chuẩn Bị Kỹ, Thành Công Lớn, Luyện Phỏng Vấn <br /> Mọi Lúc Với AI{" "}
      </h1>
      <h3 className="title-script">
        {" "}
        Chuẩn bị cho thành công của bạn với trình mô phỏng phỏng vấn AI thông minh <br /> tùy chỉnh theo con đường nghề nghiệp và kinh nghiệm cá nhân
        <br /> luyện tập không giới hạn để chinh phục <br />mọi nhà tuyển dụng.{" "}
      </h3>

      {/* --- HÀNG BỌC CỘT TRÁI VÀ CỘT PHẢI --- */}
<div className="video-and-features-row">

  {/* --- 1. CỘT TRÁI (MỚI): Chứa Video và Nút --- */}
  <div className="left-column">
    
    {/* Cột video */}
    <div className="video-container-top">
      <video width="900" height="506" autoPlay loop muted playsInline controls>
        <source src="/video/intro-video.mp4" type="video/mp4" />
        Trình duyệt của bạn không hỗg trợ video.
      </video>
    </div>
    
    {/* NÚT BẤM (Nằm ngay dưới video) */}
    <div className="button-wrapper">
      <button className="glow-button" onClick={handleStartInterview}>
              DÙNG THỬ MIỄN PHÍ NGAY
            </button>
    </div>
    
  </div> {/* --- Kết thúc Cột Trái --- */}
  
  
  {/* --- 2. CỘT PHẢI (Giữ nguyên) --- */}
  <div className="features-column">
    <h3 className="feature-title">
      Trải nghiệm phỏng vấn chân thực
    </h3>
    <div className="feature-cards-wrapper">
      {/* Card 1 */}
      <div className="feature-item">
        <div className="feature-icon"><CheckCircleOutlined /></div>
        <div className="feature-text">
          <strong>Mô phỏng thực tế</strong>
          <p>Rèn luyện sự tự tin và phản xạ nhanh như đang phỏng vấn thật.</p>
        </div>
      </div>
      {/* Card 2 */}
      <div className="feature-item">
        <div className="feature-icon"><CodeOutlined /></div>
        <div className="feature-text">
          <strong>Chuyên sâu về IT</strong>
          <p>Hệ thống câu hỏi chuyên biệt, bám sát yêu cầu tuyển dụng ngành.</p>
        </div>
      </div>
      {/* Card 3 */}
      <div className="feature-item">
        <div className="feature-icon"><SolutionOutlined /></div>
        <div className="feature-text">
          <strong>Phản hồi chi tiết</strong>
          <p>Nhận phân tích và góp ý tức thì để cải thiện sau mỗi câu trả lời.</p>
        </div>
      </div>
      {/* Card 4 */}
      <div className="feature-item">
        <div className="feature-icon"><SyncOutlined /></div>
        <div className="feature-text">
          <strong>Câu hỏi luôn cập nhật</strong>
          <p>Học hỏi từ các xu hướng và kịch bản phỏng vấn mới nhất.</p>
        </div>
      </div>
    </div>
  </div> {/* --- Kết thúc Cột Phải --- */}
  
</div> {/* --- Kết thúc .video-and-features-row --- */}

      {/* --- 3. SECTION CÔNG NGHỆ (Vị trí mới) --- */}
      <section className="tech-stack-section">
        <h2 className="tech-title">Công Nghệ Đằng Sau Mô Hình AI</h2>
        <div className="tech-grid">
          <div className="tech-item">
            <div className="tech-icon"><DatabaseOutlined /></div>
            <strong>Mô Hình Ngôn Ngữ Lớn (LLMs)</strong>
            <p>Phân tích câu trả lời chuyên sâu, tạo câu hỏi bám sát thực tế.</p>
          </div>
          <div className="tech-item">
            <div className="tech-icon"><AudioOutlined /></div>
            <strong>Phân Tích Giọng Nói (Speech AI)</strong>
            <p>Đánh giá ngữ điệu, tốc độ nói và các từ lấp (filler words).</p>
          </div>
          <div className="tech-item">
            <div className="tech-icon"><CameraOutlined /></div>
            <strong>Phân Tích Cử Chỉ (Vision AI)</strong>
            <p>Ghi nhận ngôn ngữ cơ thể, giao tiếp bằng mắt (eye contact).</p>
          </div>
          <div className="tech-item">
            <div className="tech-icon"><CloudServerOutlined /></div>
            <strong>Nền Tảng Đám Mây</strong>
            <p>Xử lý nhanh chóng, an toàn và khả năng mở rộng không giới hạn.</p>
          </div>
        </div>
      </section>

      {/* --- 4. CÁCH HOẠT ĐỘNG --- */}
      <section className="how-it-works-section">
        <h2 className="how-it-works-title">
          Cách Thức Hoạt Động Của Mô Phỏng Phỏng Vấn AI
        </h2>
        <div className="steps-container">
          {/* Step 1 */}
          <div className="step-card">
            <div className="step-number-wrapper"><span className="step-number">1</span></div>
            <h3 className="step-title">Thiết Lập Hồ Sơ</h3>
            <p className="step-description">
              Tải lên CV của bạn và chỉ định vị trí mục tiêu để AI có thể tạo ra các câu hỏi phỏng vấn phù hợp và cá nhân hóa.
            </p>
          </div>
          {/* Step 2 */}
          <div className="step-card">
            <div className="step-number-wrapper"><span className="step-number">2</span></div>
            <h3 className="step-title">Bắt Đầu Phiên Thực Hành</h3>
            <p className="step-description">
              Bắt đầu mô phỏng phỏng vấn được hỗ trợ bởi AI với các câu hỏi thực tế được thiết kế riêng cho kinh nghiệm và mục tiêu công việc của bạn.
            </p>
          </div>
          {/* Step 3 */}
          <div className="step-card">
            <div className="step-number-wrapper"><span className="step-number">3</span></div>
            <h3 className="step-title">Nhận Phản Hồi Thời Gian Thực</h3>
            <p className="step-description">
              Nhận được phân tích tức thì về các câu trả lời của bạn, bao gồm gợi ý cải thiện và những điểm mạnh.
            </p>
          </div>
          {/* Step 4 */}
          <div className="step-card">
            <div className="step-number-wrapper"><span className="step-number">4</span></div>
            <h3 className="step-title">Theo Dõi Tiến Bộ</h3>
            <p className="step-description">
              Giám sát sự cải thiện của bạn theo thời gian với phân tích chi tiết và khuyến nghị cá nhân hóa để phát triển liên tục.
            </p>
          </div>
        </div>
      </section>

      

      {/* --- 6. TÍNH NĂNG CHÍNH (3 CỘT) --- */}
      <section className="features-section">
        <h2 className="features-title">Tính Năng Chính</h2>
        <div className="features-container">
          {/* Card 1 */}
          <div className="feature-card">
            <div className="icon-wrapper">
              <PlayCircleOutlined className="icon" />
            </div>
            <h3 className="card-title">Điều Kiện Phỏng Vấn Thực Tế</h3>
            <p className="card-description">
              Trải nghiệm áp lực phỏng vấn chân thực với các câu hỏi thích ứng phản ánh hành vi của người phỏng vấn thực tế.
            </p>
          </div>
          {/* Card 2 */}
          <div className="feature-card">
            <div className="icon-wrapper">
              <ApartmentOutlined className="icon" /> 
            </div>
            <h3 className="card-title">Câu Hỏi AI Thích Ứng</h3>
            <p className="card-description">
              Đối mặt với các câu hỏi theo dõi động thích ứng dựa trên phản hồi của bạn, giống như người phỏng vấn thực sự.
            </p>
          </div>
          {/* Card 3 */}
          <div className="feature-card">
            <div className="icon-wrapper">
              <DesktopOutlined className="icon" />
            </div>
            <h3 className="card-title">Phản Hồi Hiệu Suất Tức Thì</h3>
            <p className="card-description">
              Nhận phân tích ngay lập tức và đề xuất cải thiện cho mỗi phản hồi để tăng tốc quá trình học tập của bạn.
            </p>
          </div>
        </div>
      </section>

      {/* --- 7. ĐỘI NGŨ --- */}
      <section className="team-section">
        <h2 className="title">CÁC THÀNH VIÊN ĐỒNG SÁNG LẬP</h2>
        <div className="card-container">
          {members.system.map((m, i) => (
            <div key={`system-${i}`} className="member-card">
              <img src={m.imageUrl} alt={m.name} className="avatar" />
              <h4 className="name">{m.name}</h4>
              <p className="role">↳ {m.role}</p>
              <p className="desc">{m.desc}</p>
            </div>
          ))}
          {members.market.map((m, i) => (
            <div key={`market-${i}`} className="member-card">
              <img src={m.imageUrl} alt={m.name} className="avatar" />
              <h4 className="name">{m.name}</h4>
              <p className="role">↳ {m.role}</p>
              <p className="desc">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- 8. FOOTER --- */}
      <section className="end_session">
        <div className="footer-content">
          {/* Cột 1: Về thương hiệu */}
          <div className="footer-column brand">
            <h4>CONQUER INTERVIEW</h4> 
            <p>Mô phỏng phỏng vấn AI thông minh, giúp bạn tự tin chinh phục mọi nhà tuyển dụng.</p>
          </div>
          {/* Cột 2: Liên kết nhanh */}
          <div className="footer-column links">
            <h4>Liên kết</h4>
            <ul>
              <li><a href="/">Trang chủ</a></li>
              <li><a href="/">Tính năng</a></li>
              <li><a href="/">Luyện tập ngay</a></li>
            </ul>
          </div>
          {/* Cột 3: Hỗ trợ */}
          <div className="footer-column links">
            <h4>Hỗ trợ</h4>
            <ul>
              <li><a href="/feedback">Câu hỏi thường gặp</a></li>
              <li><a href="/feedback">Liên hệ</a></li>
              <li><a href="/support">Về chúng tôi</a></li>
            </ul>
          </div>
          {/* Cột 4: Mạng xã hội */}
          <div className="footer-column social">
            <h4>Theo dõi chúng tôi</h4>
          </div>
        </div>
        
        {/* Phần đáy của Footer: Bản quyền và pháp lý */}
        <div className="footer-bottom">
          <p>Bản quyền © 2024 Conquer Interview. Đã đăng ký bản quyền.</p>
          <div className="legal-links">
            <a href="/pricing">Điều khoản dịch vụ</a>
            <a href="/">Chính sách bảo mật</a>
          </div>
        </div>
      </section>
      <PreInterviewModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        userStatus={userStatus} // Truyền trạng thái gói cước (0 hoặc 1)
        trialCount={trialCount} // Truyền số lần đã dùng thử
      />
    </div>
  );
}

export default HomePage;