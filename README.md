# 🎬 BlockTube - Decentralized Video Platform

A blockchain-based video platform built on **Aptos** blockchain with **IPFS** storage, enabling creators to upload videos, advertisers to run campaigns, and consumers to watch content while earning rewards.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Aptos](https://img.shields.io/badge/blockchain-Aptos-green.svg)
![IPFS](https://img.shields.io/badge/storage-IPFS-orange.svg)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Install Dependencies](#2-install-dependencies)
  - [3. Setup IPFS Node](#3-setup-ipfs-node)
  - [4. Deploy Smart Contract](#4-deploy-smart-contract)
  - [5. Configure Environment](#5-configure-environment)
  - [6. Start Backend Server](#6-start-backend-server)
  - [7. Run Frontend](#7-run-frontend)
- [Wallet Connection](#-wallet-connection)
- [Usage Guide](#-usage-guide)
- [API Documentation](#-api-documentation)
- [Smart Contract Functions](#-smart-contract-functions)
- [Project Structure](#-project-structure)
- [Testing](#-testing)
- [Future Scope](#-future-scope)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚀 Features

### For Creators 👨‍💻
- **Upload Videos**: Upload videos to decentralized IPFS storage
- **Blockchain Metadata**: Store video metadata on Aptos blockchain
- **Earn Rewards**: Receive payments from ad campaigns
- **Creator Dashboard**: Track views, earnings, and video performance

### For Advertisers 📢
- **Create Campaigns**: Launch targeted ad campaigns on videos
- **Budget Control**: Set campaign budgets and reward rates
- **Campaign Analytics**: Monitor campaign performance
- **Flexible Targeting**: Choose specific videos for campaigns

### For Consumers 🎥
- **Watch Videos**: Stream decentralized content
- **Earn While Watching**: Get rewarded for viewing ads
- **No Censorship**: Access content on decentralized infrastructure
- **Privacy Focused**: No tracking, no data collection

### Platform Features 🌐
- **Decentralized Storage**: IPFS ensures content permanence
- **Smart Contract Automation**: Aptos blockchain handles payments
- **Role-Based System**: Creator, Advertiser, Consumer roles
- **Attester Verification**: Trusted attesters verify watch events
- **Transparent Payments**: On-chain payment distribution

---

## 🛠 Tech Stack

### Blockchain & Smart Contracts
- **Aptos Blockchain** - Layer 1 blockchain (Devnet)
- **Move Language** - Smart contract development
- **Aptos SDK** - JavaScript/TypeScript SDK for blockchain interaction

### Storage
- **IPFS (Kubo)** - Decentralized file storage
- **Local IPFS Node** - Self-hosted IPFS daemon

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite (better-sqlite3)** - Local database for mirrors
- **JWT** - Authentication
- **Multer** - File upload handling
- **Axios** - HTTP client

### Frontend
- **Vanilla JavaScript** - No framework dependencies
- **HTML5 & CSS3** - Modern web standards
- **Responsive Design** - Mobile-friendly interface
- **CSS Animations** - Smooth loading screens and transitions

---

## 🏗 Architecture

```
┌─────────────────┐
│   Frontend      │
│  (HTML/CSS/JS)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Backend API    │
│   (Express.js)  │
└────┬────────┬───┘
     │        │
     ▼        ▼
┌─────────┐ ┌──────────┐
│  IPFS   │ │  Aptos   │
│  Node   │ │Blockchain│
└─────────┘ └──────────┘
     │            │
     ▼            ▼
┌─────────┐ ┌──────────┐
│ Video   │ │ Smart    │
│Storage  │ │Contract  │
└─────────┘ └──────────┘
```

---

## ⚙️ Prerequisites

Before you begin, ensure you have:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)
- **Aptos CLI** - [Installation Guide](https://aptos.dev/tools/aptos-cli/install-cli/)
- **Petra Wallet** or **Martian Wallet** (Browser extension)
- **Linux/WSL** (for IPFS setup) or Windows with admin rights

---

## 📦 Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/swayamshetkar/Backend-aptos.git
cd Backend-aptos
```

### 2. Install Dependencies

```bash
npm install
```

**Dependencies installed:**
- `aptos` - Aptos SDK
- `express` - Web framework
- `cors` - CORS middleware
- `multer` - File upload
- `jsonwebtoken` - JWT auth
- `bcryptjs` - Password hashing
- `better-sqlite3` - SQLite database
- `axios` - HTTP client
- `dotenv` - Environment variables
- `form-data` - Multipart form data

### 3. Setup IPFS Node

#### Option A: Linux/WSL (Recommended)

```bash
cd kubo
chmod +x install.sh
./install.sh
```

**Start IPFS daemon:**
```bash
ipfs daemon
```

IPFS will be available at: `http://127.0.0.1:5001`

#### Option B: Manual Installation

1. Download IPFS from [https://ipfs.tech/](https://ipfs.tech/)
2. Extract and install:
   ```bash
   tar -xvzf kubo_v*.tar.gz
   cd kubo
   sudo bash install.sh
   ```
3. Initialize IPFS:
   ```bash
   ipfs init
   ```
4. Configure CORS:
   ```bash
   ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
   ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST", "GET"]'
   ```
5. Start daemon:
   ```bash
   ipfs daemon
   ```

**Verify IPFS is running:**
```bash
curl http://127.0.0.1:5001/api/v0/version
```

### 4. Deploy Smart Contract

#### Step 1: Install Aptos CLI

```bash
# Linux/WSL
curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3

# Verify installation
aptos --version
```

#### Step 2: Create Aptos Account

```bash
cd smart-contract

# Initialize Aptos account
aptos init

# Choose network: devnet
# This will create a new account and save private key in .aptos/config.yaml
```

**Save your account details:**
- Address: `0xYOUR_ADDRESS_HERE`
- Private Key: `0xYOUR_PRIVATE_KEY_HERE`

#### Step 3: Fund Your Account

Visit: [https://aptoslabs.com/testnet-faucet](https://aptoslabs.com/testnet-faucet)

Or use CLI:
```bash
aptos account fund-with-faucet --account YOUR_ADDRESS
```

#### Step 4: Update Move.toml

Edit `smart-contract/Move.toml`:
```toml
[addresses]
admarket = "YOUR_ADDRESS_HERE"

[dev-addresses]
admarket = "YOUR_ADDRESS_HERE"
```

#### Step 5: Compile Smart Contract

```bash
cd smart-contract
aptos move compile
```

**Expected output:**
```
{
  "Result": [
    "Success"
  ]
}
```

#### Step 6: Deploy to Aptos Devnet

```bash
aptos move publish --named-addresses admarket=YOUR_ADDRESS
```

Confirm with: `yes`

**Expected output:**
```
{
  "Result": {
    "transaction_hash": "0x...",
    "gas_used": ...,
    "success": true
  }
}
```

#### Step 7: Initialize Smart Contract

After deployment, initialize the contract resources:

```bash
# Initialize roles table
aptos move run --function-id YOUR_ADDRESS::AdMarket::init_roles

# Initialize videos table
aptos move run --function-id YOUR_ADDRESS::AdMarket::init_videos

# Initialize campaigns table
aptos move run --function-id YOUR_ADDRESS::AdMarket::init_campaigns

# Initialize attester list
aptos move run --function-id YOUR_ADDRESS::AdMarket::init_attesters

# Initialize creator balances
aptos move run --function-id YOUR_ADDRESS::AdMarket::init_creator_balances
```

### 5. Configure Environment

Create `.env` file in root directory:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# IPFS Configuration
IPFS_API_URL=http://127.0.0.1:5001

# Aptos Configuration
APTOS_NODE_URL=https://fullnode.devnet.aptoslabs.com/v1
APTOS_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
MODULE_ADDRESS=0xYOUR_ADDRESS_HERE

# Network
NETWORK=devnet
PORT=4000
```

**Important:** Replace:
- `YOUR_PRIVATE_KEY_HERE` with your Aptos private key from `.aptos/config.yaml`
- `YOUR_ADDRESS_HERE` with your Aptos account address

### 6. Start Backend Server

#### Development Mode (with auto-reload):
```bash
npm run dev
```

#### Production Mode:
```bash
npm start
```

**Server will start on:** `http://localhost:4000`

**Verify backend is running:**
```bash
curl http://localhost:4000
```

Expected response: `Backend up`

### 7. Run Frontend

#### Option A: Direct Browser Open
```bash
cd frontend
# Open index.html in your browser
```

#### Option B: Local HTTP Server (Recommended)

**Using Python:**
```bash
cd frontend
python3 -m http.server 8080
```

**Using Node.js (http-server):**
```bash
npm install -g http-server
cd frontend
http-server -p 8080
```

**Using VS Code Live Server:**
- Install "Live Server" extension
- Right-click `index.html` → "Open with Live Server"

**Access frontend at:** `http://localhost:8080`

---

## 👛 Wallet Connection

### Install Wallet Extension

1. **Petra Wallet** (Recommended)
   - Install from [Chrome Web Store](https://chrome.google.com/webstore)
   - Create new wallet or import existing
   - Switch to **Devnet** network

2. **Martian Wallet** (Alternative)
   - Install from [Chrome Web Store](https://chrome.google.com/webstore)
   - Setup wallet
   - Select Devnet

### Connect to Application

1. Click **"Connect Wallet"** button in frontend
2. Approve connection in wallet popup
3. Your address will be displayed
4. You're ready to use the platform!

### Get Test Tokens

Visit: [https://aptoslabs.com/testnet-faucet](https://aptoslabs.com/testnet-faucet)

Or use:
```bash
aptos account fund-with-faucet --account YOUR_ADDRESS
```

---

## 📖 Usage Guide

### As a Creator

1. **Connect Wallet** → Click "Connect Wallet"
2. **Register as Creator** → Go to "Creator Studio"
3. **Upload Video**:
   - Select video file (MP4, MOV, AVI)
   - Enter title and description
   - Click "Upload Video"
   - Wait for IPFS upload and blockchain confirmation
4. **Track Performance** → View stats in dashboard

### As an Advertiser

1. **Connect Wallet**
2. **Register as Advertiser** → Go to "Advertise"
3. **Create Campaign**:
   - Browse available videos
   - Select target video
   - Set budget (in tokens)
   - Set reward per second
   - Click "Create Campaign"
   - Confirm transaction in wallet
4. **Monitor Campaign** → View active campaigns

### As a Consumer

1. **Connect Wallet**
2. **Register as Consumer** → Go to "Watch Videos"
3. **Watch Videos**:
   - Browse video catalog
   - Click video to watch
   - Earn rewards while viewing ads
4. **Check Balance** → View earned tokens

---

## 📡 API Documentation

### Base URL
```
http://localhost:4000
```

### Endpoints

#### Health Check
```http
GET /
Response: "Backend up"
```

#### Video Routes (`/api/video`)

**Upload Video**
```http
POST /api/video/upload
Content-Type: multipart/form-data

Body:
- video: File
- title: string
- description: string
- creator: string (wallet address)

Response:
{
  "success": true,
  "cid": "QmXxx...",
  "txHash": "0x...",
  "videoId": 1
}
```

**Get All Videos**
```http
GET /api/video/all

Response:
{
  "videos": [
    {
      "id": 1,
      "cid": "QmXxx...",
      "title": "Video Title",
      "description": "Description",
      "creator": "0x..."
    }
  ]
}
```

**Get Creator Videos**
```http
GET /api/video/creator/:address

Response:
{
  "videos": [...]
}
```

#### Campaign Routes (`/api/campaign`)

**Create Campaign**
```http
POST /api/campaign/create
Content-Type: application/json

Body:
{
  "advertiser": "0x...",
  "videoId": 1,
  "budget": 1000000,
  "rewardPerSecond": 100
}

Response:
{
  "success": true,
  "campaignId": 1,
  "txHash": "0x..."
}
```

**Get Active Campaigns**
```http
GET /api/campaign/active

Response:
{
  "campaigns": [...]
}
```

#### Attester Routes (`/api/attester`)

**Add Attester**
```http
POST /api/attester/add
Body: { "address": "0x..." }
```

**Attest Watch**
```http
POST /api/attester/attest
Body: {
  "campaignId": 1,
  "consumer": "0x...",
  "secondsWatched": 30
}
```

#### Dashboard Routes (`/api/dashboard`)

**Get Stats**
```http
GET /api/dashboard/stats

Response:
{
  "totalVideos": 10,
  "totalCreators": 5,
  "totalCampaigns": 3
}
```

---

## 🔗 Smart Contract Functions

### Role Management

```move
public entry fun register_creator(user: &signer)
public entry fun register_advertiser(user: &signer)
public entry fun register_consumer(user: &signer)
```

### Video Management

```move
public entry fun upload_video(
    creator: &signer,
    cid: string::String,
    title: string::String,
    description: string::String
)
```

### Campaign Management

```move
public entry fun create_campaign(
    advertiser: &signer,
    video_id: u64,
    budget: u64,
    reward_per_second: u64
)
```

### Attestation & Rewards

```move
public entry fun attest_watch(
    attester: &signer,
    campaign_id: u64,
    consumer: address,
    seconds_watched: u64
)

public entry fun creator_withdraw(creator: &signer, amount: u64)
```

---

## 📁 Project Structure

```
Backend-aptos/
├── frontend/                 # Frontend application
│   ├── index.html           # Main HTML file
│   ├── app.js               # JavaScript logic
│   ├── styles.css           # Styling
│   └── README.md            # Frontend documentation
│
├── routes/                   # API routes
│   ├── video.js             # Video endpoints
│   ├── campaigns.js         # Campaign endpoints
│   ├── attester.js          # Attester endpoints
│   ├── auth.js              # Authentication
│   └── dashboard.js         # Dashboard stats
│
├── services/                 # Business logic
│   ├── mirrorDb.js          # SQLite mirror database
│   └── txSubmit.js          # Transaction submission
│
├── smart-contract/           # Aptos Move contracts
│   ├── sources/
│   │   └── AdMarket.move    # Main smart contract
│   ├── Move.toml            # Move configuration
│   └── .aptos/              # Aptos CLI config
│
├── kubo/                     # IPFS installation
│   ├── install.sh           # IPFS setup script
│   └── README.md            # IPFS documentation
│
├── db/                       # Database files
├── uploads/                  # Temporary upload storage
│
├── server.js                 # Express server entry point
├── aptosClient.js           # Aptos blockchain client
├── ipfsClient.js            # IPFS client
├── package.json             # Node dependencies
├── .env.example             # Environment template
└── README.md                # This file
```

---

## 🧪 Testing

### Test Backend API

```bash
# Make executable
chmod +x test-api.sh

# Run tests
./test-api.sh
```

### Manual Testing

**Test IPFS:**
```bash
curl -X POST -F file=@test.mp4 http://127.0.0.1:5001/api/v0/add
```

**Test Backend:**
```bash
# Health check
curl http://localhost:4000

# Get all videos
curl http://localhost:4000/api/video/all

# Get stats
curl http://localhost:4000/api/dashboard/stats
```

**Test Smart Contract:**
```bash
cd smart-contract

# View resources
aptos account list --account YOUR_ADDRESS

# Test video upload
aptos move run --function-id YOUR_ADDRESS::AdMarket::upload_video \
  --args string:"QmTest" string:"Test Video" string:"Description"
```

---

## 🚀 Future Scope

### Phase 1: Enhanced Features
- [ ] **Video Streaming** - Implement HLS/DASH streaming
- [ ] **Video Analytics** - Detailed watch time, engagement metrics
- [ ] **Content Moderation** - Decentralized moderation system
- [ ] **Video Categories** - Tags, categories, search filters
- [ ] **Playlist Support** - Create and share playlists

### Phase 2: Advanced Monetization
- [ ] **Creator Subscriptions** - Paid subscription tiers
- [ ] **NFT Integration** - Mint videos as NFTs
- [ ] **Tipping System** - Direct creator tips
- [ ] **Revenue Sharing** - Multi-creator collaborations
- [ ] **Micro-payments** - Pay-per-view model

### Phase 3: Platform Expansion
- [ ] **Mobile Apps** - iOS/Android applications
- [ ] **Live Streaming** - Real-time streaming support
- [ ] **Comments & Reactions** - Social features
- [ ] **Notifications** - Push notifications for events
- [ ] **Multi-chain Support** - Ethereum, Polygon integration

### Phase 4: Decentralization
- [ ] **DAO Governance** - Community-driven decisions
- [ ] **Decentralized CDN** - Distributed content delivery
- [ ] **Token Economics** - Platform native token
- [ ] **Staking Mechanism** - Stake for rewards
- [ ] **Cross-chain Bridge** - Asset transfers

### Phase 5: Enterprise Features
- [ ] **Content Licensing** - Automated licensing system
- [ ] **Analytics Dashboard** - Advanced metrics for creators
- [ ] **Ad Marketplace** - Decentralized ad exchange
- [ ] **Creator Verification** - Badge system
- [ ] **Multi-language Support** - Internationalization

### Technical Improvements
- [ ] **GraphQL API** - Replace REST with GraphQL
- [ ] **Caching Layer** - Redis for performance
- [ ] **Load Balancing** - Horizontal scaling
- [ ] **CI/CD Pipeline** - Automated deployment
- [ ] **Testing Suite** - Unit, integration, e2e tests
- [ ] **Documentation** - API docs with Swagger
- [ ] **Monitoring** - Prometheus + Grafana
- [ ] **Security Audit** - Third-party security review

---

## 🔧 Troubleshooting

### Common Issues

#### IPFS Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:5001
```
**Solution:**
```bash
# Check if IPFS daemon is running
ps aux | grep ipfs

# Start IPFS daemon
ipfs daemon
```

#### Smart Contract Deployment Failed
```
Error: Insufficient balance
```
**Solution:**
```bash
# Fund account from faucet
aptos account fund-with-faucet --account YOUR_ADDRESS

# Check balance
aptos account list --account YOUR_ADDRESS
```

#### Wallet Connection Issues
**Solution:**
- Ensure wallet is on **Devnet** network
- Refresh page and try reconnecting
- Check browser console for errors
- Clear cache and cookies

#### Backend Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::4000
```
**Solution:**
```bash
# Find process using port
lsof -i :4000

# Kill process
kill -9 <PID>

# Or change port in .env
PORT=4001
```

#### Video Upload Fails
**Solution:**
- Check IPFS daemon is running
- Verify file size < 100MB
- Ensure wallet has sufficient funds
- Check backend logs for errors

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open Pull Request

### Development Guidelines
- Follow existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation
- Test thoroughly before submitting

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Swayam Shetkar** - [@swayamshetkar](https://github.com/swayamshetkar)

---

## 🙏 Acknowledgments

- [Aptos Labs](https://aptoslabs.com/) - Blockchain infrastructure
- [IPFS](https://ipfs.tech/) - Decentralized storage
- [Move Language](https://move-language.github.io/move/) - Smart contract language
- Community contributors and testers

---

## 📞 Support

For issues, questions, or suggestions:

- **GitHub Issues**: [Create an issue](https://github.com/swayamshetkar/Backend-aptos/issues)
- **Email**: support@blocktube.io (if applicable)
- **Discord**: [Join our community](https://discord.gg/blocktube) (if applicable)

---

## 🌟 Show Your Support

Give a ⭐️ if this project helped you!

---

**Built with ❤️ using Aptos, IPFS, and Move**
