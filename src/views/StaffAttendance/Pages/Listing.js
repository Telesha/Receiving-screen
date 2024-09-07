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

const screenCode = 'STAFFATTENDANCE';

export default function StaffEmployeeAttendancesListing() {

    const classes = useStyles();
    const [attendanceData, setAttendanceData] = useState([]);
    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [isHideField, setIsHideField] = useState(true);
    const [employeeAttendances, setEmployeeAttendances] = useState({
        groupID: '0',
        factoryID: '0',
        date: ''
    })
    const alert = useAlert();
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/app/StaffAttendance/addedit');
    }

    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermissions());
    }, []);

    useEffect(() => {
        trackPromise(getFactoriesForDropdown());
    }, [employeeAttendances.groupID]);

    async function getPermissions() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWSTAFFATTENDANCE');

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

        setEmployeeAttendances({
            ...employeeAttendances,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getEmployeeAttendanceDetails() {
        let model = {
            groupID: parseInt(employeeAttendances.groupID),
            factoryID: parseInt(employeeAttendances.factoryID),
            attendanceDate: employeeAttendances.date,
        }
        const AttendanceDetails = await services.getEmployeeAttendanceDetailsByDate(model);
        if (AttendanceDetails.length != 0) {
            setAttendanceData(AttendanceDetails);
            setIsHideField(false);
        }
        else {
            alert.error("No record to display")
            setIsHideField(true);
        }
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getFactoriesForDropdown() {
        const factories = await services.getAllFactoriesByGroupID(employeeAttendances.groupID);
        setFactories(factories);
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
        setEmployeeAttendances({
            ...employeeAttendances,
            [e.target.name]: value
        });
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
                        toolTiptitle={"Add Staff Attendances"}
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
                title="View Staff Attendances"
            >
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: employeeAttendances.groupID,
                            factoryID: employeeAttendances.factoryID,
                            date: employeeAttendances.date
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group required').min("1", 'Group is required'),
                                factoryID: Yup.number().required('Factory required').min("1", 'Factory is required'),
                                date: Yup.date().required('Date is required')
                            })
                        }
                        onSubmit={() => trackPromise(getEmployeeAttendanceDetails())}
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
                                            title={cardTitle("View Staff Attendances")}
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
                                                            value={employeeAttendances.groupID}
                                                            variant="outlined"
                                                            size='small'
                                                            InputProps={{
                                                                readOnly: !permissionList.isGroupFilterEnabled,
                                                            }}

                                                        >
                                                            <MenuItem value="0">--Select Group--</MenuItem>
                                                            {generateDropDownMenu(groups)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="factoryID">
                                                            Factory  *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.factoryID && errors.factoryID)}
                                                            helperText={touched.factoryID && errors.factoryID}
                                                            fullWidth
                                                            name="factoryID"
                                                            onChange={(e) => handleChange(e)}
                                                            value={employeeAttendances.factoryID}
                                                            variant="outlined"
                                                            size='small'
                                                            InputProps={{
                                                                readOnly: !permissionList.isFactoryFilterEnabled,
                                                            }}

                                                        >
                                                            <MenuItem value="0">--Select Factory--</MenuItem>
                                                            {generateDropDownMenu(factories)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="date">
                                                            Date *
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.date && errors.date)}
                                                            helperText={touched.date && errors.date}
                                                            fullWidth
                                                            id="date"
                                                            name="date"
                                                            type="date"
                                                            size='small'
                                                            value={employeeAttendances.date}
                                                            onChange={(e) => handleChange(e)}
                                                            InputLabelProps={{
                                                                shrink: true,
                                                            }}

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
                                            <Box minWidth={1050} hidden={isHideField}>

                                                <MaterialTable
                                                    title="Multiple Actions Preview"
                                                    columns={[
                                                        { title: 'Date', field: 'attendanceDate', render: rowData => rowData.attendanceDate.split('T')[0] },
                                                        { title: 'Emp Name', field: 'fullName' },
                                                        { title: 'Reg No', field: 'registrationNumber' },
                                                        { title: 'Start Time', field: 'startTime' },
                                                        { title: 'End Time', field: 'endTime' }
                                                    ]}
                                                    data={attendanceData}
                                                    options={{
                                                        exportButton: false,
                                                        showTitle: false,
                                                        headerStyle: { textAlign: "left", height: '1%' },
                                                        cellStyle: { textAlign: "left" },
                                                        columnResizable: false,
                                                        actionsColumnIndex: -1,
                                                        pageSize: 10
                                                    }}
                                                />
                                            </Box>
                                        </PerfectScrollbar>
                                    </Card>
                                </Box>
                            </form>
                        )}
                    </Formik>
                </Container>
            </Page >
        </Fragment>
    );
};
