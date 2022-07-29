import React from "react";
import { Box, Grid, makeStyles, MenuItem, Select, SelectProps, Tooltip, Typography } from "@material-ui/core";
import { colors } from "zodiac-ui-components";
import HelpOutline from "@material-ui/icons/HelpOutline";

const useStyles = makeStyles(() => ({
  label: {
    marginBottom: 4,
  },
  select: {
    border: `1px solid ${colors.tan[300]}`,
  },
  selectContainer: {
    padding: 2,
    boxSizing: "border-box",
    border: `1px solid ${colors.tan[300]}`,
  },
  icon: {
    fontSize: "1rem",
  },
}));

interface DropdownProps extends SelectProps {
  label?: string;
  options: { label: string; value: string | number }[];
  tooltipMsg?: string;
}

export const Dropdown: React.FC<DropdownProps> = (props) => {
  const classes = useStyles();

  return (
    <Box>
      {props.label && (
        <Grid container justifyContent='space-between' alignItems='center' className={classes.label}>
          <Grid item>
            <Typography>{props.label}</Typography>
          </Grid>
          {props.tooltipMsg && (
            <Grid item>
              <Tooltip title={props.tooltipMsg}>
                <HelpOutline className={classes.icon} />
              </Tooltip>
            </Grid>
          )}
        </Grid>
      )}

      <Box className={classes.selectContainer}>
        <Select {...props} className={classes.select}>
          {props.options.map((item) => (
            <MenuItem key={item.value} value={item.value}>
              {item.label}
              <Box className='show-if-selected' flexGrow={1} />
            </MenuItem>
          ))}
        </Select>
      </Box>
    </Box>
  );
};
