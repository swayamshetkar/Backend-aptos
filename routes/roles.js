const express = require("express");
const { runEntryFunction } = require("../aptosClient");

const router = express.Router();

router.post("/register_creator", async (req, res) => {
  try {
    const tx = await runEntryFunction("register_creator", []);
    res.json({ aptos: tx });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/register_advertiser", async (req, res) => {
  try {
    const tx = await runEntryFunction("register_advertiser", []);
    res.json({ aptos: tx });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/add_attester", express.json(), async (req, res) => {
  try {
    const { attester_address } = req.body;
    const tx = await runEntryFunction("add_attester", [attester_address]);
    res.json({ aptos: tx });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
