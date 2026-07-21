import { ArrowRight, Bot, CheckCircle2, Map, Mic2, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import '../styles/guide-page.css';

const STEPS = [
  {
    number: '01',
    icon: Mic2,
    title: 'Đánh giá giọng nói',
    description: 'Bắt đầu bằng GOODVIET Check để hệ thống hiểu cách bạn phát âm, kiểm soát hơi và diễn đạt.',
    points: ['Đọc các câu sàng lọc âm L/N, S/X, TR/CH', 'Đo tốc độ, độ rõ và nhịp điệu', 'Kể chuyện ngắn để đánh giá khả năng diễn đạt'],
    link: '/assessment',
    action: 'Bắt đầu đánh giá',
  },
  {
    number: '02',
    icon: Map,
    title: 'Luyện theo lộ trình',
    description: 'Sau đánh giá, bạn nhận bộ bài học phù hợp với mục tiêu và có thể theo dõi tiến độ mỗi ngày.',
    points: ['Bài học ngắn và dễ duy trì', 'Phản hồi ngay sau từng bản ghi', 'Theo dõi chuỗi ngày học và mục tiêu tuần'],
    link: '/pathway',
    action: 'Mở lộ trình',
  },
  {
    number: '03',
    icon: Bot,
    title: 'Nhận hỗ trợ đúng lúc',
    description: 'Chị Gà và đội ngũ chuyên gia luôn sẵn sàng giải đáp, động viên và tư vấn sâu hơn khi bạn cần.',
    points: ['Hỏi đáp tức thì với trợ lý AI', 'Gửi tin nhắn cho chuyên gia', 'Đặt lịch tư vấn phù hợp với nhu cầu'],
    link: '/chat',
    action: 'Mở tin nhắn',
  },
] as const;

export function GuidePage() {
  return (
    <main className="gv-page gv-guide">
      <div className="gv-page__inner">
        <PageHeader
          eyebrow="Trung tâm trợ giúp"
          title="Hướng dẫn sử dụng"
          description="Ba bước đơn giản để bắt đầu hành trình cải thiện giọng nói cùng GoodViet."
        />

        <section className="gv-guide__hero" aria-labelledby="guide-overview-title">
          <div>
            <span><ShieldCheck size={16} /> Hành trình cá nhân hóa</span>
            <h2 id="guide-overview-title">Hiểu giọng nói. Luyện đúng trọng tâm. Tự tin hơn mỗi ngày.</h2>
            <p>GoodViet kết hợp đánh giá bằng AI, bài luyện có định hướng và sự đồng hành của chuyên gia trong một trải nghiệm thống nhất.</p>
          </div>
          <ol aria-label="Ba bước sử dụng GoodViet">
            <li><strong>1</strong><span>Đánh giá</span></li>
            <li><strong>2</strong><span>Luyện tập</span></li>
            <li><strong>3</strong><span>Đồng hành</span></li>
          </ol>
        </section>

        <section className="gv-guide__steps" aria-label="Các bước sử dụng">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <article className="gv-guide__step" key={step.number}>
                <div className="gv-guide__step-top">
                  <span className="gv-guide__step-icon"><Icon size={23} /></span>
                  <span className="gv-guide__step-number">{step.number}</span>
                </div>
                <h2>{step.title}</h2>
                <p>{step.description}</p>
                <ul>
                  {step.points.map((point) => <li key={point}><CheckCircle2 size={16} /> {point}</li>)}
                </ul>
                <Link to={step.link}>{step.action} <ArrowRight size={16} /></Link>
              </article>
            );
          })}
        </section>

        <footer className="gv-guide__support">
          <div>
            <span className="gv-guide__support-icon"><Bot size={24} /></span>
            <div><strong>Bạn vẫn cần trợ giúp?</strong><p>Hãy nhắn cho Chị Gà hoặc liên hệ đội ngũ GoodViet qua galamkhoahoc@gmail.com.</p></div>
          </div>
          <Link to="/chat">Trò chuyện ngay <ArrowRight size={16} /></Link>
        </footer>
      </div>
    </main>
  );
}
