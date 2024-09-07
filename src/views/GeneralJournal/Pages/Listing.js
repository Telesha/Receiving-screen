import React, { useState, useEffect, createContext } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Card, makeStyles, Container, CardHeader, CardContent, Divider, MenuItem, Grid, InputLabel, TextField, Button, Typography, Chip } from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import MaterialTable from "material-table";
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";
import { Formik } from 'formik';
import * as Yup from "yup";
import { groupBy } from 'lodash';
import CheckIcon from '@material-ui/icons/Check';
import VisibilityIcon from '@material-ui/icons/Visibility';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import { LoadingComponent } from 'src/utils/newLoader';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
}));

var screenCode = "GENERALJOURNAL"

export default function GeneralJournalListing() {
  const classes = useStyles();
  const [journalData, setJournalData] = useState([]);
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [transactionTypes, setTransactionTypes] = useState();
  const [transactionTypeList, setTransactionTypeList] = useState();
  const [selectedDate, handleDateChange] = useState(null);
  const [gridArray, setGridArray] = useState([]);
  const [voucherTypes, setVoucherTypes] = useState();
  const [pendingCount, setPendingCount] = useState(0);
  const [generalJournalList, setGeneralJournalList] = useState({
    groupID: '0',
    factoryID: '0',
    transactionTypeID: '0',
    referenceNumber: ''
  })
  const navigate = useNavigate();
  let encrypted = "";
  let encryptedgroupID = "";
  let encryptedfactoryID = ""

  const handleClick = () => {
    encrypted = btoa('0');
    encryptedgroupID = btoa('0');
    encryptedfactoryID = btoa('0');
    navigate('/app/generalJournal/addedit/' + encrypted + "/" + encryptedgroupID + "/" + encryptedfactoryID);
  }

  const handleClickEdit = (referenceNumber) => {
    encrypted = btoa(referenceNumber.toString());
    encryptedgroupID = btoa(generalJournalList.groupID.toString());
    encryptedfactoryID = btoa(generalJournalList.factoryID.toString());
    navigate('/app/generalJournal/addedit/' + encrypted + "/" + encryptedgroupID + "/" + encryptedfactoryID);
  }

  const handleClickApprove = (referenceNumber) => {
    encrypted = btoa(referenceNumber.toString());
    encryptedgroupID = btoa(generalJournalList.groupID.toString());
    encryptedfactoryID = btoa(generalJournalList.factoryID.toString());
    navigate('/app/generalJournal/approve/' + encrypted + "/" + encryptedgroupID + "/" + encryptedfactoryID);
  }

  const handleClickView = (referenceNumber) => {
    encrypted = btoa(referenceNumber.toString());
    encryptedgroupID = btoa(generalJournalList.groupID.toString());
    encryptedfactoryID = btoa(generalJournalList.factoryID.toString());
    navigate('/app/generalJournal/view/' + encryptedgroupID + "/" + encryptedfactoryID + '/MA==/MA==/MA==/MA==/' + encrypted); //MA== 0 value
  }

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });

  useEffect(() => {
    getPermissions();
    trackPromise(
      getGroupsForDropdown(),
      getVoucherTypeList()
    );
  }, []);

  useEffect(() => {
    trackPromise(
      getFactoriesByGroupID()
    )
  }, [generalJournalList.groupID]);

  useEffect(() => {
    getTransactionTypes();
    getTransactionTypeList();
  }, [generalJournalList.factoryID]);

  useEffect(() => {
    checkPendingCount();
  }, [gridArray]);

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITGENERALJOURNAL');

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

    setGeneralJournalList({
      ...generalJournalList,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function checkPendingCount() {
    let count = gridArray.filter(x => x.status == 1);
    setPendingCount(count.length);
  }

  async function getTransactionTypes() {
    const transaction = await services.getTransactionTypeNamesForDropdown();
    setTransactionTypes(transaction);
  }

  async function getTransactionTypeList() {
    const transaction = await services.getTransactionTypeList();
    setTransactionTypeList(transaction);
  }

  async function getFactoriesByGroupID() {
    const fac = await services.getFactoriesByGroupID(generalJournalList.groupID);
    setFactories(fac);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroups(groups);
  }

  function generateDropDownMenu(data) {
    let items = []
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
      }
    }
    return items
  }

  async function getVoucherTypeList() {
    const voucherTypes = await services.getVoucherTypeList();
    voucherTypes.forEach(x => {
      if (x.screenCode == 'JOURNAL') {
        setVoucherTypes(x.voucherTypeID)
      }
    });
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setGeneralJournalList({
      ...generalJournalList,
      [e.target.name]: value
    });
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
            isEdit={true}
            toolTiptitle={"Add General Journal"}
          />
        </Grid>
      </Grid>
    )
  }

  function clearData() {
    setGeneralJournalList({
      ...generalJournalList,
      groupID: generalJournalList.groupID,
      factoryID: generalJournalList.factoryID,
      transactionTypeID: '0',
      referenceNumber: '',

    });
    handleDateChange(null)
    setGridArray([]);

  }

  async function handleSearch() {

    const jList = await services.getGeneralJournalDetails(generalJournalList.groupID, generalJournalList.factoryID, generalJournalList.transactionTypeID, generalJournalList.referenceNumber, selectedDate);
    setJournalData(jList);

    const groupByReferenceNumber = groupBy(jList, "referenceNumber");
    let keys = Object.keys(groupByReferenceNumber);
    let arrayCollection = [];

    keys.forEach(x => {
      arrayCollection.push(groupByReferenceNumber[x][0]);
    });
    let result = arrayCollection.filter((x) => x.voucherType == parseInt(voucherTypes));
    setGridArray(result);
  }

  function statusCheck(data) {

    if (data == 1) { return "Pending" }
    else if (data == 2) { return "Approved" }
    else { return "Rejected" }
  }

  return (
    <Page
      className={classes.root}
      title="General Journal"
    >
      <Container maxWidth={false}>

        <Formik
          initialValues={{
            groupID: generalJournalList.groupID,
            factoryID: generalJournalList.factoryID,
          }}
          validationSchema={
            Yup.object().shape({
              groupID: Yup.number().required('Group is required').min("1", 'Select a group'),
              factoryID: Yup.number().required('Factory is required').min("1", 'Select a factory'),
            })
          }
          onSubmit={() => trackPromise(handleSearch())}
          enableReinitialize
        >
          {({
            errors,
            handleBlur,
            handleSubmit,
            touched,
            values
          }) => (
            <form onSubmit={handleSubmit}>
              <Box mt={0}>
                <LoadingComponent />
                <Card>
                  <CardHeader
                    title={cardTitle("Journal")}
                  />
                  <PerfectScrollbar>
                    <Divider />
                    <CardContent style={{ marginBottom: "2rem" }}>
                      <Grid container spacing={3}>
                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="groupID">Group  *</InputLabel>
                          <TextField select
                            error={Boolean(touched.groupID && errors.groupID)}
                            helperText={touched.groupID && errors.groupID}
                            fullWidth
                            size='small'
                            name="groupID"
                            onChange={(e) => handleChange(e)}
                            value={generalJournalList.groupID}
                            variant="outlined"
                            InputProps={{
                              readOnly: !permissionList.isGroupFilterEnabled ? true : false
                            }}
                          >
                            <MenuItem value="0">--Select Group--</MenuItem>
                            {generateDropDownMenu(groups)}
                          </TextField>
                        </Grid>

                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="factoryID">Estate *</InputLabel>
                          <TextField select
                            error={Boolean(touched.factoryID && errors.factoryID)}
                            helperText={touched.factoryID && errors.factoryID}
                            fullWidth
                            size='small'
                            name="factoryID"
                            onChange={(e) => handleChange(e)}
                            value={generalJournalList.factoryID}
                            variant="outlined"
                            id="factoryID"
                            InputProps={{
                              readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                            }}
                          >
                            <MenuItem value="0">--Select Estate--</MenuItem>
                            {generateDropDownMenu(factories)}
                          </TextField>
                        </Grid>

                        {/* <Grid item md={4} xs={12}>
                          <InputLabel shrink id="transactionTypeID">Transaction Type</InputLabel>
                          <TextField select
                            fullWidth
                            size='small'
                            name="transactionTypeID"
                            onChange={(e) => handleChange(e)}
                            value={generalJournalList.transactionTypeID}
                            variant="outlined"
                            id="transactionTypeID"

                          >
                            <MenuItem value="0">--Select Transaction Type--</MenuItem>
                            {generateDropDownMenu(transactionTypes)}
                          </TextField>
                        </Grid> */}

                        <Grid item md={3} xs={12} >

                          <InputLabel shrink id="date" style={{ marginBottom: '-8px' }}>Date</InputLabel>
                          <MuiPickersUtilsProvider utils={DateFnsUtils}>

                            <KeyboardDatePicker
                              fullWidth
                              inputVariant="outlined"
                              format="dd/MM/yyyy"
                              margin="dense"
                              id="date-picker-inline"
                              value={selectedDate}
                              onChange={(e) => {
                                handleDateChange(e)
                              }}
                              KeyboardButtonProps={{
                                'aria-label': 'change date',
                              }}
                              autoOk
                            />
                          </MuiPickersUtilsProvider>
                        </Grid>

                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="referenceNumber">Reference Number</InputLabel>
                          <TextField
                            fullWidth
                            size='small'
                            name="referenceNumber"
                            onChange={(e) => handleChange(e)}
                            value={generalJournalList.referenceNumber}
                            variant="outlined"
                          />
                        </Grid>
                      </Grid>

                      <Box display="flex" flexDirection="row-reverse" p={2} >
                        <Button
                          color="primary"
                          type="submit"
                          variant="contained"
                        >
                          Search
                        </Button>
                        <div>&nbsp;</div>
                        <Button
                          color="primary"
                          type="reset"
                          variant="outlined"
                          onClick={() => clearData()}
                        >
                          Clear
                        </Button>
                      </Box>

                    </CardContent>
                    {pendingCount > 0 ?
                      <Grid container spacing={2}>
                        <Grid item xs={4} spacing={2}>
                          <Typography color="textSecondary" gutterBottom>
                            <Chip style={{ marginLeft: '1rem', backgroundColor: "#FFFDD0 ", color: 'black', }} alignContent="center"
                              icon={<AccessTimeIcon />}
                              label={"Pending count : " + pendingCount}
                              clickable
                              color="primary"
                            />
                          </Typography>
                        </Grid>
                      </Grid> : null}
                    {gridArray.length > 0 ?
                      <Box minWidth={1000} >
                        <MaterialTable
                          title="Multiple Actions Preview"
                          columns={[
                            { title: 'Date', field: 'date', render: rowdata => rowdata.date.split('T')[0] },
                            { title: 'Voucher Code', field: 'referenceNumber' },
                            { title: 'Description', field: 'description' },
                            {
                              title: 'Status', field: 'status',
                              lookup: {
                                1: 'Pending',
                                2: 'Approved',
                                3: 'Rejected',
                              },
                              defaultSort: "desc",
                              render: rowData => {
                                if (rowData.status == 1) {
                                  return <div style={{ backgroundColor: "#FFFDD0", padding: "10px", borderRadius: "5px" }}>
                                    <span >{statusCheck(rowData.status)}</span>
                                  </div>
                                }
                                else if (rowData.status == 2) {
                                  return <div style={{ padding: "10px", borderRadius: "5px" }}>
                                    <span >{statusCheck(rowData.status)}</span>
                                  </div>
                                }
                                else {
                                  return <div style={{ padding: "10px", borderRadius: "5px" }}>
                                    <span >{statusCheck(rowData.status)}</span>
                                  </div>
                                }
                              },
                            },
                          ]}
                          data={gridArray}
                          options={{
                            exportButton: false,
                            showTitle: false,
                            headerStyle: { textAlign: "left", height: '1%' },
                            cellStyle: { textAlign: "left" },
                            columnResizable: false,
                            actionsColumnIndex: -1
                          }}
                          actions={[
                            rowData => ({
                              hidden: (rowData.status !== 1),
                              icon: 'edit',
                              tooltip: 'Edit',
                              onClick: (event, rowData) => handleClickEdit(rowData.referenceNumber)
                            }),
                            rowData => (
                              {
                                hidden: (rowData.status !== 1),
                                icon: CheckIcon,
                                tooltip: 'Approve',
                                onClick: (event, rowData) => handleClickApprove(rowData.referenceNumber),
                              }),
                            {
                              icon: VisibilityIcon,
                              tooltip: 'View',
                              onClick: (event, rowData) => handleClickView(rowData.referenceNumber)
                            }
                          ]}
                        />
                      </Box>
                      : null
                    }
                  </PerfectScrollbar>
                </Card>
              </Box>
            </form>
          )}
        </Formik>
      </Container>
    </Page>
  );
};

