const express = require('express');
const router = express.Router();
const { register, login, verifyToken, forgotPassword, resetPassword } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post("/register", register);
router.post("/login", login);
router.get("/verify", authMiddleware, verifyToken);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resettoken", resetPassword);

module.exports = router;