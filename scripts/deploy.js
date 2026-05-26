const hre = require("hardhat");

async function main() {
  const VaultPay = await hre.ethers.getContractFactory("VaultPay");
  const vaultpay = await VaultPay.deploy();
  await vaultpay.waitForDeployment();
  console.log("VaultPay deployed to:", await vaultpay.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
