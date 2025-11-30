require("dotenv").config();
const {
  AptosAccount,
  AptosClient,
  TransactionBuilderRemoteABI,
} = require("aptos");

const NODE_URL = process.env.APTOS_NODE_URL || "https://fullnode.devnet.aptoslabs.com";
const PRIVATE_KEY_HEX = (process.env.APTOS_PRIVATE_KEY || "").replace(/^0x/, "");
if (!PRIVATE_KEY_HEX) {
  console.warn("APTOS_PRIVATE_KEY not set in .env — some endpoints will fail.");
}

const MODULE_ADDRESS = process.env.MODULE_ADDRESS;
if (!MODULE_ADDRESS) console.warn("MODULE_ADDRESS not set in .env");

const client = new AptosClient(NODE_URL);

// create signer account from hex private key (ed25519 expected)
let signer;
try {
  signer = new AptosAccount(Buffer.from(PRIVATE_KEY_HEX, "hex"));
} catch (e) {
  console.error("Failed to create AptosAccount from PRIVATE_KEY:", e.message || e);
  signer = null;
}

/**
 * Submit an entry-function transaction using TransactionBuilderRemoteABI
 * @param {string} funcFqn - e.g. "0xabc...::AdMarket::create_campaign"
 * @param {Array} args - arguments in plain JS: numbers or strings matching Move params
 * @returns submitted transaction result (object from client.submitSignedBCSTransaction)
 */
async function submitEntryFunction(funcFqn, args = []) {
  if (!signer) throw new Error("No signer available (check APTOS_PRIVATE_KEY).");
  const builder = new TransactionBuilderRemoteABI(client, { sender: signer.address() });
  // build using empty type args
  const raw = await builder.build(funcFqn, [], args);
  const bcs = AptosClient.generateBCSTransaction(signer, raw);
  const tx = await client.submitSignedBCSTransaction(bcs);
  // wait for confirmation
  await client.waitForTransaction(tx.hash);
  return tx;
}

async function uploadVideoToAptos(cid, title, description) {
  try {
    console.log("Building transaction...");
    
    // Use the Aptos SDK's built-in transaction builder
    const builder = new TransactionBuilderRemoteABI(client, {
      sender: signer.address(),
    });

    const rawTxn = await builder.build(
      `${MODULE_ADDRESS}::AdMarket::upload_video`,
      [],
      [cid, title, description]
    );

    console.log("Signing transaction...");
    const bcsTxn = AptosClient.generateBCSTransaction(signer, rawTxn);
    
    console.log("Submitting transaction...");
    const transactionRes = await client.submitSignedBCSTransaction(bcsTxn);

    console.log("Waiting for transaction confirmation...");
    await client.waitForTransaction(transactionRes.hash);

    console.log("Transaction successful:", transactionRes.hash);
    return transactionRes;
  } catch (error) {
    console.error("Aptos transaction error:", error);
    throw error;
  }
}

module.exports = {
  client,
  signer,
  MODULE_ADDRESS,
  submitEntryFunction,
  uploadVideoToAptos,
};