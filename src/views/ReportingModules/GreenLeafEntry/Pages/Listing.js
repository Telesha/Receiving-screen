import React, { useState, useEffect, createContext } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  makeStyles,
  Container,
  Button,
  CardContent,
  Divider,
  MenuItem,
  Grid,
  InputLabel,
  TextField,
  CardHeader
} from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import MaterialTable from 'material-table';
import { useAlert } from 'react-alert';
import { Formik } from 'formik';
import * as Yup from 'yup';
import tokenService from '../../../../utils/tokenDecoder';
import authService from '../../../../utils/permissionAuth';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  }
}));

const screenCode = 'GREENLEAFENTRY';
export default function GreenLeafEntryListing() {
  const classes = useStyles();
  const [advancePaymentRequestData, setAdvancePaymentRequestData] = useState(
    []
  );
  const [greenLeafEntryData, setGreenLeafEntryData] = useState([]);

  const [title, setTitle] = useState("Estate Leaf Entry List");
  const [greenLeafList, setGreenLeafList] = useState([]);


  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const ApprovalEnum = Object.freeze({ Pending: 1, Approve: 2, Reject: 3 });
  const [isViewTable, setIsViewTable] = useState(true);
  const alert = useAlert();
  const [approveList, setApproveList] = useState({
    groupID: 0,
    factoryID: 0,
    date: ''
  });
  const navigate = useNavigate();
  let encrypted = '';
  const handleClick = () => {
    encrypted = btoa('0');
    navigate('/app/greenLeafEntry/addedit/' + encrypted);
  };
  const handleClickEdit = greenLeafEntryID => {
    encrypted = btoa(greenLeafEntryID.toString());
    navigate('/app/greenLeafEntry/addEdit/' + encrypted);
  };

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });

  useEffect(() => {
    trackPromise(getGroupsForDropdown(), getPermission());
  }, []);

  useEffect(() => {
    trackPromise(getfactoriesForDropDown());
  }, [approveList.groupID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(
      p => p.permissionCode == 'VIEWGREENLEAFENTRY'
    );

    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(
      p => p.permissionCode == 'GROUPDROPDOWN'
    );
    var isFactoryFilterEnabled = permissions.find(
      p => p.permissionCode == 'FACTORYDROPDOWN'
    );

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined
    });

    setApproveList({
      ...approveList,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    });
  }

  async function getfactoriesForDropDown() {
    const factory = await services.getfactoriesForDropDown(approveList.groupID);
    setFactories(factory);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroups(groups);
  }

  async function GetGreenLeafEntryList() {
    const response = await services.getGreenLeafEntryData(
      approveList.groupID,
      approveList.factoryID,
      approveList.date.toISOString().split('T')[0]
    );

    if (response.statusCode == 'Success' && response.data != null) {
      setGreenLeafList(response.data);
      if (response.data.length == 0) {
        alert.error('No records to display');
      }
    } else {
      alert.error(response.message);
    }
    setIsViewTable(false);
  }

  function generateDropDownMenu(data) {
    let items = [];
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(
          <MenuItem key={key} value={key}>
            {value}
          </MenuItem>
        );
      }
    }
    return items;
  }

  function clearData() {
    setApproveList({
      ...approveList,      
      date: null
    });
    setIsViewTable(true);
  }

  async function handleSearch() {
    const response = await services.getGreenLeafEntryData(
      approveList.groupID,
      approveList.factoryID,
      approveList.date
    );

    if (response.statusCode == 'Success' && response.data != null) {
      setGreenLeafList(response.data);
      if (response.data.length == 0) {
        alert.error('No records to display');
      }
    } else {
      alert.error(response.message);
    }
    setIsViewTable(false);
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value;
    setApproveList({
      ...approveList,
      [e.target.name]: value
    });
  }

  function handleDateChange(value) {
    setApproveList({
      ...approveList,
      date: value
    });
  }

  function cardTitle(titleName) {
    return (
      <Grid container spacing={1}>
        <Grid item md={10} xs={12}>
          {titleName}
        </Grid>
        <Grid item md={2} xs={12}>
          <PageHeader onClick={handleClick}
            isEdit={true}
            toolTiptitle={"Add Estate Leaf Entry"}
          />
        </Grid>
      </Grid>
    );
  }

  return (
    <Page className={classes.root} title="Estate Leaf Entry List">
      <Container maxWidth={false}>
        <Formik
          initialValues={{
            groupID: approveList.groupID,
            factoryID: approveList.factoryID,
            date: approveList.date
          }}
          validationSchema={Yup.object().shape({
            groupID: Yup.number()
              .required('Group is required')
              .min('1', 'Select a Group'),
            factoryID: Yup.number()
              .required('Factory is required')
              .min('1', 'Select a Factory'),
            date: Yup.date().required('Date is required').typeError('Invalid date')
          })}
          onSubmit={() => trackPromise(GetGreenLeafEntryList())}
          enableReinitialize
        >
          {({ errors, handleBlur, handleSubmit, touched, values }) => (
            <form onSubmit={handleSubmit}>
              <Box mt={0}>
                <Card>
                  <CardHeader title={cardTitle(title)} />
                  <PerfectScrollbar>
                    <Divider />
                    <CardContent style={{ marginBottom: '2rem' }}>
                      <Grid container spacing={3}>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="groupID">
                            Group *
                          </InputLabel>
                          <TextField
                            select
                            error={Boolean(touched.groupID && errors.groupID)}
                            fullWidth
                            helperText={touched.groupID && errors.groupID}
                            name="groupID"
                            size='small'
                            onChange={e => handleChange(e)}
                            disabled={!permissionList.isGroupFilterEnabled}
                            value={approveList.groupID}
                            variant="outlined"
                          >
                            <MenuItem value="0">--Select Group--</MenuItem>
                            {generateDropDownMenu(groups)}
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="factoryID">
                            Factory *
                          </InputLabel>
                          <TextField
                            select
                            error={Boolean(
                              touched.factoryID && errors.factoryID
                            )}
                            fullWidth
                            helperText={touched.factoryID && errors.factoryID}
                            name="factoryID"
                            size='small'
                            onChange={e => handleChange(e)}
                            value={approveList.factoryID}
                            disabled={!permissionList.isFactoryFilterEnabled}
                            variant="outlined"
                            id="factoryID"
                          >
                            <MenuItem value="0">--Select Factory--</MenuItem>
                            {generateDropDownMenu(factories)}
                          </TextField>
                        </Grid>

                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="date">
                            Date *
                          </InputLabel>
                          <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker
                              error={Boolean(touched.date && errors.date)}
                              helperText={touched.date && errors.date}
                              autoOk
                              fullWidth
                              variant="inline"
                              format="dd/MM/yyyy"
                              margin="dense"
                              id="date"
                              name="date"
                              value={approveList.date}
                              onChange={(e) => handleDateChange(e)}
                              KeyboardButtonProps={{
                                'aria-label': 'change date',
                              }}
                              InputProps={{ readOnly: true }}
                            />
                          </MuiPickersUtilsProvider>
                        </Grid>
                      </Grid>
                      <Box display="flex" flexDirection="row-reverse" p={2}>
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
                      <Grid item hidden={isViewTable} md={12} xs={12}>
                        {greenLeafList.length > 0 ? (
                          <MaterialTable
                            title="Multiple Actions Preview"
                            columns={[
                              { title: 'Ref No', field: 'referenceNumber' },
                              { title: 'Field Name', field: 'fieldName' },
                              {
                                title: 'No Of Bags',
                                field: 'factoryBagAmount'
                              },
                              {
                                title: 'Net Weight(Kg)',
                                field: 'factoryNetWeight'
                              }
                            ]}
                            data={greenLeafList}
                            options={{
                              exportButton: false,
                              showTitle: false,
                              headerStyle: { textAlign: 'left', height: '1%' },
                              cellStyle: { textAlign: 'left' },
                              columnResizable: false,
                              actionsColumnIndex: -1
                            }}
                            actions={[
                              {
                                icon: 'edit',
                                tooltip: 'Edit',
                                onClick: (event, rowData) =>
                                  handleClickEdit(rowData.greenLeafEntryID)
                              }
                              // {
                              //     // icon: VisibilityIcon,
                              //     // tooltip: 'View',
                              //     // onClick: (event, rowData) => handleClickView(rowData.greenLeafReceivingID)
                              //   }
                            ]}
                          />
                        ) : null}
                      </Grid>
                    </CardContent>
                  </PerfectScrollbar>
                </Card>
              </Box>
            </form>
          )}
        </Formik>
      </Container>
    </Page>
  );
}
