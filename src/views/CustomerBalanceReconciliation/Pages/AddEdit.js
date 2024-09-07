import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Button, makeStyles, Container, Divider, CardContent, CardHeader, Grid, TextField,
  MenuItem, InputLabel, Tooltip, Typography, Accordion, AccordionSummary
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { Fragment } from 'react';
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import MaterialTable from 'material-table';
import ArrowDropDownCircleIcon from '@material-ui/icons/ArrowDropDownCircle';

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

const screenCode = 'CUSTOMERBALANCERECONCILATION';

export default function CustomerBalanceReconcilation(props) {
  const classes = useStyles();
  const alert = useAlert();
  const [FormDetails, setFormDetails] = useState({
    groupID: 0,
    factoryID: 0
  });
  const [GroupList, setGroupList] = useState([]);
  const [FactoryList, setFactoryList] = useState([]);
  const [CustomerBalanceList, setcustomerBalanceList] = useState([]);

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });

  const [AccordianTitle, setAccordianTitle] = useState("Please Expand to View Reconcilation options")

  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/app/dashboard');
  };

  useEffect(() => {
    trackPromise(
      getPermission()
    )
  }, []);

  useEffect(() => {
    trackPromise(
      getFactoryByGroupID(FormDetails.groupID)
    )
  }, [FormDetails.groupID]);

  useEffect(() => {
    trackPromise(
      getCustomerBalancesForReconciliation(FormDetails.groupID, FormDetails.factoryID)
    )
  }, [FormDetails.factoryID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWCUSTOMERBALANCERECONCILATION');

    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined
    });

    setFormDetails({
      ...FormDetails,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
    getAllGroups();
  }

  function clearFormFields() {
    setFormDetails({
      ...FormDetails
    });
  }

  async function getAllGroups() {
    var response = await services.getAllGroups();
    setGroupList(response);
  };

  async function getFactoryByGroupID(groupID) {
    var response = await services.getFactoryByGroupID(groupID);
    setFactoryList(response);
  };


  async function updateCustomerRedisBalances() {
    var response = await services.updateCustomerRedisBalances(FormDetails.groupID, FormDetails.factoryID);
    if (response.statusCode == "Success") {
      alert.success(response.message);
      setTimeout(() => {
        trackPromise(
          getCustomerBalancesForReconciliation(FormDetails.groupID, FormDetails.factoryID)
        )
      }, 1000)
    }
    else {

      alert.error(response.message);
    }

  };

  async function getCustomerBalancesForReconciliation(groupID, factoryID) {
    if (groupID > 0 && factoryID > 0) {
      var result = await services.getCustomerBalancesForReconciliation(groupID, factoryID);
      if (result.statusCode == "Success") {
      }
      else {
        alert.error(result.message);
      }
      setcustomerBalanceList(result.data);
    }
  };

  function clearData() {
    setFormDetails({
      ...FormDetails,
    });
  }

  function handleGroupChange(e) {
    const target = e.target;
    const value = target.value
    setFormDetails({
      ...FormDetails,
      groupID: value,
      factoryID: 0
    });
  }

  function handleFactoryChange(e) {
    const target = e.target;
    const value = target.value
    setFormDetails({
      ...FormDetails,
      factoryID: value
    });
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setFormDetails({
      ...FormDetails,
      [e.target.name]: value
    });
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

  function cardTitle(titleName) {
    return (
      <Grid container spacing={1}>
        <Grid item md={10} xs={12}>
          {titleName}
        </Grid>
      </Grid>
    )
  }

  function toggleUserFields(expanded) {
    if (expanded === false) {
      setAccordianTitle("Please Expand to View Reconcilation options")
    } else {
      setAccordianTitle("Reconcilation option Panal")
    }
  };


  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={"Customer Balance Reconciliation"}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: FormDetails.groupID,
              factoryID: FormDetails.factoryID

            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().min(1, "Please Select a Group").required('Group is required'),
                factoryID: Yup.number().min(1, "Please Select a Factory").required('Factory is required'),
              })
            }
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleSubmit,
              touched,
              values
            }) => (
              <form onSubmit={handleSubmit}>
                <Box mt={0}>
                  <Card>
                    <CardHeader
                      title={cardTitle("Customer Balance Reconciliation")}
                    />
                    <PerfectScrollbar>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item md={6} xs={12}>
                            <InputLabel shrink id="groupID">
                              Group *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.groupID && errors.groupID)}
                              fullWidth
                              helperText={touched.groupID && errors.groupID}
                              size = 'small'
                              name="groupID"
                              onBlur={handleBlur}
                              onChange={(e) => {
                                handleGroupChange(e)
                              }}
                              value={FormDetails.groupID}
                              variant="outlined"
                              id="groupID"
                              InputProps={{
                                readOnly: !permissionList.isGroupFilterEnabled,
                              }}
                            >
                              <MenuItem value={'0'} disabled={true}>
                                --Select Group--
                              </MenuItem>
                              {generateDropDownMenu(GroupList)}
                            </TextField>
                          </Grid>
                          <Grid item md={6} xs={12}>
                            <InputLabel shrink id="factoryID">
                              Factory *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.factoryID && errors.factoryID)}
                              fullWidth
                              helperText={touched.factoryID && errors.factoryID}
                              size = 'small'
                              name="factoryID"
                              onBlur={handleBlur}
                              onChange={(e) => {
                                handleFactoryChange(e)
                              }}
                              value={FormDetails.factoryID}
                              variant="outlined"
                              id="factoryID"
                              InputProps={{
                                readOnly: !permissionList.isFactoryFilterEnabled,
                              }}
                            >
                              <MenuItem value={0} disabled={true}>
                                --Select Factory--
                              </MenuItem>
                              {generateDropDownMenu(FactoryList)}
                            </TextField>
                          </Grid>

                        </Grid>

                      </CardContent>
                      <CardContent>
                        {CustomerBalanceList.length > 0 ?
                          <MaterialTable
                            title="Customer Account Balance Details"
                            columns={[

                              { title: 'Customer ID', field: 'customerID' },
                              { title: 'Account ID', field: 'customerAccountID' },
                              { title: 'Registration No', field: 'registrationNumber' },
                              { title: 'Account Balance', field: 'balance' },
                              { title: 'Redis Balance', field: 'redisBalance' },
                              {
                                title: 'Balance Variance',
                                field: 'balanceVariance',
                                render: rowData => {
                                  if (rowData.balanceVariance > 0) {
                                    return <div style={{ backgroundColor: "#ffcdd2", padding: "10px", borderRadius: "5px" }}><Tooltip title="Balance mismatch">
                                      <span >{rowData.balanceVariance}</span>
                                    </Tooltip></div>
                                  } else {
                                    return 0
                                  }
                                },
                              },
                            ]}
                            data={CustomerBalanceList}
                            options={{
                              search: true,
                              actionsColumnIndex: -1
                            }}
                          /> :
                          <CardContent>
                            <Grid container spacing={3}>
                              <InputLabel>
                                No records found !
                              </InputLabel></Grid>
                          </CardContent>

                        }
                      </CardContent>
                      <CardContent>

                        <Accordion
                          defaultExpanded={false}
                          onChange={(e, expanded) => {
                            toggleUserFields(expanded)
                          }}
                        >
                          <AccordionSummary
                            expandIcon={
                              <ArrowDropDownCircleIcon
                                color="primary"
                                fontSize="large"
                              />
                            }
                            aria-controls="panel1a-content"
                            id="panel1a-header"
                          >
                            <div>
                              <Typography
                                color="textPrimary"
                                variant="h5"
                              >{AccordianTitle}</Typography>
                            </div>
                          </AccordionSummary>
                          {
                            <Box display="flex" justifyContent="flex-end" p={2}>
                              <InputLabel shrink id="groupID">
                                Fetch customer balances to redis server from SQL server data base.
                              </InputLabel>
                              <Button
                                color="primary"
                                type="button"
                                variant="contained"
                                onClick={() => updateCustomerRedisBalances()}
                              >
                                Fetch Redis Balances
                              </Button>
                            </Box>
                          }
                        </Accordion>

                      </CardContent>
                    </PerfectScrollbar>
                  </Card>
                </Box>
              </form>
            )}
          </Formik>
        </Container>
      </Page>
    </Fragment>)
}
