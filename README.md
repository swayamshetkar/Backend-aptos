BlockTube — A Decentralized Watch & Earn Platform for creatore and storage Hosters

A full-stack decentralized application on Aptos + IPFS

Creators upload videos → advertisers fund campaigns → consumers watch → backend attester sends watch-time to Aptos → creators earn APT.

🚀 Tech Stack

Smart Contract: Move (Aptos blockchain)

Frontend: Next.js + Aptos Wallet Adapter

Backend: Node.js Express attester service

Storage: IPFS (local or remote)

Network: Aptos Devnet

📁 Project Structure
your-project/
│
├── smart-contract/
│   ├── Move.toml
│   └── sources/
│       └── AdMarket.move
│
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   ├── aptos.js
│   │   └── routes/watch.js
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── pages/
│   ├── components/
│   ├── utils/
│   └── package.json
│
└── ipfs/
    └── run-ipfs.sh

🪙 1. Move Smart Contract (Aptos)

The smart contract handles:
✔ Roles (creator / advertiser / consumer)
✔ Video uploads (metadata pointing to an IPFS CID)
✔ Campaign creation & budgets
✔ Watch-time rewards
✔ Creator earnings

📌 1.1 Install Aptos CLI
Linux / WSL:
curl -fsSL https://aptos.dev/scripts/install_cli.sh | bash


Check:

aptos --version

🧪 1.2 Choose Network
✔ Option A: Localnet (recommended for debugging)

Start local Aptos node:

aptos node run-localnet


You will get:

REST API → http://127.0.0.1:8080

Faucet → http://127.0.0.1:8081

Init local profile:

aptos init --profile localnet

✔ Option B: Devnet
aptos init --profile devnet
aptos account fund-with-faucet --profile devnet

⚙️ 1.3 Setup Move.toml
[package]
name = "AdMarket"
version = "1.0.0"

[addresses]
admarket = "0xYOUR_ACCOUNT"

[dependencies.AptosFramework]
git = "https://github.com/aptos-labs/aptos-framework.git"
rev = "devnet"
subdir = "aptos-framework"


Replace 0xYOUR_ACCOUNT with the wallet used to deploy the contract.

🏗 1.4 Compile Contract
cd smart-contract
aptos move compile --skip-fetch-latest-git-deps

🚀 1.5 Publish Contract
Localnet:
aptos move publish \
  --profile localnet \
  --named-addresses admarket=0xYOUR_ACCOUNT \
  --skip-fetch-latest-git-deps

Devnet:
aptos move publish \
  --profile devnet \
  --named-addresses admarket=0xYOUR_ACCOUNT \
  --skip-fetch-latest-git-deps

🔧 1.6 Initialize Storage Tables

Run each:

aptos move run --profile devnet --function-id "0xYOUR_ACCOUNT::AdMarket::init_roles"
aptos move run --profile devnet --function-id "0xYOUR_ACCOUNT::AdMarket::init_videos"
aptos move run --profile devnet --function-id "0xYOUR_ACCOUNT::AdMarket::init_campaigns"
aptos move run --profile devnet --function-id "0xYOUR_ACCOUNT::AdMarket::init_attesters"
aptos move run --profile devnet --function-id "0xYOUR_ACCOUNT::AdMarket::init_creator_balances"

🔑 1.7 Add Backend Attester

Attester wallet must be whitelisted:

aptos move run \
  --profile devnet \
  --function-id "0xYOUR_ACCOUNT::AdMarket::add_attester" \
  --args address:0xBACKEND_WALLET

📡 2. Backend (Node.js Attester Service)

The backend:

Receives watch events from the frontend

Aggregates watch-time

Signs and submits record_watch_time

Uses a backend-only wallet (never exposed to users)

🧩 2.1 Install dependencies
cd backend
npm install

🗝 2.2 Create .env

Copy:

cp .env.example .env


Fill values:

NODE_URL=https://fullnode.devnet.aptoslabs.com
CONTRACT=0xYOUR_ACCOUNT::AdMarket
PRIVATE_KEY=0xBACKEND_PRIVATE_KEY
PORT=3001

🧠 2.3 Start backend
node src/server.js

🧪 2.4 Test endpoint
curl -X POST http://localhost:3001/api/watch \
  -H "Content-Type: application/json" \
  -d '{"campaignId":1,"seconds":30}'


If successful → backend submits a transaction to Aptos.

📦 3. IPFS Node (Video Storage)

Creators upload videos → IPFS returns a CID → stored on chain.

▶️ 3.1 Install & Run IPFS
wget https://dist.ipfs.tech/go-ipfs/v0.21.1/go-ipfs_v0.21.1_linux-amd64.tar.gz
tar -xvf go-ipfs*.tar.gz
cd go-ipfs
sudo bash install.sh


Run IPFS:

ipfs init
ipfs daemon


API at: http://127.0.0.1:5001

🎬 3.2 Add video to IPFS
ipfs add -w myvideo.mp4


Output:

added bafybeib... myvideo.mp4


Use that CID in your smart contract.

🌐 4. Frontend (Next.js + Aptos Wallet)

The frontend allows:

✔ Connect Aptos wallet
✔ Upload video to IPFS
✔ Call upload_video
✔ Create campaigns
✔ Watch video + send watch-time heartbeats

🧩 4.1 Install frontend
cd frontend
npm install
npm run dev


Open:
👉 http://localhost:3000

🔌 4.2 Connect Wallet (Frontend Setup)

Use Aptos wallet adapter.

Example:

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";


Allow user to sign:

const tx = {
  type: "entry_function_payload",
  function: `${contract}::upload_video`,
  arguments: [cid, title, description],
  type_arguments: []
};

await wallet.signAndSubmitTransaction(tx);

🎞 4.3 Watching a video

Frontend sends heartbeats:

setInterval(() => {
  fetch("/api/watch", {
    method: "POST",
    body: JSON.stringify({ campaignId, seconds: 5 }),
    headers: { "Content-Type": "application/json" }
  });
}, 5000);

🔄 5. End-to-End Flow
Creator:

Uploads video to IPFS → gets CID

Calls upload_video

Advertiser funds a campaign

Consumer:

Watches video

Frontend sends watch heartbeats

Backend aggregates & validates

Backend calls record_watch_time

Creator gets credited on Aptos

Creator Withdraws:
aptos move run --profile devnet \
  --function-id "0xYOUR_ACCOUNT::AdMarket::withdraw_rewards"

🧩 6. Troubleshooting
❌ Profile not found

Run:

aptos init --profile devnet

❌ INSUFFICIENT_BALANCE_FOR_TRANSACTION_FEE

Fund:

aptos account fund-with-faucet --profile devnet

❌ Backend errors signing txn

PRIVATE_KEY must be 64 hex chars

Must whitelist attester with add_attester

🏁 7. Summary Commands Cheat-Sheet
Localnet:
aptos node run-localnet
aptos init --profile localnet
aptos move publish --profile localnet ...

Devnet:
aptos init --profile devnet
aptos account fund-with-faucet --profile devnet
aptos move publish --profile devnet ...

Backend:
cd backend
node src/server.js

IPFS:
ipfs daemon

Frontend:
cd frontend
