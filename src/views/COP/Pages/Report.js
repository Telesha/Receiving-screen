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
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import { Formik } from 'formik';
import * as Yup from 'yup';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { useNavigate } from 'react-router-dom';
import { LoadingComponent } from '../../../utils/newLoader';
import ReactToPrint from 'react-to-print';
import CreatePDF from './CreatePDF';
import Typography from '@material-ui/core/Typography';
import SettingsIcon from '@material-ui/icons/Settings';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import _ from 'lodash';
import Paper from '@material-ui/core/Paper';
import SubdirectoryArrowRightIcon from '@material-ui/icons/SubdirectoryArrowRight';
import ArrowDropDownCircleIcon from '@material-ui/icons/ArrowDropDownCircle';
import CheckBox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import moment from 'moment';


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

const screenCode = 'COPREPORT';

export default function COPReport(props) {
  const navigate = useNavigate();
  const alert = useAlert();
  const componentRef = useRef();
  const classes = useStyles();
  const [groups, setGroups] = useState();
  const [HideUserFields, setHideUserFields] = useState(false);
  const [factories, setFactories] = useState();
  const [title, setTitle] = useState('COP Report');
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
    isCOPConfigurationEnabled: true
  });
  const [COPReportDetails, setCOPReportDetails] = useState({
    groupID: 0,
    factoryID: 0,
    startDate: '',
    endDate: '',
    madeTeaToFrom: '',
    madeTeaThisMonth: '',
    madeTeaPreviousMonth: '',
    madeTeaFinancialYearToMonth: '',
    isCheckedThisMonth: false,
    isCheckPreviousMonth: false,
    isCheckedFinacialYearToDate: false
  });
  const [selectedSearchValues, setSelectedSearchValues] = useState({
    groupName: "",
    factoryName: "",
    startDate: "",
    endDate: ""
  });

  const [AccordianTitle, setAccordianTitle] = useState(
    'Please Expand to Enter Made Tea Quantity'
  );

  const [reportData, setReportData] = useState([]);
  const [thisMonthReportData, setThisMonthReportData] = useState([]);
  const [previousMonthReportData, setPreviousMonthReportData] = useState([]);
  const [fromToReportData, setFromToReportData] = useState([]);
  const [
    financialYearToMonthReportData,
    setFinancialYearToMonthReportData
  ] = useState([]);

  const [IsReportVisible, setIsReportVisible] = useState(false);

  useEffect(() => {
    trackPromise(getPermission());
    trackPromise(getGroupsForDropdown());
  }, []);

  useEffect(() => {
    trackPromise(getFactoriesForDropDown());
  }, [COPReportDetails.groupID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(
      p => p.permissionCode == 'VIEWCOPREPORT'
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
    var isCOPConfigurationEnabled = permissions.find(
      p => p.permissionCode == 'VIEWCOPREPORTCONFIGURATION'
    );

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
      isCOPConfigurationEnabled: isCOPConfigurationEnabled !== undefined
    });

    setCOPReportDetails({
      ...COPReportDetails,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    });
  }

  function toggleUserFields(expanded) {
    setHideUserFields(!HideUserFields);
    if (expanded === false) {
      setAccordianTitle('Please Expand to Enter Made Tea Quantity');
    } else {
      setAccordianTitle('Made Tea Quantity');
    }
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getFactoriesForDropDown() {
    const factory = await services.getFactoryByGroupID(
      COPReportDetails.groupID
    );
    setFactories(factory);
  }

  function NavigateToConfigurationPage() {
    navigate(
      '/app/COPReport/configuration/' +
      btoa(COPReportDetails.groupID) +
      '/' +
      btoa(COPReportDetails.factoryID)
    );
  }

  function cardTitle(titleName) {
    return (
      <Grid container spacing={1}>
        <Grid item md={11} xs={12}>
          {titleName}
        </Grid>
        {COPReportDetails.groupID === '0' ||
          COPReportDetails.factoryID === '0' ? null : (
          <>
            {permissionList.isCOPConfigurationEnabled === true ? (
              <Grid item md={1} xs={12}>
                <Tooltip title="COP Configurations">
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
    setCOPReportDetails({
      ...COPReportDetails,
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

  function handleChangeCheckBox1(e) {
    const target = e.target;
    const value1 =
      target.name === 'isCheckedThisMonth' ? target.checked : target.value;

    setCOPReportDetails({
      ...COPReportDetails,
      [e.target.name]: value1
    });
  }
  function handleChangeCheckBox2(e) {
    const target = e.target;

    const value2 =
      target.name === 'isCheckPreviousMonth' ? target.checked : target.value;

    setCOPReportDetails({
      ...COPReportDetails,

      [e.target.name]: value2
    });
  }
  function handleChangeCheckBox3(e) {
    const target = e.target;

    const value3 =
      target.name === 'isCheckedFinacialYearToDate'
        ? target.checked
        : target.value;
    setCOPReportDetails({
      ...COPReportDetails,

      [e.target.name]: value3
    });
  }

  async function GetCOPReportDetails() {
    let resultModel = {
      groupID: parseInt(COPReportDetails.groupID),
      factoryID: parseInt(COPReportDetails.factoryID),
      startDate: COPReportDetails.startDate,
      endDate: COPReportDetails.endDate,
      isThisMonthChecked: COPReportDetails.isCheckedThisMonth,
      isPreviousMonthChecked: COPReportDetails.isCheckPreviousMonth,
      isFinancialYearToMonthChecked:
        COPReportDetails.isCheckedFinacialYearToDate
    };


    let model = {
      groupID: parseInt(COPReportDetails.groupID),
      factoryID: parseInt(COPReportDetails.factoryID),
      startDate: moment(COPReportDetails.startDate.toString())
        .format()
        .split('T')[0],
      endDate: moment(COPReportDetails.endDate.toString())
        .format()
        .split('T')[0]
    };

    getSelectedDropdownValuesForReport(model)

    const response = await services.GetCOPReport(resultModel);

    if (response !== null && response.statusCode === 'Success') {
      let result = response.data;

      setThisMonthReportData(result.copReportToFrom);
      setPreviousMonthReportData(result.copReportPreviousMonth);
      setFinancialYearToMonthReportData(result.copReportFinancialYearToMonth);
      setFromToReportData(result.copReportToFrom);

      var merge = _.unionBy(
        result.copReportToFrom,
        result.copReportToFrom,
        'copParentSectionID'
      );

      setReportData(result);
      setIsReportVisible(true);
    } else {
      setIsReportVisible(false);

      alert.error(response.message);
    }
  }

  function getSelectedDropdownValuesForReport(searchForm) {
    var startDate = moment(searchForm.startDate.toString())
      .format()
      .split('T')[0];
    var endDate = moment(searchForm.endDate.toString())
      .format()
      .split('T')[0];
    setSelectedSearchValues({
      ...selectedSearchValues,
      factoryName: factories[searchForm.factoryID],
      groupName: groups[searchForm.groupID],
      startDate: [startDate],
      endDate: [endDate]
    });
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: COPReportDetails.groupID,
              factoryID: COPReportDetails.factoryID,
              startDate: COPReportDetails.startDate,
              endDate: COPReportDetails.endDate,
              madeTeaToFrom: COPReportDetails.madeTeaToFrom,
              madeTeaThisMonth: COPReportDetails.madeTeaThisMonth,
              madeTeaPreviousMonth: COPReportDetails.madeTeaPreviousMonth,
              madeTeaFinancialYearToMonth: COPReportDetails.madeTeaFinancialYearToMonth,

            }}
            validationSchema={Yup.object().shape({
              groupID: Yup.number()
                .required('Group is required')
                .min('1', 'Group is required'),
              factoryID: Yup.number()
                .required('Estate is required')
                .min('1', 'Estate is required'),
              startDate: Yup.date().required('From Date is Required'),
              endDate: Yup.date().required('To Date is Required'),
              madeTeaToFrom: Yup.string() .matches(/^[0-9]+$/, "Commission should contain only digits")
             .max(15, 'Only allow 15 digits'),
             madeTeaThisMonth: Yup.string() .matches(/^[0-9]+$/, "Commission should contain only digits")
             .max(15, 'Only allow 15 digits'),
             madeTeaPreviousMonth: Yup.string() .matches(/^[0-9]+$/, "Commission should contain only digits")
             .max(15, 'Only allow 15 digits'),
             madeTeaFinancialYearToMonth: Yup.string() .matches(/^[0-9]+$/, "Commission should contain only digits")
             .max(15, 'Only allow 15 digits')
            })}
            onSubmit={() => trackPromise(GetCOPReportDetails())}
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
                        <Grid container spacing={4}>
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="groupID">
                              Group *
                            </InputLabel>
                            <TextField
                              select
                              error={Boolean(touched.groupID && errors.groupID)}
                              fullWidth
                              helperText={touched.groupID && errors.groupID}
                              name="groupID"
                              onBlur={handleBlur}
                              onChange={e => handleChange(e)}
                              value={COPReportDetails.groupID}
                              variant="outlined"
                              id="groupID"
                              disabled={!permissionList.isGroupFilterEnabled}
                              size = 'small'
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(groups)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={8}>
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
                              name="factoryID"
                              size = 'small'
                              onBlur={handleBlur}
                              onChange={e => handleChange(e)}
                              value={COPReportDetails.factoryID}
                              variant="outlined"
                              id="factoryID"
                              disabled={!permissionList.isFactoryFilterEnabled}
                            >
                              <MenuItem value="0">--Select Estate--</MenuItem>
                              {generateDropDownMenu(factories)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="startDate">
                              From Date *
                            </InputLabel>
                            <TextField
                              error={Boolean(
                                touched.startDate && errors.startDate
                              )}
                              fullWidth
                              helperText={touched.startDate && errors.startDate}
                              name="startDate"
                              type="date"
                              onBlur={handleBlur}
                              onChange={e => handleChange(e)}
                              value={COPReportDetails.startDate}
                              variant="outlined"
                              id="startDate"
                              size = 'small'
                            ></TextField>
                          </Grid>
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="endDate">
                              To Date *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.endDate && errors.endDate)}
                              fullWidth
                              helperText={touched.endDate && errors.endDate}
                              name="endDate"
                              type="date"
                              onBlur={handleBlur}
                              size = 'small'
                              onChange={e => handleChange(e)}
                              value={COPReportDetails.endDate}
                              variant="outlined"
                              id="endDate"
                            ></TextField>
                          </Grid>
                        </Grid>
                        <Grid container spacing={4}>
                          <Grid item md={2} xs={5}>
                            <FormControlLabel
                              control={<CheckBox />}
                              label="This Month"
                              name="isCheckedThisMonth"
                              id="isCheckedThisMonth"
                              onChange={e => handleChangeCheckBox1(e)}
                              checked={COPReportDetails.isCheckedThisMonth}
                            />
                          </Grid>
                          <Grid item md={2} xs={5}>
                            <FormControlLabel
                              control={<CheckBox />}
                              label="Previous Month"
                              name="isCheckPreviousMonth"
                              id="isCheckPreviousMonth"
                              onChange={e => handleChangeCheckBox2(e)}
                              checked={COPReportDetails.isCheckPreviousMonth}
                            />
                          </Grid>
                          <Grid item md={2} xs={5}>
                            <FormControlLabel
                              control={<CheckBox />}
                              label="Year to Date"
                              name="isCheckedFinacialYearToDate"
                              id="isCheckedFinacialYearToDate"
                              size = 'small'
                              onChange={e => handleChangeCheckBox3(e)}
                              checked={
                                COPReportDetails.isCheckedFinacialYearToDate
                              }
                            />
                          </Grid>
                        </Grid>
                        <br></br>
                        {IsReportVisible ? (
                          <Accordion
                            defaultExpanded={false}
                            onChange={(e, expanded) => {
                              toggleUserFields(expanded);
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
                              <div className={classes.column}>
                                <Typography color="textPrimary" variant="h5">
                                  {AccordianTitle}
                                </Typography>
                              </div>
                            </AccordionSummary>
                            <>
                              <Grid container p={1} spacing={3}>
                                <Grid item md={3} xs={18}>
                                  <InputLabel
                                    shrink
                                    id="madeTeaToFrom"
                                  ></InputLabel>
                                  <TextField
                                     error={Boolean(touched.madeTeaToFrom && errors.madeTeaToFrom)}
                                     fullWidth
                                     helperText={touched.madeTeaToFrom && errors.madeTeaToFrom}
                                    name="madeTeaToFrom"
                                    type='number'
                                    onBlur={handleBlur}
                                    label="Made Tea To From/Kg"
                                    onChange={e => handleChange(e)}
                                    value={COPReportDetails.madeTeaToFrom}
                                    variant="outlined"
                                    size = 'small'
                                  />
                                </Grid>
                                {COPReportDetails.isCheckedThisMonth == true ? (

                                  <Grid item md={3} xs={18}>
                                    <InputLabel
                                      shrink
                                      id="madeTeaThisMonth"
                                    ></InputLabel>
                                    <TextField
                                        error={Boolean(touched.madeTeaThisMonth && errors.madeTeaThisMonth)}
                                        fullWidth
                                        helperText={touched.madeTeaThisMonth && errors.madeTeaThisMonth}
                                      name="madeTeaThisMonth"
                                      type='number'
                                      onBlur={handleBlur}
                                      label="Made Tea This Month/Kg"
                                      onChange={e => handleChange(e)}
                                      size = 'small'
                                      value={
                                        COPReportDetails.madeTeaThisMonth
                                      }
                                      variant="outlined"
                                    />
                                  </Grid>

                                ) : null}
                                {COPReportDetails.isCheckPreviousMonth != 0 ? (

                                  <Grid item md={3} xs={18}>
                                    <InputLabel
                                      shrink
                                      id="madeTeaPreviousMonth"
                                    ></InputLabel>
                                    <TextField
                                     error={Boolean(touched.madeTeaPreviousMonth && errors.madeTeaPreviousMonth)}
                                     fullWidth
                                     helperText={touched.madeTeaPreviousMonth && errors.madeTeaPreviousMonth}
                                      type='number'
                                      label="Made Tea Previous Month/Kg"
                                      name="madeTeaPreviousMonth"
                                      size = 'small'
                                      onBlur={handleBlur}
                                      onChange={e => handleChange(e)}
                                      value={
                                        COPReportDetails.madeTeaPreviousMonth
                                      }
                                      variant="outlined"
                                    />
                                  </Grid>

                                ) : null}
                                {COPReportDetails.isCheckedFinacialYearToDate !=
                                  0 ? (

                                  <Grid item md={3} xs={18}>
                                    <InputLabel
                                      shrink
                                      id="madeTeaFinancialYearToMonth"
                                    ></InputLabel>
                                    <TextField
                                     error={Boolean(touched.madeTeaFinancialYearToMonth && errors.madeTeaFinancialYearToMonth)}
                                     fullWidth
                                     helperText={touched.madeTeaFinancialYearToMonth && errors.madeTeaFinancialYearToMonth}
                                      type='number'
                                      name="madeTeaFinancialYearToMonth"
                                      onBlur={handleBlur}
                                      label="Made Tea Year to Date/Kg"
                                      onChange={e => handleChange(e)}
                                      size = 'small'
                                      value={
                                        COPReportDetails.madeTeaFinancialYearToMonth
                                      }
                                      variant="outlined"
                                    />
                                  </Grid>

                                ) : null}
                              </Grid>
                              <br></br>
                            </>
                          </Accordion>
                        ) : null}

                        <Box display="flex" flexDirection="row-reverse" p={2}>
                          <Button
                            color="primary"
                            type="submit"
                            //onClick={() => trackPromise(GetCOPReportDetails())}
                            variant="contained"
                            size = 'small'
                          >
                            Search
                          </Button>
                        </Box>
                        {
                          IsReportVisible ? (
                            <>
                              <Grid display="flex" flexDirection="row-reverse" container md={12}>
                                <Grid display="flex" flexDirection="row-reverse" item md spacing={0}>
                                  <TableContainer component={Paper}>
                                    <Table aria-label="spanning table">
                                      <TableHead style={{ backgroundColor: "#C1E5FF" }}>
                                        <TableRow>
                                          <TableCell style={{ fontSize: '18px', backgroundColor: '#FFFFFF' }} align="center" size="small" colSpan={3}>
                                            From To
                                          </TableCell>
                                        </TableRow>
                                        <TableRow>
                                          <TableCell align="center" size="small" colSpan={3}>
                                            Made Tea Quantity (Kg): {COPReportDetails.madeTeaToFrom}
                                          </TableCell>
                                        </TableRow>

                                        <TableRow>
                                          <TableCell component="th" scope="row" size="small" ></TableCell>
                                          <TableCell align="right" size="small" >Amount(Rs)</TableCell>
                                          <TableCell align="right" size="small" >COP/Rs</TableCell>
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {
                                          reportData.copReportToFrom.map((row) => (
                                            <>
                                              <TableRow
                                                style={{
                                                  backgroundColor: "#D4F7C4"
                                                }}
                                              >
                                                <TableCell component="th" scope="row" style={{ fontWeight: 'bold' }}>
                                                  {row.copParentSectionName}
                                                </TableCell>
                                                <TableCell align="right" />
                                                <TableCell align="right" />
                                              </TableRow>
                                              {
                                                row.childList.map(item => (
                                                  <>
                                                    <TableRow key={item.copChildSectionID}>
                                                      <TableCell component="th" scope="row" style={{ fontWeight: 'bold' }}>
                                                        <SubdirectoryArrowRightIcon />
                                                        {item.copChildSectionName}
                                                      </TableCell>
                                                      <TableCell align="right" />
                                                      <TableCell align="right" />
                                                    </TableRow>

                                                    {
                                                      item.ledgerAccountList.map(item => (
                                                        <TableRow key={item.ledgerAccountID}>
                                                          <TableCell component="th" scope="row">
                                                            {item.ledgerAccountName}
                                                          </TableCell>
                                                          <TableCell align="right">{item.balance.toFixed(2)}</TableCell>
                                                          <TableCell align="right">
                                                            {
                                                              item.balance > 0 ? (
                                                                <>
                                                                  {(
                                                                    COPReportDetails.madeTeaToFrom /
                                                                    item.balance
                                                                  ).toFixed(2)}
                                                                </>
                                                              ) : null
                                                            }
                                                          </TableCell>
                                                        </TableRow>
                                                      ))
                                                    }
                                                  </>
                                                ))
                                              }
                                            </>
                                          ))
                                        }
                                      </TableBody>
                                    </Table>
                                  </TableContainer>
                                </Grid>


                                {
                                  COPReportDetails.isCheckedThisMonth == true ? (
                                    reportData.copReportThisMonth != 0 ? (
                                      <Grid item md spacing={0}>
                                        <TableContainer component={Paper}>
                                          <Table aria-label="spanning table">
                                            <TableHead style={{ backgroundColor: "#C1E5FF" }}>
                                              <TableRow>
                                                <TableCell style={{ fontSize: '18px', backgroundColor: '#FFFFFF' }} size="small" align="center" colSpan={3}>
                                                  This Month
                                                </TableCell>
                                              </TableRow>
                                              <TableRow>
                                                <TableCell align="center" size="small" colSpan={3}>
                                                  Made Tea Quantity (Kg): {COPReportDetails.madeTeaThisMonth}
                                                </TableCell>
                                              </TableRow>

                                              <TableRow>
                                                <TableCell component="th" scope="row" size="small" ></TableCell>
                                                <TableCell align="right" size="small" > Amount(Rs)</TableCell>
                                                <TableCell align="right" size="small" >COP/Rs</TableCell>
                                              </TableRow>
                                            </TableHead>
                                            <TableBody>
                                              {
                                                reportData.copReportThisMonth.map((row) => (
                                                  <>
                                                    <TableRow
                                                      key={row.copParentSectionID}
                                                      style={{
                                                        backgroundColor: "#D4F7C4"
                                                      }}
                                                    >
                                                      <TableCell component="th" scope="row" >
                                                        <span style={{ color: "transparent", visibility: "hidden" }} >
                                                          {row.copParentSectionName}
                                                        </span>
                                                      </TableCell>
                                                      <TableCell align="right" />
                                                      <TableCell align="right" />
                                                    </TableRow>
                                                    {
                                                      row.childList.map(item => (
                                                        <>
                                                          <TableRow key={item.copChildSectionID}>
                                                            <TableCell component="th" scope="row">
                                                              <span style={{ color: "transparent", visibility: "hidden" }} >
                                                                <SubdirectoryArrowRightIcon />
                                                                {item.copChildSectionName}
                                                              </span>
                                                            </TableCell>
                                                            <TableCell align="right" />
                                                            <TableCell align="right" />
                                                          </TableRow>

                                                          {
                                                            item.ledgerAccountList.map(item => (
                                                              <TableRow key={item.ledgerAccountID}>
                                                                <TableCell component="th" scope="row">
                                                                  {item.ledgerAccountName}
                                                                </TableCell>
                                                                <TableCell align="right">{item.balance.toFixed(2)}</TableCell>
                                                                <TableCell align="right">
                                                                  {
                                                                    item.balance > 0 ? (
                                                                      <>
                                                                        {(
                                                                          COPReportDetails.madeTeaToFrom /
                                                                          item.balance
                                                                        ).toFixed(2)}
                                                                      </>
                                                                    ) : null
                                                                  }
                                                                </TableCell>
                                                              </TableRow>
                                                            ))
                                                          }
                                                        </>
                                                      ))
                                                    }
                                                  </>
                                                ))
                                              }
                                            </TableBody>
                                          </Table>
                                        </TableContainer>
                                      </Grid>
                                    ) : null
                                  )
                                    : null
                                }

                                {
                                  COPReportDetails.isCheckPreviousMonth == true ? (
                                    reportData.copReportPreviousMonth != 0 ? (
                                      <Grid item md spacing={0}>
                                        <TableContainer component={Paper}>
                                          <Table aria-label="spanning table">
                                            <TableHead style={{ backgroundColor: "#C1E5FF" }}>
                                              <TableRow>
                                                <TableCell style={{ fontSize: '18px', backgroundColor: '#FFFFFF' }} size="small" align="center" colSpan={3}>
                                                  Previous Month
                                                </TableCell>
                                              </TableRow>
                                              <TableRow>
                                                <TableCell align="center" size="small" colSpan={3}>
                                                  Made Tea Quantity (Kg): {COPReportDetails.madeTeaPreviousMonth}
                                                </TableCell>
                                              </TableRow>

                                              <TableRow>
                                                <TableCell component="th" scope="row" size="small" ></TableCell>
                                                <TableCell align="right" size="small" >Amount(Rs)</TableCell>
                                                <TableCell align="right" size="small" >COP/Rs</TableCell>
                                              </TableRow>
                                            </TableHead>
                                            <TableBody>
                                              {
                                                reportData.copReportPreviousMonth.map((row) => (
                                                  <>
                                                    <TableRow
                                                      key={row.copParentSectionID}
                                                      style={{
                                                        backgroundColor: "#D4F7C4"
                                                      }}
                                                    >
                                                      <TableCell component="th" scope="row" >
                                                        <span style={{ color: "transparent", visibility: "hidden" }} >
                                                          {row.copParentSectionName}
                                                        </span>
                                                      </TableCell>
                                                      <TableCell align="right" />
                                                      <TableCell align="right" />
                                                    </TableRow>
                                                    {
                                                      row.childList.map(item => (
                                                        <>
                                                          <TableRow key={item.copChildSectionID}>
                                                            <TableCell component="th" scope="row">
                                                              <span style={{ color: "transparent", visibility: "hidden" }} >
                                                                <SubdirectoryArrowRightIcon />
                                                                {item.copChildSectionName}
                                                              </span>
                                                            </TableCell>
                                                            <TableCell align="right" />
                                                            <TableCell align="right" />
                                                          </TableRow>

                                                          {
                                                            item.ledgerAccountList.map(item => (
                                                              <TableRow key={item.ledgerAccountID}>
                                                                <TableCell component="th" scope="row">
                                                                  {item.ledgerAccountName}
                                                                </TableCell>
                                                                <TableCell align="right">{item.balance.toFixed(2)}</TableCell>
                                                                <TableCell align="right">
                                                                  {item.balance > 0 ? (
                                                                    <>
                                                                      {(
                                                                        COPReportDetails.madeTeaPreviousMonth /
                                                                        item.balance
                                                                      ).toFixed(2)}
                                                                    </>
                                                                  ) : null}
                                                                </TableCell>
                                                              </TableRow>
                                                            ))
                                                          }
                                                        </>
                                                      ))
                                                    }
                                                  </>
                                                ))
                                              }
                                            </TableBody>
                                          </Table>
                                        </TableContainer>
                                      </Grid>
                                    ) : null
                                  )
                                    : null
                                }
                                {
                                  COPReportDetails.isCheckedFinacialYearToDate == true ? (
                                    reportData.copReportFinancialYearToMonth != 0 ? (
                                      <Grid item md spacing={0}>
                                        <TableContainer component={Paper}>
                                          <Table aria-label="spanning table">
                                            <TableHead style={{ backgroundColor: "#C1E5FF" }}>
                                              <TableRow>
                                                <TableCell style={{ fontSize: '18px', backgroundColor: '#FFFFFF' }} size="small" align="center" colSpan={3}>
                                                  Year to Date
                                                </TableCell>
                                              </TableRow>
                                              <TableRow>
                                                <TableCell align="center" size="small" colSpan={3}>
                                                  Made Tea Quantity (Kg): {COPReportDetails.madeTeaFinancialYearToMonth}
                                                </TableCell>
                                              </TableRow>

                                              <TableRow>
                                                <TableCell component="th" size="small" scope="row"></TableCell>
                                                <TableCell align="right" size="small" >Amount(Rs)</TableCell>
                                                <TableCell align="right" size="small" >COP/Rs</TableCell>
                                              </TableRow>
                                            </TableHead>
                                            <TableBody>
                                              {
                                                reportData.copReportFinancialYearToMonth.map((row) => (
                                                  <>
                                                    <TableRow
                                                      key={row.copParentSectionID}
                                                      style={{
                                                        backgroundColor: "#D4F7C4"
                                                      }}
                                                    >
                                                      <TableCell component="th" scope="row" >
                                                        <span style={{ color: "transparent", visibility: "hidden" }} >
                                                          {row.copParentSectionName}
                                                        </span>
                                                      </TableCell>
                                                      <TableCell align="right" />
                                                      <TableCell align="right" />
                                                    </TableRow>
                                                    {
                                                      row.childList.map(item => (
                                                        <>
                                                          <TableRow key={item.copChildSectionID}>
                                                            <TableCell component="th" scope="row">
                                                              <span style={{ color: "transparent", visibility: "hidden" }} >
                                                                <SubdirectoryArrowRightIcon />
                                                                {item.copChildSectionName}
                                                              </span>
                                                            </TableCell>
                                                            <TableCell align="right" />
                                                            <TableCell align="right" />
                                                          </TableRow>

                                                          {
                                                            item.ledgerAccountList.map(item => (
                                                              <TableRow key={item.ledgerAccountID}>
                                                                <TableCell component="th" scope="row">
                                                                  {item.ledgerAccountName}
                                                                </TableCell>
                                                                <TableCell align="right">{item.balance.toFixed(2)}</TableCell>
                                                                <TableCell align="right">
                                                                  {item.balance > 0 ? (
                                                                    <>
                                                                      {(
                                                                        COPReportDetails.madeTeaFinancialYearToMonth /
                                                                        item.balance
                                                                      ).toFixed(2)}
                                                                    </>
                                                                  ) : null}
                                                                </TableCell>
                                                              </TableRow>
                                                            ))
                                                          }
                                                        </>
                                                      ))
                                                    }
                                                  </>
                                                ))
                                              }
                                            </TableBody>
                                          </Table>
                                        </TableContainer>
                                      </Grid>
                                    ) : null
                                  )
                                    : null
                                }
                              </Grid>
                              <Box display="flex" justifyContent="flex-end" p={2}>
                                <ReactToPrint
                                  documentTitle={'COP Report'}
                                  trigger={() => (
                                    <Button
                                      color="primary"
                                      id="btnRecord"
                                      type="submit"
                                      variant="contained"
                                      style={{ marginRight: '1rem' }}
                                      className={classes.colorCancel}
                                      size = 'small'
                                    >
                                      PDF
                                    </Button>
                                  )}
                                  content={() => componentRef.current}
                                />

                              </Box>
                              <br />
                              <div hidden={true}>
                                <CreatePDF
                                  ref={componentRef}
                                  ReportData={reportData}
                                  COPReportDetails={COPReportDetails}
                                  searchData={selectedSearchValues}
                                  UseStyles={classes}
                                />
                              </div>
                            </>
                          ) : null
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
    </Fragment>
  );
}
