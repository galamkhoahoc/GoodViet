import { useMemo, useState } from 'react';
import { Check, Clock3, Search, SlidersHorizontal, Star } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { toast } from '../components/common/Toast';
import '../styles/expert-directory.css';

const EXPERTS = [
  { id: 1, name: 'GS. Nguyễn Văn B', title: 'Chuyên gia Ngôn ngữ học', rating: 4.9, reviews: 120, tags: ['Ngôn ngữ học', 'Chỉnh âm'], avatar: '/images/avatars/expert_1_new.jpg', status: 'available', fee: '500.000đ/giờ', responseTime: 'Phản hồi trong 30 phút' },
  { id: 2, name: 'ThS. Lê Trần', title: 'Chuyên gia Tâm lý', rating: 4.8, reviews: 85, tags: ['Tâm lý học', 'Đồng hành cảm xúc'], avatar: '/images/avatars/expert_2_new.jpg', status: 'busy', fee: '400.000đ/giờ', responseTime: 'Phản hồi trong hôm nay' },
  { id: 3, name: 'Bác sĩ Ngọc Phạm', title: 'Bác sĩ Trị liệu', rating: 5.0, reviews: 42, tags: ['Trị liệu', 'Nhi khoa'], avatar: '/images/avatars/expert_3_new.jpg', status: 'available', fee: '600.000đ/giờ', responseTime: 'Phản hồi trong 1 giờ' },
  { id: 4, name: 'TS. Trần Hoàng', title: 'Cố vấn Giao tiếp', rating: 4.7, reviews: 200, tags: ['Giao tiếp', 'Thuyết trình'], avatar: '/images/avatars/expert_4_new.jpg', status: 'available', fee: '450.000đ/giờ', responseTime: 'Phản hồi trong 2 giờ' },
  { id: 5, name: 'ThS. Phạm Mai', title: 'Chuyên viên Giáo dục', rating: 4.9, reviews: 156, tags: ['Can thiệp sớm', 'Phát triển ngôn ngữ'], avatar: '/images/avatars/expert_5_new.jpg', status: 'available', fee: '350.000đ/giờ', responseTime: 'Phản hồi trong 1 giờ' },
  { id: 6, name: 'BS. Hoàng Nam', title: 'Chuyên gia Thính học', rating: 4.8, reviews: 92, tags: ['Thính lực', 'Trị liệu'], avatar: '/images/avatars/expert_6_new.jpg', status: 'busy', fee: '550.000đ/giờ', responseTime: 'Phản hồi trong hôm nay' },
] as const;

const CATEGORIES = ['Tất cả', 'Ngôn ngữ học', 'Tâm lý học', 'Trị liệu', 'Can thiệp sớm'] as const;

export function FindExpertsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<(typeof CATEGORIES)[number]>('Tất cả');
  const [requestedId, setRequestedId] = useState<number | null>(null);

  const filteredExperts = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase('vi');
    return EXPERTS.filter((expert) => {
      const matchesQuery = !query || `${expert.name} ${expert.title} ${expert.tags.join(' ')}`
        .toLocaleLowerCase('vi')
        .includes(query);
      const matchesCategory = activeCategory === 'Tất cả' || expert.tags.includes(activeCategory as never);
      return matchesQuery && matchesCategory;
    });
  }, [activeCategory, searchTerm]);

  const handleRequest = (id: number, name: string) => {
    setRequestedId(id);
    toast.success('Đã gửi yêu cầu kết nối', `${name} sẽ nhận được yêu cầu tư vấn của bạn.`);
    window.setTimeout(() => setRequestedId(null), 1000);
  };

  return (
    <main className="gv-page gv-experts">
      <div className="gv-page__inner">
        <PageHeader
          eyebrow="Đội ngũ đồng hành"
          title="Tìm chuyên gia"
          description="Kết nối với chuyên gia ngôn ngữ, nhà trị liệu và bác sĩ phù hợp với mục tiêu luyện tập của bạn."
        />

        <section className="gv-experts__toolbar" aria-label="Tìm và lọc chuyên gia">
          <label className="gv-experts__search">
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              value={searchTerm}
              placeholder="Tìm theo tên, chuyên ngành, kỹ năng..."
              aria-label="Tìm chuyên gia"
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>
          <button type="button" className="gv-experts__filter">
            <SlidersHorizontal size={18} /> Bộ lọc
          </button>
        </section>

        <div className="gv-experts__categories" aria-label="Lọc theo chuyên ngành">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              className={activeCategory === category ? 'is-active' : ''}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="gv-experts__summary">
          <h2>Chuyên gia phù hợp</h2>
          <span>{filteredExperts.length} kết quả</span>
        </div>

        {filteredExperts.length > 0 ? (
          <section className="gv-experts__grid" aria-label="Danh sách chuyên gia">
            {filteredExperts.map((expert) => (
              <article className="gv-experts__card" key={expert.id}>
                <div className="gv-experts__identity">
                  <div className="gv-experts__avatar">
                    <img src={expert.avatar} alt={expert.name} />
                    <span className={expert.status === 'available' ? 'is-online' : ''} aria-label={expert.status === 'available' ? 'Đang trực tuyến' : 'Đang bận'} />
                  </div>
                  <div>
                    <h3>{expert.name}</h3>
                    <p>{expert.title}</p>
                    <span className="gv-experts__rating"><Star size={15} fill="currentColor" /> <strong>{expert.rating}</strong> ({expert.reviews} đánh giá)</span>
                  </div>
                </div>

                <div className="gv-experts__tags">
                  {expert.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>

                <p className="gv-experts__response"><Clock3 size={15} /> {expert.responseTime}</p>

                <footer>
                  <div><small>Phí tư vấn</small><strong>{expert.fee}</strong></div>
                  <button
                    type="button"
                    disabled={requestedId === expert.id}
                    onClick={() => handleRequest(expert.id, expert.name)}
                  >
                    {requestedId === expert.id ? <><Check size={17} /> Đã gửi</> : 'Gửi yêu cầu'}
                  </button>
                </footer>
              </article>
            ))}
          </section>
        ) : (
          <section className="gv-experts__empty" role="status">
            <Search size={25} />
            <h2>Chưa tìm thấy chuyên gia phù hợp</h2>
            <p>Hãy thử từ khóa khác hoặc chọn lại chuyên ngành.</p>
            <button type="button" onClick={() => { setSearchTerm(''); setActiveCategory('Tất cả'); }}>Xóa bộ lọc</button>
          </section>
        )}
      </div>
    </main>
  );
}
