import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Card, makeStyles, Container, CardHeader, Button, CardContent, Divider, MenuItem, Grid, InputLabel, TextField } from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import MaterialTable from "material-table";
import { LoadingComponent } from '../../../utils/newLoader';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";
import moment from 'moment';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';

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

const screenCode = 'PAYROLLADVANCE';

export default function PayrollAdvanceListing(props) {
    const classes = useStyles();
    const navigate = useNavigate();
    const alert = useAlert();
    const [groups, setGroups] = useState();
    const [estates, setEstates] = useState([]);
    const [IDDataForDeduction, setIsIDDataForDeduction] = useState(null);
    const [empDesignationID, setEmpDesignationID] = useState('');
    const [designation, setDesignation] = useState();
    const [empDesignation, setEmpDesignation] = useState('');
    const [payRollAdvanceViewData, setPayRollAdvanceViewData] = useState([])

    const [payRollAdvanceViewDetails, setPayRollAdvanceViewDetails] = useState({
        groupID: 0,
        estateID: 0,
        empNo: '',
        fromDate: new Date().toISOString().substring(0, 10),
        toDate: new Date().toISOString().substring(0, 10),
        empDesignationID: 0,
        empDesignation: '',
    });

    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const [selectedpayRollAdvanceID, setSelectedpayRollAdvanceID] = useState(0);
    let encrypted = "";
    const handleClick = () => {
        encrypted = btoa('0');
        navigate('/app/payrolladvance/addEdit/' + encrypted);
    }

    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });

    useEffect(() => {
        getGroupsForDropdown();
    }, []);

    useEffect(() => {
        const IDdata = JSON.parse(
            sessionStorage.getItem('checkrollDeduction-listing-page-search-parameters-id')
        );
        getPermissions(IDdata);
    }, []);

    useEffect(() => {
        sessionStorage.removeItem(
            'checkrollDeduction-listing-page-search-parameters-id'
        );
    }, []);

    useEffect(() => {
        if (payRollAdvanceViewDetails.groupID > 0) {
            trackPromise(getEstateDetailsByGroupID());
        };
    }, [payRollAdvanceViewDetails.groupID]);

    useEffect(() => {
        getDesignationsForDropdown();
    }, [payRollAdvanceViewDetails.estateID]);



    useEffect(() => {
        if (IDDataForDeduction !== null) {
            getData();
        }
    }, [IDDataForDeduction]);

    async function getPermissions(IDdata) {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWADDADVANCEPAYROLL');

        if (isAuthorized === undefined) {
            navigate('/404');
        }
        var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
        var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');

        setPermissions({
            ...permissionList,
            isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
            isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
        });

        const initialValues = IDdata === null;
        if (initialValues) {
            setPayRollAdvanceViewDetails({
                ...payRollAdvanceViewDetails,
                groupID: parseInt(tokenService.getGroupIDFromToken()),
                estateID: parseInt(tokenService.getFactoryIDFromToken())
            })
        }
        else {
            setPayRollAdvanceViewDetails({
                ...payRollAdvanceViewDetails,
                groupID: parseInt(tokenService.getGroupIDFromToken()),
                estateID: parseInt(tokenService.getFactoryIDFromToken()),
                empNo: IDdata.empNo,
                fromDate: IDdata.fromDate,
                toDate: IDdata.toDate
            })
            setIsIDDataForDeduction(IDdata)
        }
    }

    // function createData(estimatedDate, itemCategory, itemName, department) {
    //     return { estimatedDate, itemCategory, itemName, department };
    // }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(payRollAdvanceViewDetails.groupID);
        setEstates(response);
    };


    function generateDropDownMenu(data) {
        let items = []
        if (data != null) {
            for (const [key, value] of Object.entries(data)) {
                items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
            }
        }
        return items
    }

    async function getDesignationsForDropdown() {
        const designation = await services.getDesignationsForDropdownByEstateID(payRollAdvanceViewDetails.estateID);
        setDesignation(designation);
    }

    function handleChange(e) {
        const target = e.target;
        const value = target.value
        setPayRollAdvanceViewDetails({
            ...payRollAdvanceViewDetails,
            [e.target.name]: value
        });
        setPayRollAdvanceViewData([]);
    }

    async function getData() {
        let model = {
            groupID: parseInt(payRollAdvanceViewDetails.groupID),
            estateID: parseInt(payRollAdvanceViewDetails.estateID),
            empNo: payRollAdvanceViewDetails.empNo == '' ? null : payRollAdvanceViewDetails.empNo,
            fromDate: moment(payRollAdvanceViewDetails.fromDate.toString()).format().split('T')[0],
            toDate: moment(payRollAdvanceViewDetails.toDate.toString()).format().split('T')[0],
            designationID: payRollAdvanceViewDetails.empDesignationID == "" ? 0 : parseInt(payRollAdvanceViewDetails.empDesignationID),
        }

        let response = await services.GetPayRollAdvanceViewDetail(model);
        if (response.statusCode == "Success" && response.data.length != 0) {
            setPayRollAdvanceViewData(response.data)
        }
        else {
            alert.error(response.message)
            clearFields();
        }
    }

    const handleClickEdit = (advanceIssueID) => {
        encrypted = btoa(advanceIssueID);
        let modelID = {
            groupID: parseInt(payRollAdvanceViewDetails.groupID),
            estateID: parseInt(payRollAdvanceViewDetails.estateID),
            empNo: (payRollAdvanceViewDetails.empNo),
            fromDate: (payRollAdvanceViewDetails.fromDate),
            toDate: (payRollAdvanceViewDetails.toDate),
            designationID: parseInt(payRollAdvanceViewDetails.empDesignationID),
        };
        sessionStorage.setItem(
            'checkrollDeduction-listing-page-search-parameters-id',
            JSON.stringify(modelID)
        );
        
        navigate('/app/payrolladvance/addEdit/' + encrypted);
    }

    async function handleClickDelete(advanceIssueID) {
        setSelectedpayRollAdvanceID(advanceIssueID);
        setDeleteConfirmationOpen(true);
    }

    const handleConfirmDelete = async () => {
        setDeleteConfirmationOpen(false);
        let model = {
            advanceIssueID: selectedpayRollAdvanceID,
            modifiedBy: parseInt(tokenService.getUserIDFromToken())
        }
        const res = await services.DeletePayRollAdvance(model);
        if (res.statusCode == "Success") {
            alert.success(res.message)
            trackPromise(getData())
        }
        else {
            alert.error(res.message)
        }
    };

    const handleCancelDelete = () => {
        setDeleteConfirmationOpen(false);
    };

    function cardTitle(titleName) {
        return (
            <Grid container spacing={1}>
                <Grid item md={10} xs={12}>
                    {titleName}
                </Grid>
                <Grid item md={2} xs={12}>
                    <PageHeader
                        onClick={handleClick}
                        isEdit={true}
                        toolTiptitle={"Add Payroll Advance"}
                    />
                </Grid>
            </Grid>
        )
    }

    function clearFields() {
        setPayRollAdvanceViewDetails({
            ...payRollAdvanceViewDetails,
            empNo: '',
            fromDate: new Date().toISOString().substring(0, 10),
            toDate: new Date().toISOString().substring(0, 10),
            empDesignationID: 0,
            empDesignation: '',
        });
        setPayRollAdvanceViewData([]);
        setEmpDesignation([])
        setEmpDesignationID([])
    }

    return (
        <Fragment>
            <LoadingComponent />
            <Page
                className={classes.root}
                title="Payroll Advannce"
            >
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: payRollAdvanceViewDetails.groupID,
                            estateID: payRollAdvanceViewDetails.estateID,
                            empNo: payRollAdvanceViewDetails.empNo,
                            empDesignation: empDesignation,
                            fromDate: payRollAdvanceViewDetails.fromDate,
                            toDate: payRollAdvanceViewDetails.toDate,
                            empDesignationID: empDesignationID,
                        }}

                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group required').min("1", 'Group is required'),
                                estateID: Yup.number().required('Factory required').min("1", 'Factory is required'),
                            })
                        }
                        onSubmit={() => trackPromise(getData())}
                        enableReinitialize
                    >
                        {({
                            errors,
                            handleBlur,
                            handleSubmit,
                            isSubmitting,
                            touched,
                            values,
                            props
                        }) => (
                            <form onSubmit={handleSubmit}>
                                <Box mt={0}>
                                    <Card>
                                        <CardHeader
                                            title={cardTitle("Payroll Advance")}
                                        />
                                        <PerfectScrollbar>
                                            <Divider />
                                            <CardContent style={{ marginBottom: "2rem" }}>
                                                <Grid container spacing={3}>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="groupID">
                                                            Group  *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.groupID && errors.groupID)}
                                                            helperText={touched.groupID && errors.groupID}
                                                            fullWidth
                                                            name="groupID"
                                                            onChange={(e) => handleChange(e)}
                                                            value={payRollAdvanceViewDetails.groupID}
                                                            variant="outlined"
                                                            size="small"
                                                            onBlur={handleBlur}
                                                            InputProps={{
                                                                readOnly: !permissionList.isGroupFilterEnabled,
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Group--</MenuItem>
                                                            {generateDropDownMenu(groups)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="estateID">
                                                            Estate *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.estateID && errors.estateID)}
                                                            fullWidth
                                                            helperText={touched.estateID && errors.estateID}
                                                            name="estateID"
                                                            placeholder='--Select Estate--'
                                                            onBlur={handleBlur}
                                                            size='small'
                                                            onChange={(e) => {
                                                                handleChange(e)
                                                            }}
                                                            value={payRollAdvanceViewDetails.estateID}
                                                            variant="outlined"
                                                            id="estateID"
                                                            InputProps={{
                                                                readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                                                            }}
                                                        >
                                                            <MenuItem value={0}>--Select Estate--</MenuItem>
                                                            {generateDropDownMenu(estates)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="empNo">
                                                            Employee Number
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.empNo && errors.empNo)}
                                                            helperText={touched.empNo && errors.empNo}
                                                            fullWidth
                                                            size='small'
                                                            name="empNo"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={payRollAdvanceViewDetails.empNo}
                                                            variant="outlined"
                                                        />
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="fromDate">
                                                            From Date *
                                                        </InputLabel>
                                                        <TextField
                                                            fullWidth
                                                            name="fromDate"
                                                            type='date'
                                                            onChange={(e) => handleChange(e)}
                                                            value={payRollAdvanceViewDetails.fromDate}
                                                            variant="outlined"
                                                            id="fromDate"
                                                            size='small'
                                                            inputProps={{ max: new Date().toISOString().split('T')[0] }}
                                                        />
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="toDate">
                                                            To Date *
                                                        </InputLabel>
                                                        <TextField
                                                            fullWidth
                                                            name="toDate"
                                                            type='date'
                                                            onChange={(e) => handleChange(e)}
                                                            value={payRollAdvanceViewDetails.toDate}
                                                            variant="outlined"
                                                            id="toDate"
                                                            size='small'
                                                            inputProps={{ max: new Date().toISOString().split('T')[0] }}
                                                        />
                                                    </Grid>

                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="empDesignationID">
                                                            Designation
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.empDesignationID && errors.empDesignationID)}
                                                            fullWidth
                                                            helperText={touched.empDesignationID && errors.empDesignationID}
                                                            size='small'
                                                            name="empDesignationID"
                                                            onChange={(e) => {
                                                                handleChange(e)
                                                            }}
                                                            value={payRollAdvanceViewDetails.empDesignationID}
                                                            variant="outlined"
                                                            id="empDesignationID"
                                                        >
                                                            <MenuItem value="0">--Select Designation--</MenuItem>
                                                            {generateDropDownMenu(designation)}
                                                        </TextField>
                                                    </Grid>
                                                </Grid>
                                                <Box display="flex" justifyContent="flex-end" p={2}>
                                                    <Button
                                                        color="primary"
                                                        type="submit"
                                                        variant="contained"
                                                    >
                                                        Search
                                                    </Button>
                                                </Box>
                                            </CardContent>
                                            <Box minWidth={1050}>
                                                {payRollAdvanceViewData.length > 0 ? (
                                                    <MaterialTable
                                                        title="Multiple Actions Preview"
                                                        columns={[
                                                            { title: 'Employee No', field: 'empNo' },
                                                            { title: 'Employee Name', field: 'employeeName' },
                                                            { title: 'Designation', field: 'designationName' },
                                                            { title: 'Date', field: 'issuingDate', render: rowData => moment(rowData.issuingDate).format().split('T')[0] },
                                                            {
                                                                title: 'Amount (Rs.)',
                                                                field: 'amount',
                                                                render: rowData => rowData.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                                                                cellStyle: {
                                                                    textAlign: 'right',
                                                                    paddingRight: '150px',
                                                                },
                                                            },
                                                        ]}
                                                        data={payRollAdvanceViewData}
                                                        options={{
                                                            exportButton: false,
                                                            showTitle: false,
                                                            headerStyle: { textAlign: "left", height: '1%' },
                                                            cellStyle: { textAlign: "left" },
                                                            columnResizable: false,
                                                            actionsColumnIndex: -1,
                                                            pageSize: 10
                                                        }}
                                                        actions={[
                                                            {
                                                                icon: 'edit',
                                                                tooltip: 'Edit',
                                                                onClick: (event, rowData) => handleClickEdit(rowData.advanceIssueID)
                                                            },
                                                            {
                                                                icon: 'delete',
                                                                tooltip: 'Delete',
                                                                onClick: (event, rowData) => handleClickDelete(rowData.advanceIssueID)
                                                            }
                                                        ]}
                                                    />
                                                ) : null}
                                            </Box>
                                            <Dialog open={deleteConfirmationOpen} onClose={handleCancelDelete}>
                                                <DialogTitle>Delete Confirmation</DialogTitle>
                                                <DialogContent>
                                                    <p>Are you sure, you want to delete this record?</p>
                                                </DialogContent>
                                                <DialogActions>
                                                    <Button onClick={handleConfirmDelete} color="primary">
                                                        Delete
                                                    </Button>
                                                    <Button
                                                        onClick={handleCancelDelete} color="primary">
                                                        Cancel
                                                    </Button>
                                                </DialogActions>
                                            </Dialog>
                                        </PerfectScrollbar>
                                    </Card>
                                </Box>
                            </form>
                        )}
                    </Formik>
                </Container>
            </Page >
        </Fragment>
    )
}