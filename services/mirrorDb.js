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

module.exports = {
  insertVideo,
  getAllVideos,
  getVideosByCreator,
  insertUser,
  getUserByUsername
};
