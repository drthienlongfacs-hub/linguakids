# 🌈 LinguaKids v7.0 — Học Tiếng Anh & Tiếng Trung

> Ứng dụng học ngoại ngữ song ngữ cho trẻ em và người lớn. 100% offline, không quảng cáo, không thu thập dữ liệu.

[![PWA Ready](https://img.shields.io/badge/PWA-Ready-6C63FF?style=flat-square&logo=pwa)](https://drthienlongfacs-hub.github.io/linguakids/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite)](https://vite.dev)

## ✨ Tính năng chính

### 📚 Vocabulary (525+ từ, 35 chủ đề)
- 30 chủ đề chuẩn CEFR YLE (Pre-A1 → A2)
- 🇻🇳 5 chủ đề văn hóa Việt Nam mới (Tết, Ẩm thực, Danh thắng, Lịch sử, Trò chơi)
- Flashcard học từ với phát âm TTS + câu ví dụ song ngữ
- SM-2 Spaced Repetition cho ôn tập hiệu quả

### 🎧 4 kỹ năng
- **Listening** — Nghe, chính tả (dictation), trắc nghiệm IELTS format
- **Speaking** — Shadowing, ghi âm so sánh, IELTS Speaking mock
- **Reading** — Bài đọc theo trình độ, từ vựng ngữ cảnh
- **Writing** — Viết bài, sửa câu, Grammar Clinic

### 📐 Grammar & Games
- Ngữ pháp: Thì, câu điều kiện, câu bị động
- Trò chơi: Memory Match, Quiz, Sentence Builder
- Truyện tranh tương tác (Story Mode) — EN & CN
- ✍️ Viết chữ Hán (HanziWriter)

### 🏆 Gamification
- 🪙 Hệ thống Xu (Coins) — thưởng khi học & chơi
- ⭐ XP & Level system (7 cấp bậc)
- 🔥 Streak & Daily Goal tracking
- 🏅 15 huy chương (thành tích)
- 📊 CEFR Level Estimator

### 🎨 Premium UI/UX v7.0
- Glassmorphism design system
- 9 skill card themes với gradient
- Scroll reveal animations
- Coin display với shine animation
- Dual mode: 🧒 Kids / 🧑 Adult (chuyển đổi 1 chạm)

### ⚡ Performance
- React.lazy code splitting (38 chunks)
- Main bundle: 207kB (gzip 66kB)
- Build time: ~250ms
- 100% offline PWA — không cần internet

## 🛡️ Quyền riêng tư
- **Không thu thập dữ liệu** — toàn bộ lưu trên thiết bị (LocalStorage)
- **Không quảng cáo** — hoàn toàn miễn phí
- **Không cần đăng ký** — sử dụng ngay

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript (strict) |
| Build | Vite 8 |
| State | Zustand (persist middleware) |
| Routing | react-router-dom v7 (HashRouter) |
| TTS/STT | Web Speech API |
| Hanzi | hanzi-writer |
| Styling | Vanilla CSS + Glassmorphism |
| PWA | Service Worker + Manifest |

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/drthienlongfacs-hub/linguakids.git
cd linguakids

# Install
npm install

# Dev server
npm run dev

# Production build
npm run build
```

## 📱 Cài đặt PWA

Mở trên Chrome/Safari → Menu → "Add to Home Screen" / "Thêm vào Màn hình chính"

## 🔎 Release Verification

Deploy production dùng workflow `.github/workflows/deploy.yml`, xuất `dist/` lên nhánh `gh-pages` rồi kiểm tra live HTML đã phục vụ đúng asset hash mới.

```bash
npm run build
npm run verify:live
```

Nếu lệnh này fail thì không được coi là đã phát hành xong, dù `git push` hoặc build local đã pass.

## 📄 License

MIT © 2026 Dr. Thiên Long

---

**Made with ❤️ for Vietnamese learners** 🇻🇳
