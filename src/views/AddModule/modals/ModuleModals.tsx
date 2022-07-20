import React from "react";
import {TellorModuleModal} from "./TellorModuleModal";
import { OptimisticGovernorModuleModal } from "./OptimisticGovernorModuleModal";
import { RealityModuleModal } from "./RealityModuleModal";
import { DelayModuleModal } from "./DelayModuleModal";
import { ModuleType } from "../../../store/modules/models";
import { CustomModuleModal } from "./CustomModuleModal";
import { AMBModuleModal } from "./AMBModuleModal";
import { ExitModuleModal } from "./ExitModuleModal";
import { RolesModifierModal } from "./RolesModifierModal";

interface ModuleModalsProps {
  selected?: ModuleType;

  onClose?(): void;

  onSubmit?(module: ModuleType): void;
}

export const ModuleModals = ({
  selected,
  onClose,
  onSubmit,
}: ModuleModalsProps) => {
  return (
    <>
      <TellorModuleModal
        open={selected === ModuleType.TELLOR}
        onClose={onClose}
        onSubmit={() => onSubmit && onSubmit(ModuleType.TELLOR)}
      />
      <OptimisticGovernorModuleModal
        open={selected === ModuleType.OPTIMISTIC_GOVERNOR}
        onClose={onClose}
        onSubmit={() => onSubmit && onSubmit(ModuleType.OPTIMISTIC_GOVERNOR)}
      />
      <RealityModuleModal
        open={selected === ModuleType.REALITY_ETH}
        onClose={onClose}
        onSubmit={() => onSubmit && onSubmit(ModuleType.REALITY_ETH)}
      />
      <DelayModuleModal
        open={selected === ModuleType.DELAY}
        onClose={onClose}
        onSubmit={() => onSubmit && onSubmit(ModuleType.DELAY)}
      />
      <AMBModuleModal
        open={selected === ModuleType.BRIDGE}
        onClose={onClose}
        onSubmit={() => onSubmit && onSubmit(ModuleType.BRIDGE)}
      />
      <ExitModuleModal
        open={selected === ModuleType.EXIT}
        onClose={onClose}
        onSubmit={() => onSubmit && onSubmit(ModuleType.EXIT)}
      />
      <RolesModifierModal
        open={selected === ModuleType.ROLES}
        onClose={onClose}
        onSubmit={() => onSubmit && onSubmit(ModuleType.DELAY)}
      />
      <CustomModuleModal
        open={selected === ModuleType.UNKNOWN}
        onClose={onClose}
        onSubmit={() => onSubmit && onSubmit(ModuleType.UNKNOWN)}
      />
    </>
  );
};
