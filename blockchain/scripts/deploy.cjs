const hre = require("hardhat");

async function main() {
  const VaultLedger = await hre.ethers.getContractFactory("VaultLedger");
  const vaultLedger = await VaultLedger.deploy();
  await vaultLedger.deployed();
  console.log("VaultLedger deployed to:", vaultLedger.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
