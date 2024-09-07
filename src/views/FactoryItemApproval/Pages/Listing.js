import React, { useState, useEffect, createContext } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  makeStyles,
  Container,
  CardContent,
  Divider,
  MenuItem,
  Grid,
  InputLabel,
  TextField,
  CardHeader
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import BorderColorTwoToneIcon from '@material-ui/icons/BorderColorTwoTone';
import { trackPromise } from 'react-promise-tracker';
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

export default function FactoryItemApprovalListing() {
  const [title, setTitle] = useState("Item Mobile Request")
  const classes = useStyles();
  const [selectedCustomerIds, setSelectedCustomerIds] = useState([]);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(0);
  const [isViewTable, setIsViewTable] = useState(true);
  const handleLimitChange = (event) => {
    setLimit(event.target.value);
  };
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };
  const [approvalData, setApprovalData] = useState([]);
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [routes, setRoutes] = useState();
  const [customers, setCustomers] = useState();
  const [approveList, setApproveList] = useState({
    groupID: parseInt(tokenService.getGroupIDFromToken()),
    factoryID: parseInt(tokenService.getFactoryIDFromToken()),
    routeID: '0',
    customerID: '0'
  })
  const navigate = useNavigate();
  const ApprovalEnum = Object.freeze({ "Pending": 1, "Approve": 2, "Reject": 3, "Delivered": 4 })
  let encrypted = "";

  const handleClickEdit = (factoryItemRequestID) => {
    encrypted = btoa(factoryItemRequestID.toString());
    navigate('/app/factoryItemApproval/addedit/' + encrypted);
  }
  const handleClickEdit1 = (factoryItemRequestID) => {
    encrypted = btoa(factoryItemRequestID.toString());
    navigate('/app/factoryItemApproval/addEdits/' + encrypted);
  }

  useEffect(() => {
    trackPromise(
      getGroupsForDropdown()
    );
  }, []);

  useEffect(() => {
    trackPromise(
      getFactoriesForDropDown(),
    )
  }, [approveList.groupID]);

  useEffect(() => {
    trackPromise(
      getRoutesByFactoryID(),

    )
  }, [approveList.factoryID]);

  useEffect(() => {
    trackPromise(
      getCustomersByRouteID(),
      getFactoryItemrequest()
    )
    checkDisbursement();
  }, [approveList.routeID]);

  useEffect(() => {
    trackPromise(
      getFactoryItemrequestByCustomerIDandRouteID()
    )
  }, [approveList.customerID]);

  async function getFactoryItemrequestByCustomerIDandRouteID() {
    const requests = await services.getFactoryItemrequestByCustomerIDandRouteID(approveList.routeID, approveList.customerID);
    setApprovalData(requests);
  }

  async function getFactoryItemrequest() {
    const requests = await services.getFactoryItemrequest(approveList.routeID);
    setApprovalData(requests);
  }

  async function getCustomersByRouteID() {
    const customer = await services.getCustomersByRouteID(approveList.groupID, approveList.factoryID, approveList.routeID);
    setCustomers(customer);
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

  function checkDisbursement() {
    if (approveList.routeID === '0') {
      setIsViewTable(true);
    }
    else {
      setIsViewTable(false);
    }
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

  return (
    <Page
      className={classes.root}
      title="Item Mobile Request"
    >
      <Container maxWidth={false}>
        <Box mt={0}>
          <Card>
            <CardHeader
              title={title}
            />
            <PerfectScrollbar>
              <Divider />
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
                    <InputLabel shrink id="customerID">
                      Customer
                    </InputLabel>
                    <TextField select
                      fullWidth
                      name="customerID"
                      size='small'
                      onChange={(e) => handleChange(e)}
                      value={approveList.customerID}
                      variant="outlined"
                    >
                      <MenuItem value="0">--Select Customer--</MenuItem>
                      {generateDropDownMenu(customers)}
                    </TextField>
                  </Grid>
                </Grid>
              </CardContent>
              <Box minWidth={1000} hidden={isViewTable}>
                <MaterialTable
                  title="Multiple Actions Preview"
                  columns={[
                    { title: 'Order No', field: 'orderNo' },
                    { title: 'Customer Name', field: 'customerName' },
                    { title: 'Customer Registration Number', field: 'registrationNumber' },
                    {
                      title: 'Status', field: 'statusID', lookup: {
                        1: 'Pending',
                        2: 'Issued',
                        3: 'Rejected',
                        4: 'Delivered'
                      }
                    },
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
                    rowData => ({
                      disabled: rowData.statusID !== 1,
                      icon: 'beenhere',
                      tooltip: 'Approve Factory Item',
                      onClick: (event, approvalData) => handleClickEdit1(approvalData.orderNo)
                    })
                  ]}
                />
              </Box>
            </PerfectScrollbar>
          </Card>
        </Box>
      </Container>
    </Page>
  );
};

