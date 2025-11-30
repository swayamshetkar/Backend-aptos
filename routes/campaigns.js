const express = require("express");
const router = express.Router();
const { submitEntryFunction, MODULE_ADDRESS } = require("../aptosClient");
const { authMiddleware } = require("./auth"); // optional: require auth or remove

/**
 * POST /api/campaign/create
 * body: { video_id, budget, reward_per_second }
 */
router.post("/create", authMiddleware, async (req, res) => {
  try {
    const { video_id, budget, reward_per_second } = req.body;
    if (video_id === undefined || budget === undefined || reward_per_second === undefined) {
      return res.status(400).json({ error: "video_id, budget and reward_per_second required" });
    }

    const func = `${MODULE_ADDRESS}::AdMarket::create_campaign`;
    // Move expects u64 - pass numbers
    const tx = await submitEntryFunction(func, [Number(video_id), Number(budget), Number(reward_per_second)]);
    return res.json({ success: true, tx });
  } catch (err) {
    console.error("POST /api/campaign/create error:", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
});

module.exports = router;
