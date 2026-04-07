const User = require("../models/User");

// GET /api/leaderboard — top 10 + requesting user rank
exports.getLeaderboard = async (req, res) => {
  try {
    const top10 = await User.find({ isActive: true })
      .select("name email xp coins level streak badges")
      .sort({ xp: -1, coins: -1 })
      .limit(10)
      .lean();

    // Add rank
    const ranked = top10.map((user, i) => ({
      ...user,
      rank: i + 1,
    }));

    // Find requesting user's rank if authenticated
    let userRank = null;
    if (req.user) {
      const totalAbove = await User.countDocuments({
        isActive: true,
        $or: [
          { xp: { $gt: (await User.findById(req.user.id).select("xp").lean())?.xp || 0 } },
        ],
      });

      const currentUser = await User.findById(req.user.id)
        .select("name xp coins level streak")
        .lean();

      if (currentUser) {
        userRank = {
          ...currentUser,
          rank: totalAbove + 1,
          isCurrentUser: true,
        };
      }
    }

    res.json({ success: true, leaderboard: ranked, userRank });
  } catch (err) {
    console.error("getLeaderboard error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};
