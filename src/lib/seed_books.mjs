import pg from "pg";

const { Pool } = pg;
const pool = new Pool({
  connectionString: "postgresql://postgres:password@localhost:5432/drama_tracker",
});

const RAW = [
  // 12 Chom Sao
  { title: "[12 chòm sao] 12 chòm sao và tình yêu tuổi mới lớn", category: "ZODIAC", status: "COMPLETED" },
  { title: "[12 chòm sao] Hãy nói anh yêu em", category: "ZODIAC", status: "COMPLETED" },
  { title: "[12 chòm sao] Học viện 12 chòm sao", category: "ZODIAC", status: "COMPLETED" },
  { title: "[12 chòm sao] Học viện danh giá", category: "ZODIAC", status: "COMPLETED" },
  { title: "[12 chòm sao] Làm người yêu mình nhé", category: "ZODIAC", status: "COMPLETED" },
  { title: "[12 chòm sao] Lớp học 12 chòm sao", category: "ZODIAC", status: "COMPLETED" },
  { title: "[12 chòm sao] Mưa ngâu màu nắng", category: "ZODIAC", status: "COMPLETED" },
  { title: "[12 chòm sao] Nắng hạ sau mưa", category: "ZODIAC", status: "COMPLETED" },
  { title: "[12 chòm sao] Oan gia", category: "ZODIAC", status: "COMPLETED" },
  { title: "[12 chòm sao] Tình yêu tuổi học trò", category: "ZODIAC", status: "COMPLETED" },
  { title: "[12 chòm sao] Đời học sinh của 12 chòm sao", category: "ZODIAC", status: "COMPLETED" },

  // HaHyuk
  { title: "[HaHyuk] Cát bụi", category: "HAHYUK", status: "COMPLETED" },
  { title: "[HaHyuk] Cậu là của anh", category: "HAHYUK", status: "COMPLETED" },
  { title: "[HaHyuk] Cầu vồng sau mưa", category: "HAHYUK", status: "COMPLETED" },
  { title: "[HaHyuk] Em sẽ mãi bên anh", category: "HAHYUK", status: "COMPLETED" },
  { title: "[HaHyuk] I'M HALF A HEART WITHOUT YOU", category: "HAHYUK", status: "COMPLETED" },
  { title: "[HaHyuk] Nếu như đây là đêm cuối…", category: "HAHYUK", status: "COMPLETED" },
  { title: "[HaHyuk] Nơi ấm áp", category: "HAHYUK", status: "COMPLETED" },
  { title: "[HaHyuk] Tôi sẽ mãi mãi là cái ô của cậu", category: "HAHYUK", status: "COMPLETED" },
  { title: "[HaHyuk] Trở về", category: "HAHYUK", status: "COMPLETED" },
  { title: "[HaHyuk] Viên Chocolate ngọt ngào", category: "HAHYUK", status: "COMPLETED" },
  { title: "[HaHyuk] You are the angel", category: "HAHYUK", status: "COMPLETED" },
  { title: "[HaHyuk] Định mệnh", category: "HAHYUK", status: "COMPLETED" },
  { title: "[HaHyuk] Đời ta nợ nhau", category: "HAHYUK", status: "COMPLETED" },

  // HaKook
  { title: "[HaKook] 10 ngày cuối để yêu em", category: "HAKOOK", status: "COMPLETED" },

  // Kooksoo
  { title: "[Kooksoo] Believe", category: "KOOKSOO", status: "COMPLETED" },
  { title: "[Kooksoo] Câu chuyện bánh kem", category: "KOOKSOO", status: "COMPLETED" },
  { title: "[Kooksoo] Chờ đợi", category: "KOOKSOO", status: "COMPLETED" },
  { title: "[Kooksoo] Hyung, em sẽ đợi anh", category: "KOOKSOO", status: "COMPLETED" },
  { title: "[Kooksoo] Làm mẹ con anh nhé", category: "KOOKSOO", status: "COMPLETED" },
  { title: "[Kooksoo] Lá thư", category: "KOOKSOO", status: "COMPLETED" },

  // Kwangmong
  { title: "[Kwangmong] Chờ đợi", category: "KWANGMONG", status: "COMPLETED" },
  { title: "[Kwangmong] Song Ji hyo, hãy là của anh", category: "KWANGMONG", status: "COMPLETED" },

  // Monday Couple
  { title: "[Monday Couple] Ái tình chôn dấu", category: "MONDAY_COUPLE", status: "COMPLETED" },
  { title: "[Monday Couple] Cậu ấy là của tôi!!!", category: "MONDAY_COUPLE", status: "COMPLETED" },
  { title: "[Monday Couple] Hạnh phúc tiền duyên", category: "MONDAY_COUPLE", status: "COMPLETED" },
  { title: "[Monday Couple] Hôn nhân không tình yêu", category: "MONDAY_COUPLE", status: "COMPLETED" },
  { title: "[Monday Couple] KANG HEE BI", category: "MONDAY_COUPLE", status: "COMPLETED" },
  { title: "[Monday Couple] Lạc lối", category: "MONDAY_COUPLE", status: "COMPLETED" },
  { title: "[Monday Couple] LIỆU MÌNH CÓ YÊU?", category: "MONDAY_COUPLE", status: "COMPLETED" },
  { title: "[Monday Couple] LOVE", category: "MONDAY_COUPLE", status: "COMPLETED" },
  { title: "[Monday Couple] Monday couple…or should we say everyday?", category: "MONDAY_COUPLE", status: "COMPLETED" },
  { title: "[Monday Couple] Ngây ngô", category: "MONDAY_COUPLE", status: "COMPLETED" },
  { title: "[Monday Couple] Tính chất hai đường thẳng", category: "MONDAY_COUPLE", status: "COMPLETED" },
  { title: "[Monday Couple] Vì anh nên em ghen", category: "MONDAY_COUPLE", status: "COMPLETED" },

  // Ngon
  { title: "[Ngôn] Bà xã nghịch ngợm, em là của anh", category: "NGON", status: "COMPLETED" },
  { title: "[Ngôn] Bạn cùng bàn", category: "NGON", status: "COMPLETED" },
  { title: "[Ngôn] Bạn gái tôi là du côn", category: "NGON", status: "ON_HOLD" },
  { title: "[Ngôn] Bộ tam siêu quậy", category: "NGON", status: "COMPLETED" },
  { title: "[Ngôn] Bộ Tứ Siêu Quậy trường 2S", category: "NGON", status: "COMPLETED" },
  { title: "[Ngôn] Cậu béo. Tớ gầy. Thích nhau làm sao", category: "NGON", status: "COMPLETED" },
  { title: "[Ngôn] CEO's sudden proposal", category: "NGON", status: "COMPLETED" },
  { title: "[Ngôn] Chém gió với tớ ư?? Cậu còn kém lắm!", category: "NGON", status: "COMPLETED" },
  { title: "[Ngôn] Chị ơi! Ngày mai đợi anh đi học", category: "NGON", status: "COMPLETED" },
  { title: "[Ngôn] Chuyện của PhAn", category: "NGON", status: "COMPLETED" },
  { title: "[Ngôn] Con nhỏ lạnh lùng kia, anh yêu em!", category: "NGON", status: "COMPLETED" },
  { title: "[Ngôn] Con điên!! Người tao thích là mày!", category: "NGON", status: "COMPLETED" },
  { title: "[Ngôn] Có thể yêu em như cô ấy không?", category: "NGON", status: "COMPLETED" },
  { title: "[Ngôn] Gõ cửa trái tim", category: "NGON", status: "COMPLETED" },
  { title: "[Ngôn] Hành lang hai lớp", category: "NGON", status: "COMPLETED" },
  { title: "[Ngôn] Hey! Quay lại đây cãi nhau với anh", category: "NGON", status: "COMPLETED" },
  { title: "[Ngôn] Hoàng tử mèo", category: "NGON", status: "COMPLETED" },
  { title: "[Ngôn] Hoàng đế ghen tuông", category: "NGON", status: "COMPLETED" },
  { title: "[Ngôn] Hôn nhé", category: "NGON", status: "COMPLETED" },
  { title: "[Ngôn] Honey, Don't Run Away", category: "NGON", status: "COMPLETED" },
  { title: "[Ngôn] Hủ nữ Ga Ga", category: "NGON", status: "COMPLETED" },
  { title: "[Ngôn] Hướng tới ánh mặt trời", category: "NGON", status: "COMPLETED" },
  { title: "[Ngôn] Kết hôn không dễ", category: "NGON", status: "COMPLETED" },
  { title: "[Ngôn] Khỉ con, tao yêu mày", category: "NGON", status: "COMPLETED" },
  { title: "[Ngôn] Khi yêu, hãy yêu thật chậm", category: "NGON", status: "COMPLETED" },
  { title: "[Ngôn] Lớp học tưng tửng", category: "NGON", status: "COMPLETED" },
  { title: "[Ngôn] ME, TOO!", category: "NGON", status: "COMPLETED" },
  { title: "[Ngôn] My Sweetest You", category: "NGON", status: "READING" },
  { title: "[Ngôn] My Unreliable Prince", category: "NGON", status: "COMPLETED" },
  { title: "[Ngôn] Nhầm địa chỉ", category: "NGON", status: "COMPLETED" },
  { title: "[Ngôn] Nhóc, anh thua rồi", category: "NGON", status: "COMPLETED" },
  { title: "[Ngôn] Nhóc con! Gọi tôi là anh!", category: "NGON", status: "COMPLETED" },
  { title: "[Ngôn] Những chi tiết hư cấu & cẩu huyết chỉ có trong ngôn tình & teenfic", category: "NGON", status: "COMPLETED" },
  { title: "[Ngôn] Nữ thần giáng thế", category: "NGON", status: "READING" },
  { title: "[Ngôn] Oan gia tuyệt...thực", category: "NGON", status: "COMPLETED" },
  { title: "[Ngôn] Oan gia ngõ hẹp", category: "NGON", status: "COMPLETED" },
  { title: "[Ngôn] Phòng tập gym bí ẩn", category: "NGON", status: "READING" },
  { title: "[Ngôn] Quản lý của siêu anh hùng", category: "NGON", status: "READING" },
  { title: "[Ngôn] She's a rebellious boy", category: "NGON", status: "COMPLETED" },
  { title: "[Ngôn] Tao thích mày, rất thích!", category: "NGON", status: "COMPLETED" },
  { title: "[Ngôn] Tên hotboy đáng ghét", category: "NGON", status: "COMPLETED" },
  { title: "[Ngôn] Thích ông rồi, làm sao đây?!!", category: "NGON", status: "COMPLETED" },
  { title: "[Ngôn] Thứ 6 ngày 13", category: "NGON", status: "COMPLETED" },
  { title: "[Ngôn] Thuần tình Lục thiếu (The naive Mr.Lu)", category: "NGON", status: "COMPLETED" },
  { title: "[Ngôn] Tiểu nha đầu, em không thể chạy trốn định mệnh", category: "NGON", status: "COMPLETED" },
  { title: "[Ngôn] Vợ ngốc à! Em trốn được tôi sao?", category: "NGON", status: "COMPLETED" },
  { title: "[Ngôn] Yêu nhầm nữ bang chủ siêu quậy", category: "NGON", status: "COMPLETED" },
  { title: "[Ngôn] Đánh cược trái tim", category: "NGON", status: "COMPLETED" },
  { title: "[Ngôn] Đợi mùa đông", category: "NGON", status: "COMPLETED" },
  { title: "[Ngôn] Đồ lém lỉnh… bắt được em rồi", category: "NGON", status: "COMPLETED" },
  { title: "[Ngôn] Đồ ngốc!! Anh vẫn ở đây chờ em", category: "NGON", status: "COMPLETED" },
  { title: "[Ngôn] Đồ ngốc! Đây mới là hôn!", category: "NGON", status: "COMPLETED" },

  // RM
  { title: "[RM] 7 người mãi mãi bên nhau", category: "RM", status: "COMPLETED" },
  { title: "[RM] Friends", category: "RM", status: "COMPLETED" },
  { title: "[RM] Gia đình có 7 người con", category: "RM", status: "COMPLETED" },
  { title: "[RM] Lớp học 7-012", category: "RM", status: "COMPLETED" },
  { title: "[RM] Lớp học đào tạo bựa nhân", category: "RM", status: "COMPLETED" },
  { title: "[RM] Sinh mệnh", category: "RM", status: "COMPLETED" },

  // Spartace
  { title: "[Spartace] Beautiful Secret", category: "SPARTACE", status: "COMPLETED" },

  // TayNew
  { title: "[TayNew] Dù chỉ là âm thầm", category: "TAYNEW", status: "COMPLETED" },
  { title: "[TayNew] Friends won't love like you", category: "TAYNEW", status: "COMPLETED" },
  { title: "[TayNew] Love at first hate", category: "TAYNEW", status: "COMPLETED" },
  { title: "[TayNew] Maybe, I love him", category: "TAYNEW", status: "COMPLETED" },
  { title: "[TayNew] Một triệu khả năng", category: "TAYNEW", status: "COMPLETED" },
  { title: "[TayNew] Unexpected Love", category: "TAYNEW", status: "ON_HOLD" },
  { title: "[TayNew] When hate become love", category: "TAYNEW", status: "COMPLETED" },
  { title: "[TayNew] Tale of Kao's jealousy", category: "TAYNEW", status: "COMPLETED" },
  { title: "[TayNew] Reckless", category: "TAYNEW", status: "COMPLETED" },
  { title: "[TayNew] More than friends?", category: "TAYNEW", status: "COMPLETED" },

  // TwoYoo
  { title: "[TwoYoo] Jae Suk, anh lạnh!", category: "TWOYOO", status: "COMPLETED" },
  { title: "[TwoYoo] Tìm lại nhau", category: "TWOYOO", status: "COMPLETED" },

  // Dam My (BL)
  { title: "[Đam] 19 days", category: "DAM", status: "READING" },
  { title: "[Đam] Adolescent Big Worries", category: "DAM", status: "READING" },
  { title: "[Đam] Behind The Scenes", category: "DAM", status: "COMPLETED" },
  { title: "[Đam] Bị anh chàng lập dị tấn công", category: "DAM", status: "READING" },
  { title: "[Đam] Bí mật của nhân viên văn phòng K", category: "DAM", status: "COMPLETED" },
  { title: "[Đam] Bromance", category: "DAM", status: "READING" },
  { title: "[Đam] Cá heo và cá nóc", category: "DAM", status: "COMPLETED" },
  { title: "[Đam] Cận kề tiếp xúc", category: "DAM", status: "COMPLETED" },
  { title: "[Đam] Cá trên trời", category: "DAM", status: "COMPLETED" },
  { title: "[Đam] Chiếu tướng", category: "DAM", status: "READING", current_chapter: "chap 84" },
  { title: "[Đam] Cửa hàng tiện lợi nguy hiểm", category: "DAM", status: "READING" },
  { title: "[Đam] Dark Blue Kiss", category: "DAM", status: "COMPLETED" },
  { title: "[Đam] Fallen Star", category: "DAM", status: "COMPLETED" },
  { title: "[Đam] Hotsearch của ảnh Đế", category: "DAM", status: "READING", current_chapter: "chap 54" },
  { title: "[Đam] Jinx", category: "DAM", status: "READING", current_chapter: "ep 30" },
  { title: "[Đam] Kinh nghiệm cảnh nóng", category: "DAM", status: "READING" },
  { title: "[Đam] Kiss me liar", category: "DAM", status: "COMPLETED" },
  { title: "[Đam] Liveta", category: "DAM", status: "READING" },
  { title: "[Đam] Luck arrive after being in relationship", category: "DAM", status: "COMPLETED" },
  { title: "[Đam] Megumi and Tsugumi", category: "DAM", status: "COMPLETED" },
  { title: "[Đam] Meet me after school", category: "DAM", status: "COMPLETED" },
  { title: "[Đam] Ngôn ngữ ký hiệu", category: "DAM", status: "COMPLETED" },
  { title: "[Đam] Người cùng nhà", category: "DAM", status: "COMPLETED" },
  { title: "[Đam] Nguỵ trang học tra", category: "DAM", status: "COMPLETED" },
  { title: "[Đam] Plaything/Món đồ chơi của đại công tước", category: "DAM", status: "READING" },
  { title: "[Đam] Semantic Error", category: "DAM", status: "COMPLETED" },
  { title: "[Đam] Struggle", category: "DAM", status: "COMPLETED" },
  { title: "[Đam] Supporting Actor's Survival Game", category: "DAM", status: "READING" },
  { title: "[Đam] Thiếu niên sò", category: "DAM", status: "READING" },
  { title: "[Đam] Thỏ ơi thỏ à", category: "DAM", status: "COMPLETED" },
  { title: "[Đam] Tin tức tố nói chúng ta không hợp nhau", category: "DAM", status: "COMPLETED" },
  { title: "[Đam] Tình nhân 4 tuần", category: "DAM", status: "READING" },
  { title: "[Đam] Tôi ship cp đối thủ với tui", category: "DAM", status: "READING", current_chapter: "chap 62" },
  { title: "[Đam] Trở lại thời trung học của cha ta", category: "DAM", status: "COMPLETED" },
  { title: "[Đam] Under the Green Light", category: "DAM", status: "READING", current_chapter: "chap 38" },

  // Standalone
  { title: "100-Day Dating Plan", category: "STANDALONE", status: "COMPLETED" },
  { title: "Bỗng một ngày trở thành con gái nhà vua", category: "STANDALONE", status: "READING" },
];

async function seed() {
  const client = await pool.connect();
  try {
    console.log("🌱 Starting book seed...");

    await client.query("DELETE FROM book_keywords");
    await client.query("DELETE FROM books");

    let count = 0;
    for (const book of RAW) {
      await client.query(
        `INSERT INTO books (title, category, status, current_chapter)
         VALUES ($1, $2, $3, $4)`,
        [book.title, book.category, book.status, book.current_chapter || null]
      );
      count++;
    }

    console.log(`✅ ${count} books inserted`);
    console.log("🎉 Book seed complete!");
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(console.error);
