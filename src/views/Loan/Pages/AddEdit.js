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
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Formik } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";
import DateRangeSelectorComponent from '../Utils/DateRangeSelector';
import { LoadingComponent } from './../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import Popover from '@material-ui/core/Popover';
import EventIcon from '@material-ui/icons/Event';
import tokenDecoder from 'src/utils/tokenDecoder';
import moment from 'moment';
import { UserStatisticsComponent } from './../../UserStatistics/UserStatisticsExportComponent';
import { LoanInitiating } from '../Components/LoanInitiatingSendToApproveComponent';
import authService from './../../../utils/permissionAuth'
import tokenService from '../../../utils/tokenDecoder';

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

const screenCode = 'LOANREQUEST';
export default function LoanRequest(props) {
    const [GroupList, setGroupList] = useState();
    const [FactoryList, setFactoryList] = useState();
    const [IsSearchPerformed, setIsSearchPerformed] = useState(false)
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [LoanTypes, setLoanTypes] = useState([]);
    const [MinMonth, setMinMonth] = useState(new Date());
    const [customerDetails, setCustomerDetails] = useState({
        customerName: "",
        routeName: ""
    });
    const [DateRange, setDateRange] = useState({
        startDate: startOfMonth(addMonths(new Date(), -5)),
        endDate: endOfMonth(addMonths(new Date(), -0))
    });
    const [FormDetails, setFormDetails] = useState({
        groupID: tokenDecoder.getGroupIDFromToken(),
        factoryID: tokenDecoder.getFactoryIDFromToken(),
        customerNIC: "",
        customerRegistrationNumber: ""
    });
    const [userBasicDetails, setUserBasicDetails] = useState({
        FactoryID: parseInt(FormDetails.factoryID),
        GroupID: parseInt(FormDetails.groupID),
        NIC: null,
        CustomerRegistrationNumber: '',
        startDate: new Date(),
        endDate: new Date()
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
        setIsSearchPerformed(false);
    }, [FormDetails.groupID, FormDetails.factoryID, FormDetails.customerNIC, FormDetails.customerRegistrationNumber, DateRange.startDate, DateRange.endDate])

    useEffect(() => {
        if (FormDetails.factoryID != 0) {
            getCurrentBalancePaymnetDetail(FormDetails.factoryID);
        }
      }, [FormDetails.factoryID]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode === 'SENDTOAPPROVELOANREQUEST');

        if (isAuthorized === undefined) {
            navigate('/404');
        }

        var isGroupFilterEnabled = permissions.find(p => p.permissionCode === 'GROUPDROPDOWN');
        var isFactoryFilterEnabled = permissions.find(p => p.permissionCode === 'FACTORYDROPDOWN');
        var isSendToApproveEnabled = permissions.find(p => p.permissionCode === 'SENDTOAPPROVELOANREQUEST');

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

        getCustomerDetailsNameAndRouteName(FormDetails.groupID, FormDetails.factoryID, FormDetails.customerRegistrationNumber);

        let userDetailsObject = {
            groupID: FormDetails.groupID === null | 0 ? null : parseInt(FormDetails.groupID),
            factoryID: FormDetails.factoryID === null | 0 ? null : parseInt(FormDetails.factoryID),
            customerNIC: FormDetails.customerNIC === "" ? null : FormDetails.customerNIC.toString(),
            customerRegistrationNumber: FormDetails.customerRegistrationNumber === "" ? null : FormDetails.customerRegistrationNumber.toString(),
            startDate: DateRange.startDate === null ? null : moment(DateRange.startDate).format(),
            endDate: DateRange.endDate === null ? null : moment(DateRange.endDate).format()
        };
        setSelectedCustomerRegNumber(userDetailsObject.customerRegistrationNumber === null ? 0 : userDetailsObject.customerRegistrationNumber)
        await SearchUserDetails(userDetailsObject);
        await GetCustomerRelatedRegNumbers(userDetailsObject);
    }

    async function SearchUserDetails(userDetailsObject) {
        if (userDetailsObject.customerNIC === null && userDetailsObject.customerRegistrationNumber === null) {
            alert.error("Please Provide Atleast NIC Number or Registration Number");
        } else {

            trackPromise(GetUserGeneralDetails(userDetailsObject).then((value) => {
                if (value.status === true && value.isActive === true) {
                    setIsSearchPerformed(true);

                    setUserBasicDetails({
                        ...userBasicDetails,
                        GroupID: userDetailsObject.groupID,
                        FactoryID: userDetailsObject.factoryID,
                        CustomerRegistrationNumber: userDetailsObject.customerRegistrationNumber,
                        NIC: userDetailsObject.customerNIC,
                        startDate: userDetailsObject.startDate,
                        endDate: userDetailsObject.endDate
                    });
                } else {
                    setIsSearchPerformed(false)
                    value.isActive === false ? alert.error("This customer is Inactive") :
                        alert.error("Please provide correct user details")
                }
            }));
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

    async function getCurrentBalancePaymnetDetail(factoryID) {
        const result = await services.getCurrentBalancePaymnetDetail(factoryID);
        if (result !== null) {
            setMinMonth(moment(result.lastBalancePaymentSchedule).format("YYYY/MM/DD")); 
        } 
    }

    async function getCustomerDetailsNameAndRouteName(groupID, factoryID, registrationNumber) {
        var response = await services.getCustomerDetailsNameAndRouteName(groupID, factoryID, registrationNumber);
        if (response.statusCode == "Success" && response.data != null) {
            var data = response.data;
            setCustomerDetails({
                ...customerDetails,
                customerName: data.customerName,
                routeName: data.routeName
            });
        }
    }

    async function GetUserGeneralDetails(customerDetails) {
        let resObject = {
            status: '',
            isActive: true
        }
        const result = await services.GetCustomerBiomatricDetails(customerDetails);
        if (result.statusCode === "Error") {
            resObject.status = false;
            resObject.isActive = true;

            return resObject;
        } else {
            resObject.status = true;
            resObject.isActive = result.data.isActive;

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
            customerRegistrationNumber: "",
            customerNIC: ""
        })
        setCustomerDetails({
            ...customerDetails,
            customerName: "",
            routeName: ""
        });

    }

    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={"Loan Request"}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: FormDetails.groupID,
                            factoryID: FormDetails.factoryID,
                            customerNIC: FormDetails.customerNIC,
                            customerRegistrationNumber: FormDetails.customerRegistrationNumber
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().min(1, "Please Select a Group").required('Group is required'),
                                factoryID: Yup.number().min(1, "Please Select a Factory").required('Factory is required'),
                                customerNIC: Yup.string().matches(/^(\d{9}[vVxX]|\d{12})$/s, 'Entered NIC not valid'),
                                customerRegistrationNumber: Yup.string().matches(/^[0-9\b]+$/, 'Only allow numbers')
                            })
                        }
                        enableReinitialize
                        onSubmit={HandleSearch}
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
                                            title={cardTitle("Loan Request")}
                                        />
                                        <Divider />
                                        <CardContent>
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
                                                        Factory *
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
                                                        }}
                                                        value={FormDetails.factoryID}
                                                        variant="outlined"
                                                        id="factoryID"
                                                        disabled={!permissionList.isFactoryFilterEnabled}
                                                    >
                                                        <MenuItem value={'0'} disabled={true}>
                                                            --Select Factory--
                                                        </MenuItem>
                                                        {generateDropDownMenu(FactoryList)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
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
                                                    />
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="customerRegistrationNumber">
                                                        Registration Number
                                                    </InputLabel>

                                                    <TextField
                                                        error={Boolean(touched.customerRegistrationNumber && errors.customerRegistrationNumber)}
                                                        fullWidth
                                                        helperText={touched.customerRegistrationNumber && errors.customerRegistrationNumber}
                                                        name="customerRegistrationNumber"
                                                        size='small'
                                                        onBlur={handleBlur}
                                                        onChange={(e) => {
                                                            handleChange1(e)
                                                        }}
                                                        value={FormDetails.customerRegistrationNumber}
                                                        variant="outlined"
                                                        id="customerRegistrationNumber"
                                                    />
                                                </Grid>
                                            </Grid>
                                            <Grid container className={classes.row} spacing={3}>
                                                <Grid item md={3} xs={12}>
                                                    <Button
                                                        aria-describedby={id}
                                                        variant="contained"
                                                        fullWidth
                                                        color="primary"
                                                        onClick={handleClickPop}
                                                        size="small"
                                                        endIcon={<EventIcon />}
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
                                                    {IsSearchPerformed === true && customerDetails.customerName != "" ? (
                                                        <Grid container spacing={1}>
                                                            <Grid item md={3} xs={12}>
                                                                <Typography style={{ fontSize: '16px' }} align="left"><b>Customer Name: </b> {customerDetails.customerName}</Typography>

                                                            </Grid>
                                                            <Grid item md={3} xs={12}>
                                                                <Typography style={{ fontSize: '16px' }} align="left"><b>Route Name: </b> {customerDetails.routeName}</Typography>
                                                            </Grid>
                                                        </Grid>
                                                    ) : null}
                                                    <br />
                                                    {
                                                        IsSearchPerformed === true ?
                                                            <UserStatisticsComponent
                                                                UserDetails={userBasicDetails}
                                                                ExportUserGeneralDetails={setUserBiometricDetails}
                                                            /> : null
                                                    }
                                                </Grid>
                                            </Grid>
                                            <Grid container spacing={2}>
                                                <Grid item md={12} xs={12}>
                                                    {
                                                        IsSearchPerformed === true ?
                                                            <LoanInitiating
                                                                permissionList={permissionList}
                                                                userBasicDetails={userBasicDetails}
                                                                LoanTypes={LoanTypes}
                                                                clearFormFieldsParent={ClearUserFields}
                                                                RelatedCustomerRegNumbers={RelatedCustomerRegNumbers}
                                                                SelectedCustomerRegistrationNumber={SelectedCustomerRegNumber}
                                                                UserBiometricDetails={UserBiometricDetails}
                                                                MinMonth={MinMonth}

                                                            /> : null
                                                    }
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