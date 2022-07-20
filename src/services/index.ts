import { BigNumber, Contract, ethers } from "ethers";
import {
  calculateProxyAddress,
  deployAndSetUpModule,
  getFactoryAndMasterCopy,
  getModuleInstance,
  KnownContracts,
} from "@gnosis.pm/zodiac";
import { AddressOne, buildTransaction, SafeAbi } from "./helpers";
import { ContractInterface } from "@ethersproject/contracts";
import { Transaction } from "@gnosis.pm/safe-apps-sdk";
import { getNetworkExplorerInfo } from "../utils/explorers";
import { SafeInfo, SafeTransaction } from "../store/modules/models";
import { NETWORK } from "../utils/networks";
import { ERC721_CONTRACT_ABI } from "../utils/reality-eth";
import { scaleBondDecimals } from "components/input/CollateralSelect";

export enum ARBITRATOR_OPTIONS {
  NO_ARBITRATOR,
  KLEROS,
  OTHER,
}

interface RealityModuleParams {
  executor: string;
  oracle?: string;
  bond: string;
  templateId: string;
  timeout: string;
  cooldown: string;
  expiration: string;
  arbitrator: string;
}

interface TellorModuleParams {
  executor: string;
  oracle?: string;
  cooldown: string;
  expiration: string;
}

interface OptimisticGovernorModuleParams {
  executor: string;
  owner: string;
  collateral: string;
  bond: string;
  rules: string;
  identifier: string;
  liveness: string;
}

interface DelayModuleParams {
  executor: string;
  cooldown: string;
  expiration: string;
}

export interface RolesModifierParams {
  target: string;
}

export interface AMBModuleParams {
  amb: string;
  controller: string;
  executor: string;
  chainId: string;
}

export interface ExitModuleParams {
  executor: string;
  tokenContract: string;
}

export function getProvider(
  chainId: NETWORK
): ethers.providers.JsonRpcProvider {
  const network = getNetworkExplorerInfo(chainId);
  if (network) {
    return new ethers.providers.JsonRpcProvider(network.rpcUrl, chainId);
  }
  return new ethers.providers.InfuraProvider(
    chainId,
    process.env.REACT_APP_INFURA_ID
  );
}

export function getTellorOracle(chainId: number): string {
  switch (chainId) {
    case NETWORK.MAINNET:
      return "0x88dF592F8eb5D7Bd38bFeF7dEb0fBc02cf3778a0";
    case NETWORK.RINKEBY:
      return "0x18431fd88adF138e8b979A7246eb58EA7126ea16";
    case NETWORK.POLYGON:
      return "0xFd45Ae72E81Adaaf01cC61c8bCe016b7060DD537";
  }
  return "";
}

export function getDefaultOracle(chainId: number): string {
  switch (chainId) {
    case NETWORK.MAINNET:
      return "0x5b7dD1E86623548AF054A4985F7fc8Ccbb554E2c";
    case NETWORK.RINKEBY:
      return "0xDf33060F476F8cff7511F806C72719394da1Ad64";
    case NETWORK.BSC:
      return "0xa925646Cae3721731F9a8C886E5D1A7B123151B9";
    case NETWORK.XDAI:
      return "0xE78996A233895bE74a66F451f1019cA9734205cc";
    case NETWORK.POLYGON:
      return "0x60573B8DcE539aE5bF9aD7932310668997ef0428";
  }
  return "";
}

export function getFinder(chainId: number): string {
  switch (chainId) {
    case NETWORK.MAINNET:
      return "0x40f941E48A552bF496B154Af6bf55725f18D77c3";
    case NETWORK.RINKEBY:
      return "0xbb6206fb01fAad31e8aaFc3AD303cEA89D8c8157";
    case NETWORK.POLYGON:
      return "0x09aea4b2242abC8bb4BB78D537A67a245A7bEC64";
  }
  return "";
}

export enum COLLATERAL_OPTIONS {
  WETH,
  USDC
}

export function getCollateral(
  chainId: number,
  collateralOption: number
): string {
  switch (collateralOption) {
    case COLLATERAL_OPTIONS.USDC:
      return getUSDCAddress(chainId);
    case COLLATERAL_OPTIONS.WETH:
      return getWETHAddress(chainId);
  }
  return "";
}

function getUSDCAddress(chainId: number): string {
  switch (chainId) {
    case NETWORK.MAINNET:
      return "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    case NETWORK.RINKEBY:
      return "0xeb8f08a975Ab53E34D8a0330E0D34de942C95926";
    case NETWORK.POLYGON:
      return "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
  }
  return "";
}

function getWETHAddress(chainId: number): string {
  switch (chainId) {
    case NETWORK.MAINNET:
      return "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    case NETWORK.RINKEBY:
      return "0xc778417E063141139Fce010982780140Aa0cD5Ab";
    case NETWORK.POLYGON:
      return "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619";
  }
  return "";
}

function getKlerosAddress(chainId: number): string {
  // TODO: Add addresses when Kleros becomes available.
  switch (chainId) {
    case NETWORK.MAINNET:
      return "0xf72cfd1b34a91a64f9a98537fe63fbab7530adca";
    case NETWORK.RINKEBY:
      return "0xe27768bdb76a9b742b7ddcfe1539fadaf3b89bc7";
    case NETWORK.BSC:
      return "";
    case NETWORK.XDAI:
      return "";
    case NETWORK.POLYGON:
      return "";
  }
  return "";
}

export function getArbitrator(
  chainId: number,
  arbitratorOption: number
): string {
  switch (arbitratorOption) {
    case ARBITRATOR_OPTIONS.NO_ARBITRATOR:
      // Setting the oracle as the arbitrator is equivalent to setting a null arbitrator.
      return getDefaultOracle(chainId);
    case ARBITRATOR_OPTIONS.KLEROS:
      return getKlerosAddress(chainId);
    case ARBITRATOR_OPTIONS.OTHER:
      return "";
  }
  return "";
}

export function deployTellorModule(
  safeAddress: string,
  chainId: number,
  args: TellorModuleParams
) {
  const type = KnownContracts.TELLOR
  const { oracle, cooldown, expiration, executor } = args;
  const provider = getProvider(chainId);
  const oracleAddress = oracle || getTellorOracle(chainId);

  const {
    transaction: daoModuleDeploymentTx,
    expectedModuleAddress: daoModuleExpectedAddress,
  } = deployAndSetUpModule(
    type,
    {
      types: ["address", "address", "address", "uint32", "uint32"],
      values: [safeAddress, executor, oracleAddress, cooldown, expiration],
    },
    provider,
    chainId,
    Date.now().toString()
  );

  const daoModuleTransactions: Transaction[] = [
    {
      ...daoModuleDeploymentTx,
      value: daoModuleDeploymentTx.value.toString(),
    },
  ];

  if (executor !== safeAddress) {
    const delayModule = getModuleInstance(
      KnownContracts.DELAY,
      executor,
      provider
    );
    const addModuleTransaction = buildTransaction(delayModule, "enableModule", [
      daoModuleExpectedAddress,
    ]);

    daoModuleTransactions.push(addModuleTransaction);
  } else {
    const enableDaoModuleTransaction = enableModule(
      safeAddress,
      chainId,
      daoModuleExpectedAddress
    );
    daoModuleTransactions.push(enableDaoModuleTransaction);
  }

  return daoModuleTransactions;
}

export function deployRealityModule(
  safeAddress: string,
  chainId: number,
  args: RealityModuleParams,
  isERC20?: boolean
) {
  const type: KnownContracts = isERC20
    ? KnownContracts.REALITY_ERC20
    : KnownContracts.REALITY_ETH;
  const {
    timeout,
    cooldown,
    expiration,
    bond,
    templateId,
    oracle,
    executor,
    arbitrator,
  } = args;
  const provider = getProvider(chainId);
  const oracleAddress = oracle || getDefaultOracle(chainId);
  const {
    transaction: daoModuleDeploymentTx,
    expectedModuleAddress: daoModuleExpectedAddress,
  } = deployAndSetUpModule(
    type,
    {
      types: [
        "address",
        "address",
        "address",
        "address",
        "uint32",
        "uint32",
        "uint32",
        "uint256",
        "uint256",
        "address",
      ],
      values: [
        safeAddress,
        safeAddress,
        executor,
        oracleAddress,
        timeout,
        cooldown,
        expiration,
        bond,
        templateId,
        arbitrator,
      ],
    },
    provider,
    chainId,
    Date.now().toString()
  );

  const daoModuleTransactions: Transaction[] = [
    {
      ...daoModuleDeploymentTx,
      value: daoModuleDeploymentTx.value.toString(),
    },
  ];

  if (executor !== safeAddress) {
    const delayModule = getModuleInstance(
      KnownContracts.DELAY,
      executor,
      provider
    );
    const addModuleTransaction = buildTransaction(delayModule, "enableModule", [
      daoModuleExpectedAddress,
    ]);

    daoModuleTransactions.push(addModuleTransaction);
  } else {
    const enableDaoModuleTransaction = enableModule(
      safeAddress,
      chainId,
      daoModuleExpectedAddress
    );
    daoModuleTransactions.push(enableDaoModuleTransaction);
  }

  return daoModuleTransactions;
}

export function deployDelayModule(
  safeAddress: string,
  chainId: number,
  args: DelayModuleParams
) {
  const provider = getProvider(chainId);
  const { cooldown, expiration, executor } =
    args as unknown as DelayModuleParams;
  const {
    transaction: delayModuleDeploymentTx,
    expectedModuleAddress: delayModuleExpectedAddress,
  } = deployAndSetUpModule(
    KnownContracts.DELAY,
    {
      types: ["address", "address", "address", "uint256", "uint256"],
      values: [safeAddress, safeAddress, executor, cooldown, expiration],
    },
    provider,
    chainId,
    Date.now().toString()
  );
  const enableDelayModuleTransaction = enableModule(
    safeAddress,
    chainId,
    delayModuleExpectedAddress
  );

  return [
    {
      ...delayModuleDeploymentTx,
      value: delayModuleDeploymentTx.value.toString(),
    },
    enableDelayModuleTransaction,
  ];
}

export function deployBridgeModule(
  safeAddress: string,
  chainId: number,
  args: AMBModuleParams
) {
  const provider = getProvider(chainId);
  const { executor, controller, amb, chainId: ambChainId } = args;

  const { transaction, expectedModuleAddress } = deployAndSetUpModule(
    KnownContracts.BRIDGE,
    {
      types: ["address", "address", "address", "address", "address", "bytes32"],
      values: [
        safeAddress,
        safeAddress,
        executor,
        amb,
        controller,
        ethers.utils.hexZeroPad(BigNumber.from(ambChainId).toHexString(), 32),
      ],
    },
    provider,
    chainId,
    Date.now().toString()
  );

  const enableModuleTransaction = enableModule(
    safeAddress,
    chainId,
    expectedModuleAddress
  );

  return [
    {
      ...transaction,
      value: transaction.value.toString(),
    },
    enableModuleTransaction,
  ];
}

export function deployCirculatingSupplyContract(
  safeAddress: string,
  chainId: number,
  token: string,
  saltNonce: string,
  isERC721?: boolean
) {
  const type: KnownContracts = isERC721
    ? KnownContracts.CIRCULATING_SUPPLY_ERC721
    : KnownContracts.CIRCULATING_SUPPLY_ERC20;

  const provider = getProvider(chainId);
  const { factory, module: circulatingSupplyContract } =
    getFactoryAndMasterCopy(type, provider, chainId);

  const encodedInitParams = new ethers.utils.AbiCoder().encode(
    ["address", "address", "address[]"],
    [safeAddress, token, [safeAddress]]
  );
  const moduleSetupData =
    circulatingSupplyContract.interface.encodeFunctionData("setUp", [
      encodedInitParams,
    ]);

  const expectedAddress = calculateProxyAddress(
    factory,
    circulatingSupplyContract.address,
    moduleSetupData,
    saltNonce
  );

  const deployData = factory.interface.encodeFunctionData("deployModule", [
    circulatingSupplyContract.address,
    moduleSetupData,
    saltNonce,
  ]);

  const transaction = {
    data: deployData,
    to: factory.address,
    value: "0",
  };
  return {
    transaction,
    expectedAddress,
  };
}

export async function deployExitModule(
  safeAddress: string,
  chainId: number,
  args: ExitModuleParams
) {
  const provider = getProvider(chainId);
  const txs: Transaction[] = [];
  const { executor, tokenContract } = args;

  let isERC721 = false;
  try {
    const ERC721Contract = new Contract(
      tokenContract,
      ERC721_CONTRACT_ABI,
      provider
    );
    isERC721 = await ERC721Contract.supportsInterface("0x80ac58cd");
  } catch (err) {
    console.warn("deployExitModule: error determining token type");
  }

  const {
    transaction: deployCirculationSupplyTx,
    expectedAddress: circulatingSupplyAddress,
  } = deployCirculatingSupplyContract(
    safeAddress,
    chainId,
    tokenContract,
    Date.now().toString(),
    isERC721
  );

  txs.push(deployCirculationSupplyTx);

  const type = isERC721
    ? KnownContracts.EXIT_ERC721
    : KnownContracts.EXIT_ERC20;

  const { transaction, expectedModuleAddress } = deployAndSetUpModule(
    type,
    {
      types: ["address", "address", "address", "address", "address"],
      values: [
        safeAddress,
        safeAddress,
        executor,
        tokenContract,
        circulatingSupplyAddress,
      ],
    },
    provider,
    chainId,
    Date.now().toString()
  );
  txs.push({
    ...transaction,
    value: transaction.value.toString(),
  });

  const enableModuleTransaction = enableModule(
    safeAddress,
    chainId,
    expectedModuleAddress
  );
  txs.push(enableModuleTransaction);

  return txs;
}

export async function fetchSafeModulesAddress(
  safeAddress: string,
  chainId: number
) {
  const provider = getProvider(chainId);
  const safe = new Contract(safeAddress, SafeAbi, provider);
  const [modules] = await safe.getModulesPaginated(AddressOne, 50);
  return modules as string[];
}

export function enableModule(
  safeAddress: string,
  chainId: number,
  module: string
) {
  const provider = getProvider(chainId);
  const safe = new Contract(safeAddress, SafeAbi, provider);
  return buildTransaction(safe, "enableModule", [module]);
}

export async function disableModule(
  safeAddress: string,
  chainId: number,
  module: string
) {
  const provider = getProvider(chainId);
  const modules = await fetchSafeModulesAddress(safeAddress, chainId);
  if (!modules.length) throw new Error("Safe does not have enabled modules");
  let prevModule = AddressOne;
  const safe = new Contract(safeAddress, SafeAbi, provider);
  if (modules.length > 1) {
    const moduleIndex = modules.findIndex(
      (m) => m.toLowerCase() === module.toLowerCase()
    );
    if (moduleIndex > 0) prevModule = modules[moduleIndex - 1];
  }
  const params = [prevModule, module];
  return {
    params,
    ...buildTransaction(safe, "disableModule", params),
  };
}

export const callContract = (
  chainId: number,
  address: string,
  abi: ContractInterface,
  method: string,
  data: any[] = []
) => {
  const contract = new Contract(address, abi, getProvider(chainId));
  return contract.functions[method](...data);
};

export async function fetchSafeTransactions(
  chainId: number,
  safeAddress: string,
  params: Record<string, string>
) {
  const network = getNetworkExplorerInfo(chainId);
  if (!network) return [];

  const url = new URL(
    `api/v1/safes/${safeAddress}/transactions`,
    network.safeTransactionApi
  );

  Object.entries(params).forEach(([key, value]) =>
    url.searchParams.set(key, value)
  );

  const request = await fetch(url.toString());
  const response = await request.json();

  return response.results as SafeTransaction[];
}

export async function fetchSafeInfo(chainId: number, safeAddress: string) {
  const network = getNetworkExplorerInfo(chainId);
  if (!network) throw new Error("invalid network");

  const url = new URL(
    `api/v1/safes/${safeAddress}`,
    network.safeTransactionApi
  );

  const request = await fetch(url.toString());
  const response = await request.json();
  return response as SafeInfo;
}

export function deployRolesModifier(
  safeAddress: string,
  chainId: number,
  args: RolesModifierParams
) {
  const provider = getProvider(chainId);
  const { target } = args;
  const {
    transaction: rolesModifierDeploymentTx,
    expectedModuleAddress: rolesModifierExpectedAddress,
  } = deployAndSetUpModule(
    KnownContracts.ROLES,
    {
      types: ["address", "address", "address"],
      values: [safeAddress, safeAddress, target],
    },
    provider,
    chainId,
    Date.now().toString()
  );
  const enableRolesModifierTransaction = enableModule(
    safeAddress,
    chainId,
    rolesModifierExpectedAddress
  );

  return [
    {
      ...rolesModifierDeploymentTx,
      value: rolesModifierDeploymentTx.value.toString(),
    },
    enableRolesModifierTransaction,
  ];
}

export function deployOptimisticGovernorModule(
  safeAddress: string,
  chainId: number,
  args: OptimisticGovernorModuleParams
) {
  const type = KnownContracts.OPTIMISTIC_GOVERNOR
  const provider = getProvider(chainId);

  const {
    executor,
    collateral,
    bond,
    rules,
    identifier,
    liveness
  } = args;

  const scaledBond = scaleBondDecimals(collateral, bond).toString()

  const {
    transaction: daoModuleDeploymentTx,
    expectedModuleAddress: daoModuleExpectedAddress,
  } = deployAndSetUpModule(
    type,
    {
      types: [
        "address",
        "address",
        "uint256",
        "string",
        "bytes32",
        "uint64"
      ],
      values: [
        executor,
        collateral,
        scaledBond,
        rules,
        identifier,
        liveness
      ],
    },
    provider,
    chainId,
    Date.now().toString()
  );

  const daoModuleTransactions: Transaction[] = [
    {
      ...daoModuleDeploymentTx,
      value: daoModuleDeploymentTx.value.toString(),
    }
  ];

  if (executor !== safeAddress) {
    const delayModule = getModuleInstance(
      KnownContracts.DELAY,
      executor,
      provider
    );
    const addModuleTransaction = buildTransaction(delayModule, "enableModule", [
      daoModuleExpectedAddress,
    ]);

    daoModuleTransactions.push(addModuleTransaction);
  } else {
    const enableDaoModuleTransaction = enableModule(
      safeAddress,
      chainId,
      daoModuleExpectedAddress
    );
    daoModuleTransactions.push(enableDaoModuleTransaction);
  }

  return daoModuleTransactions;
}
