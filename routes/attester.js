const express = require("express");
const router = express.Router();
const { submitEntryFunction, MODULE_ADDRESS } = require("../aptosClient");
const { authMiddleware } = require("./auth");

/**
 * POST /api/attester/record
 * body: { video_id, seconds }
 * Auth: user with attester role should call (checked by authMiddleware & roles within token)
 */
router.post("/record", authMiddleware, async (req, res) => {
  try {
    // role check
    const user = req.user || {};
    if (!user.roles || !user.roles.is_attester) {
      return res.status(403).json({ error: "not-authorized-as-attester" });
    }

    const { video_id, seconds } = req.body;
    if (video_id === undefined || seconds === undefined) {
      return res.status(400).json({ error: "video_id and seconds required" });
    }

    const func = `${MODULE_ADDRESS}::AdMarket::record_watch_time`;
    const tx = await submitEntryFunction(func, [Number(video_id), Number(seconds)]);
    return res.json({ success: true, tx });
  } catch (err) {
    console.error("POST /api/attester/record error:", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
});

module.exports = router;
