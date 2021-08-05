import React from "react";
import ReactDOM from "react-dom";
import { Badge, makeStyles } from "@material-ui/core";
import { TransactionBuilderTitle } from "./TransactionBuilderTitle";
import { Row } from "../../components/layout/Row";
import { ReactComponent as BagIcon } from "../../assets/icons/bag-icon.svg";
import { useRootDispatch, useRootSelector } from "../../store";
import { setTransactionBuilderOpen } from "../../store/transactionBuilder";
import { getTransactions } from "../../store/transactionBuilder/selectors";

const rootElement = document.getElementById("root");

const useStyles = makeStyles((theme) => ({
  root: {
    right: 0,
    bottom: 0,
    position: "absolute",
    cursor: "pointer",
    padding: theme.spacing(1.5),
    borderTopLeftRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.common.white,
    alignItems: "center",
    zIndex: 1,
  },
  bagIcon: {
    marginLeft: theme.spacing(4),
  },
  badge: {
    marginTop: 8,
    marginRight: 8,
  },
}));

export const TransactionBuilderTab = () => {
  const classes = useStyles();
  const dispatch = useRootDispatch();
  const transaction = useRootSelector(getTransactions);

  const handleOpen = () => dispatch(setTransactionBuilderOpen(true));

  const button = (
    <Row className={classes.root} onClick={handleOpen}>
      <TransactionBuilderTitle />
      <Badge
        badgeContent={transaction.length}
        color="error"
        classes={{ badge: classes.badge }}
      >
        <BagIcon className={classes.bagIcon} />
      </Badge>
    </Row>
  );
  return ReactDOM.createPortal(button, rootElement as HTMLElement);
};