# 💰 Low Budget Campaign Setup Guide

## Your Situation: 2 APT Balance

Since you have only **2 APT**, here are realistic campaign parameters:

---

## ✅ Recommended Campaign Settings

### Option 1: Basic Campaign
```
Video ID: 1
Ad Title: "Test Advertisement"
Budget: 100 (0.0001 APT in smallest units)
Reward per Second: 1
```

**This means:**
- Total budget: 100 units
- Creator earns: 1 unit per second of ad watch time
- Can support: ~100 seconds of total ad views
- If ad is 10 seconds: Supports ~10 complete views

---

### Option 2: Micro Campaign
```
Video ID: 1
Ad Title: "Quick Ad Test"
Budget: 50
Reward per Second: 1
```

**This means:**
- Total budget: 50 units
- Creator earns: 1 unit per second
- Can support: ~50 seconds of total ad views
- Perfect for testing!

---

### Option 3: Ultra-Light
```
Video ID: 1
Ad Title: "Demo Ad"
Budget: 10
Reward per Second: 1
```

**This means:**
- Total budget: 10 units
- Creator earns: 1 unit per second
- Can support: ~10 seconds of total ad views
- Great for quick tests

---

## 🎯 Frontend Form Inputs

When creating a campaign on the Advertisement page, enter:

### For Testing:
```
Advertisement Video: [Upload small ad video - 5-10 seconds]
Advertisement Title: Test Ad
Target Video ID: 1
Budget (APT): 10
Reward per Second: 1
```

---

## 📱 Using cURL Command

```bash
# Login first to get token
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"attester1","password":"password123"}'

# Copy the token from response

# Create campaign with small budget
curl -X POST http://localhost:4000/api/campaign/create \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "adFile=@test_ad.mp4" \
  -F "video_id=1" \
  -F "ad_title=Test Ad" \
  -F "budget=10" \
  -F "reward_per_second=1"
```

---

## 💡 Understanding the Numbers

The blockchain works in **smallest units** (like satoshis for Bitcoin):

- **1 APT** = Many smaller units on-chain
- For testing, we use small numbers directly
- Budget and rewards are in these small units

### Example Calculation:
```
Budget: 10
Reward per second: 1

Total watch time supported: 10 seconds
If 2 viewers watch 5 seconds each: 2 × 5 × 1 = 10 units (budget exhausted)
```

---

## 🧪 Test Workflow with Low Budget

### Step 1: Create Campaign
```
Frontend → Advertisement Page
- Upload small 5-10 second ad video
- Title: "Test Ad"
- Video ID: 1
- Budget: 10
- Reward: 1
- Click "Upload Ad & Create Campaign"
```

### Step 2: Watch Video
```
Frontend → Watch Videos Page
- Click on Video ID 1
- Ad plays automatically
- Watch for 5 seconds (or skip after 5 sec)
- Main video plays
- See: "Creator earned 5 units!"
```

### Step 3: Check Remaining Budget
```
After 1 view (5 seconds watched):
Remaining budget: 10 - 5 = 5 units left
Can support 1 more 5-second view
```

---

## ⚠️ Important Notes

1. **Start Small**: Use budget of 10-50 for testing
2. **Short Ad Videos**: Keep ads 5-10 seconds
3. **Low Reward Rate**: Use 1 unit per second
4. **Test First**: Don't waste your 2 APT on large campaigns

---

## 🎮 Practical Testing Example

### Test Campaign:
```json
{
  "video_id": 1,
  "ad_title": "My Product",
  "budget": 20,
  "reward_per_second": 1
}
```

### Expected Behavior:
- **Ad plays**: 5 seconds
- **Creator earns**: 5 units
- **Budget left**: 15 units
- **More views possible**: Yes (15 ÷ 1 = 15 seconds left)

---

## 🔥 Quick Start Commands

### 1. Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"attester1","password":"password123"}'
```

### 2. Create Low-Budget Campaign
```bash
# Save token first: TOKEN="your_token_here"

curl -X POST http://localhost:4000/api/campaign/create \
  -H "Authorization: Bearer $TOKEN" \
  -F "adFile=@test_ad.mp4" \
  -F "video_id=1" \
  -F "ad_title=Quick Test" \
  -F "budget=10" \
  -F "reward_per_second=1"
```

### 3. Check Campaign
```bash
curl http://localhost:4000/api/campaign/1
```

---

## 📊 Budget Planning

### With 2 APT Available:

**Safe Testing:**
- Create 5-10 micro campaigns (budget: 10 each)
- Test different ad videos
- Test different target videos
- Learn the system without spending much

**Production:**
- Once tested, create real campaigns
- Use higher budgets (100-1000)
- Set appropriate rewards (5-10 per second)

---

## ✅ Recommended First Test

```
1. Upload a 5-second ad video
2. Create campaign:
   - Video ID: 1
   - Budget: 10
   - Reward: 1
3. Watch video as consumer
4. Verify ad plays
5. Check creator earnings (should show "5 units")
```

---

## 🎉 Summary

**For your 2 APT balance, use these values:**

✅ **Budget**: 10-20 (for testing)
✅ **Reward per second**: 1
✅ **Ad length**: 5-10 seconds
✅ **Target video**: Any video ID (usually 1)

This way you can test the full feature without spending your APT!

**Start with budget=10, reward=1 for your first test!** 🚀
