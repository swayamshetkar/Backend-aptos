const express = require("express");
const { runEntryFunction, viewFunction } = require("../aptosClient");

const router = express.Router();

router.post("/withdraw", async (req, res) => {
  try {
    const tx = await runEntryFunction("withdraw_rewards", []);
    res.json({ aptos: tx });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/balance/:addr", async (req, res) => {
  try {
    const addr = req.params.addr;
    const view = await viewFunction("get_creator_balance", [addr]);
    res.json({ balance: view });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
