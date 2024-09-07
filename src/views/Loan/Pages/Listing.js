import React, { useState, useEffect, createContext } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Box,
    Card,
    Grid,
    Button,
    InputLabel,
    TextField,
    MenuItem,
    makeStyles,
    Container,
    CardHeader,
    CardContent,
    Divider
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import MaterialTable from "material-table";
import tokenDecoder from 'src/utils/tokenDecoder';
import { Form, Formik } from 'formik';
import * as Yup from "yup";
import { LoadingComponent } from 'src/utils/newLoader';
import authService from 'src/utils/permissionAuth';
import tokenService from 'src/utils/tokenDecoder';

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.dark,
        minHeight: '100%',
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3)
    },
    avatar: {
        marginRight: theme.spacing(2)
    }

}));

const screenCode = 'LOANREQUESTMANAGEMENT';
export default function LoanRequestListing(props) {
    const classes = useStyles();
    const navigate = useNavigate();
    const handleViewOnly = (loanID) => {
        let encrypted = btoa(loanID.toString() + "-000");
        navigate('/app/loan/loanRequestApproval/' + encrypted);
    }
    const handleClickEdit = (loanID) => {
        let encrypted = btoa(loanID.toString());
        navigate('/app/loan/loanRequestApproval/' + encrypted);
    }
    const handleReshedulement = (loanID) => {
        let encrypted = btoa(loanID.toString());
        navigate('/app/loan/loanReshedulement/' + encrypted);
    }
    const handleEarlySettlement = (loanID) => {
        let encrypted = btoa(loanID.toString());
        navigate('/app/loan/loanEarlySettlement/' + encrypted);
    }
    const [FormDetails, setFormDetails] = useState({
        groupID: tokenDecoder.getGroupIDFromToken(),
        factoryID: tokenDecoder.getFactoryIDFromToken(),
        customerNIC: "",
        customerRegistrationNumber: "",
        statusID: 0
    });
    const [GroupList, setGroupList] = useState();
    const [FactoryList, setFactoryList] = useState();
    const [LoanRequestDetailsList, setLoanRequestDetailsList] = useState([])
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: true,
        isFactoryFilterEnabled: true,
        isSendToApproveEnabled: true,
        isApproveRejectEnabled: true,
        isLoanIssueEnabled: true,
        isLoanReschedulementEnabled: true,
        isLoanEarlySettlementEnabled: true
    });

    useEffect(() => {
        trackPromise(getPermission());
        trackPromise(getAllGroups());
        trackPromise(getFactoryByGroupID(tokenDecoder.getGroupIDFromToken()));
        trackPromise(SearchLoanDetails())
    }, [])

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode === 'VIEWLOANREQUESTAPPROVAL');

        if (isAuthorized === undefined) {
            navigate('/404');
        }

        var isGroupFilterEnabled = permissions.find(p => p.permissionCode === 'GROUPDROPDOWN');
        var isFactoryFilterEnabled = permissions.find(p => p.permissionCode === 'FACTORYDROPDOWN');
        var isSendToApproveEnabled = permissions.find(p => p.permissionCode === 'SENDTOAPPROVELOANREQUEST');
        var isApproveRejectEnabled = permissions.find(p => p.permissionCode === 'APPROVEREJECTLOANREQUEST');
        var isLoanIssueEnabled = permissions.find(p => p.permissionCode === 'ISSUELOANREQUEST');
        var isLoanReschedulementEnabled = permissions.find(p => p.permissionCode === 'LOANRECHEDULEMENT');
        var isLoanEarlySettlementEnabled = permissions.find(p => p.permissionCode === 'LOANEARLYTSETTLEMENT');

        setPermissions({
            ...permissionList,
            isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
            isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
            isSendToApproveEnabled: isSendToApproveEnabled !== undefined,
            isApproveRejectEnabled: isApproveRejectEnabled !== undefined,
            isLoanIssueEnabled: isLoanIssueEnabled !== undefined,
            isLoanReschedulementEnabled: isLoanReschedulementEnabled !== undefined,
            isLoanEarlySettlementEnabled: isLoanEarlySettlementEnabled !== undefined
        });

        setFormDetails({
            ...FormDetails,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
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
    async function getAllGroups() {
        var response = await services.GetAllGroups();
        setGroupList(response);
    };

    async function getFactoryByGroupID(groupID) {
        var response = await services.GetFactoryByGroupID(groupID);
        setFactoryList(response);
    };

    const loadFactory = (event) => {
        trackPromise(getFactoryByGroupID(event.target.value));
    };

    const GetCustomerLoanDetails = () => {
        trackPromise(SearchLoanDetails())
    }

    async function SearchLoanDetails() {
        let loanDetailsObject = {
            groupID: FormDetails.groupID === null | 0 ? null : parseInt(FormDetails.groupID),
            factoryID: FormDetails.factoryID === null | 0 ? null : parseInt(FormDetails.factoryID),
            customerNIC: FormDetails.customerNIC === "" ? null : FormDetails.customerNIC,
            customerRegistrationNumber: FormDetails.customerRegistrationNumber === "" ? null : FormDetails.customerRegistrationNumber,
            statusID: parseInt(FormDetails.statusID)
        };
        const response = await services.GetAllLoanDetails(loanDetailsObject);
        setLoanRequestDetailsList(response)
        return;
    }


    return (
        <Page
            className={classes.root}
            title="Loan Request Management"
        >
            <LoadingComponent />
            <Container maxWidth={false}>
                <Box mt={0}>
                    <Card>
                        <CardHeader
                            title={cardTitle("Loan Request Management")}
                        />
                        <PerfectScrollbar>
                            <Divider />
                            <CardContent>


                                <Formik
                                    initialValues={{
                                        groupID: FormDetails.groupID,
                                        factoryID: FormDetails.factoryID,
                                        customerNIC: FormDetails.customerNIC,
                                        customerRegistrationNumber: FormDetails.customerRegistrationNumber,
                                        statusID: FormDetails.statusID
                                    }}
                                    validationSchema={
                                        Yup.object().shape({
                                            groupID: Yup.number().min(1, "Please Select a Group").required('Group is required'),
                                            factoryID: Yup.number().min(1, "Please Select a Factory").required('Factory is required'),
                                            customerNIC: Yup.string().matches(/^(\d{9}[vVxX]|\d{12})$/, 'Entered NIC not valid'),
                                            customerRegistrationNumber: Yup.string().matches(/^[0-9\b]+$/, 'Only allow numbers')
                                        })
                                    }
                                    enableReinitialize
                                    onSubmit={(GetCustomerLoanDetails)}
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
                                                </Grid>
                                                <Grid container spacing={1}>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="statusID">
                                                            Status
                                                        </InputLabel>

                                                        <TextField select
                                                            error={Boolean(touched.statusID && errors.statusID)}
                                                            fullWidth
                                                            helperText={touched.statusID && errors.statusID}
                                                            name="statusID"
                                                            size='small'
                                                            onBlur={handleBlur}
                                                            onChange={(e) => {
                                                                handleChange1(e)
                                                            }}
                                                            value={FormDetails.statusID}
                                                            variant="outlined"
                                                            id="statusID"
                                                        >
                                                            <MenuItem value={'0'} disabled={true}>
                                                                --Select Status--
                                                            </MenuItem>
                                                            <MenuItem value={'1'}>Pending</MenuItem>
                                                            <MenuItem value={'2'}>Approved</MenuItem>
                                                            <MenuItem value={'3'}>Rejected</MenuItem>
                                                            <MenuItem value={'4'}>Issued</MenuItem>
                                                            <MenuItem value={'5'}>Resheduled</MenuItem>
                                                            <MenuItem value={'6'}>Hold</MenuItem>
                                                            <MenuItem value={'7'}>EarlySettled</MenuItem>
                                                        </TextField>
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
                                            </Box>
                                        </form>
                                    )}
                                </Formik>
                            </CardContent>
                            <Box minWidth={1000}>
                                <MaterialTable
                                    title="Multiple Actions Preview"
                                    columns={[
                                        { title: 'Customer Reg.No', field: 'registrationNumber' },
                                        { title: 'Loan Amount', field: 'principalAmount' },
                                        { title: 'Annual Interest Rate', field: 'annualRate' },
                                        { title: 'Number of Months', field: 'numberOfInstalments' },
                                        {
                                            title: 'Requested Date',
                                            field: 'createdDate',
                                            render: rowData => rowData.createdDate.split('T')[0]
                                        },
                                        {
                                            title: 'Status',
                                            field: 'statusID',
                                            lookup: {
                                                1: 'Pending',
                                                2: 'Approved',
                                                3: 'Rejected',
                                                4: 'Issued',
                                                5: 'Resheduled',
                                                6: 'Hold',
                                                7: 'Early Settled'
                                            }
                                        },
                                    ]}
                                    data={LoanRequestDetailsList}
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
                                            icon: 'visibilityIcon',
                                            tooltip: 'View Loan',
                                            onClick: (event, loanData) => handleViewOnly(loanData.customerLoanID)
                                        },
                                        rowData => ({
                                            hidden: rowData.statusID === 2 || rowData.statusID === 3 || rowData.statusID === 4 || rowData.statusID === 5 || rowData.statusID === 6 || rowData.statusID === 7 || !permissionList.isApproveRejectEnabled,
                                            icon: 'beenhere',
                                            tooltip: 'Approve Loan',
                                            onClick: (event, loanData) => handleClickEdit(loanData.customerLoanID)
                                        }),
                                        rowData => ({
                                            hidden: rowData.statusID === 1 || rowData.statusID === 3 || rowData.statusID === 4 || rowData.statusID === 5 || rowData.statusID === 6 || rowData.statusID === 7 || !permissionList.isLoanIssueEnabled,
                                            icon: 'unarchive',
                                            tooltip: 'Issue Loan',
                                            onClick: (event, loanData) => handleClickEdit(loanData.customerLoanID)
                                        }),
                                        rowData => ({
                                            hidden: rowData.statusID === 1 || rowData.statusID === 2 || rowData.statusID === 3 || rowData.statusID === 5 || rowData.statusID === 7 || !permissionList.isLoanReschedulementEnabled,
                                            icon: 'schedule',
                                            tooltip: 'Scheduling',
                                            onClick: (event, loanData) => handleReshedulement(loanData.customerLoanID)
                                        }),
                                        rowData => ({
                                            hidden: rowData.statusID === 1 || rowData.statusID === 2 || rowData.statusID === 3 || rowData.statusID === 5 || rowData.statusID === 7 || !permissionList.isLoanEarlySettlementEnabled,
                                            icon: 'handshake',
                                            tooltip: 'Early Settlement',
                                            onClick: (event, loanData) => handleEarlySettlement(loanData.customerLoanID)
                                        })
                                    ]}
                                />
                            </Box>
                        </PerfectScrollbar>
                    </Card>
                </Box>
            </Container>
        </Page>
    )

}
