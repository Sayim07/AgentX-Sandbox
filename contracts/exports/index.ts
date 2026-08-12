import deploymentsData from "./deployments.json";
import abisData from "./abis.json";

export interface ContractAddressMap {
  AgentCredit: string;
  TradeEscrow: string;
  ServiceRegistry: string;
}

export interface DeploymentRecord {
  network: string;
  chainId: number;
  deployedAt: string;
  contracts: {
    AgentCredit: { address: string };
    TradeEscrow: { address: string };
    ServiceRegistry: { address: string };
  };
}

export const deployments: DeploymentRecord = deploymentsData as DeploymentRecord;

export const addresses: ContractAddressMap = {
  AgentCredit: deploymentsData.contracts.AgentCredit.address,
  TradeEscrow: deploymentsData.contracts.TradeEscrow.address,
  ServiceRegistry: deploymentsData.contracts.ServiceRegistry.address,
};

export const abis = abisData;

export const POLYGON_AMOY_CHAIN_ID = 80002;
export const POLYGON_AMOY_RPC_URL = "https://rpc-amoy.polygon.technology/";
