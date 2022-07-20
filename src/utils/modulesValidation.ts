import { Contract } from "ethers";
import { ModuleContractMetadata, ModuleType } from "../store/modules/models";
import DELAY_MODIFIER_METADATA from "../contracts/Delay.json";
import REALITY_ERC20_MODULE_METADATA from "../contracts/RealityModuleERC20.json";
import REALITY_ETH_MODULE_METADATA from "../contracts/RealityModuleETH.json";
import TELLOR_MODULE_METADATA from "../contracts/Tellor.json";
import OPTIMISTIC_GOVERNOR_MODULE_METADATA from "../contracts/OptimisticGovernor.json";
import BRIDGE_MODULE_METADATA from "../contracts/AMBModule.json";
import EXIT_MODULE_METADATA from "../contracts/Exit.json";
import ROLES_MODIFIER_METADATA from "../contracts/RolesMod.json";
import { NETWORK } from "./networks";
import { getProvider } from "../services";

const MODULES_METADATA = {
  [ModuleType.TELLOR]: TELLOR_MODULE_METADATA,
  [ModuleType.OPTIMISTIC_GOVERNOR]: OPTIMISTIC_GOVERNOR_MODULE_METADATA,
  [ModuleType.REALITY_ETH]: REALITY_ETH_MODULE_METADATA,
  [ModuleType.REALITY_ERC20]: REALITY_ERC20_MODULE_METADATA,
  [ModuleType.EXIT]: EXIT_MODULE_METADATA,
  [ModuleType.BRIDGE]: BRIDGE_MODULE_METADATA,
  [ModuleType.DELAY]: DELAY_MODIFIER_METADATA,
  [ModuleType.ROLES]: ROLES_MODIFIER_METADATA,
};

const GNOSIS_GENERIC_PROXY_CONTRACT_BYTECODE =
  "0x608060405273ffffffffffffffffffffffffffffffffffffffff600054167fa619486e0000000000000000000000000000000000000000000000000000000060003514156050578060005260206000f35b3660008037600080366000845af43d6000803e60008114156070573d6000fd5b3d6000f3fea265627a7a72315820d8a00dc4fe6bf675a9d7416fc2d00bb3433362aa8186b750f76c4027269667ff64736f6c634300050e0032";

const GNOSIS_GENERIC_PROXY_CONTRACT_ABI = [
  "function masterCopy() external view returns (address)",
];

export function getModuleType(type: string): ModuleType {
  const moduleType = Object.keys(ModuleType).find(
    (moduleType) => moduleType === type
  );
  if (!moduleType) return ModuleType.UNKNOWN;
  return moduleType as ModuleType;
}

export function getModuleContractMetadata(
  module: ModuleType
): ModuleContractMetadata | undefined {
  if (module === ModuleType.UNKNOWN) return;
  return { type: module, ...MODULES_METADATA[module] };
}

export function getModuleContractMetadataByBytecode(
  bytecode: string
): ModuleContractMetadata | undefined {
  const entry = Object.entries(MODULES_METADATA).find(
    ([, metadata]) => metadata.bytecode === bytecode.toLowerCase().trim()
  );
  if (!entry) return;
  const [type, metadata] = entry;
  return { ...metadata, type: getModuleType(type) };
}

export function isGnosisGenericProxy(bytecode: string) {
  return bytecode.toLowerCase() === GNOSIS_GENERIC_PROXY_CONTRACT_BYTECODE;
}

export function isGenericProxy(bytecode: string) {
  if (bytecode.length !== 92) return false;
  return (
    bytecode.startsWith("0x363d3d373d3d3d363d73") &&
    bytecode.endsWith("5af43d82803e903d91602b57fd5bf3")
  );
}

export function getGenericProxyMaster(bytecode: string) {
  return "0x" + bytecode.substr(22, 40);
}

export async function getProxyMaster(address: string, chainId: NETWORK) {
  const provider = getProvider(chainId);
  const contract = new Contract(
    address,
    GNOSIS_GENERIC_PROXY_CONTRACT_ABI,
    provider
  );

  const [masterAddress] = await contract.functions.masterCopy();

  return masterAddress;
}
