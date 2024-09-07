import React, { useState, useEffect, Fragment } from 'react';
import {
    Box,
    Card,
    Button,
    makeStyles,
    Container,
    Divider,
    CardContent,
    CardHeader,
    Grid,
    TextField,
    MenuItem,
    InputLabel
} from '@material-ui/core';
import {
    startOfMonth,
    endOfMonth,
    addMonths
} from 'date-fns';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from "yup";
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import DateRangeSelectorComponent from '../Utils/DateRangeSelector';
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import Popover from '@material-ui/core/Popover';
import EventIcon from '@material-ui/icons/Event';
import tokenDecoder from 'src/utils/tokenDecoder';
import moment from 'moment';
import { UserStatisticsComponent } from '../../UserStatistics/UserStatisticsExportComponent';
import { LoanInitiating } from '../Components/LoanInitiatingApproveRejectComponent';
import authService from '../../../utils/permissionAuth'
import tokenService from '../../../utils/tokenDecoder';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.dark,
        minHeight: '100%',
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3)
    },
    row: {
        marginTop: '1rem'
    }
}));

const screenCode = 'LOANREQUESTAPPROVEREJECTISSUE';
export default function EmployeeLoanRequestApprovalReject(props) {
    let decryptedEmployeeLoanID = 0;
    const [EncryptedLoanID, setEncryptedLoanID] = useState();
    const [IsNewRequestPerforming, setIsNewRequestPerforming] = useState(true)
    const { employeeLoanID } = useParams();
    const [GroupList, setGroupList] = useState();
    const [FactoryList, setFactoryList] = useState();
    const [divisions, setDivisions] = useState();
    const [IsSearchPerformed, setIsSearchPerformed] = useState(false)
    const [IsCorrectUser, setIsCorrectUser] = useState(false);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [LoanTypes, setLoanTypes] = useState([]);
    const [IsDefaultExpand, setIsDefaultExpand] = useState(true);
    const [IsViewOnly, setIsViewOnly] = useState(true);
    const [IsButtonDisabled, setIsButtonDisabled] = useState(false);
    const [UserBiometricDetailss, setUserBiometricDetails] = useState({
        customerBiometricData: 'ss',
        customerID: '',
        firstName: '',
        lastName: '',
        nic: '',
        registrationNumber: '',
        secondName: '',
    });
    const [DateRange, setDateRange] = useState({
        startDate: startOfMonth(addMonths(new Date(), -5)),
        endDate: endOfMonth(addMonths(new Date(), -0))
    });
    const [FormDetails, setFormDetails] = useState({
        groupID: tokenDecoder.getGroupIDFromToken(),
        factoryID: tokenDecoder.getFactoryIDFromToken(),
        divisionID: 0,
        employeeNIC: "",
        registrationNumber: "",
        searchDate: new Date(),
        statusID: 0
    });
    const [userBasicDetails, setUserBasicDetails] = useState({
        FactoryID: parseInt(FormDetails.factoryID),
        GroupID: parseInt(FormDetails.groupID),
        divisionID: 0,
        NIC: null,
        registrationNumber: '',
        searchDate: new Date(),
    })
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: true,
        isFactoryFilterEnabled: true,
        isApproveRejectEnabled: true,
        isLoanIssueEnabled: true,
        isViewEnabled: true
    });
    const [LoanDetails, setLoanDetails] = useState({
        annualRate: "",
        employeeLoanID: "",
        employeeNIC: "",
        factoryID: "",
        groupID: "",
        loanType: 0,
        numberOfInstalments: "",
        principalAmount: "",
        purpose: "",
        registrationNumber: "",
        statusID: "",
        disbursementType: 0,
        remarks: "",
        capitalOutstanding: "",
        numberOfCompletedInstalments: "",
        isNonPerforming: "",
        NumberOfHoldMonths: ""
    });


    const [Remarks, setRemarks] = useState(LoanDetails.remarks === "" ? null : (LoanDetails.remarks == null ? LoanDetails.remarks : (LoanDetails.remarks.split('-')[1] == " null" ? LoanDetails.remarks.split(':-')[0] : LoanDetails.remarks)));
    const [LoanTransactionDetails, setLoanTransactionDetails] = useState([]);
    const [LoanArrearsDetails, setLoanArrearsDetails] = useState([])
    const alert = useAlert();
    const classes = useStyles();
    const navigate = useNavigate();
    const handleClick = () => {
        IsNewRequestPerforming === true ?
            navigate('/app/dashboard') :
            navigate('/app/employeeLoan/listing')
    };
    const loadFactory = (event) => {
        trackPromise(getFactoryByGroupID(event.target.value));
    };
    const loadDivision = (event) => {
        trackPromise(getDivisionsForDropDown(event.target.value));
    };
    const handleClickPop = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;


    useEffect(() => {
        trackPromise(getPermission())
        trackPromise(getAllGroups());
        trackPromise(GetLoanTypes());
        if (IsNewRequestPerforming === true) {
            trackPromise(getFactoryByGroupID(tokenDecoder.getGroupIDFromToken()));
        }
    }, [])

    useEffect(() => {
        setIsSearchPerformed(false)
        setIsCorrectUser(false);
    }, [FormDetails.groupID, FormDetails.factoryID, FormDetails.employeeNIC, FormDetails.registrationNumber, FormDetails.searchDate])

    useEffect(() => {
        if (FormDetails.factoryID > 0) {
            trackPromise(
                getDivisionsForDropDown(FormDetails.factoryID),
            )
        }
    }, [FormDetails.factoryID]);

    useEffect(() => {
        let decrypter = atob(employeeLoanID.toString());

        let splitIds = decrypter.split("-");
        decryptedEmployeeLoanID = splitIds[0];
        if (splitIds.length === 1) {
            setIsViewOnly(false)
        } else {
            setIsViewOnly(true);
        }

        if (decryptedEmployeeLoanID != 0) {
            setIsNewRequestPerforming(false);
            setIsSearchPerformed(true);
            setIsCorrectUser(true);
            trackPromise(LoadEmployeeLoanDetailsByLoanID());
            setEncryptedLoanID(decryptedEmployeeLoanID);
            setIsDefaultExpand(false);
        }
    }, []);

    async function LoadEmployeeLoanDetailsByLoanID() {
        await GetEmployeeLoanApprovalDetails(decryptedEmployeeLoanID);
    }


    async function GetEmployeeLoanTransactionDetails(employeeLoanID) {
        const response = await services.GetEmployeeLoanTransactionDetails(employeeLoanID);
        response.length > 0 ? setLoanTransactionDetails(response) : setLoanTransactionDetails(null)
    }

    async function GetEmployeeLoanArrearsDetails(employeeLoanID) {
        const response = await services.GetEmployeeLoanArrearsDetails(employeeLoanID);
        response.length > 0 ? setLoanArrearsDetails(response) : setLoanArrearsDetails(null)
    }

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode === 'VIEWLOANREQUESTAPPROVEREJECTISSUE' || p.permissionCode === 'APPROVEREJECTLOANREQUEST' || p.permissionCode === 'ISSUELOANREQUEST');

        if (isAuthorized === undefined) {
            navigate('/404');
        }

        var isGroupFilterEnabled = permissions.find(p => p.permissionCode === 'GROUPDROPDOWN');
        var isFactoryFilterEnabled = permissions.find(p => p.permissionCode === 'FACTORYDROPDOWN');
        var isApproveRejectEnabled = permissions.find(p => p.permissionCode === 'APPROVEREJECTLOANREQUEST');
        var isLoanIssueEnabled = permissions.find(p => p.permissionCode === 'ISSUELOANREQUEST');
        var isViewEnabled = permissions.find(p => p.permissionCode === 'VIEWLOANREQUESTAPPROVEREJECTISSUE');

        setPermissions({
            ...permissionList,
            isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
            isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
            isApproveRejectEnabled: isApproveRejectEnabled !== undefined,
            isLoanIssueEnabled: isLoanIssueEnabled !== undefined,
            isViewEnabled: isViewEnabled !== undefined,
        });

        setFormDetails({
            ...FormDetails,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function GetEmployeeLoanApprovalDetails(employeeLoanID) {
        const response = await services.GetEmployeeLoanApprovalDetails(employeeLoanID);
        setLoanDetails(response)
        setFormDetails({
            ...FormDetails,
            registrationNumber: response.registrationNumber,
            employeeNIC: response.employeeNIC,
            divisionID: response.divisionID,
            factoryID: response.factoryID,
            groupID: response.groupID,
            statusID: response.statusID
        })

        let userDetailsObject = {
            groupID: parseInt(response.groupID),
            factoryID: parseInt(response.factoryID),
            divisionID: parseInt(response.divisionID),
            employeeNIC: response.employeeNIC.toString(),
            registrationNumber: response.registrationNumber.toString(),
            searchDate: FormDetails.searchDate === null ? null : moment(FormDetails.searchDate).format(),
        };

        if (response.statusID === 4) {
            trackPromise(GetEmployeeLoanTransactionDetails(decryptedEmployeeLoanID));
            trackPromise(GetEmployeeLoanArrearsDetails(decryptedEmployeeLoanID));
        }

        trackPromise(getFactoryByGroupID(parseInt(response.groupID)));
        SearchUserDetails(userDetailsObject)
    }

    function handleChange1(e) {
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
                {
                    IsNewRequestPerforming === false ?
                        <Grid item md={2} xs={12}>
                            <PageHeader
                                onClick={handleClick}

                            />
                        </Grid>
                        : null
                }
            </Grid>
        )
    }

    async function GetUserDetails() {

        let userDetailsObject = {
            groupID: FormDetails.groupID === null | 0 ? null : parseInt(FormDetails.groupID),
            factoryID: FormDetails.factoryID === null | 0 ? null : parseInt(FormDetails.factoryID),
            divisionID: FormDetails.divisionID === null | 0 ? null : parseInt(FormDetails.divisionID),
            employeeNIC: FormDetails.employeeNIC === "" ? null : FormDetails.employeeNIC.toString(),
            registrationNumber: FormDetails.registrationNumber === "" ? null : FormDetails.registrationNumber.toString(),
            searchDate: FormDetails.searchDate === null ? null : moment(FormDetails.searchDate).format()
        };

        await SearchUserDetails(userDetailsObject)
    }

    async function handleApproveLoanRequest() {
        trackPromise(ApproveLoanRequest());
    }

    async function ApproveLoanRequest() {
        setIsButtonDisabled(true);
        let approveObject = {
            employeeLoanID: LoanDetails.employeeLoanID,
            modifiedBy: tokenDecoder.getUserIDFromToken(),
            remarks: Remarks === "" ? null : ("Approve :- " + Remarks),
            result: -1
        }
        const resposnse = await services.ApproveEmployeeLoanRequest(approveObject);
        if (resposnse.statusCode == "Success") {
            alert.success(resposnse.message);
            setTimeout(() => { navigate('/app/employeeLoan/listing'); }, 1000)
        }
        else {
            setIsButtonDisabled(false);
            alert.error(resposnse.message);
        }
    }

    async function SearchUserDetails(userDetailsObject) {
        if (userDetailsObject.registrationNumber === null) {
            alert.error("Please Provide Registration Number");
        } else {

            trackPromise(GetUserGeneralDetails(userDetailsObject).then((value) => {
                if (value.status === true && value.isActive === true) {
                    setIsSearchPerformed(true);

                    setUserBasicDetails({
                        ...userBasicDetails,
                        GroupID: userDetailsObject.groupID,
                        FactoryID: userDetailsObject.factoryID,
                        divisionID: userDetailsObject.divisionID,
                        registrationNumber: userDetailsObject.registrationNumber,
                        NIC: userDetailsObject.employeeNIC,
                        searchDate: userDetailsObject.searchDate
                    });
                    setIsCorrectUser(true);
                } else {
                    setIsSearchPerformed(false)
                    setIsCorrectUser(false);
                    value.isActive === false ? alert.error("This customer is Inactive") :
                        alert.error("Please provide correct user details")
                }
            }));
        }
    }

    async function getAllGroups() {
        var response = await services.GetAllGroups();
        setGroupList(response);
    };

    async function getFactoryByGroupID(groupID) {
        var response = await services.GetFactoryByGroupID(groupID);
        setFactoryList(response);
    };

    async function getDivisionsForDropDown(factoryID) {
        const divisions = await services.getDivisionDetailsByEstateID(factoryID);
        setDivisions(divisions);
    }

    async function GetUserGeneralDetails(customerDetails) {
        let resObject = {
            status: '',
            isActive: true
        }
        const result = await services.GetEmployeeBiometricDetails(customerDetails);
        if (result.statusCode === "Error") {
            setIsCorrectUser(false);

            resObject.status = false;
            resObject.isActive = true;

            return resObject;
        } else {
            setUserBiometricDetails(result.data);
            resObject.status = true;
            resObject.isActive = result.data.isActive;

            return resObject;
        }
    }

    async function GetLoanTypes() {
        const response = await services.GetLoanTypeDetails();
        setLoanTypes(response);
    }

    function handleDateChange(value, field) {
        setFormDetails({
            ...FormDetails,
            searchDate: value
        });
    }

    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={"Loan Request AP"}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: FormDetails.groupID,
                            factoryID: FormDetails.factoryID,
                            divisionID: FormDetails.divisionID,
                            //customerNIC: FormDetails.customerNIC,
                            registrationNumber: FormDetails.registrationNumber
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().min(1, "Please Select a Group").required('Group is required'),
                                factoryID: Yup.number().min(1, "Please Select a Factory").required('Factory is required'),
                                divisionID: Yup.number().min(1, "Please Select a Division").required('Division is required'),
                                //customerNIC: Yup.string().matches(/^(\d{9}[vVxX]|\d{12})$/s, 'Entered NIC not valid'),
                                registrationNumber: Yup.string().required('Registration Number is required')
                            })
                        }
                        enableReinitialize
                        onSubmit={GetUserDetails}
                    >
                        {({
                            errors,
                            handleBlur,
                            handleSubmit,
                            touched,
                            values,
                            isSubmitting
                        }) => (
                            <form onSubmit={handleSubmit}>
                                <Box mt={0}>
                                    <Card>
                                        <CardHeader
                                            title={cardTitle(IsViewOnly == true ? "View Employee Loan Request"
                                                : FormDetails.statusID == 1 ? "Approve Employee Loan Request"
                                                    : FormDetails.statusID == 2 ? "Issue Employee Loan Request" : "Employee Loan Request")}
                                        />
                                        <Divider />
                                        <CardContent>
                                            <Grid container className={classes.row} spacing={1}>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="groupID">
                                                        Group *
                                                    </InputLabel>

                                                    <TextField select
                                                        error={Boolean(touched.groupID && errors.groupID)}
                                                        fullWidth
                                                        helperText={touched.groupID && errors.groupID}
                                                        name="groupID"
                                                        size='small'
                                                        onBlur={handleBlur}
                                                        onChange={(e) => {
                                                            handleChange1(e)
                                                            loadFactory(e)
                                                        }}
                                                        value={FormDetails.groupID}
                                                        variant="outlined"
                                                        id="groupID"
                                                        disabled={!permissionList.isGroupFilterEnabled | !IsNewRequestPerforming}
                                                    >
                                                        <MenuItem value={'0'} disabled={true}>
                                                            --Select Group--
                                                        </MenuItem>
                                                        {generateDropDownMenu(GroupList)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="factoryID">
                                                        Estate *
                                                    </InputLabel>

                                                    <TextField select
                                                        error={Boolean(touched.factoryID && errors.factoryID)}
                                                        fullWidth
                                                        helperText={touched.factoryID && errors.factoryID}
                                                        name="factoryID"
                                                        size='small'
                                                        onBlur={handleBlur}
                                                        onChange={(e) => {
                                                            handleChange1(e)
                                                            loadDivision(e)
                                                        }}
                                                        value={FormDetails.factoryID}
                                                        variant="outlined"
                                                        id="factoryID"
                                                        disabled={!permissionList.isFactoryFilterEnabled | !IsNewRequestPerforming}
                                                    >
                                                        <MenuItem value={'0'} disabled={true}>
                                                            --Select Factory--
                                                        </MenuItem>
                                                        {generateDropDownMenu(FactoryList)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="divisionID">
                                                        Division *
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.divisionID && errors.divisionID)}
                                                        fullWidth
                                                        helperText={touched.divisionID && errors.divisionID}
                                                        size='small'
                                                        onBlur={handleBlur}
                                                        id="divisionID"
                                                        name="divisionID"
                                                        value={FormDetails.divisionID}
                                                        type="text"
                                                        variant="outlined"
                                                        onChange={(e) => handleChange1(e)}
                                                        disabled={!IsNewRequestPerforming}
                                                    >
                                                        <MenuItem value='0'>--Select Division--</MenuItem>
                                                        {generateDropDownMenu(divisions)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="searchDate">
                                                        Date *
                                                    </InputLabel>
                                                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                        <KeyboardDatePicker
                                                            error={Boolean(touched.searchDate && errors.searchDate)}
                                                            helperText={touched.searchDate && errors.searchDate}
                                                            autoOk
                                                            fullWidth
                                                            variant="inline"
                                                            format="dd/MM/yyyy"
                                                            margin="dense"
                                                            id="searchDate"
                                                            name="searchDate"
                                                            value={FormDetails.searchDate}
                                                            onChange={(e) => handleDateChange(e, "searchDate")}
                                                            KeyboardButtonProps={{
                                                                'aria-label': 'change date',
                                                            }}
                                                            disabled={!IsNewRequestPerforming}
                                                        />
                                                    </MuiPickersUtilsProvider>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="registrationNumber">
                                                        Employee No *
                                                    </InputLabel>

                                                    <TextField
                                                        error={Boolean(touched.registrationNumber && errors.registrationNumber)}
                                                        fullWidth
                                                        helperText={touched.registrationNumber && errors.registrationNumber}
                                                        name="registrationNumber"
                                                        size='small'
                                                        onBlur={handleBlur}
                                                        onChange={(e) => {
                                                            handleChange1(e)
                                                        }}
                                                        value={FormDetails.registrationNumber}
                                                        variant="outlined"
                                                        id="registrationNumber"
                                                        disabled={!IsNewRequestPerforming}
                                                    />
                                                </Grid>
                                                {/* <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="customerNIC">
                                                        NIC Number
                                                    </InputLabel>
                                                    <TextField
                                                        error={Boolean(touched.customerNIC && errors.customerNIC)}
                                                        fullWidth
                                                        helperText={touched.customerNIC && errors.customerNIC}
                                                        name="customerNIC"
                                                        size='small'
                                                        onBlur={handleBlur}
                                                        onChange={(e) => {
                                                            handleChange1(e)
                                                        }}
                                                        value={FormDetails.customerNIC}
                                                        variant="outlined"
                                                        id="customerNIC"
                                                        disabled={!IsNewRequestPerforming}
                                                    />
                                                </Grid> */}
                                            </Grid>
                                            {/* <Grid container className={classes.row} spacing={3}>
                                                <Grid item md={3} xs={12}>
                                                    <Button
                                                        aria-describedby={id}
                                                        variant="contained"
                                                        fullWidth
                                                        color="primary"
                                                        onClick={handleClickPop}
                                                        size="large"
                                                        endIcon={<EventIcon />}
                                                        disabled={!IsNewRequestPerforming}
                                                    >
                                                        {DateRange.startDate.toLocaleDateString() + " - " + DateRange.endDate.toLocaleDateString()}
                                                    </Button>
                                                    <Popover
                                                        id={id}
                                                        open={open}
                                                        anchorEl={anchorEl}
                                                        onClose={handleClose}
                                                        anchorOrigin={{
                                                            vertical: 'center',
                                                            horizontal: 'left',
                                                        }}
                                                        transformOrigin={{
                                                            vertical: 'top',
                                                            horizontal: 'left',
                                                        }}
                                                    >
                                                        <DateRangeSelectorComponent setDateRange={setDateRange} handleClose={handleClose} />
                                                    </Popover>
                                                </Grid>
                                            </Grid> */}
                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                <Button
                                                    color="primary"
                                                    type="submit"
                                                    variant="contained"
                                                    size="small"
                                                    disabled={!IsNewRequestPerforming}
                                                >
                                                    Search
                                                </Button>
                                            </Box>
                                            <Grid container spacing={2}>
                                                {/* <Grid item md={12} xs={12}>
                                                    {
                                                        IsSearchPerformed === true ?
                                                            <UserStatisticsComponent
                                                                UserDetails={userBasicDetails}
                                                            /> : null
                                                    }
                                                </Grid> */}
                                            </Grid>
                                            <Grid container spacing={2}>
                                                <Grid item md={12} xs={12}>
                                                    {
                                                        IsSearchPerformed === true ?
                                                            <LoanInitiating
                                                                permissionList={permissionList}
                                                                userBasicDetails={userBasicDetails}
                                                                IsNewRequestPerforming={IsNewRequestPerforming}
                                                                LoanTypes={LoanTypes}
                                                                FullLoanDetails={LoanDetails}
                                                                decryptedCustomerLoanID={decryptedEmployeeLoanID}
                                                                IsDefaultExpand={IsDefaultExpand}
                                                                IsViewOnly={IsViewOnly}
                                                                LoanTransactionDetails={LoanTransactionDetails}
                                                                LoanArrearsDetails={LoanArrearsDetails}
                                                            /> : null
                                                    }
                                                </Grid>
                                            </Grid>

                                            {IsViewOnly ?
                                                <Box display="flex" justifyContent="flex-end" p={2}>
                                                    {
                                                        <>
                                                            <Button
                                                                color="primary"
                                                                variant="contained"
                                                                className={classes.btnApprove}
                                                                disabled={!permissionList.isApproveRejectEnabled || LoanDetails.statusID === 2 || LoanDetails.statusID === 3 || LoanDetails.statusID === 4 || IsButtonDisabled}
                                                                onClick={handleApproveLoanRequest}
                                                            >
                                                                Approve
                                                            </Button>
                                                        </>
                                                    }
                                                </Box>
                                                : null}
                                        </CardContent>
                                    </Card>
                                </Box>
                            </form>
                        )}
                    </Formik>
                </Container>
            </Page>
        </Fragment>
    )
}
