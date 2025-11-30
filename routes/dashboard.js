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

    // Try to read on-chain balance (best effort)
    let balance = 0;
    let balanceData = null;
    
    try {
      const resourceType = `${MODULE_ADDRESS}::AdMarket::CreatorBalances`;
      const resource = await client.getAccountResource(MODULE_ADDRESS, resourceType);
      
      // If resource has data field with balance info, extract it
      if (resource && resource.data) {
        balanceData = resource.data;
        // Try to find balance for this creator
        if (balanceData.balances && typeof balanceData.balances === 'object') {
          balance = balanceData.balances[address] || 0;
        }
      }
    } catch (e) {
      // Silently fail - balance will be 0
      console.warn(`Could not fetch on-chain balance for ${address}:`, e.message);
    }

    return res.json({
      success: true,
      creator: address,
      stats: {
        totalVideos: videos.length,
        balance: balance,
        balanceFormatted: `${balance} APT`
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
