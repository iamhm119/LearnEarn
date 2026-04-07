const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  generateCertificate,
  getUserCertificates,
  verifyCertificate,
  emailCertificate,
} = require("../controllers/certificateController");

router.post("/generate/:courseId", auth, generateCertificate);
router.post("/:certificateId/email", auth, emailCertificate);
router.get("/user", auth, getUserCertificates);
router.get("/verify/:certificateId", verifyCertificate); // public

module.exports = router;
