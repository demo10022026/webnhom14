const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");

const root = path.resolve(__dirname, "..");
const outRoot = path.join(root, "outputs", "manual-20260609-shopvn", "presentations", "shopvn-defense");
const outDir = path.join(outRoot, "output");
const assetDir = path.join(outRoot, "assets");
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(assetDir, { recursive: true });

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "ShopVN Team";
pptx.company = "Truong Cao Dang Bach Khoa";
pptx.subject = "Bao cao do an ShopVN";
pptx.title = "ShopVN - Website thuong mai dien tu";
pptx.lang = "vi-VN";
pptx.theme = {
  headFontFace: "Aptos Display",
  bodyFontFace: "Aptos",
  lang: "vi-VN",
};
pptx.defineLayout({ name: "LAYOUT_WIDE", width: 13.333, height: 7.5 });
pptx.layout = "LAYOUT_WIDE";

const C = {
  orange: "FF6A14",
  orange2: "FF8A3D",
  navy: "14213D",
  ink: "111827",
  muted: "6B7280",
  line: "E5E7EB",
  pale: "FFF4EC",
  blue: "2563EB",
  green: "16A34A",
  red: "EF4444",
  bg: "F8FAFC",
  white: "FFFFFF",
  dark: "0F172A",
};

const W = 13.333;
const H = 7.5;
const footer = "ShopVN | Đồ án tốt nghiệp | 2026";

function safeAsset(rel) {
  const p = path.join(root, rel);
  return fs.existsSync(p) ? p : null;
}

const imgs = {
  home: safeAsset(".report_work/screenshots/01-home.png"),
  login: safeAsset(".report_work/screenshots/02-login.png"),
  register: safeAsset(".report_work/screenshots/03-register.png"),
  erd: safeAsset(".report_work/assets/defaultdb.png"),
  erd1: safeAsset(".report_work/assets/defaultdb_part_1.png"),
  erd2: safeAsset(".report_work/assets/defaultdb_part_2.png"),
  erd3: safeAsset(".report_work/assets/defaultdb_part_3.png"),
  erd4: safeAsset(".report_work/assets/defaultdb_part_4.png"),
};

function slideBase(slide, opts = {}) {
  slide.background = { color: opts.dark ? C.dark : C.bg };
  if (opts.dark) {
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: W, h: H, fill: { color: C.dark }, line: { color: C.dark } });
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: W, h: 0.11, fill: { color: C.orange }, line: { color: C.orange } });
  } else {
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: W, h: H, fill: { color: C.bg }, line: { color: C.bg } });
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: W, h: 0.11, fill: { color: C.orange }, line: { color: C.orange } });
  }
  slide.addText(opts.page ? String(opts.page).padStart(2, "0") : "", {
    x: 12.35, y: 7.05, w: 0.5, h: 0.18,
    fontFace: "Aptos", fontSize: 8, color: opts.dark ? "CBD5E1" : "94A3B8",
    align: "right", margin: 0,
  });
  slide.addText(footer, {
    x: 0.55, y: 7.06, w: 4.5, h: 0.18,
    fontSize: 7.5, color: opts.dark ? "CBD5E1" : "94A3B8", margin: 0,
  });
}

function title(slide, t, sub, opts = {}) {
  slide.addText(t, {
    x: 0.55, y: 0.45, w: opts.w || 8.8, h: 0.52,
    fontFace: "Aptos Display", fontSize: opts.size || 27,
    bold: true, color: opts.dark ? C.white : C.ink, margin: 0,
    breakLine: false, fit: "shrink",
  });
  if (sub) {
    slide.addText(sub, {
      x: 0.58, y: 1.05, w: opts.sw || 9.3, h: 0.33,
      fontSize: 10.8, color: opts.dark ? "CBD5E1" : C.muted, margin: 0,
    });
  }
}

function chip(slide, text, x, y, color = C.orange, w = 1.65) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h: 0.33,
    rectRadius: 0.06,
    fill: { color, transparency: 6 },
    line: { color, transparency: 100 },
  });
  slide.addText(text, { x: x + 0.12, y: y + 0.075, w: w - 0.24, h: 0.14, fontSize: 8.5, bold: true, color: C.white, align: "center", margin: 0 });
}

function card(slide, x, y, w, h, heading, body, opts = {}) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h,
    rectRadius: 0.08,
    fill: { color: opts.fill || C.white },
    line: { color: opts.line || C.line, transparency: opts.noLine ? 100 : 0, width: 1 },
    shadow: opts.shadow === false ? undefined : { type: "outer", color: "CBD5E1", opacity: 0.18, blur: 1, angle: 45, distance: 1 },
  });
  if (opts.accent) slide.addShape(pptx.ShapeType.rect, { x, y, w: 0.08, h, fill: { color: opts.accent }, line: { color: opts.accent } });
  slide.addText(heading, { x: x + 0.22, y: y + 0.18, w: w - 0.44, h: 0.3, fontSize: opts.hSize || 14, bold: true, color: opts.hColor || C.ink, margin: 0, fit: "shrink" });
  if (Array.isArray(body)) {
    slide.addText(body.map(v => ({ text: v, options: { bullet: { type: "ul" }, breakLine: true } })), {
      x: x + 0.27, y: y + 0.62, w: w - 0.5, h: h - 0.75,
      fontSize: opts.bSize || 9.6, color: opts.bColor || "374151", breakLine: false,
      paraSpaceAfterPt: 4, fit: "shrink",
    });
  } else if (body) {
    slide.addText(body, { x: x + 0.22, y: y + 0.62, w: w - 0.44, h: h - 0.78, fontSize: opts.bSize || 10, color: opts.bColor || "374151", margin: 0, fit: "shrink", breakLine: false });
  }
}

function label(slide, text, x, y, w, opts = {}) {
  slide.addText(text, {
    x, y, w, h: opts.h || 0.25,
    fontSize: opts.size || 9,
    bold: opts.bold ?? true,
    color: opts.color || C.muted,
    margin: 0,
    align: opts.align || "left",
    fit: "shrink",
  });
}

function arrow(slide, x1, y1, x2, y2, color = C.orange) {
  slide.addShape(pptx.ShapeType.line, {
    x: x1, y: y1, w: x2 - x1, h: y2 - y1,
    line: { color, width: 2, beginArrowType: "none", endArrowType: "triangle" },
  });
}

function techPill(slide, text, x, y, w, color) {
  slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h: 0.45, rectRadius: 0.08, fill: { color }, line: { color, transparency: 100 } });
  slide.addText(text, { x: x + 0.08, y: y + 0.13, w: w - 0.16, h: 0.18, fontSize: 9, bold: true, color: C.white, align: "center", margin: 0, fit: "shrink" });
}

function addScreenshot(slide, imgPath, x, y, w, h) {
  if (imgPath) {
    slide.addImage({ path: imgPath, x, y, w, h, sizingCrop: true });
  } else {
    slide.addShape(pptx.ShapeType.rect, { x, y, w, h, fill: { color: "E5E7EB" }, line: { color: "CBD5E1" } });
    slide.addText("Ảnh minh họa", { x, y: y + h / 2 - 0.1, w, h: 0.2, align: "center", fontSize: 11, color: C.muted });
  }
}

const notes = [];
function addNote(slideNo, title, bullets) {
  notes.push({ slideNo, title, bullets });
}

// 1
{
  const s = pptx.addSlide(); slideBase(s, { dark: true, page: 1 });
  s.addShape(pptx.ShapeType.arc, { x: 8.6, y: -0.5, w: 5.8, h: 5.8, adjustPoint: 0.25, fill: { color: C.orange, transparency: 12 }, line: { color: C.orange, transparency: 100 }, rotate: 20 });
  s.addText("ShopVN", { x: 0.72, y: 0.55, w: 3.0, h: 0.45, fontSize: 24, bold: true, color: C.orange, margin: 0 });
  s.addText("XÂY DỰNG WEBSITE\nTHƯƠNG MẠI ĐIỆN TỬ", { x: 0.72, y: 1.65, w: 6.9, h: 1.45, fontSize: 34, bold: true, color: C.white, breakLine: false, margin: 0, fit: "shrink" });
  s.addText("Báo cáo đồ án tốt nghiệp • Thời lượng trình bày slide: 20 phút", { x: 0.76, y: 3.23, w: 6.8, h: 0.3, fontSize: 13, color: "CBD5E1", margin: 0 });
  card(s, 0.75, 4.22, 3.75, 1.45, "Sinh viên thực hiện", ["Lường Quốc Khánh - 154802070079", "Lưu Thị Mai Yến - 154802070175", "Phạm Tuấn Huy - 154802070076"], { fill: "172554", line: "334155", hColor: C.white, bColor: "E2E8F0", shadow: false, accent: C.orange, bSize: 9.5 });
  card(s, 4.75, 4.22, 3.25, 1.45, "Thông tin", ["GVHD: ThS. Đào Văn Tiến", "Ngành: Lập trình máy tính", "Hà Nội, năm 2026"], { fill: "172554", line: "334155", hColor: C.white, bColor: "E2E8F0", shadow: false, accent: C.blue, bSize: 9.5 });
  s.addText("20 slides", { x: 9.2, y: 4.35, w: 2.7, h: 0.5, fontSize: 28, bold: true, color: C.white, align: "center", margin: 0 });
  s.addText("Sau phần slide sẽ demo trực tiếp web thực tế", { x: 8.75, y: 4.95, w: 3.6, h: 0.34, fontSize: 12, color: "E2E8F0", align: "center", margin: 0 });
  addNote(1, "Giới thiệu nhóm", ["Chào hội đồng, giới thiệu đề tài ShopVN và 3 thành viên thực hiện.", "Nhấn mạnh phần slide chỉ gói gọn 20 phút, sau đó chuyển sang demo web thực tế."]);
}

// 2
{
  const s = pptx.addSlide(); slideBase(s, { page: 2 }); title(s, "Mục tiêu buổi trình bày", "Đi từ bài toán đến giải pháp, sau đó dành thời gian còn lại để demo trực tiếp.");
  const steps = [
    ["01", "Bài toán", "Vì sao cần một website thương mại điện tử nhiều vai trò."],
    ["02", "Giải pháp", "ShopVN: người mua, seller, manager, admin trên cùng nền tảng."],
    ["03", "Kỹ thuật", "React + Spring Boot + MySQL + JWT + Cloudinary + SePay."],
    ["04", "Kết quả", "Các luồng chính chạy được và có thể demo thực tế."],
  ];
  steps.forEach((it, i) => {
    const x = 0.78 + i * 3.08;
    s.addShape(pptx.ShapeType.roundRect, { x, y: 2.0, w: 2.55, h: 2.65, rectRadius: 0.08, fill: { color: C.white }, line: { color: C.line } });
    s.addText(it[0], { x: x + 0.24, y: 2.22, w: 0.65, h: 0.42, fontSize: 20, bold: true, color: C.orange, margin: 0 });
    s.addText(it[1], { x: x + 0.24, y: 2.92, w: 2.0, h: 0.3, fontSize: 16, bold: true, color: C.ink, margin: 0 });
    s.addText(it[2], { x: x + 0.24, y: 3.42, w: 2.05, h: 0.82, fontSize: 10.5, color: "374151", margin: 0, fit: "shrink" });
  });
  label(s, "Phân bổ thời gian: mỗi slide ~1 phút, phần demo web 5-10 phút tùy hội đồng đặt câu hỏi.", 1.0, 6.15, 11.3, { size: 12, color: C.navy, align: "center" });
  addNote(2, "Cách trình bày", ["Nói rõ buổi thuyết trình không đọc báo cáo, chỉ tóm tắt các điểm chính.", "Phần web thực tế sẽ chứng minh các chức năng đã nói trên slide."]);
}

// 3
{
  const s = pptx.addSlide(); slideBase(s, { page: 3 }); title(s, "Bài toán và phạm vi đề tài", "Xây dựng nền tảng mua bán trực tuyến có phân quyền rõ và dữ liệu vận hành thực tế.");
  card(s, 0.75, 1.75, 3.8, 3.85, "Vấn đề", ["Nhu cầu mua bán online cần hệ thống tập trung.", "Người bán cần quản lý shop, sản phẩm, đơn hàng.", "Quản trị cần duyệt seller, kiểm soát sản phẩm và thống kê."], { accent: C.red });
  card(s, 4.78, 1.75, 3.8, 3.85, "Mục tiêu", ["Xây dựng website ShopVN theo mô hình frontend - backend tách biệt.", "Hỗ trợ người mua, seller, manager và admin.", "Có checkout, địa chỉ, thanh toán demo SePay và dashboard."], { accent: C.orange });
  card(s, 8.81, 1.75, 3.8, 3.85, "Phạm vi", ["Tập trung vào nghiệp vụ lõi thương mại điện tử.", "Chưa đi sâu vận chuyển thực tế, hoàn tiền nâng cao và gợi ý sản phẩm.", "Demo bằng dữ liệu thật trên môi trường dev/deploy."], { accent: C.blue });
  addNote(3, "Bài toán", ["Trình bày ngắn: ShopVN không chỉ là trang bán hàng, mà là mô hình sàn có nhiều vai trò.", "Nêu rõ phạm vi để hội đồng thấy nhóm biết giới hạn đồ án."]);
}

// 4
{
  const s = pptx.addSlide(); slideBase(s, { page: 4 }); title(s, "Các vai trò trong hệ thống", "ShopVN được thiết kế quanh 4 nhóm người dùng chính.");
  const roles = [
    ["User", "Tìm kiếm, xem chi tiết, giỏ hàng, đặt hàng, thanh toán, đánh giá, chat."],
    ["Seller", "Đăng ký shop, xác minh hồ sơ, quản lý sản phẩm, đơn hàng, chat khách."],
    ["Manager", "Quản lý dữ liệu được phân quyền, kiểm tra sản phẩm/seller theo phạm vi."],
    ["Admin", "Toàn quyền hệ thống, duyệt seller, thống kê, quản trị người dùng."],
  ];
  roles.forEach((r, i) => {
    const x = 0.88 + (i % 2) * 6.05;
    const y = 1.85 + Math.floor(i / 2) * 2.1;
    card(s, x, y, 5.45, 1.58, r[0], r[1], { accent: [C.orange, C.green, C.blue, C.navy][i], hSize: 18, bSize: 10.5 });
  });
  s.addShape(pptx.ShapeType.line, { x: 6.67, y: 1.6, w: 0, h: 4.5, line: { color: "CBD5E1", width: 1, dash: "dash" } });
  addNote(4, "Vai trò", ["Nhấn mạnh phân quyền là điểm quan trọng của đề tài.", "Manager và Admin khác nhau: manager bị giới hạn quyền, admin toàn quyền."]);
}

// 5
{
  const s = pptx.addSlide(); slideBase(s, { page: 5 }); title(s, "Phạm vi chức năng đã triển khai", "Các module được gom theo nghiệp vụ để demo có trình tự.");
  const modules = [
    ["Tài khoản", "Đăng ký, đăng nhập, OTP, refresh token, upload avatar"],
    ["Sản phẩm", "Danh mục, thương hiệu, biến thể, ảnh, tồn kho"],
    ["Mua hàng", "Giỏ hàng, địa chỉ phân cấp, voucher, checkout"],
    ["Thanh toán", "COD và SePay/VietQR qua QR + webhook"],
    ["Seller", "Onboarding, shop profile, ngân hàng, sản phẩm, chat"],
    ["Quản trị", "Dashboard, duyệt seller, quản lý user/product/order"],
  ];
  modules.forEach((m, i) => {
    const x = 0.75 + (i % 3) * 4.15;
    const y = 1.65 + Math.floor(i / 3) * 2.2;
    card(s, x, y, 3.55, 1.65, m[0], m[1], { accent: [C.orange, C.blue, C.green, C.orange2, C.navy, C.red][i], hSize: 14.5, bSize: 9.5 });
  });
  addNote(5, "Module chức năng", ["Không đọc hết từng chức năng; nói theo nhóm module.", "Nhắc lại phần demo sẽ đi qua register/login/cart/checkout/seller/admin."]);
}

// 6
{
  const s = pptx.addSlide(); slideBase(s, { page: 6 }); title(s, "Công nghệ sử dụng - khái quát", "Chỉ chọn các công nghệ phục vụ trực tiếp cho kiến trúc và demo.");
  techPill(s, "React", 0.85, 1.75, 1.35, C.blue);
  techPill(s, "TypeScript", 2.35, 1.75, 1.65, C.blue);
  techPill(s, "Vite", 4.15, 1.75, 1.25, C.orange);
  techPill(s, "Spring Boot", 5.95, 1.75, 1.8, C.green);
  techPill(s, "Spring Security", 7.95, 1.75, 2.1, C.green);
  techPill(s, "MySQL", 10.25, 1.75, 1.25, C.navy);
  techPill(s, "JPA/Hibernate", 0.85, 2.55, 1.95, C.navy);
  techPill(s, "JWT", 3.0, 2.55, 1.0, C.red);
  techPill(s, "Cloudinary", 4.2, 2.55, 1.7, C.orange2);
  techPill(s, "SePay/VietQR", 6.1, 2.55, 1.95, C.orange);
  techPill(s, "Railway", 8.25, 2.55, 1.45, C.dark);
  techPill(s, "Cloudflare Tunnel", 9.95, 2.55, 2.35, C.dark);
  card(s, 0.85, 4.05, 3.8, 1.35, "Frontend", "SPA, responsive UI, gọi REST API, xử lý token và trạng thái checkout.", { accent: C.blue });
  card(s, 4.85, 4.05, 3.8, 1.35, "Backend", "REST API, service layer, validation, JWT, upload, webhook và phân quyền.", { accent: C.green });
  card(s, 8.85, 4.05, 3.8, 1.35, "Data & Deploy", "MySQL/Aiven, Cloudinary, Railway backend, tunnel cho webhook local.", { accent: C.orange });
  addNote(6, "Công nghệ", ["Chỉ nói tổng quan, không sa vào định nghĩa React/Spring.", "Nhấn mạnh lý do chọn: dễ tách frontend/backend, dễ demo, dễ deploy."]);
}

// 7
{
  const s = pptx.addSlide(); slideBase(s, { page: 7 }); title(s, "Kiến trúc tổng quan", "Frontend và backend tách biệt, giao tiếp qua REST API.");
  const boxes = [
    ["Trình duyệt", 0.8, 2.35, C.blue, ["React SPA", "Router", "State/UI"]],
    ["REST API", 3.65, 2.35, C.orange, ["HTTP/JSON", "JWT header", "Validation"]],
    ["Spring Boot", 6.35, 2.35, C.green, ["Controller", "Service", "Repository"]],
    ["MySQL + Cloud", 9.25, 2.35, C.navy, ["Aiven MySQL", "Cloudinary", "SePay/Railway"]],
  ];
  boxes.forEach(b => card(s, b[1], b[2], 2.55, 1.55, b[0], b[4], { accent: b[3], hSize: 15, bSize: 9.2 }));
  arrow(s, 3.15, 3.1, 3.58, 3.1);
  arrow(s, 6.05, 3.1, 6.28, 3.1);
  arrow(s, 8.9, 3.1, 9.18, 3.1);
  label(s, "Auth", 2.15, 4.55, 1.0, { color: C.blue, align: "center" });
  label(s, "Business logic", 5.1, 4.55, 1.8, { color: C.green, align: "center" });
  label(s, "Persistence & external services", 8.55, 4.55, 3.0, { color: C.navy, align: "center" });
  addNote(7, "Kiến trúc", ["Nói rõ frontend không truy cập database trực tiếp.", "Backend là điểm kiểm soát bảo mật, phân quyền và xử lý nghiệp vụ."]);
}

// 8
{
  const s = pptx.addSlide(); slideBase(s, { page: 8 }); title(s, "Backend: tổ chức theo lớp", "Spring Boot giữ nghiệp vụ tập trung và dễ kiểm thử.");
  const layers = [
    ["Controller", "Nhận request, validate input cơ bản, trả response chuẩn"],
    ["Service", "Xử lý nghiệp vụ: order, seller, payment, upload, dashboard"],
    ["Repository", "JPA/Hibernate truy vấn MySQL theo entity"],
    ["Security", "JWT filter, role-based access, refresh token"],
  ];
  layers.forEach((l, i) => {
    const y = 1.62 + i * 1.15;
    card(s, 1.0, y, 4.4, 0.82, l[0], l[1], { accent: [C.blue, C.orange, C.green, C.red][i], hSize: 13.5, bSize: 8.7, shadow: false });
    if (i < layers.length - 1) arrow(s, 3.2, y + 0.86, 3.2, y + 1.1, C.muted);
  });
  card(s, 6.0, 1.62, 5.9, 4.3, "Điểm đáng chú ý", [
    "Token ngắn hạn + refresh token lưu DB để đăng xuất/chặn phiên.",
    "Upload ảnh qua Cloudinary thay vì lưu file local.",
    "Webhook SePay cập nhật payment/order theo giao dịch nhận được.",
    "Phân quyền admin/manager/seller/user theo route API.",
  ], { accent: C.navy, bSize: 10.3 });
  addNote(8, "Backend", ["Nói theo lớp để hội đồng dễ hình dung mã nguồn.", "Nhấn mạnh các controller/service quan trọng: auth, product, cart, order, payment, seller, admin."]);
}

// 9
{
  const s = pptx.addSlide(); slideBase(s, { page: 9 }); title(s, "Frontend: trải nghiệm người dùng", "React SPA tập trung vào luồng mua hàng và quản lý theo vai trò.");
  addScreenshot(s, imgs.home, 0.75, 1.55, 6.05, 3.85);
  card(s, 7.1, 1.65, 5.25, 1.15, "Điểm chính", ["Thanh header chung: tìm kiếm, giỏ hàng, thông báo, tài khoản.", "Trang chủ/danh sách/chi tiết sản phẩm dùng dữ liệu API.", "Protected routes chuyển người dùng chưa login về trang đăng nhập."], { accent: C.orange, bSize: 9.2 });
  card(s, 7.1, 3.2, 2.45, 1.45, "Login/Register", "Form validation, OTP email, điều hướng theo role.", { accent: C.blue });
  card(s, 9.9, 3.2, 2.45, 1.45, "Checkout", "Địa chỉ phân cấp, voucher, COD/SePay.", { accent: C.green });
  card(s, 7.1, 5.0, 5.25, 0.82, "Mục tiêu UI", "Dễ demo, rõ luồng, ít thao tác thừa khi kiểm thử.", { accent: C.navy, bSize: 10.4 });
  addNote(9, "Frontend", ["Dùng ảnh trang chủ để chỉ ra các vùng UI.", "Không cần giải thích quá sâu component; chuyển trọng tâm sang luồng mua hàng."]);
}

// 10
{
  const s = pptx.addSlide(); slideBase(s, { page: 10 }); title(s, "Cơ sở dữ liệu: ERD cập nhật", "Schema phục vụ mô hình sàn nhiều người bán, không chỉ shop đơn lẻ.");
  if (imgs.erd) s.addImage({ path: imgs.erd, x: 0.65, y: 1.35, w: 6.25, h: 5.4, sizingContain: true });
  card(s, 7.18, 1.45, 5.25, 4.95, "Nhóm bảng chính", [
    "users, refresh_tokens, otp_codes, user_addresses",
    "seller_profiles, seller_documents, shops, seller_bank_accounts",
    "products, product_variants, product_images, categories, brands",
    "shopping_carts, cart_items, orders, order_items, payments",
    "vouchers, user_vouchers, flash_sale_items",
    "chat_conversations, chat_messages, notifications, reviews",
  ], { accent: C.orange, bSize: 9.1 });
  addNote(10, "ERD", ["Nói rằng slide chỉ là tổng quan ERD, báo cáo có phần chia rõ hơn.", "Nhấn mạnh database đã cập nhật đúng project mới: thanh toán, seller bank, chat, notification, address."]);
}

// 11
{
  const s = pptx.addSlide(); slideBase(s, { page: 11 }); title(s, "Một số bảng và quan hệ quan trọng", "Các quan hệ được chọn theo nghiệp vụ demo.");
  const rows = [
    ["Nghiệp vụ", "Bảng chính", "Ý nghĩa"],
    ["Tài khoản", "users, refresh_tokens, otp_codes", "Đăng nhập, OTP, phiên người dùng"],
    ["Seller", "seller_profiles, shops, seller_bank_accounts", "Hồ sơ bán hàng và nhận tiền"],
    ["Sản phẩm", "products, product_variants, product_images", "Sản phẩm nhiều biến thể/ảnh"],
    ["Đơn hàng", "orders, order_items, payments", "Lưu đơn, dòng hàng, trạng thái thanh toán"],
    ["Tương tác", "chat_conversations, notifications, reviews", "Chat, thông báo, đánh giá"],
  ];
  s.addTable(rows, {
    x: 0.72, y: 1.55, w: 11.9, h: 4.4,
    border: { type: "solid", color: "CBD5E1", pt: 0.75 },
    fontFace: "Aptos", fontSize: 9.5, color: C.ink,
    fill: { color: C.white },
    margin: 0.08,
    autoFit: false,
    colW: [2.0, 4.45, 5.45],
    valign: "mid",
  });
  s.addShape(pptx.ShapeType.rect, { x: 0.72, y: 1.55, w: 11.9, h: 0.73, fill: { color: C.navy, transparency: 0 }, line: { color: C.navy } });
  s.addText("Nghiệp vụ", { x: 0.84, y: 1.8, w: 1.5, h: 0.18, fontSize: 9.5, bold: true, color: C.white, margin: 0 });
  s.addText("Bảng chính", { x: 2.72, y: 1.8, w: 2.2, h: 0.18, fontSize: 9.5, bold: true, color: C.white, margin: 0 });
  s.addText("Ý nghĩa", { x: 7.22, y: 1.8, w: 2.2, h: 0.18, fontSize: 9.5, bold: true, color: C.white, margin: 0 });
  label(s, "Bảng này dùng để giải thích ERD nhanh trong lúc thuyết trình; phần chi tiết xem báo cáo.", 0.85, 6.35, 11.6, { align: "center", size: 10.3, color: C.muted });
  addNote(11, "Bảng quan hệ", ["Chọn 5 nhóm bảng đại diện, không đọc hết toàn bộ schema.", "Liên hệ trực tiếp với các phần demo sau: tài khoản, seller, sản phẩm, order/payment."]);
}

// 12
{
  const s = pptx.addSlide(); slideBase(s, { page: 12 }); title(s, "Luồng mua hàng", "Luồng chính của người dùng từ sản phẩm đến đơn hàng.");
  const flow = [
    ["Tìm kiếm", "Keyword / danh mục"],
    ["Chi tiết", "Ảnh, biến thể, giá"],
    ["Giỏ hàng", "Số lượng, tồn kho"],
    ["Checkout", "Địa chỉ, voucher"],
    ["Thanh toán", "COD hoặc SePay"],
    ["Đơn mua", "Theo dõi trạng thái"],
  ];
  flow.forEach((f, i) => {
    const x = 0.65 + i * 2.08;
    card(s, x, 2.55, 1.72, 1.25, f[0], f[1], { accent: i === 4 ? C.orange : C.blue, hSize: 12.2, bSize: 8.4, shadow: false });
    if (i < flow.length - 1) arrow(s, x + 1.72, 3.15, x + 2.04, 3.15, C.orange);
  });
  card(s, 1.15, 4.65, 3.25, 1.05, "Địa chỉ phân cấp", "Chọn tỉnh → quận/huyện → phường/xã; địa chỉ mới hiển thị lại ở checkout.", { accent: C.green });
  card(s, 5.05, 4.65, 3.25, 1.05, "Voucher", "Áp dụng điều kiện đơn tối thiểu, số lượt dùng và phạm vi shop/sàn.", { accent: C.orange });
  card(s, 8.95, 4.65, 3.25, 1.05, "Trạng thái", "Order và payment được cập nhật riêng để dễ đối soát.", { accent: C.navy });
  addNote(12, "Luồng mua hàng", ["Đây là luồng sẽ demo trực tiếp sau slide.", "Nhấn mạnh địa chỉ phân cấp là điểm đã sửa để checkout cập nhật ngay."]);
}

// 13
{
  const s = pptx.addSlide(); slideBase(s, { page: 13 }); title(s, "Thanh toán SePay/VietQR realtime", "Luồng demo online đã thay cho nút mô phỏng thủ công.");
  const y = 2.15;
  card(s, 0.8, y, 2.05, 1.25, "1. Tạo đơn", "Backend tạo order + payment", { accent: C.blue, hSize: 12.5, bSize: 8.8 });
  card(s, 3.25, y, 2.05, 1.25, "2. Hiển thị QR", "Frontend sinh QR theo số tiền/nội dung", { accent: C.orange, hSize: 12.5, bSize: 8.8 });
  card(s, 5.7, y, 2.05, 1.25, "3. SePay", "Nhận giao dịch test mode", { accent: C.green, hSize: 12.5, bSize: 8.8 });
  card(s, 8.15, y, 2.05, 1.25, "4. Webhook", "POST về backend public URL", { accent: C.navy, hSize: 12.5, bSize: 8.8 });
  card(s, 10.6, y, 2.05, 1.25, "5. Redirect", "Polling thấy PAID → Đơn mua", { accent: C.red, hSize: 12.5, bSize: 8.8 });
  for (let i = 0; i < 4; i++) arrow(s, 2.85 + i * 2.45, y + 0.62, 3.2 + i * 2.45, y + 0.62, C.orange);
  card(s, 1.2, 4.55, 5.15, 1.25, "Điểm kỹ thuật", ["Webhook xác thực API key.", "Đối chiếu mã đơn/nội dung giao dịch.", "Cập nhật payment/order theo trạng thái thanh toán."], { accent: C.navy, bSize: 9.1 });
  card(s, 7.0, 4.55, 5.15, 1.25, "Điểm demo", ["Có thể test bằng SePay test mode.", "Local dùng Cloudflare Tunnel; deploy dùng Railway URL.", "Không còn nút mô phỏng thanh toán trên UI."], { accent: C.orange, bSize: 9.1 });
  addNote(13, "SePay", ["Đây là slide quan trọng: giải thích realtime nghĩa là webhook + polling.", "Nói rõ môi trường đồ án dùng test mode, không phải tiền thật."]);
}

// 14
{
  const s = pptx.addSlide(); slideBase(s, { page: 14 }); title(s, "Seller onboarding và quản lý shop", "Seller có hồ sơ riêng trước khi được phép bán hàng.");
  card(s, 0.8, 1.65, 3.15, 3.45, "Đăng ký seller", ["Nhập thông tin định danh.", "Upload giấy tờ xác minh.", "Chờ admin/manager duyệt."], { accent: C.blue });
  card(s, 4.25, 1.65, 3.15, 3.45, "Thiết lập shop", ["Tên shop, mô tả, avatar, banner.", "Thông tin ngân hàng nhận tiền.", "Trạng thái shop hoạt động/tạm khóa."], { accent: C.orange });
  card(s, 7.7, 1.65, 3.15, 3.45, "Vận hành", ["Quản lý sản phẩm và tồn kho.", "Xem đơn hàng của shop.", "Chat với khách hàng đúng tên người mua."], { accent: C.green });
  s.addShape(pptx.ShapeType.chevron, { x: 3.98, y: 2.85, w: 0.24, h: 0.65, fill: { color: C.orange }, line: { color: C.orange } });
  s.addShape(pptx.ShapeType.chevron, { x: 7.43, y: 2.85, w: 0.24, h: 0.65, fill: { color: C.orange }, line: { color: C.orange } });
  addNote(14, "Seller", ["Trình bày seller như một actor độc lập.", "Nhắc lỗi đã sửa: phía seller hiển thị tên khách hàng trong cuộc trò chuyện, không phải tên shop."]);
}

// 15
{
  const s = pptx.addSlide(); slideBase(s, { page: 15 }); title(s, "Admin / Manager", "Quản trị dữ liệu và kiểm soát vận hành theo quyền.");
  card(s, 0.85, 1.55, 5.55, 3.95, "Admin", ["Toàn quyền hệ thống.", "Duyệt seller và quản lý tài khoản.", "Quản lý sản phẩm, danh mục, thương hiệu.", "Theo dõi dashboard doanh thu/đơn hàng."], { accent: C.red, hSize: 18 });
  card(s, 6.95, 1.55, 5.55, 3.95, "Manager", ["Được phép thao tác một phần chức năng quản trị.", "Kiểm thử quyền được dùng và không được dùng.", "Giúp tách trách nhiệm vận hành khỏi quyền admin cao nhất."], { accent: C.blue, hSize: 18 });
  label(s, "Ý chính khi demo: đăng nhập admin/manager để cho thấy menu, API và route đều bị ràng buộc theo role.", 1.0, 6.25, 11.4, { align: "center", size: 11, color: C.navy });
  addNote(15, "Admin Manager", ["Nói ngắn, tránh kể từng menu.", "Nếu demo, dùng tài khoản admin/manager đã có để show phân quyền."]);
}

// 16
{
  const s = pptx.addSlide(); slideBase(s, { page: 16 }); title(s, "Các chức năng hỗ trợ trải nghiệm", "Những phần nhỏ nhưng làm hệ thống giống sản phẩm thật hơn.");
  const items = [
    ["Avatar người dùng", "Upload qua Cloudinary, cập nhật hồ sơ cá nhân."],
    ["Địa chỉ của tôi", "Có menu riêng trong dropdown tài khoản."],
    ["Chat với shop", "User thấy tên shop, seller thấy tên khách hàng."],
    ["Thông báo", "Lưu thông báo theo user, loại, nội dung, link đích."],
    ["Voucher/Flash sale", "Nền tảng khuyến mãi theo điều kiện và thời gian."],
    ["Review", "Đánh giá sản phẩm sau mua hàng."],
  ];
  items.forEach((it, i) => {
    const x = 0.82 + (i % 3) * 4.08;
    const y = 1.6 + Math.floor(i / 3) * 2.2;
    card(s, x, y, 3.48, 1.55, it[0], it[1], { accent: [C.orange, C.blue, C.green, C.navy, C.red, C.orange2][i], hSize: 13.2, bSize: 9.2 });
  });
  addNote(16, "Chức năng hỗ trợ", ["Slide này dùng để chứng minh nhóm có xử lý các chi tiết thực tế.", "Không cần demo hết, chỉ chọn avatar, địa chỉ, chat nếu có thời gian."]);
}

// 17
{
  const s = pptx.addSlide(); slideBase(s, { page: 17 }); title(s, "Kiểm thử hệ thống", "Tập trung vào các luồng có rủi ro cao và phân quyền.");
  const tests = [
    ["Auth", "Đăng ký, đăng nhập, OTP, refresh token, token hết hạn"],
    ["Checkout", "Giỏ hàng, địa chỉ, voucher, tạo order"],
    ["Payment", "QR, webhook SePay, polling, trạng thái PAID"],
    ["Seller", "Onboarding, duyệt seller, quản lý shop/sản phẩm"],
    ["Admin/Manager", "Chức năng được phép và không được phép"],
    ["UI/API", "Delay load, lỗi input, CORS, response lỗi"],
  ];
  tests.forEach((t, i) => {
    const x = 0.7 + (i % 2) * 6.1;
    const y = 1.45 + Math.floor(i / 2) * 1.55;
    card(s, x, y, 5.65, 1.02, t[0], t[1], { accent: [C.blue, C.green, C.orange, C.navy, C.red, C.orange2][i], hSize: 12.8, bSize: 8.8, shadow: false });
  });
  addNote(17, "Kiểm thử", ["Nói rằng nhóm kiểm thử bằng API và thao tác web thực tế.", "Nhấn mạnh SePay test mode đã nhận webhook và web cập nhật đúng."]);
}

// 18
{
  const s = pptx.addSlide(); slideBase(s, { page: 18 }); title(s, "Triển khai và môi trường demo", "Backend đã chạy được trên cloud; frontend có thể chạy local hoặc deploy riêng.");
  card(s, 0.85, 1.65, 3.4, 3.25, "Local dev", ["run.bat hỗ trợ chạy dự án.", "Frontend: Vite localhost:5173.", "Backend: Spring Boot localhost:8080."], { accent: C.blue });
  card(s, 4.95, 1.65, 3.4, 3.25, "Webhook dev", ["Cloudflare Tunnel tạo HTTPS tạm.", "SePay test mode gọi về backend local.", "Dùng để kiểm tra realtime trước deploy."], { accent: C.orange });
  card(s, 9.05, 1.65, 3.4, 3.25, "Deploy", ["Backend deploy Railway.", "Database Aiven MySQL.", "Cloudinary lưu ảnh.", "Frontend có thể deploy Vercel/Netlify."], { accent: C.green });
  label(s, "Public backend đã dùng trong quá trình tích hợp: Railway service URL + /api endpoints.", 1.0, 6.0, 11.4, { align: "center", size: 10.5, color: C.navy });
  addNote(18, "Triển khai", ["Giải thích vì sao cần tunnel: SePay cần gọi webhook qua HTTPS public URL.", "Nói biến môi trường tách khỏi code khi deploy."]);
}

// 19
{
  const s = pptx.addSlide(); slideBase(s, { page: 19 }); title(s, "Kịch bản demo trực tiếp sau slide", "Chọn các luồng chứng minh đúng phần kỹ thuật vừa trình bày.");
  const demo = [
    ["1", "User", "Đăng nhập / tìm sản phẩm / thêm giỏ / checkout"],
    ["2", "Địa chỉ", "Tạo địa chỉ theo tỉnh → quận → xã và dùng ngay ở thanh toán"],
    ["3", "SePay", "Tạo QR, mô phỏng giao dịch test mode, webhook cập nhật đơn"],
    ["4", "Seller", "Shop, sản phẩm, chat hiển thị tên khách hàng"],
    ["5", "Admin/Manager", "Dashboard, duyệt seller, kiểm tra phân quyền"],
  ];
  demo.forEach((d, i) => {
    const y = 1.45 + i * 0.95;
    s.addShape(pptx.ShapeType.ellipse, { x: 0.95, y, w: 0.52, h: 0.52, fill: { color: i === 2 ? C.orange : C.navy }, line: { color: i === 2 ? C.orange : C.navy } });
    s.addText(d[0], { x: 1.11, y: y + 0.13, w: 0.2, h: 0.12, fontSize: 9, bold: true, color: C.white, margin: 0, align: "center" });
    s.addText(d[1], { x: 1.75, y: y + 0.03, w: 1.65, h: 0.25, fontSize: 14, bold: true, color: C.ink, margin: 0 });
    s.addText(d[2], { x: 3.35, y: y + 0.05, w: 8.6, h: 0.25, fontSize: 11, color: "374151", margin: 0 });
  });
  card(s, 8.9, 5.75, 3.2, 0.85, "Nguyên tắc demo", "Đi chậm ở đoạn load dữ liệu, không click quá nhanh để tránh hiểu nhầm lỗi mạng/database.", { accent: C.orange, hSize: 12.5, bSize: 8.4 });
  addNote(19, "Demo plan", ["Dùng slide này để chuyển sang demo mượt.", "Nếu thời gian ít, ưu tiên user checkout + SePay + admin/manager."]);
}

// 20
{
  const s = pptx.addSlide(); slideBase(s, { dark: true, page: 20 });
  s.addText("Kết luận", { x: 0.72, y: 0.75, w: 4.2, h: 0.55, fontSize: 34, bold: true, color: C.white, margin: 0 });
  s.addText("ShopVN đã hoàn thành nền tảng thương mại điện tử nhiều vai trò, có luồng mua hàng, seller, quản trị và thanh toán demo realtime.", {
    x: 0.75, y: 1.55, w: 7.7, h: 0.82, fontSize: 18, color: "E2E8F0", margin: 0, fit: "shrink",
  });
  card(s, 0.85, 3.0, 3.55, 1.55, "Đạt được", ["Frontend/backend tách biệt", "Schema đầy đủ cho sàn nhiều seller", "SePay webhook demo hoạt động"], { fill: "172554", line: "334155", hColor: C.white, bColor: "E2E8F0", accent: C.green, shadow: false });
  card(s, 4.9, 3.0, 3.55, 1.55, "Hạn chế", ["Vận chuyển/hoàn tiền còn đơn giản", "Chưa tối ưu tìm kiếm dữ liệu lớn", "Cần hardening production"], { fill: "172554", line: "334155", hColor: C.white, bColor: "E2E8F0", accent: C.orange, shadow: false });
  card(s, 8.95, 3.0, 3.55, 1.55, "Hướng phát triển", ["Chat realtime", "Gợi ý sản phẩm", "Giám sát webhook và báo cáo nâng cao"], { fill: "172554", line: "334155", hColor: C.white, bColor: "E2E8F0", accent: C.blue, shadow: false });
  s.addText("Cảm ơn thầy/cô đã lắng nghe", { x: 0.85, y: 5.8, w: 6.2, h: 0.42, fontSize: 22, bold: true, color: C.orange, margin: 0 });
  s.addText("Tiếp theo: demo trực tiếp website ShopVN", { x: 0.88, y: 6.28, w: 5.4, h: 0.25, fontSize: 13, color: "CBD5E1", margin: 0 });
  addNote(20, "Kết luận", ["Tóm lại các điểm đã làm được và chủ động nêu hạn chế.", "Kết thúc bằng lời mời chuyển sang demo."]);
}

// Speaker note TXT.
const txt = [];
txt.push("TÓM TẮT THUYẾT TRÌNH THEO SLIDE - SHOPVN");
txt.push("Thời lượng gợi ý: 20 phút slide, sau đó demo web thực tế.");
txt.push("");
for (const n of notes) {
  txt.push(`Slide ${String(n.slideNo).padStart(2, "0")} - ${n.title}`);
  for (const b of n.bullets) txt.push(`- ${b}`);
  txt.push("");
}
txt.push("Gợi ý demo sau slide:");
txt.push("- Ưu tiên demo user checkout + địa chỉ phân cấp + SePay webhook vì đây là phần mới và có tính kỹ thuật.");
txt.push("- Sau đó demo seller/admin/manager nếu còn thời gian.");
txt.push("- Khi thao tác web, nên chờ dữ liệu load xong rồi mới click để tránh lỗi do database/cloud chậm.");

const pptxPath = path.join(outDir, "ShopVN_slide_thuyet_trinh_20_trang.pptx");
const txtPath = path.join(outDir, "ShopVN_tom_tat_thuyet_trinh.txt");
fs.writeFileSync(txtPath, txt.join("\r\n"), "utf8");

pptx.writeFile({ fileName: pptxPath }).then(() => {
  console.log(JSON.stringify({ pptxPath, txtPath, slides: pptx._slides.length }, null, 2));
});
