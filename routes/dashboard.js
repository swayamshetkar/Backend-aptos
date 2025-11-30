// routes/dashboard.js
const express = require("express");
const router = express.Router();
const mirror = require("../services/mirrorDb");
const { client, MODULE_ADDRESS } = require("../aptosClient");

// Helper to add IPFS URL to video object
function enrichVideoWithUrl(video) {
  return {
    ...video,
    url: `https://ipfs.io/ipfs/${video.cid}`
  };
}

/**
 * GET /api/dashboard/creator/:address
 * Returns clean, readable creator dashboard with videos and balance
 */
router.get("/creator/:address", async (req, res) => {
  try {
    const address = req.params.address;
    const videosRaw = mirror.getVideosByCreator(address);
    
    // Enrich videos with IPFS URLs
    const videos = videosRaw.map(enrichVideoWithUrl);

    // Calculate total balance from ad_views for this creator's videos
    let totalUnits = 0;
    const db = mirror.getDb();
    
    try {
      // Sum all rewards earned from ad views on this creator's videos
      const stmt = db.prepare(`
        SELECT COALESCE(SUM(av.reward_earned), 0) as total
        FROM ad_views av
        JOIN campaigns c ON av.campaign_id = c.id
        JOIN videos v ON c.video_id = v.id
        WHERE v.creator = ?
      `);
      
      const result = stmt.get(address);
      totalUnits = result ? result.total : 0;
    } catch (e) {
      console.warn(`Could not calculate balance for ${address}:`, e.message);
    }

    // Convert units to APT (assuming 1 unit = 0.00001 APT for display)
    // In reality, these are just tracking units, not actual transferred APT
    const balanceInAPT = (totalUnits / 100000).toFixed(5);

    return res.json({
      success: true,
      creator: address,
      stats: {
        totalVideos: videos.length,
        balance: balanceInAPT,
        balanceUnits: totalUnits,
        balanceFormatted: `${balanceInAPT} APT (${totalUnits} units tracked)`
      },
      videos
    });
  } catch (err) {
    console.error("GET /api/dashboard/creator error:", err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

/**
 * GET /api/dashboard/stats
 * Returns overall platform statistics
 */
router.get("/stats", async (req, res) => {
  try {
    const allVideos = mirror.getAllVideos();
    
    // Calculate unique creators
    const uniqueCreators = new Set(allVideos.map(v => v.creator));
    
    return res.json({
      success: true,
      stats: {
        totalVideos: allVideos.length,
        totalCreators: uniqueCreators.size,
        recentVideos: allVideos.slice(0, 5).map(enrichVideoWithUrl)
      }
    });
  } catch (err) {
    console.error("GET /api/dashboard/stats error:", err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

module.exports = router;
