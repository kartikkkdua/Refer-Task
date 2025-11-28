const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { nanoid } = require("nanoid");
const User = require("../models/User");
const Config = require("../models/Config");

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: "Missing fields" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);

    // generate referral code
    let code;
    do {
      code = nanoid(8).toUpperCase();
    } while (await User.findOne({ referralCode: code }));

    const user = new User({ name, email, password: hashed, referralCode: code });
    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      referralCode: user.referralCode,
      coins: user.coins
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// APPLY REFERRAL
router.post("/apply-referral", async (req, res) => {
  try {
    const { userId, referralCode } = req.body;

    if (!userId || !referralCode)
      return res.status(400).json({ error: "Missing fields" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.referralCode === referralCode)
      return res.status(400).json({ error: "Cannot use own referral code" });

    const owner = await User.findOne({ referralCode });
    if (!owner) return res.status(400).json({ error: "Invalid referral code" });

    const cfg = await Config.findOne({ key: "referralReward" });
    const reward = cfg ? Number(cfg.value) : 0;

    user.coins += reward;
    await user.save();

    res.json({ success: true, coins: user.coins, added: reward });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
