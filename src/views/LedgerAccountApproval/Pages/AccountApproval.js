import React, { useState, useEffect, Fragment } from 'react';
import {
  Box,
  Card,
  makeStyles,
  Container,
  Divider,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  InputLabel,
  CardHeader,
  Button,
  Typography,
  withStyles
} from '@material-ui/core';
import { Formik } from 'formik';
import * as Yup from "yup";
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import tokenDecoder from 'src/utils/tokenDecoder';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { useAlert } from "react-alert";
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";
import PerfectScrollbar from 'react-perfect-scrollbar';
import { confirmAlert } from 'react-confirm-alert';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
  avatar: {
    marginRight: theme.spacing(2)
  },
  colorCancel: {
    backgroundColor: "red",
  },
  colorRecord: {
    backgroundColor: "green",
  },
  cardPadding: {
    margin: theme.spacing(1),
  }

}));

const NameTextTypography = withStyles({
  root: {
    color: "#5D605F",
    paddingLeft: "15Px",
    paddingTop: "5Px"
  }
})(Typography);

const screenCode = 'LEDGERACCOUNTAPPROVAL';

export default function LedgerAccountApprovalEdit(props) {
  const [title, setTitle] = useState("Account Information")
  const classes = useStyles();
  const [DisableUserFields, setDisableUserFields] = useState(true);
  const [open, setOpen] = useState(true);
  const [isDisableButton, setIsDisableButton] = useState(true);
  const [NewRemark, setNewRemark] = useState("");
  const [ledgerAccount, setLedgerAccount] = useState({
    ledgerAccountID: 0,
    groupName: '',
    factoryName: '',
    accountTypeName: '',
    parentHeaderName: '',
    childHeaderName: '',
    ledgerAccountName: '',
    ledgerAccountCode: '',
    ledgerAccountDescription: '',
    isBank: false,
    bankName: '',
    branchName: '',
    accountNo: '',
    chequeNo: '',
    balance: '',
    balanceEntryTypeID: '',
    maximumAmount: '',
    balanceAsOFDate: '',
    createdDate: '',
    statusID: '',
    remarks: '',
    AccountTypeID: '',
    ParentHeaderID: '',
    ChildHeaderID: '',
    LedgerAccountID: '',
    GroupID: '',
    FactoryID: ''
  });

  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/app/ledgerAcoountApproval/listing');
  }
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });

  const alert = useAlert();
  const { ledgerAccountID } = useParams();
  const handleClose = () => {
    setIsDisableButton(false)
    setOpen(false);
  };
  let decrypted = 0;

  useEffect(() => {
    getPermissions();
  }, []);

  useEffect(() => {
    decrypted = atob(ledgerAccountID.toString());
    if (decrypted != 0) {
      trackPromise(
        getAccountDetails(decrypted),
      )
    }
  }, []);

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'APPROVEREJECTLEDGERACCOUNT');

    if (isAuthorized === undefined) {
      navigate('/404');
    }

    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
    });

    setLedgerAccount({
      ...ledgerAccount,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getAccountDetails(ledgerAccountID) {
    let response = await services.getAccountDetailsByLedgerAccountID(ledgerAccountID);
    let data = response;
    setLedgerAccount({
      ...ledgerAccount,
      ledgerAccountID: parseInt(ledgerAccountID),
      groupName: data.groupName,
      factoryName: data.factoryName,
      accountTypeName: data.accountTypeName,
      parentHeaderName: data.parentHeaderName,
      childHeaderName: data.childHeaderName,
      ledgerAccountName: data.ledgerAccountName,
      ledgerAccountCode: data.ledgerAccountCode,
      ledgerAccountDescription: data.ledgerAccountDescription,
      isBank: data.isBank,
      bankName: data.bankName,
      branchName: data.branchName,
      accountNo: data.accountNo,
      chequeNo: data.chequeNo,
      balance: data.balance,
      balanceEntryTypeID: data.balanceEntryTypeID == 1 ? "Debit" : "Credit",
      maximumAmount: data.maximumAmount,
      balanceAsOFDate: data.balanceAsOFDate,
      createdDate: data.createdDate,
      statusID: data.statusID,
      remarks: data.remarks,
      accountTypeID: data.accountTypeID,
      parentHeaderID: data.parentHeaderID,
      childHeaderID: data.childHeaderID,
      ledgerAccountID: data.ledgerAccountID,
      groupID: data.groupID,
      factoryID: data.factoryID
    });
  }

  function handleChange1(e) {
    const target = e.target;
    const value = target.value

    setLedgerAccount({
      ...ledgerAccount,
      [e.target.name]: value
    });
  }

  function handleNewRemarksField(e) {
    const target = e.target;
    const value = target.value;
    var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    if (!format.test(value)) {
      // setNewRemark(value)
      setLedgerAccount({
        ...ledgerAccount,
        [e.target.name]: value
      });
    }
    setIsDisableButton(false);
  }

  async function ApproveLedgerAccount() {
    let approveObject = {
      ledgerAccountID: ledgerAccount.ledgerAccountID,
      modifiedBy: tokenDecoder.getUserIDFromToken(),
      remarks: ledgerAccount.remarks === "" ? null : ("Approve :- " + ledgerAccount.remarks),
      result: -1,
      accountTypeID: ledgerAccount.accountTypeID,
      parentHeaderID: ledgerAccount.parentHeaderID,
      childHeaderID: ledgerAccount.childHeaderID,
      groupID: ledgerAccount.groupID,
      factoryID: ledgerAccount.factoryID,
      balanceEntryTypeID: ledgerAccount.balanceEntryTypeID === 'Debit' ? 2 : 1,
      balance: parseFloat(ledgerAccount.balance)
    }
    
    let confirmMessage = !(ledgerAccount.balance != '' && ledgerAccount.balance != null) ? 'Are you sure you want to approve this?' :
      'Are you sure you want to approve this ledger account with an opening balance?'
    confirmAlert({
      title: 'Confirm To Approve',
      message: confirmMessage,
      buttons: [
        {
          label: 'Yes',
          onClick: () => Approve(approveObject)
        },
        {
          label: 'No',
          onClick: () => handleClose()
        }
      ],
      closeOnEscape: true,
      closeOnClickOutside: true,
    });
  }

  async function Approve(approveObject) {
    const response = await services.ApproveLedgerAccount(approveObject);
    if (response.statusCode == "Success") {
      alert.success(response.message);
      setTimeout(() => { navigate('/app/ledgerAcoountApproval/listing'); }, 1000)
    }
    else {
      alert.error(response.message);
    }
  }
  async function RejectLedgerAccount() {
    if (ledgerAccount.remarks == null || ledgerAccount.remarks === "" || ledgerAccount.remarks.match(/^\s+$/) !== null) {
      alert.error("Reason should provide");
      setIsDisableButton(false);
      return;
    }
    let rejectObject = {
      ledgerAccountID: ledgerAccount.ledgerAccountID,
      modifiedBy: tokenDecoder.getUserIDFromToken(),
      remarks: ledgerAccount.remarks === "" ? null : ("Reject :- " + ledgerAccount.remarks),
      result: 0
    }
    confirmAlert({
      title: 'Confirm To Reject',
      message: 'Are you sure you want to reject this?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => Reject(rejectObject)
        },
        {
          label: 'No',
          onClick: () => handleClose()
        }
      ],
      closeOnEscape: true,
      closeOnClickOutside: true,
    });
  }

  async function Reject(rejectObject) {
    const response = await services.RejectLedgerAccount(rejectObject);
    if (response.statusCode == "Success") {
      alert.success(response.message);
      setTimeout(() => { navigate('/app/ledgerAcoountApproval/listing'); }, 1000)
    }
    else {
      alert.error(response.message);
    }
  }

  async function handleRejectLedgerAccount() {
    trackPromise(RejectLedgerAccount());
  }

  async function handleApproveLedgerAccount() {
    trackPromise(ApproveLedgerAccount());
  }

  function cardTitle(titleName) {
    return (
      <Grid container spacing={1}>
        <Grid item md={10} xs={12}>
          {titleName}
        </Grid>
        <Grid item md={2} xs={12}>
          <PageHeader
            onClick={handleClick}
          />
        </Grid>
      </Grid>
    )
  }

  return (
    <Fragment>
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupName: ledgerAccount.groupName,
              factoryName: ledgerAccount.factoryName,
              accountTypeName: ledgerAccount.accountTypeName,
              parentHeaderName: ledgerAccount.parentHeaderName,
              childHeaderName: ledgerAccount.childHeaderName,
              ledgerAccountName: ledgerAccount.ledgerAccountName,
              ledgerAccountCode: ledgerAccount.ledgerAccountCode,
              ledgerAccountDescription: ledgerAccount.ledgerAccountDescription,
              isBank: ledgerAccount.isBank,
              bankName: ledgerAccount.bankName,
              branchName: ledgerAccount.branchName,
              accountNo: ledgerAccount.accountNo,
              chequeNo: ledgerAccount.chequeNo,
              balance: ledgerAccount.balance,
              balanceEntryTypeID: ledgerAccount.balanceEntryTypeID,
              maximumAmount: ledgerAccount.maximumAmount,
              balanceAsOFDate: ledgerAccount.balanceAsOFDate,
              createdDate: ledgerAccount.createdDate,
              statusID: ledgerAccount.statusID,
              remarks: ledgerAccount.remarks,
              AccountTypeID: ledgerAccount.AccountTypeID,
              ParentHeaderID: ledgerAccount.ParentHeaderID,
              ChildHeaderID: ledgerAccount.ChildHeaderID,
              LedgerAccountID: ledgerAccount.LedgerAccountID,
              GroupID: ledgerAccount.GroupID,
              FactoryID: ledgerAccount.FactoryID
            }}
            validationSchema={
              Yup.object().shape({
                parentHeaderName: Yup.string().required('Parent header required'),
                ledgerAccountName: Yup.string().required('Account name required'),
                ledgerAccountCode: Yup.string().required('Ledger account code required'),
                ledgerAccountDescription: Yup.string().nullable(),
                accountNo: Yup.number().required('Account number required'),
                chequeNo: Yup.string().nullable(),
                balance: Yup.string().nullable(),
                asOf: Yup.string().nullable(),
                maximumAmount: Yup.string().nullable(),
              })
            }
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleSubmit,
              isSubmitting,
              touched,
              values,
              props
            }) => (
              <form onSubmit={handleSubmit}>
                <Box mt={0}>
                  <Card>
                    <CardHeader
                      title={cardTitle(title)}
                    />
                    <PerfectScrollbar>
                      <Divider />

                      <Card className={classes.cardPadding}>
                        <CardContent>
                          <Grid container spacing={3}>
                            <Grid item md={6} xs={12}>
                              <InputLabel shrink id="group">
                                Group *
                              </InputLabel>
                              <TextField
                                fullWidth
                                size='small'
                                name="group"
                                id="group"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange1(e)}
                                value={ledgerAccount.groupName}
                                variant="outlined"
                                disabled={DisableUserFields}
                              >
                              </TextField>
                            </Grid>
                            <Grid item md={6} xs={12}>
                              <InputLabel shrink id="factory">
                                Estate *
                              </InputLabel>
                              <TextField
                                fullWidth
                                size='small'
                                name="factory"
                                id="factory"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange1(e)}
                                value={ledgerAccount.factoryName}
                                variant="outlined"
                                disabled={DisableUserFields}
                              >
                              </TextField>
                            </Grid>
                          </Grid>
                          <Grid container spacing={3}>
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="AccountType">
                                Account Type *
                              </InputLabel>
                              <TextField
                                fullWidth
                                size='small'
                                name="AccountType"
                                id="AccountType"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange1(e)}
                                value={ledgerAccount.accountTypeName}
                                variant="outlined"
                                disabled={DisableUserFields}
                              >
                              </TextField>
                            </Grid>
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="parentHeader">
                                Parent Header *
                              </InputLabel>
                              <TextField
                                fullWidth
                                size='small'
                                name="parentHeader"
                                id="parentHeader"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange1(e)}
                                value={ledgerAccount.parentHeaderName}
                                variant="outlined"
                                disabled={DisableUserFields}
                              >
                              </TextField>
                            </Grid>
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="childHeader">
                                Child Header *
                              </InputLabel>
                              <TextField
                                fullWidth
                                size='small'
                                name="childHeader"
                                id="childHeader"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange1(e)}
                                value={ledgerAccount.childHeaderName}
                                variant="outlined"
                                disabled={DisableUserFields}
                              >
                              </TextField>
                            </Grid>
                          </Grid>
                          <Grid container spacing={3}>
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="ledgerAccountName">
                                Ledger Account Name *
                              </InputLabel>
                              <TextField
                                fullWidth
                                size='small'
                                name="ledgerAccountName"
                                id="ledgerAccountName"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange1(e)}
                                value={ledgerAccount.ledgerAccountName}
                                variant="outlined"
                                disabled={DisableUserFields}
                              >
                              </TextField>
                            </Grid>
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="ledgerAccountCode">
                                Ledger Account Code *
                              </InputLabel>
                              <TextField
                                fullWidth
                                size='small'
                                name="ledgerAccountCode"
                                id="ledgerAccountCode"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange1(e)}
                                value={ledgerAccount.ledgerAccountCode}
                                variant="outlined"
                                disabled={DisableUserFields}
                              >
                              </TextField>
                            </Grid>
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="description">
                                Description *
                              </InputLabel>
                              <TextField
                                fullWidth
                                size='small'
                                name="description"
                                id="description"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange1(e)}
                                value={ledgerAccount.ledgerAccountDescription}
                                variant="outlined"
                                disabled={DisableUserFields}>
                              </TextField>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                      {ledgerAccount.isBank > 0 ?
                        <Card className={classes.cardPadding}>
                          <NameTextTypography
                            variant="h6" >
                            {"Ledger Account Bank Details"}
                          </NameTextTypography>
                          <CardContent>

                            <Grid container spacing={3}>
                              <Grid item md={4} xs={12}>
                                <InputLabel shrink id="Bank">
                                  Bank *
                                </InputLabel>
                                <TextField
                                  fullWidth
                                  size='small'
                                  name="Bank"
                                  id="Bank"
                                  onBlur={handleBlur}
                                  onChange={(e) => handleChange1(e)}
                                  value={ledgerAccount.bankName}
                                  variant="outlined"
                                  disabled={DisableUserFields}>
                                </TextField>
                              </Grid>
                              <Grid item md={4} xs={12}>
                                <InputLabel shrink id="Branch">
                                  Branch
                                </InputLabel>
                                <TextField
                                  fullWidth
                                  size='small'
                                  name="Branch"
                                  id="Branch"
                                  onBlur={handleBlur}
                                  onChange={(e) => handleChange1(e)}
                                  value={ledgerAccount.branchName}
                                  variant="outlined"
                                  disabled={DisableUserFields}>
                                </TextField>
                              </Grid>
                              <Grid item md={4} xs={12}>
                                <InputLabel shrink id="accountNo">
                                  Account Number *
                                </InputLabel>
                                <TextField
                                  fullWidth
                                  size='small'
                                  name="accountNo"
                                  onBlur={handleBlur}
                                  onChange={(e) => handleChange1(e)}
                                  value={ledgerAccount.accountNo}
                                  variant="outlined"
                                  disabled={DisableUserFields}>
                                </TextField>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                        : null}

                      {(ledgerAccount.balance != '' && ledgerAccount.balance != null) ?
                        <Card className={classes.cardPadding}>
                          <NameTextTypography
                            variant="h6" >
                            {"Ledger Transaction Details - Openning Balance"}
                          </NameTextTypography>
                          <CardContent>
                            <Grid container spacing={3}>
                              <Grid item md={4} xs={12}>
                                <InputLabel shrink id="balance">
                                  Balance
                                </InputLabel>
                                <TextField
                                  fullWidth
                                  size='small'
                                  name="balance"
                                  onBlur={handleBlur}
                                  onChange={(e) => handleChange1(e)}
                                  value={ledgerAccount.balance}
                                  variant="outlined"
                                  disabled={DisableUserFields}>
                                </TextField>
                              </Grid>
                              <Grid item md={4} xs={12}>
                                <InputLabel shrink id="BalanceEntryType">
                                  Balance Entry Type
                                </InputLabel>
                                <TextField
                                  fullWidth
                                  size='small'
                                  name="BalanceEntryType"
                                  id="BalanceEntryType"
                                  onBlur={handleBlur}
                                  onChange={(e) => handleChange1(e)}
                                  value={ledgerAccount.balanceEntryTypeID}
                                  variant="outlined"
                                  disabled={DisableUserFields}>
                                </TextField>
                              </Grid>
                              <Grid item md={4} xs={12}>
                                <InputLabel shrink id="asOf">
                                  as of
                                </InputLabel>
                                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                  <KeyboardDatePicker
                                    fullWidth
                                    size='small'
                                    variant="inline"
                                    format="dd/MM/yyyy"
                                    margin="dense"
                                    id="asOf"
                                    name="asOf"
                                    onChange={(e) => {
                                      handleChange1(e)
                                    }}
                                    value={ledgerAccount.balanceAsOFDate}
                                    disabled={DisableUserFields}
                                    maxDate={new Date()}
                                    KeyboardButtonProps={{
                                      'aria-label': 'change date',
                                    }}
                                    autoOk
                                  />
                                </MuiPickersUtilsProvider>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                        : null}
                      <Card className={classes.cardPadding}>
                        <CardContent>
                          <Grid container spacing={3}>
                            <Divider />
                            <Grid item md={8} xs={12}>
                              <InputLabel shrink id="remarks">
                                Reason *
                              </InputLabel>
                              <TextField
                                fullWidth
                                size='small'
                                name="remarks"
                                onBlur={handleBlur}
                                onChange={(e) => {
                                  handleNewRemarksField(e)
                                }}
                                value={ledgerAccount.remarks}
                                variant="outlined"
                                disabled={(ledgerAccount.statusID != 1)}>
                              </TextField>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                      {ledgerAccount.statusID == 1 ?
                        <Box display="flex" justifyContent="flex-end" p={2}>
                          <Button
                            color="primary"
                            id="btnCancel"
                            variant="contained"
                            onClick={handleRejectLedgerAccount}
                            style={{ marginRight: '1rem' }}
                            className={classes.colorCancel}
                          >
                            Reject
                          </Button>
                          <Button
                            color="primary"
                            id="btnRecord"
                            variant="contained"
                            style={{ marginRight: '1rem' }}
                            className={classes.colorRecord}
                            onClick={handleApproveLedgerAccount}
                          >
                            Approve
                          </Button>
                        </Box>
                        : null}

                    </PerfectScrollbar>
                  </Card>
                </Box>
              </form>
            )}
          </Formik>
        </Container>
      </Page>
    </Fragment>
  )
}
