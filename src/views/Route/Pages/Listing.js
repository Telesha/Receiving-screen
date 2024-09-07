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
  CardHeader,
  CardContent,
  Divider,
  MenuItem,
  Grid,
  InputLabel,
  TextField,
  Tooltip
} from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import BorderColorTwoToneIcon from '@material-ui/icons/BorderColorTwoTone';
import { trackPromise } from 'react-promise-tracker';
import MaterialTable from "material-table";
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';


const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
}));

var screenCode = "ROUTE"

export default function RouteListing() {
  const classes = useStyles();
  const [selectedCustomerIds, setSelectedCustomerIds] = useState([]);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(0);
  const handleLimitChange = (event) => {
    setLimit(event.target.value);
  };
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };
  const [routeData, setRouteData] = useState([]);
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [isViewTable, setIsViewTable] = useState(true);
  const [routeList, setRouteList] = useState({
    groupID: '0',
    factoryID: '0'
  })
  const navigate = useNavigate();
  let encrypted = "";
  const handleClick = () => {
    encrypted = btoa('0');
    navigate('/app/routes/addedit/' + encrypted);
  }
  const handleClickEdit = (routeID) => {
    encrypted = btoa(routeID.toString());
    navigate('/app/routes/addedit/' + encrypted);
  }
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });

  useEffect(() => {
    getPermissions();
    trackPromise(
      getGroupsForDropdown()
    );
  }, []);

  useEffect(() => {
    trackPromise(
      getFactoriesByGroupID()
    )
  }, [routeList.groupID]);

  useEffect(() => {
    trackPromise(
      getRoutesByFactoryID()
    )
    checkDisbursement();
  }, [routeList.factoryID]);

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWROUTE');

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

    setRouteList({
      ...routeList,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getFactoriesByGroupID() {
    const fac = await services.getFactoriesByGroupID(routeList.groupID);
    setFactories(fac);
  }

  async function getRoutesByFactoryID() {
    const routes = await services.getRoutesByFactoryID(routeList.factoryID);
    setRouteData(routes);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroups(groups);
  }

  async function GetAllRoutes() {
    var result = await services.GetAllRoutes();
    setRouteData(result);
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
    if (routeList.factoryID === '0') {
      setIsViewTable(true);
    }
    else {
      setIsViewTable(false);
    }
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setRouteList({
      ...routeList,
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
            toolTiptitle={"Add Route"}
          />

        </Grid>
      </Grid>
    )
  }

  function decimalConvertion(rate) {
    let convertedRate = rate.toFixed(2);
    return convertedRate;
  }

  return (
    <Page
      className={classes.root}
      title="Routes"
    >
      <Container maxWidth={false}>
        <Box mt={0}>
          <Card>
            <CardHeader
              title={cardTitle("Route")}
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
                      fullWidth
                      name="groupID"
                      size='small'
                      onChange={(e) => handleChange(e)}
                      value={routeList.groupID}
                      variant="outlined"
                      InputProps={{
                        readOnly: !permissionList.isGroupFilterEnabled ? true : false
                      }}
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
                      fullWidth
                      name="factoryID"
                      size='small'
                      onChange={(e) => handleChange(e)}
                      value={routeList.factoryID}
                      variant="outlined"
                      id="factoryID"
                      InputProps={{
                        readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                      }}
                    >
                      <MenuItem value="0">--Select Factory--</MenuItem>
                      {generateDropDownMenu(factories)}
                    </TextField>
                  </Grid>
                </Grid>
              </CardContent>
              <Box minWidth={1000} hidden={isViewTable}>
                <MaterialTable
                  title="Multiple Actions Preview"
                  columns={[
                    { title: 'Route Code', field: 'routeCode' },
                    { title: 'Route Name', field: 'routeName' },
                    { title: 'Transport Rate (RS)', field: 'transportRate', render: rowData => decimalConvertion(rowData.transportRate) },
                    { title: 'Monthly Target Crop (KG)', field: 'targetCrop' },
                    { title: 'ExPay Rate (RS)', field: 'exPayRate', render: rowData => decimalConvertion(rowData.exPayRate) },
                    {
                      title: 'Status', field: 'isActive', lookup: {
                        true: 'Active',
                        false: 'Inactive'
                      }
                    },
                  ]}
                  data={routeData}
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
                      icon: 'edit',
                      tooltip: 'Edit Route',
                      onClick: (event, routeData) => handleClickEdit(routeData.routeID)
                    }
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

