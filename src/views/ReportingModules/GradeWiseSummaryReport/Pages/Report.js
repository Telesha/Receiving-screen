import React, { useState, useEffect, Fragment, useRef } from 'react';
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
    TableRow
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import { Formik } from 'formik';
import * as Yup from 'yup';
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { useNavigate } from 'react-router-dom';
import { useAlert } from 'react-alert';
import xlsx from 'json-as-xlsx';
import ReactToPrint from 'react-to-print';
import CreatePDF from './CreatePDF';
import moment from 'moment';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";


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
    }
}));

const screenCode = 'GRADEWISESUMMARYREPORT';

export default function GradeWiseSummaryReport(props) {
    const [title, setTitle] = useState('Grade Wise Summary Report');
    const classes = useStyles();
    const [GroupList, setGroupList] = useState([]);
    const [FactoryList, setFactoryList] = useState([]);
    const [sellingMarks, setSellingMarks] = useState([]);
    const [brokers, setBrokers] = useState([]);
    const [gradeWiseSummaryDetails, setGradeWiseSummaryDetails] = useState([]);
    const [gradeWiseSummaryReportDetails, setGradeWiseSummaryReportDetails] = useState({
        groupID: 0,
        factoryID: 0,
        sellingMarkID: 0,
        brokerID: 0,
        teaGradeID: 0,
        buyerID: 0
    });
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });
    const navigate = useNavigate();
    const alert = useAlert();
    const componentRef = useRef();
    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupName: '',
        factoryName: '',
        startDate: '',
        endDate: ''
    });

    const [grandTotal, setGrandTotal] = useState({
      quantityTotal: 0,
      proceedsTotal: 0
    });

    const [mainGradeTotal, setMainGradeTotal] = useState({
      maintotalQuantity: 0,
      maintotalProceeds: 0,
      mainGradeQtyPercentage: 0,
      mainGradeAvgPercentage: 0
    });

    const [offGradeTotal, setOffGradeTotal] = useState({
      offtotalQuantity: 0,
      offtotalProceeds: 0,
      offGradeQtyPercentage: 0,
      offGradeAvgPercentage: 0
    });

    const [startDateRange, setStartDateRange] = useState(new Date());
    const [endDateRange, setEndDateRange] = useState(new Date());
    const [grades, setGrades] = useState();
    const [buyers, setBuyers] = useState([]);
    const [csvHeaders, SetCsvHeaders] = useState([]);
    useEffect(() => {
        trackPromise(getPermission());
        trackPromise(getGroupsForDropdown());
    }, []);

    useEffect(() => {
        trackPromise(getFactoriesForDropdown());
    }, [gradeWiseSummaryReportDetails.groupID]);

    useEffect(
        () => {
          trackPromise(
            getBrokersForDropdown(),
            getSellingMarksForDropdown(),
            getGradesForDropdown(),
            getBuyersForDropdown()
          );
        },
        [gradeWiseSummaryReportDetails.factoryID]
      );

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(
            p => p.permissionCode == 'VIEWGRADEWISESUMMARYREPORT'
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

        setPermissions({
            ...permissionList,
            isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
            isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined
        });

        setGradeWiseSummaryReportDetails({
            ...gradeWiseSummaryReportDetails,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        });
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroupList(groups);
    }

    async function getFactoriesForDropdown() {
        const factories = await services.getFactoryByGroupID(gradeWiseSummaryReportDetails.groupID);
        setFactoryList(factories);
    }

    async function getSellingMarksForDropdown() {
        const sellingMarks = await services.getSellingMarkList(gradeWiseSummaryReportDetails.groupID,gradeWiseSummaryReportDetails.factoryID);
        setSellingMarks(sellingMarks);
    }

    async function getBrokersForDropdown() {
        const brokers = await services.getBrokerList(gradeWiseSummaryReportDetails.groupID,gradeWiseSummaryReportDetails.factoryID);
        setBrokers(brokers);
    }

    async function getGradesForDropdown() {
        const grades = await services.GetGradeDetails(gradeWiseSummaryReportDetails.groupID, gradeWiseSummaryReportDetails.factoryID);
        setGrades(grades);
    }

    async function getBuyersForDropdown() {
        const buyers = await services.getAllBuyers(gradeWiseSummaryReportDetails.groupID, gradeWiseSummaryReportDetails.factoryID);
        setBuyers(buyers);
    }

  async function GetDetails() {
   
      let model = {
        groupID: parseInt(gradeWiseSummaryReportDetails.groupID),
        factoryID: parseInt(gradeWiseSummaryReportDetails.factoryID),
        startDate: moment(startDateRange.toString())
          .format()
          .split('T')[0],
        endDate: moment(endDateRange.toString())
          .format()
          .split('T')[0],
        teaGradeID: parseInt(gradeWiseSummaryReportDetails.teaGradeID),
        sellingMarkID: parseInt(gradeWiseSummaryReportDetails.sellingMarkID),
        brokerID: parseInt(gradeWiseSummaryReportDetails.brokerID),
        buyerID: parseInt(gradeWiseSummaryReportDetails.buyerID)
      };

      const gradeWiseSummaryReportDetailsData = await services.getGradeWiseSummaryReportDetails(model);

      if (gradeWiseSummaryReportDetailsData.statusCode == 'Success' && gradeWiseSummaryReportDetailsData.data != null) {

        let totalQuantity = 0;
        let totalProceeds = 0;

        let maintotalQuantity = 0;
        let maintotalProceeds = 0;

        let offtotalQuantity = 0;
        let offtotalProceeds = 0;

        gradeWiseSummaryReportDetailsData.data.forEach(x => {
          totalQuantity += x.netQuantity;
          totalProceeds += x.proceeds;
          if(x.gradeCategoryID == 1)
          {
            maintotalQuantity += x.netQuantity;
            maintotalProceeds += x.proceeds;
          }
          if(x.gradeCategoryID == 2)
          {
            offtotalQuantity += x.netQuantity;
            offtotalProceeds += x.proceeds;
          }
        });

        setGrandTotal({
          ...grandTotal,
          quantityTotal: totalQuantity,
          proceedsTotal: totalProceeds
        });

        setMainGradeTotal({
          ...mainGradeTotal,
          maintotalQuantity: maintotalQuantity,
          maintotalProceeds: maintotalProceeds,
          mainGradeQtyPercentage: (maintotalQuantity / totalQuantity) * 100,
          mainGradeAvgPercentage: (maintotalProceeds / totalProceeds) * 100
        });

        setOffGradeTotal({
          ...offGradeTotal,
          offtotalQuantity: offtotalQuantity,
          offtotalProceeds: offtotalProceeds,
          offGradeQtyPercentage: (offtotalQuantity / totalQuantity) * 100,
          offGradeAvgPercentage: (offtotalProceeds / totalProceeds) * 100
        });

        gradeWiseSummaryReportDetailsData.data.forEach(x => {
          x.quantity = (x.netQuantity / totalQuantity)*100;
          x.average = (x.proceeds / totalProceeds)*100;
        });

        setGradeWiseSummaryDetails(gradeWiseSummaryReportDetailsData.data);

        getSelectedDropdownValuesForReport(gradeWiseSummaryReportDetails);

        if (gradeWiseSummaryReportDetailsData.data.length == 0) {
          alert.error('No Records');
        }
      }
      else
      {
        alert.error('Error');
      }
  }

    async function createDataForExcel(array) {
        var res = [];
        if (array != null) {
            array.map(x => {
                var vr = {
                    'Grade': x.grade,
                    'Net Qty (Kg)': x.netQuantity,
                    'Proceeds (Rs)': x.proceeds,
                    'Quantity %': x.quantity.toFixed(2),
                    'Average (Rs)': x.average.toFixed(2),
                };
                res.push(vr);
            });
            var vr = {
              'Grade': 'Total',
              'Net Qty (Kg)': grandTotal.quantityTotal,
              'Proceeds (Rs)': grandTotal.proceedsTotal
            };
            res.push(vr);
            var vr = {
              'Grade': 'Main Grade',
              'Net Qty (Kg)': mainGradeTotal.maintotalQuantity,
              'Proceeds (Rs)': mainGradeTotal.maintotalProceeds,
              'Quantity %': mainGradeTotal.mainGradeQtyPercentage.toFixed(2),
              'Average (Rs)': mainGradeTotal.mainGradeAvgPercentage.toFixed(2)
            };
            res.push(vr);
            var vr = {
              'Grade': 'Off Grade',
              'Net Qty (Kg)': offGradeTotal.offtotalQuantity,
              'Proceeds (Rs)': offGradeTotal.offtotalProceeds,
              'Quantity %': offGradeTotal.offGradeQtyPercentage.toFixed(2),
              'Average (Rs)': offGradeTotal.offGradeAvgPercentage.toFixed(2)
            };
            res.push(vr);
        }
        return res;
    }

  async function createFile() {
        var file = await createDataForExcel(gradeWiseSummaryDetails);
        var settings = {
          sheetName: 'Grade Wise Summary Report',
          fileName: 'Grade Wise Summary Report - ' + selectedSearchValues.groupName + '-' + selectedSearchValues.factoryName + '-' + selectedSearchValues.startDate,
          writeOptions: {}
        }
    
        let keys = Object.keys(file[0])
        let tempcsvHeaders = csvHeaders;
        keys.map((sitem, i) => {
          tempcsvHeaders.push({ label: sitem, value: sitem })
        })
        let dataA = [
          {
            sheet: 'Grade Wise Summary Report',
            columns: csvHeaders,
            content: file
          }
        ]
    
        xlsx(dataA, settings);
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

    function handleChange(e) {
        const target = e.target;
        const value = target.value;
        setGradeWiseSummaryReportDetails({
            ...gradeWiseSummaryReportDetails,
            [e.target.name]: value
        });
    }

  function getSelectedDropdownValuesForReport(searchForm) {
    var startDate = moment(startDateRange.toString()).format().split('T')[0];
    var endDate = moment(endDateRange.toString()).format().split('T')[0];
        setSelectedSearchValues({
          ...selectedSearchValues,
          groupName: GroupList[gradeWiseSummaryReportDetails.groupID],
          factoryName: FactoryList[gradeWiseSummaryReportDetails.factoryID],
          startDate: [startDate],
          endDate: [endDate]
        });
    }

    function cardTitle(titleName) {
        return (
            <Grid container spacing={1}>
                <Grid item md={10} xs={12}>
                    {titleName}
                </Grid>
            </Grid>
        );
    }

    return (
        <Fragment>
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: gradeWiseSummaryReportDetails.groupID,
                            factoryID: gradeWiseSummaryReportDetails.factoryID
                        }}
                        validationSchema={Yup.object().shape({
                            groupID: Yup.number()
                                .required('Group is required')
                                .min('1', 'Group is required'),
                            factoryID: Yup.number()
                                .required('Factory is required')
                                .min('1', 'Factory is required')
                        })}
                        onSubmit={() => trackPromise(GetDetails())}
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
                                                    <Grid item md={3} xs={12}>
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
                                                            value={gradeWiseSummaryReportDetails.groupID}
                                                            variant="outlined"
                                                            id="groupID"
                                                            size='small'
                                                            disabled={!permissionList.isGroupFilterEnabled}
                                                        >
                                                            <MenuItem value="0">--Select Group--</MenuItem>
                                                            {generateDropDownMenu(GroupList)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="factoryID">
                                                            Factory *
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
                                                            onChange={e => handleChange(e)}
                                                            value={gradeWiseSummaryReportDetails.factoryID}
                                                            variant="outlined"
                                                            id="factoryID"
                                                            size='small'
                                                            disabled={!permissionList.isFactoryFilterEnabled}
                                                        >
                                                            <MenuItem value="0">--Select Factory--</MenuItem>
                                                            {generateDropDownMenu(FactoryList)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={3} xs={12}>
                                                      <InputLabel shrink id="date">From Date *</InputLabel>
                                                      <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                        <KeyboardDatePicker
                                                          fullWidth
                                                          variant="inline"
                                                          format="dd/MM/yyyy"
                                                          margin="dense"
                                                          name='startDate'
                                                          id='startDate'
                                                          value={startDateRange}
                                                          onChange={(e) => {
                                                            setStartDateRange(e)
                                                          }}
                                                          KeyboardButtonProps={{
                                                            'aria-label': 'change date',
                                                          }}
                                                          autoOk
                                                        />
                                                      </MuiPickersUtilsProvider>
                                                    </Grid>

                                                    <Grid item md={3} xs={12}>
                                                      <InputLabel shrink id="date">To Date *</InputLabel>
                                                      <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                        <KeyboardDatePicker
                                                          fullWidth
                                                          variant="inline"
                                                          format="dd/MM/yyyy"
                                                          margin="dense"
                                                          name='startDate'
                                                          id='startDate'
                                                          value={endDateRange}
                                                          onChange={(e) => {
                                                            setEndDateRange(e)
                                                          }}
                                                          KeyboardButtonProps={{
                                                            'aria-label': 'change date',
                                                          }}
                                                          autoOk
                                                        />
                                                      </MuiPickersUtilsProvider>
                                                    </Grid>

                                                    <Grid item md={3} xs={12}>
                                                      <InputLabel shrink id="teaGradeID">
                                                        Grade 
                                                      </InputLabel>

                                                      <TextField select
                                                        fullWidth
                                                        size='small'
                                                        name="teaGradeID"
                                                        onChange={(e) => {
                                                          handleChange(e)
                                                        }}
                                                        value={gradeWiseSummaryReportDetails.teaGradeID}
                                                        variant="outlined"
                                                        id="teaGradeID"
                                                      >
                                                        <MenuItem value={'0'}>
                                                          --Select Grade--
                                                        </MenuItem>
                                                        {generateDropDownMenu(grades)}

                                                      </TextField>
                                                    </Grid>

                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="broker">
                                                            Broker
                                                        </InputLabel>
                                                        <TextField
                                                            select
                                                            error={Boolean(touched.brokerID && errors.brokerID)}
                                                            fullWidth
                                                            helperText={touched.brokerID && errors.brokerID}
                                                            name="brokerID"
                                                            onBlur={handleBlur}
                                                            onChange={e => handleChange(e)}
                                                            value={gradeWiseSummaryReportDetails.brokerID}
                                                            variant="outlined"
                                                            size='small'
                                                            id="brokerID"
                                                        >
                                                            <MenuItem value={'0'}>
                                                                --Select Broker--
                                                            </MenuItem>
                                                            {generateDropDownMenu(brokers)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={3} xs={12}>
                                                      <InputLabel shrink id="buyerID">
                                                        Buyer 
                                                      </InputLabel>
                                                      <TextField select
                                                        error={Boolean(touched.buyerID && errors.buyerID)}
                                                        fullWidth
                                                        helperText={touched.buyerID && errors.buyerID}
                                                        name="buyerID"
                                                        onChange={(e) => handleChange(e)}
                                                        value={gradeWiseSummaryReportDetails.buyerID}
                                                        size='small'
                                                        variant="outlined"
                                                        id="buyerID"
                                                      >
                                                        <MenuItem value="0">--Select Buyer--</MenuItem>
                                                        {generateDropDownMenu(buyers)}
                                                      </TextField>
                                                    </Grid>

                                                    <Grid item md={3} xs={12}>
                                                      <InputLabel shrink id="sellingMark">
                                                        Selling Mark
                                                      </InputLabel>
                                                      <TextField
                                                        select
                                                        error={Boolean(
                                                          touched.sellingMarkID && errors.sellingMarkID
                                                        )}
                                                        fullWidth
                                                        helperText={
                                                          touched.sellingMarkID && errors.sellingMarkID
                                                        }
                                                        name="sellingMarkID"
                                                        onBlur={handleBlur}
                                                        onChange={e => handleChange(e)}
                                                        value={gradeWiseSummaryReportDetails.sellingMarkID}
                                                        variant="outlined"
                                                        id="sellingMarkID"
                                                        size='small'
                                                      >
                                                        <MenuItem value={'0'}>
                                                          --Select Selling Mark--
                                                        </MenuItem>

                                                        {generateDropDownMenu(sellingMarks)}
                                                      </TextField>
                                                    </Grid>

                                                </Grid>
                                                <Box display="flex" flexDirection="row-reverse" p={2}>
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
                                                {gradeWiseSummaryDetails.length > 0 ?
                                                    <TableContainer >
                                                        <Table aria-label="caption table">
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell align={'left'}>Grade</TableCell>
                                                                    <TableCell align={'right'}>Net Qty (Kg)</TableCell>
                                                                    <TableCell align={'right'}>Proceeds (Rs)</TableCell>
                                                                    <TableCell align={'right'}>Quantity %</TableCell>
                                                                    <TableCell align={'right'}>Average (Rs)</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {gradeWiseSummaryDetails.map((data, index) => (
                                                                    <TableRow key={index}
                                                                    >
                                                                        <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                            {data.grade}
                                                                        </TableCell>
                                                                        <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                            {data.netQuantity}
                                                                        </TableCell>
                                                                        <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                            {data.proceeds}
                                                                        </TableCell>
                                                                        <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                            {data.quantity.toFixed(2) + '%'}
                                                                        </TableCell>
                                                                        <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                            {data.average.toFixed(2)}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                            <TableRow style={{ background: '#ADD8E6' }}>
                                                                <TableCell
                                                                    align={'left'}
                                                                    component="th"
                                                                    scope="row"
                                                                    style={{ fontWeight: 'bold' }}
                                                                >
                                                                    Total
                                                                </TableCell>
                                                                <TableCell
                                                                    align={'right'}
                                                                    component="th"
                                                                    scope="row"
                                                                    style={{ borderBottom: 'none', fontWeight: 'bold' }}
                                                                >{grandTotal.quantityTotal}
                                                                </TableCell>
                                                                <TableCell
                                                                    align={'right'}
                                                                    component="th"
                                                                    scope="row"
                                                                    style={{ borderBottom: 'none', fontWeight: 'bold' }}
                                                                    
                                                                 >{grandTotal.proceedsTotal}
                                                                </TableCell>

                                                                <TableCell
                                                                    align={'center'}
                                                                    component="th"
                                                                    scope="row"
                                                                    style={{ borderBottom: 'none' }}
                                                                >
                                                                </TableCell>
                                                                <TableCell
                                                                    align={'right'}
                                                                    component="th"
                                                                    scope="row"
                                                                    style={{ borderBottom: 'none' }}
                                                                >
                                                                
                                                                </TableCell>
                                                            </TableRow>
                                                            
                                                            <TableRow style={{ background: '#ADD8E6' }}>
                                                                <TableCell
                                                                    align={'left'}
                                                                    component="th"
                                                                    scope="row"
                                                                    style={{ fontWeight: 'bold' }}
                                                                >
                                                                    Main Grade
                                                                </TableCell>
                                                                <TableCell
                                                                    align={'right'}
                                                                    component="th"
                                                                    scope="row"
                                                                    style={{ borderBottom: 'none', fontWeight: 'bold' }}
                                                                 >{mainGradeTotal.maintotalQuantity}
                                                                </TableCell>
                                                                <TableCell
                                                                    align={'right'}
                                                                    component="th"
                                                                    scope="row"
                                                                    style={{ borderBottom: 'none', fontWeight: 'bold' }}
                                                                    
                                                                >{mainGradeTotal.maintotalProceeds}
                                                                </TableCell>

                                                                <TableCell
                                                                    align={'right'}
                                                                    component="th"
                                                                    scope="row"
                                                                    style={{ borderBottom: 'none', fontWeight: 'bold' }}
                                                                >
                                                                {mainGradeTotal.mainGradeQtyPercentage.toFixed(2)}
                                                                </TableCell>
                                                                <TableCell
                                                                    align={'right'}
                                                                    component="th"
                                                                    scope="row"
                                                                    style={{ borderBottom: 'none', fontWeight: 'bold' }}
                                                                >
                                                                {mainGradeTotal.mainGradeAvgPercentage.toFixed(2)}
                                                                </TableCell>
                                                            </TableRow>
                                                            <TableRow style={{ background: '#ADD8E6' }}>
                                                                <TableCell
                                                                    align={'left'}
                                                                    component="th"
                                                                    scope="row"
                                                                    style={{ fontWeight: 'bold' }}
                                                                >
                                                                    Off Grade
                                                                </TableCell>
                                                                <TableCell
                                                                    align={'right'}
                                                                    component="th"
                                                                    scope="row"
                                                                    style={{ borderBottom: 'none', fontWeight: 'bold' }}
                                                                >{offGradeTotal.offtotalQuantity}
                                                                </TableCell>
                                                                <TableCell
                                                                    align={'right'}
                                                                    component="th"
                                                                    scope="row"
                                                                    style={{ borderBottom: 'none', fontWeight: 'bold' }}
                                                                    
                                                                 >{offGradeTotal.offtotalProceeds}
                                                                </TableCell>

                                                                <TableCell
                                                                    align={'right'}
                                                                    component="th"
                                                                    scope="row"
                                                                    style={{ borderBottom: 'none', fontWeight: 'bold' }}
                                                                >
                                                                 {offGradeTotal.offGradeQtyPercentage.toFixed(2)}
                                                                </TableCell>
                                                                <TableCell
                                                                    align={'right'}
                                                                    component="th"
                                                                    scope="row"
                                                                    style={{ borderBottom: 'none', fontWeight: 'bold' }}
                                                                >
                                                                {offGradeTotal.offGradeAvgPercentage.toFixed(2)}
                                                                </TableCell>
                                                            </TableRow>
                                                        </Table>
                                                    </TableContainer>
                                                    : null}
                                            </Box>
                                            {gradeWiseSummaryDetails.length > 0 ? (
                                                <Box display="flex" justifyContent="flex-end" p={2}>
                                                    <Button
                                                        color="primary"
                                                        id="btnRecord"
                                                        type="submit"
                                                        variant="contained"
                                                        style={{ marginRight: '1rem' }}
                                                        className={classes.colorRecord}
                                                        onClick={() => createFile()}
                                                        size='small'
                                                    >
                                                        EXCEL
                                                    </Button>
                                                    <ReactToPrint
                                                        documentTitle={'Buyer Wise Grade Sales Report'}
                                                        trigger={() => (
                                                            <Button
                                                                color="primary"
                                                                id="btnRecord"
                                                                type="submit"
                                                                variant="contained"
                                                                style={{ marginRight: '1rem' }}
                                                                className={classes.colorCancel}
                                                                size='small'
                                                            >
                                                                PDF
                                                            </Button>
                                                        )}
                                                        content={() => componentRef.current}
                                                    />
                                                    <div hidden={true}>
                                                        <CreatePDF
                                                            ref={componentRef}
                                                            gradeWiseSummaryDetails={gradeWiseSummaryDetails}
                                                            searchData={selectedSearchValues}
                                                            grandTotal={grandTotal}
                                                            mainGradeTotal={mainGradeTotal}
                                                            offGradeTotal={offGradeTotal}
                                                        />
                                                    </div>
                                                </Box>
                                            ) : null}
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
