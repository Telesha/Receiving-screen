import React, { useState, useEffect, createContext } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
   Box, Card,Button,makeStyles, Container, CardHeader, CardContent, Divider, MenuItem, Grid, InputLabel, TextField
} from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import MaterialTable from "material-table";
import permissionService from "../../../utils/permissionAuth";
import { LoadingComponent } from '../../../utils/newLoader';

const useStyles = makeStyles((theme) => ({
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

const screenCode = 'MONTHENDSTOCK';

export default function MonthEndStockListing() {

  const classes = useStyles();
  const [roleData, setRoleData] = useState([]);
  const [groups, setGroups] = useState();
  const [isViewTable, setIsViewTable] = useState(true);
  const [factories, setFactories] = useState();
  const [monthEndStock, setMonthEndStock] = useState({
    groupID: '0',
    factoryID: '0'
  })

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });

  const navigate = useNavigate();

  useEffect(() => {
    trackPromise(getPermissions())
  }, []);


  async function getPermissions() {
    var permissions = await permissionService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWMONTHENDSTOCK');

    if (isAuthorized === undefined) {
      navigate('/app/unauthorized');
    }

    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined
    });

    // setMonthEndStock({
    //   monthEndStock,
    //   groupID: parseInt(tokenDecoder.getGroupIDFromToken()),
    //   factoryID: parseInt(tokenDecoder.getFactoryIDFromToken())
    // })

    trackPromise(getGroupsForDropdown());
  }

  let encrypted = "";
  const handleClick = () => {
    encrypted = btoa('0');
    navigate('/app/monthEndStock/addedit/' + encrypted);
  }

  useEffect(() => {
    trackPromise(
      getFactoriesForDropdown()
    );
  }, [monthEndStock.groupID]);

  useEffect(() => {
    trackPromise(
      getRoleDetailsByGroupIDFactoryID()
    )
  }, [monthEndStock.factoryID]);


  async function getRoleDetailsByGroupIDFactoryID() {
    var result = await services.getRoleDetailsByGroupIDFactoryID(monthEndStock.groupID, monthEndStock.factoryID);
    setRoleData(result);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getAllFactoriesByGroupID(monthEndStock.groupID);
    setFactories(factories);
  }

  async function SearchData() {
    await timeout(1000);
    setIsViewTable(false);

  }

  function timeout(delay) {
    return new Promise(res => setTimeout(res, delay));
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
    setMonthEndStock({
      ...monthEndStock,
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
            toolTiptitle={"Add Month End Stock"}
          />
        </Grid>
      </Grid>
    )
  }

  return (
    <Page
      className={classes.root}
      title="Month End Stock"
    >
      <LoadingComponent />
      <Container maxWidth={false}>
        <Box mt={0}>
          <Card>
            <CardHeader
              title={cardTitle("Month End Stock")}
            />
            <PerfectScrollbar>
              <Divider />
              <CardContent style={{ marginBottom: "2rem" }}>
                <Grid container spacing={3}>
                  <Grid item md={6} xs={12}>
                    <InputLabel shrink id="groupID">
                      Group *
                    </InputLabel>
                    <TextField select
                      fullWidth
                      name="groupID"
                      onChange={(e) => handleChange(e)}
                      value={monthEndStock.groupID}
                      size = 'small'
                      variant="outlined"
                    >
                      <MenuItem value="0">--Select Group--</MenuItem>
                      <MenuItem value="1">Group One</MenuItem>
                      {/* {generateDropDownMenu(groups)} */}
                    </TextField>
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <InputLabel shrink id="factoryID">
                      Operation Entity  *
                    </InputLabel>
                    <TextField select
                      fullWidth
                      name="factoryID"
                      onChange={(e) => handleChange(e)}
                      value={monthEndStock.factoryID}
                      variant="outlined"
                      size = 'small'
                    >
                      <MenuItem value="0">--Select Operation Entity--</MenuItem>
                      <MenuItem value="1">Estate One</MenuItem>
                      {/* {generateDropDownMenu(factories)} */}
                    </TextField>
                  </Grid>
                </Grid>
                <Box display="flex" flexDirection="row-reverse" p={2} >
                  <Button
                    color="primary"
                    type="submit"
                    variant="contained"
                    onClick={() => trackPromise(SearchData())}
                    size = 'small'
                  >
                    Search
                  </Button>
                </Box>
                <Grid item md={12} xs={12} hidden={isViewTable}>
                  <MaterialTable
                    hidden={isViewTable}
                    title="Multiple Actions Preview"
                    columns={[
                      { title: 'Stock Date', field: 'stockDate' },
                      { title: 'Made Tea Qty (Kg)', field: 'madeTeaQty' },
                      { title: 'Made Tea Excess (Kg)', field: 'madeTeaExcess' },
                      { title: 'GSA (Rs)', field: 'gsa' },
                      { title: 'GSA Year to Date (Rs)', field: 'gsaYearToDate' },
                    ]}
                    data={[
                      { stockDate: '2022-01-08', madeTeaQty: 17869, madeTeaExcess: 325, gsa: 0, gsaYearToDate: 0 },
                      { stockDate: '2021-12-30', madeTeaQty: 89466, madeTeaExcess: 245, gsa: 0, gsaYearToDate: 0 },
                      { stockDate: '2021-10-21', madeTeaQty: 70016, madeTeaExcess: 220, gsa: 0, gsaYearToDate: 0 },
                      { stockDate: '2021-09-15', madeTeaQty: 87173, madeTeaExcess: 289, gsa: 0, gsaYearToDate: 0 },
                      { stockDate: '2022-06-25', madeTeaQty: 58545, madeTeaExcess: 150, gsa: 0, gsaYearToDate: 0 },
                      { stockDate: '2021-03-01', madeTeaQty: 62324, madeTeaExcess: 230, gsa: 0, gsaYearToDate: 0 },
                    ]}
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
                        tooltip: 'Edit Month End Stock'
                      }
                    ]}
                  />
                </Grid>
              </CardContent>
            </PerfectScrollbar>
          </Card>
        </Box>
      </Container>
    </Page>
  );
};