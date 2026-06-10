export const PREDEFINED_SENTENCES: Record<string, string> = {
  // Phase 1
  "p1-1": "Lúa nếp là lúa nếp làng",
  "p1-2": "Lúa lên lớp lớp lòng nàng lâng lâng",
  "p1-3": "Trời trong xanh, trăng tròn trĩnh",
  "p1-4": "Sáng sớm sương xuống, xóm nhỏ xôn xao",
  "p1-5": "Năm nay lũ lớn ngập lụt xóm làng",
  "p1-6": "Con lươn nó luồn qua lườn em",
  "p1-7": "Chị nhặt rau rồi luộc, em ăn cơm xong rửa bát",
  "p1-8": "Con cá rô rục rịch trong rổ réo róc rách",
  "p1-9": "Trâu trắng ăn cỏ trốn trong chuồng trại",
  "p1-10": "Chú chó chê chim chích chòe chảnh chọe",
  "p1-11": "Mùa xuân sang sáo sậu sổ lồng sải cánh bay xa",
  "p1-12": "Xuân sang xem chim sẻ xào xạc trong lùm xộp",

  // Phase 2
  "p2-1": "Lúa nếp là lúa nếp làng",
  "p2-2": "Trời trong xanh, trăng tròn trĩnh",
  "p2-3": "Bà ba béo bán bánh bèo bên bờ biển"
};

export function getExpectedText(sentenceId: string): string {
  return PREDEFINED_SENTENCES[sentenceId] || "Lúa nếp là lúa nếp làng";
}
