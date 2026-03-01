require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter");

module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  gasReporter: {
    enabled: true,
    currency: "USD",
    showTimeSpent: true,
  },

  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
};