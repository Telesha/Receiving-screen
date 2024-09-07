import React, { useState, useEffect, Fragment } from 'react';
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
  CardHeader,
  Button
} from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import MaterialTable from "material-table";
import { LoadingComponent } from '../../../utils/newLoader';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";


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

const screenCode = "CUSTOMERMAINTENANCE";

export default function CustomerListing(props) {
  const classes = useStyles();
  const alert = useAlert();
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [customerList, setCustomerList] = useState({
    groupID: '0',
    factoryID: '0',
   registrationNumber:'',
  })
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });

  const [customersData, setcustomersData] = useState([]);
  const navigate = useNavigate();
  let encryptedID = "";

  const handleClick = () => {
    encryptedID = btoa('0');
    navigate('/app/customers/addedit/' + encryptedID);
  }

  const EditCustomerDetails = (customerID) => {
    encryptedID = btoa(customerID.toString());
    navigate('/app/customers/addedit/' + encryptedID);
  }

  useEffect(() => {
    trackPromise(
      getPermission()
    );
  }, []);
  useEffect(() => {
      trackPromise(
        getFactoriesForDropDown(),
      );
  }, [customerList.groupID]);

  useEffect(() => {
    if(customerList.factoryID>0){
      trackPromise(
        getCustomersByFactoryID());
    } 
  }, [customerList.factoryID]);


  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWCUSTOMERMAINTENANCE');

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

    setCustomerList({
      ...customerList,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    });
    trackPromise(
      getGroupsForDropdown())
  }

  async function getFactoriesForDropDown() {
    const factory = await services.getFactoryByGroupID(customerList.groupID);
    setFactories(factory);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroups(groups);
  }

  async function getCustomersByFactoryID() {
    var result = await services.getCustomersByFactoryID(customerList.factoryID, customerList.registrationNumber);
    if (result.length == 0) {
      alert.error("NO RECORDS TO DISPLAY")
    }
    else {
      setcustomersData(result);
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
    setCustomerList({
      ...customerList,
      [e.target.name]: value
    });
    setcustomersData([]);
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
            toolTiptitle={"Add Customer"}
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
        title="Customer"
      >
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: customerList.groupID,
              factoryID: customerList.factoryID,
              registrationNumber: customerList.registrationNumber,
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
                registrationNumber: Yup.string().matches(/^(?! )[a-zA-Z0-9]{0,15}$/, 'Please enter valid registration number'),
              })
            }
            onSubmit={() => trackPromise(getCustomersByFactoryID())}
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleSubmit,
              touched
            }) => (
              <form onSubmit={handleSubmit}>
                <Box mt={0}>
                  <Card>
                    <CardHeader
                      title={cardTitle("Customer Maintenance ")}
                    />
                    <PerfectScrollbar>
                      <Divider />
                      <CardContent style={{ marginBottom: "2rem" }}>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="groupID">
                              Group   *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.groupID && errors.groupID)}
                              fullWidth
                              helperText={touched.groupID && errors.groupID}
                              size='small'
                              name="groupID"
                              onChange={(e) => handleChange(e)}
                              value={customerList.groupID}
                              variant="outlined"
                              id="groupID"
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
                              Factory *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.factoryID && errors.factoryID)}
                              fullWidth
                              helperText={touched.factoryID && errors.factoryID}
                              size='small'
                              name="factoryID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={customerList.factoryID}
                              variant="outlined"
                              id="factoryID"
                              InputProps={{
                                readOnly: !permissionList.isFactoryFilterEnabled,
                              }}
                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateDropDownMenu(factories)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="registrationNumber">
                                Registration Number
                            </InputLabel>
                            <TextField
                               error={Boolean(touched.registrationNumber && errors.registrationNumber)}
                               fullWidth
                               helperText={touched.registrationNumber && errors.registrationNumber}
                              size='small'
                              name="registrationNumber"
                              onChange={(e) => {
                                handleChange(e)
                              }}
                              value={customerList.registrationNumber}
                              variant="outlined"
                              id="registrationNumber"
                            >
                            </TextField>
                          </Grid>
                          <Grid container justify="flex-end">
                            <Box pr={2}>
                              <Button
                                color="primary"
                                variant="contained"
                                type="submit"
                              >
                                Search
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                      <Box minWidth={1000}>
                        <MaterialTable
                          title="Multiple Actions Preview"
                          columns={[
                            { title: 'Customer Code', field: 'customerCode' },
                            { title: 'Customer Name', field: 'firstName' },
                            { title: 'Customer NIC', field: 'customerNic' },
                            {
                              title: 'Status', field: 'isActive',
                              render: rowData => {
                                if (rowData.isActive) {
                                  return "Active"
                                } else {
                                  return "Inactive"
                                }
                              }
                            }
                          ]}
                          data={customersData}
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
                              tooltip: 'Edit Customer',
                              onClick: (event, customersData) => EditCustomerDetails(customersData.customerID)
                            }
                          ]}
                        />
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

