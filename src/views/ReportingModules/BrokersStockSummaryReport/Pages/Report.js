import React, { useState, useEffect, Fragment, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Box,
    Card,
    Grid,
    Table,
    TableContainer,
    TableBody,
    TableCell,
    TableRow,
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
import { useAlert } from 'react-alert';
import xlsx from 'json-as-xlsx';
import ReactToPrint from 'react-to-print';
import CreatePDF from './CreatePDF';
import moment from 'moment';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";
import { AgriGenERPEnum } from 'src/views/Common/AgriGenERPEnum/AgriGenERPEnum';

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

const screenCode = 'BROKERSSTOCKSUMMARYREPORT';

export default function BrokersStockSummaryReport(props) {
    const [title, setTitle] = useState('Brokers Stock Summary Report');
    const agriGenERPEnum = new AgriGenERPEnum();
    const classes = useStyles();
    const [GroupList, setGroupList] = useState([]);
    const [FactoryList, setFactoryList] = useState([]);
    const [sellingMarks, setSellingMarks] = useState([]);
    const [brokers, setBrokers] = useState([]);
    const [brokersStockSummary, setBrokersStockSummary] = useState({
        groupID: 0,
        factoryID: 0,
        sellingMark: 0,
        brokerName: 0
    });
    const [reportData, setReportData] = useState([]);
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });
    const navigate = useNavigate();
    const alert = useAlert();
    const [csvHeaders, SetCsvHeaders] = useState([]);
    const componentRef = useRef();
    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupName: '',
        factoryName: '',
        startDate: '',
        endDate: '',
        sellingMark: 0,
        brokerName: 0,
    });
    const [startDateRange, setStartDateRange] = useState(new Date());
    const [endDateRange, setEndDateRange] = useState(new Date());

    const [grandTotal, setGrandTotal] = useState({
      openingBalance : 0,
      dispachQuantity : 0,
      catalogueQuantity : 0,
      pendingStock : 0,
      unsoldQuantity : 0,
      withdrawnQuantity : 0,
      returnQuantity : 0,
      denatureQuantity: 0,
      netBalanceStock: 0
    })

    useEffect(() => {
        trackPromise(getPermission());
        trackPromise(getGroupsForDropdown());
    }, []);

    useEffect(() => {
        if (brokersStockSummary.groupID > 0) {
            trackPromise(getFactoriesForDropdown());
        }
    }, [brokersStockSummary.groupID]);

    useEffect(() => {
        if (brokersStockSummary.factoryID > 0) {
            trackPromise(
                getSellingMarksForDropdown(),
                getBrokersForDropdown(),
            );
        }
    }, [brokersStockSummary.factoryID]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(
            p => p.permissionCode == 'VIEWBROKERSSTOCKSUMMARYREPORT'
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

        setBrokersStockSummary({
            ...brokersStockSummary,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        });
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroupList(groups);
    }

    async function getFactoriesForDropdown() {
        const factories = await services.getFactoryByGroupID(
            brokersStockSummary.groupID
        );
        setFactoryList(factories);
    }

    async function getSellingMarksForDropdown() {
        const sellingMarks = await services.GetSellingMarkList(brokersStockSummary.groupID, brokersStockSummary.factoryID);
        setSellingMarks(sellingMarks);
    }

    async function getBrokersForDropdown() {
        const brokers = await services.GetBrokerList(brokersStockSummary.groupID, brokersStockSummary.factoryID);
        setBrokers(brokers);
    }

    async function getBrokersStockSummaryData() {
        let model = {
            groupID: parseInt(brokersStockSummary.groupID),
            factoryID: parseInt(brokersStockSummary.factoryID),
            startDate: moment(startDateRange.toString()).format().split('T')[0],
            endDate: moment(endDateRange.toString()).format().split('T')[0],
            sellingMark: parseInt(brokersStockSummary.sellingMark),
            brokerID: parseInt(brokersStockSummary.brokerName)
        };

      const result = await services.getBrokersStockSummaryData(model);
      getSelectedDropdownValuesForReport(model);

      let openingBalance = 0;
      let dispachQuantity = 0;
      let catalogueQuantity = 0;
      let pendingStock = 0;
      let unsoldQuantity = 0;
      let withdrawnQuantity = 0;
      let returnQuantity = 0;
      let denatureQuantity = 0;
      let netBalanceStock = 0;

      result.data.forEach(x => {
        dispachQuantity += x.dispatchQuantity;
        openingBalance = x.openingBalance;
        if (agriGenERPEnum.InvoiceStatus.Catalogue == x.statusID) {
          catalogueQuantity += x.stockQuantity;
        }
        if (agriGenERPEnum.InvoiceStatus.Pending == x.statusID) {
          pendingStock += x.stockQuantity;
        }
        if (agriGenERPEnum.InvoiceStatus.Shutout == x.statusID) {
          unsoldQuantity += x.stockQuantity;
        }
        if (agriGenERPEnum.InvoiceStatus.Sold == x.statusID) {
          withdrawnQuantity += x.stockQuantity;
        }
        if (agriGenERPEnum.InvoiceStatus.UnSold == x.statusID) {
          returnQuantity += x.stockQuantity;
        }
        if (agriGenERPEnum.InvoiceStatus.Return == x.statusID) {
          denatureQuantity += x.stockQuantity;
        }
      });

      netBalanceStock = openingBalance + dispachQuantity +catalogueQuantity + pendingStock + unsoldQuantity + withdrawnQuantity + returnQuantity + denatureQuantity;

      setGrandTotal({
        ...grandTotal,
        openingBalance: openingBalance,
        dispachQuantity: dispachQuantity,
        catalogueQuantity: catalogueQuantity,
        pendingStock: pendingStock,
        unsoldQuantity: unsoldQuantity,
        withdrawnQuantity: withdrawnQuantity,
        returnQuantity: returnQuantity,
        denatureQuantity: denatureQuantity,
        netBalanceStock: netBalanceStock
      });

        setReportData(result.data);

        createDataForExcel(result.data);
        if (result.data.length == 0) {
            alert.error('No Records');
        }
    }

    async function createDataForExcel(array) {
        var res = [];
      if (array != null) {

          var vr = {
            'Description': 'Opening Stock (Kg)',
            'Value': grandTotal.openingBalance
          };
          res.push(vr);
          var vr = {
            'Description': 'Dispach Quantity (Kg)',
            'Value': grandTotal.dispachQuantity
          };
          res.push(vr);

          var vr = {
            'Description': 'Catalogue Quantity (Kg)',
            'Value': grandTotal.catalogueQuantity
          };
          res.push(vr);
          var vr = {
            'Description': 'Pending Stock (Kg)',
            'Value': grandTotal.pendingStock
          };
          res.push(vr);
          var vr = {
            'Description': 'Unsold Quantity (Kg)',
            'Value': grandTotal.unsoldQuantity
          };
          res.push(vr);
          var vr = {
            'Description': 'Withdrawn Quantity (Kg)',
            'Value': grandTotal.withdrawnQuantity
          };
          res.push(vr);
          var vr = {
            'Description': 'Return Quantity (Kg)',
            'Value': grandTotal.returnQuantity
          };
          res.push(vr);
          var vr = {
            'Description': 'Denature Quantity (Kg)',
            'Value': grandTotal.dispachQuantity
          };
          res.push(vr);
          var vr = {
            'Description': 'Net Balance Stock (Kg)',
            'Value': grandTotal.netBalanceStock
          };
          res.push(vr);
        }
        return res;
    }

    async function createFile() {
        var file = await createDataForExcel(reportData);
        var settings = {
            sheetName: 'Brokers Stock Summary Report',
            fileName:
                'Brokers Stock Summary Report ' +
                selectedSearchValues.groupName +
                ' - ' +
                selectedSearchValues.factoryName +
                ' - ' +
                selectedSearchValues.startDate +
                ' - ' +
                selectedSearchValues.endDate
        };

        let keys = Object.keys(file[0]);
        let tempcsvHeaders = csvHeaders;
        keys.map((sitem, i) => {
            tempcsvHeaders.push({ label: sitem, value: sitem });
        });

        let dataA = [
            {
                sheet: 'Brokers Stock Summary Report',
                columns: tempcsvHeaders,
                content: file
            }
        ];
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
        setBrokersStockSummary({
            ...brokersStockSummary,
            [e.target.name]: value
        });
        setReportData([]);
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        var startDate = moment(searchForm.startDate.toString()).format().split('T')[0];
        var endDate = moment(searchForm.endDate.toString()).format().split('T')[0];
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: GroupList[searchForm.groupID],
            factoryName: FactoryList[searchForm.factoryID],
            startDate: [startDate],
            endDate: [endDate],
            sellingMark: sellingMarks[searchForm.sellingMark],
            brokerName: brokers[searchForm.brokerID]
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
                    <Card>
                        <Formik
                            initialValues={{
                                groupID: brokersStockSummary.groupID,
                                factoryID: brokersStockSummary.factoryID,
                                sellingMark: brokersStockSummary.sellingMark,
                                brokerName: brokersStockSummary.brokerName
                            }}
                            validationSchema={Yup.object().shape({
                                groupID: Yup.number()
                                    .required('Group is required')
                                    .min('1', 'Group is required'),
                                factoryID: Yup.number()
                                    .required('Factory is required')
                                    .min('1', 'Factory is required')
                            })}
                            onSubmit={() => trackPromise(getBrokersStockSummaryData())}
                            enableReinitialize
                        >
                            {({ errors, handleBlur, handleSubmit, touched }) => (
                                <form onSubmit={handleSubmit}>
                                    <Box mt={0}>
                                        <CardHeader title={cardTitle(title)} />
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
                                                        value={brokersStockSummary.groupID}
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
                                                        size='small'
                                                        helperText={touched.factoryID && errors.factoryID}
                                                        name="factoryID"
                                                        onBlur={handleBlur}
                                                        onChange={e => handleChange(e)}
                                                        value={brokersStockSummary.factoryID}
                                                        variant="outlined"
                                                        id="factoryID"
                                                        disabled={!permissionList.isFactoryFilterEnabled}
                                                    >
                                                        <MenuItem value="0">--Select Factory--</MenuItem>
                                                        {generateDropDownMenu(FactoryList)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="date">From Date </InputLabel>
                                                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                        <KeyboardDatePicker
                                                            fullWidth
                                                            variant="inline"
                                                            format="dd/MM/yyyy"
                                                            margin="dense"
                                                            name='startDate'
                                                            id='startDate'
                                                            size='small'
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
                                                    <InputLabel shrink id="date">To Date </InputLabel>
                                                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                        <KeyboardDatePicker
                                                            fullWidth
                                                            variant="inline"
                                                            format="dd/MM/yyyy"
                                                            margin="dense"
                                                            name='startDate'
                                                            size='small'
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
                                            </Grid>
                                            <Grid container spacing={3}>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="factoryID">
                                                        Broker Name
                                                    </InputLabel>
                                                    <TextField
                                                        select
                                                        fullWidth
                                                        size='small'
                                                        name="brokerName"
                                                        onBlur={handleBlur}
                                                        onChange={e => handleChange(e)}
                                                        value={brokersStockSummary.brokerName}
                                                        variant="outlined"
                                                        id="factoryID"
                                                        disabled={!permissionList.isFactoryFilterEnabled}
                                                    >
                                                        <MenuItem value="0">--Select Broker Name--</MenuItem>
                                                        {generateDropDownMenu(brokers)}
                                                    </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                      <InputLabel shrink id="groupID">
                                                        Selling Mark
                                                      </InputLabel>
                                                      <TextField
                                                        select
                                                        fullWidth
                                                        name="sellingMark"
                                                        onBlur={handleBlur}
                                                        onChange={e => handleChange(e)}
                                                        value={brokersStockSummary.sellingMark}
                                                        variant="outlined"
                                                        id="sellingMark"
                                                        size='small'
                                                        disabled={!permissionList.isGroupFilterEnabled}
                                                      >
                                                        <MenuItem value="0">--Select Selling mark--</MenuItem>
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
                                    </Box>
                                </form>
                            )}
                        </Formik>
                        <PerfectScrollbar>
                            {reportData.length > 0 ? <Box>
                                <br></br>
                                <h3><center><u>Brokers Stock Summary Report</u></center></h3>
                                <div>&nbsp;</div>
                                <h4><center>{selectedSearchValues.groupName} - {selectedSearchValues.factoryName}</center></h4>
                                <h4><center>{selectedSearchValues.startDate} - {selectedSearchValues.endDate}</center></h4>
                                <h4><center>Selling Mark - {selectedSearchValues.sellingMark === undefined ? "All" : selectedSearchValues.sellingMark}</center></h4>
                                <h4><center>Broker Name - {selectedSearchValues.brokerName === undefined ? "All" : selectedSearchValues.brokerName} </center></h4>
                                <div>&nbsp;</div>
                                <hr />
                            </Box> : null}
                            {reportData.length > 0 ?
                                <TableContainer >
                                    <Table aria-label="caption table">
                                          <TableBody>
                                                <TableRow>
                                                  <TableCell align={'left'} width={"150px"} component="th" scope="row" style={{ borderBottom: "none" }}></TableCell>
                                                  <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none", fontWeight : 'bold' }}>
                                                    Description
                                                  </TableCell>
                                                  <TableCell align={'right'} width={"50px"} component="th" scope="row" style={{ borderBottom: "none", fontWeight : 'bold' }}>
                                                    Value
                                                  </TableCell>
                                                  <TableCell align={'left'} width={"150px"} component="th" scope="row" style={{ borderBottom: "none" }}></TableCell>
                                                </TableRow>
                                                <TableRow>
                                                  <TableCell align={'left'} width={"150px"} component="th" scope="row" style={{ borderBottom: "none" }}></TableCell>
                                                  <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                    Opening Stock (Kg)
                                                  </TableCell>
                                                  <TableCell align={'right'} width={"50px"} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                    {grandTotal.openingBalance}
                                                  </TableCell>
                                                  <TableCell align={'left'} width={"150px"} component="th" scope="row" style={{ borderBottom: "none" }}></TableCell>
                                                </TableRow>
                                                {/* <TableRow>
                                                  <TableCell align={'left'} width={"150px"} component="th" scope="row" style={{ borderBottom: "none" }}></TableCell>
                                                  <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                    Dispatch Quantity (Kg)
                                                  </TableCell>
                                                  <TableCell align={'right'} width={"50px"} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                    {grandTotal.dispachQuantity}
                                                  </TableCell>
                                                  <TableCell align={'left'} width={"150px"} component="th" scope="row" style={{ borderBottom: "none" }}></TableCell>
                                                </TableRow> */}
                                                <TableRow>
                                                  <TableCell align={'left'} width={"150px"} component="th" scope="row" style={{ borderBottom: "none" }}></TableCell>
                                                  <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                      Catalogue Quantity (Kg)
                                                  </TableCell>
                                                  <TableCell align={'right'} width={"50px"} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                      {grandTotal.catalogueQuantity}
                                                  </TableCell>
                                                  <TableCell align={'left'} width={"150px"} component="th" scope="row" style={{ borderBottom: "none" }}></TableCell>
                                                </TableRow>
                                                <TableRow>
                                                  <TableCell align={'left'} width={"150px"} component="th" scope="row" style={{ borderBottom: "none" }}></TableCell>
                                                  <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                      Pending Stock (Kg)
                                                    </TableCell>
                                                  <TableCell align={'right'} width={"50px"} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                      {grandTotal.pendingStock}
                                                  </TableCell>
                                                  <TableCell align={'left'} width={"150px"} component="th" scope="row" style={{ borderBottom: "none" }}></TableCell>
                                                </TableRow>
                                                {/* <TableRow>
                                                  <TableCell align={'left'} width={"150px"} component="th" scope="row" style={{ borderBottom: "none" }}></TableCell>
                                                  <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                      Unsold Quantity (Kg)
                                                  </TableCell>
                                                  <TableCell align={'right'} width={"50px"} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                      {grandTotal.unsoldQuantity}
                                                  </TableCell>
                                                  <TableCell align={'left'} width={"150px"} component="th" scope="row" style={{ borderBottom: "none" }}></TableCell>
                                                </TableRow> */}
                                                <TableRow>
                                                  <TableCell align={'left'} width={"150px"} component="th" scope="row" style={{ borderBottom: "none" }}></TableCell>
                                                  <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                      Withdrawn Quantity (Kg) 
                                                  </TableCell>
                                                  <TableCell align={'right'} width={"50px"} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                      {grandTotal.withdrawnQuantity}
                                                  </TableCell>
                                                  <TableCell align={'left'} width={"150px"} component="th" scope="row" style={{ borderBottom: "none" }}></TableCell>
                                                </TableRow>
                                                <TableRow>
                                                  <TableCell align={'left'} width={"150px"} component="th" scope="row" style={{ borderBottom: "none" }}></TableCell>
                                                  <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                      Return Quantity (Kg)
                                                  </TableCell>
                                                  <TableCell align={'right'} width={"50px"} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                      {grandTotal.returnQuantity}
                                                  </TableCell>
                                                  <TableCell align={'left'} width={"150px"} component="th" scope="row" style={{ borderBottom: "none" }}></TableCell>
                                                </TableRow>
                                                {/* <TableRow>
                                                  <TableCell align={'left'} width={"150px"} component="th" scope="row" style={{ borderBottom: "none" }}></TableCell>
                                                  <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                      Denature Quantity (Kg)
                                                  </TableCell>
                                                  <TableCell align={'right'} width={"50px"} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                      {grandTotal.denatureQuantity}
                                                  </TableCell>
                                                  <TableCell align={'left'} width={"150px"} component="th" scope="row" style={{ borderBottom: "none" }}></TableCell>
                                                </TableRow> */}
                                                <TableRow>
                                                  <TableCell align={'left'} width={"150px"} component="th" scope="row" style={{ borderBottom: "none" }}></TableCell>
                                                  <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none", fontWeight: 'bold' }}>
                                                    Net Balance Stock (Kg)
                                                  </TableCell>
                                                  <TableCell align={'right'} width={"50px"} component="th" scope="row" style={{ borderBottom: "none", fontWeight: 'bold' }}>
                                                    {grandTotal.netBalanceStock}
                                                  </TableCell>
                                                  <TableCell align={'left'} width={"150px"} component="th" scope="row" style={{ borderBottom: "none" }}></TableCell>
                                                 </TableRow>  
                                          </TableBody>
                                    </Table>
                                </TableContainer> : null}
                            <hr />
                            {reportData.length > 0 ? (
                                <Box display="flex" justifyContent="flex-end" p={2} >
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
                                        documentTitle={'Buyer Wise Sales Report'}
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
                                            reportData={grandTotal}
                                            searchData={selectedSearchValues}
                                        />
                                    </div>
                                </Box>
                            ) : null}
                        </PerfectScrollbar>
                    </Card>
                </Container>
            </Page>
        </Fragment>
    );
}
