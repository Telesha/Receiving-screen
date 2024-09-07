import React, { useState, useEffect, Fragment } from 'react';
import {
  Box,
  Card,
  Button,
  makeStyles,
  Container,
  Divider,
  CardContent,
  CardHeader,
  Grid,
  TextField,
  MenuItem,
  InputLabel
} from '@material-ui/core';
import PerfectScrollbar from 'react-perfect-scrollbar';
import Page from 'src/components/Page';
import services from '../Services';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { useNavigate } from 'react-router-dom';
import PageHeader from 'src/views/Common/PageHeader';
import { trackPromise } from 'react-promise-tracker';
import VisibilityIcon from '@material-ui/icons/Visibility';
import MaterialTable from "material-table";
import * as Yup from "yup";
import { Formik } from 'formik';
import { LoadingComponent } from 'src/utils/newLoader';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
  avatar: {
    marginRight: theme.spacing(2)
  },
  row: {
    marginTop: '1rem'
  }

}));

const screenCode = 'PURCHASEORDER';

export default function PurchaseOrderListing(props) {
  const classes = useStyles();
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [suppliers, setSuppliers] = useState([]);
  const [factoryAdjustmentData, setFactoryAdjustmentData] = useState([]);
  const [orderList, setOrderList] = useState({
    groupID: '0',
    factoryID: '0',
    supplierID: '0'
  })
  const navigate = useNavigate();
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  let encrypted = "";
  const handleClick = () => {
    encrypted = btoa('0');
    navigate('/app/purchaseOrder/addedit/' + encrypted)
  }
  const handleClickEdit = (purchaseOrderID) => {
    encrypted = btoa(purchaseOrderID.toString());
    navigate('/app/purchaseOrder/view/' + encrypted);
  }

  useEffect(() => {
    getPermission();
    getGroupsForDropdown();
  }, []);

  useEffect(() => {
    trackPromise(
      getFactoryByGroupID(orderList.groupID)
    );
  }, [orderList.groupID]);

  useEffect(() => {
    trackPromise(
      getSuppliers()
    );
  }, [orderList.groupID, orderList.factoryID]);

  useEffect(() => {
    if (orderList.groupID > 0 && orderList.factoryID > 0) {
      trackPromise(
        getAllPurchaseOrder());
    }
  }, [orderList.groupID, orderList.factoryID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWPURCHASEORDER');
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

    setOrderList({
      ...orderList,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getAllPurchaseOrder() {
    var result = await services.getAllPurchaseOrder(orderList.groupID, orderList.factoryID);
    if (result.statusCode == "Success") {
      setFactoryAdjustmentData(result.data);
    }
    else {
      alert.error(result.message);
    }
  }

  async function getGroupsForDropdown() {
    var response = await services.getGroupsForDropdown();
    setGroups(response);
  };

  async function getFactoryByGroupID(groupID) {
    var response = await services.getFactoryByGroupID(groupID);
    setFactories(response);
  };

  async function getSuppliers() {
    const suppliers = await services.GetSuppliersByGroupIDAndFactoryID(orderList.groupID, orderList.factoryID);
    setSuppliers(suppliers);
  }

  async function getPurchaseOrderByGroupIDFactoryID() {
    const response = await services.getPurchaseOrderByGroupIDFactoryID(orderList.factoryID, orderList.supplierID);
    if (response.length > 0) {
      setFactoryAdjustmentData(response);
    }
    else {
      clearTable();
      alert.error("No Records To Display");
    }

  }

  function clearTable() {
    setFactoryAdjustmentData([]);
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

  function handleChangeGroupId(e) {
    const target = e.target;
    const value = target.value
    setOrderList({
      ...orderList,
      [e.target.name]: value
    });
    clearTable();
  }
  function handleChangeFactoryId(e) {
    const target = e.target;
    const value = target.value
    setOrderList({
      ...orderList,
      [e.target.name]: value
    });
    clearTable();
  }
  function handleChangeSupplierId(e) {
    const target = e.target;
    const value = target.value
    setOrderList({
      ...orderList,
      [e.target.name]: value
    });
    clearTable();
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
            toolTiptitle={"Add Purcahse Order"}
          />
        </Grid>
      </Grid>
    )
  }

  return (
    <Fragment>
      <Page
        className={classes.root}
        title="Purchase Order"
      >
        <LoadingComponent />
        <Container maxWidth={false}>
          <Formik

            initialValues={{
              groupID: orderList.groupID,
              factoryID: orderList.factoryID,
              supplierID: orderList.supplierID,
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
                supplierID: Yup.number(),
              })
            }
            onSubmit={getPurchaseOrderByGroupIDFactoryID}
            enableReinitialize
          >
            {({
              errors,
              handleSubmit,
              touched,

            }) => (
              <form onSubmit={handleSubmit}>
                <Box mt={0}>
                  <Card>
                    <CardHeader
                      title={cardTitle("Purchase Order")}
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
                              onChange={(e) => handleChangeGroupId(e)}
                              value={orderList.groupID}
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
                              error={Boolean(touched.factoryID && errors.factoryID)}
                              fullWidth
                              helperText={touched.factoryID && errors.factoryID}
                              name="factoryID"
                              onChange={(e) => handleChangeFactoryId(e)}
                              value={orderList.factoryID}
                              variant="outlined"
                              id="factoryID"
                              disabled={!permissionList.isFactoryFilterEnabled}
                              size='small'
                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateDropDownMenu(factories)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="supplierID">
                              Item Supplier
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="supplierID"
                              onChange={(e) => handleChangeSupplierId(e)}
                              value={orderList.supplierID}
                              variant="outlined"
                              id="supplierID"
                              size='small'
                            >
                              <MenuItem value="0">--Select Supplier--</MenuItem>
                              {generateDropDownMenu(suppliers)}
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
                        {factoryAdjustmentData.length > 0 ?
                          <MaterialTable
                            title="Multiple Actions Preview"
                            columns={[
                              { title: 'Date', field: 'createdDate', render: rowData => rowData.createdDate.split('T')[0] },
                              { title: 'PO Number', field: 'purchaseOrderNumber' },
                              { title: 'Total Amount (LKR)', field: 'totalPrice', render: rowData => rowData.totalPrice.toFixed(2) },
                              { title: 'Item Supplier', field: 'supplierName' },
                            ]}
                            data={factoryAdjustmentData}
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
                                icon: () => <VisibilityIcon />,
                                tooltip: 'View Purchase Order',
                                onClick: (event, factoryAdjustmentData) => handleClickEdit(factoryAdjustmentData.purchaseOrderID)
                              },
                            ]}
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
  )
}
