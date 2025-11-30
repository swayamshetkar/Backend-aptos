// routes/auth.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mirror = require("../services/mirrorDb");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const JWT_EXP = "7d";

router.post("/register", async (req, res) => {
  try {
    const { username, password, roles } = req.body;
    if (!username || !password) return res.status(400).json({ error: "username & password required" });

    const hashed = await bcrypt.hash(password, 10);
    const user = mirror.insertUser({ username, password: hashed, roles: roles || {} });
    return res.json({ success: true, userId: user.id });
  } catch (err) {
    console.error("POST /api/auth/register error:", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "username & password required" });

    const user = mirror.getUserByUsername(username);
    if (!user) return res.status(401).json({ error: "invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "invalid credentials" });

    const token = jwt.sign({ id: user.id, username: user.username, roles: user.roles }, JWT_SECRET, { expiresIn: JWT_EXP });
    return res.json({ token });
  } catch (err) {
    console.error("POST /api/auth/login error:", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
});

// Middleware to protect routes
function authMiddleware(req, res, next) {
  const h = req.headers.authorization;
  if (!h) return res.status(401).json({ error: "missing token" });
  const token = h.split(" ")[1];
  if (!token) return res.status(401).json({ error: "missing token" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: "invalid token" });
  }
}

module.exports = router;
module.exports.authMiddleware = authMiddleware;
