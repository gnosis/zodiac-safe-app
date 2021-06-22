import { FunctionFragment } from "@ethersproject/abi";
import memoize from "lodash.memoize";
import { getNetworkExplorerInfo } from "./explorers";

export const isWriteFunction = (method: FunctionFragment) => {
  if (!method.stateMutability) return true;
  return !["view", "pure"].includes(method.stateMutability);
};

export const isReadFunction = (method: FunctionFragment) => {
  return !isWriteFunction(method);
};

export const fetchContractABI = memoize(
  async (chainId: number, contractAddress: string) => {
    const network = getNetworkExplorerInfo(chainId);

    if (!network) throw new Error("Network data not found");

    const { apiUrl } = network;

    const params = new URLSearchParams({
      module: "contract",
      action: "getAbi",
      address: contractAddress,
    });

    const response = await fetch(`${apiUrl}?${params}`);

    if (!response.ok) throw new Error("Could not fetch ABI");

    const { status, result } = await response.json();
    if (status === "0") throw new Error("Could not fetch ABI");

    return result as string;
  }
);