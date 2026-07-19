
export function GuidePage() {
  return (
    <main className="flex-1 ml-nav-rail-width min-h-screen pb-12 pt-0 bg-background text-on-background">
      <div className="max-w-[800px] mx-auto p-12">
        <header className="mb-12">
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-xs font-medium uppercase tracking-wider mb-6">
            <span className="material-symbols-outlined text-[14px]">auto_stories</span>
            Tài liệu
          </div>
          <h1 className="font-display-lg text-display-lg font-bold tracking-tight mb-4">
            Hướng dẫn sử dụng GOODVIET
          </h1>
          <p className="font-body-lg text-on-surface-variant leading-relaxed">
            Chào mừng bạn đến với GOODVIET! Bài viết này sẽ hướng dẫn bạn chi tiết các bước để bắt đầu hành trình cải thiện và hoàn thiện giọng nói tiếng Việt của mình.
          </p>
        </header>

        <article className="flex flex-col gap-10">
          <section className="bg-surface-lowest organic-curve p-10 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-transparent">
            <h2 className="font-title-lg font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">looks_one</span>
              Bước 1: Làm bài test sàng lọc (GOODVIET Check)
            </h2>
            <div className="font-body-md text-on-surface-variant leading-relaxed space-y-4">
              <p>
                Mọi hành trình đều bắt đầu từ việc hiểu rõ bản thân. Bạn hãy truy cập vào mục <strong>Đánh giá</strong> trên thanh menu bên trái.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Giai đoạn I:</strong> Đọc to các câu văn ngắn. Hệ thống sẽ phát hiện các lỗi phát âm cơ bản (L/N, TR/CH, S/X,...).</li>
                <li><strong>Giai đoạn II:</strong> Kiểm tra chéo. Đọc lại các câu để AI và Chuyên gia xác nhận xem bạn có thực sự mắc lỗi đó không.</li>
                <li><strong>Giai đoạn III:</strong> Kể chuyện tự do trong 1-2 phút. Hãy nói một cách tự nhiên nhất để hệ thống đánh giá âm điệu, hơi thở và sự tự tin.</li>
              </ul>
              <p className="text-sm italic opacity-80 mt-4">
                *Lưu ý: Mỗi tài khoản chỉ được làm bài test này 1 lần duy nhất để đảm bảo lộ trình cá nhân hóa chính xác nhất.
              </p>
            </div>
          </section>

          <section className="bg-surface-lowest organic-curve p-10 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-transparent">
            <h2 className="font-title-lg font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">looks_two</span>
              Bước 2: Luyện tập theo Lộ trình cá nhân hóa
            </h2>
            <div className="font-body-md text-on-surface-variant leading-relaxed space-y-4">
              <p>
                Sau khi có kết quả đánh giá, hệ thống sẽ đề xuất cho bạn một <strong>Lộ trình</strong> phù hợp. Truy cập mục <strong>Lộ trình</strong> để bắt đầu.
              </p>
              <p>
                Trong mỗi lộ trình sẽ có các khóa học nhỏ (ví dụ: Giao tiếp hàng ngày, Tiếng Việt Công sở). 
                Bạn nên hoàn thành từng bài học mỗi ngày để duy trì chuỗi hoạt động (streak) nhằm đạt hiệu quả cao nhất.
              </p>
            </div>
          </section>

          <section className="bg-surface-lowest organic-curve p-10 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-transparent">
            <h2 className="font-title-lg font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">looks_3</span>
              Bước 3: Trò chuyện và nhận tư vấn từ Chuyên gia
            </h2>
            <div className="font-body-md text-on-surface-variant leading-relaxed space-y-4">
              <p>
                Nếu gặp khó khăn trong quá trình luyện tập, đừng ngần ngại truy cập mục <strong>Chuyên gia</strong> hoặc <strong>Chatbot</strong>.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Chatbot AI:</strong> Hỏi đáp tức thì các vấn đề về ngữ âm, từ vựng và lấy ví dụ.</li>
                <li><strong>Chuyên gia:</strong> Đặt lịch hoặc gửi tin nhắn trực tiếp cho các chuyên gia ngôn ngữ để được hướng dẫn 1-1.</li>
              </ul>
            </div>
          </section>
        </article>

        <footer className="mt-16 text-center border-t border-outline-variant/20 pt-8">
          <p className="font-body-sm text-on-surface-variant">
            Bạn cần hỗ trợ thêm? Hãy gửi email cho chúng tôi qua <strong>support@goodviet.com</strong>
          </p>
        </footer>
      </div>
    </main>
  );
}
