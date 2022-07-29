import {
  Button,
  Divider,
  FormControlLabel,
  Grid,
  Link,
  makeStyles,
  Radio,
  RadioGroup,
  Typography,
} from "@material-ui/core";
import { DangerAlert } from "components/Alert/DangerAlert";

import React, { useState } from "react";
import { useRootDispatch } from "store";
import { setRealityModuleScreen } from "store/modules";
import { colors, ZodiacPaper, ZodiacTextField } from "zodiac-ui-components";

interface ProposalSectionProps {
  handleNext: () => void;
}

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
  },
  paperContainer: {
    padding: theme.spacing(2),
  },

  radio: {
    marginLeft: -2,
    padding: 2,
    "& ~ .MuiFormControlLabel-label": {
      fontSize: 12,
      marginLeft: 4,
    },
    "&$checked": {
      color: colors.tan[1000],
    },
  },
  checked: {},
  textSubdued: {
    opacity: 0.7,
  },
  textFieldSmall: {
    "& .MuiFormLabel-root": {
      fontSize: 12,
    },
  },
}));

export const ProposalSection: React.FC<ProposalSectionProps> = ({ handleNext }) => {
  const classes = useStyles();
  const [value, setValue] = useState<"snapshot" | "custom">("snapshot");
  const dispatch = useRootDispatch();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue((event.target as HTMLInputElement).value as "snapshot" | "custom");
  };

  return (
    <ZodiacPaper borderStyle='single' className={classes.paperContainer}>
      <Grid container spacing={4} className={classes.container}>
        <Grid item>
          <Grid container spacing={2} className={classes.container}>
            <Grid item>
              <Typography variant='h3'>Configure Proposal Space</Typography>
            </Grid>
            <Grid item>
              <Typography>
                Add your preferred proposal type below to get started. If you’re unsure, we recommend starting with
                Snapshot.
              </Typography>
            </Grid>
            <Grid item>
              <Typography>
                Don’t have a snapshot space setup yet?{` `}
                <Link underline='always' href='https://snapshot.com' target={"_blank"} color='inherit'>
                  Get started here.
                </Link>
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Divider />
        </Grid>
        <Grid item>
          <Grid container spacing={2} className={classes.container}>
            <Grid item>
              <Typography variant='h4' color='textSecondary'>
                Proposal Configuration
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant='body2' className={classes.textSubdued}>
                Enter your snapshot space ENS domain below to get started. If you’d prefer to provide a custom proposal
                integration, select Custom and provide the appropriate URL where the proposals can be viewed publicly.
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant='body2'>Select your proposal type:</Typography>
              <RadioGroup aria-label='proposal type' name='proposalType' value={value} onChange={handleChange}>
                <FormControlLabel
                  value='snapshot'
                  control={<Radio classes={{ root: classes.radio, checked: classes.checked }} />}
                  label='Snapshot'
                />
                <FormControlLabel
                  value='custom'
                  control={<Radio classes={{ root: classes.radio, checked: classes.checked }} />}
                  label='Custom'
                />
              </RadioGroup>
            </Grid>
            <Grid item>
              <ZodiacTextField
                label='Enter your snapshot ENS domain.'
                placeholder='weenus.eth'
                borderStyle='double'
                className={classes.textFieldSmall}
              />
            </Grid>
            <Grid item>
              <DangerAlert address='0x4589fCbf4ec91a6EE0f760287cbFEBBEd5431D0a' />
            </Grid>
          </Grid>
        </Grid>
        <Grid item style={{ paddingBottom: 0 }}>
          <Divider />
        </Grid>
        <Grid item>
          <Grid container spacing={3} justifyContent='center' alignItems='center'>
            <Grid item>
              <Button size='medium' variant='text' onClick={() => dispatch(setRealityModuleScreen(false))}>
                Cancel
              </Button>
            </Grid>
            <Grid item>
              <Button color='secondary' size='medium' variant='contained' onClick={handleNext}>
                Next
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </ZodiacPaper>
  );
};
