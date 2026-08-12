import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const POLYGON_AMOY_RPC_URL =
  process.env.POLYGON_AMOY_RPC_URL || "https://rpc-amoy.polygon.technology/";
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    amoy: {
      url: POLYGON_AMOY_RPC_URL,
      accounts: PRIVATE_KEY && PRIVATE_KEY.length >= 64 ? [PRIVATE_KEY] : [],
      chainId: 80002,
    },
  },
  etherscan: {
    apiKey: {
      polygonAmoy: process.env.POLYGONSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "polygonAmoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com",
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
