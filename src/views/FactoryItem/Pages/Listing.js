import React, { useState, useEffect, createContext } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Card, makeStyles, Container, CardHeader, CardContent, Divider, MenuItem, Grid, InputLabel, TextField } from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
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
  avatar: {
    marginRight: theme.spacing(2)
  }
}));

const screenCode = 'FACTORYITEM';
export default function FactoryItemListing() {
  const classes = useStyles();
  const [factoryItemData, setFactoryItemData] = useState([]);
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [ItemCategoryList, setItemCategoryList] = useState();
  const [factoryItemList, setFactoryItemList] = useState({
    groupID: '0',
    factoryID: '0',
    itemCategoryID: '0'
  })

  const navigate = useNavigate();
  let encrypted = "";
  const handleClick = () => {
    encrypted = btoa('0');
    navigate('/app/factoryItems/addedit/' + encrypted);
  }

  const handleClickEdit = (factoryItemID) => {
    encrypted = btoa(factoryItemID.toString());
    navigate('/app/factoryItems/addedit/' + encrypted);
  }

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });

  useEffect(() => {
    trackPromise(getGroupsForDropdown(), getPermissions(), getAllActiveItemCategory());
  }, []);

  useEffect(() => {
    trackPromise(getFactoriesForDropdown());
  }, [factoryItemList.groupID]);

  useEffect(() => {
    trackPromise(getFactoryItemDetailsByGroupIDFactoryID())
  }, [factoryItemList.factoryID, factoryItemList.itemCategoryID]);

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWFACTORYITEM');

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

    setFactoryItemList({
      ...factoryItemList,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getAllActiveItemCategory() {
    const result = await services.getAllActiveItemCategory();
    setItemCategoryList(result);
  }

  async function getFactoryItemDetailsByGroupIDFactoryID() {
    const factoryItem = await services.getfactoryItemsByGroupIDFactoryIDItemCategoryID(factoryItemList.groupID, factoryItemList.factoryID, factoryItemList.itemCategoryID);
    setFactoryItemData(factoryItem);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getAllFactoriesByGroupID(factoryItemList.groupID);
    setFactories(factories);
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
    setFactoryItemList({
      ...factoryItemList,
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
            toolTiptitle={"Add Factory Item"}
          />
        </Grid>
      </Grid>
    )
  }

  return (
    <Page
      className={classes.root}
      title="Items"
    >
      <Container maxWidth={false}>
        <Box mt={0}>
          <Card>
            <CardHeader
              title={cardTitle("Item")}
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
                      value={factoryItemList.groupID}
                      variant="outlined"
                      size='small'
                      InputProps={{
                        readOnly: !permissionList.isGroupFilterEnabled,
                    }}
                    >
                      <MenuItem value="0">--Select Group--</MenuItem>
                      {generateDropDownMenu(groups)}
                    </TextField>
                  </Grid>

                  <Grid item md={4} xs={12}>
                    <InputLabel shrink id="factoryID">
                      Factory  *
                </InputLabel>
                    <TextField select
                      fullWidth
                      name="factoryID"
                      onChange={(e) => handleChange(e)}
                      value={factoryItemList.factoryID}
                      variant="outlined"
                      size='small'
                      InputProps={{
                        readOnly: !permissionList.isFactoryFilterEnabled,
                    }}
                    >
                      <MenuItem value="0">--Select Factory--</MenuItem>
                      {generateDropDownMenu(factories)}
                    </TextField>
                  </Grid>
                  <Grid item md={4} xs={12}>
                    <InputLabel shrink id="itemCategoryID">
                      Item Category *
                              </InputLabel>
                    <TextField select
                      fullWidth
                      name="itemCategoryID"
                      onChange={(e) => handleChange(e)}
                      value={factoryItemList.itemCategoryID}
                      size='small'
                      variant="outlined" >
                      <MenuItem value={0}>All</MenuItem>
                      {generateDropDownMenu(ItemCategoryList)}
                    </TextField>
                  </Grid>

                </Grid>
              </CardContent>
              <Box minWidth={1050}>

                <MaterialTable
                  title="Multiple Actions Preview"
                  columns={[
                    { title: 'Item Code', field: 'itemCode' },
                    { title: 'Item Name', field: 'itemName' },
                    { title: 'Description', field: 'description', render: rowData => rowData.description ? rowData.description : '-' },
                    { title: 'Status', field: 'isActive', render: rowData => rowData.isActive == true ? 'Active' : 'Inactive' },
                  ]}
                  data={factoryItemData}
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
                      tooltip: 'Edit Item',
                      onClick: (event, rowData) => { handleClickEdit(rowData.factoryItemID) }
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
