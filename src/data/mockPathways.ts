export interface Exercise {
  exerciseId: string;
  type: 'pronunciation' | 'breathing' | 'tongue_placement' | 'fluency';
  title: string;
  instructions: string;
  practiceText: string;
  targetPhonemes: string[];
  repetitions: number;
  estimatedDuration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  recordingRequired: boolean;
}

export interface DayPlan {
  day: number;
  isRestDay: boolean;
  exercises: Exercise[];
  completed: boolean;
}

export interface WeekPlan {
  weekNumber: number;
  videoTitle: string;
  videoDescription: string;
  days: DayPlan[];
}

export interface Pathway {
  pathwayId: string;
  name: string;
  description: string;
  severityLevel: 'mild' | 'moderate' | 'severe';
  durationDays: number;
  targetIssues: string[];
  weeklyPlans: WeekPlan[];
}

const createExercise = (
  id: string, type: Exercise['type'], title: string,
  instructions: string, practiceText: string, phonemes: string[],
  reps: number, dur: number, diff: Exercise['difficulty']
): Exercise => ({
  exerciseId: id, type, title, instructions, practiceText,
  targetPhonemes: phonemes, repetitions: reps, estimatedDuration: dur,
  difficulty: diff, recordingRequired: true,
});

export const mockPathways: Pathway[] = [
  {
    pathwayId: 'pathway-001',
    name: 'GoodSound - Cải thiện phát âm L/N',
    description: 'Lộ trình tập trung vào việc phân biệt và phát âm chính xác phụ âm L và N, kết hợp luyện S/X và TR/CH.',
    severityLevel: 'moderate',
    durationDays: 35,
    targetIssues: ['l/n', 'tr/ch', 's/x'],
    weeklyPlans: [
      {
        weekNumber: 1,
        videoTitle: 'Kỹ thuật đặt lưỡi cho âm L và N',
        videoDescription: 'Hướng dẫn chi tiết cách đặt lưỡi, lấy hơi để phát âm đúng phụ âm L và N.',
        days: [
          {
            day: 1, isRestDay: false, completed: true,
            exercises: [
              createExercise('ex-w1d1-1', 'tongue_placement', 'Luyện vị trí lưỡi cho âm L', 'Đặt đầu lưỡi chạm nướu trên, cho luồng hơi đi hai bên lưỡi. Lặp lại 10 lần.', 'La - Le - Li - Lo - Lu - Lư', ['l'], 10, 3, 'easy'),
              createExercise('ex-w1d1-2', 'pronunciation', 'Luyện từ có âm L', 'Đọc chậm, rõ ràng từng từ. Chú ý vị trí lưỡi khi phát âm L.', 'Lan lanh lẹ leo lên lầu lấy lọ lạc.', ['l'], 5, 3, 'easy'),
            ],
          },
          {
            day: 2, isRestDay: false, completed: true,
            exercises: [
              createExercise('ex-w1d2-1', 'tongue_placement', 'Luyện vị trí lưỡi cho âm N', 'Đặt đầu lưỡi chạm nướu trên, cho luồng hơi đi qua mũi. Lặp lại 10 lần.', 'Na - Ne - Ni - No - Nu - Nư', ['n'], 10, 3, 'easy'),
              createExercise('ex-w1d2-2', 'pronunciation', 'Luyện từ có âm N', 'Đọc chậm, rõ ràng. Cảm nhận luồng hơi qua mũi khi phát âm N.', 'Nam nấu nước nóng ngoài nhà ngang.', ['n'], 5, 3, 'easy'),
            ],
          },
          {
            day: 3, isRestDay: false, completed: true,
            exercises: [
              createExercise('ex-w1d3-1', 'pronunciation', 'Phân biệt L và N', 'Đọc xen kẽ từ có L và N, chú ý sự khác biệt.', 'La - Na / Lan - Nan / Lạ - Nạ / Lung - Nung', ['l', 'n'], 8, 4, 'medium'),
              createExercise('ex-w1d3-2', 'fluency', 'Đọc đoạn văn ngắn', 'Đọc tự nhiên, giữ nhịp đều.', 'Lan và Nam là bạn thân. Lan hay nấu ăn, Nam thì lo việc nhà. Mỗi ngày họ cùng nhau luyện tập.', ['l', 'n'], 3, 4, 'medium'),
            ],
          },
          { day: 4, isRestDay: true, completed: true, exercises: [] },
          {
            day: 5, isRestDay: false, completed: true,
            exercises: [
              createExercise('ex-w1d5-1', 'breathing', 'Luyện hơi thở cơ hoành', 'Hít sâu bằng bụng 4 giây, giữ 4 giây, thở ra 6 giây. Lặp lại 5 lần.', 'Hít vào... giữ... thở ra...', [], 5, 3, 'easy'),
              createExercise('ex-w1d5-2', 'pronunciation', 'Câu phức hợp L/N', 'Đọc chậm rồi tăng dần tốc độ.', 'Lúa nếp lên lộc non ngoài nương lúa, nắng nóng nên nông dân nghỉ ngơi.', ['l', 'n'], 5, 4, 'medium'),
            ],
          },
          {
            day: 6, isRestDay: false, completed: false,
            exercises: [
              createExercise('ex-w1d6-1', 'pronunciation', 'Luyện tổng hợp tuần 1', 'Đọc tất cả các từ và câu đã luyện trong tuần.', 'Lan lanh lẹ leo lên. Nam nấu nước nóng. Lúa nếp lên lộc non ngoài nương.', ['l', 'n'], 5, 5, 'medium'),
            ],
          },
          { day: 7, isRestDay: true, completed: false, exercises: [] },
        ],
      },
      {
        weekNumber: 2,
        videoTitle: 'Phân biệt TR và CH trong tiếng Việt',
        videoDescription: 'Hướng dẫn cách cuốn lưỡi cho âm TR và phát âm CH chính xác.',
        days: [
          {
            day: 8, isRestDay: false, completed: false,
            exercises: [
              createExercise('ex-w2d1-1', 'tongue_placement', 'Vị trí lưỡi cho âm TR', 'Cuốn đầu lưỡi lên, chạm vào nướu trên sau răng cửa. Lặp lại.', 'Tra - Tre - Tri - Tro - Tru - Trư', ['tr'], 10, 3, 'medium'),
              createExercise('ex-w2d1-2', 'pronunciation', 'Từ có âm TR', 'Đọc rõ, nhấn mạnh âm TR đầu từ.', 'Trời trong trẻo, tre trúc trên triền dốc tràn trề sức sống.', ['tr'], 5, 4, 'medium'),
            ],
          },
          {
            day: 9, isRestDay: false, completed: false,
            exercises: [
              createExercise('ex-w2d2-1', 'pronunciation', 'Từ có âm CH', 'Phát âm CH nhẹ, không cuốn lưỡi.', 'Chú chó chạy chơi ở chân cầu thang.', ['ch'], 5, 3, 'easy'),
              createExercise('ex-w2d2-2', 'pronunciation', 'Phân biệt TR và CH', 'Đọc xen kẽ, chú ý khác biệt.', 'Trẻ - Chẻ / Trời - Chời / Trâu - Châu / Trong - Chong', ['tr', 'ch'], 8, 4, 'hard'),
            ],
          },
          {
            day: 10, isRestDay: false, completed: false,
            exercises: [
              createExercise('ex-w2d3-1', 'fluency', 'Đoạn văn tổng hợp L/N + TR/CH', 'Đọc tự nhiên, chú ý tất cả các âm đã luyện.', 'Trời nắng, Lan cùng Nam trèo lên triền núi. Chú chó nhỏ chạy theo, nhảy lung tung trên lối nhỏ.', ['l', 'n', 'tr', 'ch'], 3, 5, 'hard'),
            ],
          },
          { day: 11, isRestDay: true, completed: false, exercises: [] },
          {
            day: 12, isRestDay: false, completed: false,
            exercises: [
              createExercise('ex-w2d5-1', 'breathing', 'Luyện hơi thở với câu dài', 'Hít sâu rồi đọc hết câu trong một hơi.', 'Trong trường chúng tôi có nhiều trò chơi thú vị, trẻ em vui chơi náo nhiệt.', ['tr', 'ch'], 5, 4, 'hard'),
            ],
          },
          {
            day: 13, isRestDay: false, completed: false,
            exercises: [
              createExercise('ex-w2d6-1', 'pronunciation', 'Tổng hợp tuần 2', 'Ôn tập lại tất cả.', 'Trời trong trẻo, Lan lanh lẹ chạy trên triền núi. Nam nấu nước, chú chó nằm ngoài nhà.', ['l', 'n', 'tr', 'ch'], 5, 5, 'hard'),
            ],
          },
          { day: 14, isRestDay: true, completed: false, exercises: [] },
        ],
      },
      {
        weekNumber: 3,
        videoTitle: 'Phân biệt S và X - Kỹ thuật phát âm',
        videoDescription: 'Cách phát âm chính xác S và X, luyện với các từ và câu thường dùng.',
        days: Array.from({ length: 7 }, (_, i) => ({
          day: 15 + i,
          isRestDay: i === 3 || i === 6,
          completed: false,
          exercises: (i === 3 || i === 6) ? [] : [
            createExercise(`ex-w3d${i + 1}-1`, 'pronunciation', `Luyện S/X ngày ${i + 1}`, 'Đọc chậm, chú ý vị trí lưỡi.', 'Sáng sớm sương sa, xuân xanh xao xuyến.', ['s', 'x'], 5, 4, 'medium'),
          ],
        })),
      },
      {
        weekNumber: 4,
        videoTitle: 'Nói trôi chảy và tự tin trong giao tiếp',
        videoDescription: 'Kỹ thuật kiểm soát tốc độ nói, ngắt nghỉ đúng chỗ và giữ tự tin khi trình bày.',
        days: Array.from({ length: 7 }, (_, i) => ({
          day: 22 + i,
          isRestDay: i === 3 || i === 6,
          completed: false,
          exercises: (i === 3 || i === 6) ? [] : [
            createExercise(`ex-w4d${i + 1}-1`, 'fluency', `Luyện trình bày ngày ${i + 1}`, 'Nói tự nhiên, kiểm soát tốc độ.', 'Xin chào mọi người, hôm nay tôi muốn trình bày về dự án của nhóm chúng tôi. Dự án có tên là GOODVIET.', ['l', 'n', 'tr', 'ch', 's', 'x'], 3, 5, 'hard'),
          ],
        })),
      },
      {
        weekNumber: 5,
        videoTitle: 'Ôn tập tổng hợp và đánh giá cuối lộ trình',
        videoDescription: 'Tổng kết các kỹ thuật đã học, đánh giá sự tiến bộ.',
        days: Array.from({ length: 7 }, (_, i) => ({
          day: 29 + i,
          isRestDay: i === 3 || i === 6,
          completed: false,
          exercises: (i === 3 || i === 6) ? [] : [
            createExercise(`ex-w5d${i + 1}-1`, 'pronunciation', `Ôn tập ngày ${i + 1}`, 'Đọc tổng hợp tất cả các âm.', 'Lan và Nam trèo lên triền núi sáng sớm. Trời trong xanh, chim sẻ ríu rít trong rừng tre.', ['l', 'n', 'tr', 'ch', 's', 'x', 'r'], 5, 5, 'hard'),
          ],
        })),
      },
    ],
  },
];

export const getPathwayById = (id: string): Pathway | undefined =>
  mockPathways.find(p => p.pathwayId === id);
