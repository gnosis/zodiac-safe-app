import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Module, ModulesState, ModuleType } from "./models";
import { fetchSafeModulesAddress } from "../../services";
import { getModule } from "../../utils/contracts";
import SafeAppsSDK from "@gnosis.pm/safe-apps-sdk";
import { isDelayModule } from "../../utils/modulesValidation";

const initialModulesState: ModulesState = {
  reloadCount: 0,
  loadingModules: false,
  list: [],
  current: undefined,
};

export const fetchModulesList = createAsyncThunk(
  "modules/fetchModulesList",
  async ({
    safeSDK,
    safeAddress,
    chainId,
  }: {
    safeSDK: SafeAppsSDK;
    chainId: number;
    safeAddress: string;
  }): Promise<Module[]> => {
    // @TODO: Create a sanitize function which retrieve the subModules
    const moduleAddress = await fetchSafeModulesAddress(safeAddress);
    const requests = moduleAddress.map(
      async (moduleAddress): Promise<Module> => {
        let name = "Unknown";
        let type = ModuleType.UNKNOWN;
        try {
          const module = await getModule(safeSDK, chainId, moduleAddress);
          name = module.name;
          if (name === "DelayModule") {
            const code = await safeSDK.eth.getCode([module.implAddress]);
            if (isDelayModule(code)) {
              name = "Delay Module";
              type = ModuleType.DELAY;
            }
          }
        } catch (error) {
          console.log("unable to fetch source code");
        }

        return {
          name,
          address: moduleAddress,
          subModules: [],
          type,
        };
      }
    );

    requests.reverse();

    return await Promise.all(requests);
  }
);

export const modulesSlice = createSlice({
  name: "modules",
  initialState: initialModulesState,
  reducers: {
    increaseReloadCount: (state) => {
      state.reloadCount += 1;
    },
    setModules(state, action: PayloadAction<Module[]>) {
      state.list = action.payload;
    },
    setCurrentModule(state, action: PayloadAction<Module>) {
      state.current = action.payload;
    },
    unsetCurrentModule(state) {
      state.current = undefined;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchModulesList.pending, (state) => {
      state.loadingModules = true;
    });
    builder.addCase(fetchModulesList.rejected, (state, action) => {
      state.loadingModules = false;
    });
    builder.addCase(fetchModulesList.fulfilled, (state, action) => {
      state.loadingModules = false;
      state.list = action.payload;
    });
  },
});

export const {
  increaseReloadCount,
  setCurrentModule,
  setModules,
  unsetCurrentModule,
} = modulesSlice.actions;