import { Grid, makeStyles, Typography } from "@material-ui/core";
import React from "react";
import { ZodiacPaper } from "zodiac-ui-components";
import ErrorOutline from "@material-ui/icons/ErrorOutline";

interface AlertProps {
  address?: string;
}

const useStyles = makeStyles((theme) => ({
  paperContainer: {
    padding: theme.spacing(2),
    background: "rgba(244, 67, 54, 0.1)",
    border: "1px solid rgba(244, 67, 54, 0.3)",
    "&, &:before, &:after": {
      border: "1px solid rgba(244, 67, 54, 0.3)",
    },
  },
  addressPaperContainer: {
    padding: theme.spacing(1),
    background: "rgba(0, 0, 0, 0.2)",
    border: 0,
    borderRadius: 4,
    display: "inline-block",
    "& .MuiTypography-root": {
      fontFamily: "Roboto Mono",
    },
  },
}));

export const DangerAlert: React.FC<AlertProps> = ({ address }) => {
  const classes = useStyles();
  return (
    <ZodiacPaper borderStyle='double' className={classes.paperContainer}>
      <Grid container spacing={2} direction='column'>
        <Grid item>
          <Grid container spacing={1}>
            <Grid item>
              <ErrorOutline />
            </Grid>
            <Grid item>
              <Typography color='inherit'>Security Risk Detected:</Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Grid container spacing={1} direction='column'>
            <Grid item>
              <Typography variant='body2'>
                The ENS that you’ve entered is not owned by a safe. This gives unilateral control to the individual with
                this address:
              </Typography>
            </Grid>
            {address && (
              <Grid item>
                <ZodiacPaper borderStyle='single' className={classes.addressPaperContainer}>
                  <Typography variant='body2'>{address}</Typography>
                </ZodiacPaper>
              </Grid>
            )}
            <Grid item>
              <Typography variant='body2'>
                We recommend transferring the ENS to a multisig safe before continuing.
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </ZodiacPaper>
  );
};
