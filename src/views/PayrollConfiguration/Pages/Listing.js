import React, { useState, useEffect, Fragment } from 'react';
import {
    Box,
    Card,
    makeStyles,
    Container,
    Divider,
    CardContent,
    Grid,
    TextField,
    MenuItem,
    InputLabel,
    CardHeader,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { LoadingComponent } from 'src/utils/newLoader';
import { useAlert } from "react-alert";
import PageHeader from 'src/views/Common/PageHeader';
import { Formik } from 'formik';
import * as Yup from "yup";
import MaterialTable from 'material-table';

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
    succes: {
        backgroundColor: "#fce3b6",
        marginLeft: "15px",
        marginBottom: "5px"
    }
}));

const screenCode = 'PAYROLLCONFIGURATION';

export default function  PayrollConfiguration() {
    const [title, setTitle] = useState("Payroll Configuration");
    const classes = useStyles();
    const alert = useAlert();
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });
    const [groups, setGroups] = useState([]);
    const [estate, setEstate] = useState([]);
    const [designation, setDesignation] = useState([]);
    const [allowanceData, setAllowanceData] = useState([]);
    const [isShowTable, setIsShowTable] = useState(false);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const [selectedPayRollDesignationWiseAllowanceTypeID, setSelectedPayRollDesignationWiseAllowanceTypeID] = useState(0);
    const [payrollConfigSearch, setPayrollConfigSearch] = useState({
        groupID: '0',
        estateID: '0',
        designationID: '0',
        allowanceTypeID: '0',
    })
    const [isDisable, setIsDisable] = useState(false);
    const navigate = useNavigate();
    const [page, setPage] = useState(0);
    const [IDDataForDefaultLoad, setIsIDDataForDefaultLoad] = useState(null);

    let encrypted = "";

    const handleClick = () => {
        encrypted = btoa('0');
        navigate('/app/payrollConfiguration/addEdit/' + encrypted)
    }

    useEffect(() => {
        const IDdata = JSON.parse(
            sessionStorage.getItem('payrollConfiguration-page-search-parameters-id')
        );
        trackPromise(
            getPermission(IDdata),
            getGroupsForDropdown(),
        );
    }, []);

    useEffect(() => {
        sessionStorage.removeItem(
            'payrollConfiguration-page-search-parameters-id'
        );
    }, []);

    useEffect(() => {
        trackPromise(
            getEstateDetailsByGroupID()
        )
    }, [payrollConfigSearch.groupID])

    useEffect(() => {
        trackPromise(
            getDesignationsForDropdown()
        )
    }, [payrollConfigSearch.estateID])

    useEffect(() => {
        setIsDisable();
    }, [payrollConfigSearch.groupID, payrollConfigSearch.estateID]);

    async function getPermission(IDdata) {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWPAYROLLCONFIGURATION');

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
        const isInitialLoad = IDdata === null
        if (isInitialLoad) {
            setPayrollConfigSearch({
                ...payrollConfigSearch,
                groupID: parseInt(tokenService.getGroupIDFromToken()),
                estateID: parseInt(tokenService.getFactoryIDFromToken()),
            });
        }
        else {
            setPayrollConfigSearch({
                ...payrollConfigSearch,
                groupID: IDdata.groupID,
                estateID: IDdata.estateID,
                designationID: IDdata.designationID
            });
            setPage(IDdata.page)
            setIsIDDataForDefaultLoad(IDdata)
            loadPreviousData(IDdata);
        }
    }

    async function loadPreviousData(IDdata) {
        let model = {
            groupID: parseInt(IDdata.groupID),
            estateID: parseInt(IDdata.estateID),
            designationID: parseInt(IDdata.designationID)
        }
        let item = await services.getAllAllowanceDetails(model);
        if (item.data.length !== 0 && item.statusCode === 'Success') {
            setAllowanceData(item.data);
            setIsShowTable(true);
        } else {
            setAllowanceData(item.data);
            alert.error("No Records To Display")
        }
    }
    async function getGroupsForDropdown() {
        const groups = await services.getGroupsForDropdown();
        setGroups(groups);
    }

    async function getDesignationsForDropdown() {
        const designation = await services.getDesignationsForDropdownByEstateID(payrollConfigSearch.estateID);
        setDesignation(designation);
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstatesByGroupID(payrollConfigSearch.groupID);
        setEstate(response);
    }

    async function getAllowancesByGroupIDEstateIDDesignationID() {

        let model = {
            groupID: parseInt(payrollConfigSearch.groupID),
            estateID: parseInt(payrollConfigSearch.estateID),
            designationID: parseInt(payrollConfigSearch.designationID)
        }
        let item = await services.getAllAllowanceDetails(model);
        if (item.data.length !== 0 && item.statusCode === 'Success') {
            setAllowanceData(item.data);
            setIsShowTable(true);

        } else {
            setAllowanceData(item.data);
            alert.error("No Records To Display")
        }
    }

    const handleClickEdit = (designationWiseAllowanceTypeID) => {
        encrypted = btoa(designationWiseAllowanceTypeID);
        let modelID = {
            groupID: parseInt(payrollConfigSearch.groupID),
            estateID: parseInt(payrollConfigSearch.estateID),
            designationID: parseInt(payrollConfigSearch.designationID),
            allowanceTypeID: parseInt(payrollConfigSearch.allowanceTypeID),
            page: page

        };
        sessionStorage.setItem('payrollConfiguration-page-search-parameters-id', JSON.stringify(modelID));
        navigate('/app/payrollConfiguration/addEdit/' + encrypted);
    }

    async function handleClickDelete(designationWiseAllowanceTypeID) {
        setSelectedPayRollDesignationWiseAllowanceTypeID(designationWiseAllowanceTypeID);
        setDeleteConfirmationOpen(true);
    }

    const handleConfirmDelete = async () => {
        setDeleteConfirmationOpen(false);
        let model = {
            designationWiseAllowanceTypeID: selectedPayRollDesignationWiseAllowanceTypeID,
            modifiedBy: parseInt(tokenService.getUserIDFromToken())
        }
        const res = await services.DeleteAllowance(model);
        if (res.statusCode == "Success") {
            alert.success(res.message)
            trackPromise(getAllowancesByGroupIDEstateIDDesignationID())
        }
        else {
            alert.error(res.message)
        }
    };

    const handleCancelDelete = () => {
        setDeleteConfirmationOpen(false);
    };


    function handleChange(e) {
        const target = e.target;
        const value = target.value
        setPayrollConfigSearch({
            ...payrollConfigSearch,
            [e.target.name]: value,
        });
        setAllowanceData([]);
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
                <Grid item md={2} xs={12}>
                    <PageHeader
                        onClick={handleClick}
                        isEdit={true}
                        toolTiptitle={"Add Payroll Configurations"}
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
                    <Formik
                        initialValues={{
                            groupID: payrollConfigSearch.groupID,
                            estateID: payrollConfigSearch.estateID,
                            designationID: payrollConfigSearch.designationID
                        }}

                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                                estateID: Yup.number().required('Estate is required').min("1", 'Estate is required'),
                                designationID: Yup.number().required('Designation is required').min("1", 'Designation is required'),
                            })
                        }
                        onSubmit={() => trackPromise(getAllowancesByGroupIDEstateIDDesignationID())}
                        enableReinitialize
                    >
                        {({
                            errors,
                            handleSubmit,
                            touched
                        }) => (
                            <form onSubmit={handleSubmit}>
                                <Box mt={0}>
                                    <Card>
                                        <CardHeader
                                            title={cardTitle(title)}
                                        />
                                        <PerfectScrollbar>
                                            <Divider />
                                            <CardContent style={{ marginBottom: "2rem" }}>
                                                <Grid container spacing={3}>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="groupID">
                                                            Group *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.groupID && errors.groupID)}
                                                            fullWidth
                                                            helperText={touched.groupID && errors.groupID}
                                                            size='small'
                                                            name="groupID"
                                                            onChange={(e) => handleChange(e)}
                                                            value={payrollConfigSearch.groupID}
                                                            variant="outlined"
                                                            id="groupID"
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
                                                            size='small'
                                                            name="estateID"
                                                            onChange={(e) => handleChange(e)}
                                                            value={payrollConfigSearch.estateID}
                                                            variant="outlined"
                                                            id="estateID"
                                                            InputProps={{
                                                                readOnly: !permissionList.isFactoryFilterEnabled,
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Estate--</MenuItem>
                                                            {generateDropDownMenu(estate)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="designationID">
                                                            Designation *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.designationID && errors.designationID)}
                                                            fullWidth
                                                            helperText={touched.designationID && errors.designationID}
                                                            size='small'
                                                            name="designationID"
                                                            onChange={(e) => handleChange(e)}
                                                            value={payrollConfigSearch.designationID}
                                                            variant="outlined"
                                                            id="designationID"
                                                            InputProps={{
                                                                readOnly: !permissionList.isFactoryFilterEnabled,
                                                            }}
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
                                                {allowanceData.length > 0 && isShowTable ? (
                                                    <MaterialTable
                                                        title="Multiple Actions Preview"
                                                        columns={[
                                                            {
                                                                title: 'Allowance Type Name', field: 'allowanceTypeName',
                                                                headerStyle: {
                                                                    textAlign: 'left',
                                                                    paddingRight: '200px',
                                                                },
                                                            },
                                                            {
                                                                title: 'Amount (Rs.)',
                                                                field: 'amount',
                                                                render: rowData => rowData.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                                                                cellStyle: {
                                                                    textAlign: 'right',
                                                                    paddingRight: '550px',
                                                                },
                                                                headerStyle: {
                                                                    textAlign: 'left',
                                                                    paddingRight: '200px',
                                                                },
                                                            }
                                                        ]}
                                                        data={allowanceData}
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
                                                                icon: 'mode',
                                                                tooltip: 'Edit Allowance',
                                                                onClick: (event, rowData) => { handleClickEdit(rowData.designationWiseAllowanceTypeID) }
                                                            },
                                                            {
                                                                icon: 'delete',
                                                                tooltip: 'Delete',
                                                                onClick: (event, rowData) => handleClickDelete(rowData.designationWiseAllowanceTypeID)
                                                            }
                                                        ]}
                                                    />
                                                ) : null}
                                            </Box>
                                            <Dialog open={deleteConfirmationOpen} onClose={handleCancelDelete}>
                                                <DialogTitle>Delete Confirmation</DialogTitle>
                                                <DialogContent>
                                                    <p>Are you sure you want to delete this record ?</p>
                                                </DialogContent>
                                                <DialogActions>
                                                    <Button
                                                        onClick={handleConfirmDelete} color="primary">
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
            </Page>
        </Fragment >
    )
}