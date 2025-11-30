# 📢 Advertisement Campaign Feature Guide

## Overview
Advertisers can now upload ad videos that play before main content, and creators earn APT tokens when viewers watch these ads!

---

## 🎯 How It Works

### For Advertisers:
1. **Upload Ad Video** - Upload your advertisement video to IPFS
2. **Select Target Video** - Choose which video to show your ad on
3. **Set Budget & Rewards** - Define campaign budget and creator earnings
4. **Launch Campaign** - Ad goes live on the blockchain

### For Creators:
- **Automatic Earnings** - Earn APT tokens when viewers watch ads on your videos
- **Per-Second Rewards** - Get paid based on how long viewers watch the ad
- **Real-time Tracking** - See earnings immediately after ad views

### For Viewers:
- **Ad Before Content** - Short ad plays before main video
- **Skip After 5 Seconds** - Can skip ad after 5 seconds
- **Creator Support** - Your watch time helps creators earn!

---

## 🚀 API Endpoints

### 1. Create Campaign with Ad Video
**POST** `/api/campaign/create`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Form Data:**
```
adFile: [video file]
video_id: 1
ad_title: "My Product Ad"
budget: 1000000
reward_per_second: 10
```

**Response:**
```json
{
  "success": true,
  "campaign": {
    "id": 1,
    "video_id": 1,
    "ad_cid": "QmAdVideoHash...",
    "ad_title": "My Product Ad",
    "ad_url": "https://ipfs.io/ipfs/QmAdVideoHash...",
    "budget": 1000000,
    "reward_per_second": 10,
    "advertiser": "0x123...",
    "views": 0,
    "total_watch_time": 0
  },
  "tx": {
    "hash": "0xabc..."
  }
}
```

---

### 2. Get Campaign for Video
**GET** `/api/campaign/:videoId`

**Example:** `/api/campaign/1`

**Response (Has Campaign):**
```json
{
  "success": true,
  "hasCampaign": true,
  "campaign": {
    "id": 1,
    "video_id": 1,
    "ad_cid": "QmAdVideoHash...",
    "ad_title": "My Product Ad",
    "ad_url": "https://ipfs.io/ipfs/QmAdVideoHash...",
    "budget": 1000000,
    "reward_per_second": 10,
    "views": 5,
    "total_watch_time": 120
  }
}
```

**Response (No Campaign):**
```json
{
  "success": true,
  "hasCampaign": false,
  "campaign": null
}
```

---

### 3. Track Ad View & Reward Creator
**POST** `/api/campaign/track-view`

**Body:**
```json
{
  "campaign_id": 1,
  "video_id": 1,
  "watch_duration": 15
}
```

**Response:**
```json
{
  "success": true,
  "reward_earned": 150,
  "message": "Creator earned 150 APT!"
}
```

---

### 4. List All Campaigns
**GET** `/api/campaign/list/all`

**Response:**
```json
{
  "success": true,
  "count": 2,
  "campaigns": [
    {
      "id": 1,
      "video_id": 1,
      "ad_title": "Product A",
      "ad_url": "https://ipfs.io/ipfs/Qm...",
      "budget": 1000000,
      "reward_per_second": 10,
      "views": 25,
      "total_watch_time": 500
    }
  ]
}
```

---

## 💻 Frontend Usage

### Create Campaign (Advertiser Page)

```javascript
// HTML Form
<form id="campaignForm">
  <input type="file" id="adFile" accept="video/*" required>
  <input type="text" id="adTitle" placeholder="Ad Title" required>
  <input type="number" id="campaignVideoId" placeholder="Video ID" required>
  <input type="number" id="campaignBudget" placeholder="Budget" required>
  <input type="number" id="campaignReward" placeholder="Reward/sec" required>
  <button type="submit">Create Campaign</button>
</form>

// JavaScript
const formData = new FormData();
formData.append('adFile', adFileInput.files[0]);
formData.append('video_id', videoId);
formData.append('ad_title', adTitle);
formData.append('budget', budget);
formData.append('reward_per_second', reward);

const response = await fetch('http://localhost:4000/api/campaign/create', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

---

### Video Player with Ad (Consumer Page)

```javascript
async function openVideoModal(videoId) {
  // 1. Load video data
  const video = await fetchVideo(videoId);
  
  // 2. Check for campaign
  const campaign = await fetchCampaign(videoId);
  
  if (campaign.hasCampaign) {
    // Show ad first
    showAdPlayer(campaign.campaign);
  } else {
    // Show main video directly
    showMainPlayer(video);
  }
}

function showAdPlayer(campaign) {
  adPlayer.src = campaign.ad_url;
  adPlayer.play();
  
  // Track start time
  adStartTime = Date.now();
  
  // Show skip after 5 seconds
  setTimeout(() => showSkipButton(), 5000);
  
  // When ad ends, track view and show main video
  adPlayer.onended = async () => {
    await trackAdView();
    showMainPlayer();
  };
}

async function trackAdView() {
  const watchDuration = (Date.now() - adStartTime) / 1000;
  
  const response = await fetch('http://localhost:4000/api/campaign/track-view', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      campaign_id: currentCampaign.id,
      video_id: currentVideo.id,
      watch_duration: watchDuration
    })
  });
  
  const data = await response.json();
  console.log(`Creator earned ${data.reward_earned} APT!`);
}
```

---

## 📊 Database Schema

### Campaigns Table
```sql
CREATE TABLE campaigns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  video_id INTEGER,
  ad_cid TEXT,               -- IPFS hash of ad video
  ad_title TEXT,             -- Ad title
  budget INTEGER,            -- Campaign budget
  reward_per_second INTEGER, -- Creator earnings per second
  advertiser TEXT,           -- Advertiser wallet address
  txHash TEXT,               -- Blockchain transaction hash
  views INTEGER DEFAULT 0,   -- Total ad views
  total_watch_time INTEGER DEFAULT 0, -- Total seconds watched
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (video_id) REFERENCES videos(id)
);
```

### Ad Views Table
```sql
CREATE TABLE ad_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campaign_id INTEGER,
  video_id INTEGER,
  viewer TEXT,               -- Viewer wallet (or 'anonymous')
  watch_duration INTEGER,    -- Seconds watched
  reward_earned INTEGER,     -- APT earned by creator
  viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
  FOREIGN KEY (video_id) REFERENCES videos(id)
);
```

---

## 🧪 Testing Workflow

### 1. Create a Campaign

```bash
# Upload ad video and create campaign
curl -X POST http://localhost:4000/api/campaign/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "adFile=@my_ad.mp4" \
  -F "video_id=1" \
  -F "ad_title=Amazing Product" \
  -F "budget=1000000" \
  -F "reward_per_second=10"
```

**Expected Response:**
```json
{
  "success": true,
  "campaign": {
    "id": 1,
    "ad_url": "https://ipfs.io/ipfs/Qm..."
  }
}
```

---

### 2. Check Campaign for Video

```bash
curl http://localhost:4000/api/campaign/1
```

**Expected Response:**
```json
{
  "success": true,
  "hasCampaign": true,
  "campaign": {
    "ad_title": "Amazing Product",
    "ad_url": "https://ipfs.io/ipfs/Qm...",
    "reward_per_second": 10
  }
}
```

---

### 3. Watch Video (Frontend)

1. Open video on consumer page
2. Ad plays automatically
3. Skip button appears after 5 seconds
4. When ad ends or is skipped, main video plays
5. Creator earnings are displayed

---

### 4. Track Ad View

```bash
curl -X POST http://localhost:4000/api/campaign/track-view \
  -H "Content-Type: application/json" \
  -d '{
    "campaign_id": 1,
    "video_id": 1,
    "watch_duration": 15
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "reward_earned": 150,
  "message": "Creator earned 150 APT!"
}
```

---

## 💡 Key Features

### ✅ Implemented:
- **Ad Video Upload** - Advertisers upload ad videos to IPFS
- **Campaign Creation** - Store campaign data on blockchain + mirror DB
- **Ad Playback** - Ads play before main content
- **Skip Functionality** - Users can skip after 5 seconds
- **Creator Rewards** - Automatic APT earnings calculation
- **View Tracking** - Track watch time and views
- **Real-time Earnings** - Show creator earnings after ad

### 🎨 UI Features:
- **Advertisement Indicator** - Clear "Advertisement" banner
- **Skip Button** - Appears after 5 seconds
- **Earnings Display** - Shows how much creator earned
- **Reward Info** - Displays per-second reward rate
- **Progress Feedback** - Upload progress for ads

---

## 📈 Example Earnings Calculation

**Campaign Settings:**
- Reward per second: **10 APT**

**Viewer Behavior:**
- Watches ad for **15 seconds**

**Creator Earnings:**
```
15 seconds × 10 APT/second = 150 APT earned
```

---

## 🔄 Complete User Flow

### Advertiser Flow:
1. Go to Advertisement page
2. Upload ad video (e.g., `product_ad.mp4`)
3. Enter ad title: "Buy Our Product!"
4. Select target video ID: `1`
5. Set budget: `1000000 APT`
6. Set reward: `10 APT/second`
7. Click "Upload Ad & Create Campaign"
8. ✅ Campaign created, ad on IPFS

### Viewer Flow:
1. Go to Consumer (Watch Videos) page
2. Click on video with campaign
3. 📢 Ad plays automatically
4. ⏳ Skip button appears after 5 seconds
5. Option to skip or watch full ad
6. ✅ Main video plays
7. See "Creator earned X APT" message

### Creator Flow:
1. Upload videos normally
2. ✅ Automatic earnings when viewers watch ads
3. Check dashboard for earnings
4. Earn more as more viewers watch!

---

## 🎉 Benefits

**For Advertisers:**
- Direct promotion to engaged viewers
- Transparent view tracking
- Blockchain-secured campaigns

**For Creators:**
- Passive income from ad views
- Per-second payment model
- No manual claim needed

**For Viewers:**
- Support creators by watching
- Skip option after 5 seconds
- Know creators are earning

---

## 🚀 Next Steps

### Potential Enhancements:
1. **Multiple Campaigns** - Allow multiple ads per video
2. **Campaign Analytics** - Detailed performance metrics
3. **Ad Targeting** - Target by viewer demographics
4. **Budget Management** - Auto-pause when budget depletes
5. **Creator Dashboard** - Show ad earnings breakdown
6. **Viewer Rewards** - Reward viewers for watching ads

---

## 📞 Support

All features are now live! Test the complete flow:
1. Create campaign with ad video
2. Watch video as consumer
3. See ad play before main content
4. Track creator earnings

**Happy advertising!** 📢💰
