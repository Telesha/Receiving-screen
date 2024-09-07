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
import { useParams } from 'react-router-dom';
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

const screenCode = 'CHECKROLLDEDUCTION';

export default function CheckRollListing(props) {

    const classes = useStyles();
    const navigate = useNavigate();
    const alert = useAlert();
    const { checkRollDeductionID } = useParams();
    const [groups, setGroups] = useState();
    const [estates, setEstates] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [regNo, setRegNo] = useState([]);
    const [isShowTable, setIsShowTable] = useState(false);
    const [IDDataForDeduction, setIsIDDataForDeduction] = useState(null);
    const [checkRollDeductionViewData, setCheckRollDeductionViewData] = useState(
        {
            estate: '0',
            division: '0',
            createdDate: '0',
            registrationNumber: '0',
            employeeName: '0',
            deductionType: '0',
            amount: 0,
        });

    const [checkRollDeductionViewDetails, setCheckRollDeductionViewDetails] = useState({
        groupID: 0,
        estateID: 0,
        divisionID: 0,
        regNo: '',
        fromDate: new Date().toISOString().substring(0, 10),
        toDate: new Date().toISOString().substring(0, 10)
    });

    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupID: '0',
        estateID: '0',
        divisionID: '0',
        regNo: '0',
        fromDate: '',
        toDate: ''
    });

    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const [selectedCheckRollDeductionID, setSelectedCheckRollDeductionID] = useState(0);
    let encrypted = "";
    const handleClick = () => {
        encrypted = btoa('0');
        navigate('/app/checkRollDeduction/addEdit/' + encrypted);
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
        if (checkRollDeductionViewDetails.groupID > 0) {
            trackPromise(getEstateDetailsByGroupID());
        };
    }, [checkRollDeductionViewDetails.groupID]);

    useEffect(() => {
        if (checkRollDeductionViewDetails.estateID > 0) {
            trackPromise(
                getDivisionDetailsByEstateID());
        };
    }, [checkRollDeductionViewDetails.estateID]);

    useEffect(() => {
        if (IDDataForDeduction !== null) {
            getData();
        }
    }, [IDDataForDeduction]);

    async function getPermissions(IDdata) {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWCKROLLDEDUCTION');

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
            setCheckRollDeductionViewDetails({
                ...checkRollDeductionViewDetails,
                groupID: parseInt(tokenService.getGroupIDFromToken()),
                estateID: parseInt(tokenService.getFactoryIDFromToken())
            })
        }
        else {
            setCheckRollDeductionViewDetails({
                ...checkRollDeductionViewDetails,
                groupID: parseInt(tokenService.getGroupIDFromToken()),
                estateID: parseInt(tokenService.getFactoryIDFromToken()),
                divisionID: parseInt(IDdata.divisionID),
                regNo: IDdata.regNo,
                fromDate: IDdata.fromDate,
                toDate: IDdata.toDate
            })
            setIsIDDataForDeduction(IDdata)
        }
    }

    function createData(estimatedDate, itemCategory, itemName, department) {
        return { estimatedDate, itemCategory, itemName, department };
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(checkRollDeductionViewDetails.groupID);
        setEstates(response);
    };

    async function getDivisionDetailsByEstateID() {
        var response = await services.getDivisionDetailsByEstateID(checkRollDeductionViewDetails.estateID);
        setDivisions(response);
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

    function handleChange(e) {
        const target = e.target;
        const value = target.value
        setCheckRollDeductionViewDetails({
            ...checkRollDeductionViewDetails,
            [e.target.name]: value
        });
        setIsShowTable(false);
        setCheckRollDeductionViewData([]);
    }

    async function getData() {
        let model = {
            groupID: parseInt(checkRollDeductionViewDetails.groupID),
            estateID: parseInt(checkRollDeductionViewDetails.estateID),
            divisionID: parseInt(checkRollDeductionViewDetails.divisionID),
            regNo: checkRollDeductionViewDetails.regNo == '' ? null : checkRollDeductionViewDetails.regNo,
            fromDate: moment(checkRollDeductionViewDetails.fromDate.toString()).format().split('T')[0],
            toDate: moment(checkRollDeductionViewDetails.toDate.toString()).format().split('T')[0]
        }
        let response = await services.GetCheckRollDeductionViewDetail(model);
        if (response.statusCode == "Success" && response.data.length != 0) {

            setCheckRollDeductionViewData(response.data)
        }
        else {
            alert.error(response.message)
            clearFields();
        }
    }

    const handleClickEdit = (checkRollDeductionID) => {
        encrypted = btoa(checkRollDeductionID);
        let modelID = {
            groupID: parseInt(checkRollDeductionViewDetails.groupID),
            estateID: parseInt(checkRollDeductionViewDetails.estateID),
            divisionID: parseInt(checkRollDeductionViewDetails.divisionID),
            regNo: (checkRollDeductionViewDetails.regNo),
            fromDate: (checkRollDeductionViewDetails.fromDate),
            toDate: (checkRollDeductionViewDetails.toDate)
        };
        sessionStorage.setItem(
            'checkrollDeduction-listing-page-search-parameters-id',
            JSON.stringify(modelID)
        );
        navigate('/app/checkRollDeduction/addEdit/' + encrypted);
    }

    async function handleClickDelete(CheckRollDeductionID) {
        setSelectedCheckRollDeductionID(CheckRollDeductionID);
        setDeleteConfirmationOpen(true);
    }

    const handleConfirmDelete = async (checkRollDeductionViewData) => {
        setDeleteConfirmationOpen(false);
        let model = {
            CheckRollDeductionID: selectedCheckRollDeductionID,
            modifiedBy: parseInt(tokenService.getUserIDFromToken())
        }
        const res = await services.DeleteCheckRollDeduction(model);
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
                        toolTiptitle={"Add Deduction"}
                    />
                </Grid>
            </Grid>
        )
    }

    function clearFields() {
        setCheckRollDeductionViewDetails({
            ...checkRollDeductionViewDetails,
            divisionID: 0,
            regNo: '',
            fromDate: new Date().toISOString().substring(0, 10),
            toDate: new Date().toISOString().substring(0, 10),
        });
        setCheckRollDeductionViewData([]);
    }

    return (
        <Fragment>
            <LoadingComponent />
            <Page
                className={classes.root}
                title="Checkroll Deduction"
            >
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: checkRollDeductionViewDetails.groupID,
                            estateID: checkRollDeductionViewDetails.estateID,
                            divisionID: checkRollDeductionViewDetails.divisionID,
                            regNo: checkRollDeductionViewDetails.regNo,
                            fromDate: checkRollDeductionViewDetails.fromDate,
                            toDate: checkRollDeductionViewDetails.toDate
                        }}

                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group required').min("1", 'Group is required'),
                                estateID: Yup.number().required('Factory required').min("1", 'Factory is required'),
                                divisionID: Yup.number().required('Division is required').min('1', 'Division is required'),
                                fromDate: Yup.string(),
                                toDate: Yup.string(),
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
                                            title={cardTitle("CheckRoll Deduction")}
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
                                                            value={checkRollDeductionViewDetails.groupID}
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
                                                            value={checkRollDeductionViewDetails.estateID}
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
                                                        <InputLabel shrink id="divisionID">
                                                            Division *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.divisionID && errors.divisionID)}
                                                            helperText={touched.divisionID && errors.divisionID}
                                                            fullWidth
                                                            name="divisionID"
                                                            size='small'
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={checkRollDeductionViewDetails.divisionID}
                                                            variant="outlined"
                                                        >
                                                            <MenuItem value="0">--Select Division--</MenuItem>
                                                            {generateDropDownMenu(divisions)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="regNo">
                                                            Employee Number
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.regNo && errors.regNo)}
                                                            helperText={touched.regNo && errors.regNo}
                                                            fullWidth
                                                            size='small'
                                                            name="regNo"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={checkRollDeductionViewDetails.regNo}
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
                                                            value={checkRollDeductionViewDetails.fromDate}
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
                                                            value={checkRollDeductionViewDetails.toDate}
                                                            variant="outlined"
                                                            id="toDate"
                                                            size='small'
                                                            inputProps={{ max: new Date().toISOString().split('T')[0] }}
                                                        />
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
                                                {checkRollDeductionViewData.length > 0 ? (
                                                    <MaterialTable
                                                        title="Multiple Actions Preview"
                                                        columns={[
                                                            { title: 'Date', field: 'createdDate', render: rowData => moment(rowData.createdDate).format().split('T')[0] },
                                                            { title: 'Employee No', field: 'registrationNumber' },
                                                            { title: 'Employee Name', field: 'employeeName' },
                                                            { title: 'Deduction Type', field: 'deductionType' },
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

                                                        data={checkRollDeductionViewData}
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
                                                                onClick: (event, checkRollDeductionViewData) => handleClickEdit(checkRollDeductionViewData.checkRollDeductionID)
                                                            },
                                                            {
                                                                icon: 'delete',
                                                                tooltip: 'Delete',
                                                                onClick: (event, checkRollDeductionViewData) => handleClickDelete(checkRollDeductionViewData.checkRollDeductionID)
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