const User = require("../models/User");

// Category → field mapping for "equippable" items
const EQUIP_MAP = {
  "theme-default": { field: "activeTheme", value: null },
  "theme-dark": { field: "activeTheme", value: "theme-dark" },
  "theme-neon":  { field: "activeTheme", value: "theme-neon"  },
  "avatar-ninja": { field: "activeAvatar", value: "avatar-ninja" },
  "avatar-king":  { field: "activeAvatar", value: "avatar-king"  },
};

exports.purchaseItem = async (req, res) => {
  try {
    const { id, title, cost, category } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check balance
    if (user.coins < cost) {
      return res.status(400).json({ success: false, message: "Not enough coins" });
    }

    // Guard against double-purchase (except Mystery & stackable items)
    const isStackable = id === "hint-pack";
    if (user.ownedItems.includes(id) && category !== "Mystery" && !isStackable) {
      return res.status(400).json({ success: false, message: "Item already owned" });
    }

    // Deduct coins
    user.coins -= cost;

    // ── Handle each category ──────────────────────────────────────────────────

    if (category === "Mystery") {
      // Pick a random non-owned item (or any item if all owned)
      const mysteryPool = ["theme-dark", "theme-neon", "avatar-ninja", "avatar-king", "hint-pack"];
      const available = mysteryPool.filter(
        (i) => !user.ownedItems.includes(i) || i === "hint-pack"
      );
      const wonId = available[Math.floor(Math.random() * available.length)] || mysteryPool[0];

      if (!user.ownedItems.includes(wonId)) {
        user.ownedItems.push(wonId);
      }

      // Auto-equip won theme/avatar
      if (EQUIP_MAP[wonId]) {
        user[EQUIP_MAP[wonId].field] = EQUIP_MAP[wonId].value;
      }

      // If it's hints, stack them
      if (wonId === "hint-pack") {
        user.hints = (user.hints || 0) + 5;
      }

      user.purchases.push({ itemId: id, title, cost, category, purchasedAt: new Date() });
      await user.save();

      return res.status(200).json({
        success: true,
        wonItemId: wonId,
        data: {
          coins: user.coins,
          ownedItems: user.ownedItems,
          purchases: user.purchases,
          activeTheme: user.activeTheme,
          activeAvatar: user.activeAvatar,
          hints: user.hints,
        },
        message: `Mystery Box opened! 🎁`,
      });
    }

    if (id === "hint-pack") {
      // Stackable — always add 5 hints (already owned is fine)
      user.hints = (user.hints || 0) + 5;
      if (!user.ownedItems.includes(id)) user.ownedItems.push(id);
    } else if (id === "quiz-premium") {
      if (!user.ownedItems.includes(id)) user.ownedItems.push(id);
    } else {
      // Theme / Avatar — own & auto-equip
      if (!user.ownedItems.includes(id)) user.ownedItems.push(id);
      if (EQUIP_MAP[id]) {
        user[EQUIP_MAP[id].field] = EQUIP_MAP[id].value;
      }
    }

    // Log purchase
    user.purchases.push({ itemId: id, title, cost, category, purchasedAt: new Date() });

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        coins: user.coins,
        ownedItems: user.ownedItems,
        purchases: user.purchases,
        activeTheme: user.activeTheme,
        activeAvatar: user.activeAvatar,
        hints: user.hints,
      },
      message: `${title} purchased successfully! 🎉`,
    });
  } catch (error) {
    console.error("Purchase error: ", error);
    res.status(500).json({ success: false, error: "Server error during purchase" });
  }
};

// ── EQUIP ITEM (theme / avatar from already-owned items) ────────────────────
exports.equipItem = async (req, res) => {
  try {
    const { id } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (!user.ownedItems.includes(id) && id !== 'theme-default')
      return res.status(400).json({ success: false, message: "Item not owned" });
    if (!EQUIP_MAP[id])
      return res.status(400).json({ success: false, message: "Item is not equippable" });

    user[EQUIP_MAP[id].field] = EQUIP_MAP[id].value;
    await user.save();

    res.status(200).json({
      success: true,
      data: { activeTheme: user.activeTheme, activeAvatar: user.activeAvatar },
      message: `${id} equipped!`,
    });
  } catch (error) {
    console.error("Equip error: ", error);
    res.status(500).json({ success: false, error: "Server error during equip" });
  }
};
