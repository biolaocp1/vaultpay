import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("VaultPay", function () {
  async function deploy() {
    const [owner, payer, recipient] = await ethers.getSigners();
    const MockTUSD = await ethers.getContractFactory("MockTUSD");
    const token = await MockTUSD.deploy();
    const VaultPay = await ethers.getContractFactory("VaultPay");
    const vaultpay = await VaultPay.deploy(await token.getAddress());
    await token.connect(payer).faucet();
    await token.connect(payer).approve(await vaultpay.getAddress(), ethers.MaxUint256);
    return { vaultpay, token, owner, payer, recipient };
  }

  it("Should create a payment", async function () {
    const { vaultpay, payer, recipient } = await deploy();
    const deadline = (await time.latest()) + 3600;
    const amount = ethers.parseEther("100");
    await vaultpay.connect(payer).createPayment(recipient.address, amount, deadline);
    const p = await vaultpay.getPayment(0);
    expect(p.amount).to.equal(amount);
    expect(p.claimed).to.equal(false);
  });

  it("Should allow recipient to claim", async function () {
    const { vaultpay, payer, recipient } = await deploy();
    const deadline = (await time.latest()) + 3600;
    const amount = ethers.parseEther("100");
    await vaultpay.connect(payer).createPayment(recipient.address, amount, deadline);
    await vaultpay.connect(recipient).claimPayment(0);
    const p = await vaultpay.getPayment(0);
    expect(p.claimed).to.equal(true);
  });

  it("Should allow payer to cancel after deadline", async function () {
    const { vaultpay, payer, recipient } = await deploy();
    const deadline = (await time.latest()) + 3600;
    const amount = ethers.parseEther("100");
    await vaultpay.connect(payer).createPayment(recipient.address, amount, deadline);
    await time.increaseTo(deadline + 1);
    await vaultpay.connect(payer).cancelPayment(0);
    const p = await vaultpay.getPayment(0);
    expect(p.cancelled).to.equal(true);
  });

  it("Should reject cancel before deadline", async function () {
    const { vaultpay, payer, recipient } = await deploy();
    const deadline = (await time.latest()) + 3600;
    await vaultpay.connect(payer).createPayment(recipient.address, ethers.parseEther("100"), deadline);
    await expect(vaultpay.connect(payer).cancelPayment(0)).to.be.revertedWith("Deadline not passed");
  });

  it("Should reject claim by non-recipient", async function () {
    const { vaultpay, payer, recipient, owner } = await deploy();
    const deadline = (await time.latest()) + 3600;
    await vaultpay.connect(payer).createPayment(recipient.address, ethers.parseEther("100"), deadline);
    await expect(vaultpay.connect(owner).claimPayment(0)).to.be.revertedWith("Not recipient");
  });
});
