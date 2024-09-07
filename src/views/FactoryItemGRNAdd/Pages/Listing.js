import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  makeStyles,
  Container,
  CardContent,
  Divider,
  MenuItem,
  Grid,
  InputLabel,
  TextField,
  CardHeader,
  Button
} from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import MaterialTable from 'material-table';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { Fragment } from 'react';
import { LoadingComponent } from '../../../utils/newLoader';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useAlert } from 'react-alert';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
}));

const screenCode = "FACTORYITEMGRNADD"

export default function FactoryGRNAddListing() {
  const classes = useStyles();
  const [factoryItemData, setFactoryItemData] = useState([]);
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [factoryList, setFactoryList] = useState({
    groupID: '0',
    factoryID: '0',
    factoryItemID: '0',
    itemCategoryID: '0',
    locationID: '0'
  })
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const navigate = useNavigate();
  const [factoryItems, setFactoryItems] = useState();
  const [ItemCategoryList, setItemCategoryList] = useState();
  const alert = useAlert();
  let encrypted = "";

  const handleClick = () => {
    encrypted = btoa('0');
    navigate('/app/factoryGRNAdd/addedit/' + encrypted);
  }

  const handleClickEdit = (factoryItemGRNAddID) => {
    encrypted = btoa(factoryItemGRNAddID.toString());
    navigate('/app/factoryGRNAdd/addedit/' + encrypted);
  }

  useEffect(() => {
    trackPromise(
      getPermission()
    );
  }, []);

  useEffect(() => {
    trackPromise(getAllActiveItemCategory())
  }, [])

  useEffect(() => {
    trackPromise(
      getFactoriesForDropDown(),
    )
  }, [factoryList.groupID]);

  useEffect(() => {
    trackPromise(
      getfactoryItemsForDropDown()
    )
  }, [factoryList.groupID, factoryList.factoryID, factoryList.itemCategoryID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWFACTORYITEMGRNADD');

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

    setFactoryList({
      ...factoryList,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    });

    getGroupsForDropdown();
  }

  async function getAllActiveItemCategory() {
    const result = await services.getAllActiveItemCategory();
    setItemCategoryList(result);
  }

  async function getfactoryItemsForDropDown() {
    const factoryItem = await services.getfactoryItemsByGroupIDFactoryIDItemCategoryID(factoryList.groupID, factoryList.factoryID, factoryList.itemCategoryID);
    setFactoryItems(factoryItem);
  }

  async function getFactoryGRNByFactoryItemID() {
    const grnss = await services.getFactoryGRNByFactoryItemID(factoryList.factoryID, factoryList.factoryItemID, factoryList.itemCategoryID);

    if (grnss.length > 0) {
      grnss.forEach(x => {
        x.unitPrice = x.unitPrice.toFixed(2);
        x.buyingPrice = x.buyingPrice.toFixed(2);
        x.invoiceDate = x.invoiceDate.split('T')[0];
      if (x.grnTypeID == 1) {
        x.grnTypeID = "Direct GRN"
      }
      else if (x.grnTypeID == 2) {
        x.grnTypeID = "Purchase Order"
      }
      });
      setFactoryGrnData(grnss);
    }
    else {
      clearTable();
      alert.error("No records to display");

    }
  }

  async function getFactoriesForDropDown() {
    const factory = await services.getFactoryByGroupID(factoryList.groupID);
    setFactories(factory);
  }

  async function getFactoryGRNByFactoryID() {
    const grnss = await services.getFactoryGRNByFactoryID(factoryList.factoryID);
    setFactoryGrnData(grnss);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroups(groups);
  }

  function setFactoryGrnData(data) {
    setFactoryItemData(data);
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

  function handleChangeItemCategory(e) {
    const target = e.target;
    const value = target.value
    setFactoryList({
      ...factoryList,
      itemCategoryID: value,
      factoryItemID: 0

    });
    clearTable();
  }

  function handleChange1(e) {
    const target = e.target;
    const value = target.value
    setFactoryList({
      ...factoryList,
      [e.target.name]: value
    });
    clearTable();
  }

  function handleGroupChange(e) {
    const target = e.target;
    const value = target.value
    setFactoryList({
      ...factoryList,
      [e.target.name]: value,
      factoryID: 0,
      factoryItemID: 0
    });
    clearTable();
  }

  function handleFactoryChange(e) {
    const target = e.target;
    const value = target.value
    setFactoryList({
      ...factoryList,
      [e.target.name]: value,
      factoryItemID: 0
    });
  }

  function clearTable() {
    setFactoryGrnData([]);
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
            toolTiptitle={"Add Good Receive Note"}
          />
        </Grid>
      </Grid>
    )
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page
        className={classes.root}
        title="Goods Received Note Add"
      >
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: factoryList.groupID,
              factoryID: factoryList.factoryID,
              itemCategoryID: factoryList.itemCategoryID,
              factoryItemID: factoryList.factoryItemID
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
                itemCategoryID: Yup.number().required('Item Category is required').min("1", 'Item Category is required'),
                factoryItemID: Yup.number(),
              })
            }
            onSubmit={getFactoryGRNByFactoryItemID}
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleChange,
              handleSubmit,
              isSubmitting,
              touched,
              values,
              props
            }) => (
              <form onSubmit={handleSubmit}>
                <Box mt={0}>
                  <Card>
                    <CardHeader
                      title={cardTitle("Goods Received Note Add")}
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
                              error={Boolean(touched.groupID && errors.groupID)}
                              fullWidth
                              helperText={touched.groupID && errors.groupID}
                              name="groupID"
                              onChange={(e) => handleGroupChange(e)}
                              value={factoryList.groupID}
                              variant="outlined"
                              size='small'
                              InputProps={{
                                readOnly: !permissionList.isGroupFilterEnabled,
                              }}
                            >
                              <MenuItem value="0" disabled={true}>--Select Group--</MenuItem>
                              {generateDropDownMenu(groups)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="factoryID">
                              Factory *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.factoryID && errors.factoryID)}
                              fullWidth
                              helperText={touched.factoryID && errors.factoryID}
                              name="factoryID"
                              onChange={(e) => handleChange1(e)}
                              value={factoryList.factoryID}
                              variant="outlined"
                              size='small'
                              id="factoryID"
                              InputProps={{
                                readOnly: !permissionList.isFactoryFilterEnabled,
                              }}
                            >
                              <MenuItem value="0" disabled={true}>--Select Factory--</MenuItem>
                              {generateDropDownMenu(factories)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="itemCategoryID">
                              Item Category *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.itemCategoryID && errors.itemCategoryID)}
                              fullWidth
                              helperText={touched.itemCategoryID && errors.itemCategoryID}
                              name="itemCategoryID"
                              onChange={(e) => handleChangeItemCategory(e)}
                              value={factoryList.itemCategoryID}
                              size='small'
                              variant="outlined" >
                              <MenuItem value={0} disabled={true}>--Select Item Category--</MenuItem>
                              {generateDropDownMenu(ItemCategoryList)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="factoryItemID">
                              Factory Item 
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.factoryItemID && errors.factoryItemID)}
                              fullWidth
                              helperText={touched.factoryItemID && errors.factoryItemID}
                              name="factoryItemID"
                              onChange={(e) => handleChange1(e)}
                              value={factoryList.factoryItemID}
                              variant="outlined"
                              size='small'
                              id="factoryItemID"
                            >
                              <MenuItem value="0">--Select Factory Item--</MenuItem>
                              {generateDropDownMenu(factoryItems)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                              <InputLabel shrink id="locationID">
                                Location
                              </InputLabel>
                              <TextField select
                                error={Boolean(touched.locationID && errors.locationID)}
                                fullWidth
                                helperText={touched.locationID && errors.locationID}
                                name="locationID"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange1(e)}
                                value={factoryList.locationID}
                                size='small'
                                variant="outlined"
                              >
                                <MenuItem value="0">--Select Factory--</MenuItem>
                                {generateDropDownMenu(factories)}
                              </TextField>
                            </Grid>
                        </Grid>
                      </CardContent>
                      <Box display="flex" justifyContent="flex-end" p={2}>
                        <Button
                          color="primary"
                          type="submit"
                          variant="contained"
                          size='small'
                        >
                          Search
                        </Button>
                      </Box>
                      <Box minWidth={1050}>
                        {factoryItemData.length > 0 ?
                          < MaterialTable
                            title="Good Receive Note List"
                            columns={[
                              { title: 'Factory Item GRNID', field: 'factoryItemGRNAddIDAdd', hidden: true },
                              { title: 'Created Date', field: 'createdDate', hidden: true, defaultSort: 'desc' },
                              { title: 'Invoice Number', field: 'invoiceNumber' },
                              { title: 'GRN Number', field: 'grnNumber' },
                              { title: 'GRN Type', field: 'grnTypeID' },
                              { title: 'Quantity', field: 'quantity' },
                              { title: 'Available Quantity', field: 'availableQuantity' },
                              { title: 'Selling Price', field: 'unitPrice' },
                              { title: 'Buying Price', field: 'buyingPrice' },
                              { title: 'Invoice Date', field: 'invoiceDate' }
                            ]}
                            data={factoryItemData}
                            options={{
                              grouping: true,
                              search: true,
                              actionsColumnIndex: -1
                            }}
                            actions={[{
                              icon: 'edit',
                              tooltip: 'Edit',
                              onClick: (event, rowData) => handleClickEdit(rowData.factoryItemGRNID)
                            }]}
                          /> : null}
                      </Box>
                    </PerfectScrollbar>
                  </Card>
                </Box>
              </form>
            )}
          </Formik>
        </Container>
      </Page>
    </Fragment>
  );
};

