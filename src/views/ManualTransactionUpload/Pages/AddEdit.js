import React, { useState, useEffect, Fragment } from 'react';
import tokenDecoder from 'src/utils/tokenDecoder';
import { useNavigate, useParams } from 'react-router-dom';
import authService from 'src/utils/permissionAuth'
import { trackPromise } from 'react-promise-tracker';
import { LoadingComponent } from 'src/utils/newLoader';
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
import Page from 'src/components/Page';
import { Form, Formik } from 'formik';
import * as Yup from "yup";
import services from '../Services';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";
import moment from 'moment';
import MaterialTable from "material-table";
import { useAlert } from "react-alert";
import { startOfMonth } from 'date-fns';

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

const screenCode = 'MANUALTRANSACTIONUPLOAD';
export default function ManualTransactionUpload() {
    const navigate = useNavigate();
    const classes = useStyles();
    const alert = useAlert();

    const [IsAddButtonDisable, setIsAddButtonDisable] = useState(false);
    const [IsUploadButtonDisable, setIsUploadButtonDisable] = useState(false);
    const [GroupList, setGroupList] = useState();
    const [FactoryList, setFactoryList] = useState();
    const [EffectiveDate, handleEffectiveDate] = useState(new Date());
    const [TransactionTypeList, setTransactionTypeList] = useState([]);
    const [TransactionDetails, setTransactionDetails] = useState([]);
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: true,
        isFactoryFilterEnabled: true,
        isUploadManualTransactionEnabled: true,
    });
    const [FormDetails, setFormDetails] = useState({
        groupID: tokenDecoder.getGroupIDFromToken(),
        factoryID: tokenDecoder.getFactoryIDFromToken(),
        customerRegistrationNumber: "",
        effectiveDate: new Date,
        transactionTypeID: 0,
        amount: "",
        description: ''
    });
    const [balancePaymentData, setBalancePaymentData] = useState({
        lastBalancePaymentSchedule: '',
        firstTransactionDate: ''
    });
    const [MinMonth, setMinMonth] = useState(new Date());

    const loadFactory = (event) => {
        trackPromise(getFactoryByGroupID(event.target.value));
    };

    useEffect(() => {
        trackPromise(getPermission());
        trackPromise(getAllGroups());
        trackPromise(getFactoryByGroupID(FormDetails.groupID));
        trackPromise(LoadTransactionTypes());
    }, [])

    useEffect(() => {
        trackPromise(GetIsBalancePaymetStatusChek());
    }, [FormDetails.factoryID])

    async function LoadTransactionTypes() {
        const result = await services.GetTransactionTypeDetailsByFilter();
        setTransactionTypeList(result);
    }

    async function GetIsBalancePaymetStatusChek() {
        const result = await services.GetCurrentBalancePaymnetDetail(FormDetails.groupID, FormDetails.factoryID);
        setMinMonth(checkIsMonthValid(result));
    }

    function checkIsMonthValid(result) {
        if (result.lastBalancePaymentSchedule !== null) {
            let tempMonth = result.lastBalancePaymentSchedule.split('/');
            var year = (parseInt(tempMonth[0]));
            var month = (parseInt(tempMonth[1]));
            var date = new Date(year, month, 1);
            return startOfMonth(date);
        } else {
            return undefined
        }
    }

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode === 'VIEWMANUALTRANSACTIONUPLOAD' || p.permissionCode === 'UPLOADMANUALTRANSACTION');

        if (isAuthorized === undefined) {
            navigate('/404');
        }

        var isGroupFilterEnabled = permissions.find(p => p.permissionCode === 'GROUPDROPDOWN');
        var isFactoryFilterEnabled = permissions.find(p => p.permissionCode === 'FACTORYDROPDOWN');
        var isUploadManualTransactionEnabled = permissions.find(p => p.permissionCode === 'UPLOADMANUALTRANSACTION');

        setPermissions({
            ...permissionList,
            isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
            isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
            isUploadManualTransactionEnabled: isUploadManualTransactionEnabled !== undefined,
        });

        setFormDetails({
            ...FormDetails,
            groupID: parseInt(tokenDecoder.getGroupIDFromToken()),
            factoryID: parseInt(tokenDecoder.getFactoryIDFromToken())
        })
    }


    async function getAllGroups() {
        var response = await services.GetAllGroups();
        setGroupList(response);
    };

    async function getFactoryByGroupID(groupID) {
        var response = await services.GetFactoryByGroupID(groupID);
        setFactoryList(response);
    };


    async function handleSubmitEvent() {
        setIsAddButtonDisable(true);
        trackPromise(AddTransactionDetails())
    }

    async function AddTransactionDetails() {

        let detailsObject = {
            groupID: parseInt(FormDetails.groupID.toString()),
            factoryID: parseInt(FormDetails.factoryID.toString()),
            customerRegistrationNumber: parseInt(FormDetails.customerRegistrationNumber.toString()),
            effectiveDate: moment(EffectiveDate).format(),
            transactionTypeID: parseInt(FormDetails.transactionTypeID.toString()),
            amount: parseFloat(FormDetails.amount.toString()),
            description: FormDetails.description.toString(),
        };

        const userObject = await GetUserDetailsByIds(detailsObject);

        if (userObject === null) {
            setIsAddButtonDisable(false);
            alert.error("Invalid user details");
            return;
        }

        const transactionObject = TransactionTypeList.find(element => element.transactionTypeID === detailsObject.transactionTypeID);

        let userDetailsListArray = {
            groupID: detailsObject.groupID,
            factoryID: detailsObject.factoryID,
            registrationNumber: detailsObject.customerRegistrationNumber,
            customerName: userObject.customerName,
            transactionType: detailsObject.transactionTypeID,
            amount: detailsObject.amount,
            description: FormDetails.description,
            effectiveDate: detailsObject.effectiveDate,
            key: Math.floor(Date.now() / 1000),
            createdBy: tokenDecoder.getUserIDFromToken(),
            transactionTypeCode: transactionObject.transactionTypeCode,
            entryType: transactionObject.entryType,
            transactionTypeName: transactionObject.transactionTypeName
        };

        setTransactionDetails([
            ...TransactionDetails,
            userDetailsListArray]
        );

        ClearFields();
        setIsAddButtonDisable(false);
    }

    async function handleUploadEvent() {
        setIsUploadButtonDisable(true);
        trackPromise(UploadTransactionDetails())
    }

    async function UploadTransactionDetails() {
        let successRecordsArray = []
        let totalTransactionCount = TransactionDetails.length;
        for (const element of TransactionDetails) {
            let sdObject = {
                groupID: element.groupID,
                factoryID: element.factoryID,
                registrationNumber: element.registrationNumber,
                transactionType: element.transactionType,
                amount: element.amount,
                description: element.description,
                effectiveDate: element.effectiveDate,
                key: element.key,
                createdBy: element.createdBy,
                transactionTypeCode: element.transactionTypeCode,
                entryType: element.entryType
            };

            const response = await services.UploadTransactionDetails(sdObject);
            if (response.statusCode === "Success") {
                successRecordsArray.push(response.data);
            }
            else {
                return alert.error(response.message);
            }
        }
        let tempArray2 = TransactionDetails;

        const results = tempArray2.filter(({ key: id1 }) => !successRecordsArray.some(({ key: id2 }) => id2 === id1));

        setTransactionDetails(results);

        successRecordsArray.length === totalTransactionCount ?
            alert.success("Uploading completed successfully") :
            alert.error("Uploading incompleted")

        setIsUploadButtonDisable(false);
    }

    async function GetUserDetailsByIds(detailsObject) {
        const response = await services.GetCustomerNameByRegNumber(detailsObject.groupID, detailsObject.factoryID, detailsObject.customerRegistrationNumber);

        return response;
    }

    function ClearFields() {
        setFormDetails({
            ...FormDetails,
            customerRegistrationNumber: "",
            amount: "",
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

    function cardTitle(titleName) {
        return (
            <Grid container spacing={1}>
                <Grid item md={10} xs={12}>
                    {titleName}
                </Grid>
            </Grid>
        )
    }

    const removeDetailByIndex = (loanID) => {
        let tempArray = TransactionDetails;
        const filteredArray = tempArray.filter((obj) => {
            return (obj.key !== loanID)
        })
        setTransactionDetails(filteredArray);
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

    function generateTransactionTypeDropDownMenu(data) {
        let items = []
        if (data != null) {
            for (const object of TransactionTypeList) {
                items.push(<MenuItem key={object.transactionTypeID} value={object.transactionTypeID}>{object.transactionTypeName}</MenuItem>);
            }
        }
        return items
    }
    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={"Manual Transaction Upload"}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: FormDetails.groupID,
                            factoryID: FormDetails.factoryID,
                            customerRegistrationNumber: FormDetails.customerRegistrationNumber,
                            transactionTypeID: FormDetails.transactionTypeID,
                            effectiveDate: EffectiveDate,
                            amount: FormDetails.amount
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().min(1, "Please Select a Group").required('Group is required'),
                                factoryID: Yup.number().min(1, "Please Select a Factory").required('Factory is required'),
                                customerRegistrationNumber: Yup.string().matches(/^[0-9\b]+$/, 'Only allow numbers').required('Registration number is required'),
                                transactionTypeID: Yup.string().test('amount', "Transaction type is required", val => val > 0),
                                amount: Yup.string().matches(/^[0-9]+([.][0-9]{1,2})?$/, 'Please enter valid amount').test('amount', "Amount is required", val => val > 0),
                            })
                        }
                        enableReinitialize
                        onSubmit={handleSubmitEvent}
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
                                            title={cardTitle("Manual Transaction Upload")}
                                        />
                                        <Divider />
                                        <CardContent>
                                            <Grid container spacing={3}>
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
                                                    <InputLabel shrink id="customerRegistrationNumber">
                                                        Registration Number *
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
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="effectiveDate" style={{ marginBottom: '-8px' }}>
                                                        Effective Date *
                                                    </InputLabel>
                                                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                        <KeyboardDatePicker
                                                            minDate={MinMonth}
                                                            autoOk
                                                            fullWidth
                                                            inputVariant="outlined"
                                                            format="dd/MM/yyyy"
                                                            margin="dense"
                                                            id="EffectiveDate"
                                                            value={EffectiveDate}
                                                            maxDate={new Date()}
                                                            onChange={(e) => {
                                                                handleEffectiveDate(e);
                                                            }}
                                                            KeyboardButtonProps={{
                                                                'aria-label': 'change date',
                                                            }}
                                                        />
                                                    </MuiPickersUtilsProvider>
                                                </Grid>
                                            </Grid>
                                            <Grid container spacing={3}>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="transactionTypeID">
                                                        Transaction Type *
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.transactionTypeID && errors.transactionTypeID)}
                                                        fullWidth
                                                        helperText={touched.transactionTypeID && errors.transactionTypeID}
                                                        name="transactionTypeID"
                                                        size='small'
                                                        onBlur={handleBlur}
                                                        onChange={(e) => {
                                                            handleChange1(e)
                                                        }}
                                                        value={FormDetails.transactionTypeID}
                                                        variant="outlined"
                                                        id="transactionTypeID"
                                                    >
                                                        <MenuItem value={0} disabled={true}>--Select Transaction Type--</MenuItem>
                                                        {generateTransactionTypeDropDownMenu(TransactionTypeList)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="amount">
                                                        Amount *
                                                    </InputLabel>
                                                    <TextField
                                                        error={Boolean(touched.amount && errors.amount)}
                                                        fullWidth
                                                        helperText={touched.amount && errors.amount}
                                                        name="amount"
                                                        size='small'
                                                        onBlur={handleBlur}
                                                        onChange={(e) => {
                                                            handleChange1(e)
                                                        }}
                                                        value={FormDetails.amount}
                                                        variant="outlined"
                                                        id="amount"
                                                    />
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="description">
                                                        Description
                                                    </InputLabel>

                                                    <TextField
                                                        error={Boolean(touched.description && errors.description)}
                                                        fullWidth
                                                        helperText={touched.description && errors.description}
                                                        name="description"
                                                        size='small'
                                                        onBlur={handleBlur}
                                                        onChange={(e) => {
                                                            handleChange1(e)
                                                        }}
                                                        value={FormDetails.description}
                                                        variant="outlined"
                                                        id="description"
                                                    />
                                                </Grid>
                                            </Grid>
                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                <Button
                                                    color="primary"
                                                    type="submit"
                                                    variant="contained"
                                                    size="small"
                                                    disabled={IsAddButtonDisable}
                                                >
                                                    Add
                                                </Button>
                                            </Box>
                                            {
                                                TransactionDetails.length > 0 ?
                                                    <>
                                                        <Box minWidth={1000}>
                                                            <MaterialTable
                                                                title="Multiple Actions Preview"
                                                                columns={[
                                                                    { title: 'Customer Reg.No', field: 'registrationNumber' },
                                                                    { title: 'Name', field: 'customerName' },
                                                                    { title: 'Transaction Type', field: 'transactionTypeName' },
                                                                    { title: 'Amount', field: 'amount' },
                                                                    {
                                                                        title: 'Effective Date',
                                                                        field: 'effectiveDate',
                                                                        render: rowData => rowData.effectiveDate.split('T')[0]
                                                                    },
                                                                    { title: 'Description', field: 'description' },
                                                                ]}
                                                                data={TransactionDetails}
                                                                options={{
                                                                    exportButton: false,
                                                                    showTitle: false,
                                                                    headerStyle: { textAlign: "left", height: '1%' },
                                                                    cellStyle: { textAlign: "left" },
                                                                    columnResizable: false,
                                                                    actionsColumnIndex: -1
                                                                }}
                                                                actions={[
                                                                    {
                                                                        icon: 'delete',
                                                                        tooltip: 'Delete Transaction',
                                                                        onClick: (event, transactionData) => removeDetailByIndex(transactionData.key)
                                                                    },
                                                                ]}
                                                            />
                                                        </Box>
                                                        <Box display="flex" justifyContent="flex-end" p={2}>
                                                            <Button
                                                                color="primary"
                                                                variant="contained"
                                                                size="small"
                                                                onClick={handleUploadEvent}
                                                                disabled={!permissionList.isUploadManualTransactionEnabled || IsUploadButtonDisable}
                                                            >
                                                                Upload
                                                            </Button>
                                                        </Box></>
                                                    : null
                                            }
                                        </CardContent>
                                    </Card>
                                </Box>
                            </form>
                        )}
                    </Formik>
                </Container>
            </Page>
        </Fragment >
    )
}
