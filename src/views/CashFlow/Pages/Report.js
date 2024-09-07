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
  AccordionSummary,
  AccordionDetails
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import { Formik, validateYupSchema } from 'formik';
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
import moment from 'moment';
import Paper from '@material-ui/core/Paper';
import SubdirectoryArrowRightIcon from '@material-ui/icons/SubdirectoryArrowRight';

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

const screenCode = 'CASHFLOW';

export default function CashFlowReport(props) {
  const navigate = useNavigate();
  const alert = useAlert();
  const componentRef = useRef();
  const classes = useStyles();
  const [groups, setGroups] = useState();
  const [HideUserFields, setHideUserFields] = useState(false);
  const [factories, setFactories] = useState();
  const [title, setTitle] = useState('Cash Flow Report');
  const [total, setTotal] = useState();
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
    isCOPConfigurationEnabled: true
  });
  const [CashFlowReportDetails, setCashFlowReportDetails] = useState({
    groupID: 0,
    factoryID: 0,
    startDate: '',
    endDate: '',
    madeTeaToFrom: '',
    madeTeaThisMonth: '',
    madeTeaPreviousMonth: '',
    madeTeaFinancialYearToMonth: '',
    isCheckedThisMonth: '',
    isCheckPreviousMonth: '',
    isCheckedFinacialYearToDate: ''
  });

  const [AccordianTitle, setAccordianTitle] = useState(
    'Please Expand to Options'
  );

  const [reportData, setReportData] = useState([]);

  const [IsReportVisible, setIsReportVisible] = useState(false);

  useEffect(() => {
    trackPromise(getPermission());
    trackPromise(getGroupsForDropdown());
  }, []);

  useEffect(() => {
    trackPromise(getFactoriesForDropDown());
  }, [CashFlowReportDetails.groupID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(
      p => p.permissionCode == 'VIEWCASHFLOW'
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
      p => p.permissionCode == 'VIEWCONFIGURATIONCHASHFLOW'
    );

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
      isCOPConfigurationEnabled: isCOPConfigurationEnabled !== undefined
    });

    setCashFlowReportDetails({
      ...CashFlowReportDetails,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    });
  }

  function toggleUserFields(expanded) {
    setHideUserFields(!HideUserFields);
    if (expanded === false) {
      setAccordianTitle('Please Expand to View Options');
    } else {
      setAccordianTitle('Filtering Options');
    }
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getFactoriesForDropDown() {
    const factory = await services.getFactoryByGroupID(
      CashFlowReportDetails.groupID
    );
    setFactories(factory);
  }

  function NavigateToConfigurationPage() {
    navigate(
      '/app/CashFlow/configuration/' +
      btoa(CashFlowReportDetails.groupID) +
      '/' +
      btoa(CashFlowReportDetails.factoryID)
    );
  }

  function cardTitle(titleName) {
    return (
      <Grid container spacing={1}>
        <Grid item md={11} xs={12}>
          {titleName}
        </Grid>
        {CashFlowReportDetails.groupID === '0' ||
          CashFlowReportDetails.factoryID === '0' ? null : (
          <>
            {permissionList.isCOPConfigurationEnabled === true ? (
              <Grid item md={1} xs={12}>
                <Tooltip title="Cash Flow Configurations">
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
    setCashFlowReportDetails({
      ...CashFlowReportDetails,
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

  async function GetCashFlowReportDetails() {
    let resultModel = {
      groupID: parseInt(CashFlowReportDetails.groupID),
      factoryID: parseInt(CashFlowReportDetails.factoryID),
      startDate: CashFlowReportDetails.startDate,
      endDate: CashFlowReportDetails.endDate
    };

    const response = await services.GetCashFlowReport(resultModel);

    if (response !== null && response.statusCode === 'Success') {
      let result = response.data;
      calTotal(result)
      setReportData(result);
      setIsReportVisible(true);
    } else {
      setIsReportVisible(false);

      alert.error(response.message);
    }
  }

  async function calTotal(result) {
    let data = result;
    let total = 0;
    data.forEach(x => {
      x.childList.forEach(y => {
        y.ledgerAccountList.forEach(z => {
          total = total + z.balance;
        });
      });
    });
    setTotal(total);
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: CashFlowReportDetails.groupID,
              factoryID: CashFlowReportDetails.factoryID,
              startDate: CashFlowReportDetails.startDate,
              endDate: CashFlowReportDetails.endDate
            }}
            validationSchema={Yup.object().shape({
              groupID: Yup.number()
                .required('Group is required')
                .min('1', 'Group is required'),
              factoryID: Yup.number()
                .required('Estate is required')
                .min('1', 'Estate is required'),
              startDate: Yup.date().required('From Date is Required'),
              endDate: Yup.date().required('To Date is Required')
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
                              value={CashFlowReportDetails.groupID}
                              variant="outlined"
                              id="groupID"
                              size = 'small'
                              disabled={!permissionList.isGroupFilterEnabled}
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
                              onBlur={handleBlur}
                              size = 'small'
                              onChange={e => handleChange(e)}
                              value={CashFlowReportDetails.factoryID}
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
                              size = 'small'
                              onChange={e => handleChange(e)}
                              value={CashFlowReportDetails.startDate}
                              variant="outlined"
                              id="startDate"
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
                              value={CashFlowReportDetails.endDate}
                              variant="outlined"
                              id="endDate"
                            ></TextField>
                          </Grid>
                        </Grid>
                        <Box display="flex" flexDirection="row-reverse" p={2}>
                          <Button
                            color="primary"
                            type="submit"
                            onClick={() => trackPromise(GetCashFlowReportDetails())}
                            variant="contained"
                            size = 'small'
                          >
                            Search
                          </Button>
                        </Box>
                        {IsReportVisible ? (
                          <>
                            <Box minWidth={1050}>
                              <Card
                                className={classes.cardStyle}
                                variant="outlined"
                              >
                                <CardContent>
                                  <Typography
                                    style={{ fontWeight: 'bold' }}
                                    className={classes.title}
                                    color="textSecondary"
                                    gutterBottom
                                  >
                                    Period of :{' '}
                                    {moment(CashFlowReportDetails.startDate).format(
                                      'MMMM Do YYYY'
                                    )}{' '}
                                    &emsp;&emsp; | &emsp;&emsp; To :{' '}
                                    {moment(CashFlowReportDetails.endDate).format(
                                      'MMMM Do YYYY'
                                    )}
                                  </Typography>
                                </CardContent>
                              </Card>
                              <TableContainer component={Paper}>
                                <Table
                                  className={classes.table}
                                  aria-label="simple table"
                                >
                                  <TableHead
                                    style={{ backgroundColor: '#C1E5FF' }}
                                  >
                                    <TableRow hidden={true}>
                                      <TableCell></TableCell>
                                      <TableCell align="center" size="small">
                                        Amount
                                      </TableCell>
                                      <TableCell
                                        align="center"
                                        size="small"
                                      ></TableCell>
                                      <TableCell
                                        align="center"
                                        size="small"
                                      ></TableCell>
                                      <TableCell
                                        align="center"
                                        size="small"
                                      ></TableCell>
                                      <TableCell
                                        align="center"
                                        size="small"
                                      ></TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell></TableCell>
                                      <TableCell align="center" size="small">
                                        /Rs
                                      </TableCell>
                                      <TableCell
                                        align="center"
                                        size="small"
                                      ></TableCell>
                                      <TableCell
                                        align="center"
                                        size="small"
                                      ></TableCell>
                                      <TableCell
                                        align="center"
                                        size="small"
                                      ></TableCell>
                                      <TableCell
                                        align="center"
                                        size="small"
                                      ></TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {reportData.map(row => (
                                      <>
                                        <TableRow
                                          key={row.cashFlowParentSectionID}
                                          style={{ backgroundColor: '#D4F7C4' }}
                                        >
                                          <TableCell
                                            component="th"
                                            scope="row"
                                            style={{ fontWeight: 'bold' }}
                                          >
                                            {row.cashFlowParentSectionName}
                                          </TableCell>
                                          <TableCell
                                            align="center"
                                            size="small"
                                          ></TableCell>
                                          <TableCell
                                            align="center"
                                            size="small"
                                          ></TableCell>
                                          <TableCell
                                            align="center"
                                            size="small"
                                          ></TableCell>
                                          <TableCell
                                            align="center"
                                            size="small"
                                          ></TableCell>
                                          <TableCell
                                            align="center"
                                            size="small"
                                          ></TableCell>
                                        </TableRow>
                                        {row.childList.map(item => (
                                          <>
                                            <TableRow
                                              key={item.cashFlowChildSectionID}
                                            >
                                              <TableCell
                                                component="th"
                                                scope="row"
                                                style={{ fontWeight: 'bold' }}
                                              >
                                                <SubdirectoryArrowRightIcon />
                                                {item.cashFlowChildSectionName}
                                              </TableCell>
                                              <TableCell
                                                align="center"
                                                size="small"
                                              ></TableCell>
                                              <TableCell
                                                align="center"
                                                size="small"
                                              ></TableCell>
                                              <TableCell
                                                align="center"
                                                size="small"
                                              ></TableCell>
                                              <TableCell
                                                align="center"
                                                size="small"
                                              ></TableCell>
                                              <TableCell
                                                align="center"
                                                size="small"
                                              ></TableCell>
                                            </TableRow>
                                            {item.ledgerAccountList.map(
                                              item => (
                                                <TableRow
                                                  key={item.ledgerAccountID}
                                                >
                                                  <TableCell
                                                    component="th"
                                                    scope="row"
                                                  >
                                                    &emsp;&emsp;&emsp;
                                                    {item.ledgerAccountName}
                                                  </TableCell>
                                                  <TableCell
                                                    align="center"
                                                    size="small"
                                                  >
                                                    {item.balance}
                                                  </TableCell>

                                                  <TableCell
                                                    align="center"
                                                    size="small"
                                                  >
                                                  </TableCell>
                                                  <TableCell
                                                    align="center"
                                                    size="small"
                                                  ></TableCell>
                                                  <TableCell
                                                    align="center"
                                                    size="small"
                                                  ></TableCell>
                                                  <TableCell
                                                    align="center"
                                                    size="small"
                                                  ></TableCell>
                                                </TableRow>
                                              )
                                            )}
                                          </>
                                        ))}
                                        <TableRow>
                                          <TableCell
                                            component="th"
                                            scope="row"
                                            style={{ fontWeight: 'bold' }}
                                          >
                                            Total Amount
                                          </TableCell>
                                          <TableCell
                                            align="center"
                                            size="small"
                                            style={{ fontWeight: 'bold' }}
                                          >
                                            {total}
                                          </TableCell>
                                          <TableCell
                                            align="center"
                                            size="small"
                                          >

                                          </TableCell>
                                          <TableCell
                                            align="center"
                                            size="small"
                                          ></TableCell>
                                          <TableCell
                                            align="center"
                                            size="small"
                                          ></TableCell>
                                          <TableCell
                                            align="center"
                                            size="small"
                                          ></TableCell>
                                        </TableRow>
                                      </>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Box>
                            <Box display="flex" justifyContent="flex-end" p={2}>
                              <ReactToPrint
                                documentTitle={'Cash Flow Report'}
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
                              <div hidden={true}>
                                <CreatePDF
                                  ref={componentRef}
                                  ReportData={reportData}
                                  CashFlowReportDetails={CashFlowReportDetails}
                                  total={total}
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
