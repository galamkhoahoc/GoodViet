import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { PracticePathway } from '../models/PracticePathway';
import { Expert } from '../models/Expert';

// Load env vars
dotenv.config();

const MONGODB_URI = (() => {
  const value = process.env.MONGODB_URI;
  if (!value) {
    throw new Error('MONGODB_URI is required to run the database seed script');
  }
  return value;
})();

const pathways = [
  {
    name: 'Khắc phục lỗi L/N cơ bản',
    description: 'Lộ trình 7 ngày tập trung vào việc phân biệt và phát âm chuẩn hai phụ âm L và N.',
    durationDays: 7,
    targetPhonemes: ['L/N'],
    weeks: [
      {
        weekNumber: 1,
        videoTitle: 'Tuần 1: Giới thiệu khẩu hình L/N',
        videoDescription: 'Học cách đặt lưỡi chính xác cho âm L và âm N.',
        days: [
          {
            day: 1,
            isRestDay: false,
            completed: false,
            exercises: [
              {
                exerciseId: 'w1d1-1',
                type: 'tongue_placement',
                title: 'Khẩu hình âm L',
                instructions: 'Đặt đầu lưỡi chạm vào ngạc cứng sau răng cửa trên.',
                practiceText: 'La la la la la',
                repetitions: 10,
                estimatedDuration: 2,
                difficulty: 'easy'
              },
              {
                exerciseId: 'w1d1-2',
                type: 'pronunciation',
                title: 'Đọc từ đơn âm L',
                instructions: 'Đọc rõ ràng từng từ, chú ý vị trí lưỡi.',
                practiceText: 'Làm, Lên, Lấy, Lại, Lớn',
                repetitions: 5,
                estimatedDuration: 3,
                difficulty: 'medium'
              }
            ]
          },
          // Rest of the days are generated dynamically for the seed to be brief but complete
          ...Array.from({ length: 6 }, (_, i) => ({
            day: i + 2,
            isRestDay: i === 5, // Day 7 is rest
            completed: false,
            exercises: i === 5 ? [] : [
              {
                exerciseId: `w1d${i+2}-1`,
                type: 'pronunciation',
                title: `Bài tập L/N ngày ${i+2}`,
                instructions: 'Luyện tập phân biệt L/N',
                practiceText: 'Lúa nếp là lúa nếp làng, lúa lên lớp lớp lòng nàng lâng lâng',
                repetitions: 3,
                estimatedDuration: 5,
                difficulty: 'hard'
              }
            ]
          }))
        ]
      }
    ]
  },
  {
    name: 'Làm chủ âm TR/CH',
    description: 'Phân biệt âm uốn lưỡi TR và âm mặt lưỡi CH, sửa lỗi phát âm phổ biến.',
    durationDays: 14,
    targetPhonemes: ['TR/CH'],
    weeks: [
      {
        weekNumber: 1,
        videoTitle: 'Tuần 1: Khẩu hình TR',
        videoDescription: 'Cách uốn lưỡi đúng khi phát âm TR.',
        days: Array.from({ length: 7 }, (_, i) => ({
          day: i + 1,
          isRestDay: i === 6,
          completed: false,
          exercises: i === 6 ? [] : [
            {
              exerciseId: `tr-w1d${i+1}-1`,
              type: 'pronunciation',
              title: 'Bài tập TR/CH',
              instructions: 'Uốn cong đầu lưỡi khi đọc TR',
              practiceText: 'Trời trong trắng, trăng tròn trĩnh',
              repetitions: 5,
              estimatedDuration: 4,
              difficulty: 'medium'
            }
          ]
        }))
      },
      {
        weekNumber: 2,
        videoTitle: 'Tuần 2: Phân biệt TR/CH',
        videoDescription: 'Luyện tập các câu chứa cả TR và CH.',
        days: Array.from({ length: 7 }, (_, i) => ({
          day: i + 8,
          isRestDay: i === 6,
          completed: false,
          exercises: i === 6 ? [] : [
            {
              exerciseId: `tr-w2d${i+1}-1`,
              type: 'pronunciation',
              title: 'Bài tập nâng cao TR/CH',
              instructions: 'Đọc rõ ràng, không nuốt âm',
              practiceText: 'Cây tre trăm đốt, chú thợ mộc cưa xoèn xoẹt',
              repetitions: 5,
              estimatedDuration: 5,
              difficulty: 'hard'
            }
          ]
        }))
      }
    ]
  },
  {
    name: 'Sửa lỗi S/X',
    description: 'Cách phát âm đúng âm xát S và X, tự tin trong giao tiếp.',
    durationDays: 7,
    targetPhonemes: ['S/X'],
    weeks: [
      {
        weekNumber: 1,
        videoTitle: 'Tuần 1: S/X cơ bản',
        videoDescription: 'Sự khác biệt về luồng hơi giữa S và X.',
        days: Array.from({ length: 7 }, (_, i) => ({
          day: i + 1,
          isRestDay: i === 6,
          completed: false,
          exercises: i === 6 ? [] : [
            {
              exerciseId: `sx-w1d${i+1}-1`,
              type: 'pronunciation',
              title: 'Bài tập S/X',
              instructions: 'Âm S uốn lưỡi, âm X thẳng lưỡi',
              practiceText: 'Sáng sớm sương xuống, xóm nhỏ xôn xao',
              repetitions: 5,
              estimatedDuration: 4,
              difficulty: 'medium'
            }
          ]
        }))
      }
    ]
  }
];

const experts = [
  {
    fullName: 'TS. Nguyễn Văn A',
    email: 'nguyen.vana@goodviet.vn',
    phoneNumber: '0901234567',
    licenseNumber: 'SLP-2023-001',
    specializations: ['Phát âm', 'L/N', 'Âm điệu'],
    bio: 'Tiến sĩ Ngôn ngữ học với 15 năm kinh nghiệm trong việc sửa lỗi phát âm vùng miền. Đã giúp hơn 2000 học viên lấy lại sự tự tin trong giao tiếp.',
    profileImageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    averageRating: 4.9,
    totalRatings: 124,
    isActive: true
  },
  {
    fullName: 'ThS. Trần Thị B',
    email: 'tran.thib@goodviet.vn',
    phoneNumber: '0907654321',
    licenseNumber: 'SLP-2023-042',
    specializations: ['Nói lắp', 'Trôi chảy', 'S/X'],
    bio: 'Thạc sĩ Âm ngữ trị liệu tốt nghiệp tại Úc. Chuyên gia về các rối loạn trôi chảy và nói lắp ở người trưởng thành.',
    profileImageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704e',
    averageRating: 4.7,
    totalRatings: 86,
    isActive: true
  },
  {
    fullName: 'Chuyên gia Lê Văn C',
    email: 'le.vanc@goodviet.vn',
    phoneNumber: '0981122334',
    licenseNumber: 'SLP-2021-112',
    specializations: ['TR/CH', 'Thuyết trình', 'Giọng nói tự tin'],
    bio: 'Chuyên gia huấn luyện giọng nói cho MC, biên tập viên truyền hình. Chuyên sửa lỗi phát âm TR/CH và rèn luyện hơi thở sâu.',
    profileImageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704f',
    averageRating: 4.8,
    totalRatings: 210,
    isActive: true
  },
  {
    fullName: 'ThS. Phạm Thị D',
    email: 'pham.thid@goodviet.vn',
    phoneNumber: '0975544332',
    licenseNumber: 'SLP-2022-088',
    specializations: ['Trẻ em', 'Phát âm cơ bản', 'L/N'],
    bio: 'Chuyên gia âm ngữ trị liệu chuyên làm việc với trẻ em và người mới bắt đầu. Phương pháp tiếp cận nhẹ nhàng, vui vẻ và hiệu quả.',
    profileImageUrl: 'https://i.pravatar.cc/150?u=a042581f4e290267050',
    averageRating: 5.0,
    totalRatings: 54,
    isActive: true
  },
  {
    fullName: 'TS. Hoàng Văn E',
    email: 'hoang.vane@goodviet.vn',
    phoneNumber: '0969988776',
    licenseNumber: 'SLP-2019-021',
    specializations: ['Phục hồi chức năng', 'Liệt dây thanh', 'Hơi thở'],
    bio: 'Bác sĩ chuyên khoa Tai Mũi Họng, đồng thời là chuyên gia âm ngữ trị liệu. Chuyên điều trị các vấn đề thực thể ảnh hưởng đến giọng nói.',
    profileImageUrl: 'https://i.pravatar.cc/150?u=a042581f4e290267051',
    averageRating: 4.6,
    totalRatings: 312,
    isActive: true
  }
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully.');

    // Seed Practice Pathways
    console.log('Seeding practice pathways...');
    await PracticePathway.deleteMany({}); // Clear existing
    const insertedPathways = await PracticePathway.insertMany(pathways);
    console.log(`Inserted ${insertedPathways.length} practice pathways.`);

    // Seed Experts
    console.log('Seeding experts...');
    await Expert.deleteMany({}); // Clear existing
    const insertedExperts = await Expert.insertMany(experts);
    console.log(`Inserted ${insertedExperts.length} experts.`);

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

// Run the seed function
seedDatabase();
