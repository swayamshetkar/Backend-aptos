const express = require("express");
const multer = require("multer");
const router = express.Router();
const { submitEntryFunction, MODULE_ADDRESS, signer } = require("../aptosClient");
const { authMiddleware } = require("./auth");
const { addFileToIpfs } = require("../ipfsClient");
const mirror = require("../services/mirrorDb");

const upload = multer({ dest: "uploads/" });

/**
 * POST /api/campaign/create
 * Upload ad video and create campaign
 * Form data: file (ad video), video_id, ad_title, budget, reward_per_second
 */
router.post("/create", authMiddleware, upload.single("adFile"), async (req, res) => {
  try {
    const { video_id, ad_title, budget, reward_per_second } = req.body;
    
    if (video_id === undefined || budget === undefined || reward_per_second === undefined) {
      return res.status(400).json({ error: "video_id, budget and reward_per_second required" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Advertisement video file is required" });
    }

    // 1. Upload ad video to IPFS
    const ipfsResult = await addFileToIpfs(req.file.path, req.file.originalname);
    const ad_cid = ipfsResult.Hash;

    // 2. Create campaign on blockchain
    const func = `${MODULE_ADDRESS}::AdMarket::create_campaign`;
    const tx = await submitEntryFunction(func, [Number(video_id), Number(budget), Number(reward_per_second)]);

    // 3. Store campaign in mirror DB with ad CID
    const advertiserAddress = signer ? signer.address().hex() : MODULE_ADDRESS;
    const campaign = mirror.insertCampaign({
      video_id: Number(video_id),
      ad_cid,
      ad_title: ad_title || "Advertisement",
      budget: Number(budget),
      reward_per_second: Number(reward_per_second),
      advertiser: advertiserAddress,
      txHash: tx.hash
    });

    return res.json({ 
      success: true, 
      campaign: {
        ...campaign,
        ad_url: `https://ipfs.io/ipfs/${ad_cid}`
      },
      tx 
    });
  } catch (err) {
    console.error("POST /api/campaign/create error:", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
});

/**
 * GET /api/campaign/:videoId
 * Get campaign for a specific video including ad details
 */
router.get("/:videoId", async (req, res) => {
  try {
    const videoId = parseInt(req.params.videoId);
    const campaign = mirror.getCampaignByVideoId(videoId);

    if (!campaign) {
      return res.json({ success: true, hasCampaign: false, campaign: null });
    }

    return res.json({
      success: true,
      hasCampaign: true,
      campaign: {
        ...campaign,
        ad_url: `https://ipfs.io/ipfs/${campaign.ad_cid}`
      }
    });
  } catch (err) {
    console.error("GET /api/campaign/:videoId error:", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
});

/**
 * GET /api/campaign/list/all
 * Get all campaigns
 */
router.get("/list/all", async (req, res) => {
  try {
    const campaigns = mirror.getAllCampaigns();
    const enriched = campaigns.map(c => ({
      ...c,
      ad_url: `https://ipfs.io/ipfs/${c.ad_cid}`
    }));

    return res.json({
      success: true,
      count: enriched.length,
      campaigns: enriched
    });
  } catch (err) {
    console.error("GET /api/campaign/list/all error:", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
});

/**
 * POST /api/campaign/track-view
 * Track ad view and reward creator
 * body: { campaign_id, video_id, watch_duration }
 */
router.post("/track-view", async (req, res) => {
  try {
    const { campaign_id, video_id, watch_duration } = req.body;

    if (!campaign_id || !video_id || watch_duration === undefined) {
      return res.status(400).json({ error: "campaign_id, video_id, and watch_duration required" });
    }

    const campaign = mirror.getCampaignByVideoId(video_id);
    if (!campaign) {
      return res.json({ success: false, error: "Campaign not found" });
    }

    // Calculate reward
    const reward_earned = Math.floor(watch_duration * campaign.reward_per_second);

    // Update campaign stats
    mirror.updateCampaignViews(campaign_id, watch_duration);

    // Track this view
    mirror.insertAdView({
      campaign_id,
      video_id,
      viewer: "anonymous", // In real app, get from wallet
      watch_duration,
      reward_earned
    });

    return res.json({
      success: true,
      reward_earned,
      message: `Creator earned ${reward_earned} APT!`
    });
  } catch (err) {
    console.error("POST /api/campaign/track-view error:", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
});

module.exports = router;
