import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`====================================================`);
  console.log(`Deploying AgentX Sandbox Contracts`);
  console.log(`Network: ${network.name} (Chain ID: ${network.config.chainId})`);
  console.log(`Deployer address: ${deployer.address}`);
  console.log(`====================================================\n`);

  // 1. Deploy AgentCredit ($CRED)
  const initialSupply = ethers.parseEther("10000000"); // 10 Million $CRED
  const AgentCreditFactory = await ethers.getContractFactory("AgentCredit");
  console.log("Deploying AgentCredit...");
  const agentCredit = await AgentCreditFactory.deploy(deployer.address, initialSupply);
  await agentCredit.waitForDeployment();
  const agentCreditAddress = await agentCredit.getAddress();
  console.log(`✔ AgentCredit ($CRED) deployed to: ${agentCreditAddress}`);

  // 2. Deploy TradeEscrow
  const TradeEscrowFactory = await ethers.getContractFactory("TradeEscrow");
  console.log("Deploying TradeEscrow...");
  const tradeEscrow = await TradeEscrowFactory.deploy(agentCreditAddress, deployer.address);
  await tradeEscrow.waitForDeployment();
  const tradeEscrowAddress = await tradeEscrow.getAddress();
  console.log(`✔ TradeEscrow deployed to: ${tradeEscrowAddress}`);

  // 3. Deploy ServiceRegistry
  const ServiceRegistryFactory = await ethers.getContractFactory("ServiceRegistry");
  console.log("Deploying ServiceRegistry...");
  const serviceRegistry = await ServiceRegistryFactory.deploy(deployer.address);
  await serviceRegistry.waitForDeployment();
  const serviceRegistryAddress = await serviceRegistry.getAddress();
  console.log(`✔ ServiceRegistry deployed to: ${serviceRegistryAddress}\n`);

  // Artifact & Export handling
  const exportsDir = path.join(__dirname, "..", "exports");
  if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir, { recursive: true });
  }

  const deploymentData = {
    network: network.name,
    chainId: network.config.chainId,
    deployedAt: new Date().toISOString(),
    contracts: {
      AgentCredit: {
        address: agentCreditAddress,
      },
      TradeEscrow: {
        address: tradeEscrowAddress,
      },
      ServiceRegistry: {
        address: serviceRegistryAddress,
      },
    },
  };

  const deploymentPath = path.join(exportsDir, "deployments.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentData, null, 2));
  console.log(`✔ Saved deployment record to ${deploymentPath}`);

  // Export ABIs
  const getAbi = (contractName: string) => {
    const artifactPath = path.join(
      __dirname,
      "..",
      "artifacts",
      "contracts",
      `${contractName}.sol`,
      `${contractName}.json`
    );
    if (fs.existsSync(artifactPath)) {
      const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
      return artifact.abi;
    }
    return [];
  };

  const abis = {
    AgentCredit: getAbi("AgentCredit"),
    TradeEscrow: getAbi("TradeEscrow"),
    ServiceRegistry: getAbi("ServiceRegistry"),
  };

  const abiPath = path.join(exportsDir, "abis.json");
  fs.writeFileSync(abiPath, JSON.stringify(abis, null, 2));
  console.log(`✔ Exported ABIs to ${abiPath}`);

  console.log("\n====================================================");
  console.log("Deployment Complete!");
  console.log("====================================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
