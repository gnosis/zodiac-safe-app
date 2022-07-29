import React from "react";
import {
  Grid,
  GridProps,
  InputBase,
  InputLabel,
  makeStyles,
  StandardTextFieldProps,
  TextField as MUITextField,
  Tooltip,
  withStyles,
} from "@material-ui/core";
import classNames from "classnames";
import { colors } from "zodiac-ui-components";
import HelpOutline from "@material-ui/icons/HelpOutline";

const StyledTextField = withStyles((theme) => ({
  root: {
    "& label.Mui-focused": {
      position: "relative",
      transform: "none",
      color: theme.palette.text.primary,
      marginBottom: theme.spacing(1),
    },
    "& .MuiInputBase-root": {
      marginTop: 0,
      minHeight: "37px",
    },
    "& .MuiSelect-select:focus": {
      backgroundColor: "transparent",
    },
  },
}))(MUITextField);

const useStyles = makeStyles((theme) => ({
  root: {
    position: "relative",
    flexWrap: "nowrap",
    justifyContent: "flex-end",
  },
  label: {
    color: theme.palette.text.primary,
    marginBottom: "4px",
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
  icon: {
    fontSize: "1rem",
  },
  append: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(1),
    borderWidth: 1,
    borderStyle: "solid",
    borderLeftWidth: 0,
  },
  primary: {
    borderColor: theme.palette.primary.light,
  },
  secondary: {
    borderColor: colors.tan[300],
  },
}));

export interface TextFieldProps extends Omit<StandardTextFieldProps, "variant" | "label"> {
  label?: string;
  append?: React.ReactElement | string;
  AppendProps?: GridProps;
  variantAppend?: "primary" | "secondary";
  tooltipMsg?: string;
}

export const TextField = ({
  InputProps,
  InputLabelProps,
  label,
  append,
  variantAppend,
  AppendProps,
  tooltipMsg,
  ...props
}: TextFieldProps) => {
  const classes = useStyles();

  if (props.select || !append) {
    return (
      <StyledTextField
        focused={!props.disabled}
        label={label}
        placeholder={label}
        InputProps={{
          disableUnderline: true,
          ...InputProps,
        }}
        InputLabelProps={{
          shrink: true,
          ...InputLabelProps,
        }}
        {...props}
      />
    );
  }

  return (
    <div>
      <Grid container justifyContent='space-between' alignItems='center'>
        <Grid item>
          <InputLabel {...InputLabelProps} className={classes.label}>
            {label}
          </InputLabel>
        </Grid>
        {tooltipMsg && (
          <Grid item>
            <Tooltip title={tooltipMsg}>
              <HelpOutline className={classes.icon} />
            </Tooltip>
          </Grid>
        )}
      </Grid>
      <Grid container className={classes.root}>
        <Grid item className={classes.inputContainer}>
          <InputBase
            disabled={props.disabled}
            placeholder={props.placeholder}
            onClick={props.onClick}
            inputMode={props.inputMode}
            value={props.value}
            onChange={props.onChange}
            {...InputProps}
            className={classNames(classes.input, InputProps?.className)}
          />
        </Grid>
        <Grid
          item
          xs={8}
          {...AppendProps}
          className={classNames(
            `${classes.append} ${variantAppend === "primary" ? classes.primary : classes.secondary}`,
            AppendProps?.className
          )}>
          {append}
        </Grid>
      </Grid>
    </div>
  );
};
