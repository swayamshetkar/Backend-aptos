#!/bin/bash

# Test Script for AdMarket Backend API
# Run this script to test all endpoints

BASE_URL="http://localhost:4000"
TOKEN=""

echo "========================================="
echo "AdMarket Backend API Test Script"
echo "========================================="
echo ""

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Health Check
echo -e "${BLUE}1. Testing Health Check${NC}"
curl -X GET "$BASE_URL/" 
echo -e "\n"

# 2. Register User (Attester)
echo -e "${BLUE}2. Registering Attester User${NC}"
curl -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "attester1",
    "password": "password123",
    "roles": {
      "is_attester": true
    }
  }'
echo -e "\n"

# 3. Register User (Creator)
echo -e "${BLUE}3. Registering Creator User${NC}"
curl -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "creator1",
    "password": "password123",
    "roles": {
      "is_creator": true
    }
  }'
echo -e "\n"

# 4. Login as Attester
echo -e "${BLUE}4. Logging in as Attester${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "attester1",
    "password": "password123"
  }')
echo "$LOGIN_RESPONSE"
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo -e "${GREEN}Token saved: $TOKEN${NC}"
echo -e "\n"

# 5. Upload Video (requires test.mp4 file in current directory)
echo -e "${BLUE}5. Uploading Video${NC}"
if [ -f "test.mp4" ]; then
  UPLOAD_RESPONSE=$(curl -s -X POST "$BASE_URL/api/video/upload-video" \
    -F "file=@test.mp4" \
    -F "title=Test Video" \
    -F "description=This is a test video for AdMarket")
  echo "$UPLOAD_RESPONSE"
  echo -e "${GREEN}Video uploaded successfully!${NC}"
else
  echo -e "${RED}test.mp4 not found. Skipping video upload.${NC}"
fi
echo -e "\n"

# 6. List Videos
echo -e "${BLUE}6. Listing All Videos (Clean JSON)${NC}"
curl -X GET "$BASE_URL/api/video/list"
echo -e "\n"

# 7. Get Single Video by ID
echo -e "${BLUE}7. Getting Video by ID${NC}"
curl -X GET "$BASE_URL/api/video/1"
echo -e "\n"

# 8. Create Campaign (requires authentication)
echo -e "${BLUE}8. Creating Campaign${NC}"
curl -X POST "$BASE_URL/api/campaign/create" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "video_id": 0,
    "budget": 1000000,
    "reward_per_second": 10
  }'
echo -e "\n"

# 9. Record Watch Time (requires attester role)
echo -e "${BLUE}9. Recording Watch Time${NC}"
curl -X POST "$BASE_URL/api/attester/record" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "video_id": 0,
    "seconds": 120
  }'
echo -e "\n"

# 10. Get Creator Dashboard (Clean JSON)
echo -e "${BLUE}10. Getting Creator Dashboard${NC}"
CREATOR_ADDRESS="0x725e2ce1a9869698c840684828def3c663776877380c3020c8bbc51fae019f27"
curl -X GET "$BASE_URL/api/dashboard/creator/$CREATOR_ADDRESS"
echo -e "\n"

# 11. Get Platform Stats
echo -e "${BLUE}11. Getting Platform Statistics${NC}"
curl -X GET "$BASE_URL/api/dashboard/stats"
echo -e "\n"

echo "========================================="
echo -e "${GREEN}All Tests Completed!${NC}"
echo "========================================="
