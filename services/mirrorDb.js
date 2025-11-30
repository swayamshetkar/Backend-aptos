// services/mirrorDb.js
const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

const DB_DIR = path.join(__dirname, "..", "db");
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const db = new Database(path.join(DB_DIR, "mirror.db"));

function init() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cid TEXT,
      title TEXT,
      description TEXT,
      creator TEXT,
      txHash TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      roles TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      video_id INTEGER,
      ad_cid TEXT,
      ad_title TEXT,
      budget INTEGER,
      reward_per_second INTEGER,
      advertiser TEXT,
      txHash TEXT,
      views INTEGER DEFAULT 0,
      total_watch_time INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (video_id) REFERENCES videos(id)
    );
    CREATE TABLE IF NOT EXISTS ad_views (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER,
      video_id INTEGER,
      viewer TEXT,
      watch_duration INTEGER,
      reward_earned INTEGER,
      viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
      FOREIGN KEY (video_id) REFERENCES videos(id)
    );
  `);
}
init();

// Videos
function insertVideo(v) {
  const stmt = db.prepare(`INSERT INTO videos (cid,title,description,creator,txHash) VALUES (@cid,@title,@description,@creator,@txHash)`);
  const info = stmt.run(v);
  return { id: info.lastInsertRowid, ...v };
}
function getAllVideos() {
  return db.prepare(`SELECT * FROM videos ORDER BY created_at DESC`).all();
}
function getVideosByCreator(creator) {
  return db.prepare(`SELECT * FROM videos WHERE creator = ? ORDER BY created_at DESC`).all(creator);
}

// Users
function insertUser({ username, password, roles = {} }) {
  const stmt = db.prepare(`INSERT INTO users (username,password,roles) VALUES (?, ?, ?)`);
  const info = stmt.run(username, password, JSON.stringify(roles));
  return { id: info.lastInsertRowid, username, roles };
}
function getUserByUsername(username) {
  const row = db.prepare(`SELECT * FROM users WHERE username = ?`).get(username);
  if (!row) return null;
  return { id: row.id, username: row.username, password: row.password, roles: JSON.parse(row.roles || "{}") };
}

// Campaigns
function insertCampaign({ video_id, ad_cid, ad_title, budget, reward_per_second, advertiser, txHash }) {
  const stmt = db.prepare(`INSERT INTO campaigns (video_id, ad_cid, ad_title, budget, reward_per_second, advertiser, txHash) VALUES (?, ?, ?, ?, ?, ?, ?)`);
  const info = stmt.run(video_id, ad_cid, ad_title, budget, reward_per_second, advertiser, txHash);
  return { id: info.lastInsertRowid, video_id, ad_cid, ad_title, budget, reward_per_second, advertiser, txHash };
}

function getCampaignByVideoId(video_id) {
  return db.prepare(`SELECT * FROM campaigns WHERE video_id = ? ORDER BY created_at DESC LIMIT 1`).get(video_id);
}

function getAllCampaigns() {
  return db.prepare(`SELECT * FROM campaigns ORDER BY created_at DESC`).all();
}

function updateCampaignViews(campaign_id, watch_duration) {
  const stmt = db.prepare(`UPDATE campaigns SET views = views + 1, total_watch_time = total_watch_time + ? WHERE id = ?`);
  stmt.run(watch_duration, campaign_id);
}

// Ad Views (for tracking rewards)
function insertAdView({ campaign_id, video_id, viewer, watch_duration, reward_earned }) {
  const stmt = db.prepare(`INSERT INTO ad_views (campaign_id, video_id, viewer, watch_duration, reward_earned) VALUES (?, ?, ?, ?, ?)`);
  const info = stmt.run(campaign_id, video_id, viewer, watch_duration, reward_earned);
  return { id: info.lastInsertRowid };
}

function getAdViewsByCampaign(campaign_id) {
  return db.prepare(`SELECT * FROM ad_views WHERE campaign_id = ? ORDER BY viewed_at DESC`).all(campaign_id);
}

function getDb() {
  return db;
}

module.exports = {
  insertVideo,
  getAllVideos,
  getVideosByCreator,
  insertUser,
  getUserByUsername,
  insertCampaign,
  getCampaignByVideoId,
  getAllCampaigns,
  updateCampaignViews,
  insertAdView,
  getAdViewsByCampaign,
  getDb
};
