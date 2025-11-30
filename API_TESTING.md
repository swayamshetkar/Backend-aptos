# API Testing Guide

## All cURL Commands for Testing Endpoints

### 1. Health Check
```bash
curl -X GET http://localhost:4000/
```

---

### 2. Authentication Endpoints

#### Register Attester User
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "attester1",
    "password": "password123",
    "roles": {
      "is_attester": true
    }
  }'
```

#### Register Creator User
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "creator1",
    "password": "password123",
    "roles": {
      "is_creator": true
    }
  }'
```

#### Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "attester1",
    "password": "password123"
  }'
```

**Save the token from response for authenticated requests:**
```bash
# Example response:
{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
```

---

### 3. Video Endpoints

#### Upload Video
```bash
curl -X POST http://localhost:4000/api/video/upload-video \
  -F "file=@test.mp4" \
  -F "title=My Test Video" \
  -F "description=This is a sample description"
```

#### List All Videos
```bash
curl -X GET http://localhost:4000/api/video/list
```

---

### 4. Campaign Endpoints

#### Create Campaign (requires authentication)
```bash
curl -X POST http://localhost:4000/api/campaign/create \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "video_id": 0,
    "budget": 1000000,
    "reward_per_second": 10
  }'
```

**Example with actual token:**
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X POST http://localhost:4000/api/campaign/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "video_id": 0,
    "budget": 1000000,
    "reward_per_second": 10
  }'
```

---

### 5. Attester Endpoints

#### Record Watch Time (requires attester role)
```bash
curl -X POST http://localhost:4000/api/attester/record \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "video_id": 0,
    "seconds": 120
  }'
```

**Example with actual token:**
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X POST http://localhost:4000/api/attester/record \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "video_id": 0,
    "seconds": 120
  }'
```

---

### 6. Dashboard Endpoints

#### Get Creator Dashboard
```bash
curl -X GET http://localhost:4000/api/dashboard/creator/0x725e2ce1a9869698c840684828def3c663776877380c3020c8bbc51fae019f27
```

**Replace with your creator address:**
```bash
CREATOR_ADDRESS="0x725e2ce1a9869698c840684828def3c663776877380c3020c8bbc51fae019f27"

curl -X GET "http://localhost:4000/api/dashboard/creator/$CREATOR_ADDRESS"
```

---

## Quick Test Workflow

### Step 1: Start the server
```bash
npm run dev
```

### Step 2: Register and login
```bash
# Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"attester1","password":"pass123","roles":{"is_attester":true}}'

# Login and save token
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"attester1","password":"pass123"}'

# Copy the token from response
```

### Step 3: Test authenticated endpoints
```bash
# Set your token
TOKEN="paste_your_token_here"

# Create campaign
curl -X POST http://localhost:4000/api/campaign/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"video_id":0,"budget":1000000,"reward_per_second":10}'

# Record watch time
curl -X POST http://localhost:4000/api/attester/record \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"video_id":0,"seconds":120}'
```

---

## Using the Bash Test Script

Make the script executable and run it:

```bash
chmod +x test-api.sh
./test-api.sh
```

**Note:** Make sure you have a `test.mp4` file in the same directory for the video upload test.

---

## Response Examples

### Successful Registration
```json
{"success":true,"userId":1}
```

### Successful Login
```json
{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhdHRlc3RlcjEiLCJyb2xlcyI6eyJpc19hdHRlc3RlciI6dHJ1ZX0sImlhdCI6MTYzODM2MDAwMCwiZXhwIjoxNjM4OTY0ODAwfQ.abc123..."}
```

### Successful Campaign Creation
```json
{"success":true,"tx":{"hash":"0xabc123...","sender":"0x725e2ce...","sequence_number":"12"}}
```

### Video List Response
```json
{
  "onChain": false,
  "data": [
    {
      "id": 1,
      "cid": "QmWNLp4Vo4FrnCzwJYbsQjt2yeFHzgkH2cJMeYFvVjUfis",
      "title": "Test Video",
      "description": "Sample",
      "creator": "0x725e2ce...",
      "txHash": "0xd11d46e...",
      "created_at": "2025-11-30 12:00:00"
    }
  ]
}
```

### Error Response (Missing Token)
```json
{"error":"missing token"}
```

### Error Response (Not Authorized)
```json
{"error":"not-authorized-as-attester"}
```
