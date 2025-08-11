const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PostingFee", function () {
  it("charges fee and allows owner controls", async function () {
    const [owner, user] = await ethers.getSigners();

    // Deploy mock USDC and mint tokens to user
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const usdc = await MockUSDC.deploy();
    await usdc.mint(user.address, ethers.parseUnits("5", 6));

    // Deploy PostingFee contract
    const PostingFee = await ethers.getContractFactory("PostingFee");
    const posting = await PostingFee.deploy(usdc.target);

    expect(await posting.postPrice()).to.equal(1_000_000n);

    // User approves contract and pays fee
    await usdc.connect(user).approve(posting.target, 1_000_000n);
    await expect(posting.connect(user).payForProjectPost())
      .to.emit(posting, "FeePaid")
      .withArgs(user.address, "project", 1_000_000n);

    // Fee remains in the contract until withdrawn
    expect(await usdc.balanceOf(posting.target)).to.equal(1_000_000n);

    // Owner withdraws accumulated fees
    await expect(posting.withdrawFees())
      .to.emit(posting, "FeesWithdrawn")
      .withArgs(owner.address, 1_000_000n);
    expect(await usdc.balanceOf(owner.address)).to.equal(1_000_000n);
    expect(await usdc.balanceOf(posting.target)).to.equal(0n);

    // Owner can change price
    await posting.setPostPrice(2_000_000n);
    expect(await posting.postPrice()).to.equal(2_000_000n);

    // Owner can disable fees
    await posting.setFeesEnabled(false);
    await expect(posting.connect(user).payForProfilePost()).to.be.revertedWith("Fees disabled");
  });
});
