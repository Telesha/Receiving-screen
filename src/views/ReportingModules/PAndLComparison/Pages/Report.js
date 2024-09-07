import React, { useState, useEffect, Fragment, useRef } from 'react';
import { useAlert } from "react-alert";
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, CardHeader, MenuItem,
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import { Formik} from 'formik';
import * as Yup from "yup";
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { useNavigate } from 'react-router-dom';
import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { LoadingComponent } from '../../../../utils/newLoader';
import ReactToPrint from "react-to-print";
import CreatePDF from './CreatePDF';
import Typography from '@material-ui/core/Typography';
import SettingsIcon from '@material-ui/icons/Settings';
import IconButton from '@material-ui/core/IconButton';
import { KeyboardDatePicker } from "@material-ui/pickers";
import Tooltip from '@material-ui/core/Tooltip';
import lodash from 'lodash';

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

const screenCode = 'PROFITANDLOSSCOMPARISONREPORT';

export default function ProfitAndLossReport(props) {

  const navigate = useNavigate();
  const alert = useAlert();
  const componentRef = useRef();
  const classes = useStyles();
  const [selectedDate, handleDateChange] = useState(new Date());
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [title, setTitle] = useState("Profit & Loss Comparison Report");
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
    isProfitAndLossConfigurationEnabled: false,
  });
  const [ProfitAndLossDetils, setProfitAndLossDetils] = useState({
    groupID: 0,
    factoryID: 0,
  });
  const [ParentSectionDetails, setParentSectionDetails] = useState({
    REVENUE: [],
    COSTOFREVENUE: [],
    OTHERINCOME: [],
    SELLINGANDMARKETINGEXPENSES: [],
    ADMINISTRATIONEXPENSES: [],
    OTHEREXPENSES: [],
    FINANCEEXPENSES: [],
    INCOMETAXEXPENSES: []
  });
  const [ParentList, setParentList] = useState([]);
  const [ChildList, setChildList] = useState([]);
  const [GrossProfit, setGrossProfit] = useState(0);
  const [LossFromOperatingActivitiesAmount, setLossFromOperatingActivitiesAmount] = useState(0);
  const [NewProfitForThePeriodAmount, setNewProfitForThePeriodAmount] = useState(0);
  const [IsReportVisible, setIsReportVisible] = useState(false);
  const [show, setShow] = useState(true)
  const [isFormVisible, setIsFormVisible] = useState(false);

  useEffect(() => {
    trackPromise(getPermission());
    trackPromise(getGroupsForDropdown());
  }, []);


  useEffect(() => {
    trackPromise(getFactoriesForDropDown());
  }, [ProfitAndLossDetils.groupID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWPROFITANDLOSSCOMPARISONREPORT');
    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');
    var isProfitAndLossConfigurationEnabled = permissions.find(p => p.permissionCode == 'ENABLEPROFITANDLOSSCONFIGURATION');


    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
      isProfitAndLossConfigurationEnabled: isProfitAndLossConfigurationEnabled !== undefined,
    });

    setProfitAndLossDetils({
      ...ProfitAndLossDetils,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getFactoriesForDropDown() {
    const factory = await services.getFactoryByGroupID(ProfitAndLossDetils.groupID);
    setFactories(factory);
  }

  function NavigateToConfigurationPage() {
    navigate('/app/profitAndLoss/profitAndLossSetupConfiguration/' + btoa(ProfitAndLossDetils.groupID) + "/" + btoa(ProfitAndLossDetils.factoryID));
  }

  function cardTitle(titleName) {
    return (
      <Grid container spacing={1}>
        <Grid item md={11} xs={12}>
          {titleName}
        </Grid>
        {
          ProfitAndLossDetils.groupID === "0" || ProfitAndLossDetils.factoryID === "0" ?
            null :
            <>
              {
                permissionList.isProfitAndLossConfigurationEnabled === true ?
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
    setProfitAndLossDetils({
      ...ProfitAndLossDetils,
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

  async function GetProfitAndLossDetailsReport() {
    setIsFormVisible(true);
    if (ProfitAndLossDetils.groupID === "0" || ProfitAndLossDetils.factoryID === "0") {
      return;
    }

    let resultModel = {
      groupID: parseInt(ProfitAndLossDetils.groupID),
      factoryID: parseInt(ProfitAndLossDetils.factoryID),
      selectedDate: selectedDate
    }

    const response = await services.GetProfitAndLossReportDetails(resultModel);

    if (response !== null && response.statusCode === "Success") {
      let result = await GroupLedgerAccountList(response.data.ledgerAccocuntList)
      //setIsReportVisible(true)
      setParentSectionDetails(result)
    } else {
      setIsReportVisible(false)
      setParentSectionDetails([])
      alert.error(response.message)
    }
  }

  async function GroupLedgerAccountList(ledgerDetails) {
    let data = ledgerDetails;

    let parentSectionList = lodash.sortedUniq(data.map(object => object.profitAndLossParentSectionType))
    setParentList(parentSectionList)

    let subSectionList = lodash.sortedUniq(data.map(object => object.profitAndLossSectionType))
    setChildList(subSectionList)

    let temp = []

    for (const iterator of parentSectionList) {
      let parentList = data.filter(x => x.profitAndLossParentSectionType === iterator)

      let model = {
        parentName: parentList[0].profitAndLossParentSectionName,
        parentCode: parentList[0].profitAndLossParentSectionType,
        dataList: GetChildSegments(parentList, subSectionList),
        totalAmount: parentList.reduce((totalCredit, item) => totalCredit + item.actualAmount, 0)
      }
      temp.push(model)
    }

    let lemp2 = lodash.groupBy(temp, 'parentCode')

    let grossProfit = (lemp2.REVENUE !== undefined ? lemp2.REVENUE[0].totalAmount : 0 - lemp2.COSTOFREVENUE !== undefined ? lemp2.COSTOFREVENUE[0].totalAmount : 0)
    let otherIncome = lemp2.OTHERINCOME !== undefined ? lemp2.OTHERINCOME[0].totalAmount : 0
    let otherExpenses = ((lemp2.ADMINISTRATIONEXPENSES !== undefined ? lemp2.ADMINISTRATIONEXPENSES[0].totalAmount : 0) + (lemp2.OTHEREXPENSES !== undefined ? lemp2.OTHEREXPENSES[0].totalAmount : 0) + (lemp2.SELLINGANDMARKETINGEXPENSES !== undefined ? lemp2.SELLINGANDMARKETINGEXPENSES[0].totalAmount : 0))
    let lossFromOperatingActivities = (grossProfit + otherIncome) - otherExpenses
    let financeExpenses = lemp2.FINANCEEXPENSES !== undefined ? lemp2.FINANCEEXPENSES[0].totalAmount : 0
    let incomeTaxExpenses = lemp2.INCOMETAXEXPENSES !== undefined ? lemp2.INCOMETAXEXPENSES[0].totalAmount : 0
    let netProfit = lossFromOperatingActivities - (financeExpenses + incomeTaxExpenses);

    setGrossProfit(grossProfit);
    setLossFromOperatingActivitiesAmount(lossFromOperatingActivities)
    setNewProfitForThePeriodAmount(netProfit);

    return lemp2;
  }


  function GetChildSegments(parentList, subSectionList) {
    let temp2 = [];

    for (const obj2 of subSectionList) {
      let childList = parentList.filter(x => x.profitAndLossSectionType === obj2);
      if (childList.length !== 0) {
        let model2 = {
          childCode: childList[0].profitAndLossSectionType,
          childName: childList[0].profitAndLossSectionName,
          dataList: GetLedgerAccount(childList)
        }
        temp2.push(model2)
      }
    }
    return temp2;
  }

  function GetLedgerAccount(childList) {
    const result = childList.map(
      function selectFewerProps(show) {
        const { ledgerAccountName, ledgerAccountID, actualAmount } = show;
        return { ledgerAccountName, ledgerAccountID, actualAmount };
      }
    )

    return result;
  }

  function RenderRevenueSection(obj) {

    return (
      <Grid item md={7} xs={12}>
        <Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">{obj.parentName}</Typography>
        {
          obj.dataList !== undefined ?
            obj["dataList"].map((objNew) =>

              <Grid Grid container spacing={1}>
                <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left">{obj["dataList"].length > 1 ? objNew.childName : ""}</Typography>
                {
                  objNew.dataList !== undefined ?
                    objNew.dataList.map((object) =>
                      <Grid Grid container spacing={1}>
                        <Grid item md={9} xs={12} ><Typography style={{ marginLeft: "15rem" }} align="left">{object.ledgerAccountName}</Typography></Grid>
                        <Grid item md={3} xs={12} ><Typography align="right">{object.actualAmount.toFixed(2)}</Typography></Grid>
                      </Grid>
                    )

                    : null
                }
              </Grid>
            )
            : null
        }
      </Grid>
    )
  }

  function RenderCostOfRevenueSection(obj) {

    return (
      <Grid item md={7} xs={12}>
        <Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">{obj.parentName}</Typography>
        <br />
        {
          obj.dataList !== undefined ?
            obj["dataList"].map((objNew) =>

              <Grid Grid container spacing={1}>
                <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left">{obj["dataList"].length > 1 ? objNew.childName : ""}</Typography>
                {
                  objNew.dataList !== undefined ?
                    objNew.dataList.map((object) =>
                      <Grid Grid container spacing={1}>
                        <Grid item md={9} xs={12} ><Typography style={{ marginLeft: "15rem" }} align="left">{object.ledgerAccountName}</Typography></Grid>
                        <Grid item md={3} xs={12} ><Typography align="right">{object.actualAmount.toFixed(2)}</Typography></Grid>
                      </Grid>
                    )

                    : null
                }
              </Grid>
            )
            : null
        }
      </Grid>
    )
  }

  function RenderOtherIncomeSection(obj) {

    return (
      <Grid item md={7} xs={12}>
        <Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">{obj.parentName}</Typography>
        <br />
        {
          obj.dataList !== undefined ?
            obj["dataList"].map((objNew) =>

              <Grid Grid container spacing={1}>
                <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left">{obj["dataList"].length > 1 ? objNew.childName : ""}</Typography>
                {
                  objNew.dataList !== undefined ?
                    objNew.dataList.map((object) =>
                      <Grid Grid container spacing={1}>
                        <Grid item md={9} xs={12} ><Typography style={{ marginLeft: "15rem" }} align="left">{object.ledgerAccountName}</Typography></Grid>
                        <Grid item md={3} xs={12} ><Typography align="right">{object.actualAmount.toFixed(2)}</Typography></Grid>
                      </Grid>
                    )

                    : null
                }
              </Grid>
            )
            : null
        }
      </Grid>
    )
  }

  function RenderAdministrationExpensesSection(obj) {

    return (
      <Grid item md={7} xs={12}>
        <Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">{obj.parentName}</Typography>
        <br />
        {
          obj.dataList !== undefined ?
            obj["dataList"].map((objNew) =>

              <Grid Grid container spacing={1}>
                <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left">{obj["dataList"].length > 1 ? objNew.childName : ""}</Typography>
                {
                  objNew.dataList !== undefined ?
                    objNew.dataList.map((object) =>
                      <Grid Grid container spacing={1}>
                        <Grid item md={9} xs={12} ><Typography style={{ marginLeft: "15rem" }} align="left">{object.ledgerAccountName}</Typography></Grid>
                        <Grid item md={3} xs={12} ><Typography align="right">{object.actualAmount.toFixed(2)}</Typography></Grid>
                      </Grid>
                    )

                    : null
                }
              </Grid>
            )
            : null
        }
      </Grid>
    )
  }

  function RenderOtherExpensesSection(obj) {

    return (
      <Grid item md={7} xs={12}>
        <Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">{obj.parentName}</Typography>
        <br />
        {
          obj.dataList !== undefined ?
            obj["dataList"].map((objNew) =>

              <Grid Grid container spacing={1}>
                <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left">{obj["dataList"].length > 1 ? objNew.childName : ""}</Typography>
                {
                  objNew.dataList !== undefined ?
                    objNew.dataList.map((object) =>
                      <Grid Grid container spacing={1}>
                        <Grid item md={9} xs={12} ><Typography style={{ marginLeft: "15rem" }} align="left">{object.ledgerAccountName}</Typography></Grid>
                        <Grid item md={3} xs={12} ><Typography align="right">{object.actualAmount.toFixed(2)}</Typography></Grid>
                      </Grid>
                    )

                    : null
                }
              </Grid>
            )
            : null
        }
      </Grid>
    )
  }

  function RenderSellingAndMarketingExpensesSection(obj) {

    return (
      <Grid item md={7} xs={12}>
        <Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">{obj.parentName}</Typography>
        <br />
        {
          obj.dataList !== undefined ?
            obj["dataList"].map((objNew) =>

              <Grid Grid container spacing={1}>
                <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left">{obj["dataList"].length > 1 ? objNew.childName : ""}</Typography>
                {
                  objNew.dataList !== undefined ?
                    objNew.dataList.map((object) =>
                      <Grid Grid container spacing={1}>
                        <Grid item md={9} xs={12} ><Typography style={{ marginLeft: "15rem" }} align="left">{object.ledgerAccountName}</Typography></Grid>
                        <Grid item md={3} xs={12} ><Typography align="right">{object.actualAmount.toFixed(2)}</Typography></Grid>
                      </Grid>
                    )

                    : null
                }
              </Grid>
            )
            : null
        }
      </Grid>
    )
  }

  function RenderFinanceExpensesSection(obj) {

    return (
      <Grid item md={7} xs={12}>
        <Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">{obj.parentName}</Typography>
        <br />
        {
          obj.dataList !== undefined ?
            obj["dataList"].map((objNew) =>

              <Grid Grid container spacing={1}>
                <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left">{obj["dataList"].length > 1 ? objNew.childName : ""}</Typography>
                {
                  objNew.dataList !== undefined ?
                    objNew.dataList.map((object) =>
                      <Grid Grid container spacing={1}>
                        <Grid item md={9} xs={12} ><Typography style={{ marginLeft: "15rem" }} align="left">{object.ledgerAccountName}</Typography></Grid>
                        <Grid item md={3} xs={12} ><Typography align="right">{object.actualAmount.toFixed(2)}</Typography></Grid>
                      </Grid>
                    )

                    : null
                }
              </Grid>
            )
            : null
        }
      </Grid>
    )
  }

  function RenderIncomeTaxExpensesSection(obj) {
    return (
      <Grid item md={7} xs={12}>
        <Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">{obj.parentName}</Typography>
        <br />
        {
          obj.dataList !== undefined ?
            obj["dataList"].map((objNew) =>

              <Grid Grid container spacing={1}>
                <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left">{obj["dataList"].length > 1 ? objNew.childName : ""}</Typography>
                {
                  objNew.dataList !== undefined ?
                    objNew.dataList.map((object) =>
                      <Grid Grid container spacing={1}>
                        <Grid item md={9} xs={12} ><Typography style={{ marginLeft: "15rem" }} align="left">{object.ledgerAccountName}</Typography></Grid>
                        <Grid item md={3} xs={12} ><Typography align="right">{object.actualAmount.toFixed(2)}</Typography></Grid>
                      </Grid>
                    )

                    : null
                }
              </Grid>
            )
            : null
        }
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
              groupID: ProfitAndLossDetils.groupID,
              factoryID: ProfitAndLossDetils.factoryID
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
                              value={ProfitAndLossDetils.groupID}
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
                              value={ProfitAndLossDetils.factoryID}
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
                                size='small'
                                value={selectedDate}
                                onChange={(e) => {
                                  handleDateChange(e)
                                }}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                                autoOk
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                        </Grid>

                        <Box display="flex" flexDirection="row-reverse" p={2} >
                          <Button
                            color="primary"
                            type="submit"
                            onClick={() => trackPromise(GetProfitAndLossDetailsReport())}
                            variant="contained"
                            size='small'
                          >
                            Search
                          </Button>
                        </Box>
                        {
                          isFormVisible ?

                            <>
                              <div>
                                <Grid Grid container spacing={1}>
                                  <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left"></Typography>
                                  <Grid Grid container spacing={1}>
                                    <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left"></Typography></Grid>
                                    <Grid item md={1} xs={1} ><Typography align="right">08/02/2021</Typography></Grid>
                                    <Grid item md={1} xs={1} ><Typography align="right">08/02/2022</Typography></Grid>
                                    <Grid item md={1} xs={1} ><Typography align="right">(+ / -)</Typography></Grid>
                                    <Grid item md={1} xs={1} ><Typography align="right">%(+ / -)</Typography></Grid>
                                  </Grid>
                                  <Grid Grid container spacing={1}>
                                    <Grid item md={9} xs={12} ><Typography style={{ marginLeft: "15rem" }} align="left"></Typography></Grid>
                                    <Grid item md={3} xs={12} ><Typography align="right"></Typography></Grid>
                                  </Grid>
                                </Grid>

                                <Grid container spacing={1}>
                                  <Grid item md={12} xs={12}>
                                    <Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">Revenue</Typography>
                                    <Grid Grid container spacing={1}>
                                      <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left"></Typography>
                                      <Grid Grid container spacing={1}>
                                        <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">BOC Fixed Asset Ledger</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">20,000</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">32,000 </Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">(+) 12,000</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">(+) 23.09</Typography></Grid>
                                      </Grid>
                                      <Grid Grid container spacing={1}>
                                        <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">Ledger Income</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">31,500</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">75,987 </Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">(+) 44,487</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">(+) 25.65</Typography></Grid>
                                      </Grid>
                                    </Grid>
                                  </Grid>
                                </Grid>
                                <br />

                                <Grid item md={12} xs={12}>
                                  <Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">Cost of Revenue</Typography>
                                  <br />
                                  <Grid Grid container spacing={1}>
                                    <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left">Direct salary cost of software developers</Typography>

                                    <Grid Grid container spacing={1}>
                                      <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">BOC Fixed Asset Ledger</Typography></Grid>
                                      <Grid item md={1} xs={1} ><Typography align="right">15,987</Typography></Grid>
                                      <Grid item md={1} xs={1} ><Typography align="right">54,900</Typography></Grid>
                                      <Grid item md={1} xs={1} ><Typography align="right">(+) 38,913</Typography></Grid>
                                      <Grid item md={1} xs={1} ><Typography align="right">(+) 32.54</Typography></Grid>
                                    </Grid>
                                    <Grid Grid container spacing={1}>
                                      <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">BOC Fixed Asset Ledger2</Typography></Grid>
                                      <Grid item md={1} xs={1} ><Typography align="right">12,852</Typography></Grid>
                                      <Grid item md={1} xs={1} ><Typography align="right">44,860</Typography></Grid>
                                      <Grid item md={1} xs={1} ><Typography align="right">(+) 32,010</Typography></Grid>
                                      <Grid item md={1} xs={1} ><Typography align="right">(+) 58.25</Typography></Grid>
                                    </Grid>
                                  </Grid>
                                  <Grid Grid container spacing={1}>
                                    <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left">Direct Other cost</Typography>

                                    <Grid Grid container spacing={1}>
                                      <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">BOC Fixed Asset Ledger</Typography></Grid>
                                      <Grid item md={1} xs={1} ><Typography align="right">13,400</Typography></Grid>
                                      <Grid item md={1} xs={1} ><Typography align="right">15,500</Typography></Grid>
                                      <Grid item md={1} xs={1} ><Typography align="right">(+) 1,900</Typography></Grid>
                                      <Grid item md={1} xs={1} ><Typography align="right">(+) 23.65</Typography></Grid>
                                    </Grid>
                                    <Grid Grid container spacing={1}>
                                      <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">Ledger Income</Typography></Grid>
                                      <Grid item md={1} xs={1} ><Typography align="right">15,800</Typography></Grid>
                                      <Grid item md={1} xs={1} ><Typography align="right">32,250</Typography></Grid>
                                      <Grid item md={1} xs={1} ><Typography align="right">(+) 16,750</Typography></Grid>
                                      <Grid item md={1} xs={1} ><Typography align="right">(+) 58.32</Typography></Grid>
                                    </Grid>
                                    <Grid Grid container spacing={1}>
                                      <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">BOC Fixed Asset Ledger2</Typography></Grid>
                                      <Grid item md={1} xs={1} ><Typography align="right">56,000</Typography></Grid>
                                      <Grid item md={1} xs={1} ><Typography align="right">85,100</Typography></Grid>
                                      <Grid item md={1} xs={1} ><Typography align="right">(+) 29,100</Typography></Grid>
                                      <Grid item md={1} xs={1} ><Typography align="right">(+) 29.12</Typography></Grid>
                                    </Grid>
                                    <Grid Grid container spacing={1}>
                                      <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">Ledger Income2</Typography></Grid>
                                      <Grid item md={1} xs={1} ><Typography align="right">45,000</Typography></Grid>
                                      <Grid item md={1} xs={1} ><Typography align="right">75,000</Typography></Grid>
                                      <Grid item md={1} xs={1} ><Typography align="right">(+) 30,000</Typography></Grid>
                                      <Grid item md={1} xs={1} ><Typography align="right">(+) 30.00</Typography></Grid>
                                    </Grid>
                                  </Grid>
                                </Grid>
                                <br />

                                <Grid item md={12} xs={12}>
                                  <Grid Grid container spacing={1}>
                                    <Grid item md={6} xs={1} ><Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">Gross Profit</Typography></Grid>
                                    <Grid item md={1} xs={1} ><Typography style={{ backgroundColor: "#b3e5fc" }} align="right">210,539</Typography></Grid>
                                    <Grid item md={1} xs={1} ><Typography style={{ backgroundColor: "#b3e5fc" }} align="right">415,507 </Typography></Grid>
                                    <Grid item md={1} xs={1} ><Typography style={{ backgroundColor: "#b3e5fc" }} align="right">186,256</Typography></Grid>
                                    <Grid item md={1} xs={1} ><Typography style={{ backgroundColor: "#b3e5fc" }} align="right"></Typography></Grid>
                                  </Grid>
                                </Grid>

                                <Grid container spacing={1}>
                                  <Grid item md={12} xs={12}>
                                    <Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">Other Income</Typography>
                                    <Grid Grid container spacing={1}>
                                      <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left"></Typography>
                                      <Grid Grid container spacing={1}>
                                        <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">BOC Fixed Asset Ledger</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">17,000</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">58,000</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">(+) 41,100</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">(+) 52.00</Typography></Grid>
                                      </Grid>
                                      <Grid Grid container spacing={1}>
                                        <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">BOC Fixed Asset Ledger2</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">34,000</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">45,000</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">(-) 11,100</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">(-) 12.32</Typography></Grid>
                                      </Grid>

                                      <Grid Grid container spacing={1}>
                                        <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">BOC Fixed Asset Ledger3</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">52,000</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">35,000</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">(-) 17,000</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">(-) 19.00</Typography></Grid>
                                      </Grid>

                                      <Grid Grid container spacing={1}>
                                        <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">BOC Ledger</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">95,000</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">58,000</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">(-) 37,000</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">(-) 54.00</Typography></Grid>
                                      </Grid>
                                    </Grid>
                                  </Grid>
                                </Grid>
                                <br />

                                <Grid container spacing={1}>
                                  <Grid item md={12} xs={12}>
                                    <Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">Selling and Marketing Expenses</Typography>
                                    <br />
                                    <Grid Grid container spacing={1}>
                                      <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left"></Typography>
                                      <Grid Grid container spacing={1}>
                                        <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">BOC Fixed Asset Ledger</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">76,000</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">87,000</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">(+) 11,100</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">(+) 12.00</Typography></Grid>
                                      </Grid>
                                      <Grid Grid container spacing={1}>
                                        <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">Ledger Income</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">98,000</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">76,000</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">(-) 22,000</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">(+) 22.00</Typography></Grid>
                                      </Grid>
                                      <Grid Grid container spacing={1}>
                                        <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">BOC Fixed Asset Ledger2</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">79,000</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">87,000</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">(+) 8,000</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">(+) 8.00</Typography></Grid>
                                      </Grid>
                                    </Grid>
                                  </Grid>
                                </Grid>
                                <br />

                                <Grid container spacing={1}>
                                  <Grid item md={12} xs={12}>
                                    <Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">Administration Expenses</Typography>
                                    <br />
                                    <Grid Grid container spacing={1}>
                                      <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left"></Typography>
                                      <Grid Grid container spacing={1}>
                                        <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">BOC Fixed Asset Ledger</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">58,000</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">87,000</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">(+) 29,000</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">(+) 29.00</Typography></Grid>
                                      </Grid>
                                      <Grid Grid container spacing={1}>
                                        <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">Ledger Income</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">98,000</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">84,000</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">(-) 14,000</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">(-) 14.00</Typography></Grid>
                                      </Grid>
                                      <Grid Grid container spacing={1}>
                                        <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">BOC Fixed Asset Ledger2</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">87,000</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">89,000</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">31,100</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">(+) 31.10</Typography></Grid>
                                      </Grid>
                                      <Grid Grid container spacing={1}>
                                        <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">BOC Ledger</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">76,000</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">54,000</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">(+) 2000</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">(+) 20.00</Typography></Grid>
                                      </Grid>
                                    </Grid>
                                  </Grid>
                                </Grid>
                                <br />

                                <Grid container spacing={1}>
                                  <Grid item md={12} xs={12}>
                                    <Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">Other Expenses</Typography>
                                    <Grid Grid container spacing={1}>
                                      <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left"></Typography>
                                      <Grid Grid container spacing={1}>
                                        <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">BOC Fixed Asset Ledger</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">87,000</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">54,100</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">(-) 32,000</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">(-) 32.00</Typography></Grid>
                                      </Grid>
                                      <Grid Grid container spacing={1}>
                                        <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">Ledger Income</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">83,000</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">32,000</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">(+) 51,000</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">(+) 51.00</Typography></Grid>
                                      </Grid>
                                      <Grid Grid container spacing={1}>
                                        <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">BOC Fixed Asset Ledger2</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">25,000</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">57,000</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">(+) 32,000</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">(+) 32.25</Typography></Grid>
                                      </Grid>
                                    </Grid>
                                  </Grid>
                                </Grid>
                                <br />

                                <Grid item md={12} xs={12}>
                                  <Grid Grid container spacing={1}>
                                    <Grid item md={6} xs={1} ><Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">Loss from operating activities (E B T I)</Typography></Grid>
                                    <Grid item md={1} xs={1} ><Typography style={{ backgroundColor: "#b3e5fc" }} align="right">1,103,000</Typography></Grid>
                                    <Grid item md={1} xs={1} ><Typography style={{ backgroundColor: "#b3e5fc" }} align="right">970,100 </Typography></Grid>
                                    <Grid item md={1} xs={1} ><Typography style={{ backgroundColor: "#b3e5fc" }} align="right">109, 000</Typography></Grid>
                                    <Grid item md={1} xs={1} ><Typography style={{ backgroundColor: "#b3e5fc" }} align="right"></Typography></Grid>
                                  </Grid>
                                </Grid>
                                <br />

                                <Grid container spacing={1}>
                                  <Grid item md={12} xs={12}>
                                    <Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">Finance Expenses</Typography>
                                    <Grid Grid container spacing={1}>
                                      <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left"></Typography>
                                      <Grid Grid container spacing={1}>
                                        <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">BOC Fixed Asset Ledger</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">58,000</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">89,000</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">(+) 31,100</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">(+) 32.00</Typography></Grid>
                                      </Grid>
                                      <Grid Grid container spacing={1}>
                                        <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">Ledger Income</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">32,100</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">13,100</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">(-) 19,000</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">(-) 20.00</Typography></Grid>
                                      </Grid>
                                      <Grid Grid container spacing={1}>
                                        <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">Income Ledger 1</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">23,100</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">13,450</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">(-) 9650</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">(-) 9.65</Typography></Grid>
                                      </Grid>
                                      <Grid Grid container spacing={1}>
                                        <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">BOC Ledger</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">54,100</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">15,500</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">(-) 38,600</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">(-) 38.60</Typography></Grid>
                                      </Grid>
                                      <Grid Grid container spacing={1}>
                                        <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">Assets Ledger 1</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">12,100</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">45,780 </Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">(+) 33,680</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">(+) 33.68</Typography></Grid>
                                      </Grid>
                                    </Grid>
                                  </Grid>
                                </Grid>
                                <br />

                                <Grid container spacing={1}>
                                  <Grid item md={12} xs={12}>
                                    <Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">Income Tax Expenses</Typography>
                                    <Grid Grid container spacing={1}>
                                      <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left"></Typography>
                                      <Grid Grid container spacing={1}>
                                        <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">BOC Fixed Asset Ledger</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">58,000</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">95,100</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">(+) 37,100</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">(+) 38.00</Typography></Grid>
                                      </Grid>
                                      <Grid Grid container spacing={1}>
                                        <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">Ledger Income</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">98,000</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">32,540</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">(-) 65,550</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">(-) 66.00</Typography></Grid>
                                      </Grid>
                                      <Grid Grid container spacing={1}>
                                        <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">BOC Fixed Asset Ledger2</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">85,700</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">65,890</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">(-) 19,810</Typography></Grid>
                                        <Grid item md={1} xs={1} ><Typography align="right">(-) 20.12</Typography></Grid>
                                      </Grid>
                                    </Grid>
                                  </Grid>
                                </Grid>

                                <Grid item md={12} xs={12}>
                                  <Grid Grid container spacing={1}>
                                    <Grid item md={6} xs={1} ><Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">Net Profit for the period</Typography></Grid>
                                    <Grid item md={1} xs={1} ><Typography style={{ backgroundColor: "#b3e5fc" }} align="right">421,100</Typography></Grid>
                                    <Grid item md={1} xs={1} ><Typography style={{ backgroundColor: "#b3e5fc" }} align="right">370,360</Typography></Grid>
                                    <Grid item md={1} xs={1} ><Typography style={{ backgroundColor: "#b3e5fc" }} align="right">100,000</Typography></Grid>
                                    <Grid item md={1} xs={1} ><Typography style={{ backgroundColor: "#b3e5fc" }} align="right"></Typography></Grid>
                                  </Grid>
                                </Grid>
                                <br />

                              </div>

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
                                  size='small'

                                  >
                                    PDF
                                  </Button>}
                                  content={() => componentRef.current}
                                />
                                <div hidden={true}>
                                  <CreatePDF ref={componentRef}
                                    // ParentSectionDetails={ParentSectionDetails}
                                    // GrossProfit={GrossProfit}
                                    // LossFromOperatingActivitiesAmount={LossFromOperatingActivitiesAmount}
                                    // NewProfitForThePeriodAmount={NewProfitForThePeriodAmount}
                                  />
                                </div>
                              </Box>

                            </>
                            :
                            null

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
