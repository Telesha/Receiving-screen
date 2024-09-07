import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Box,
    Card,
    Grid,
    makeStyles,
    Container,
    CardContent,
    CardHeader,

} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from "yup";
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import Typography from '@material-ui/core/Typography';


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
}));

export default function HRViewEmployeeSalary(props) {
    const [title, setTitle] = useState("Employee Pay Sheet");
    const [isView, setIsView] = useState(false);
    const classes = useStyles();
    const [factories, setFactories] = useState();
    const [availableQuantity, setAvailableQuantity] = useState();
    const [groups, setGroups] = useState();
    const [routes, setRoutes] = useState();
    const [customers, setCustomers] = useState();
    const [customerList, setCustomerList] = useState();
    const [factoryItems, setFactoryItems] = useState();
    const [registrationNumbers, setRegistrationNumbers] = useState();
    const [unitPrice, setUnitPrice] = useState();
    const [factoryItemGRNS, setFactoryItemGRNS] = useState();
    const [factoryItemGrnList, setFactoryItemGrnList] = useState();
    const [totalPrice, setTotalPrice] = useState();
    const [factoryItemGrnArray, setFactoryItemGrnArray] = useState([]);
    const [fullArray, setFullArray] = useState([]);
    const [DisableUserFields, setDisableUserFields] = useState(true);
    const [tableData, setTableData] = useState([]);

    const [salaryAdjustmentAdditionList, setSalaryAdjustmentAdditionList] = useState([]);
    const [salaryAdjustmentDeductionList, setSalaryAdjustmentDeductionList] = useState([]);
    const [totalOTHoursWorked, setTotalOTHoursWorked] = useState({
        dayOTHours: 0,
        nightOTHours: 0,
        doubleOTHours: 0,
        employeeID: 0
    });

    let DayOTRate = 500;
    let NightOTRate = 1000;
    let DoubleOTRate = 1600;

    const [employeeSalaryData, setEmployeeSalaryData] = useState({
        employeeID: '',
        grossPay: '',
        netPay: '',
        addition: '',
        deduction: '',
        employeeNumber: '',
        month: '',
        year: '',
        userName: '',
        otherAllowance: '',
        specialAllowance: '',
        basicSalary: ''
    });
    const navigate = useNavigate();
    const passedData = useLocation();
    const handleClick = () => {
        navigate('/app/HRSalaryCalculation/listing');
    }
    const alert = useAlert();
    const { employeeID } = useParams();

    let decrypted = 0;


    useEffect(() => {
        getGroupsForDropdown();
    }, []);

    useEffect(() => {
        decrypted = atob(employeeID.toString());

        if (decrypted != 0) {
            trackPromise(
                getEmployeeSalary(decrypted)
            )
        }
    }, []);

    useEffect(() => {
        trackPromise(
            getfactoriesForDropDown()
        );
    }, [employeeSalaryData.groupID]);

    useEffect(() => {
        trackPromise(
            getAvailableGrnByFactoryItem()
        )
    }, [employeeSalaryData.factoryItem]);

    useEffect(() => {
        trackPromise(
            getFactoryItemsByFactoryID()

        )
    }, [employeeSalaryData.factoryID]);

    useEffect(() => {
        trackPromise(
            getRegistrationNumbersForDropDown()
        );
    }, [employeeSalaryData.customerID]);

    useEffect(() => {
    }, [employeeSalaryData.grnListID]);

    async function getAvailableGrnByFactoryItem() {
        const GRNS = await services.getAvailableGrnByFactoryItem(employeeSalaryData.factoryItem);
        setFactoryItemGRNS(GRNS);
    }

    async function getRegistrationNumbersForDropDown() {
        const registrationNList = await services.getRegistrationNumbersForDropDown(employeeSalaryData.customerID);
        setRegistrationNumbers(registrationNList);
    }
    async function getFactoryItemsByFactoryID() {
        const items = await services.getFactoryItemsByFactoryID(employeeSalaryData.factoryID);
        setFactoryItems(items);
    }

    async function getGroupsForDropdown() {
        const groups = await services.getGroupsForDropdown();
        setGroups(groups);
    }

    async function getfactoriesForDropDown() {
        const factory = await services.getfactoriesForDropDown(employeeSalaryData.groupID);
        setFactories(factory);
    }

    async function getEmployeeSalary(employeeID) {

        let response = await services.getEmployeeSalary(employeeID, passedData.state.employeeDetails.createdDate);

        const data = response.data;

        let viewModel = {
            employeeID: data.employeeCheckroleSalary[0].employeeID,
            grossPay: data.employeeCheckroleSalary[0].grossPay,
            netPay: data.employeeCheckroleSalary[0].netPay,
            addition: data.employeeCheckroleSalary[0].addition,
            deduction: data.employeeCheckroleSalary[0].deduction,
            employeeNumber: data.employeeCheckroleSalary[0].employeeNumber,
            month: data.employeeCheckroleSalary[0].month,
            year: data.employeeCheckroleSalary[0].year,
            userName: data.employeeCheckroleSalary[0].userName,
            otherAllowance: data.employeeCheckroleSalary[0].otherAllowance,
            specialAllowance: data.employeeCheckroleSalary[0].specialAllowance,
            basicSalary: data.employeeCheckroleSalary[0].basicSalary
        }

        let otHoursModel = {
            dayOTHours: data.otHoursSum[0].dayOTHours,
            nightOTHours: data.otHoursSum[0].nightOTHours,
            doubleOTHours: data.otHoursSum[0].doubleOTHours,
            employeeID: data.otHoursSum[0].employeeID

        }

        var PaySheetTitle = "Employee Pay Sheet: " + data.employeeCheckroleSalary[0].userName
        setTitle(PaySheetTitle);
        setEmployeeSalaryData({
            ...employeeSalaryData,
            employeeID: viewModel.employeeID,
            grossPay: viewModel.grossPay,
            netPay: viewModel.netPay,
            addition: viewModel.addition,
            deduction: viewModel.deduction,
            employeeNumber: viewModel.employeeNumber,
            month: viewModel.month,
            year: viewModel.year,
            userName: viewModel.userName,
            otherAllowance: viewModel.otherAllowance,
            specialAllowance: viewModel.specialAllowance,
            basicSalary: viewModel.basicSalary
        });


        setTotalOTHoursWorked({
            ...totalOTHoursWorked,
            dayOTHours: otHoursModel.dayOTHours,
            nightOTHours: otHoursModel.nightOTHours,
            doubleOTHours: otHoursModel.doubleOTHours,
            employeeID: otHoursModel.employeeID
        });
        setSalaryAdjustmentAdditionList(data.adjustmentListAddition);
        setSalaryAdjustmentDeductionList(data.adjustmentListDeduction);
        await getRecordesforTable(data.noOfInstallments, data.paymentEffectedMonth, data.totalPrice);
        setIsView(true);

        // /////////PRINT FUNCTION////////////
        // let printModel = {
        //     invoiceReceiptContent: data,
        //     isInvoiceReceiptPrint: true,
        //     invoiceReceiptType: 0,
        //     createdBy: 1
        // }

        // let printResponse = await services.savePrintReceipt(printModel);

        // if (printResponse.statusCode == "Success") {
        //     alert.success("Successfully sent to print");
        // }
        // else {
        //     alert.error("Print Error");
        // }
    }

    async function getRecordesforTable(noOfInstallments, paymentEffectedMonth, totalPrice) {
        let monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        var table = [];
        if (noOfInstallments > 0) {
            var month = parseInt(paymentEffectedMonth);
            for (var i = 0; i <= noOfInstallments - 1; i++) {
                var dataOBJ = {
                    monthName: monthNames[month - 1],
                    amount: totalPrice / noOfInstallments
                }
                table.push(dataOBJ);
                month++;
            }
        }
        setTableData(table);
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
                    <br></br>
                    <br></br>
                    <br></br>
                    <div align="center">

                        <Card style={{ borderStyle: "double" }} title='Employee Pay Sheet'>
                            <CardHeader
                                title={cardTitle(title)}
                            />
                            <br></br>
                            <br></br>

                            <CardContent style={{ justifyContent: "center" }} >

                                <Grid container spacing={1}>
                                    <Grid item md={7} xs={12}>
                                        <Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">Basic Salary</Typography>
                                        <Grid Grid container spacing={1}>
                                            <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left">{""}</Typography>
                                            <Grid Grid container spacing={1}>
                                                <Grid item md={9} xs={12} ><Typography style={{ marginLeft: "15rem" }} align="left">{""}</Typography></Grid>
                                                <Grid item md={3} xs={12} ><Typography style={{ marginTop: "-1.2rem", backgroundColor: "#e6ffe6" }} align="right">{employeeSalaryData.basicSalary}</Typography></Grid>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>

                                <br></br>


                                <Grid container spacing={1}>
                                    <Grid item md={7} xs={12}>
                                        <Typography variant='h5' style={{ marginLeft: "4rem", fontWeight: "bold" }} align="left">Salary Additions</Typography>
                                        <Grid Grid container spacing={1}>
                                            <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left">{""}</Typography>
                                            <Grid Grid container spacing={1}>
                                                <Grid item md={9} xs={12} ><Typography style={{ marginLeft: "15rem" }} align="left">{""}</Typography></Grid>
                                                <Grid item md={3} xs={12} ><Typography style={{ marginTop: "-1.2rem" }} align="right"></Typography></Grid>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>

                                <br />
                                {salaryAdjustmentAdditionList.map((additionData, index) => (
                                    <>
                                        <Grid container spacing={1} key={index}>
                                            <Grid item md={7} xs={12}>
                                                <Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">{additionData.reason}</Typography>
                                                <Grid Grid container spacing={1}>
                                                    <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left">{""}</Typography>
                                                    <Grid Grid container spacing={1}>
                                                        <Grid item md={9} xs={12} ><Typography style={{ marginLeft: "15rem" }} align="left">{""}</Typography></Grid>
                                                        <Grid item md={3} xs={12} ><Typography style={{ marginTop: "-1.2rem", backgroundColor: "#e6ffe6" }} align="right">{additionData.amount}</Typography></Grid>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                        <br></br>
                                    </>

                                ))}


                                <br></br>

                                <Grid container spacing={1}>
                                    <Grid item md={7} xs={12}>
                                        <Typography variant='h5' style={{ marginLeft: "4rem", fontWeight: "bold" }} align="left">Over Time</Typography>
                                        <Grid Grid container spacing={1}>
                                            <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left">{""}</Typography>
                                            <Grid Grid container spacing={1}>
                                                <Grid item md={9} xs={12} ><Typography style={{ marginLeft: "15rem" }} align="left">{""}</Typography></Grid>
                                                <Grid item md={3} xs={12} ><Typography style={{ marginTop: "-1.2rem" }} align="right"></Typography></Grid>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <br></br>
                                <Grid container spacing={1}>
                                    <Grid item md={7} xs={12}>
                                        <Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">Day OT (Rs{DayOTRate})</Typography>

                                        <Grid Grid container spacing={1}>
                                            <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left">{""}</Typography>
                                            <Grid Grid container spacing={1}>
                                                <Grid item md={9} xs={12} ><Typography style={{ marginLeft: "15rem" }} align="left">{""}</Typography></Grid>
                                                {totalOTHoursWorked.dayOTHours > 0 ? (<Grid item md={3} xs={12} ><Typography style={{ marginTop: "-1.2rem", backgroundColor: "#e6ffe6" }} align="right">{DayOTRate} x {totalOTHoursWorked.dayOTHours} = {Number(totalOTHoursWorked.dayOTHours) * Number(DayOTRate)}</Typography></Grid>) :
                                                    <Grid item md={3} xs={12} ><Typography style={{ marginTop: "-1.2rem", backgroundColor: "#e6ffe6" }} align="right">{DayOTRate} x 0 = {0 * Number(DayOTRate)}</Typography></Grid>}

                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>

                                <br />
                                <Grid container spacing={1}>
                                    <Grid item md={7} xs={12}>
                                        <Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">Night OT (Rs{NightOTRate})</Typography>
                                        <Grid Grid container spacing={1}>
                                            <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left">{""}</Typography>
                                            <Grid Grid container spacing={1}>
                                                <Grid item md={9} xs={12} ><Typography style={{ marginLeft: "15rem" }} align="left">{""}</Typography></Grid>
                                                <Grid item md={3} xs={12} ><Typography style={{ marginTop: "-1.2rem", backgroundColor: "#e6ffe6" }} align="right">{NightOTRate} x {totalOTHoursWorked.nightOTHours} = {Number(totalOTHoursWorked.nightOTHours) * Number(NightOTRate)}</Typography></Grid>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>

                                <br />
                                <Grid container spacing={1}>
                                    <Grid item md={7} xs={12}>
                                        <Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">Double OT (Rs{DoubleOTRate})</Typography>
                                        <Grid Grid container spacing={1}>
                                            <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left">{""}</Typography>
                                            <Grid Grid container spacing={1}>
                                                <Grid item md={9} xs={12} ><Typography style={{ marginLeft: "15rem" }} align="left">{""}</Typography></Grid>
                                                <Grid item md={3} xs={12} ><Typography style={{ marginTop: "-1.2rem", backgroundColor: "#e6ffe6" }} align="right">{DoubleOTRate} x {totalOTHoursWorked.doubleOTHours} = {Number(totalOTHoursWorked.doubleOTHours) * Number(DoubleOTRate)}</Typography></Grid>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>

                                <br />
                                <Grid container spacing={1}>
                                    <Grid item md={7} xs={12}>
                                        <Typography variant='h5' style={{ marginLeft: "4rem", fontWeight: "bold" }} align="left">Allowances</Typography>
                                        <Grid Grid container spacing={1}>
                                            <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left">{""}</Typography>
                                            <Grid Grid container spacing={1}>
                                                <Grid item md={9} xs={12} ><Typography style={{ marginLeft: "15rem" }} align="left">{""}</Typography></Grid>
                                                <Grid item md={3} xs={12} ><Typography style={{ marginTop: "-1.2rem" }} align="right"></Typography></Grid>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <br />


                                <Grid container spacing={1}>
                                    <Grid item md={7} xs={12}>
                                        <Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">Other Allowances</Typography>
                                        <Grid Grid container spacing={1}>
                                            <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left">{""}</Typography>
                                            <Grid Grid container spacing={1}>
                                                <Grid item md={9} xs={12} ><Typography style={{ marginLeft: "15rem" }} align="left">{""}</Typography></Grid>
                                                <Grid item md={3} xs={12} ><Typography style={{ marginTop: "-1.2rem", backgroundColor: "#e6ffe6" }} align="right">{employeeSalaryData.otherAllowance}</Typography></Grid>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>

                                <br />



                                <Grid container spacing={1}>
                                    <Grid item md={7} xs={12}>
                                        <Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">Special Allowances</Typography>
                                        <Grid Grid container spacing={1}>
                                            <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left">{""}</Typography>
                                            <Grid Grid container spacing={1}>
                                                <Grid item md={9} xs={12} ><Typography style={{ marginLeft: "15rem" }} align="left">{""}</Typography></Grid>
                                                <Grid item md={3} xs={12} ><Typography style={{ marginTop: "-1.2rem", backgroundColor: "#e6ffe6" }} align="right">{employeeSalaryData.specialAllowance}</Typography></Grid>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <br></br>
                                <hr></hr>

                                <Grid style={{ marginTop: "1rem" }} container spacing={1}>
                                    <Grid item md={7} xs={12}>
                                        <Typography variant='h5' style={{ marginLeft: "2rem", fontWeight: 'bold', fontSize: '18px' }} align="left">Gross Pay</Typography>
                                        <Grid Grid container spacing={1}>
                                            <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left">{""}</Typography>
                                            <Grid Grid container spacing={1}>
                                                <Grid item md={9} xs={12} ><Typography style={{ marginLeft: "15rem" }} align="left">{""}</Typography></Grid>
                                                <Grid item md={3} xs={12} ><Typography style={{ marginTop: "-1.2rem", fontWeight: "bold" }} align="right">{employeeSalaryData.grossPay}</Typography></Grid>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <br></br>
                                <hr></hr>
                                <br></br>

                                <Grid container spacing={1}>
                                    <Grid item md={7} xs={12}>
                                        <Typography variant='h5' style={{ marginLeft: "4rem", fontWeight: "bold" }} align="left">Salary Deductions</Typography>
                                        <Grid Grid container spacing={1}>
                                            <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left">{""}</Typography>
                                            <Grid Grid container spacing={1}>
                                                <Grid item md={9} xs={12} ><Typography style={{ marginLeft: "15rem" }} align="left">{""}</Typography></Grid>
                                                <Grid item md={3} xs={12} ><Typography style={{ marginTop: "-1.2rem" }} align="right"></Typography></Grid>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <br></br>


                                <br></br>

                                {salaryAdjustmentDeductionList.map((additionData, index) => (
                                    <>
                                        <Grid container spacing={1} key={index}>
                                            <Grid item md={7} xs={12}>
                                                <Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">{additionData.reason}</Typography>
                                                <Grid Grid container spacing={1}>
                                                    <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left">{""}</Typography>
                                                    <Grid Grid container spacing={1}>
                                                        <Grid item md={9} xs={12} ><Typography style={{ marginLeft: "15rem" }} align="left">{""}</Typography></Grid>
                                                        <Grid item md={3} xs={12} ><Typography style={{ marginTop: "-1.2rem", backgroundColor: "#ffcccb" }} align="right">{additionData.amount}</Typography></Grid>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                        <br></br>
                                    </>

                                ))}

                                <hr></hr>

                                <Grid style={{ marginTop: "1rem" }} container spacing={1}>
                                    <Grid item md={7} xs={12}>
                                        <Typography variant='h5' style={{ marginLeft: "2rem", fontWeight: 'bold', fontSize: '18px' }} align="left">Total Pay</Typography>
                                        <Grid Grid container spacing={1}>
                                            <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left">{""}</Typography>
                                            <Grid Grid container spacing={1}>
                                                <Grid item md={9} xs={12} ><Typography style={{ marginLeft: "15rem" }} align="left">{""}</Typography></Grid>
                                                <Grid item md={3} xs={12} ><Typography style={{ marginTop: "-1.2rem", fontWeight: "bold" }} align="right">{employeeSalaryData.netPay}</Typography></Grid>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <br></br>
                                <hr></hr>
                                <br></br>
                            </CardContent>

                        </Card>
                    </div>
                </Container>
            </Page>
        </Fragment >
    );
};
