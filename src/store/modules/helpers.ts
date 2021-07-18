import { Provider, Contract } from "ethers-multicall";
import SafeAppsSDK from "@gnosis.pm/safe-apps-sdk";
import { JsonRpcProvider } from "@ethersproject/providers";
import { getModule } from "@gnosis/module-factory";
import { Fragment } from "@ethersproject/abi";
import { isDelayModuleBytecode } from "utils/modulesValidation";
import { getModuleDataFromEtherscan } from "utils/contracts";
import { DelayModule, Module, ModuleType } from "./models";

export const AddressOne = "0x0000000000000000000000000000000000000001";

export function isDelayModule(module: Module): module is DelayModule {
  return module.type === ModuleType.DELAY;
}

export const sanitizeModules = async (
  moduleAddress: string,
  safe: SafeAppsSDK,
  chainId: number
): Promise<Module> => {
  let name = "Unknown";
  let type = ModuleType.UNKNOWN;
  const module = await getModuleDataFromEtherscan(safe, chainId, moduleAddress);
  name = module.name;
  if (name === "DelayModule") {
    const code = await safe.eth.getCode([module.implAddress]);
    if (isDelayModuleBytecode(code)) {
      return await fetchDelayModule(moduleAddress, safe, chainId);
    }
  }
  return {
    name,
    type,
    address: moduleAddress,
  };
};

export async function fetchDelayModule(
  address: string,
  safe: SafeAppsSDK,
  chainId: number
): Promise<DelayModule> {
  // TODO: Fetch Delay Module Data
  const provider = new JsonRpcProvider(
    `https://rinkeby.infura.io/v3/${process.env.REACT_APP_INFURA_ID}`
  );
  const delayModule = await getModule("delay", address, provider);
  const module = new Contract(
    delayModule.address,
    delayModule.interface.fragments as Fragment[]
  );
  const ethCallProvider = new Provider(provider, chainId);
  const txCooldown = module.txCooldown();
  const txTimeout = module.txExpiration();
  const modules = module.getModulesPaginated(AddressOne, 10);
  try {
    let [cooldown, timeout, [subModules]] = await ethCallProvider.all([
      txCooldown,
      txTimeout,
      modules,
    ]);

    if (subModules) {
      const requests = subModules.map((m: string) =>
        sanitizeModules(m, safe, chainId)
      );

      requests.reverse();
      subModules = await Promise.all(requests);
    }

    return {
      name: "Delay Module",
      type: ModuleType.DELAY,
      address,
      subModules,
      timeout: timeout.toString(),
      cooldown: cooldown.toString(),
    };
  } catch (error) {
    console.log("Eror fetching delay module");
    console.log({ error });
    return {
      name: "Delay Module",
      type: ModuleType.DELAY,
      address: address,
      subModules: [],
      timeout: 86400,
      cooldown: 86400,
    };
  }
}
