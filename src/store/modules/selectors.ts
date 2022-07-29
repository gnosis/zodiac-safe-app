import { RootState } from "../index";
import { isRealityModule, isDelayModule } from "./helpers";
import { ModuleOperation } from "./models";

export function getCurrentModule(state: RootState) {
  return state.modules.current;
}

export function getModulesList(state: RootState) {
  return state.modules.list;
}

export function getReloadCount(state: RootState) {
  return state.modules.reloadCount;
}

export function getIsLoadingModules(state: RootState) {
  return state.modules.loadingModules;
}

export function getDelayModules(state: RootState) {
  return getModulesList(state).filter(isDelayModule);
}

export function getRealityModules(state: RootState) {
  return getModulesList(state).filter(isRealityModule);
}

export function getOperation(state: RootState) {
  return state.modules.operation;
}

export function getPendingModules(state: RootState) {
  return state.modules.pendingModules;
}

export function getPendingCreateModuleTransactions(state: RootState) {
  return getPendingModules(state).filter(
    (tx) => tx.operation === ModuleOperation.CREATE
  );
}

export function getPendingRemoveModuleTransactions(state: RootState) {
  return getPendingModules(state).filter(
    (tx) => tx.operation === ModuleOperation.REMOVE
  );
}

export function getSafeThreshold(state: RootState) {
  return state.modules.safeThreshold;
}

export function getCurrentPendingModule(state: RootState) {
  return state.modules.currentPendingModule;
}

export function getModuleAdded(state: RootState) {
  return state.modules.moduleAdded;
}

export function getRealityModuleScreen(state: RootState) {
  return state.modules.realityModuleScreen;
}
