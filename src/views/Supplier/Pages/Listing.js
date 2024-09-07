import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
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
  CardHeader
} from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import tokenService from '../../../utils/tokenDecoder';
import authService from '../../../utils/permissionAuth';
import MaterialTable from "material-table";

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

const screenCode = 'FACTORYITEMSUPPLIER';
export default function FactoryItemSupplierListing(props) {
  const classes = useStyles();
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [supplierList, setSupplierList] = useState({
    groupID: '0',
    factoryID: '0',
  });

  const [suppliersData, setSuppliersData] = useState([]);
  const navigate = useNavigate();
  let encryptedID = "";
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });

  const handleClick = () => {
    encryptedID = btoa('0');
    navigate('/app/factoryItemSuppliers/addedit/' + encryptedID);
  }

  const EditSupplierDetails = (supplierID) => {
    encryptedID = btoa(supplierID.toString());
    navigate('/app/factoryItemSuppliers/addedit/' + encryptedID);
  }

  useEffect(() => {
    trackPromise(
      getGroupsForDropdown(), getPermission()
    );
  }, []);

  useEffect(() => {
    trackPromise(
      getFactoriesForDropDown(),
    )
  }, [supplierList.groupID]);

  useEffect(() => {
    getSuppliersByGroupIDAndFactoryID();
  }, [supplierList.factoryID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWFACTORYITEMSUPPLIER');

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

    setSupplierList({
      ...supplierList,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getFactoriesForDropDown() {
    const factory = await services.getFactoryByGroupID(supplierList.groupID);
    setFactories(factory);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroups(groups);
  }

  async function getSuppliersByGroupIDAndFactoryID() {
    var result = await services.getSuppliersByGroupIDAndFactoryID(parseInt(supplierList.groupID), parseInt(supplierList.factoryID));
    setSuppliersData(result);
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
    setSupplierList({
      ...supplierList,
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
            toolTiptitle={"Add Item Suppliers"}
          />
        </Grid>
      </Grid>
    )
  }

  return (
    <Page
      className={classes.root}
      title="Item Suppliers"
    >
      <Container maxWidth={false}>
        <Box mt={0}>
          <Card>
            <CardHeader
              title={cardTitle("Item Suppliers")}
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
                      onChange={(e) => handleChange(e)}
                      value={supplierList.groupID}
                      variant="outlined"
                      disabled={!permissionList.isGroupFilterEnabled}
                      size='small'
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
                      onChange={(e) => handleChange(e)}
                      value={supplierList.factoryID}
                      variant="outlined"
                      id="factoryID"
                      disabled={!permissionList.isFactoryFilterEnabled}
                      size='small'
                    >
                      <MenuItem value="0">--Select Factory--</MenuItem>
                      {generateDropDownMenu(factories)}
                    </TextField>
                  </Grid>
                </Grid>
              </CardContent>
              <Box minWidth={1050} marginLeft='1rem' marginRight='1rem' marginBottom='2rem'>

                <MaterialTable
                  title="Multiple Actions Preview"
                  columns={[
                    { title: 'Supplier Name', field: 'supplierName' },
                    { title: 'Supplier Address', field: 'supplierAddress' },
                    { title: 'NIC/BR Number', field: 'nicBRNumber' },
                    { title: 'Status', field: 'isActive', render: rowData => rowData.isActive == true ? 'Active' : 'Inactive' },
                  ]}
                  data={suppliersData}
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
                      tooltip: 'Edit Supplier',
                      onClick: (event, rowData) => { EditSupplierDetails(rowData.supplierID) }
                    },
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

