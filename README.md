# 💬 ChatApp — Real-time Chat + Ovozli Qo'ng'iroq

React + Node.js + Socket.IO + WebRTC bilan qurilgan to'liq chat ilovasi.

---

## 🗂 Loyiha tuzilmasi

```
chat-app/
├── backend/      ← Node.js server
└── frontend/     ← React ilova
```

---

## ⚙️ 1-QADAM: MongoDB Atlas sozlash (BEPUL)

1. https://mongodb.com/atlas ga kiring
2. **"Try Free"** → akkaunt yarating
3. **"Create a cluster"** → **M0 Free** tanlang → region: **Germany (yaqin)**
4. **Database Access** → Add User → username/parol yozing (eslab qoling!)
5. **Network Access** → Add IP → **"Allow Access from Anywhere"** (0.0.0.0/0)
6. **Clusters** → **Connect** → **"Connect your application"**
7. Connection string nusxa oling: `mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/chatapp`

---

## 🖥 2-QADAM: Backend ishga tushirish

```bash
# Terminal oching, backend papkasiga kiring
cd backend

# Kerakli paketlarni o'rnating
npm install

# .env fayl yarating
cp .env.example .env
```

**.env faylini oching va to'ldiring:**
```
MONGO_URI=mongodb+srv://SIZNING_USER:PAROL@cluster0.xxxxx.mongodb.net/chatapp
JWT_SECRET=istalgan_uzun_parol_123456
PORT=5000
CLIENT_URL=http://localhost:5173
```

```bash
# Serverni ishga tushiring
npm run dev

# Muvaffaqiyatli bo'lsa shu xabarlar chiqadi:
# ✅ MongoDB ulandi
# 🚀 Server port 5000 da ishlamoqda
```

---

## 🌐 3-QADAM: Frontend ishga tushirish

```bash
# Yangi terminal oching, frontend papkasiga kiring
cd frontend

# Kerakli paketlarni o'rnating
npm install

# .env fayl yarating
cp .env.example .env
```

**.env faylini oching (hech narsa o'zgartirmang agar local ishlatsangiz):**
```
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

```bash
# Frontend ishga tushiring
npm run dev

# Browser avtomatik ochiladi: http://localhost:5173
```

---

## 📱 ISHLATISH

1. **Ro'yxatdan o'tish**: Username, telefon raqam, parol kiriting
2. **Boshqa qurilmada** (yoki boshqa browser tab): Yangi akkaunt yarating
3. **Qidirish**: Chap panelda username yoki telefon raqam bilan qidiring
4. **Chat**: Xabar yozing → Enter yoki ➤ bosing
5. **Qo'ng'iroq**: 📞 tugmasini bosing (faqat online foydalanuvchiga)

---

## 🚀 DEPLOY (Internetga chiqarish)

### Backend → Render.com (BEPUL)

1. https://render.com → akkaunt yarating
2. **"New Web Service"** → GitHub repo ulang (kodni GitHub'ga yuklang)
3. **Root Directory**: `backend`
4. **Build Command**: `npm install`
5. **Start Command**: `node server.js`
6. **Environment Variables** qo'shing:
   - `MONGO_URI` = Atlas connection string
   - `JWT_SECRET` = maxfiy kalit
   - `CLIENT_URL` = Vercel URL (keyinroq)
   - `PORT` = 5000
7. Deploy qiling → URL oling: `https://chat-app-xxxx.onrender.com`

### Frontend → Vercel (BEPUL)

1. https://vercel.com → akkaunt yarating
2. **"New Project"** → GitHub repo ulang
3. **Root Directory**: `frontend`
4. **Environment Variables** qo'shing:
   - `VITE_API_URL` = Render URL (yuqoridan)
   - `VITE_SOCKET_URL` = Render URL (yuqoridan)
5. Deploy qiling → URL oling: `https://chat-app-xxxx.vercel.app`
6. Bu URLni Render'dagi `CLIENT_URL` ga qo'ying

---

## 🛠 TEXNOLOGIYALAR

| | Texnologiya | Vazifasi |
|---|---|---|
| Frontend | React + Vite | UI |
| Routing | React Router v6 | Sahifalar |
| Backend | Node.js + Express | Server |
| Real-time | Socket.IO | Chat + Signaling |
| Ovoz | WebRTC | P2P qo'ng'iroq |
| DB | MongoDB + Mongoose | Ma'lumotlar |
| Auth | JWT + bcrypt | Xavfsizlik |
| Deploy F | Vercel | Bepul hosting |
| Deploy B | Render | Bepul hosting |

---

## ❓ KO'P UCHRAYDIGAN XATOLAR

**"MongoDB ulanmadi"** → `.env` dagi MONGO_URI to'g'riligini tekshiring, Atlas'da IP whitelist qiling

**"CORS xato"** → Backend `.env` dagi `CLIENT_URL` frontend URL bilan mos bo'lishi kerak

**"Mikrofon ruxsat berilmadi"** → Browser settings'dan mikrofonga ruxsat bering

**Socket ulangani yo'q** → Backend ishlayotganini tekshiring, `VITE_SOCKET_URL` to'g'riligini tekshiring
