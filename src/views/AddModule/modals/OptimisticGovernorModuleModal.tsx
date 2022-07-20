import React, { useState } from "react";
import { useSafeAppsSDK } from "@gnosis.pm/safe-apps-react-sdk";
import { Grid, makeStyles, Typography } from "@material-ui/core";
import { AddModuleModal } from "./AddModuleModal";
import {
  deployOptimisticGovernorModule,
  getFinder,
  getCollateral,
} from "../../../services";
import { useRootSelector } from "../../../store";
import { AttachModuleForm } from "../AttachModuleForm";
import { getDelayModules } from "../../../store/modules/selectors";
import { TimeSelect } from "../../../components/input/TimeSelect";
import { ModuleType } from "../../../store/modules/models";
import { ParamInput } from "../../../components/ethereum/ParamInput";
import { ParamType } from "@ethersproject/abi";
import {
  collateralOptions,
  CollateralSelect,
} from "../../../components/input/CollateralSelect";

interface OptimisticGovernorModuleModalProps {
  open: boolean;

  onClose?(): void;

  onSubmit?(): void;
}

interface OptimisticGovernorModuleParams {
  finder: string;
  owner: string;
  collateral: string;
  bond: string;
  rules: string;
  identifier: string;
  liveness: string;
  snapshotURL: string;
  votingQuorum: string;
  votingPeriod: string;
}

const useStyles = makeStyles((theme) => ({
  fields: {
    marginBottom: theme.spacing(1),
  },
  loadMessage: {
    textAlign: "center",
  },
}));

export const OptimisticGovernorModuleModal = ({
  open,
  onClose,
  onSubmit,
}: OptimisticGovernorModuleModalProps) => {
  const classes = useStyles();
  const { sdk, safe } = useSafeAppsSDK();

  const delayModules = useRootSelector(getDelayModules);
  const [delayModule, setDelayModule] = useState<string>(
    delayModules.length === 1 ? delayModules[0].address : ""
  );
  const [params, setParams] = useState<OptimisticGovernorModuleParams>({
    finder: getFinder(safe.chainId),
    owner: safe.safeAddress,
    collateral: getCollateral(safe.chainId, 1),
    bond: "0",
    rules: "",
    identifier:
      "0x5a4f444941430000000000000000000000000000000000000000000000000000",
    liveness: "86400",
    snapshotURL: "https://snapshot.space/",
    votingQuorum: "5",
    votingPeriod: "24",
  });
  const [validFields, setValidFields] = useState({
    finder: !!params.finder,
    bond: params.bond !== "0",
  });
  const isValid = Object.values(validFields).every((field) => field);

  const onParamChange = <Field extends keyof OptimisticGovernorModuleParams>(
    field: Field,
    value: OptimisticGovernorModuleParams[Field],
    valid?: boolean
  ) => {
    setParams({
      ...params,
      [field]: value,
    });
    if (valid !== undefined)
      setValidFields({
        ...validFields,
        [field]: valid,
      });
  };

  const handleAddOptimisticGovernorModule = async () => {
    try {
      const args = {
        ...params,
        owner: safe.safeAddress,
        executor: delayModule || safe.safeAddress,
      };
      const txs = deployOptimisticGovernorModule(
        safe.safeAddress,
        safe.chainId,
        args
      );
      await sdk.txs.send({ txs });
      if (onSubmit) onSubmit();
      if (onClose) onClose();
    } catch (error) {
      console.log("Error deploying module: ", error);
    }
  };

  const description = (
    <Typography variant="body2">
      This will add a timedelay to any transactions created by this module.{" "}
      <b>Note that this delay is cumulative with the cooldown set above</b>{" "}
      (e.g. if both are set to 24 hours, the cumulative delay before the
      transaction can be executed will be 48 hours).
    </Typography>
  );

  params.rules = `Proposals approved on Snapshot, as verified at ${params.snapshotURL}, are valid as long as there is a minimum quorum of ${params.votingQuorum}% and a minimum voting period of ${params.votingPeriod} hours and it does not appear that the Snapshot voting system is being exploited.`;

  return (
    <AddModuleModal
      open={open}
      onClose={onClose}
      title="Optimistic Governor Module"
      description="Allows successful Snapshot proposals to 
      execute transactions using UMA's optimistic oracle."
      icon="tellor"
      tags={["From Outcome Finance"]}
      onAdd={handleAddOptimisticGovernorModule}
      readMoreLink="https://docs.outcome.finance/optimistic-governance/what-is-the-optimistic-governor"
      ButtonProps={{ disabled: !isValid }}
    >
      <Typography gutterBottom>Parameters</Typography>

      <Grid container spacing={2} className={classes.fields}>
        <Grid item xs={12}>
          <CollateralSelect
            label="Collateral"
            defaultAddress={params.collateral}
            defaultOption={collateralOptions.USDC}
            onChange={(value) => onParamChange("collateral", value)}
            chainId={safe.chainId}
          />
        </Grid>
        <Grid item xs={6}>
          <ParamInput
            param={ParamType.from("uint256")}
            color="secondary"
            value={params.bond}
            label="Bond"
            onChange={(value, valid) => onParamChange("bond", value, valid)}
          />
        </Grid>
        <Grid item xs={6}>
          <TimeSelect
            label="Liveness"
            defaultValue={params.liveness}
            defaultUnit="hours"
            onChange={(value) => onParamChange("liveness", value)}
          />
        </Grid>
        <Grid item xs={12}>
          <ParamInput
            param={ParamType.from("string")}
            color="secondary"
            value={params.snapshotURL}
            label="Snapshot Space URL"
            onChange={(value, valid) =>
              onParamChange("snapshotURL", value, valid)
            }
          />
        </Grid>
        <Grid item xs={6}>
          <ParamInput
            param={ParamType.from("uint256")}
            color="secondary"
            value={params.votingQuorum}
            label="Voting Quorum (%)"
            onChange={(value, valid) =>
              onParamChange("votingQuorum", value, valid)
            }
          />
        </Grid>
        <Grid item xs={6}>
          <ParamInput
            param={ParamType.from("uint256")}
            color="secondary"
            value={params.votingPeriod}
            label="Voting Period (hours)"
            onChange={(value, valid) =>
              onParamChange("votingPeriod", value, valid)
            }
          />
        </Grid>
        <Grid item xs={12}>
          <Typography>Rules Parameter:</Typography>
          <Typography>{params.rules}</Typography>
        </Grid>
      </Grid>
      {delayModules.length ? (
        <>
          <Typography variant="h6" gutterBottom>
            Deploy Options
          </Typography>
          <AttachModuleForm
            description={description}
            modules={delayModules}
            value={delayModule}
            onChange={(value: string) => setDelayModule(value)}
            type={ModuleType.DELAY}
          />
        </>
      ) : null}
    </AddModuleModal>
  );
};
