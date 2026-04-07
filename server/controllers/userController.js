const User = require("../models/User");

exports.getLeaderboard = async (req, res) => {
    const users = await User.find().sort({ coins: -1 }).limit(10);
    res.json(users);
};