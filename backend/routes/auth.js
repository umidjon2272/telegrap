const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, phone, password } = req.body;

    if (!username || !phone || !password) {
      return res.status(400).json({ message: "Barcha maydonlarni to'ldiring" });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { phone }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Username yoki telefon allaqachon mavjud" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ username, phone, password: hashedPassword });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(201).json({
      token,
      user: { _id: user._id, username: user.username, phone: user.phone },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server xatosi" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // identifier = username yoki telefon raqam
    const user = await User.findOne({
      $or: [{ username: identifier }, { phone: identifier }],
    });

    if (!user) {
      return res.status(400).json({ message: "Foydalanuvchi topilmadi" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Parol noto'g'ri" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.json({
      token,
      user: { _id: user._id, username: user.username, phone: user.phone },
    });
  } catch (err) {
    res.status(500).json({ message: "Server xatosi" });
  }
});

module.exports = router;
