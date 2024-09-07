import React, { useState, Fragment, createContext, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Button,
  Card,
  makeStyles,
  Container,
  CardHeader,
  CardContent,
  Divider,
  MenuItem,
  Grid,
  InputLabel,
  TextField
} from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import MaterialTable from 'material-table';
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../utils/newLoader';
import * as Yup from "yup";
import { Formik, validateYupSchema } from 'formik';
import CheckIcon from '@material-ui/icons/Check';
import VisibilityIcon from '@material-ui/icons/Visibility';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
  avatar: {
    marginRight: theme.spacing(2)
  }
}));

const screenCode = 'DEBITNOTE';
export default function DirectSaleListing() {
  const alert = useAlert();
  let encryptedVoucherNumber = "";
  const navigate = useNavigate();
  const classes = useStyles();
  const [CreditNoteDetails, setCreditNoteDetails] = useState({
    groupID: '0',
    factoryID: '0',
    creditnoteref: '',
    fromDate: null,
    toDate: null
  })
  const [factories, setFactories] = useState();
  const [groups, setGroups] = useState();
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });

  const [CreditNoteDetailsList, setCreditNoteDetailsList] = useState([])

  const handleClick = () => {
    encryptedVoucherNumber = btoa('0');
    let encryptedGroupID = btoa(CreditNoteDetails.groupID.toString())
    let encryptedFactoryID = btoa(CreditNoteDetails.factoryID.toString())
    navigate('/app/debitNote/addedit/' + encryptedGroupID + '/' + encryptedFactoryID + '/' + encryptedVoucherNumber);
  }
  const handleClickEdit = (value) => {
    encryptedVoucherNumber = btoa(value.toString());
    let encryptedGroupID = btoa(CreditNoteDetails.groupID.toString())
    let encryptedFactoryID = btoa(CreditNoteDetails.factoryID.toString())
    navigate('/app/debitNote/addedit/' + encryptedGroupID + '/' + encryptedFactoryID + '/' + encryptedVoucherNumber);
  }
  const handleClickView = (value) => {
    encryptedVoucherNumber = btoa(value.toString());
    let encryptedGroupID = btoa(CreditNoteDetails.groupID.toString())
    let encryptedFactoryID = btoa(CreditNoteDetails.factoryID.toString())
    navigate('/app/debitNote/addedit/' + encryptedGroupID + '/' + encryptedFactoryID + '/' + encryptedVoucherNumber);
  }

  useEffect(() => {
    getPermissions();
    trackPromise(getGroupsForDropdown());
  }, []);

  useEffect(() => {
    trackPromise(
      getFactoriesByGroupID()
    )
  }, [CreditNoteDetails.groupID]);

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWDEBITNOTE');

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

    setCreditNoteDetails({
      ...CreditNoteDetails,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroups(groups);
  }

  async function getFactoriesByGroupID() {
    const factory = await services.getFactoriesByGroupID(CreditNoteDetails.groupID);
    setFactories(factory);
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setCreditNoteDetails({
      ...CreditNoteDetails,
      [e.target.name]: value
    });
  }

  function handleDateChange(value, field) {
    if (field == "fromDate") {
      setCreditNoteDetails({
        ...CreditNoteDetails,
        fromDate: value
      });
    }
    else if (field == "toDate") {
      setCreditNoteDetails({
        ...CreditNoteDetails,
        toDate: value
      });
    }
    setCreditNoteDetailsList([])
  }

  async function searchDetail() {

    let requestModel = {
      groupID: parseInt(CreditNoteDetails.groupID.toString()),
      factoryID: parseInt(CreditNoteDetails.factoryID.toString()),
      debitnoteref: CreditNoteDetails.creditnoteref.toString(),
      fromDate: CreditNoteDetails.fromDate == null ? '' : CreditNoteDetails.fromDate.toISOString().split('T')[0],
      toDate: CreditNoteDetails.fromDate == null ? '' : CreditNoteDetails.toDate.toISOString().split('T')[0]
    }

    const response = await services.getCreditNoteDetails(requestModel)

    if (response.statusCode === "Success") {
      const data = response.data;
      setCreditNoteDetailsList(data)
    } else {
      alert.error(response.message)
      setCreditNoteDetailsList([])
    }
  }

  function clearFormFields() {
    setCreditNoteDetails({
      ...CreditNoteDetails,
      fromDate: null,
      toDate: null
    });
    setCreditNoteDetailsList([])
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
            toolTiptitle={"Add Debit Note"}
          />
        </Grid>
      </Grid>
    )
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

  return (
    <Fragment>
      <LoadingComponent />
      <Page
        className={classes.root}
        title="Debit Note"
      >
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: CreditNoteDetails.groupID,
              factoryID: CreditNoteDetails.factoryID,
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group required').min("1", 'Group required'),
                factoryID: Yup.number().required('Factory required').min("1", 'Factory required'),
              })
            }
            onSubmit={() => trackPromise(searchDetail())}
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
                      title={cardTitle("Debit Note")}
                    />
                    <PerfectScrollbar>
                      <Divider />
                      <CardContent style={{ marginBottom: "2rem" }}>
                        <Grid container spacing={1}>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="groupID">
                              Group *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.groupID && errors.groupID)}
                              fullWidth
                              helperText={touched.groupID && errors.groupID}
                              name="groupID"
                              onChange={(e) => handleChange(e)}
                              value={CreditNoteDetails.groupID}
                              disabled={!permissionList.isGroupFilterEnabled}
                              variant="outlined"
                              size='small'
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(groups)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="factoryID">
                              Estate *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.factoryID && errors.factoryID)}
                              fullWidth
                              helperText={touched.factoryID && errors.factoryID}
                              name="factoryID"
                              onChange={(e) => handleChange(e)}
                              value={CreditNoteDetails.factoryID}
                              variant="outlined"
                              disabled={!permissionList.isFactoryFilterEnabled}
                              id="factoryID"
                              size='small'
                            >
                              <MenuItem value="0">--Select Estate--</MenuItem>
                              {generateDropDownMenu(factories)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="fromDate">
                              From Date
                            </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                error={Boolean(touched.fromDate && errors.fromDate)}
                                helperText={touched.fromDate && errors.fromDate}
                                autoOk
                                fullWidth
                                variant="inline"
                                format="dd/MM/yyyy"
                                margin="dense"
                                name="date"
                                id="date"
                                value={CreditNoteDetails.fromDate}
                                onChange={(e) => {
                                  handleDateChange(e, "fromDate");
                                }}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                                InputProps={{ readOnly: true }}
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="toDate">
                              To Date
                            </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                error={Boolean(touched.toDate && errors.toDate)}
                                helperText={touched.toDate && errors.toDate}
                                autoOk
                                fullWidth
                                variant="inline"
                                format="dd/MM/yyyy"
                                margin="dense"
                                name="toDate"
                                id="toDate"
                                value={CreditNoteDetails.toDate}
                                onChange={(e) => {
                                  handleDateChange(e, "toDate");
                                }}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                                InputProps={{ readOnly: true }}
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                        </Grid>
                        {/* Not Cleared Requirement */}
                        {/* <Grid container spacing={1}>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="creditnoteref">
                              Debit Note No
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="creditnoteref"
                              onChange={(e) => handleChange(e)}
                              value={CreditNoteDetails.creditnoteref}
                              variant="outlined"
                            />
                          </Grid>
                        </Grid> */}
                      </CardContent>
                      <Box display="flex" justifyContent="flex-end" p={2}>
                        <Button
                          color="primary"
                          type="reset"
                          variant="outlined"
                          onClick={() => clearFormFields()}
                          size='small'
                        >
                          Clear
                        </Button>
                        <div>&nbsp;</div>
                        <Button
                          color="primary"
                          type="submit"
                          variant="contained"
                          size='small'
                        >
                          Search
                        </Button>
                      </Box>
                      {
                        CreditNoteDetailsList.length > 0 ?
                          <Box minWidth={1000}>
                            <MaterialTable
                              title="Multiple Actions Preview"
                              columns={[
                                {
                                  title: 'First Initiate Date',
                                  field: 'createdDate',
                                  render: rowData => rowData.createdDate !== undefined ? rowData.createdDate.split('T')[0] : rowData.createdDate
                                },
                                // { title: 'Debit Note No', field: 'creditNoteID' },
                                { title: 'Voucher Code', field: 'originalVoucherNo' },
                                // { title: 'Debit Note Reference Number', field: 'creditNoteReferenceNumber' },
                                {
                                  title: 'Status', field: 'statusID', lookup: {
                                    1: "Pending",
                                    2: "Approved",
                                    3: "Rejected",
                                    4: "Sent to Approve"
                                  }
                                },
                              ]}
                              data={CreditNoteDetailsList}
                              options={{
                                exportButton: false,
                                showTitle: false,
                                headerStyle: { textAlign: "left", height: '1%' },
                                cellStyle: { textAlign: "left" },
                                columnResizable: false,
                                actionsColumnIndex: -1
                              }}
                              actions={[
                                rowData => (
                                  {
                                    hidden: (rowData.statusID === 1 || rowData.statusID === 3 || rowData.statusID === 4),
                                    icon: VisibilityIcon,
                                    tooltip: 'View Debit Note',
                                    onClick: (event, rowData) => handleClickEdit(rowData.originalVoucherNo)
                                  }),
                                rowData => (
                                  {
                                    hidden: rowData.statusID === 2,
                                    icon: CheckIcon,
                                    tooltip: 'Approve Debit Note',
                                    onClick: (event, rowData) => handleClickEdit(rowData.originalVoucherNo)
                                  })
                              ]}
                            />
                          </Box> : null
                      }
                    </PerfectScrollbar>
                  </Card>
                </Box>
              </form>
            )}
          </Formik>
        </Container>
      </Page>
    </Fragment>
  );
}
