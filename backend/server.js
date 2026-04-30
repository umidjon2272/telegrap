require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const messageRoutes = require("./routes/messages");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => res.send("Chat App Server is running!"));

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB ulandi"))
  .catch((err) => console.error("❌ MongoDB xato:", err));

// Online foydalanuvchilar: { userId -> socketId }
const onlineUsers = {};

io.on("connection", (socket) => {
  console.log("🔌 Yangi ulanish:", socket.id);

  // Foydalanuvchi onlayn bo'ldi
  socket.on("user:online", (userId) => {
    onlineUsers[userId] = socket.id;
    io.emit("users:online", Object.keys(onlineUsers));
    console.log(`👤 Online: ${userId}`);
  });

  // Xabar yuborish
  socket.on("message:send", async (data) => {
    const { senderId, receiverId, text } = data;
    const Message = require("./models/Message");

    try {
      const message = await Message.create({
        sender: senderId,
        receiver: receiverId,
        text,
      });

      const receiverSocket = onlineUsers[receiverId];
      if (receiverSocket) {
        io.to(receiverSocket).emit("message:receive", {
          _id: message._id,
          sender: senderId,
          receiver: receiverId,
          text,
          createdAt: message.createdAt,
        });
      }

      // Yuborganga ham tasdiqlash qaytarish
      socket.emit("message:sent", {
        _id: message._id,
        sender: senderId,
        receiver: receiverId,
        text,
        createdAt: message.createdAt,
      });
    } catch (err) {
      console.error("Xabar yuborishda xato:", err);
    }
  });

  // ─── WebRTC Signaling ───────────────────────────────────────

  // Qo'ng'iroq boshlash
  socket.on("call:start", ({ callerId, receiverId, offer }) => {
    const receiverSocket = onlineUsers[receiverId];
    if (receiverSocket) {
      io.to(receiverSocket).emit("call:incoming", { callerId, offer });
    } else {
      socket.emit("call:unavailable");
    }
  });

  // Qo'ng'iroqni qabul qilish
  socket.on("call:accept", ({ callerId, answer }) => {
    const callerSocket = onlineUsers[callerId];
    if (callerSocket) {
      io.to(callerSocket).emit("call:accepted", { answer });
    }
  });

  // ICE candidate almashish
  socket.on("ice:candidate", ({ targetId, candidate }) => {
    const targetSocket = onlineUsers[targetId];
    if (targetSocket) {
      io.to(targetSocket).emit("ice:candidate", { candidate });
    }
  });

  // Qo'ng'iroqni rad etish yoki tugatish
  socket.on("call:end", ({ targetId }) => {
    const targetSocket = onlineUsers[targetId];
    if (targetSocket) {
      io.to(targetSocket).emit("call:ended");
    }
  });

  // ─── Disconnect ─────────────────────────────────────────────
  socket.on("disconnect", () => {
    const userId = Object.keys(onlineUsers).find(
      (id) => onlineUsers[id] === socket.id
    );
    if (userId) {
      delete onlineUsers[userId];
      io.emit("users:online", Object.keys(onlineUsers));
      console.log(`🔴 Offline: ${userId}`);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server port ${PORT} da ishlamoqda`));
