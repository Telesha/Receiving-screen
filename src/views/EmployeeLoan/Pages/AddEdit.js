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
    InputLabel,
    Typography
} from '@material-ui/core';
import {
    startOfMonth,
    endOfMonth,
    addMonths
} from 'date-fns';
import Page from 'src/components/Page';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Formik } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";
import DateRangeSelectorComponent from '../Utils/DateRangeSelector';
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import Popover from '@material-ui/core/Popover';
import EventIcon from '@material-ui/icons/Event';
import tokenDecoder from 'src/utils/tokenDecoder';
import moment from 'moment';
import { UserStatisticsComponent } from '../../UserStatistics/UserStatisticsExportComponent';
import { LoanInitiating } from '../Components/LoanInitiatingSendToApproveComponent';
import authService from '../../../utils/permissionAuth'
import tokenService from '../../../utils/tokenDecoder';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";
import { EmployeeAdvanceDetailsNewComponent } from './../../Common/EmployeeAdvanceDetailsNewComponent/EmployeeAdvanceDetailsNewComponentt';

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

const screenCode = 'EMPLOYEELOANREQUEST';
export default function EmployeeLoanRequest(props) {
    const [GroupList, setGroupList] = useState();
    const [FactoryList, setFactoryList] = useState();
    const [divisions, setDivisions] = useState();
    const [IsSearchPerformed, setIsSearchPerformed] = useState(false)
    const [IsCorrectUser, setIsCorrectUser] = useState(false);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [LoanTypes, setLoanTypes] = useState([]);
    const [isBackButtonVisible, setIsBackButtonVisible] = useState([]);

    const [employeeDetails, setEmployeeDetails] = useState({
        employeeName: "",
        divisionName: ""
    });

    const [DateRange, setDateRange] = useState({
        startDate: startOfMonth(addMonths(new Date(), -5)),
        endDate: endOfMonth(addMonths(new Date(), -0))
    });
    const [FormDetails, setFormDetails] = useState({
        groupID: tokenDecoder.getGroupIDFromToken(),
        factoryID: tokenDecoder.getFactoryIDFromToken(),
        divisionID: 0,
        searchDate: new Date().toISOString(),
        customerNIC: "",
        registrationNumber: ""
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
        isSendToApproveEnabled: true
    });
    const [UserBiometricDetails, setUserBiometricDetails] = useState({
        customerBiometricData: '',
        customerID: 0,
        firstName: '',
        lastName: '',
        nic: '',
        registrationNumber: '',
        secondName: '',
    });
    const [RelatedCustomerRegNumbers, setRelatedCustomerRegNumbers] = useState([]);
    const [SelectedCustomerRegNumber, setSelectedCustomerRegNumber] = useState();
    const alert = useAlert();
    const classes = useStyles();
    const navigate = useNavigate();
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
        trackPromise(getFactoryByGroupID(tokenDecoder.getGroupIDFromToken()));
    }, [])

    useEffect(() => {
        setIsSearchPerformed(false)
        setIsCorrectUser(false);
    }, [FormDetails.groupID, FormDetails.factoryID, FormDetails.customerNIC, FormDetails.registrationNumber, DateRange.startDate, DateRange.endDate])

    useEffect(() => {
        if (FormDetails.factoryID > 0) {
            trackPromise(
                getDivisionsForDropDown(FormDetails.factoryID),
            )
        }
    }, [FormDetails.factoryID]);

    useEffect(() => {
        if (FormDetails.divisionID !== 0) {
            setFormDetails({
                ...FormDetails,
                registrationNumber: "",
            });
        }
    }, [FormDetails.divisionID]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode === 'SENDTOAPPROVEEMPLOYEELOANREQUEST');

        if (isAuthorized === undefined) {
            navigate('/404');
        }

        var isGroupFilterEnabled = permissions.find(p => p.permissionCode === 'GROUPDROPDOWN');
        var isFactoryFilterEnabled = permissions.find(p => p.permissionCode === 'FACTORYDROPDOWN');
        var isSendToApproveEnabled = permissions.find(p => p.permissionCode === 'SENDTOAPPROVEEMPLOYEELOANREQUEST');

        setPermissions({
            ...permissionList,
            isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
            isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
            isSendToApproveEnabled: isSendToApproveEnabled !== undefined
        });

        setFormDetails({
            ...FormDetails,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
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
            </Grid>
        )
    }

    async function HandleSearch() {
        trackPromise(GetUserDetails())
    }

    async function GetUserDetails() {

        getEmployeeDetailsNameAndDivisionName(FormDetails.factoryID, FormDetails.divisionID, FormDetails.registrationNumber);

        let userDetailsObject = {
            groupID: FormDetails.groupID === null | 0 ? null : parseInt(FormDetails.groupID),
            factoryID: FormDetails.factoryID === null | 0 ? null : parseInt(FormDetails.factoryID),
            divisionID: FormDetails.divisionID === null | 0 ? null : parseInt(FormDetails.divisionID),
            registrationNumber: FormDetails.registrationNumber === "" ? null : FormDetails.registrationNumber.toString(),
            searchDate: DateRange.searchDate === null ? null : moment(FormDetails.searchDate).format(),
        };
        setSelectedCustomerRegNumber(userDetailsObject.registrationNumber === null ? 0 : userDetailsObject.registrationNumber)
        await SearchUserDetails(userDetailsObject);
    }

    async function SearchUserDetails(userDetailsObject) {
        try {
            if (userDetailsObject.registrationNumber === null) {
                alert.error("Please Provide Registration Number");
            } else {
                const value = await trackPromise(GetUserGeneralDetails(userDetailsObject));

                if (value.status === true && value.isActive === true) {
                    setIsSearchPerformed(true);
                    setUserBasicDetails({
                        ...userBasicDetails,
                        GroupID: userDetailsObject.groupID,
                        FactoryID: userDetailsObject.factoryID,
                        divisionID: userDetailsObject.divisionID,
                        registrationNumber: userDetailsObject.registrationNumber,
                        NIC: value.nic,
                        searchDate: userDetailsObject.searchDate
                    });
                    setIsCorrectUser(true);
                } else {
                    alert.error("Please provide correct user details");
                }
            }
        } catch (error) {
            alert.error("Please provide correct Employee Number");
            ClearUserFields(setFormDetails);
        }
    }


    async function GetCustomerRelatedRegNumbers(userDetailsObject) {
        const response = await services.GetCustomerRelatedRegNumbers(userDetailsObject);
        setRelatedCustomerRegNumbers(response);
        if (response.length === 1) {
            setSelectedCustomerRegNumber(response[0].registrationNumber === "" ? 0 : parseInt(response[0].registrationNumber.toString()))
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

    async function getEmployeeDetailsNameAndDivisionName(factoryID, divisionID, registrationNumber) {
        var response = await services.getEmployeeDetailsNameAndDivisionName(factoryID, divisionID, registrationNumber);
        if (response.statusCode == "Success" && response.data != null) {
            var data = response.data;
            setEmployeeDetails({
                ...employeeDetails,
                employeeName: data.employeeName,
                divisionName: data.divisionName
            });
        }
    }

    async function GetUserGeneralDetails(customerDetails) {
        let resObject = {
            status: '',
            isActive: true,
            nic: '',
        }
        const result = await services.GetEmployeeBiometricDetails(customerDetails);
        if (result.statusCode === "Error") {
            setIsCorrectUser(false);

            resObject.status = false;
            resObject.isActive = true;
            resObject.nic = '';
            return resObject;
        } else {
            resObject.status = true;
            resObject.isActive = result.data.isActive;
            resObject.nic = result.data.nic;
            return resObject;
        }
    }

    async function GetLoanTypes() {
        const response = await services.GetLoanTypeDetails();
        setLoanTypes(response);
    }

    const ClearUserFields = () => {
        setIsSearchPerformed(false);
        setFormDetails({
            ...FormDetails,
            registrationNumber: "",
            // divisionID: 0
        })
        setEmployeeDetails({
            ...employeeDetails,
            employeeName: "",
            divisionName: ""
        });

    }

    const ClearFields = () => {
        setIsSearchPerformed(false);
        setFormDetails({
            ...FormDetails,
            registrationNumber: "",
            divisionID: 0
        });

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
            <Page className={classes.root} title={"Employee Loan Request"}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: FormDetails.groupID,
                            factoryID: FormDetails.factoryID,
                            divisionID: FormDetails.divisionID,
                            registrationNumber: FormDetails.registrationNumber
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().min(1, "Please Select a Group").required('Group is required'),
                                factoryID: Yup.number().min(1, "Please Select a Factory").required('Factory is required'),
                                divisionID: Yup.number().min(1, "Please Select a Division").required('Division is required'),
                                registrationNumber: Yup.string().matches(/^[0-9\b]+$/, 'Only allow numbers').required('Employee Number is required')
                            })
                        }
                        enableReinitialize
                        onSubmit={HandleSearch}
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
                                            title={cardTitle("Employee Loan Request")}
                                        />
                                        <Divider />
                                        <CardContent>
                                            {IsSearchPerformed && (
                                                <Box display="flex" justifyContent="flex-end" p={2}>
                                                    <Button
                                                        color="secondary"
                                                        variant="contained"
                                                        size="small"
                                                        startIcon={<ArrowBackIcon />}
                                                        onClick={() => {
                                                            setIsSearchPerformed(false);
                                                            setIsCorrectUser(false);
                                                            setIsBackButtonVisible(false);
                                                            ClearFields();
                                                        }}
                                                    >

                                                    </Button>
                                                </Box>
                                            )}

                                            <Grid container className={classes.row} spacing={3}>


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
                                                        disabled={!permissionList.isGroupFilterEnabled}
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
                                                        disabled={!permissionList.isFactoryFilterEnabled}
                                                    >
                                                        <MenuItem value={'0'} disabled={true}>
                                                            --Select Estate--
                                                        </MenuItem>
                                                        {generateDropDownMenu(FactoryList)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="divisionID">
                                                        Division *
                                                    </InputLabel>
                                                    <TextField
                                                        select
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
                                                        disabled={IsSearchPerformed}
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
                                                            minDate={new Date()}
                                                            maxDate={new Date()}
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
                                                    />
                                                </Grid>
                                            </Grid>
                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                <Button
                                                    color="primary"
                                                    type="submit"
                                                    variant="contained"
                                                    size="small"
                                                >
                                                    Search
                                                </Button>
                                            </Box>


                                            <Grid container spacing={2}>
                                                <Grid item md={12} xs={12}>
                                                    {IsSearchPerformed === true && employeeDetails.employeeName != "" ? (
                                                        <Grid container spacing={1}>
                                                            <Grid item md={3} xs={12}>
                                                                <Typography style={{ fontSize: '16px' }} align="left"><b>Employee Name: </b> {employeeDetails.employeeName}</Typography>

                                                            </Grid>
                                                            <Grid item md={3} xs={12}>
                                                                <Typography style={{ fontSize: '16px' }} align="left"><b>Division Name: </b> {employeeDetails.divisionName}</Typography>
                                                            </Grid>
                                                        </Grid>
                                                    ) : null}
                                                    <br />
                                                    {IsSearchPerformed === true && FormDetails.registrationNumber != "" ?
                                                        <Grid container spacing={3}>
                                                            <Grid item md={12} xs={12}>
                                                                <Card>
                                                                    <CardContent>
                                                                        <EmployeeAdvanceDetailsNewComponent
                                                                            registrationNumber={FormDetails.registrationNumber}
                                                                            date={FormDetails.searchDate}
                                                                        />
                                                                    </CardContent>
                                                                </Card>
                                                            </Grid>
                                                        </Grid>
                                                        : null}
                                                </Grid>
                                            </Grid>
                                            <Grid container spacing={2}>
                                                <Grid item md={12} xs={12}>
                                                    {IsSearchPerformed === true ?
                                                        <LoanInitiating
                                                            permissionList={permissionList}
                                                            userBasicDetails={userBasicDetails}
                                                            LoanTypes={LoanTypes}
                                                            clearFormFieldsParent={ClearUserFields}
                                                            clearFieldsParent={ClearFields}
                                                            RelatedCustomerRegNumbers={RelatedCustomerRegNumbers}
                                                            SelectedCustomerRegistrationNumber={SelectedCustomerRegNumber}
                                                            UserBiometricDetails={UserBiometricDetails}
                                                        />
                                                        : null}
                                                </Grid>
                                            </Grid>
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