const express = require("express");
const { purchaseItem, equipItem } = require("../controllers/storeController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/purchase", auth, purchaseItem);
router.post("/equip", auth, equipItem);

module.exports = router;
