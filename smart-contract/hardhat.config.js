require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
const {
  PRIVATE_KEY = "",
  BASE_RPC_URL = "",
  BASE_SEPOLIA_RPC_URL = "",
} = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    // Local Hardhat network (default)
    hardhat: {},
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    // Base mainnet
    base: {
      url: BASE_RPC_URL || "",
      chainId: 8453,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    // Base Sepolia testnet
    baseSepolia: {
      url: BASE_SEPOLIA_RPC_URL || "",
      chainId: 84532,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
};
