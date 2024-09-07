import React, { useState, useEffect, Fragment, createContext } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Button, Card, makeStyles, Container, CardHeader, CardContent, Divider, MenuItem, Grid, InputLabel, TextField } from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from "yup";
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder'
import { LoadingComponent } from './../../../utils/newLoader';
import MaterialTable from "material-table";
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
  },
  row: {
    marginTop: '1rem'
  }
}));

const screenCode = 'BUYERREGISTRATION';

export default function BuyerListing() {
  const [title, setTitle] = useState("Buyer");
  const classes = useStyles();
  const [GroupList, setGroupList] = useState([]);
  const [FactoryList, setFactoryList] = useState([]);
  const [buyerRequestDetail, setBuyerRequestDetail] = useState({
    groupID: 0,
    factoryID: 0,
  });
  const [buyerList, setBuyerList] = useState([]);
  const [isTableHide, setIsTableHide] = useState(true);
  const [isButtonHide, setIsButtonHide] = useState(false);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const navigate = useNavigate();
  let encrypted = "";
  const handleClick = () => {
    encrypted = btoa('0');
    navigate('/app/buyerRegistration/addEdit/' + encrypted)
  }
  const handleClickEdit = (buyerID) => {
    encrypted = btoa(buyerID.toString());
    navigate('/app/buyerRegistration/addEdit/' + encrypted);
  }
  const alert = useAlert();
  const [buyerDetailsList, setBuyerDetailsList] = useState([]);
  const [firstLoad, setFirstLoad] = useState({
    load: 0
  })

  useEffect(() => {
    if (buyerRequestDetail.factoryID != null) {
      trackPromise(
        GetBuyerRegistrationListFirst()
      );
    }
  }, [firstLoad.load]);

  useEffect(() => {
    trackPromise(
      getPermission());
    trackPromise(
      getGroupsForDropdown());
  }, []);

  useEffect(() => {
    trackPromise(
      getFactoriesForDropdown());
  }, [buyerRequestDetail.groupID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWBUYER');
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
    setBuyerRequestDetail({
      ...buyerRequestDetail,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
    setFirstLoad({
      ...firstLoad,
      load: 1
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroupList(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getFactoryByGroupID(buyerRequestDetail.groupID);
    setFactoryList(factories);
  }

  async function GetBuyerRegistrationListFirst() {
    const response = await services.GetBuyerRegistration(buyerRequestDetail.groupID, buyerRequestDetail.factoryID);
    if (response.statusCode == "Success" && response.data != null) {
      setBuyerDetailsList(response.data);
    }
  }

  async function GetBuyerRegistrationList() {
    const response = await services.GetBuyerRegistration(buyerRequestDetail.groupID, buyerRequestDetail.factoryID);
    if (response.statusCode == "Success" && response.data != null) {

      setBuyerDetailsList(response.data);
      if (response.data.length == 0) {
        alert.error("No records to display");
      }
    }
    else {
      alert.error(response.message);

    }
  }

  function generateDropDownMenu(data) {
    let items = []
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
      }
    }
    return items;
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setBuyerRequestDetail({
      ...buyerRequestDetail,
      [e.target.name]: value
    });
    setBuyerList([]);
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
            toolTiptitle={"Add Buyer"}
          />
        </Grid>
      </Grid>
    )
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: buyerRequestDetail.groupID,
              factoryID: buyerRequestDetail.factoryID
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
              })
            }
            onSubmit={() => trackPromise(GetBuyerRegistrationList())}
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
                    <CardHeader title={cardTitle(title)} />
                    <PerfectScrollbar>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="groupID">
                              Group *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.groupID && errors.groupID)}
                              fullWidth
                              helperText={touched.groupID && errors.groupID}
                              name="groupID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={buyerRequestDetail.groupID}
                              variant="outlined"
                              id="groupID"
                              size='small'
                              disabled={!permissionList.isGroupFilterEnabled}
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(GroupList)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="factoryID">
                              Factory *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.factoryID && errors.factoryID)}
                              fullWidth
                              helperText={touched.factoryID && errors.factoryID}
                              name="factoryID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={buyerRequestDetail.factoryID}
                              variant="outlined"
                              id="factoryID"
                              size='small'
                              disabled={!permissionList.isFactoryFilterEnabled}
                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateDropDownMenu(FactoryList)}
                            </TextField>
                          </Grid>
                        </Grid>
                        <Box display="flex" flexDirection="row-reverse" p={2} >
                          <Button
                            color="primary"
                            type="submit"
                            variant="contained"
                            size='small'
                          >
                            Search
                          </Button>
                        </Box>
                      </CardContent>
                      <Box minWidth={1050}>
                        {buyerDetailsList.length > 0 ?
                          <MaterialTable
                            title="Multiple Actions Preview"
                            columns={[
                              { title: 'Buyer Code', field: 'buyerCode' },
                              { title: 'Buyer Name', field: 'buyerName' },
                              { title: 'Registration Number', field: 'registrationNumber' },
                              { title: 'Contact No', field: 'contactNumber' },
                              {
                                title: 'Status', field: 'isActive',
                                render: rowData => rowData.isActive == true ? 'Active' : 'Inactive'
                              },
                            ]}
                            data={buyerDetailsList}
                            options={{
                              exportButton: false,
                              showTitle: false,
                              headerStyle: { textAlign: "left", height: '1%' },
                              cellStyle: { textAlign: "left" },
                              columnResizable: false,
                              actionsColumnIndex: -1,
                              pageSize: 10
                            }}
                            actions={[{
                              icon: 'edit',
                              tooltip: 'Edit',
                              onClick: (event, rowData) => handleClickEdit(rowData.buyerID)
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
}
