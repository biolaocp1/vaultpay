import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const MockTUSD = await ethers.getContractFactory("MockTUSD");
  const token = await MockTUSD.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("MockTUSD deployed to:", tokenAddress);

  const VaultPay = await ethers.getContractFactory("VaultPay");
  const vaultpay = await VaultPay.deploy(tokenAddress);
  await vaultpay.waitForDeployment();
  const vaultpayAddress = await vaultpay.getAddress();
  console.log("VaultPay deployed to:", vaultpayAddress);

  const configPath = path.join(__dirname, "../frontend/src/config.ts");
  const configContent = `export const TOKEN_ADDRESS = "${tokenAddress}";\nexport const VAULTPAY_ADDRESS = "${vaultpayAddress}";\n`;
  fs.writeFileSync(configPath, configContent);
  console.log("Config written to frontend/src/config.ts");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
