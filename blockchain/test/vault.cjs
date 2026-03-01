const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VaultLedger", function () {
  let vault;

  beforeEach(async function () {
    const Vault = await ethers.getContractFactory("VaultLedger");
    vault = await Vault.deploy();
    await vault.deployed();
  });

  it("should allow adding expense", async function () {
    const hash = ethers.utils.formatBytes32String("expense1");
    await vault.addExpense(hash);
  });

  it("should return stored expenses", async function () {
    const hash = ethers.utils.formatBytes32String("expense1");
    await vault.addExpense(hash);

    const expenses = await vault.getExpense();
    expect(expenses.length).to.equal(1);
    expect(expenses[0].dataHash).to.equal(hash);
  });
});