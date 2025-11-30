const express = require("express");
const multer = require("multer");
const { addFileToIpfs } = require("../ipfsClient");
const { uploadVideoToAptos, client, MODULE_ADDRESS, signer } = require("../aptosClient");
const mirror = require("../services/mirrorDb");

const router = express.Router();

const upload = multer({ dest: "uploads/" }); // temp storage

// Helper to add IPFS URL to video object
function enrichVideoWithUrl(video) {
  return {
    ...video,
    url: `https://ipfs.io/ipfs/${video.cid}`
  };
}

router.post("/upload-video", upload.single("file"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "No file uploaded" });

    const { title, description } = req.body;

    // 1️⃣ Upload to IPFS
    const ipfsResult = await addFileToIpfs(req.file.path, req.file.originalname);
    const cid = ipfsResult.Hash;   // IPFS returns { Hash, Name, Size }

    // 2️⃣ Call Aptos smart contract (creator upload)
    const tx = await uploadVideoToAptos(cid, title, description);

    // 3️⃣ Store in mirror DB for fast retrieval
    const creatorAddress = signer ? signer.address().hex() : MODULE_ADDRESS;
    const videoRecord = mirror.insertVideo({
      cid,
      title,
      description,
      creator: creatorAddress,
      txHash: tx.hash
    });

    // Return clean JSON with IPFS URL
    res.json({
      success: true,
      video: enrichVideoWithUrl(videoRecord),
      transaction: {
        hash: tx.hash,
        sender: tx.sender
      }
    });

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/video/list
 * Returns clean, readable video list with IPFS URLs
 */
router.get("/list", async (req, res) => {
  try {
    // Get videos from mirror DB (reliable and fast)
    const rows = mirror.getAllVideos();
    
    // Enrich with IPFS URLs
    const videos = rows.map(enrichVideoWithUrl);
    
    return res.json({
      success: true,
      count: videos.length,
      videos
    });
  } catch (err) {
    console.error("GET /api/video/list error:", err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

/**
 * GET /api/video/:id
 * Get a single video by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const videoId = parseInt(req.params.id);
    const rows = mirror.getAllVideos();
    const video = rows.find(v => v.id === videoId);
    
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }
    
    return res.json({
      success: true,
      video: enrichVideoWithUrl(video)
    });
  } catch (err) {
    console.error("GET /api/video/:id error:", err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

module.exports = router;
