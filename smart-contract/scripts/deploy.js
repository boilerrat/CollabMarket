/*
  Deploy script for PostingFee to Base or Base Sepolia.

  Usage:
    - Localhost:       pnpm --filter smart-contract run deploy:local
    - Base Sepolia:    pnpm --filter smart-contract run deploy:base-sepolia
    - Base mainnet:    pnpm --filter smart-contract run deploy:base

  Env requirements (.env in smart-contract/):
    PRIVATE_KEY=0x...
    BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/KEY (or other provider)
    BASE_SEPOLIA_RPC_URL=https://base-sepolia.g.alchemy.com/v2/KEY
    USDC_ADDRESS=<existing USDC address on the target network>

  Notes:
    - If USDC_ADDRESS is not provided on local networks, a MockUSDC will be deployed.
    - On Base or Base Sepolia, you must provide a valid USDC_ADDRESS.
*/

const { ethers, network } = require("hardhat");

async function main() {
  const net = network.name;
  console.log(`\nNetwork: ${net}`);

  const isLocal = net === "hardhat" || net === "localhost";
  const isBase = net === "base" || net === "baseSepolia";

  let usdcAddress = process.env.USDC_ADDRESS || "";

  if (!usdcAddress && isLocal) {
    console.log("No USDC_ADDRESS provided. Deploying MockUSDC for local testing...");
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const mock = await MockUSDC.deploy();
    await mock.waitForDeployment();
    usdcAddress = await mock.getAddress();
    console.log("MockUSDC deployed:", usdcAddress);
  }

  if (!usdcAddress && isBase) {
    throw new Error(
      "USDC_ADDRESS is required for Base/Base Sepolia deployments. Set USDC_ADDRESS in .env"
    );
  }

  if (!usdcAddress) {
    throw new Error("USDC address is not set and no mock deployed.");
  }

  const PostingFee = await ethers.getContractFactory("PostingFee");
  const postingFee = await PostingFee.deploy(usdcAddress);
  await postingFee.waitForDeployment();

  const address = await postingFee.getAddress();
  console.log("PostingFee deployed:", address);

  const owner = await postingFee.owner();
  const postPrice = await postingFee.postPrice();
  const feesEnabled = await postingFee.feesEnabled();
  console.log("Owner:", owner);
  console.log("Post price (USDC 6dp):", postPrice.toString());
  console.log("Fees enabled:", feesEnabled);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


