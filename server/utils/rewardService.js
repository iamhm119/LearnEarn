const User = require("../models/User");

/**
 * Compute level string from XP value
 */
const computeLevel = (xp) => {
  if (xp >= 500) return "Advanced";
  if (xp >= 200) return "Intermediate";
  return "Beginner";
};

/**
 * Add rewards after quiz submission.
 * - XP: 50 base, +100 bonus if percentage >= 80
 * - Coins: 20 if >= 80%, 10 if >= 50%, 0 otherwise
 * - Streak: increment if percentage >= 50%, RESET if below 50%
 */
exports.addReward = async (userId, type, percentage = 0) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  let xpEarned = 0;
  let coinsEarned = 0;

  if (type === "quiz") {
    // XP rewards
    xpEarned = 50;
    if (percentage >= 80) xpEarned += 100;

    // Coin rewards
    if (percentage >= 80) coinsEarned = 20;
    else if (percentage >= 50) coinsEarned = 10;
    else coinsEarned = 0;

    // Streak logic — only grows on pass (>=50%)
    const today = new Date();
    const lastDate = user.lastStreakDate ? new Date(user.lastStreakDate) : null;

    if (percentage >= 50) {
      // Check if we already incremented today
      const sameDay =
        lastDate &&
        lastDate.toDateString() === today.toDateString();
      if (!sameDay) {
        user.streak = (user.streak || 0) + 1;
        user.lastStreakDate = today;
      }
    } else {
      // Fail → reset streak
      user.streak = 0;
      user.lastStreakDate = null;
    }
  }

  // Apply gains
  user.xp = (user.xp || 0) + xpEarned;
  user.coins = (user.coins || 0) + coinsEarned;

  // Update level
  user.level = computeLevel(user.xp);

  await user.save();

  return {
    xpEarned,
    coinsEarned,
    totalXp: user.xp,
    totalCoins: user.coins,
    level: user.level,
    streak: user.streak,
  };
};

exports.computeLevel = computeLevel;