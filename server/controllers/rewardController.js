const User = require("../models/User");

exports.addReward = async (userId, type, percentage = 0) => {
    let coins = 0;

    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    if (type === "quiz") {
        if (percentage >= 80) coins = 20;
        else if (percentage >= 50) coins = 10;
        else coins = 0;
    }

    const today = new Date();
    const last = user.lastActiveDate ? new Date(user.lastActiveDate) : null;

    if (!last) {
        user.streak = 1;
    } else {
        const diff = Math.floor((today - last) / (1000 * 60 * 60 * 24));

        if (diff === 1) {
            user.streak += 1;
        } else if (diff > 1) {
            user.streak = 1;
        }
    }

    user.lastActiveDate = today;

    if (user.streak > 0 && user.streak % 5 === 0) {
        coins += 50;
    }

    user.coins += coins;

    await user.save();

    return {
        coinsEarned: coins,
        streak: user.streak,
        totalCoins: user.coins
    };
};