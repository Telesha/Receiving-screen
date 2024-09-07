import React, { useState, useEffect, createContext } from 'react';
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

const screenCode = 'DIRECTSALE';
export default function DirectSaleListing() {
  const classes = useStyles();
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [directSales, setDirectSales] = useState();
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const [routeList, setRouteList] = useState({
    groupID: '0',
    factoryID: '0'
  })

  const navigate = useNavigate();
  let encrypted = '';
  const handleClick = () => {
    encrypted = btoa('0');
    navigate('/app/directSale/addEdit/' + encrypted);
  };

  const handleClickEdit = (directSalesID) => {
    encrypted = btoa(directSalesID.toString());
    navigate('/app/directSale/addEdit/' + encrypted);
  }

  useEffect(() => {
    trackPromise(
      getGroupsForDropdown(),
      getAllFactoriesByGroupID(routeList.groupID),
      getPermissions(),
    );
  }, []);

  useEffect(() => {
    trackPromise(
      getAllFactoriesByGroupID(routeList.groupID)
    )
  }, [routeList.groupID]);

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(
      p => p.permissionCode == 'VIEWDIRECTSALE'
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

    setRouteList({
      ...routeList,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getAllFactoriesByGroupID(groupID) {
    const factories = await services.getAllFactoriesByGroupID(groupID);
    setFactories(factories);
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

  function handleChange(e) {
    const target = e.target;
    const value = target.value;
    setRouteList({
      ...routeList,
      [e.target.name]: value
    })
  }

  async function SearchData(routeList) {
    const directSale = await services.getAllDirectSales(routeList.groupID, routeList.factoryID);
    if (directSale.statusCode == "Success" && directSale.data != null) {
      setDirectSales(directSale.data);
      if (directSale.data.length == 0) {
        alert.error("No records to display");
      }
    }
    else {
      alert.error("Error");
    }
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
          toolTiptitle={"Add Direct Sale"}
          />
        </Grid>
      </Grid>
    );
  }

  return (
    <Page className={classes.root} title="Direct Sale">
      <Container maxWidth={false}>
        <Box mt={0}>
          <Card>
            <CardHeader title={cardTitle('Direct Sale')} />
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
                      fullWidth
                      size='small'
                      name="groupID"
                      onChange={e => handleChange(e)}
                      value={routeList.groupID}
                      variant="outlined"
                      disabled={!permissionList.isGroupFilterEnabled}
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
                      fullWidth
                      size='small'
                      name="factoryID"
                      onChange={e => handleChange(e)}
                      value={routeList.factoryID}
                      variant="outlined"
                      disabled={!permissionList.isFactoryFilterEnabled}
                    >
                      <MenuItem value="0">--Select Factory--</MenuItem>
                      {generateDropDownMenu(factories)}
                    </TextField>
                  </Grid>
                </Grid>
                <Box display="flex" flexDirection="row-reverse" p={2}>
                  <Button
                    color="primary"
                    type="submit"
                    variant="contained"
                    onClick={() => trackPromise(SearchData(routeList))}
                  >
                    Search
                  </Button>
                </Box>
              </CardContent>
              <Box minWidth={1050}>
                <MaterialTable
                  title="Multiple Actions Preview"
                  columns={[
                    { title: 'Date of Selling', field: 'dateOfSelling', render: directSales => directSales.dateOfSelling.split('T')[0] },
                    { title: 'Invoice Number', field: 'invoiceNumber' },
                    { title: 'Customer Name', field: 'customerName' },
                    { title: 'Grade', field: 'gradeName' },
                    { title: 'Unit Price (Rs)', field: 'unitPrice' },
                    { title: 'Quantity', field: 'quantity' },
                    { title: 'Amount (Rs)', field: 'amount' }
                  ]}
                  data={directSales}
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
                      onClick: (event, directSales) => handleClickEdit(directSales.directSalesID)
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
}
