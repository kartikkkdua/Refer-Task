const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { nanoid } = require("nanoid");
const User = require("../models/User");
const Config = require("../models/Config");
const Transaction = require("../models/Transaction");

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Missing fields" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Invalid credentials" });

    if (user.status !== "active")
      return res.status(403).json({ error: "Account is " + user.status });

    user.lastLogin = new Date();
    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      referralCode: user.referralCode,
      coins: user.coins,
      appliedReferral: user.appliedReferral,
      role: user.role,
      company: user.company,
      phone: user.phone,
      status: user.status,
      avatar: user.avatar,
      totalEarnings: user.totalEarnings,
      referralCount: user.referralCount,
      createdAt: user.createdAt
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, company, phone } = req.body;

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

    const user = new User({ 
      name, 
      email, 
      password: hashed, 
      referralCode: code,
      company: company || "",
      phone: phone || ""
    });
    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      referralCode: user.referralCode,
      coins: user.coins,
      appliedReferral: user.appliedReferral,
      role: user.role,
      company: user.company,
      phone: user.phone,
      status: user.status,
      avatar: user.avatar,
      totalEarnings: user.totalEarnings,
      referralCount: user.referralCount,
      createdAt: user.createdAt
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

    if (user.appliedReferral)
      return res.status(400).json({ error: "Already used a referral code" });

    if (user.referralCode === referralCode)
      return res.status(400).json({ error: "Cannot use own referral code" });

    const owner = await User.findOne({ referralCode });
    if (!owner) return res.status(400).json({ error: "Invalid referral code" });

    const cfg = await Config.findOne({ key: "referralReward" });
    const reward = cfg ? Number(cfg.value) : 0;

    // Reward both users
    user.coins += reward;
    user.totalEarnings += reward;
    user.appliedReferral = true;
    user.referredBy = referralCode;
    await user.save();

    owner.coins += reward;
    owner.totalEarnings += reward;
    owner.referralCount += 1;
    await owner.save();

    // Create transactions
    await Transaction.create({
      userId: user._id,
      type: "referral_applied",
      amount: reward,
      description: `Applied referral code ${referralCode}`,
      relatedUser: owner._id
    });

    await Transaction.create({
      userId: owner._id,
      type: "referral_earned",
      amount: reward,
      description: `${user.name} used your referral code`,
      relatedUser: user._id
    });

    res.json({ success: true, coins: user.coins, added: reward });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET REFERRAL STATS
router.get("/stats/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const referrals = await User.find({ referredBy: user.referralCode });
    
    res.json({
      totalReferrals: referrals.length,
      referredUsers: referrals.map(u => ({ name: u.name, coins: u.coins }))
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET LEADERBOARD
router.get("/leaderboard", async (req, res) => {
  try {
    const users = await User.find()
      .sort({ coins: -1 })
      .limit(10)
      .select("name coins referralCode company avatar");
    
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET USER PROFILE
router.get("/profile/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// UPDATE USER PROFILE
router.put("/profile/:userId", async (req, res) => {
  try {
    const { name, company, phone, avatar } = req.body;
    
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (name) user.name = name;
    if (company !== undefined) user.company = company;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      company: user.company,
      phone: user.phone,
      avatar: user.avatar
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET TRANSACTIONS
router.get("/transactions/:userId", async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("relatedUser", "name email");
    
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET ANALYTICS (Admin or own data)
router.get("/analytics/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const referrals = await User.find({ referredBy: user.referralCode });
    const transactions = await Transaction.find({ userId: user._id });

    const analytics = {
      totalReferrals: referrals.length,
      totalEarnings: user.totalEarnings,
      currentBalance: user.coins,
      averagePerReferral: referrals.length > 0 ? (user.totalEarnings / referrals.length).toFixed(2) : 0,
      recentActivity: transactions.slice(0, 5),
      monthlyStats: getMonthlyStats(transactions),
      topReferrals: referrals.sort((a, b) => b.coins - a.coins).slice(0, 5).map(r => ({
        name: r.name,
        coins: r.coins,
        joinedAt: r.createdAt
      }))
    };

    res.json(analytics);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ADMIN: GET ALL USERS
router.get("/admin/users", async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ADMIN: UPDATE USER STATUS
router.put("/admin/users/:userId/status", async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!["active", "inactive", "suspended"].includes(status))
      return res.status(400).json({ error: "Invalid status" });

    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.status = status;
    await user.save();

    res.json({ success: true, status: user.status });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ADMIN: GET DASHBOARD STATS
router.get("/admin/dashboard", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: "active" });
    const totalTransactions = await Transaction.countDocuments();
    const totalCoinsDistributed = await User.aggregate([
      { $group: { _id: null, total: { $sum: "$totalEarnings" } } }
    ]);

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email company createdAt");

    const topEarners = await User.find()
      .sort({ totalEarnings: -1 })
      .limit(5)
      .select("name email totalEarnings referralCount");

    res.json({
      totalUsers,
      activeUsers,
      totalTransactions,
      totalCoinsDistributed: totalCoinsDistributed[0]?.total || 0,
      recentUsers,
      topEarners
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

function getMonthlyStats(transactions) {
  const monthlyData = {};
  transactions.forEach(t => {
    const month = new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    if (!monthlyData[month]) monthlyData[month] = 0;
    monthlyData[month] += t.amount;
  });
  return monthlyData;
}

module.exports = router;
