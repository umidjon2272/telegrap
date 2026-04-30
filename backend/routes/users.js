const router = require("express").Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

// Foydalanuvchilarni qidirish (username yoki telefon)
router.get("/search", authMiddleware, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json([]);
    }

    const users = await User.find({
      $and: [
        { _id: { $ne: req.userId } }, // o'zini chiqarmasin
        {
          $or: [
            { username: { $regex: q, $options: "i" } },
            { phone: { $regex: q, $options: "i" } },
          ],
        },
      ],
    })
      .select("-password")
      .limit(10);

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server xatosi" });
  }
});

// O'z profilini ko'rish
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server xatosi" });
  }
});

module.exports = router;
