# Clean JSON API Responses

## Overview
All endpoints now return **clean, human-readable JSON** instead of raw blockchain objects. Videos include direct IPFS URLs for easy frontend integration.

---

## ✅ Video Endpoints

### 1. Upload Video
**POST** `/api/video/upload-video`

**Request:**
```bash
curl -X POST http://localhost:4000/api/video/upload-video \
  -F "file=@test.mp4" \
  -F "title=My Awesome Video" \
  -F "description=This is a great video about blockchain"
```

**Response (Clean JSON):**
```json
{
  "success": true,
  "video": {
    "id": 1,
    "cid": "QmWNLp4Vo4FrnCzwJYbsQjt2yeFHzgkH2cJMeYFvVjUfis",
    "title": "My Awesome Video",
    "description": "This is a great video about blockchain",
    "creator": "0x725e2ce1a9869698c840684828def3c663776877380c3020c8bbc51fae019f27",
    "txHash": "0xd11d46e13c8b8fc20a633a647f68752b22cb57ffa6fc7c6741b8ed6680a83b57",
    "created_at": "2025-11-30 12:30:45",
    "url": "https://ipfs.io/ipfs/QmWNLp4Vo4FrnCzwJYbsQjt2yeFHzgkH2cJMeYFvVjUfis"
  },
  "transaction": {
    "hash": "0xd11d46e13c8b8fc20a633a647f68752b22cb57ffa6fc7c6741b8ed6680a83b57",
    "sender": "0x725e2ce1a9869698c840684828def3c663776877380c3020c8bbc51fae019f27"
  }
}
```

---

### 2. List All Videos
**GET** `/api/video/list`

**Request:**
```bash
curl -X GET http://localhost:4000/api/video/list
```

**Response (Clean JSON Array):**
```json
{
  "success": true,
  "count": 3,
  "videos": [
    {
      "id": 1,
      "cid": "QmWNLp4Vo4FrnCzwJYbsQjt2yeFHzgkH2cJMeYFvVjUfis",
      "title": "My Awesome Video",
      "description": "This is a great video about blockchain",
      "creator": "0x725e2ce1a9869698c840684828def3c663776877380c3020c8bbc51fae019f27",
      "txHash": "0xd11d46e13c8b8fc20a633a647f68752b22cb57ffa6fc7c6741b8ed6680a83b57",
      "created_at": "2025-11-30 12:30:45",
      "url": "https://ipfs.io/ipfs/QmWNLp4Vo4FrnCzwJYbsQjt2yeFHzgkH2cJMeYFvVjUfis"
    },
    {
      "id": 2,
      "cid": "QmAbcDef123456789XYZ",
      "title": "Another Great Video",
      "description": "Learn about DeFi",
      "creator": "0x725e2ce1a9869698c840684828def3c663776877380c3020c8bbc51fae019f27",
      "txHash": "0xabc123def456...",
      "created_at": "2025-11-30 13:15:22",
      "url": "https://ipfs.io/ipfs/QmAbcDef123456789XYZ"
    }
  ]
}
```

**🎯 Frontend Usage:**
```javascript
// Fetch and display videos
fetch('http://localhost:4000/api/video/list')
  .then(res => res.json())
  .then(data => {
    data.videos.forEach(video => {
      console.log(`${video.title}: ${video.url}`);
      // Directly use video.url in <video> tag!
    });
  });
```

---

### 3. Get Video by ID
**GET** `/api/video/:id`

**Request:**
```bash
curl -X GET http://localhost:4000/api/video/1
```

**Response:**
```json
{
  "success": true,
  "video": {
    "id": 1,
    "cid": "QmWNLp4Vo4FrnCzwJYbsQjt2yeFHzgkH2cJMeYFvVjUfis",
    "title": "My Awesome Video",
    "description": "This is a great video about blockchain",
    "creator": "0x725e2ce1a9869698c840684828def3c663776877380c3020c8bbc51fae019f27",
    "txHash": "0xd11d46e13c8b8fc20a633a647f68752b22cb57ffa6fc7c6741b8ed6680a83b57",
    "created_at": "2025-11-30 12:30:45",
    "url": "https://ipfs.io/ipfs/QmWNLp4Vo4FrnCzwJYbsQjt2yeFHzgkH2cJMeYFvVjUfis"
  }
}
```

---

## ✅ Dashboard Endpoints

### 4. Creator Dashboard
**GET** `/api/dashboard/creator/:address`

**Request:**
```bash
curl -X GET http://localhost:4000/api/dashboard/creator/0x725e2ce1a9869698c840684828def3c663776877380c3020c8bbc51fae019f27
```

**Response (Clean Readable Data):**
```json
{
  "success": true,
  "creator": "0x725e2ce1a9869698c840684828def3c663776877380c3020c8bbc51fae019f27",
  "stats": {
    "totalVideos": 2,
    "balance": 5000,
    "balanceFormatted": "5000 APT"
  },
  "videos": [
    {
      "id": 1,
      "cid": "QmWNLp4Vo4FrnCzwJYbsQjt2yeFHzgkH2cJMeYFvVjUfis",
      "title": "My Awesome Video",
      "description": "This is a great video about blockchain",
      "creator": "0x725e2ce1a9869698c840684828def3c663776877380c3020c8bbc51fae019f27",
      "txHash": "0xd11d46e13c8b8fc20a633a647f68752b22cb57ffa6fc7c6741b8ed6680a83b57",
      "created_at": "2025-11-30 12:30:45",
      "url": "https://ipfs.io/ipfs/QmWNLp4Vo4FrnCzwJYbsQjt2yeFHzgkH2cJMeYFvVjUfis"
    },
    {
      "id": 2,
      "cid": "QmAbcDef123456789XYZ",
      "title": "Another Great Video",
      "description": "Learn about DeFi",
      "creator": "0x725e2ce1a9869698c840684828def3c663776877380c3020c8bbc51fae019f27",
      "txHash": "0xabc123def456...",
      "created_at": "2025-11-30 13:15:22",
      "url": "https://ipfs.io/ipfs/QmAbcDef123456789XYZ"
    }
  ]
}
```

**🎯 Frontend Usage:**
```javascript
// Creator Dashboard
fetch(`http://localhost:4000/api/dashboard/creator/${walletAddress}`)
  .then(res => res.json())
  .then(data => {
    console.log(`Total Videos: ${data.stats.totalVideos}`);
    console.log(`Balance: ${data.stats.balanceFormatted}`);
    
    // Display creator's videos
    data.videos.forEach(video => {
      displayVideo(video.title, video.url, video.description);
    });
  });
```

---

### 5. Platform Statistics
**GET** `/api/dashboard/stats`

**Request:**
```bash
curl -X GET http://localhost:4000/api/dashboard/stats
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalVideos": 10,
    "totalCreators": 5,
    "recentVideos": [
      {
        "id": 10,
        "cid": "QmLatestVideo123",
        "title": "Latest Upload",
        "description": "Just uploaded",
        "creator": "0xabc...",
        "txHash": "0xdef...",
        "created_at": "2025-11-30 15:30:00",
        "url": "https://ipfs.io/ipfs/QmLatestVideo123"
      }
      // ... 4 more recent videos
    ]
  }
}
```

---

## 🔥 Key Improvements

### Before (Raw Blockchain Objects):
```json
{
  "onChain": true,
  "resource": {
    "type": "0x725e2ce...::AdMarket::VideosTable",
    "data": {
      "videos": {
        "handle": "0x77cc4b3af78e47ec5fae1c992a7c32f847d7e485f..."
      }
    }
  }
}
```
❌ **Problem:** Frontend cannot use this directly!

---

### After (Clean, Human-Readable):
```json
{
  "success": true,
  "count": 2,
  "videos": [
    {
      "id": 1,
      "cid": "QmWNLp4Vo4FrnCzwJYbsQjt2yeFHzgkH2cJMeYFvVjUfis",
      "title": "My Video",
      "url": "https://ipfs.io/ipfs/QmWNLp4Vo4FrnCzwJYbsQjt2yeFHzgkH2cJMeYFvVjUfis"
    }
  ]
}
```
✅ **Solution:** Frontend can immediately use `video.url` in a `<video>` tag!

---

## 🎨 Frontend Integration Example

### React Component
```jsx
import { useState, useEffect } from 'react';

function VideoList() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    fetch('http://localhost:4000/api/video/list')
      .then(res => res.json())
      .then(data => setVideos(data.videos));
  }, []);

  return (
    <div>
      <h1>Videos ({videos.length})</h1>
      {videos.map(video => (
        <div key={video.id}>
          <h3>{video.title}</h3>
          <p>{video.description}</p>
          <video src={video.url} controls width="400" />
          <small>Uploaded: {video.created_at}</small>
        </div>
      ))}
    </div>
  );
}
```

---

## Summary of All Endpoints

| Endpoint | Method | Description | Response Type |
|----------|--------|-------------|---------------|
| `/api/video/upload-video` | POST | Upload video to IPFS + blockchain | Clean video object with URL |
| `/api/video/list` | GET | Get all videos | Array of videos with URLs |
| `/api/video/:id` | GET | Get single video by ID | Single video object with URL |
| `/api/dashboard/creator/:address` | GET | Get creator dashboard | Stats + video array with URLs |
| `/api/dashboard/stats` | GET | Get platform statistics | Overall stats + recent videos |
| `/api/campaign/create` | POST | Create ad campaign | Transaction result |
| `/api/attester/record` | POST | Record watch time | Transaction result |
| `/api/auth/register` | POST | Register new user | Success + user ID |
| `/api/auth/login` | POST | Login user | JWT token |

---

## 🚀 All responses now include:
- ✅ Clean, readable JSON
- ✅ Direct IPFS URLs (`https://ipfs.io/ipfs/...`)
- ✅ Human-readable fields
- ✅ No raw blockchain table handles
- ✅ Ready for frontend consumption
