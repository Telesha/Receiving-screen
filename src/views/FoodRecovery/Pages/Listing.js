import React, { useState, useEffect, Fragment } from 'react';

import {
    Table,
    TableHead,
    TableRow,
    TableBody,
    TableCell,
} from '@material-ui/core';

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
import TableContainer from '@material-ui/core/TableContainer';
import moment from 'moment';
import Paper from '@material-ui/core/Paper';
import { useParams } from 'react-router-dom';
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import TablePagination from '@material-ui/core/TablePagination';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
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

const screenCode = 'FOODRECOVERY';

export default function FoodRecoveryListing(props) {

    const classes = useStyles();
    const navigate = useNavigate();
    const alert = useAlert();
    const { configurationDetailID } = useParams();
    const [groups, setGroups] = useState();
    const [estates, setEstates] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [isShowTable, setIsShowTable] = useState(false);
    const [fieldsForDropdown, setFieldsForDropDown] = useState([]);
    const [foodRecoverTableViewData, setFoodRecoverTableViewData] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(10);
    const [editedQuantity, setEditedQuantity] = useState(0);

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    const handleLimitChange = (event) => {
        setLimit(event.target.value);
    };

    const [totalValues, setTotalValues] = useState({
        quantity: 0,
        amount: 0
    });

    const [foodRecoveryViewDetails, setFoodRecoveryViewDetails] = useState({
        groupID: '0',
        estateID: '0',
        divisionID: '0',
        employeeNumber: '0',
        employeeName: '0',
        foodItemName: '',
        quantity: 0,
        amount: 0
    });

    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupID: '0',
        estateID: '0',
        divisionID: '0',
        year: '',
        month: '',
    });
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const [selectedFoodRecovery, setSelectedFoodRecovery] = useState(0);

    let encrypted = "";
    const handleClick = () => {
        encrypted = btoa('0');
        navigate('/app/FoodRecovery/addEdit/' + encrypted);
    }

    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });

    const handleClickEdit = (foodRecoveryID) => {
        encrypted = btoa(foodRecoveryID.toString());
        navigate('/app/FoodRecovery/addEdit/' + encrypted);
    };

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermissions());
    }, []);

    useEffect(() => {
        if (foodRecoveryViewDetails.groupID > 0) {
            trackPromise(getEstateDetailsByGroupID());
        };
    }, [foodRecoveryViewDetails.groupID]);

    useEffect(() => {
        if (foodRecoveryViewDetails.estateID > 0) {
            trackPromise(
                getDivisionDetailsByEstateID());
        };
    }, [foodRecoveryViewDetails.estateID]);

    useEffect(() => {
        setFoodRecoveryViewDetails({
            ...foodRecoveryViewDetails,
            employeeNumber: '0',
            month: ((new Date().getUTCMonth()) + 1).toString().padStart(2, '0'),
            year: ((new Date().getUTCFullYear())).toString()
        });
    }, [foodRecoveryViewDetails.divisionID, foodRecoveryViewDetails.fieldID]);

    useEffect(() => {
        if (foodRecoverTableViewData.length != 0) {
            calculateTotalQty()
        }
    }, [foodRecoverTableViewData]);

    async function getPermissions() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWFOODRECOVERY');

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

        setFoodRecoveryViewDetails({
            ...foodRecoveryViewDetails,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            estateID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }


    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
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

    function handleChange(e) {
        const target = e.target;
        const value = target.value
        setFoodRecoveryViewDetails({
            ...foodRecoveryViewDetails,
            [e.target.name]: value
        });
        setIsShowTable(false);
        setFoodRecoverTableViewData([]);
    }

    async function getData() {
        setFoodRecoverTableViewData([]);
        let model = {
            groupID: parseInt(foodRecoveryViewDetails.groupID),
            estateID: parseInt(foodRecoveryViewDetails.estateID),
            divisionID: parseInt(foodRecoveryViewDetails.divisionID),
            month: foodRecoveryViewDetails.month,
            year: foodRecoveryViewDetails.year,
        };
        getSelectedDropdownValuesForReport(model);

        let response = await services.GetFoodRecoveryDetails(model);

        if (response.statusCode == "Success" && response.data.length != 0) {
            getSelectedDropdownValuesForReport(model);
            setFoodRecoverTableViewData(response.data)
        }
        else {
            alert.error("No records to display")
        }
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(foodRecoveryViewDetails.groupID);
        setEstates(response);
    };

    async function getDivisionDetailsByEstateID() {
        var response = await services.getDivisionDetailsByEstateID(foodRecoveryViewDetails.estateID);
        setDivisions(response);
    };

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: groups[searchForm.groupID],
            estateName: estates[searchForm.estateID],
            divisionName: divisions[searchForm.divisionID]
        });
    }

    function calculateTotalQty() {
        const quantity = foodRecoverTableViewData.reduce((accumulator, current) => accumulator + parseInt(current.quantity), 0);
        const amount = foodRecoverTableViewData.reduce((accumulator, current) => accumulator + parseInt(current.amount), 0);

        setTotalValues({
            ...totalValues,
            quantity: quantity,
            amount: amount
        })
    }

    function handleClickDelete(foodRecoveryID) {
        setSelectedFoodRecovery(foodRecoveryID);
        setDeleteConfirmationOpen(true);
    }

    const handleConfirmDelete = async (foodRecoverTableViewData) => {

        setDeleteConfirmationOpen(false);


        let model = {
            foodRecoveryID: selectedFoodRecovery,
            modifiedBy: parseInt(tokenService.getUserIDFromToken())
        }
        const res = await services.DeleteFoodRecovery(model);
        if (res.statusCode == "Success") {
            alert.success(res.message)
            getData()
        }
        else {
            alert.error(res.message)
        }
    };

    const handleCancelDelete = () => {
        setDeleteConfirmationOpen(false);
    };

    function handleDateChange(date) {
        let monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        var month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
        var year = date.getUTCFullYear();
        let monthName = monthNames[month - 1];

        setFoodRecoveryViewDetails({
            ...foodRecoveryViewDetails,
            month: month.toString(),
            year: year.toString()
        });
        setSelectedDate(date);
        setFoodRecoverTableViewData([]);
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
                        toolTiptitle={"Add Food Recovery"}
                    />
                </Grid>
            </Grid>
        )
    }

    return (
        <Fragment>
            <LoadingComponent />
            <Page
                className={classes.root}
                title="Food Recovery"
            >
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: foodRecoveryViewDetails.groupID,
                            estateID: foodRecoveryViewDetails.estateID,
                            divisionID: foodRecoveryViewDetails.divisionID,
                            date: foodRecoveryViewDetails.date

                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group required').min("1", 'Group is required'),
                                estateID: Yup.number().required('Factory required').min("1", 'Factory is required'),
                                divisionID: Yup.number().required('Division is required').min('1', 'Division is required'),
                                date: Yup.string()
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
                                            title={cardTitle("Food Recovery")}
                                        />
                                        <PerfectScrollbar>
                                            <Divider />
                                            <CardContent style={{ marginBottom: "2rem" }}>
                                                <Grid container spacing={3}>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="groupID">
                                                            Group  *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.groupID && errors.groupID)}
                                                            helperText={touched.groupID && errors.groupID}
                                                            fullWidth
                                                            name="groupID"
                                                            onChange={(e) => handleChange(e)}
                                                            value={foodRecoveryViewDetails.groupID}
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
                                                    <Grid item md={3} xs={12}>
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
                                                            value={foodRecoveryViewDetails.estateID}
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
                                                    <Grid item md={3} xs={12}>
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
                                                            value={foodRecoveryViewDetails.divisionID}
                                                            variant="outlined"
                                                            defaultValue={0}
                                                        >
                                                            <MenuItem value="0">--Select Division--</MenuItem>
                                                            {generateDropDownMenu(divisions)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={3} xs={12}>
                                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                            <DatePicker
                                                                autoOk
                                                                variant="inline"
                                                                openTo="month"
                                                                views={['year', 'month']}
                                                                label="Year and Month *"
                                                                helperText="Select applicable month"
                                                                value={selectedDate}
                                                                disableFuture={true}
                                                                onChange={date => handleDateChange(date)}
                                                                size="small"
                                                            />
                                                        </MuiPickersUtilsProvider>

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
                                                {foodRecoverTableViewData.length > 0 ? (
                                                    <Box minWidth={1050}>
                                                        <TableContainer component={Paper} style={{ maxHeight: '550px', overflowY: 'auto' }}>
                                                            <Table aria-label="simple table" Table>
                                                                <TableHead>
                                                                    <TableRow>
                                                                        <TableCell align="left" style={{ fontWeight: "bold", border: "2px solid black", borderWidth: 0 }}>Employee Number</TableCell>
                                                                        <TableCell align="left" style={{ fontWeight: "bold", border: "2px solid black", borderWidth: 0 }}>Employee Name</TableCell>
                                                                        <TableCell align="left" style={{ fontWeight: "bold", border: "2px solid black", borderWidth: 0 }}>Food Item Name</TableCell>
                                                                        <TableCell align="right" style={{ fontWeight: "bold", border: "2px solid black", borderWidth: 0 }}>Quantity</TableCell>
                                                                        <TableCell align="right" style={{ fontWeight: "bold", border: "2px solid black", borderWidth: 0 }}>Total Amount (Rs.)</TableCell>
                                                                        <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", borderWidth: 0 }}>Action</TableCell>
                                                                    </TableRow>
                                                                </TableHead>
                                                                <TableBody>
                                                                    {foodRecoverTableViewData
                                                                        .slice(page * limit, page * limit + limit)
                                                                        .map((row, i) => (
                                                                            <TableRow key={i}>
                                                                                <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black", borderWidth: 0 }}> {row.employeeNumber !== null ? row.employeeNumber : "-"}</TableCell>
                                                                                <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black", borderWidth: 0 }}> {row.employeeName !== null ? row.employeeName : "-"}</TableCell>
                                                                                <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black", borderWidth: 0 }}> {row.foodItemName !== null ? row.foodItemName : "-"}</TableCell>
                                                                                <TableCell component="th" scope="row" align="right" style={{ border: "2px solid black", borderWidth: 0 }}> {Number(row.quantity)}</TableCell>
                                                                                <TableCell component="th" scope="row" align="right" style={{ border: "2px solid black", borderWidth: 0 }}> {Number(row.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                <TableCell align="center" style={{ borderBottom: "none", border: "2px solid black", borderWidth: 0 }}>
                                                                                    <EditIcon
                                                                                        style={{
                                                                                            color: "#6C625B",
                                                                                            marginBottom: "-1rem",
                                                                                            marginTop: "0rem",
                                                                                            cursor: "pointer"
                                                                                        }}
                                                                                        size="small"
                                                                                        onClick={() => handleClickEdit(row.foodRecoveryID)}
                                                                                    >
                                                                                    </EditIcon>
                                                                                    &nbsp;&nbsp;&nbsp;
                                                                                    <DeleteIcon
                                                                                        style={{
                                                                                            color: "#6C625B",
                                                                                            marginBottom: "-1rem",
                                                                                            marginTop: "0rem",
                                                                                            cursor: "pointer"
                                                                                        }}
                                                                                        size="small"
                                                                                        onClick={() => handleClickDelete(row.foodRecoveryID)}
                                                                                    >
                                                                                    </DeleteIcon>
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        ))
                                                                    }
                                                                </TableBody>
                                                                <TableRow>
                                                                    <TableCell align={'left'} style={{ borderBottom: "none", border: "2px solid black", color: "red", borderWidth: 0 }}><b>Total</b></TableCell>
                                                                    <TableCell style={{ borderBottom: "none", border: "2px solid black", borderWidth: 0 }} ></TableCell>
                                                                    <TableCell style={{ borderBottom: "none", border: "2px solid black", borderWidth: 0 }}></TableCell>
                                                                    <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "2px solid black", color: "red", borderWidth: 0 }}>
                                                                        <b>{Number(totalValues.quantity)}</b>
                                                                    </TableCell>
                                                                    <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "2px solid black", color: "red", borderWidth: 0 }}>

                                                                        <b>{Number(totalValues.amount).toLocaleString('en-US', {
                                                                            minimumFractionDigits: 2,
                                                                            maximumFractionDigits: 2
                                                                        })}</b>
                                                                    </TableCell>
                                                                    <TableCell style={{ borderBottom: "none", border: "2px solid black", borderWidth: 0 }}></TableCell>
                                                                </TableRow>
                                                            </Table>
                                                            <TablePagination
                                                                component="div"
                                                                count={foodRecoverTableViewData.length}
                                                                onChangePage={handlePageChange}
                                                                onChangeRowsPerPage={handleLimitChange}
                                                                page={page}
                                                                rowsPerPage={limit}
                                                                rowsPerPageOptions={[5, 10, 25]}
                                                            />
                                                        </TableContainer>

                                                    </Box>
                                                ) : null}
                                            </Box>
                                            <Dialog open={deleteConfirmationOpen} onClose={handleCancelDelete}>
                                                <DialogTitle>Delete Confirmation</DialogTitle>
                                                <DialogContent>
                                                    <p>Are you sure you want to delete this record?</p>
                                                </DialogContent>
                                                <DialogActions>
                                                    <Button
                                                        onClick={handleCancelDelete} color="primary">
                                                        Cancel
                                                    </Button>
                                                    <Button onClick={handleConfirmDelete} color="primary">
                                                        Delete
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