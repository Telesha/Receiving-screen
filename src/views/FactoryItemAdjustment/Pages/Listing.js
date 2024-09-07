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
  TextField
} from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import VisibilityIcon from '@material-ui/icons/Visibility';
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

var screenCode = "ITEMAMENDMENT"
export default function FactoryItemAdjustmentListing() {
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
  const [factoryAdjustmentData, setFactoryAdjustmentData] = useState([]);
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [factoryItems, setFactoryItems] = useState();
  const [itemObject, setItemObject] = useState({});
  const [isViewTable, setIsViewTable] = useState(true);
  const [adjustmentList, setAdjustmentList] = useState({
    groupID: '0',
    factoryID: '0',
    factoryItemID: '0',
  });
  const [ItemCategoryList, setItemCategoryList] = useState();
  const [ItemCategoryID, setItemCategoryID] = useState(0);
  const navigate = useNavigate();
  let encrypted = "";
  const handleClick = () => {
    encrypted = btoa('0');
    navigate('/app/factoryItemAdjustment/addedit/' + encrypted);
  }
  const handleClickEdit = (factoryItemAdjustmentID) => {
    encrypted = btoa(factoryItemAdjustmentID.toString());
    navigate('/app/factoryItemAdjustment/addedit/' + encrypted);
  }

  const handleItemCategoryChange = (event) => {
    setItemCategoryID(event.target.value);
  };
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });

  useEffect(() => {
    trackPromise(
      getPermissions(),
      getGroupsForDropdown(),
      getAllActiveItemCategory()
    )
  }, []);

  useEffect(() => {
    trackPromise(
      getfactoriesForDropDown()
    );
  }, [adjustmentList.groupID]);

  useEffect(() => {
    trackPromise(
      getAdjustmentsByFactoryID(),
      getFactoryItemsByFactoryID()
    );
    checkDisbursement();
  }, [adjustmentList.factoryID]);

  useEffect(() => {
    trackPromise(
      getAdjustmentsByFactoryItemID(),
    )
  }, [adjustmentList.factoryItemID]);

  useEffect(() => {
    trackPromise(
      getfactoryItemsForDropDown(),
    )
  }, [ItemCategoryID]);

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWITEMAMENDMENT');
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

    setAdjustmentList({
      ...adjustmentList,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getAllActiveItemCategory() {
    const result = await services.getAllActiveItemCategory();
    setItemCategoryList(result);
  }

  async function getfactoryItemsForDropDown() {
    const factoryItem = await services.getfactoryItemsByGroupIDFactoryIDItemCategoryID(adjustmentList.groupID, adjustmentList.factoryID, ItemCategoryID);
    setFactoryItems(factoryItem);
  }

  async function getfactoriesForDropDown() {
    const factory = await services.getfactoriesForDropDown(adjustmentList.groupID);
    setFactories(factory);
  }

  async function getAdjustmentsByFactoryItemID() {
    const routes = await services.getAdjustmentsByFactoryItemID(adjustmentList.factoryItemID);
    setFactoryAdjustmentData(routes);
  }

  async function getFactoryItemsByFactoryID() {
    const obj = {};
    const items = await services.getFactoryItemsByFactoryID(adjustmentList.factoryID);
    for (const [key, value] of Object.entries(items)) {
      obj[key] = value;

    }
    setItemObject(obj);
    setFactoryItems(items);

  }

  async function getAdjustmentsByFactoryID() {
    const routes = await services.getAdjustmentsByFactoryID(adjustmentList.factoryID);
    setFactoryAdjustmentData(routes);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroups(groups);
  }

  function checkDisbursement() {
    if (adjustmentList.factoryID === '0') {
      setIsViewTable(true);
    }
    else {
      setIsViewTable(false);
    }
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
    setAdjustmentList({
      ...adjustmentList,
      [e.target.name]: value
    });
  }

  function settingItems(data) {
    let itemName = factoryItems.filter((item, index) => index == data);
    return itemName;
  }

  function settingReason(data) {
    if (data == 1) {
      return "Expire";
    }
    else if (data == 2) {
      return "Wastage";
    }
    else {
      return null;
    }
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
            toolTiptitle={"Add Item Amendment"}
          />
        </Grid>
      </Grid>
    )
  }


  return (
    <Page
      className={classes.root}
      title="Item Amendment"
    >
      <Container maxWidth={false}>
        <Box mt={0}>
          <Card>
            <CardHeader
              title={cardTitle("Item Amendment")}
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
                      onChange={(e) => handleChange(e)}
                      value={adjustmentList.groupID}
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

                  <Grid item md={3} xs={12}>
                    <InputLabel shrink id="factoryID">
                      Factory *
                    </InputLabel>
                    <TextField select
                      fullWidth
                      name="factoryID"
                      onChange={(e) => handleChange(e)}
                      value={adjustmentList.factoryID}
                      variant="outlined"
                      id="factoryID"
                      size='small'
                      InputProps={{
                        readOnly: !permissionList.isFactoryFilterEnabled,
                      }}
                    >
                      <MenuItem value="0">--Select Factory--</MenuItem>
                      {generateDropDownMenu(factories)}
                    </TextField>
                  </Grid>
                  <Grid item md={3} xs={12}>
                    <InputLabel shrink id="itemCategoryID">
                      Item Category
                    </InputLabel>
                    <TextField select
                      fullWidth
                      name="itemCategoryID"
                      onChange={(e) => handleItemCategoryChange(e)}
                      value={ItemCategoryID}
                      size='small'
                      variant="outlined" >
                      <MenuItem value={0} disabled={true}>--Select Item Category--</MenuItem>
                      {generateDropDownMenu(ItemCategoryList)}
                    </TextField>
                  </Grid>
                  <Grid item md={3} xs={12}>
                    <InputLabel shrink id="factoryItemID">
                      Item
                    </InputLabel>
                    <TextField select
                      fullWidth
                      name="factoryItemID"
                      onChange={(e) => handleChange(e)}
                      size='small'
                      value={adjustmentList.factoryItemID}
                      variant="outlined"
                    >
                      <MenuItem value="0">--Select Item--</MenuItem>
                      {generateDropDownMenu(factoryItems)}
                    </TextField>
                  </Grid>
                </Grid>
              </CardContent>
              <Box minWidth={1000} hidden={isViewTable}>
                <MaterialTable
                  title="Multiple Actions Preview"
                  columns={[
                    { title: 'Grn Number', field: 'grnNumber' },
                    { title: 'Item', field: 'factoryItem', lookup: itemObject },
                    { title: 'Quantity', field: 'quantity' },
                    {
                      title: 'Reason', field: 'reason', lookup: {
                        1: 'Expire',
                        2: 'Wastage'
                      }
                    },
                    {
                      title: 'Grn Status', field: 'isActive', lookup: {
                        true: 'Active',
                        false: 'InActive'
                      }
                    },
                  ]}
                  data={factoryAdjustmentData}
                  options={{
                    exportButton: false,
                    showTitle: false,
                    headerStyle: { textAlign: "center", height: '1%' },
                    cellStyle: { textAlign: "center" },
                    columnResizable: false,
                    actionsColumnIndex: -1
                  }}
                  actions={[
                    {
                      icon: () => <VisibilityIcon />,
                      tooltip: 'View Item',
                      onClick: (event, factoryAdjustmentData) => handleClickEdit(factoryAdjustmentData.factoryItemAdjustmentID)
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

