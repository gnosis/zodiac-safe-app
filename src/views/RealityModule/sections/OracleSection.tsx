import { Button, Divider, Grid, Link, makeStyles, Typography } from "@material-ui/core";
import { Dropdown } from "components/dropdown/Dropdown";
import { TimeSelect } from "components/input/TimeSelect";
import React, { useState } from "react";
import { colors, ZodiacPaper, ZodiacTextField } from "zodiac-ui-components";

interface OracleSectionProps {
  handleNext: () => void;
  handleBack: () => void;
}

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
  },

  paperContainer: {
    padding: theme.spacing(2),
  },

  row: {
    width: "50%",
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
  select: {
    border: "1px solid rgba(217, 212, 173, 0.3)",
  },
  paperTemplateContainer: {
    marginTop: 4,
    padding: theme.spacing(2),
    background: "rgba(0, 0, 0, 0.2)",
  },
}));

export const OracleSection: React.FC<OracleSectionProps> = ({ handleBack, handleNext }) => {
  const classes = useStyles();
  const [template, setTemplate] = useState<string>("default")
  return (
    <ZodiacPaper borderStyle='single' className={classes.paperContainer}>
      <Grid container spacing={4} className={classes.container}>
        <Grid item>
          <Grid container spacing={2} className={classes.container}>
            <Grid item>
              <Typography variant='h3'>Set up the Oracle</Typography>
            </Grid>
            <Grid item>
              <Typography>
                Now, it’s time to set up the oracle for your reality module. The oracle ensures the results of proposals
                are brought accurately on-chain. The Reality.eth oracle uses a mechanism known as the{" "}
                <Link underline='always' href='https://snapshot.com' target={"_blank"} color='inherit'>
                  escalation game
                </Link>{" "}
                to generate correct answers that can be used as inputs for smart contracts. The following parameters are
                very important for your DAO's security and should be considered carefully.
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
                Oracle Template
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant='body2' className={classes.textSubdued}>
                The oracle template creates an appropriate question based on the data of the proposal. We highly
                recommend using the default Zodiac Reality Module template
              </Typography>
            </Grid>
          </Grid>
        </Grid>

        <Grid item>
          <Grid container justifyContent='space-between' spacing={2} alignItems='center'>
            <Grid item xs={6}>
              <Dropdown
                value={template}
                options={[{ label: "Zodiac Reality Module (default)", value: "default" }, { label: "Custom", value: "custom" }]}
                onChange={(evt) => setTemplate(evt.target.value as string)}
                disableUnderline
                label='Select template:'
                tooltipMsg='The Zodiac Reality Module type has defaults set for connecting the Reality Module to Safesnap. If you need a more specific setup, use the ‘Custom’ type.'
              />
            </Grid>
            <Grid item xs={6}>
              <Dropdown
                options={[{ label: "English", value: "english" }]}
                disableUnderline
                label='Language:'
                onChange={(evt) => console.log("evt", evt.target.value)}
              />
            </Grid>
            {template === "custom" && <>
              <Grid item xs={6}>
                <Dropdown
                  value="DAO"
                  options={[{ label: "DAO Proposal", value: "DAO" }]}
                  onChange={(evt) => console.log('evt', evt)}
                  disableUnderline
                  label='Category:'
                  tooltipMsg='This will help categorize the oracle question in reality.eth so it can be found more easily.'
                />
              </Grid>
              <Grid item xs={6}>
                <Dropdown
                  value="bool"
                  options={[{ label: "Bool", value: "bool" }]}
                  disableUnderline
                  label='Type:'
                  onChange={(evt) => console.log("evt", evt.target.value)}
                  tooltipMsg="This corresponds with the type of proposal being submitted."
                />
              </Grid>
            </>}
            <Grid item>
              <Typography>Template question preview:</Typography>
              <ZodiacPaper className={classes.paperTemplateContainer}>
                <Typography>
                  Did the Snapshot proposal with the id %s in the weenus.eth space pass the execution of the array of
                  Module transactions that have the hash 0x%s and does it meet the requirements of the document
                  referenced in the dao requirements record at weenust.eth? The hash is the keccak of the concatenation
                  of the individual EIP-712 hashes of the Module transactions. If this question was asked before the
                  corresponding Snapshot proposal was resolved, it should ALWAYS be resolved to INVALID!
                </Typography>
              </ZodiacPaper>
            </Grid>
          </Grid>
        </Grid>

        <Grid item>
          <Grid container spacing={2} className={classes.container}>
            <Grid item>
              <Typography variant='h4' color='textSecondary'>
                Oracle Instance
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant='body2' className={classes.textSubdued}>
                The oracle instance sets the appropriate bond token. It’s recommended to use the default (ETH) oracle
                instance unless you have a specific reason to use something like a native token which can potentially be
                more prone to price manipulation.
              </Typography>
            </Grid>
            <Grid item>
              <Dropdown
                options={[{ label: "ETH - 0xDf33060F476511F806C72719394da1Ad64", value: "0x" }]}
                disableUnderline
                label='Select oracle:'
                onChange={(evt) => console.log("evt", evt.target.value)}
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid item>
          <Grid container spacing={2} className={classes.container}>
            <Grid item>
              <Typography variant='h4' color='textSecondary'>
                Delay Configuration
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant='body2' className={classes.textSubdued}>
                These Parameters are very important for your DAO’s security and should be considered carefully. Allowing
                enough time in these configurations will enable the safe to have a final chance to veto or circumvent
                any potential malicious proposals that have snuck through.
              </Typography>
            </Grid>
            <Grid item>
              <Grid container spacing={6} alignItems='center' justifyContent='space-between'>
                <Grid item >
                  <TimeSelect
                    variant='secondary'
                    label='Timeout'
                    tooltipMsg='Duration that answers can be submitted to the oracle (resets when a new answer is submitted)'
                    defaultUnit='hours'
                    onChange={(value) => console.log("value", value)}
                  />
                </Grid>
                <Grid item >
                  <TimeSelect
                    variant='secondary'
                    label='Cooldown'
                    tooltipMsg='Duration required before the transaction can be executed (after the timeout has expired).'
                    defaultUnit='hours'
                    onChange={(value) => console.log("value", value)}
                  />
                </Grid>
                <Grid item >
                  <TimeSelect
                    variant='secondary'
                    label='Expiration'
                    tooltipMsg='Duration that a transaction is valid in seconds (or 0 if valid forever) after the cooldown (note this applies to all proposals on this module).'
                    defaultUnit='hours'
                    onChange={(value) => console.log("value", value)}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid item>
          <Grid container spacing={2} className={classes.container}>
            <Grid item>
              <Typography variant='h4' color='textSecondary'>
                Bond
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant='body2' className={classes.textSubdued}>
                Minimum bond required for an answer to be accepted. New answers must be submitted with double the
                previous bond. For more on why a bond is required in an escalation-game-based oracle, read more in the
                {` `}
                <Link
                  underline='always'
                  href='http://reality.eth.link/app/docs/html/whitepaper.html'
                  target={"_blank"}
                  color='inherit'>
                  Reality.eth whitepaper.
                </Link>
              </Typography>
            </Grid>
            <Grid item>
              <ZodiacTextField label='Bond' color='secondary' borderStyle="double" />
            </Grid>
          </Grid>
        </Grid>

        <Grid item style={{ paddingBottom: 0 }}>
          <Divider />
        </Grid>

        <Grid item>
          <Grid container spacing={3} justifyContent='center' alignItems='center'>
            <Grid item>
              <Button size='medium' variant='text' onClick={handleBack}>
                Back
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
