import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { AgentCredit, TradeEscrow, ServiceRegistry } from "../typechain-types";

describe("AgentX Smart Contract Suite", function () {
  let deployer: any;
  let agentBuyer: any;
  let agentSeller: any;
  let thirdParty: any;

  let creditToken: AgentCredit;
  let escrowContract: TradeEscrow;
  let serviceRegistry: ServiceRegistry;

  const INITIAL_SUPPLY = ethers.parseEther("1000000"); // 1M CRED
  const MINT_AMOUNT = ethers.parseEther("5000");       // 5,000 CRED
  const ESCROW_AMOUNT = ethers.parseEther("500");      // 500 CRED
  const TIMEOUT_SECONDS = 3600;                        // 1 hour

  beforeEach(async function () {
    [deployer, agentBuyer, agentSeller, thirdParty] = await ethers.getSigners();

    // 1. Deploy AgentCredit
    const AgentCreditFactory = await ethers.getContractFactory("AgentCredit");
    creditToken = (await AgentCreditFactory.deploy(
      deployer.address,
      INITIAL_SUPPLY
    )) as AgentCredit;
    await creditToken.waitForDeployment();

    // 2. Deploy TradeEscrow
    const TradeEscrowFactory = await ethers.getContractFactory("TradeEscrow");
    escrowContract = (await TradeEscrowFactory.deploy(
      await creditToken.getAddress(),
      deployer.address
    )) as TradeEscrow;
    await escrowContract.waitForDeployment();

    // 3. Deploy ServiceRegistry
    const ServiceRegistryFactory = await ethers.getContractFactory("ServiceRegistry");
    serviceRegistry = (await ServiceRegistryFactory.deploy(
      deployer.address
    )) as ServiceRegistry;
    await serviceRegistry.waitForDeployment();

    // Mint tokens to buyer and seller
    await creditToken.mint(agentBuyer.address, MINT_AMOUNT);
    await creditToken.mint(agentSeller.address, MINT_AMOUNT);
  });

  describe("AgentCredit Token ($CRED)", function () {
    it("should have correct metadata and initial supply", async function () {
      expect(await creditToken.name()).to.equal("AgentX Credit");
      expect(await creditToken.symbol()).to.equal("CRED");
      expect(await creditToken.totalSupply()).to.equal(
        INITIAL_SUPPLY + MINT_AMOUNT * 2n
      );
    });

    it("should allow owner to mint tokens to agents", async function () {
      const initBal = await creditToken.balanceOf(thirdParty.address);
      await creditToken.mint(thirdParty.address, ethers.parseEther("100"));
      const newBal = await creditToken.balanceOf(thirdParty.address);
      expect(newBal - initBal).to.equal(ethers.parseEther("100"));
    });

    it("should prevent non-owner from minting tokens", async function () {
      await expect(
        creditToken.connect(agentBuyer).mint(agentBuyer.address, 1000)
      ).to.be.revertedWithCustomError(creditToken, "OwnableUnauthorizedAccount");
    });
  });

  describe("TradeEscrow", function () {
    beforeEach(async function () {
      // Buyer approves TradeEscrow contract to spend $CRED
      await creditToken
        .connect(agentBuyer)
        .approve(await escrowContract.getAddress(), ethers.MaxUint256);
    });

    it("should allow buyer to open an escrow", async function () {
      const tx = await escrowContract
        .connect(agentBuyer)
        .openEscrow(agentSeller.address, ESCROW_AMOUNT, TIMEOUT_SECONDS);

      await expect(tx)
        .to.emit(escrowContract, "EscrowCreated")
        .withArgs(
          1,
          agentBuyer.address,
          agentSeller.address,
          ESCROW_AMOUNT,
          (await time.latest()) + TIMEOUT_SECONDS
        );

      const escrowInfo = await escrowContract.getEscrow(1);
      expect(escrowInfo.buyer).to.equal(agentBuyer.address);
      expect(escrowInfo.seller).to.equal(agentSeller.address);
      expect(escrowInfo.amount).to.equal(ESCROW_AMOUNT);
      expect(escrowInfo.status).to.equal(0); // Active
    });

    it("should release escrow funds to seller when confirmed by buyer", async function () {
      await escrowContract
        .connect(agentBuyer)
        .openEscrow(agentSeller.address, ESCROW_AMOUNT, TIMEOUT_SECONDS);

      const sellerBalBefore = await creditToken.balanceOf(agentSeller.address);

      await expect(escrowContract.connect(agentBuyer).release(1))
        .to.emit(escrowContract, "EscrowReleased")
        .withArgs(1, agentSeller.address, ESCROW_AMOUNT);

      const sellerBalAfter = await creditToken.balanceOf(agentSeller.address);
      expect(sellerBalAfter - sellerBalBefore).to.equal(ESCROW_AMOUNT);

      const escrowInfo = await escrowContract.getEscrow(1);
      expect(escrowInfo.status).to.equal(1); // Released
    });

    it("should release escrow funds when triggered by owner (simulation orchestrator)", async function () {
      await escrowContract
        .connect(agentBuyer)
        .openEscrow(agentSeller.address, ESCROW_AMOUNT, TIMEOUT_SECONDS);

      await expect(escrowContract.connect(deployer).release(1))
        .to.emit(escrowContract, "EscrowReleased");
    });

    it("should prevent unauthorized third party from releasing escrow", async function () {
      await escrowContract
        .connect(agentBuyer)
        .openEscrow(agentSeller.address, ESCROW_AMOUNT, TIMEOUT_SECONDS);

      await expect(
        escrowContract.connect(thirdParty).release(1)
      ).to.be.revertedWith("TradeEscrow: unauthorized to release");
    });

    it("should allow refund by seller before timeout", async function () {
      await escrowContract
        .connect(agentBuyer)
        .openEscrow(agentSeller.address, ESCROW_AMOUNT, TIMEOUT_SECONDS);

      const buyerBalBefore = await creditToken.balanceOf(agentBuyer.address);

      await expect(escrowContract.connect(agentSeller).refund(1))
        .to.emit(escrowContract, "EscrowRefunded")
        .withArgs(1, agentBuyer.address, ESCROW_AMOUNT);

      const buyerBalAfter = await creditToken.balanceOf(agentBuyer.address);
      expect(buyerBalAfter - buyerBalBefore).to.equal(ESCROW_AMOUNT);
    });

    it("should allow buyer refund after timeout period has elapsed", async function () {
      await escrowContract
        .connect(agentBuyer)
        .openEscrow(agentSeller.address, ESCROW_AMOUNT, TIMEOUT_SECONDS);

      // Attempt refund prior to timeout -> fails
      await expect(
        escrowContract.connect(agentBuyer).refund(1)
      ).to.be.revertedWith("TradeEscrow: unauthorized or timeout not reached");

      // Advance time past timeout
      await time.increase(TIMEOUT_SECONDS + 1);

      // Attempt refund after timeout -> succeeds
      await expect(escrowContract.connect(agentBuyer).refund(1))
        .to.emit(escrowContract, "EscrowRefunded");
    });
  });

  describe("ServiceRegistry", function () {
    it("should allow an agent provider to register a service listing", async function () {
      const price = ethers.parseEther("50");
      const tx = await serviceRegistry
        .connect(agentSeller)
        .registerService("data-oracle", price, "Mock Data Oracle Feed");

      await expect(tx)
        .to.emit(serviceRegistry, "ServiceRegistered")
        .withArgs(1, agentSeller.address, "data-oracle", price, "Mock Data Oracle Feed");

      const service = await serviceRegistry.getService(1);
      expect(service.provider).to.equal(agentSeller.address);
      expect(service.serviceType).to.equal("data-oracle");
      expect(service.active).to.be.true;
    });

    it("should log service calls and completion status", async function () {
      const price = ethers.parseEther("100");
      await serviceRegistry
        .connect(agentSeller)
        .registerService("task-completion", price, "Sub-task Worker");

      // Log service call with escrow ID 42
      const callTx = await serviceRegistry
        .connect(agentBuyer)
        .logServiceCall(1, agentBuyer.address, 42);

      await expect(callTx)
        .to.emit(serviceRegistry, "ServiceCalled")
        .withArgs(1, 1, agentBuyer.address, agentSeller.address, 42);

      // Log completion
      const compTx = await serviceRegistry
        .connect(agentSeller)
        .logCompletion(1, true, "ipfs://QmbWqx7vuP");

      await expect(compTx)
        .to.emit(serviceRegistry, "ServiceCompleted")
        .withArgs(1, 1, true, "ipfs://QmbWqx7vuP");

      const callInfo = await serviceRegistry.getServiceCall(1);
      expect(callInfo.completed).to.be.true;
      expect(callInfo.success).to.be.true;
      expect(callInfo.resultHash).to.equal("ipfs://QmbWqx7vuP");
    });
  });
});
