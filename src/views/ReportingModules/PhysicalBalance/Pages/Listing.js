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
import MaterialTable from "material-table";
import { useAlert } from "react-alert";
import { Formik } from 'formik';
import * as Yup from "yup";
import tokenService from '../../../../utils/tokenDecoder';
import authService from '../../../../utils/permissionAuth';



const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
}));

const screenCode = 'PHYSICALBALANCE';
export default function PhysicalBalanceListing() {
  const classes = useStyles();
  const [advancePaymentRequestData, setAdvancePaymentRequestData] = useState([]);
  const [physicalBalanceData, setPhysicalBalanceData] = useState([]);
  const [title, setTitle] = useState("Physical Balance List");
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [routes, setRoutes] = useState();
  const [customers, setCustomers] = useState();
  const ApprovalEnum = Object.freeze({ "Pending": 1, "Approve": 2, "Reject": 3, })
  const [isViewTable, setIsViewTable] = useState(true);
  const alert = useAlert();
  const [approveList, setApproveList] = useState({
    groupID: '0',
    factoryID: '0',
    routeID: '0',
    registrationNumber: '',
    date: ''
  })
  const navigate = useNavigate();
  let encrypted = "";
  const handleClick = () => {
    encrypted = btoa('0');
    navigate('/app/physicalbalance/addedit/' + encrypted);
  }
  const handleClickView = (physicalbalanceID) => {
    encrypted = btoa(physicalbalanceID.toString());
    navigate('/app/physicalbalance/view/' + encrypted);
  }
  const handleClickEdit = (physicalbalanceID) => {
    encrypted = btoa(physicalbalanceID.toString());
    navigate('/app/physicalbalance/addedit/' + encrypted);
  }

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });

  useEffect(() => {
    trackPromise(getGroupsForDropdown(), getPermission());
  }, []);

  useEffect(() => {
    trackPromise(getfactoriesForDropDown());
  }, [approveList.groupID]);

  useEffect(() => {
    trackPromise(getRoutesForDropDown())
  }, [approveList.factoryID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWPHYSICALBALANCE');

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
    });

  }

  async function getOverAdvanceDetailsByRouteIDCustomerIDdate() {
    const advanceList = await services.getOverAdvanceDetailsByRouteIDCustomerIDdate(approveList.registrationNumber, approveList.routeID, approveList.factoryID, approveList.date);
    setAdvancePaymentRequestData(advanceList);
  }

  async function getRoutesForDropDown() {
    const routeList = await services.getRoutesForDropDown(approveList.factoryID);
    setRoutes(routeList);
  }

  async function getfactoriesForDropDown() {
    const factory = await services.getfactoriesForDropDown(approveList.groupID);
    setFactories(factory);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroups(groups);
  }

  async function getCustomersByRouteID() {
    const customer = await services.getCustomersByRouteID(approveList.groupID, approveList.factoryID, approveList.routeID);
    setCustomers(customer);
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

  function clearData() {
    setApproveList({
      ...approveList,
      groupID: '0',
      factoryID: '0',
      routeID: '0',
      registrationNumber: '',
      date: ''
    });
    setAdvancePaymentRequestData([]);
    setIsViewTable(true);
  }

  async function handleSearch() {
    await timeout(1000);
    const advanceList = await services.getOverAdvanceDetailsByRouteIDCustomerIDdate(approveList.registrationNumber, approveList.routeID, approveList.factoryID, approveList.date);
    setAdvancePaymentRequestData(advanceList);
    setIsViewTable(false);
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setApproveList({
      ...approveList,
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
            toolTiptitle={"Add Physical Balance"}
          />
        </Grid>
      </Grid>
    )
  }

  function timeout(delay) {
    return new Promise(res => setTimeout(res, delay));
  }

  async function addDetails(){
    await timeout(1000);
    let model = [
      {
        stockDate: "31/08/2021",
        sellingMark: "GOLDEN GARDEN",
        gradeType: "Primer",
        grade: "FBOPF EX SP1",
        madeTeaQty:"1200"
      },
      {
        stockDate: "30/09/2021",
        sellingMark: "GOLDEN BREW",
        gradeType: "Small Leafy",
        grade: "BOPA",
        madeTeaQty:"560"
      },
      {
        stockDate: "31/10/2021",
        sellingMark: "GOLDEN GARDEN",
        gradeType: "off Grade",
        grade: "BT",
        madeTeaQty:"750"
      },
      {
        stockDate: "30/11/2021",
        sellingMark: "GOLDEN BREW",
        gradeType: "Primer",
        grade: "FBOPF EX SP1",
        madeTeaQty:"500"
      },
      {
        stockDate: "31/12/2021",
        sellingMark: "GOLDEN BREW",
        gradeType: "Small Leafy",
        grade: "BOPA",
        madeTeaQty:"600"
      }
    ];
    setPhysicalBalanceData(physicalBalanceData => [...physicalBalanceData, model]);
    await timeout(1000);
    setPhysicalBalanceData(model)
  }

  return (
    <Page className={classes.root} title="Physical Balance List">
      <Container maxWidth={false}>
        <Formik
          initialValues={{
            groupID: approveList.groupID,
            factoryID: approveList.factoryID,
          }}
          validationSchema={
            Yup.object().shape({
              groupID: Yup.number().required('Group is required').min("1", 'Select a Group'),
              factoryID: Yup.number().required('Factory is required').min("1", 'Select a Factory'),
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
                  <Card>
                    <CardHeader
                      title={cardTitle(title)}
                    />
                    <PerfectScrollbar>
                      <Divider />
                      <CardContent style={{ marginBottom: "2rem" }}>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="groupID">
                              Group  *
                                </InputLabel>
                            <TextField select
                              error={Boolean(touched.groupID && errors.groupID)}
                              fullWidth
                              helperText={touched.groupID && errors.groupID}
                              name="groupID"
                              onChange={(e) => handleChange(e)}
                              size = 'small'
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
                            <TextField select
                              error={Boolean(touched.factoryID && errors.factoryID)}
                              fullWidth
                              helperText={touched.factoryID && errors.factoryID}
                              name="factoryID"
                              size = 'small'
                              onChange={(e) => handleChange(e)}
                              value={approveList.factoryID}
                              variant="outlined"
                              
                              id="factoryID"
                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateDropDownMenu(factories)}
                            </TextField>
                          </Grid>
                        </Grid>
                        <Box display="flex" flexDirection="row-reverse" p={2} >
                          <Button
                            color="primary"
                            type="submit"
                            variant="contained"
                            onClick={ () => trackPromise(addDetails())}
                            size = 'small'
                          >
                            Search
                              </Button>
                          <div>&nbsp;</div>
                          <Button
                            color="primary"
                            type="reset"
                            variant="outlined"
                            onClick={() => clearData()}
                            size = 'small'
                          >
                            Clear
                              </Button>
                        </Box>
                        <Grid item hidden={isViewTable} md={12} xs={12}>
                          {advancePaymentRequestData.length > 0 ?
                            <MaterialTable
                              title="Multiple Actions Preview"
                              columns={[
                                { title: 'Stock Date', field: 'stockDate' },
                                { title: 'Selling Mark', field: 'sellingMark' },
                                { title: 'Grade Type', field: 'gradeType' },
                                {title: 'Grade', field: 'grade',},
                                {title:'Made Tea QTY(Kg)',field:'madeTeaQty'},
                              ]}
                              data={physicalBalanceData}
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
                                  tooltip: 'Edit Physical Balance',
                                 // onClick: (event, rowData) => { handleClickEdit(rowData.physicalbalanceID) }
                                }
                              ]}
                            /> : null}
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
};

