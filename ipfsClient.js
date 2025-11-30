// ipfsClient.js
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const IPFS_API_URL = process.env.IPFS_API_URL || "http://127.0.0.1:5001";

async function addFileToIpfs(pathToFile, filename) {
  const url = `${IPFS_API_URL}/api/v0/add?pin=true`;

  const form = new FormData();
  form.append("file", fs.createReadStream(pathToFile), { filename });

  const headers = form.getHeaders();

  const resp = await axios.post(url, form, {
    headers,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });

  return resp.data; // { Hash, Name, Size }
}

module.exports = { addFileToIpfs };
