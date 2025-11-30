# AdMarket Frontend

A simple, responsive web application for the AdMarket blockchain video platform.

## Features

### 🏠 Home Page
- Platform statistics (total videos, creators)
- Recent videos showcase
- Feature highlights

### 🎬 Consumer Page (Watch Videos)
- Browse all videos
- Click to watch videos in modal player
- Video metadata display

### 👨‍💻 Creator Page (Creator Studio)
- Upload videos to IPFS and blockchain
- View creator dashboard with stats
- Manage uploaded videos
- Track earnings balance

### 📢 Advertisement Page
- Create ad campaigns for videos
- Set budget and reward per second
- Browse available videos for campaigns
- Step-by-step campaign creation guide

## Quick Start

### 1. Ensure Backend is Running
```bash
cd /home/chidori/backendyoutube
npm run dev
```

### 2. Open Frontend
Simply open `index.html` in your browser:

```bash
# Using WSL
cd /home/chidori/backendyoutube/frontend
explorer.exe index.html

# Or use a simple HTTP server
python3 -m http.server 8080
# Then visit: http://localhost:8080
```

### 3. Connect Wallet
Click "Connect Wallet" button to simulate wallet connection (uses demo credentials).

## File Structure

```
frontend/
├── index.html      # Main HTML with all pages
├── styles.css      # Complete styling
├── app.js          # JavaScript logic and API integration
└── README.md       # This file
```

## API Integration

The frontend connects to your backend at `http://localhost:4000` and uses these endpoints:

- `GET /api/video/list` - Get all videos
- `GET /api/video/:id` - Get single video
- `POST /api/video/upload-video` - Upload new video
- `GET /api/dashboard/stats` - Platform statistics
- `GET /api/dashboard/creator/:address` - Creator dashboard
- `POST /api/campaign/create` - Create ad campaign

## Features in Detail

### Video Upload
1. Select video file (max 100MB)
2. Enter title and description
3. Click "Upload Video"
4. Video is uploaded to IPFS and recorded on blockchain
5. Real-time progress feedback

### Video Watching
1. Browse videos on Consumer page
2. Click any video card to open player
3. Watch video from IPFS
4. View video metadata

### Campaign Creation
1. Find video ID from video list
2. Enter budget in APT
3. Set reward per second of watch time
4. Submit to blockchain

## Wallet Integration

Currently uses simulated wallet connection with demo credentials:
- Address: `0x725e2ce1a9869698c840684828def3c663776877380c3020c8bbc51fae019f27`
- Username: `attester1`
- Password: `password123`

**For production:** Replace with real Aptos wallet integration (Petra, Martian, etc.)

## Customization

### Change API URL
Edit `app.js`:
```javascript
const API_BASE_URL = 'http://localhost:4000';
```

### Modify Colors
Edit `styles.css` root variables:
```css
:root {
    --primary-color: #6366f1;
    --secondary-color: #8b5cf6;
    /* ... */
}
```

### Add More Features
- Add user authentication modal
- Integrate real Aptos wallet
- Add video search and filters
- Implement campaign analytics
- Add user profiles

## Browser Compatibility

Works in all modern browsers:
- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

## Development Tips

### Testing Locally
1. Start backend: `npm run dev`
2. Open `index.html` directly in browser
3. Use browser DevTools to debug

### CORS Issues
If you encounter CORS errors, ensure your backend has CORS enabled:
```javascript
// server.js already has this
app.use(cors());
```

### Video Upload Testing
Place a small test video (test.mp4) in the frontend directory for quick testing.

## Screenshots

### Home Page
- Hero section with stats
- Recent videos grid
- Feature cards

### Consumer Page
- Video grid with thumbnails
- Video player modal
- Video metadata

### Creator Page
- Upload form
- Dashboard stats
- My videos grid

### Advertisement Page
- Campaign creation form
- How it works guide
- Available videos list

## Troubleshooting

**Videos not loading?**
- Check backend is running on port 4000
- Open browser console for error messages
- Verify API_BASE_URL in app.js

**Upload not working?**
- Ensure backend IPFS client is running
- Check file size (should be < 100MB)
- Verify wallet is connected

**Modal not closing?**
- Click X button or click outside modal
- Refresh page if stuck

## Next Steps

1. ✅ Basic frontend complete
2. 🔄 Add real wallet integration
3. 🔄 Implement user authentication UI
4. 🔄 Add video analytics
5. 🔄 Implement search and filters
6. 🔄 Add campaign management dashboard

## Support

For issues or questions, check:
- Backend API documentation: `API_TESTING.md`
- Clean JSON API guide: `CLEAN_JSON_API.md`
- Backend logs in terminal

---

**Built with vanilla HTML, CSS, and JavaScript - No frameworks required!** 🚀
