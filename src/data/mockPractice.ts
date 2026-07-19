export type PracticeLessonStatus = 'not_started' | 'in_progress' | 'completed';

export interface PracticeLesson {
  id: string;
  order: number;
  title: string;
  goal: string;
  focus: string[];
  shortSentences: string[];
  longPassages: string[];
  level: 'Cơ bản' | 'Trung cấp' | 'Nâng cao';
  estimatedMinutes: number;
  progress: number;
  status: PracticeLessonStatus;
  targetPhonemes?: string[];
}

export const practiceLessons: PracticeLesson[] = [
  {
    id: 'practice-ai-nlp',
    order: 1,
    title: 'Trí tuệ nhân tạo và Xử lý ngôn ngữ tự nhiên',
    goal: 'Luyện phát âm các thuật ngữ công nghệ, rèn luyện nhịp điệu khi đọc các câu ghép có nhiều mệnh đề.',
    focus: ['Thuật ngữ công nghệ', 'Câu ghép', 'Nhịp điệu'],
    shortSentences: [
      'Mô hình học sâu đa phương thức đang ngày càng trở nên phổ biến.',
      'Việc tối ưu hóa kiến trúc mạng nơ-ron đòi hỏi rất nhiều thời gian.',
      'Kỹ thuật chưng cất tri thức giúp thu gọn đáng kể kích thước mô hình.',
    ],
    longPassages: [
      'Dựa trên kết quả thực nghiệm với tập dữ liệu lớn, chúng ta có thể thấy rõ bức tranh toàn cảnh về hiệu năng của cả hai mô hình nhúng từ. Sự hội tụ của phương pháp phân phối từ vựng mang lại độ chính xác cao hơn trong các tác vụ hiểu ngôn ngữ.',
      'Khi xây dựng mạng nơ-ron nhận diện cảm xúc chéo, việc đóng băng các lớp trích xuất đặc trưng ban đầu sẽ giúp tiết kiệm tài nguyên tính toán. Sau đó, chúng ta chỉ cần tinh chỉnh các lớp chú ý ở phần cuối để hợp nhất tín hiệu hình ảnh và văn bản.',
      'Quá trình chuẩn hóa văn bản tiếng Việt đòi hỏi việc xử lý từ vựng ngoài từ điển và nhiễu dữ liệu. Bằng cách sử dụng một mô hình giáo viên kích thước lớn, chúng ta có thể truyền đạt tri thức sang một mô hình học trò nhỏ gọn, giúp triển khai thực tế dễ dàng hơn.',
    ],
    level: 'Nâng cao',
    estimatedMinutes: 12,
    progress: 45,
    status: 'in_progress',
  },
  {
    id: 'practice-applied-math',
    order: 2,
    title: 'Toán ứng dụng và Thống kê',
    goal: 'Luyện sự trôi chảy, rành mạch khi trình bày các khái niệm trừu tượng, giải thích bản chất vấn đề.',
    focus: ['Khái niệm trừu tượng', 'Độ rành mạch', 'Giải thích'],
    shortSentences: [
      'Định lý giới hạn trung tâm là nền tảng cốt lõi của thống kê suy diễn.',
      'Biến ngẫu nhiên rời rạc luôn có một hàm khối xác suất đặc trưng riêng.',
      'Phép biến đổi tuyến tính bảo toàn các phép toán trong không gian vector.',
    ],
    longPassages: [
      'Trong lý thuyết xác suất, việc phân tích sự phân bố của các biến ngẫu nhiên rời rạc giúp chúng ta hiểu rõ bản chất của các sự kiện độc lập. Chúng ta không cần đi sâu vào tính toán định lượng, mà quan trọng là nắm bắt được hình dáng của hàm mật độ và ý nghĩa thực tế của nó.',
      'Khi giải quyết bài toán nội suy đa thức, việc lựa chọn các nút nội suy phù hợp sẽ quyết định tốc độ hội tụ của thuật toán. Sự phân bố của các nút này trên khoảng nội suy đóng vai trò cốt lõi trong việc giảm thiểu sai số của phép xấp xỉ.',
      'Đại số tuyến tính cung cấp công cụ mạnh mẽ để biểu diễn và tối ưu hóa các hàm nhiều biến. Việc tính toán đạo hàm theo hướng và ma trận không gian cho phép chúng ta tìm ra cực trị cục bộ mà không cần phải giải các phương trình phi tuyến phức tạp.',
    ],
    level: 'Nâng cao',
    estimatedMinutes: 12,
    progress: 0,
    status: 'not_started',
  },
  {
    id: 'practice-wearables',
    order: 3,
    title: 'Trải nghiệm Thiết bị đeo thông minh',
    goal: 'Luyện giọng điệu thuyết phục, miêu tả hình ảnh trực quan và đánh giá trải nghiệm người dùng.',
    focus: ['Giọng thuyết phục', 'Miêu tả', 'Trải nghiệm người dùng'],
    shortSentences: [
      'Vị trí cảm biến quang học ảnh hưởng trực tiếp đến độ chính xác dữ liệu.',
      'Mặt đồng hồ cổ điển luôn mang lại vẻ đẹp thanh lịch và vô cùng tinh tế.',
      'Dây đeo lai là sự kết hợp hoàn hảo giữa da thật và silicon siêu bền.',
    ],
    longPassages: [
      'Trong quá trình thiết kế đồng hồ thông minh, việc bố trí các cảm biến vật lý ở mặt dưới cần tuân thủ nghiêm ngặt các nguyên tắc về công thái học. Điều này đảm bảo thiết bị luôn tiếp xúc vừa vặn với cổ tay, từ đó thu thập dữ liệu nhịp tim một cách liên tục.',
      'Một mặt đồng hồ được thiết kế tốt phải cân bằng được giữa tính thẩm mỹ và lượng thông tin hiển thị. Những người dùng yêu thích phong cách cổ điển thường ưu tiên bố cục tối giản, với kim đồng hồ sắc nét và độ tương phản cao để dễ dàng theo dõi dưới ánh sáng mặt trời.',
      'Độ bền của dây đeo là một yếu tố không thể bỏ qua đối với người dùng vận động thường xuyên. Việc kết hợp bề mặt da sang trọng bên ngoài với lớp silicon thoát mồ hôi bên trong không chỉ giữ được vẻ đẹp hình thức mà còn ngăn ngừa tình trạng kích ứng da.',
    ],
    level: 'Trung cấp',
    estimatedMinutes: 10,
    progress: 0,
    status: 'not_started',
  },
  {
    id: 'practice-signal-audio',
    order: 4,
    title: 'Phân tích Tín hiệu và Âm thanh',
    goal: 'Luyện sự chính xác về phát âm, đặc biệt là các âm TR, CH, S, X; ngắt nghỉ đúng nhịp ở các câu có nhiều thuật ngữ.',
    focus: ['Phát âm chính xác', 'Ngắt nghỉ', 'Thuật ngữ'],
    shortSentences: [
      'Quá trình trích xuất đặc trưng âm thanh đòi hỏi độ chính xác tuyệt đối.',
      'Phân tích tần số cho phép lọc bỏ các dải nhiễu môi trường không mong muốn.',
      'Độ lệch thời gian giữa các luồng truyền thông cần được bù đắp kịp thời.',
    ],
    longPassages: [
      'Khi tiến hành phân tích các tệp âm thanh, việc xác định chính xác các đỉnh biên độ là bước đầu tiên để đồng bộ hóa các luồng tín hiệu. Kỹ thuật này đặc biệt hữu ích khi xử lý dữ liệu thu được từ nhiều thiết bị quay phát khác nhau trong cùng một thời điểm.',
      'Thuật toán gióng hàng chuỗi thời gian sẽ phân tích sự chênh lệch pha giữa luồng video gốc và các tệp ghi âm bổ sung. Bằng cách tính toán độ lệch tại các điểm bùng nổ âm thanh, hệ thống có thể tự động căn chỉnh và hợp nhất chúng thành một tệp hoàn chỉnh.',
      'Việc sử dụng các thư viện phân tích sóng âm giúp các kỹ sư dữ liệu dễ dàng trích xuất biểu đồ phổ từ tín hiệu thô. Những đặc trưng này không chỉ đóng vai trò nhận diện mẫu giọng nói mà còn là đầu vào chất lượng cho các mô hình học máy phức tạp.',
    ],
    level: 'Nâng cao',
    estimatedMinutes: 12,
    progress: 70,
    status: 'in_progress',
    targetPhonemes: ['tr', 'ch', 's', 'x'],
  },
  {
    id: 'practice-public-transport',
    order: 5,
    title: 'Giao thông công cộng và Môi trường đô thị',
    goal: 'Luyện phát âm các từ ghép âm tiết, rèn luyện sự dứt khoát và rõ ràng khi trình bày các giải pháp mang tính vĩ mô.',
    focus: ['Từ ghép', 'Sự dứt khoát', 'Giải pháp vĩ mô'],
    shortSentences: [
      'Phát triển giao thông công cộng là giải pháp then chốt cho đô thị.',
      'Việc sử dụng vé xe buýt điện tử mang lại nhiều tiện ích thiết thực.',
      'Khuyến khích người dân đi xe buýt góp phần giảm thiểu ùn tắc giao thông.',
    ],
    longPassages: [
      'Sự gia tăng nhanh chóng của các phương tiện cá nhân đang đặt ra áp lực khổng lồ lên cơ sở hạ tầng. Để giải quyết bài toán này, việc tích hợp hồ sơ di chuyển qua các ứng dụng định danh thông minh đang trở thành một xu hướng tất yếu của các thành phố hiện đại.',
      'Đề xuất bổ sung tiêu chí cộng điểm rèn luyện cho những sinh viên sử dụng phương tiện giao thông công cộng để đi học là một sáng kiến mang tính thực tiễn cao. Khuyến khích hành vi tích cực từ giới trẻ sẽ tạo ra những thay đổi bền vững trong văn hóa di chuyển.',
      'Không chỉ giảm thiểu lượng khí thải carbon, việc số hóa quy trình soát vé thông qua nền tảng điện tử còn giúp cơ quan quản lý thu thập được dữ liệu di chuyển chính xác. Nhờ đó, bài toán tối ưu hóa mạng lưới tuyến đường sẽ được giải quyết một cách khoa học.',
    ],
    level: 'Trung cấp',
    estimatedMinutes: 11,
    progress: 100,
    status: 'completed',
  },
  {
    id: 'practice-infrastructure',
    order: 6,
    title: 'Quy hoạch hạ tầng và Không gian sống',
    goal: 'Rèn luyện nhịp điệu khi mô tả các vấn đề mang tính không gian, chú ý ngắt nghỉ đúng chỗ ở các câu có nhiều cụm danh từ.',
    focus: ['Nhịp điệu', 'Ngắt nghỉ', 'Cụm danh từ'],
    shortSentences: [
      'Hệ thống hẻm nhỏ chằng chịt là đặc trưng của các đô thị lớn.',
      'Khả năng tiếp cận dịch vụ y tế tại các khu vực đông dân cư còn nhiều hạn chế.',
      'Quy hoạch không gian sống đòi hỏi tầm nhìn chiến lược dài hạn.',
    ],
    longPassages: [
      'Tại những siêu đô thị phát triển, mạng lưới hẻm nhánh chằng chịt vừa là nét văn hóa đặc trưng vừa là thách thức lớn cho công tác cứu hộ. Các phương tiện giao thông cỡ lớn thường gặp khó khăn trong việc tiếp cận sâu vào các khu dân cư đông đúc.',
      'Việc nghiên cứu và thu thập bộ dữ liệu thực tế từ hàng trăm đoạn hẻm là vô cùng cần thiết để thiết kế các hệ thống giao thông đáp ứng linh hoạt. Kích thước mẫu lấy từ thực địa phản ánh chính xác năng lực lưu thông của từng khu vực.',
      'Một giải pháp vận tải công cộng hiệu quả không thể bỏ qua nhóm người dân sống sâu trong các con hẻm hẹp. Sự linh hoạt trong việc điều phối các phương tiện cỡ nhỏ sẽ đảm bảo quyền tiếp cận dịch vụ công bằng cho mọi tầng lớp xã hội.',
    ],
    level: 'Trung cấp',
    estimatedMinutes: 11,
    progress: 0,
    status: 'not_started',
  },
  {
    id: 'practice-online-culture',
    order: 7,
    title: 'Văn hóa ứng xử trên Không gian mạng',
    goal: 'Luyện giọng điệu nghiêm túc, biểu đạt sự thấu cảm và rành mạch khi nói về các ranh giới đạo đức.',
    focus: ['Giọng nghiêm túc', 'Thấu cảm', 'Ranh giới đạo đức'],
    shortSentences: [
      'Mạng xã hội đã làm thay đổi hoàn toàn cách chúng ta giao tiếp.',
      'Nhận diện cảm xúc qua từng đoạn văn bản là một thách thức lớn.',
      'Bạo lực ngôn từ trên không gian mạng gây ra những tổn thương sâu sắc.',
    ],
    longPassages: [
      'Sự kết hợp giữa ngôn từ và biểu tượng cảm xúc trên mạng xã hội tạo ra một tầng ý nghĩa vô cùng phức tạp. Đôi khi, một biểu tượng cười lại ẩn chứa sự mỉa mai, và điều này dễ dàng dẫn đến những hiểu lầm không đáng có trong các cuộc tranh luận trực tuyến.',
      'Việc xây dựng các bộ lọc nhằm phát hiện ngôn từ thù ghét đang ngày càng được chú trọng. Bằng cách phân tích chéo các lớp ý nghĩa từ văn bản, cộng đồng có thể kịp thời ngăn chặn sự lan truyền của những năng lượng tiêu cực.',
      'Đứng trước luồng thông tin ồ ạt, mỗi cá nhân cần trang bị cho mình kỹ năng chắt lọc và thấu cảm. Đằng sau những bình luận vô thưởng vô phạt trên mạng là những con người thật với những cảm xúc vui buồn rất chân thật.',
    ],
    level: 'Trung cấp',
    estimatedMinutes: 10,
    progress: 0,
    status: 'not_started',
  },
  {
    id: 'practice-equal-opportunity',
    order: 8,
    title: 'Bình đẳng cơ hội và Rào cản giao tiếp',
    goal: 'Truyền tải năng lượng tự tin, truyền cảm hứng và bám sát triết lý cốt lõi của dự án GOODVIET.',
    focus: ['Tự tin', 'Truyền cảm hứng', 'Thông điệp rõ ràng'],
    shortSentences: [
      'Giọng nói không nên trở thành rào cản trong môi trường công sở.',
      'Lắng nghe một cách tử tế là biểu hiện của sự tôn trọng sự khác biệt.',
      'Cơ hội nghề nghiệp cần được chia đều cho tất cả những người nỗ lực.',
    ],
    longPassages: [
      'Trong một thị trường lao động cạnh tranh, những người gặp khó khăn về khả năng diễn đạt thường vô tình bị đánh giá thấp về mặt năng lực chuyên môn. Định kiến vô hình này tước đi của họ quyền được cống hiến và thể hiện giá trị bản thân một cách công bằng.',
      'Việc cải thiện kỹ năng giao tiếp không đồng nghĩa với việc chối bỏ chất giọng mang đặc trưng vùng miền. Mục tiêu cuối cùng là sự rành mạch, tự tin và khả năng truyền tải thông điệp một cách trọn vẹn nhất đến người nghe.',
      'Xây dựng một không gian làm việc bao trùm đòi hỏi sự thấu hiểu và kiên nhẫn từ tất cả các thành viên. Khi mỗi tiếng nói đều được trân trọng và lắng nghe, tập thể đó mới thực sự phát huy được tối đa sức mạnh của sự đa dạng.',
    ],
    level: 'Trung cấp',
    estimatedMinutes: 10,
    progress: 25,
    status: 'in_progress',
  },
  {
    id: 'practice-empathy',
    order: 9,
    title: 'Sự quan tâm và thấu hiểu',
    goal: 'Luyện giọng điệu ấm áp, chân thành; kiểm soát tốc độ nói chậm rãi và biết cách nhấn nhá vào những từ ngữ thể hiện tình cảm.',
    focus: ['Giọng ấm áp', 'Tốc độ chậm', 'Nhấn nhá'],
    shortSentences: [
      'Cuối tuần này mình cùng đi xem phim cho khuây khỏa nhé.',
      'Hôm nay đi học có mệt không Hân, kể mình nghe với.',
      'Nhớ chú ý giữ gìn sức khỏe, dạo này thời tiết hay thay đổi thất thường.',
    ],
    longPassages: [
      'Hân à, dạo này mình thấy lịch học và làm việc của bạn hơi dày đặc. Đừng cố quá sức nhé, thỉnh thoảng phải dành cho bản thân một buổi tối nghỉ ngơi, đi ăn món gì đó ngon ngon để nạp lại năng lượng.',
      'Hôm nay mình tình cờ đọc được một bài viết rất hay về sự thấu cảm. Mình chợt nhận ra rằng, đôi khi người ta không cần những lời khuyên to tát, mà chỉ cần một người kiên nhẫn ngồi nghe mình kể những chuyện vụn vặt mỗi ngày.',
      'Chuyện hôm qua mình nóng tính quá nên lỡ lời làm bạn buồn. Mình đã suy nghĩ lại và thấy bản thân thật sự thiếu tinh tế. Lần sau có gì chưa hiểu nhau, chúng mình cứ bình tĩnh ngồi lại nói chuyện cho rõ ràng nhé.',
    ],
    level: 'Cơ bản',
    estimatedMinutes: 9,
    progress: 0,
    status: 'not_started',
  },
  {
    id: 'practice-city-life',
    order: 10,
    title: 'Nhịp sống đô thị',
    goal: 'Luyện sự lưu loát, năng lượng tươi vui, năng động; phát âm rõ chữ trong các tình huống thảo luận nhóm hoặc trò chuyện nhịp độ nhanh.',
    focus: ['Sự lưu loát', 'Năng lượng', 'Nhịp độ nhanh'],
    shortSentences: [
      'Lát nữa tan học, nhóm mình ghé quán ở góc phố bàn bài tập nha.',
      'Mọi người đã chuẩn bị xong nội dung cho buổi thuyết trình ngày mai chưa?',
      'Đi xe buýt tuyến này vào giờ tan tầm thường hay bị kẹt xe lắm.',
    ],
    longPassages: [
      'Theo tớ thấy, phần thu thập dữ liệu này nhóm mình đang làm hơi lan man. Mọi người thử tập trung vào một tệp cụ thể thôi để dễ phân tích. Xong bước này thì cuối tuần tớ sẽ lo phần tổng hợp báo cáo cho.',
      'Chủ nhật tuần này thời tiết đẹp lắm, nghe bảo trời mát và không mưa. Nhóm mình lên lịch đi dã ngoại ngoại ô một chuyến đi, dạo này ai cũng bận rộn, lâu lắm rồi không có dịp tụ tập đông đủ thế này.',
      'Sáng nay tớ suýt thì lỡ chuyến xe buýt đầu tiên vì quên mang theo ví. Công nhận từ lúc chuyển sang dùng ứng dụng vé điện tử trên điện thoại, việc đi lại tiện hơn hẳn, cứ lên xe quét mã là xong, không phải loay hoay tìm tiền lẻ như ngày xưa nữa.',
    ],
    level: 'Cơ bản',
    estimatedMinutes: 9,
    progress: 0,
    status: 'not_started',
  },
];

export const practiceSummary = {
  currentStreak: 14,
  longestStreak: 21,
  completedLessons: practiceLessons.filter((lesson) => lesson.status === 'completed').length,
  totalLessons: practiceLessons.length,
  weeklyGoal: 4,
  weeklyCompleted: 3,
};

export const getPracticeLessonById = (lessonId: string) =>
  practiceLessons.find((lesson) => lesson.id === lessonId);
