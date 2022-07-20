import { ContractInterface } from "@ethersproject/contracts";

export enum ModuleType {
  TELLOR = "tellor",
  OPTIMISTIC_GOVERNOR = "optimisticGovernor",
  REALITY_ETH = "realityETH",
  REALITY_ERC20 = "realityERC20",
  DELAY = "delay",
  BRIDGE = "bridge",
  EXIT = "exit",
  ROLES = "roles",
  UNKNOWN = "unknown",
}

export const MODULE_TYPES: Record<string, ModuleType> = {
  tellor: ModuleType.TELLOR,
  optimisticGovernor: ModuleType.OPTIMISTIC_GOVERNOR,
  realityETH: ModuleType.REALITY_ETH,
  realityERC20: ModuleType.REALITY_ERC20,
  delay: ModuleType.DELAY,
  bridge: ModuleType.BRIDGE,
  exit: ModuleType.EXIT,
  scopeGuard: ModuleType.UNKNOWN,
  circulatingSupply: ModuleType.UNKNOWN,
  roles: ModuleType.ROLES,
};

export const MODULE_NAMES: Record<ModuleType, string> = {
  [ModuleType.TELLOR]: "Tellor Module",
  [ModuleType.OPTIMISTIC_GOVERNOR]: "Optimistic Governor Module",
  [ModuleType.REALITY_ERC20]: "Reality Module",
  [ModuleType.REALITY_ETH]: "Reality Module",
  [ModuleType.UNKNOWN]: "Unknown Module",
  [ModuleType.BRIDGE]: "Bridge Module",
  [ModuleType.DELAY]: "Delay Modifier",
  [ModuleType.ROLES]: "Roles Modifier",
  [ModuleType.EXIT]: "Exit Module",
};

export enum ModuleOperation {
  CREATE,
  REMOVE,
}

export interface Module {
  id: string;
  name?: string;
  address: string;
  type: ModuleType;
  subModules: Module[];
  owner?: string;
  parentModule: string;
}

export interface ModuleContract {
  address: string;
  implAddress: string;
  type: ModuleType;
  name?: string;
  abi?: ContractInterface;
  bytecode?: string;
}

export interface ModuleContractMetadata {
  type: ModuleType;
  abi: ContractInterface;
  bytecode: string;
}

export interface DelayModule extends Module {
  type: ModuleType.DELAY;
  expiration: number;
  cooldown: number;
}

export interface TellorModule extends Module {
  type: ModuleType.TELLOR;
  executor: string;
  oracle: string;
  expiration: number;
  cooldown: number;
}

export interface OptimisticGovernorModule extends Module {
  type: ModuleType.OPTIMISTIC_GOVERNOR;
  finder: string;
  owner: string;
  collateral: string;
  bond: string;
  rules: string;
  identifier: string;
  liveness: string;
}

export interface RealityModule extends Module {
  type: ModuleType.REALITY_ETH;
  executor: string;
  oracle: string;
  expiration: number;
  bond: string;
  templateId: string;
  cooldown: number;
  arbitrator: string;
}

export interface ModulesState {
  operation: Operation;
  current?: Module;
  currentPendingModule?: PendingModule;
  loadingModules: boolean;
  list: Module[];
  reloadCount: number;
  safeThreshold: number;
  pendingModules: PendingModule[];
  moduleAdded: boolean;
}

export type Operation = "read" | "write";

export interface DataDecoded {
  method: string;
  parameters: { name?: string; value?: string }[];
}

export interface MultiSendDataDecoded extends DataDecoded {
  method: "multiSend";
  parameters: {
    name: "transactions";
    type: "bytes";
    value: string;
    valueDecoded: DecodedTransaction[];
  }[];
}

export interface RawTransaction {
  to: string;
  data: string;
  value: string;
  nonce: number;
  operation: 0 | 1;
}

export interface DecodedTransaction extends RawTransaction {
  dataDecoded: DataDecoded;
}

export interface SafeTransaction extends DecodedTransaction {
  safe: string;
  gasToken: string;
}

export interface SafeInfo {
  address: string;
  nonce: number;
  threshold: number;
  owners: string[];
  masterCopy: string;
  modules: string[];
  fallbackHandler: string;
  guard: string;
  version: string;
}

export interface PendingModule {
  operation: ModuleOperation;
  module: ModuleType;
  address: string;
  executor: string;
}
