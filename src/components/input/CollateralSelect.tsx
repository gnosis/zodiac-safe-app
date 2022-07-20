import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
} from "@material-ui/core";
import { ReactComponent as CheckmarkIcon } from "../../assets/icons/checkmark.svg";
import { getCollateral, COLLATERAL_OPTIONS } from "../../services";
import { NETWORK } from "../../utils/networks";

export const collateralOptions = {
  USDC: "USDC",
  WETH: "WETH",
};

export function scaleBondDecimals(collateralAddress: string, bond: string): number {
  switch (collateralAddress) {
    case "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48":
      return Number(bond) * Math.pow(10, 6);
    case "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174":
      return Number(bond) * Math.pow(10, 6);
    case "0xeb8f08a975Ab53E34D8a0330E0D34de942C95926":
      return Number(bond) * Math.pow(10, 6);
    case "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2":
      return Number(bond) * Math.pow(10, 18);
    case "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619":
      return Number(bond) * Math.pow(10, 18);
    case "0xc778417E063141139Fce010982780140Aa0cD5Ab":
      return Number(bond) * Math.pow(10, 18);
  }
  return 18;
}

// List of chain IDs where OG is available.
const optimisticGovernorAvailability: number[] = [
  NETWORK.MAINNET,
  NETWORK.RINKEBY,
  NETWORK.POLYGON,
];

type Option = keyof typeof collateralOptions;

interface CollateralSelectProps {
  defaultAddress?: string;
  defaultOption?: string;
  label: string;
  chainId: number;

  onChange(collateral: string): void;
}

const useStyles = makeStyles((theme) => ({
  root: {
    position: "relative",
    flexWrap: "nowrap",
    justifyContent: "flex-end",
  },
  label: {
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(1),
  },
  inputContainer: {
    flexGrow: 1,
  },
  input: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    "& input": {
      textAlign: "right",
    },
  },
  select: {
    marginBottom: -1,
    textIndent: theme.spacing(1),
  },
  itemList: {
    padding: 0,
  },
  item: {
    display: "flex",
    flexDirection: "row",
    padding: theme.spacing(1.5, 1),
    "&:not(:last-child)": {
      borderBottomWidth: 1,
      borderBottomStyle: "solid",
      borderBottomColor: theme.palette.primary.light,
    },
    "& .show-if-selected": {
      display: "none",
    },
    "&.Mui-selected .show-if-selected": {
      display: "block",
    },
    "&.Mui-selected::after": {
      content: '""',
      right: 0,
      top: 0,
    },
  },
  dropdownContainer: {
    maxWidth: "100%",
  },
  dropdown: {
    borderRadius: 8,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderTopWidth: 2,
    borderTopColor: theme.palette.primary.light,
    borderTopStyle: "solid",
    marginTop: -1,
  },
}));

export const CollateralSelect = ({
  onChange,
  defaultOption = collateralOptions.USDC,
  label,
  chainId,
}: CollateralSelectProps) => {
  const classes = useStyles();
  const [option, setOption] = useState<string>(defaultOption);

  const [open, setOpen] = useState(false);

  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);

  const selectRef = React.useRef<HTMLDivElement>(null);

  const handleCollateralOptionChange = (newOption: string) => {
    handleClose();
    const newOptionKey = Object.keys(collateralOptions).find(
      (k) => collateralOptions[`${k}` as Option] === newOption
    ) as Option;
    setOption(newOption);
    const newCollateral = getCollateral(
      chainId,
      COLLATERAL_OPTIONS[newOptionKey]
    );
    onChange(newCollateral);
  };

  useEffect(() => {
    if (selectRef.current) {
      selectRef.current.addEventListener("keyup", (event) => {
        if (event.code === "Tab") handleOpen();
      });
    }
  }, [selectRef]);

  return (
    <div>
      <InputLabel className={classes.label}>{label}</InputLabel>
      <Grid container className={classes.root}>
        <Grid item xs={12} className={classes.dropdownContainer}>
          <Select
            disableUnderline
            open={open}
            value={option}
            ref={selectRef}
            onOpen={handleOpen}
            onClose={handleClose}
            className={classes.select}
            MenuProps={{
              anchorOrigin: {
                vertical: "bottom",
                horizontal: "left",
              },
              anchorPosition: {
                top: 0,
                left: 0,
              },
              getContentAnchorEl: null,
              elevation: 0,
              classes: {
                paper: classes.dropdown,
                list: classes.itemList,
              },
            }}
            renderValue={(value) => value as string}
            onChange={(evt) =>
              handleCollateralOptionChange(evt.target.value as string)
            }
          >
            {Object.keys(collateralOptions).map((optionKey) => {
              if (
                !optimisticGovernorAvailability.includes(chainId) &&
                optionKey === "WETH"
              ) {
                return null;
              }
              return (
                <MenuItem
                  key={optionKey}
                  value={collateralOptions[`${optionKey}` as Option]}
                  className={classes.item}
                >
                  {collateralOptions[`${optionKey}` as Option]}
                  <Box className="show-if-selected" flexGrow={1} />
                  <CheckmarkIcon className="show-if-selected" />
                </MenuItem>
              );
            })}
          </Select>
        </Grid>
      </Grid>
    </div>
  );
};
