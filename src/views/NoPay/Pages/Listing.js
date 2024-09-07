import React, { useState, useEffect, Fragment, } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  makeStyles,
  Container,
  CardHeader,
  Grid,
  CardContent,
  MenuItem,
  InputLabel,
  TextField,
  Button,
  Divider
} from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import MaterialTable from "material-table";
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { Formik } from 'formik';
import { LoadingComponent } from '../../../utils/newLoader';
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

const screenCode = 'NOPAY';
export default function UserListing(props) {
  const classes = useStyles();
  const alert = useAlert();
  const [noPayData, setNoPayData] = useState([]);
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [noPayList, setNoPayList] = useState({
    groupID: '0',
    factoryID: '0',
    registrationNumber: ''
  })
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });

  const navigate = useNavigate();
  let encrypted = "";
  const handleClick = () => {
    encrypted = btoa('0');
    navigate('/app/noPay/addedit/' + encrypted);
  }

  const editNoPayDetails = (noPayID) => {
    encrypted = btoa(noPayID.toString());
    navigate('/app/noPay/addedit/' + encrypted);
  }

  useEffect(() => {
    trackPromise(getPermission());
    trackPromise(getGroupsForDropdown());
  }, []);

  useEffect(() => {
    if (noPayList.groupID > 0) {
      trackPromise(
        getFactoriesForDropdown()
      );
    }
  }, [noPayList.groupID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWNOPAY');

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

    setNoPayList({
      ...noPayList,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })

    trackPromise(getGroupsForDropdown());
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getAllFactoriesByGroupID(noPayList.groupID);
    setFactories(factories);
  }

  async function getNoPayDetails() {
    var result = await services.getNoPayDetails(noPayList.groupID, noPayList.factoryID, noPayList.registrationNumber);
    if (result.statusCode === 'Error') {
      setNoPayData([]);
      alert.error(result.message);
    }
    if (result.statusCode === 'Success') {
      setNoPayData(result.data);
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
    setNoPayList({
      ...noPayList,
      [e.target.name]: e.target.value
    });
    if (e.target.name == 'groupID') {
      setNoPayList({
        ...noPayList,
        factoryID: '0'
      });
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
            toolTiptitle={"Add No Pay"}
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
        title="No Pay"
      >
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: noPayList.groupID,
              factoryID: noPayList.factoryID,
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),

              })
            }
            onSubmit={() => trackPromise(getNoPayDetails())}
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
                      title={cardTitle("No Pay ")}
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
                              value={noPayList.groupID}
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
                              value={noPayList.factoryID}
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
                              fullWidth
                              size='small'
                              name="registrationNumber"
                              onChange={(e) => { handleChange(e) }}
                              value={noPayList.registrationNumber}
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
                        {noPayData.length > 0 ?
                          <MaterialTable
                            title="No Pay Details"
                            columns={[
                              { title: 'Registration No', field: 'registrationNumber' },
                              { title: 'Name', field: 'name' },
                              { title: 'NIC', field: 'nicNumber' },
                              { title: 'No Pay Days', field: 'noPayDays' },
                              { title: 'Year & Month', field: 'noPayDate' },
                            ]}
                            data={noPayData}
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
                                onClick: (event, noPayData) => editNoPayDetails(noPayData.noPayID)
                              }
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
  );
};
