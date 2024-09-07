import React, { useState, useEffect, Fragment, useRef } from 'react';
import { useAlert } from 'react-alert';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  Grid,
  TextField,
  makeStyles,
  Container,
  Button,
  CardContent,
  Divider,
  InputLabel,
  CardHeader,
  MenuItem
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import { Formik } from 'formik';
import * as Yup from 'yup';
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { useNavigate } from 'react-router-dom';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { LoadingComponent } from '../../../../utils/newLoader';
import ReactToPrint from 'react-to-print';
import CreatePDF from './CreatePDF';
import xlsx from 'json-as-xlsx';
import Typography from '@material-ui/core/Typography';
import SettingsIcon from '@material-ui/icons/Settings';
import IconButton from '@material-ui/core/IconButton';
import { KeyboardDatePicker } from '@material-ui/pickers';
import Tooltip from '@material-ui/core/Tooltip';
import lodash from 'lodash';
import CountUp from 'react-countup';

const useStyles = makeStyles(theme => ({
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
    backgroundColor: 'red'
  },
  colorRecord: {
    backgroundColor: 'green'
  },
  bold: {
    fontWeight: 600
  }
}));

const screenCode = 'PROFITANDLOSSREPORT';

export default function ProfitAndLossReport(props) {
  const navigate = useNavigate();
  const alert = useAlert();
  const componentRef = useRef();
  const classes = useStyles();
  const [selectedDate, handleDateChange] = useState(new Date());
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [title, setTitle] = useState('Profit & Loss Report');
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
    isProfitAndLossConfigurationEnabled: false
  });
  const [ProfitAndLossDetils, setProfitAndLossDetils] = useState({
    groupID: 0,
    factoryID: 0
  });
  const [profitAndLossData, setProfitAndLossData] = useState({
    groupName: '',
    factoryName: '',
    selectedYear: '',
    selectedMonth: '',
    selectedDateReport: ''
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
  const [
    LossFromOperatingActivitiesAmount,
    setLossFromOperatingActivitiesAmount
  ] = useState(0);
  const [
    NewProfitForThePeriodAmount,
    setNewProfitForThePeriodAmount
  ] = useState(0);
  const [IsReportVisible, setIsReportVisible] = useState(false);
  const [selectedSearchValues, setSelectedSearchValues] = useState({
    groupName: '',
    factoryName: '',
    startDate: ''
  });
  const csvHeaders = [
    { label: 'Section Name', value: 'parentName' },
    { label: 'Child Section Name', value: 'childName' },
    { label: 'Ledger Account Name', value: 'ledgerAccountName' },
    { label: 'Amount', value: 'actualAmount' }
  ];

  useEffect(() => {
    trackPromise(getPermission());
    trackPromise(getGroupsForDropdown());
  }, []);

  useEffect(() => {
    trackPromise(getFactoriesForDropDown());
  }, [ProfitAndLossDetils.groupID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(
      p => p.permissionCode == 'VIEWPROFITANDLOSSREPORT'
    );
    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(
      p => p.permissionCode == 'GROUPDROPDOWN'
    );
    var isFactoryFilterEnabled = permissions.find(
      p => p.permissionCode == 'FACTORYDROPDOWN'
    );
    var isProfitAndLossConfigurationEnabled = permissions.find(
      p => p.permissionCode == 'ENABLEPROFITANDLOSSCONFIGURATION'
    );

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
      isProfitAndLossConfigurationEnabled:
        isProfitAndLossConfigurationEnabled !== undefined
    });

    setProfitAndLossDetils({
      ...ProfitAndLossDetils,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    });
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getFactoriesForDropDown() {
    const factory = await services.getFactoryByGroupID(
      ProfitAndLossDetils.groupID
    );
    setFactories(factory);
  }

  function NavigateToConfigurationPage() {
    navigate(
      '/app/profitAndLoss/profitAndLossSetupConfiguration/' +
      btoa(ProfitAndLossDetils.groupID) +
      '/' +
      btoa(ProfitAndLossDetils.factoryID)
    );
  }

  function cardTitle(titleName) {
    return (
      <Grid container spacing={1}>
        <Grid item md={11} xs={12}>
          {titleName}
        </Grid>
        {ProfitAndLossDetils.groupID === '0' ||
          ProfitAndLossDetils.factoryID === '0' ? null : (
          <>
            {permissionList.isProfitAndLossConfigurationEnabled === true ? (
              <Grid item md={1} xs={12}>
                <Tooltip title="Profit & Loss Configurations">
                  <IconButton
                    style={{ marginLeft: '3rem' }}
                    onClick={() => NavigateToConfigurationPage()}
                  >
                    <SettingsIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
            ) : null}
          </>
        )}
      </Grid>
    );
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value;
    setProfitAndLossDetils({
      ...ProfitAndLossDetils,
      [e.target.name]: value
    });
  }

  function generateDropDownMenu(data) {
    let items = [];
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(
          <MenuItem key={key} value={key}>
            {value}
          </MenuItem>
        );
      }
    }
    return items;
  }

  async function GetProfitAndLossDetailsReport() {
    if (
      ProfitAndLossDetils.groupID === '0' ||
      ProfitAndLossDetils.factoryID === '0'
    ) {
      return;
    }

    let resultModel = {
      groupID: parseInt(ProfitAndLossDetils.groupID),
      factoryID: parseInt(ProfitAndLossDetils.factoryID),
      selectedDate: selectedDate
    };

    const response = await services.GetProfitAndLossReportDetails(resultModel);

    if (response !== null && response.statusCode === 'Success') {
      let result = await GroupLedgerAccountList(
        response.data.ledgerAccocuntList
      );
      setIsReportVisible(true);
      setParentSectionDetails(result);
    } else {
      setIsReportVisible(false);
      setParentSectionDetails([]);
      alert.error(response.message);
    }

    setProfitAndLossData({
      ...profitAndLossData,
      groupName: groups[ProfitAndLossDetils.groupID],
      factoryName: factories[ProfitAndLossDetils.factoryID],
      selectedYear: selectedDate.getFullYear(),
      selectedMonth: selectedDate
        .toISOString()
        .split('T')[0]
        .split('-')[1],
      selectedDateReport: selectedDate.getDate()
    });
  }

  async function GroupLedgerAccountList(ledgerDetails) {
    let data = ledgerDetails;

    let parentSectionList = lodash.sortedUniq(
      data.map(object => object.profitAndLossParentSectionType)
    );
    setParentList(parentSectionList);

    let subSectionList = lodash.sortedUniq(
      data.map(object => object.profitAndLossSectionType)
    );
    setChildList(subSectionList);

    let temp = [];

    for (const iterator of parentSectionList) {
      let parentList = data.filter(
        x => x.profitAndLossParentSectionType === iterator
      );

      let model = {
        parentName: parentList[0].profitAndLossParentSectionName,
        parentCode: parentList[0].profitAndLossParentSectionType,
        dataList: GetChildSegments(parentList, subSectionList),
        totalAmount: parentList.reduce(
          (totalCredit, item) => totalCredit + item.actualAmount,
          0
        )
      };
      temp.push(model);
    }

    let lemp2 = lodash.groupBy(temp, 'parentCode');

    let grossProfit =
      (lemp2.REVENUE !== undefined ? lemp2.REVENUE[0].totalAmount : 0) -
      (lemp2.COSTOFREVENUE !== undefined
        ? lemp2.COSTOFREVENUE[0].totalAmount
        : 0);
    let otherIncome =
      lemp2.OTHERINCOME !== undefined ? lemp2.OTHERINCOME[0].totalAmount : 0;
    let otherExpenses =
      (lemp2.ADMINISTRATIONEXPENSES !== undefined
        ? lemp2.ADMINISTRATIONEXPENSES[0].totalAmount
        : 0) +
      (lemp2.OTHEREXPENSES !== undefined
        ? lemp2.OTHEREXPENSES[0].totalAmount
        : 0) +
      (lemp2.SELLINGANDMARKETINGEXPENSES !== undefined
        ? lemp2.SELLINGANDMARKETINGEXPENSES[0].totalAmount
        : 0);
    let lossFromOperatingActivities = grossProfit + otherIncome - otherExpenses;
    let financeExpenses =
      lemp2.FINANCEEXPENSES !== undefined
        ? lemp2.FINANCEEXPENSES[0].totalAmount
        : 0;
    let incomeTaxExpenses =
      lemp2.INCOMETAXEXPENSES !== undefined
        ? lemp2.INCOMETAXEXPENSES[0].totalAmount
        : 0;
    let netProfit =
      lossFromOperatingActivities - (financeExpenses + incomeTaxExpenses);

    setGrossProfit(grossProfit);
    setLossFromOperatingActivitiesAmount(lossFromOperatingActivities);
    setNewProfitForThePeriodAmount(netProfit);

    return lemp2;
  }

  function GetChildSegments(parentList, subSectionList) {
    let temp2 = [];

    for (const obj2 of subSectionList) {
      let childList = parentList.filter(
        x => x.profitAndLossSectionType === obj2
      );
      if (childList.length !== 0) {
        let model2 = {
          childCode: childList[0].profitAndLossSectionType,
          childName: childList[0].profitAndLossSectionName,
          dataList: GetLedgerAccount(childList)
        };
        temp2.push(model2);
      }
    }
    return temp2;
  }

  function GetLedgerAccount(childList) {
    const result = childList.map(function selectFewerProps(show) {
      const { ledgerAccountName, ledgerAccountID, actualAmount } = show;
      return { ledgerAccountName, ledgerAccountID, actualAmount };
    });

    return result;
  }

  async function CreateDataForExcel() {
    const alldata =
      ParentSectionDetails.REVENUE === null
        ? []
        : ParentSectionDetails.REVENUE.concat(
          ParentSectionDetails.COSTOFREVENUE === null
            ? []
            : ParentSectionDetails.COSTOFREVENUE,
          ParentSectionDetails.OTHERINCOME === null
            ? []
            : ParentSectionDetails.OTHERINCOME,
          ParentSectionDetails.SELLINGANDMARKETINGEXPENSES === null
            ? []
            : ParentSectionDetails.SELLINGANDMARKETINGEXPENSES,
          ParentSectionDetails.ADMINISTRATIONEXPENSES === null
            ? []
            : ParentSectionDetails.ADMINISTRATIONEXPENSES,
          ParentSectionDetails.OTHEREXPENSES === null
            ? []
            : ParentSectionDetails.OTHEREXPENSES,
          ParentSectionDetails.FINANCEEXPENSES === null
            ? []
            : ParentSectionDetails.FINANCEEXPENSES,
          ParentSectionDetails.INCOMETAXEXPENSES === null
            ? []
            : ParentSectionDetails.INCOMETAXEXPENSES
        );
    var res = [];
    if (alldata != null) {
      const ress = alldata.filter(x => x != undefined)
      ress.forEach(x => {
        if (x.parentName != undefined) {
          var vr = {
            parentName: x.parentName,
            childName: '',
            ledgerAccountName: '',
            actualAmount: ''
          };
          res.push(vr);
          x.dataList.forEach(y => {
            var vr = {
              parentName: '',
              childName: y.dataList.length > 1 ? y.childName : '',
              ledgerAccountName: '',
              actualAmount: ''
            };
            res.push(vr);
            y.dataList.forEach(z => {
              var vr = {
                parentName: '',
                childName: '',
                ledgerAccountName: z.ledgerAccountName,
                actualAmount: z.actualAmount.toFixed(2)
              };
              res.push(vr);
            });
          });
          res.push({});
        }
      });
    }
    var vr = {
      parentName: 'Gross Profit',
      childName: '',
      ledgerAccountName: '',
      actualAmount: GrossProfit.toFixed(2)
    };
    res.push(vr);
    res.push({});
    var vr = {
      parentName: 'Loss from operating activities (E B T I)',
      childName: '',
      ledgerAccountName: '',
      actualAmount: LossFromOperatingActivitiesAmount.toFixed(2)
    };
    res.push(vr);
    res.push({});
    var vr = {
      parentName: 'Net Profit for the period',
      childName: '',
      ledgerAccountName: '',
      actualAmount: NewProfitForThePeriodAmount.toFixed(2)
    };
    res.push(vr);
    return res;
  }

  async function createFile() {
    var file = await CreateDataForExcel();
    var settings = {
      sheetName: 'Profit And Loss Report',
      fileName: 'ProfitAndLossReport',
      writeOptions: {}
    };
    let dataA = [
      {
        sheet: 'Profit And Loss Report',
        columns: csvHeaders,
        content: file
      }
    ];
    xlsx(dataA, settings);
  }

  function RenderRevenueSection(obj) {
    return (
      <Grid item md={9} xs={12}>
        <Typography variant="h5" style={{ marginLeft: '5rem' }} align="left">
          {obj.parentName}
        </Typography>
        {obj.dataList !== undefined
          ? obj['dataList'].map(objNew => (
            <Grid Grid container spacing={1}>
              <Typography
                variant="h5"
                style={{ marginLeft: '10rem' }}
                align="left"
              >
                {obj['dataList'].length > 1 ? objNew.childName : ''}
              </Typography>
              {objNew.dataList !== undefined
                ? objNew.dataList.map(object => (
                  <Grid Grid container spacing={1}>
                    <Grid item md={9} xs={12}>
                      <Typography
                        style={{ marginLeft: '15rem' }}
                        align="left"
                      >
                        {object.ledgerAccountName}
                      </Typography>
                    </Grid>
                    <Grid item md={3} xs={12}>
                      <Typography align="right">
                        <CountUp
                          end={object.actualAmount.toFixed(2)}
                          separator=","
                          decimals={2}
                          decimal="."
                          duration={0.1}
                        />
                      </Typography>
                    </Grid>
                  </Grid>
                ))
                : null}
            </Grid>
          ))
          : null}
      </Grid>
    );
  }

  function RenderCostOfRevenueSection(obj) {
    return (
      <Grid item md={9} xs={12}>
        <Typography variant="h5" style={{ marginLeft: '5rem' }} align="left">
          {obj.parentName}
        </Typography>
        <br />
        {obj.dataList !== undefined
          ? obj['dataList'].map(objNew => (
            <Grid Grid container spacing={1}>
              <Typography
                variant="h5"
                style={{ marginLeft: '10rem' }}
                align="left"
              >
                {obj['dataList'].length > 1 ? objNew.childName : ''}
              </Typography>
              {objNew.dataList !== undefined
                ? objNew.dataList.map(object => (
                  <Grid Grid container spacing={1}>
                    <Grid item md={9} xs={12}>
                      <Typography
                        style={{ marginLeft: '15rem' }}
                        align="left"
                      >
                        {object.ledgerAccountName}
                      </Typography>
                    </Grid>
                    <Grid item md={3} xs={12}>
                      <Typography align="right">
                        <CountUp
                          end={object.actualAmount.toFixed(2)}
                          separator=","
                          decimals={2}
                          decimal="."
                          duration={0.1}
                        />
                      </Typography>
                    </Grid>
                  </Grid>
                ))
                : null}
            </Grid>
          ))
          : null}
      </Grid>
    );
  }

  function RenderOtherIncomeSection(obj) {
    return (
      <Grid item md={9} xs={12}>
        <Typography variant="h5" style={{ marginLeft: '5rem' }} align="left">
          {obj.parentName}
        </Typography>
        <br />
        {obj.dataList !== undefined
          ? obj['dataList'].map(objNew => (
            <Grid Grid container spacing={1}>
              <Typography
                variant="h5"
                style={{ marginLeft: '10rem' }}
                align="left"
              >
                {obj['dataList'].length > 1 ? objNew.childName : ''}
              </Typography>
              {objNew.dataList !== undefined
                ? objNew.dataList.map(object => (
                  <Grid Grid container spacing={1}>
                    <Grid item md={9} xs={12}>
                      <Typography
                        style={{ marginLeft: '15rem' }}
                        align="left"
                      >
                        {object.ledgerAccountName}
                      </Typography>
                    </Grid>
                    <Grid item md={3} xs={12}>
                      <Typography align="right">
                        <CountUp
                          end={object.actualAmount.toFixed(2)}
                          separator=","
                          decimals={2}
                          decimal="."
                          duration={0.1}
                        />
                      </Typography>
                    </Grid>
                  </Grid>
                ))
                : null}
            </Grid>
          ))
          : null}
      </Grid>
    );
  }

  function RenderAdministrationExpensesSection(obj) {
    return (
      <Grid item md={9} xs={12}>
        <Typography variant="h5" style={{ marginLeft: '5rem' }} align="left">
          {obj.parentName}
        </Typography>
        <br />
        {obj.dataList !== undefined
          ? obj['dataList'].map(objNew => (
            <Grid Grid container spacing={1}>
              <Typography
                variant="h5"
                style={{ marginLeft: '10rem' }}
                align="left"
              >
                {obj['dataList'].length > 1 ? objNew.childName : ''}
              </Typography>
              {objNew.dataList !== undefined
                ? objNew.dataList.map(object => (
                  <Grid Grid container spacing={1}>
                    <Grid item md={9} xs={12}>
                      <Typography
                        style={{ marginLeft: '15rem' }}
                        align="left"
                      >
                        {object.ledgerAccountName}
                      </Typography>
                    </Grid>
                    <Grid item md={3} xs={12}>
                      <Typography align="right">
                        <CountUp
                          end={object.actualAmount.toFixed(2)}
                          separator=","
                          decimals={2}
                          decimal="."
                          duration={0.1}
                        />
                      </Typography>
                    </Grid>
                  </Grid>
                ))
                : null}
            </Grid>
          ))
          : null}
      </Grid>
    );
  }

  function RenderOtherExpensesSection(obj) {
    return (
      <Grid item md={9} xs={12}>
        <Typography variant="h5" style={{ marginLeft: '5rem' }} align="left">
          {obj.parentName}
        </Typography>
        <br />
        {obj.dataList !== undefined
          ? obj['dataList'].map(objNew => (
            <Grid Grid container spacing={1}>
              <Typography
                variant="h5"
                style={{ marginLeft: '10rem' }}
                align="left"
              >
                {obj['dataList'].length > 1 ? objNew.childName : ''}
              </Typography>
              {objNew.dataList !== undefined
                ? objNew.dataList.map(object => (
                  <Grid Grid container spacing={1}>
                    <Grid item md={9} xs={12}>
                      <Typography
                        style={{ marginLeft: '15rem' }}
                        align="left"
                      >
                        {object.ledgerAccountName}
                      </Typography>
                    </Grid>
                    <Grid item md={3} xs={12}>
                      <Typography align="right">
                        <CountUp
                          end={object.actualAmount.toFixed(2)}
                          separator=","
                          decimals={2}
                          decimal="."
                          duration={0.1}
                        />
                      </Typography>
                    </Grid>
                  </Grid>
                ))
                : null}
            </Grid>
          ))
          : null}
      </Grid>
    );
  }

  function RenderSellingAndMarketingExpensesSection(obj) {
    return (
      <Grid item md={9} xs={12}>
        <Typography variant="h5" style={{ marginLeft: '5rem' }} align="left">
          {obj.parentName}
        </Typography>
        <br />
        {obj.dataList !== undefined
          ? obj['dataList'].map(objNew => (
            <Grid Grid container spacing={1}>
              <Typography
                variant="h5"
                style={{ marginLeft: '10rem' }}
                align="left"
              >
                {obj['dataList'].length > 1 ? objNew.childName : ''}
              </Typography>
              {objNew.dataList !== undefined
                ? objNew.dataList.map(object => (
                  <Grid Grid container spacing={1}>
                    <Grid item md={9} xs={12}>
                      <Typography
                        style={{ marginLeft: '15rem' }}
                        align="left"
                      >
                        {object.ledgerAccountName}
                      </Typography>
                    </Grid>
                    <Grid item md={3} xs={12}>
                      <Typography align="right">
                        <CountUp
                          end={object.actualAmount.toFixed(2)}
                          separator=","
                          decimals={2}
                          decimal="."
                          duration={0.1}
                        />
                      </Typography>
                    </Grid>
                  </Grid>
                ))
                : null}
            </Grid>
          ))
          : null}
      </Grid>
    );
  }

  function RenderFinanceExpensesSection(obj) {
    return (
      <Grid item md={9} xs={12}>
        <Typography variant="h5" style={{ marginLeft: '5rem' }} align="left">
          {obj.parentName}
        </Typography>
        <br />
        {obj.dataList !== undefined
          ? obj['dataList'].map(objNew => (
            <Grid Grid container spacing={1}>
              <Typography
                variant="h5"
                style={{ marginLeft: '10rem' }}
                align="left"
              >
                {obj['dataList'].length > 1 ? objNew.childName : ''}
              </Typography>
              {objNew.dataList !== undefined
                ? objNew.dataList.map(object => (
                  <Grid Grid container spacing={1}>
                    <Grid item md={9} xs={12}>
                      <Typography
                        style={{ marginLeft: '15rem' }}
                        align="left"
                      >
                        {object.ledgerAccountName}
                      </Typography>
                    </Grid>
                    <Grid item md={3} xs={12}>
                      <Typography align="right">
                        <CountUp
                          end={object.actualAmount.toFixed(2)}
                          separator=","
                          decimals={2}
                          decimal="."
                          duration={0.1}
                        />
                      </Typography>
                    </Grid>
                  </Grid>
                ))
                : null}
            </Grid>
          ))
          : null}
      </Grid>
    );
  }

  function RenderIncomeTaxExpensesSection(obj) {
    return (
      <Grid item md={9} xs={12}>
        <Typography variant="h5" style={{ marginLeft: '5rem' }} align="left">
          {obj.parentName}
        </Typography>
        <br />
        {obj.dataList !== undefined
          ? obj['dataList'].map(objNew => (
            <Grid Grid container spacing={1}>
              <Typography
                variant="h5"
                style={{ marginLeft: '10rem' }}
                align="left"
              >
                {obj['dataList'].length > 1 ? objNew.childName : ''}
              </Typography>
              {objNew.dataList !== undefined
                ? objNew.dataList.map(object => (
                  <Grid Grid container spacing={1}>
                    <Grid item md={9} xs={12}>
                      <Typography
                        style={{ marginLeft: '15rem' }}
                        align="left"
                      >
                        {object.ledgerAccountName}
                      </Typography>
                    </Grid>
                    <Grid item md={3} xs={12}>
                      <Typography align="right">
                        <CountUp
                          end={object.actualAmount.toFixed(2)}
                          separator=","
                          decimals={2}
                          decimal="."
                          duration={0.1}
                        />
                      </Typography>
                    </Grid>
                  </Grid>
                ))
                : null}
            </Grid>
          ))
          : null}
      </Grid>
    );
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
            validationSchema={Yup.object().shape({
              groupID: Yup.number()
                .required('Group is required')
                .min('1', 'Group is required'),
              factoryID: Yup.number()
                .required('Estate is required')
                .min('1', 'Estate is required')
            })}
            enableReinitialize
          >
            {({ errors, handleBlur, handleSubmit, touched }) => (
              <form onSubmit={handleSubmit}>
                <Box mt={0}>
                  <Card>
                    <CardHeader title={cardTitle(title)} />
                    <PerfectScrollbar>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="groupID">
                              Group *
                            </InputLabel>
                            <TextField
                              select
                              error={Boolean(touched.groupID && errors.groupID)}
                              fullWidth
                              helperText={touched.groupID && errors.groupID}
                              size="small"
                              name="groupID"
                              onBlur={handleBlur}
                              onChange={e => handleChange(e)}
                              value={ProfitAndLossDetils.groupID}
                              variant="outlined"
                              id="groupID"
                              disabled={!permissionList.isGroupFilterEnabled}
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(groups)}
                            </TextField>
                          </Grid>

                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="factoryID">
                              Estate *
                            </InputLabel>
                            <TextField
                              select
                              error={Boolean(
                                touched.factoryID && errors.factoryID
                              )}
                              fullWidth
                              helperText={touched.factoryID && errors.factoryID}
                              size="small"
                              name="factoryID"
                              onBlur={handleBlur}
                              onChange={e => handleChange(e)}
                              value={ProfitAndLossDetils.factoryID}
                              variant="outlined"
                              id="factoryID"
                              disabled={!permissionList.isFactoryFilterEnabled}
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
                                size="small"
                                variant="inline"
                                format="dd/MM/yyyy"
                                margin="dense"
                                id="date-picker-inline"
                                value={selectedDate}
                                onChange={e => {
                                  handleDateChange(e);
                                }}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date'
                                }}
                                autoOk
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                        </Grid>

                        <Box display="flex" flexDirection="row-reverse" p={2}>
                          <Button
                            color="primary"
                            type="submit"
                            onClick={() =>
                              trackPromise(GetProfitAndLossDetailsReport())
                            }
                            variant="contained"
                            size="small"
                          >
                            Search
                          </Button>
                        </Box>
                        {IsReportVisible ? (
                          <>
                            <div>
                              <Grid>
                                <h3 style={{ textAlign: 'center' }}>
                                  <span>
                                    {' '}
                                    {'Profit and Loss of ' +
                                      profitAndLossData.factoryName}{' '}
                                  </span>
                                </h3>
                                <h5 style={{ textAlign: 'center' }}>
                                  <span>
                                    {' '}
                                    {' To ' +
                                      selectedDate
                                        .toISOString()
                                        .split('T')[0]}{' '}
                                  </span>
                                </h5>
                                <br />
                                <br />
                              </Grid>

                              <Grid container spacing={1} justify="center">
                                {ParentSectionDetails.REVENUE !== undefined
                                  ? ParentSectionDetails.REVENUE.map(obj =>
                                    RenderRevenueSection(obj)
                                  )
                                  : null}
                              </Grid>

                              <Grid container spacing={1} justify="center">
                                {ParentSectionDetails.COSTOFREVENUE !==
                                  undefined
                                  ? ParentSectionDetails.COSTOFREVENUE.map(
                                    obj => RenderCostOfRevenueSection(obj)
                                  )
                                  : null}
                              </Grid>
                              <br />
                              <Grid container spacing={1} justify="center">
                                <Grid item md={9} xs={12}>
                                  <Typography
                                    variant="h5"
                                    style={{ marginLeft: '5rem' }}
                                    align="left"
                                  >
                                    Gross Profit
                                  </Typography>
                                  <Grid Grid container spacing={1}>
                                    <Typography
                                      variant="h5"
                                      style={{ marginLeft: '10rem' }}
                                      align="left"
                                    >
                                      {''}
                                    </Typography>
                                    <Grid Grid container spacing={1}>
                                      <Grid item md={9} xs={12}>
                                        <Typography
                                          style={{ marginLeft: '15rem' }}
                                          align="left"
                                        >
                                          {''}
                                        </Typography>
                                      </Grid>
                                      <Grid item md={3} xs={12}>
                                        <Typography
                                          style={{
                                            marginTop: '-1.2rem',
                                            backgroundColor: '#b3e5fc'
                                          }}
                                          align="right"
                                        >
                                          <CountUp
                                            end={GrossProfit.toFixed(2)}
                                            separator=","
                                            decimals={2}
                                            decimal="."
                                            duration={0.1}
                                          />
                                        </Typography>
                                      </Grid>
                                    </Grid>
                                  </Grid>
                                </Grid>
                              </Grid>
                              <br />
                              <Grid container spacing={1} justify="center">
                                {ParentSectionDetails.OTHERINCOME !== undefined
                                  ? ParentSectionDetails.OTHERINCOME.map(obj =>
                                    RenderOtherIncomeSection(obj)
                                  )
                                  : null}
                              </Grid>

                              <Grid container spacing={1} justify="center">
                                {ParentSectionDetails.SELLINGANDMARKETINGEXPENSES !==
                                  undefined
                                  ? ParentSectionDetails.SELLINGANDMARKETINGEXPENSES.map(
                                    obj =>
                                      RenderSellingAndMarketingExpensesSection(
                                        obj
                                      )
                                  )
                                  : null}
                              </Grid>

                              <Grid container spacing={1} justify="center">
                                {ParentSectionDetails.ADMINISTRATIONEXPENSES !==
                                  undefined
                                  ? ParentSectionDetails.ADMINISTRATIONEXPENSES.map(
                                    obj =>
                                      RenderAdministrationExpensesSection(obj)
                                  )
                                  : null}
                              </Grid>

                              <Grid container spacing={1} justify="center">
                                {ParentSectionDetails.OTHEREXPENSES !==
                                  undefined
                                  ? ParentSectionDetails.OTHEREXPENSES.map(
                                    obj => RenderOtherExpensesSection(obj)
                                  )
                                  : null}
                              </Grid>

                              <br />
                              <Grid container spacing={1} justify="center">
                                <Grid item md={9} xs={12}>
                                  <Typography
                                    variant="h5"
                                    style={{ marginLeft: '5rem' }}
                                    align="left"
                                  >
                                    Earnings Before Taxes and Interest.(E B T I)
                                  </Typography>
                                  <Grid Grid container spacing={1}>
                                    <Typography
                                      variant="h5"
                                      style={{ marginLeft: '10rem' }}
                                      align="left"
                                    >
                                      {''}
                                    </Typography>
                                    <Grid Grid container spacing={1}>
                                      <Grid item md={9} xs={12}>
                                        <Typography
                                          style={{ marginLeft: '15rem' }}
                                          align="left"
                                        >
                                          {''}
                                        </Typography>
                                      </Grid>
                                      <Grid item md={3} xs={12}>
                                        <Typography
                                          style={{
                                            marginTop: '-1.2rem',
                                            backgroundColor: '#b3e5fc'
                                          }}
                                          align="right"
                                        >
                                          <CountUp
                                            end={LossFromOperatingActivitiesAmount.toFixed(
                                              2
                                            )}
                                            separator=","
                                            decimals={2}
                                            decimal="."
                                            duration={0.1}
                                          />
                                        </Typography>
                                      </Grid>
                                    </Grid>
                                  </Grid>
                                </Grid>
                              </Grid>
                              <br />

                              <Grid container spacing={1} justify="center">
                                {ParentSectionDetails.FINANCEEXPENSES !==
                                  undefined
                                  ? ParentSectionDetails.FINANCEEXPENSES.map(
                                    obj => RenderFinanceExpensesSection(obj)
                                  )
                                  : null}
                              </Grid>

                              <Grid container spacing={1} justify="center">
                                {ParentSectionDetails.INCOMETAXEXPENSES !==
                                  undefined
                                  ? ParentSectionDetails.INCOMETAXEXPENSES.map(
                                    obj => RenderIncomeTaxExpensesSection(obj)
                                  )
                                  : null}
                              </Grid>
                              <br />
                              <Grid container spacing={1} justify="center">
                                <Grid item md={9} xs={12}>
                                  <Typography
                                    variant="h5"
                                    style={{ marginLeft: '5rem' }}
                                    align="left"
                                  >
                                    Net Profit for the period
                                  </Typography>
                                  <Grid Grid container spacing={1}>
                                    <Typography
                                      variant="h5"
                                      style={{ marginLeft: '10rem' }}
                                      align="left"
                                    >
                                      {''}
                                    </Typography>
                                    <Grid Grid container spacing={1}>
                                      <Grid item md={9} xs={12}>
                                        <Typography
                                          style={{ marginLeft: '15rem' }}
                                          align="left"
                                        >
                                          {''}
                                        </Typography>
                                      </Grid>
                                      <Grid item md={3} xs={12}>
                                        <Typography
                                          style={{
                                            marginTop: '-1.2rem',
                                            backgroundColor: '#b3e5fc'
                                          }}
                                          align="right"
                                        >
                                          <CountUp
                                            end={NewProfitForThePeriodAmount.toFixed(
                                              2.0
                                            )}
                                            separator=","
                                            decimals={2}
                                            decimal="."
                                            duration={0.1}
                                          />
                                        </Typography>
                                      </Grid>
                                    </Grid>
                                  </Grid>
                                </Grid>
                              </Grid>
                            </div>
                            <Box display="flex" justifyContent="flex-end" p={2}>
                              <Button
                                color="primary"
                                id="btnRecord"
                                type="submit"
                                variant="contained"
                                style={{ marginRight: '1rem' }}
                                className={classes.colorRecord}
                                onClick={createFile}
                                size="small"
                              >
                                EXCEL
                              </Button>
                              <ReactToPrint
                                documentTitle={'Profit & Loss Report'}
                                trigger={() => (
                                  <Button
                                    color="primary"
                                    id="btnRecord"
                                    type="submit"
                                    variant="contained"
                                    style={{ marginRight: '1rem' }}
                                    className={classes.colorCancel}
                                    size="small"
                                  >
                                    PDF
                                  </Button>
                                )}
                                content={() => componentRef.current}
                              />
                              <div hidden={true}>
                                <CreatePDF
                                  ref={componentRef}
                                  profitAndLossData={profitAndLossData}
                                  ParentSectionDetails={ParentSectionDetails}
                                  GrossProfit={GrossProfit}
                                  LossFromOperatingActivitiesAmount={
                                    LossFromOperatingActivitiesAmount
                                  }
                                  NewProfitForThePeriodAmount={
                                    NewProfitForThePeriodAmount
                                  }
                                />
                              </div>
                            </Box>
                          </>
                        ) : null}
                      </CardContent>
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
