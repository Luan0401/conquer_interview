import React from "react";
import "../../components/Background/index.css";
import "./index.css";
import "./teamSection.scss";
import { UserOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
const members = {
  system: [
    {
      name: "Trần Minh Luân",
      role: "CTO",
      desc: "Định hướng công nghệ, dẫn dắt đội kỹ thuật. AI, giám sát phát triển sản phẩm cốt lõi an toàn, mở rộng và bền vững.",
    },
    {
      name: "Đặng Minh Chung",
      role: "Technical Staff",
      desc: "Phát triển phần mềm, kiểm thử. Gỡ lỗi, bảo trì hệ thống.",
    },
    {
      name: "Trần Minh Hoàng",
      role: "AI Staff",
      desc: "Thiết kế & Phát triển AI: Nghiên cứu, triển khai mô hình AI, quản lý dữ liệu, tích hợp AI vào sản phẩm.",
    },
  ],
  market: [
    {
      name: "Trần Minh Hy",
      role: "CFO",
      desc: "Kế hoạch Tài chính: Dự báo, ngân sách, tối ưu phân bổ tài chính, đảm bảo tuân thủ và dự báo chính xác.",
    },
    {
      name: "Huỳnh Phúc Khang",
      role: "CEO",
      desc: "Tầm nhìn & Chiến lược: Định hướng, mục tiêu và lộ trình phát triển, kêu gọi đầu tư, gắn kết đội ngũ.",
    },
    {
      name: "Hoàng Bách Phụng",
      role: "Marketing Staff",
      desc: "Tạo nội dung hấp dẫn, quản lý chiến dịch truyền thông và nghiên cứu thị trường.",
    },
  ],
};

function HomePage() {
  return (
    <div>
      <h1 className="title-homepage">
        {" "}
        CHUẨN BỊ KỸ, THÀNH CÔNG LỚN – LUYỆN <br /> TẬP PHỎNG VẤN MỌI LÚC VỚI AI.{" "}
      </h1>
      <h3 className="title-script">
        {" "}
        - AI sẽ giúp bạn có một buổi luyện tập thật thú vị <br /> và giúp bạn
        cải thiện được các kĩ năng khi đi phỏng vấn thực tế.{" "}
      </h3>
      <div className="content-section">
        
        <div className="video-container">
          <video width="600" height="340" autoPlay loop muted playsInline>
            <source src="/video/intro-video.mp4" type="video/mp4" />
            Trình duyệt của bạn không hỗ trợ video.
          </video>
        </div>
         
        
        <div className="feature-list">
          <h2 className="feature-title">
            Vì sao bạn nên chọn luyện tập cùng chúng tôi?
          </h2>

          <ul>
            <li>
               Mô phỏng phỏng vấn thực tế giúp bạn rèn luyện sự tự tin và phản
              xạ nhanh.
            </li>
            <li>
              Hỗ trợ chuyên sâu cho ngành Công nghệ thông tin, tập trung vào
              lĩnh vực IT <br/>với hệ thống câu hỏi chuyên biệt và sát với yêu cầu
              tuyển dụng.
            </li>
            <li> Phản hồi chi tiết ngay sau mỗi buổi luyện tập.</li>
            <li> Câu hỏi cập nhật, bám sát thực tế tuyển dụng.</li>
          </ul>
        </div>
      </div>
      <div className="button-wrapper">
        <Link to="/InterviewPage">
    <button className="glow-button">DÙNG THỬ MIỄN PHÍ NGAY</button>
  </Link>
      </div>
      <section className="team-section">
        <h2 className="title">CÁC THÀNH VIÊN ĐỒNG SÁNG LẬP</h2>

        <h3 className="group-title">THIẾT KẾ HỆ THỐNG</h3>
        <div className="card-container">
          {members.system.map((m, i) => (
            <div key={i} className="member-card">
              <UserOutlined className="avatar" />
              <h4 className="name">{m.name}</h4>
              <p className="role">↳ {m.role}</p>
              <p className="desc">{m.desc}</p>
            </div>
          ))}
        </div>

        <h3 className="group-title">LÊN Ý TƯỞNG PHÂN TÍCH THỊ TRƯỜNG</h3>
        <div className="card-container">
          {members.market.map((m, i) => (
            <div key={i} className="member-card">
              <UserOutlined className="avatar" />
              <h4 className="name">{m.name}</h4>
              <p className="role">↳ {m.role}</p>
              <p className="desc">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <div className="title-end" >
        <h3>Dự án được xây dựng bởi 6 thành viên trẻ, kết hợp giữa <br/>công nghệ và tư duy kinh tế – quản trị,
 cùng hiện thực hóa ý tưởng “luyện phỏng vấn cùng AI” thành nền tảng hữu ích, gần gũi với người dùng.</h3>
      </div>
    </div>
  );
}

export default HomePage;
