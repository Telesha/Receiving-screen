import React, { useState, useEffect, Fragment, useRef } from 'react';
import { useAlert } from "react-alert";
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, CardHeader, MenuItem
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import { Formik} from 'formik';
import * as Yup from "yup";
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { useNavigate } from 'react-router-dom';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { LoadingComponent } from '../../../../utils/newLoader';
import ReactToPrint from "react-to-print";
import CreatePDF from './CreatePDF';
import Typography from '@material-ui/core/Typography';
import SettingsIcon from '@material-ui/icons/Settings';
import IconButton from '@material-ui/core/IconButton';
import { KeyboardDatePicker } from "@material-ui/pickers";
import Tooltip from '@material-ui/core/Tooltip';
import CountUp from 'react-countup';

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
  colorCancel: {
    backgroundColor: "red",
  },
  colorRecord: {
    backgroundColor: "green",
  },
  bold: {
    fontWeight: 600,
  }

}));

const screenCode = 'BALANCESHEETREPORT';

export default function BalanceSheetReport(props) {

  const navigate = useNavigate();
  const alert = useAlert();
  const componentRef = useRef();
  const classes = useStyles();
  const [selectedDate, handleDateChange] = useState(new Date());
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [title, setTitle] = useState("Balance Sheet Report");
  const [BalanceSheetReportDetails, setBalanceSheetReportDetails] = useState({
    currentAssetsList: [],
    currentLiabilitiesList: [],
    longTermAssetsList: [],
    longTermLiabilityList: [],
    ownersEquityList: []
  })
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
    isBalanceSheetConfigurationEnabled: false,
  });
  const [BalanceSheetDetails, setBalanceSheetDetails] = useState({
    groupID: 0,
    factoryID: 0,
  });
  const [BalanceSheetSearched, setBalanceSheetSearched] = useState({
    groupName: '',
    factoryName: '',
    selectedDate: selectedDate
  });
  const [TotalCurrentAssestsAmount, setTotalCurrentAssestsAmount] = useState(0);
  const [TotalLongTermAssetsAmount, setTotalLongTermAssetsAmount] = useState(0);
  const [TotalAssetsAmount, setTotalAssetsAmount] = useState(0);

  const [TotalCurrentLiabilities, setTotalCurrentLiabilities] = useState(0);
  const [TotalLongTermLiabilities, setTotalLongTermLiabilities] = useState(0);
  const [TotalLiabilityAmount, setTotalLiabilityAmount] = useState(0);

  const [TotalOwnersEquity, setTotalOwnersEquity] = useState(0)
  const [TotalLiabilitiesAndOwnersQuity, setTotalLiabilitiesAndOwnersQuity] = useState(0)
  const [ProfitOrLoss, setProfitOrLoss] = useState(0)


  useEffect(() => {
    trackPromise(getPermission());
    trackPromise(getGroupsForDropdown());
  }, []);

  useEffect(() => {
    setTotalAssetsAmount(TotalCurrentAssestsAmount + TotalLongTermAssetsAmount)
  }, [TotalCurrentAssestsAmount, TotalLongTermAssetsAmount])

  useEffect(() => {
    setTotalLiabilityAmount(TotalCurrentLiabilities + TotalLongTermLiabilities)
  }, [TotalCurrentLiabilities, TotalLongTermLiabilities])

  useEffect(() => {
    setTotalLiabilitiesAndOwnersQuity(TotalOwnersEquity + TotalLiabilityAmount)
  }, [TotalOwnersEquity, TotalLiabilityAmount])

  useEffect(() => {
    trackPromise(getFactoriesForDropDown());
  }, [BalanceSheetDetails.groupID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWBALANCESHEETREPORT');

    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');
    var isBalanceSheetConfigurationEnabled = permissions.find(p => p.permissionCode == 'ENABLEBALANCESHEETCONFIGURATION');


    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
      isBalanceSheetConfigurationEnabled: isBalanceSheetConfigurationEnabled !== undefined,
    });

    setBalanceSheetDetails({
      ...BalanceSheetDetails,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getFactoriesForDropDown() {
    const factory = await services.getFactoryByGroupID(BalanceSheetDetails.groupID);
    setFactories(factory);
  }

  async function GetBalanceSheetDetails() {

    if (BalanceSheetDetails.groupID === "0" || BalanceSheetDetails.factoryID === "0") {
      return;
    }

    let resultModel = {
      groupID: parseInt(BalanceSheetDetails.groupID),
      factoryID: parseInt(BalanceSheetDetails.factoryID),
      selectedDate: selectedDate
    }

    const response = await services.GetBalanceSheetDetails(resultModel);
    if (response !== null && response.statusCode === "Success") {
      trackPromise(GetNetProfitAndLossForGivenPeriod(response.data, resultModel))
    } else {
      alert.error(response.message)
    }

    setBalanceSheetSearched({
      ...BalanceSheetSearched,
      groupName: groups[BalanceSheetDetails.groupID],
      factoryName: factories[BalanceSheetDetails.factoryID],
      selectedDate: selectedDate
    })

  }

  async function GetNetProfitAndLossForGivenPeriod(mainData, resultModel) {
    const response = await services.GetNetProfitAndLossForGivenPeriod(resultModel);

    if (response !== null && response.statusCode === "Success") {
      setBalanceSheetReportDetails(mainData);
      setProfitOrLoss(response.data);
    } else {
      alert.error(response.message)
    }
  }

  function NavigateToConfigurationPage() {
    navigate('/app/balanceSheet/balanceSheetSetupConfiguration/' + btoa(BalanceSheetDetails.groupID) + "/" + btoa(BalanceSheetDetails.factoryID));
  }

  function cardTitle(titleName) {
    return (
      <Grid container spacing={1}>
        <Grid item md={11} xs={12}>
          {titleName}
        </Grid>
        {
          BalanceSheetDetails.groupID === "0" || BalanceSheetDetails.factoryID === "0" ?
            null :
            <>
              {
                permissionList.isBalanceSheetConfigurationEnabled === true ?
                  <Grid item md={1} xs={12}>
                    <Tooltip title="Balance Sheet Configurations">
                      <IconButton
                        style={{ marginLeft: "3rem" }}
                        onClick={() => NavigateToConfigurationPage()}>
                        <SettingsIcon />
                      </IconButton>
                    </Tooltip>
                  </Grid> : null
              }
            </>
        }
      </Grid>
    )
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setBalanceSheetDetails({
      ...BalanceSheetDetails,
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

  function TotalSectionAmountCounter(assetsDetailsList, sectionCode) {
    const result = assetsDetailsList.reduce((totalAmount, item) => totalAmount + item.actualAmount, 0);

    if (sectionCode === "CURRETASSETS") {

      setTotalCurrentAssestsAmount(result);
      return result;

    } else if (sectionCode === "LONGTERMASSETS") {

      setTotalLongTermAssetsAmount(result);
      return result;

    } else if (sectionCode === "CURRETLIABILITIES") {

      setTotalCurrentLiabilities(result);
      return result;

    } else if (sectionCode === "LONGTERMLIABILITIES") {

      setTotalLongTermLiabilities(result);
      return result;

    } else if (sectionCode === "OWNERSEQUITY") {

      setTotalOwnersEquity(result);
      return result;

    }
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: BalanceSheetDetails.groupID,
              factoryID: BalanceSheetDetails.factoryID
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                factoryID: Yup.number().required('Estate is required').min("1", 'Estate is required')
              })
            }
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
                      title={cardTitle(title)}
                    />
                    <PerfectScrollbar>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
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
                              value={BalanceSheetDetails.groupID}
                              variant="outlined"
                              id="groupID"
                              disabled={!permissionList.isGroupFilterEnabled}
                              size='small'
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(groups)}
                            </TextField>
                          </Grid>

                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="factoryID">
                               Estate *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.factoryID && errors.factoryID)}
                              fullWidth
                              helperText={touched.factoryID && errors.factoryID}
                              name="factoryID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={BalanceSheetDetails.factoryID}
                              variant="outlined"
                              id="factoryID"
                              disabled={!permissionList.isFactoryFilterEnabled}
                              size='small'
                            >
                              <MenuItem value="0">--Select Estate--</MenuItem>
                              {generateDropDownMenu(factories)}
                            </TextField>
                          </Grid>

                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="applicableMonth">
                              As At *
                            </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                fullWidth
                                variant="inline"
                                format="dd/MM/yyyy"
                                margin="dense"
                                id="date-picker-inline"
                                value={selectedDate}
                                onChange={(e) => {
                                  handleDateChange(e)
                                }}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                                size='small'
                                autoOk
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                        </Grid>

                        <Box display="flex" flexDirection="row-reverse" p={2} >
                          <Button
                            color="primary"
                            type="submit"
                            variant="contained"
                            onClick={() => trackPromise(GetBalanceSheetDetails())}
                          >
                            Search
                          </Button>
                        </Box>


                        {
                          (BalanceSheetReportDetails.currentAssetsList.length > 0 ||
                            BalanceSheetReportDetails.currentLiabilitiesList.length > 0 ||
                            BalanceSheetReportDetails.longTermAssetsList.length > 0 ||
                            BalanceSheetReportDetails.longTermLiabilityList.length > 0 ||
                            BalanceSheetReportDetails.ownersEquityList.length > 0) ?


                            <div>

                              <Grid>

                                <h3 style={{ textAlign: 'center' }}>
                                  <span> {'Balance Sheet of ' + BalanceSheetSearched.factoryName} </span>
                                </h3>
                                <h5 style={{ textAlign: 'center' }}>
                                  <span> {' To ' + selectedDate.toISOString().split('T')[0]}  </span>
                                </h5>
                                <br />
                                <br />
                              </Grid>

                              <Grid container spacing={3}>
                                <Grid item md={12} xs={12}><Typography variant='h4' align="center">Assets</Typography></Grid>


                                <Grid container spacing={1}><Grid item md={7} xs={12}><Typography variant='h5' style={{ marginLeft: "15rem" }} align="left">Current Assets</Typography></Grid></Grid>
                                {
                                  BalanceSheetReportDetails.currentAssetsList.map((obj) => {

                                    return (
                                      <Grid container spacing={1}>
                                        <Grid item md={7} xs={12} ><Typography style={{ marginLeft: "20rem" }} align="left">{obj.ledgerAccountName}</Typography></Grid>
                                        <Grid item md={5} xs={12} >
                                          <Typography style={{ marginRight: "20rem" }} align="right">
                                            <CountUp
                                                end={obj.actualAmount}
                                                decimals={2}
                                                separator=','
                                                decimal="."
                                                duration={0.1}
                                            />  
                                        </Typography></Grid>
                                      </Grid>
                                    )
                                  })
                                }

                                <Grid container spacing={1} style={{ marginTop: "0.5rem" }}>
                                  <Grid item md={7} xs={12} ><Typography variant='h5' style={{ marginLeft: "15rem" }} align="left">Total Current Assests</Typography></Grid>
                                  <Grid item md={5} xs={12} >
                                    <Typography variant='h5' style={{ marginRight: "20rem" }} align="right">
                                      <CountUp
                                        end={TotalSectionAmountCounter(BalanceSheetReportDetails.currentAssetsList, "CURRETASSETS")}
                                        decimals={2}
                                        separator=','
                                        duration={0.1}
                                        decimal="."
                                      />
                                    </Typography></Grid>
                                </Grid>




                                <Grid container spacing={1} style={{ marginTop: "1rem" }}><Grid item md={7} xs={12}><Typography variant='h5' style={{ marginLeft: "15rem" }} align="left">Long-term Assets</Typography></Grid></Grid>
                                {
                                  BalanceSheetReportDetails.longTermAssetsList.map((obj) => {
                                    return (
                                      <Grid container spacing={1}>
                                        <Grid item md={7} xs={12} ><Typography style={{ marginLeft: "20rem" }} align="left">{obj.ledgerAccountName}</Typography></Grid>
                                        <Grid item md={5} xs={12} >
                                          <Typography style={{ marginRight: "20rem" }} align="right">
                                            <CountUp
                                              end = {obj.actualAmount}
                                              decimals = {2}
                                              decimal  = '.'
                                              duration={0.1}
                                              separator = ","
                                            />
                                          </Typography></Grid>
                                      </Grid>
                                    )
                                  })
                                }
                                <Grid container spacing={1} style={{ marginTop: "0.5rem" }}>
                                  <Grid item md={7} xs={12} ><Typography variant='h5' style={{ marginLeft: "15rem" }} align="left">Total Long-term Assests</Typography></Grid>
                                  <Grid item md={5} xs={12} >
                                    <Typography variant='h5' style={{ marginRight: "20rem" }} align="right">
                                      <CountUp
                                        end={TotalSectionAmountCounter(BalanceSheetReportDetails.longTermAssetsList, "LONGTERMASSETS")}
                                        decimals={2}
                                        decimal = '.'
                                        duration={0.1}
                                        separator = ','
                                      />
                                    </Typography></Grid>
                                </Grid>

                                <Grid container spacing={1} style={{ marginTop: "0.5rem" }}>
                                  <Grid item md={7} xs={12} ><Typography variant='h5' style={{ marginLeft: "15rem" }} align="left">Total Assests</Typography></Grid>
                                  <Grid item md={5} xs={12} >
                                    <Typography variant='h5' style={{ marginRight: "20rem", borderTop: "3px black solid", borderBottom: "5px black double" }} align="right">
                                      <CountUp
                                        end={TotalAssetsAmount}
                                        decimals = {2}
                                        decimal = '.'
                                        separator=','
                                        duration={0.1}
                                      />                                      
                                    </Typography></Grid>
                                </Grid>

                              </Grid>



                              <Grid container spacing={3} style={{ marginTop: "1.5rem" }}>
                                <Grid item md={12} xs={12}><Typography variant='h4' align="center">Liabilities</Typography></Grid>


                                <Grid container spacing={1}><Grid item md={7} xs={12}><Typography variant='h5' style={{ marginLeft: "15rem" }} align="left">Current Liabilities</Typography></Grid></Grid>
                                {
                                  BalanceSheetReportDetails.currentLiabilitiesList.map((obj) => {
                                    return (
                                      <Grid container spacing={1}>
                                        <Grid item md={7} xs={12} ><Typography style={{ marginLeft: "20rem" }} align="left">{obj.ledgerAccountName}</Typography></Grid>
                                        <Grid item md={5} xs={12} ><Typography style={{ marginRight: "20rem" }} align="right">
                                          <CountUp
                                            end={obj.actualAmount}
                                            decimals = {2}
                                            decimal = '.'
                                            separator=','
                                            duration={0.1}
                                          />

                                        </Typography></Grid>
                                      </Grid>
                                    )
                                  })
                                }
                                <Grid container spacing={1} style={{ marginTop: "0.5rem" }}>
                                  <Grid item md={7} xs={12} ><Typography variant='h5' style={{ marginLeft: "15rem" }} align="left">Total Current Liabilities</Typography></Grid>
                                  <Grid item md={5} xs={12} ><Typography variant='h5' style={{ marginRight: "20rem" }} align="right">
                                    <CountUp
                                      end={TotalSectionAmountCounter(BalanceSheetReportDetails.currentLiabilitiesList, "CURRETLIABILITIES")}
                                      decimals = {2}
                                      decimal = '.'
                                      separator = ','
                                      duration={0.1}
                                    />
                                  </Typography></Grid>
                                </Grid>


                                <Grid container spacing={1} style={{ marginTop: "1rem" }}><Grid item md={7} xs={12}><Typography variant='h5' style={{ marginLeft: "15rem" }} align="left">Long-term Liabilities</Typography></Grid></Grid>
                                {
                                  BalanceSheetReportDetails.longTermLiabilityList.map((obj) => {
                                    return (
                                      <Grid container spacing={1}>
                                        <Grid item md={7} xs={12} ><Typography style={{ marginLeft: "20rem" }} align="left">{obj.ledgerAccountName}</Typography></Grid>
                                        <Grid item md={5} xs={12} ><Typography style={{ marginRight: "20rem" }} align="right">
                                          <CountUp
                                            end={obj.actualAmount}
                                            decimals = {2}
                                            decimal = '.'
                                            separator=','
                                            duration={0.1}     
                                          />
                                        </Typography></Grid>
                                      </Grid>
                                    )
                                  })
                                }
                                <Grid container spacing={1} style={{ marginTop: "0.5rem" }}>
                                  <Grid item md={7} xs={12} ><Typography variant='h5' style={{ marginLeft: "15rem" }} align="left">Total Long-term Liabilities</Typography></Grid>
                                  <Grid item md={5} xs={12} ><Typography variant='h5' style={{ marginRight: "20rem" }} align="right">
                                    <CountUp
                                      end={TotalSectionAmountCounter(BalanceSheetReportDetails.longTermLiabilityList, "LONGTERMLIABILITIES")}
                                      decimals ={2}
                                      decimal = '.'
                                      separator=','
                                      duration={0.1}
                                    />
                                  </Typography></Grid>


                                </Grid>
                                <Grid container spacing={1} style={{ marginTop: "0.5rem" }}>
                                  <Grid item md={7} xs={12} ><Typography variant='h5' style={{ marginLeft: "15rem" }} align="left">Total Liabilities</Typography></Grid>
                                  <Grid item md={5} xs={12} ><Typography variant='h5' style={{ marginRight: "20rem", borderTop: "3px black solid" }} align="right">
                                    <CountUp
                                      end={TotalLiabilityAmount}
                                      decimals ={2}
                                      decimal = '.'
                                      separator=','
                                      duration={0.1}
                                    />
                                  </Typography></Grid>
                                </Grid>
                              </Grid>


                              <Grid container spacing={3} style={{ marginTop: "1.5rem" }}>
                                <Grid item md={12} xs={12}><Typography variant='h4' align="center">Owner's Equity</Typography></Grid>

                                <Grid container spacing={1}><Grid item md={7} xs={12}><Typography variant='h5' style={{ marginLeft: "15rem" }} align="left">Owner's Equity</Typography></Grid></Grid>
                                {
                                  BalanceSheetReportDetails.ownersEquityList.map((obj) => {
                                    return (
                                      <Grid container spacing={1}>
                                        <Grid item md={7} xs={12} ><Typography style={{ marginLeft: "20rem" }} align="left">{obj.ledgerAccountName}</Typography></Grid>
                                        <Grid item md={5} xs={12} ><Typography style={{ marginRight: "20rem" }} align="right">
                                          <CountUp
                                            end={obj.actualAmount}
                                            decimals ={2}
                                            decimal = '.'
                                            separator=','
                                            duration={0.1}    
                                          />
                                        </Typography></Grid>
                                      </Grid>
                                    )
                                  })
                                }
                                <Grid container spacing={1} style={{ marginTop: "0.5rem" }}>
                                  <Grid item md={7} xs={12} ><Typography variant='h5' style={{ marginLeft: "15rem" }} align="left">Accumulated Profit/Loss</Typography></Grid>
                                  <Grid item md={5} xs={12} ><Typography style={{ marginRight: "20rem" }} align="right">
                                    <CountUp
                                      end={ProfitOrLoss}
                                      decimals ={2}
                                      decimal = '.'
                                      separator=','
                                      duration={0.1}    
                                    />
                                    
                                  </Typography></Grid>
                                </Grid>
                                <Grid container spacing={1} style={{ marginTop: "0.5rem" }}>
                                  <Grid item md={7} xs={12} ><Typography variant='h5' style={{ marginLeft: "15rem" }} align="left">Total Owner's Equity</Typography></Grid>
                                  <Grid item md={5} xs={12} ><Typography variant='h5' style={{ marginRight: "20rem", borderTop: "3px black solid" }} align="right">
                                    <CountUp
                                      end={(TotalSectionAmountCounter(BalanceSheetReportDetails.ownersEquityList, "OWNERSEQUITY") + ProfitOrLoss)}
                                      decimals ={2}
                                      decimal = '.'
                                      separator=','
                                      duration={0.1}     
                                    />
                                  </Typography></Grid>
                                </Grid>
                                <Grid container spacing={1} style={{ marginTop: "1.5rem" }}>
                                  <Grid item md={7} xs={12} ><Typography variant='h5' style={{ marginLeft: "15rem" }} align="left">Total Liabilities and Owner's Equity</Typography></Grid>
                                  <Grid item md={5} xs={12} ><Typography variant='h5' style={{ marginRight: "20rem", borderTop: "3px solid black", borderBottom: "5px black double" }} align="right">
                                    <CountUp
                                      end={(TotalLiabilitiesAndOwnersQuity + ProfitOrLoss)}
                                      decimals ={2}
                                      decimal = '.'
                                      separator=','
                                      duration={0.1}   
                                    />
                                  </Typography></Grid>
                                </Grid>
                              </Grid>
                            </div> : null
                        }

                        {
                          (BalanceSheetReportDetails.currentAssetsList.length > 0 ||
                            BalanceSheetReportDetails.currentLiabilitiesList.length > 0 ||
                            BalanceSheetReportDetails.longTermAssetsList.length > 0 ||
                            BalanceSheetReportDetails.longTermLiabilityList.length > 0 ||
                            BalanceSheetReportDetails.ownersEquityList.length > 0) ?



                            <Box display="flex" justifyContent="flex-end" p={2}>

                              <ReactToPrint
                                documentTitle={"Balance Sheet Report"}
                                trigger={() => <Button
                                  color="primary"
                                  id="btnRecord"
                                  type="submit"
                                  variant="contained"
                                  style={{ marginRight: '1rem' }}
                                  className={classes.colorCancel}

                                >
                                  PDF
                                </Button>}
                                content={() => componentRef.current}
                              />
                              <div hidden={true}>
                                <CreatePDF ref={componentRef}
                                  BalanceSheetReportDetails={BalanceSheetReportDetails}
                                  TotalCurrentAssestsAmount={TotalCurrentAssestsAmount}
                                  TotalLongTermAssetsAmount={TotalLongTermAssetsAmount}
                                  TotalAssetsAmount={TotalAssetsAmount}
                                  TotalCurrentLiabilities={TotalCurrentLiabilities}
                                  TotalLongTermLiabilities={TotalLongTermLiabilities}
                                  TotalLiabilityAmount={TotalLiabilityAmount}
                                  TotalOwnersEquity={TotalOwnersEquity}
                                  TotalLiabilitiesAndOwnersQuity={TotalLiabilitiesAndOwnersQuity}
                                  BalanceSheetSearched={BalanceSheetSearched}
                                  ProfitOrLoss = {ProfitOrLoss}
                                />
                              </div>

                            </Box> : null
                        }

                      </CardContent>
                    </PerfectScrollbar>
                  </Card>
                </Box>
              </form>
            )}
          </Formik>
        </Container>
      </Page>
    </Fragment >
  );
}
