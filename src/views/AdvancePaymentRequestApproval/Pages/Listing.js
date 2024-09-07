import React, { useState, useEffect, createContext } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Card, makeStyles, Container, CardContent, Divider, MenuItem, Grid, InputLabel, TextField, CardHeader } from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import MaterialTable from "material-table";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
}));
const screenCode = 'ADVANCEPAYMENTREQUESTAPPROVAL';

export default function AdvancePaymentApprovalListing() {
  const [title, setTitle] = useState("Mobile Advance Approval")
  const classes = useStyles();
  const [approvalData, setApprovalData] = useState([]);
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [routes, setRoutes] = useState();
  const [approveList, setApproveList] = useState({
    groupID: '0',
    factoryID: '0',
    routeID: '0',
    regNumber: ''
  })

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const navigate = useNavigate();
  const ApprovalEnum = Object.freeze({ "Pending": 1, "Approve": 2, "Reject": 3, "Delivered": 4 });

  let encrypted = "";

  const handleClickEdit = (advancePaymentRequestID) => {
    encrypted = btoa(advancePaymentRequestID.toString());
    navigate('/app/advancePaymentApproveReject/listing/' + encrypted);
  }

  useEffect(() => {
    trackPromise(getGroupsForDropdown(), getPermissions());
  }, []);

  useEffect(() => {
    trackPromise(getFactoriesForDropDown());
  }, [approveList.groupID]);

  useEffect(() => {
    trackPromise(getRoutesByFactoryID());
  }, [approveList.factoryID]);

  useEffect(() => {
    trackPromise(getAdvancePaymentRequest());
  }, [approveList.routeID]);

  useEffect(() => {
    trackPromise(getCustomerDetailsByRegNumber());
  }, [approveList.regNumber]);

  async function getCustomerDetailsByRegNumber() {
    if (approveList.regNumber != '') {
      const cus = await services.getApprovalDetailsBNyRegNumberDetails(approveList.groupID, approveList.factoryID, approveList.regNumber);
      setApprovalData(cus.filter(x => x.statusID === ApprovalEnum.Pending));
    }
    else {
      getAdvancePaymentRequest();
    }
  }

  async function getAdvancePaymentRequest() {
    const requests = await services.getAdvancePaymentRequest(approveList.groupID, approveList.factoryID, approveList.routeID);
    setApprovalData(requests.filter(x => x.statusID === ApprovalEnum.Pending));
  }

  async function getFactoriesForDropDown() {
    const factory = await services.getFactoryByGroupID(approveList.groupID);
    setFactories(factory);
  }

  async function getRoutesByFactoryID() {
    const route = await services.getRouteForDropdown(approveList.factoryID);
    setRoutes(route);
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

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setApproveList({
      ...approveList,
      [e.target.name]: value
    });
  }

  function chechStatus(data) {
    if (data == ApprovalEnum.Approve) {
      return "Approved";
    }
    else if (data == ApprovalEnum.Reject) {
      return "Rejected";
    }
    else if (data == ApprovalEnum.Pending) {
      return "Pending";
    }
    else {
      return "Delivered";
    }
  }
  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'APPROVEADVANCEPAYMENTREQUEST');

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

    setApproveList({
      ...approveList,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  return (
    <Page
      className={classes.root}
      title="Mobile Advance Request Approval"
    >
      <Container maxWidth={false}>
        <Box mt={0}>
          <Card>
            <CardHeader
              title={title}
            />
            <PerfectScrollbar>

              <CardContent style={{ marginBottom: "2rem" }}>
                <Grid container spacing={3}>
                  <Grid item md={3} xs={12}>
                    <InputLabel shrink id="groupID">
                      Group  *
                    </InputLabel>
                    <TextField select
                      fullWidth
                      name="groupID"
                      size='small'
                      onChange={(e) => handleChange(e)}
                      value={approveList.groupID}
                      variant="outlined"
                    >
                      <MenuItem value="0">--Select Group--</MenuItem>
                      {generateDropDownMenu(groups)}
                    </TextField>
                  </Grid>

                  <Grid item md={3} xs={12}>
                    <InputLabel shrink id="factoryID">
                      Factory *
                    </InputLabel>
                    <TextField select
                      fullWidth
                      name="factoryID"
                      size='small'
                      onChange={(e) => handleChange(e)}
                      value={approveList.factoryID}
                      variant="outlined"
                      id="factoryID"
                    >
                      <MenuItem value="0">--Select Factory--</MenuItem>
                      {generateDropDownMenu(factories)}
                    </TextField>
                  </Grid>

                  <Grid item md={3} xs={12}>
                    <InputLabel shrink id="routeID">
                      Route *
                    </InputLabel>
                    <TextField select
                      fullWidth
                      name="routeID"
                      size='small'
                      onChange={(e) => handleChange(e)}
                      value={approveList.routeID}
                      variant="outlined"
                    >
                      <MenuItem value="0">--Select Route--</MenuItem>
                      {generateDropDownMenu(routes)}
                    </TextField>
                  </Grid>

                  <Grid item md={3} xs={12}>
                    <InputLabel shrink id="regNumber">
                      Customer Reg Number
                    </InputLabel>
                    <TextField
                      fullWidth
                      name="regNumber"
                      size='small'
                      onChange={(e) => handleChange(e)}
                      value={approveList.regNumber}
                      variant="outlined"
                      id="regNumber"
                    >
                    </TextField>
                  </Grid>
                </Grid>
              </CardContent>
              <Box minWidth={1050}>
                {approvalData.length > 0 ?
                  <MaterialTable
                    title="Multiple Actions Preview"
                    columns={[
                      { title: 'Registration Number', field: 'registrationNumber' },
                      { title: 'Customer Name', field: 'customerName' },
                      { title: 'Requested Amount', field: 'requestedAmount' },
                      { title: 'Status', field: 'statusID', render: rowData => chechStatus(rowData.statusID) },
                      { title: 'Actions', field: 'advancePaymentRequestID', hidden: true },
                    ]}
                    data={approvalData}
                    options={{
                      exportButton: false,
                      showTitle: false,
                      headerStyle: { textAlign: "left", height: '1%' },
                      cellStyle: { textAlign: "left" },
                      columnResizable: false,
                      actionsColumnIndex: -1
                    }}
                    actions={[
                      {
                        icon: 'mode',
                        tooltip: 'Edit Role',
                        onClick: (event, rowData) => { handleClickEdit(rowData.advancePaymentRequestID) }
                      },
                    ]}
                  /> : null}
              </Box>
            </PerfectScrollbar>
          </Card>
        </Box>
      </Container>
    </Page>
  );
};

