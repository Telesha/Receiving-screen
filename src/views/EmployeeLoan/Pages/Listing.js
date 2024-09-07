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

const screenCode = 'EMPLOYEELOANREQUESTMANAGEMENT';
export default function EmployeeLoanRequestListing(props) {
    const classes = useStyles();
    const navigate = useNavigate();
    const [LoanRequestDetailsList, setLoanRequestDetailsList] = useState([])
    const [IDDataForCall, setIDDataForCall] = useState(null)
    const [page, setPage] = useState(0);

    const [FormDetails, setFormDetails] = useState({
        groupID: tokenDecoder.getGroupIDFromToken(),
        factoryID: tokenDecoder.getFactoryIDFromToken(),
        divisionID: 0,
        employeeNIC: "",
        registrationNumber: "",
        statusID: 0
    });
    const handleViewOnly = (employeeLoanID) => {
        let encrypted = btoa(employeeLoanID.toString() + "-000");
        let modelID = {
            groupID: parseInt(FormDetails.groupID),
            factoryID: parseInt(FormDetails.factoryID),
            divisionID: parseInt(FormDetails.divisionID),
            employeeNIC: FormDetails.employeeNIC,
            registrationNumber: FormDetails.registrationNumber,
            statusID: parseInt(FormDetails.statusID),
        };
        sessionStorage.setItem('loan-listing-page-search-parameters-id', JSON.stringify(modelID));
        navigate('/app/employeeLoan/loanRequestApproval/' + encrypted);
    }

    const handleClickEdit = (employeeLoanID) => {
        let encrypted = btoa(employeeLoanID.toString());
        let modelID = {
            groupID: parseInt(FormDetails.groupID),
            factoryID: parseInt(FormDetails.factoryID),
            divisionID: parseInt(FormDetails.divisionID),
            employeeNIC: FormDetails.employeeNIC,
            registrationNumber: FormDetails.registrationNumber,
            statusID: parseInt(FormDetails.statusID),
        };
        sessionStorage.setItem('loan-listing-page-search-parameters-id', JSON.stringify(modelID));
        navigate('/app/employeeLoan/loanRequestApproval/' + encrypted);
    }
    const handleReshedulement = (employeeLoanID) => {
        let encrypted = btoa(employeeLoanID.toString());
        navigate('/app/employeeLoan/loanReshedulement/' + encrypted);
    }
    const handleEarlySettlement = (loanID) => {
        let encrypted = btoa(loanID.toString());
        navigate('/app/employeeLoan/loanEarlySettlement/' + encrypted);
    }

    const [GroupList, setGroupList] = useState();
    const [FactoryList, setFactoryList] = useState();
    const [divisions, setDivisions] = useState();
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: true,
        isFactoryFilterEnabled: true,
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



    useEffect(() => {
        if (FormDetails.factoryID > 0) {
            trackPromise(
                getDivisionsForDropDown(FormDetails.factoryID),
            )
        }
    }, [FormDetails.factoryID]);

    useEffect(() => {
        if (IDDataForCall !== null) {
            trackPromise(
                trackPromise(SearchLoanDetails())
            )
        }
    }, [IDDataForCall]);

    async function getPermission() {
        const IDdata = JSON.parse(sessionStorage.getItem('loan-listing-page-search-parameters-id'));
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode === 'VIEWEMPLOYEELOANREQUESTAPPROVAL');

        if (isAuthorized === undefined) {
            navigate('/404');
        }
        var isGroupFilterEnabled = permissions.find(p => p.permissionCode === 'GROUPDROPDOWN');
        var isFactoryFilterEnabled = permissions.find(p => p.permissionCode === 'FACTORYDROPDOWN');
        var isApproveRejectEnabled = permissions.find(p => p.permissionCode === 'APPROVEREJECTEMPLOYEELOANREQUEST');
        var isLoanIssueEnabled = permissions.find(p => p.permissionCode === 'ISSUEEMPLOYEELOANREQUEST');
        var isLoanReschedulementEnabled = permissions.find(p => p.permissionCode === 'EMPLOYEELOANRECHEDULEMENT');
        var isLoanEarlySettlementEnabled = permissions.find(p => p.permissionCode === 'EMPLOYEELOANEARLYTSETTLEMENT');

        setPermissions({
            ...permissionList,
            isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
            isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
            isApproveRejectEnabled: isApproveRejectEnabled !== undefined,
            isLoanIssueEnabled: isLoanIssueEnabled !== undefined,
            isLoanReschedulementEnabled: isLoanReschedulementEnabled !== undefined,
            isLoanEarlySettlementEnabled: isLoanEarlySettlementEnabled !== undefined
        });

        if (IDdata == null) {
            setFormDetails({
                ...FormDetails,
                groupID: parseInt(tokenService.getGroupIDFromToken()),
                factoryID: parseInt(tokenService.getFactoryIDFromToken()),
            })
        }
        else {
            setFormDetails((FormDetails) => ({
                ...FormDetails,
                groupID: parseInt(IDdata.groupID),
                factoryID: parseInt(IDdata.factoryID),
                divisionID: parseInt(IDdata.divisionID),
                statusID: parseInt(IDdata.statusID),
                employeeNIC: IDdata.employeeNIC,
                registrationNumber: IDdata.registrationNumber,
            }))
            setIDDataForCall(IDdata)
        }
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
        setLoanRequestDetailsList([]);
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

    async function getDivisionsForDropDown(factoryID) {
        const divisions = await services.getDivisionDetailsByEstateID(factoryID);
        setDivisions(divisions);
    }

    const loadFactory = (event) => {
        trackPromise(getFactoryByGroupID(event.target.value));
    };

    const loadDivision = (event) => {
        trackPromise(getDivisionsForDropDown(event.target.value));
    };

    const GetCustomerLoanDetails = () => {
        trackPromise(SearchLoanDetails())
    }

    async function SearchLoanDetails() {
        let loanDetailsObject = {
            groupID: FormDetails.groupID === null | 0 ? null : parseInt(FormDetails.groupID),
            factoryID: FormDetails.factoryID === null | 0 ? null : parseInt(FormDetails.factoryID),
            divisionID: FormDetails.divisionID === null | 0 ? null : parseInt(FormDetails.divisionID),
            employeeNIC: FormDetails.employeeNIC === "" ? null : FormDetails.employeeNIC,
            registrationNumber: FormDetails.registrationNumber === "" ? null : FormDetails.registrationNumber,
            statusID: parseInt(FormDetails.statusID)
        };
        let response = await services.GetAllEmployeeLoanRequests(loanDetailsObject);
        setLoanRequestDetailsList(response)
        return;
    }

    useEffect(() => {
        sessionStorage.removeItem('loan-listing-page-search-parameters-id');
    }, []);

    return (
        <Page
            className={classes.root}
            title="Employee Loan Request Management"
        >
            <LoadingComponent />
            <Container maxWidth={false}>
                <Box mt={0}>
                    <Card>
                        <CardHeader
                            title={cardTitle("Employee Loan Request Management")}
                        />
                        <PerfectScrollbar>
                            <Divider />
                            <CardContent>
                                <Formik
                                    initialValues={{
                                        groupID: FormDetails.groupID,
                                        factoryID: FormDetails.factoryID,
                                        divisionID: FormDetails.divisionID,
                                        employeeNIC: FormDetails.employeeNIC,
                                        registrationNumber: FormDetails.registrationNumber,
                                        statusID: FormDetails.statusID
                                    }}
                                    validationSchema={
                                        Yup.object().shape({
                                            groupID: Yup.number().min(1, "Please Select a Group").required('Group is required'),
                                            factoryID: Yup.number().min(1, "Please Select a Estate").required('Estate is required'),
                                            divisionID: Yup.number().min(1, "Please Select a Division").required('Division is required'),
                                            employeeNIC: Yup.string().matches(/^(\d{9}[vVxX]|\d{12})$/, 'Entered NIC not valid'),
                                            registrationNumber: Yup.string().matches(/^[0-9\b]+$/, 'Only allow numbers')
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
                                                        >
                                                            <MenuItem value='0'>--Select Division--</MenuItem>
                                                            {generateDropDownMenu(divisions)}
                                                        </TextField>
                                                    </Grid>

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
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="registrationNumber">
                                                            Employee No
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
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="employeeNIC">
                                                            NIC Number
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.employeeNIC && errors.employeeNIC)}
                                                            fullWidth
                                                            helperText={touched.employeeNIC && errors.employeeNIC}
                                                            name="employeeNIC"
                                                            size='small'
                                                            onBlur={handleBlur}
                                                            onChange={(e) => {
                                                                handleChange1(e)
                                                            }}
                                                            value={FormDetails.employeeNIC}
                                                            variant="outlined"
                                                            id="employeeNIC"
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
                                            </Box>
                                        </form>
                                    )}
                                </Formik>
                            </CardContent>
                            {LoanRequestDetailsList.length > 0 ? (
                                <Box minWidth={1000}>
                                    <MaterialTable
                                        title="Multiple Actions Preview"
                                        columns={[
                                            { title: 'Employee No', field: 'registrationNumber' },
                                            { title: 'Loan Amount (Rs.)', field: 'principalAmount', render: rowData => rowData.principalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
                                            { title: 'Annual Interest Rate (%)', field: 'annualRate' },
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
                                            actionsColumnIndex: -1,
                                            actionsCellStyle: {
                                                paddingLeft: '30px'
                                            }
                                        }}
                                        actions={[
                                            {
                                                icon: 'visibilityIcon',
                                                tooltip: 'View Loan',
                                                onClick: (event, loanData) => handleViewOnly(loanData.employeeLoanID)
                                            },
                                            rowData => ({
                                                hidden: rowData.statusID === 2 || rowData.statusID === 3 || rowData.statusID === 4 || rowData.statusID === 5 || rowData.statusID === 6 || rowData.statusID === 7 || !permissionList.isApproveRejectEnabled,
                                                icon: 'beenhere',
                                                tooltip: 'Approve Loan',
                                                onClick: (event, loanData) => handleClickEdit(loanData.employeeLoanID)
                                            }),
                                            rowData => ({
                                                hidden: rowData.statusID === 1 || rowData.statusID === 3 || rowData.statusID === 4 || rowData.statusID === 5 || rowData.statusID === 6 || rowData.statusID === 7 || !permissionList.isLoanIssueEnabled,
                                                icon: 'unarchive',
                                                tooltip: 'Issue Loan',
                                                onClick: (event, loanData) => handleClickEdit(loanData.employeeLoanID)
                                            }),
                                            // rowData => ({
                                            //     hidden: rowData.statusID === 1 || rowData.statusID === 2 || rowData.statusID === 3 || rowData.statusID === 5 || rowData.statusID === 7 || !permissionList.isLoanReschedulementEnabled,
                                            //     icon: 'schedule',
                                            //     tooltip: 'Scheduling',
                                            //     onClick: (event, loanData) => handleReshedulement(loanData.employeeLoanID)
                                            // }),
                                            // rowData => ({
                                            //     hidden: rowData.statusID === 1 || rowData.statusID === 2 || rowData.statusID === 3 || rowData.statusID === 5 || rowData.statusID === 7 || !permissionList.isLoanEarlySettlementEnabled,
                                            //     icon: 'handshake',
                                            //     tooltip: 'Early Settlement',
                                            //     onClick: (event, loanData) => handleEarlySettlement(loanData.employeeLoanID)
                                            // })
                                        ]}
                                    />
                                </Box>
                            ) : null}
                        </PerfectScrollbar>
                    </Card>
                </Box>
            </Container>
        </Page>
    )

}
