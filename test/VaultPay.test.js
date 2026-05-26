const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VaultPay", function () {
  let vaultpay, owner, sender, recipient;

  beforeEach(async function () {
    [owner, sender, recipient] = await ethers.getSigners();
    const VaultPay = await ethers.getContractFactory("VaultPay");
    vaultpay = await VaultPay.deploy();
  });

  it("Should create a payment", async function () {
    const amount = ethers.parseEther("1.0");
    await vaultpay.connect(sender).createPayment(recipient.address, { value: amount });
    const payment = await vaultpay.getPayment(0);
    expect(payment.amount).to.equal(amount);
    expect(payment.released).to.equal(false);
  });

  it("Should release a payment", async function () {
    const amount = ethers.parseEther("1.0");
    await vaultpay.connect(sender).createPayment(recipient.address, { value: amount });
    await vaultpay.connect(sender).releasePayment(0);
    const payment = await vaultpay.getPayment(0);
    expect(payment.released).to.equal(true);
  });

  it("Should reject zero value payments", async function () {
    await expect(
      vaultpay.connect(sender).createPayment(recipient.address, { value: 0 })
    ).to.be.revertedWith("Amount must be > 0");
  });
});
