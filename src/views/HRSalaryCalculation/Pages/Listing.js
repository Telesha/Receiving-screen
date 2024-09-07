import React, { useState, useEffect, createContext } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Box,
    Card,
    makeStyles,
    Container,
    CardContent,
    Divider,
    MenuItem,
    Grid,
    InputLabel,
    TextField,
    CardHeader,
    Button
} from '@material-ui/core';
import {
    startOfMonth,
    endOfMonth,
    addMonths
} from 'date-fns';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import VisibilityIcon from '@material-ui/icons/Visibility';
import MaterialTable from "material-table";
import EventIcon from '@material-ui/icons/Event';
import Popover from '@material-ui/core/Popover';
import { useAlert } from "react-alert";
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from "yup";
import moment from 'moment';
import { DatePicker, MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.dark,
        minHeight: '100%',
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3)
    },
}));

const screenCode = 'HRSALARYCALCULATION';
export default function HREmployeesList() {
    const classes = useStyles();
    const [limit, setLimit] = useState(10);
    const [title, setTitle] = useState("Employee Salaries")
    const [page, setPage] = useState(0);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [employeeData, setEmployeeData] = useState([]);
    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [factoryItems, setFactoryItems] = useState();
    const [employeeList, setEmployeeList] = useState({
        groupID: '0',
        factoryID: '0',
        routeID: '0',
        nic: '',
        regNo: '',
        month: '',
        createdDate: ''
    })
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;
    const navigate = useNavigate();
    let encrypted = "";
    const handleClick = () => {
        encrypted = btoa('0');
        navigate('/app/HRSalaryCalculation/viewSalary/' + encrypted);
    }
    const handleClickEdit = (employeeData) => {

        encrypted = btoa(employeeData.employeeID.toString());
        navigate('/app/HRSalaryCalculation/viewSalary/' + encrypted, {
            state: {
                employeeDetails: employeeData
            }
        });
    }
    const alert = useAlert();

    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });
    useEffect(() => {
        trackPromise(
            getGroupsForDropdown(),
            getPermission());
    }, []);

    useEffect(() => {
        trackPromise(
            getfactoriesForDropDown()
        );
    }, [employeeList.groupID]);

    useEffect(() => {
        trackPromise(
            getFactoryItemsByFactoryID()

        )
    }, [employeeList.factoryID]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWHRSALARYCALCULATIONLISTING');

        if (isAuthorized === undefined) {
            navigate('/404');
        }
        var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
        var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');

        setPermissions({
            ...permissionList,
            isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
            isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined
        });

        setEmployeeList({
            ...employeeList,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }


    async function getfactoriesForDropDown() {
        const factory = await services.getfactoriesForDropDown(employeeList.groupID);
        setFactories(factory);
    }

    async function getFactoryItemsByFactoryID() {
        const items = await services.getFactoryItemsByFactoryID(employeeList.factoryID);
        setFactoryItems(items);
    }

    async function getGroupsForDropdown() {
        const groups = await services.getGroupsForDropdown();
        setGroups(groups);
    }


    function handleDateChange(date) {
        let monthNames = ["JAN", "FEB", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUG", "SEPT", "OCT", "NOV", "DEC"];
        var monthh = date.getUTCMonth() + 1; //months from 1-12
        var year = date.getUTCFullYear();
        var currentmonth = moment().format('MM');
        let monthName = monthNames[monthh - 1];

        setEmployeeList({
            ...employeeList,
            month: monthh
        })

        setSelectedDate(date)
    }

    async function GetDetails() {
        let model = {
            groupID: parseInt(employeeList.groupID),
            factoryID: parseInt(employeeList.factoryID),
            month: (employeeList.month).toString(),
            nIC: (employeeList.nic).toString(),
            regNo: (employeeList.regNo).toString()
        }

        const employeeData = await services.getAllEmployees(model);

        if (employeeData.statusCode == "Success" && employeeData.data != null) {
            setEmployeeData(employeeData.data);
            if (employeeData.data.length == 0) {
                alert.error("No records to display");
            }
        }
        else {
            alert.error("Error");
        }
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
        setEmployeeList({
            ...employeeList,
            [e.target.name]: value
        });
        setEmployeeData([]);
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

    return (
        <Page
            className={classes.root}
            title="Employee Salaries"
        >
            <Container maxWidth={false}>
                <Formik
                    initialValues={{
                        groupID: employeeList.groupID,
                        factoryID: employeeList.factoryID,
                        nic: employeeList.nic,
                        regNo: employeeList.regNo
                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                            factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required')
                     })
                    }
                    enableReinitialize
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
                                        title={cardTitle(title)}
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
                                                        fullWidth
                                                        helperText={touched.groupID && errors.groupID}
                                                        name="groupID"
                                                        onChange={(e) => handleChange(e)}
                                                        value={employeeList.groupID}
                                                        variant="outlined"
                                                        size='small'
                                                        disabled={!permissionList.isGroupFilterEnabled}
                                                    >
                                                        <MenuItem value="0">--Select Group--</MenuItem>
                                                        {generateDropDownMenu(groups)}
                                                    </TextField>
                                                </Grid>

                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="factoryID">
                                                        Factory *
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.factoryID && errors.factoryID)}
                                                        fullWidth
                                                        helperText={touched.factoryID && errors.factoryID}
                                                        name="factoryID"
                                                        onChange={(e) => handleChange(e)}
                                                        value={employeeList.factoryID}
                                                        variant="outlined"
                                                        id="factoryID"
                                                        size='small'
                                                        disabled={!permissionList.isFactoryFilterEnabled}
                                                    >
                                                        <MenuItem value="0">--Select Factory--</MenuItem>
                                                        {generateDropDownMenu(factories)}
                                                    </TextField>
                                                </Grid>

                                                <Grid item md={3} xs={12}>
                                                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                        <DatePicker
                                                            autoOk
                                                            variant="inline"
                                                            openTo="year"
                                                            views={["month"]}
                                                            format="MM"
                                                            label="Month *"
                                                            helperText="Month"
                                                            value={selectedDate}
                                                            onChange={(date) => handleDateChange(date)}
                                                        />
                                                    </MuiPickersUtilsProvider>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="regNo">
                                                        Registration Number
                                                    </InputLabel>

                                                    <TextField
                                                        error={Boolean(touched.regNo && errors.regNo)}
                                                        fullWidth
                                                        helperText={touched.regNo && errors.regNo}
                                                        name="regNo"
                                                        onChange={(e) => {
                                                            handleChange(e)
                                                        }}
                                                        handleBlur={handleBlur}
                                                        size='small'
                                                        value={employeeList.regNo}
                                                        variant="outlined"
                                                        id="regNo"
                                                    >
                                                    </TextField>
                                                </Grid>

                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="nic">
                                                        NIC
                                                    </InputLabel>

                                                    <TextField
                                                        error={Boolean(touched.nic && errors.nic)}
                                                        fullWidth
                                                        helperText={touched.nic && errors.nic}
                                                        name="nic"
                                                        onChange={(e) => {
                                                            handleChange(e)
                                                        }}
                                                        handleBlur={handleBlur}
                                                        value={employeeList.nic}
                                                        size='small'
                                                        variant="outlined"
                                                        id="nic"
                                                    >
                                                    </TextField>
                                                </Grid>

                                                <Grid container justify="flex-end">
                                                    <Box pr={2}>
                                                        <Button
                                                            color="primary"
                                                            variant="contained"
                                                            type="submit"
                                                            size='small'
                                                            onClick={() => GetDetails()}
                                                        >
                                                            Search
                                                        </Button>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                        <Box minWidth={1000} >
                                            {/* {employeeData.length > 0 ? */}
                                            <MaterialTable
                                                title="Multiple Actions Preview"
                                                columns={[

                                                    { title: 'Employee ID', field: 'employeeID' },
                                                    { title: 'Name', field: 'fullName' },
                                                    { title: 'Reg Number', field: 'registrationNumber' },
                                                    { title: 'NIC', field: 'nicNumber' },
                                                    { title: 'Month', field: 'month' },
                                                    { title: 'Contact Number', field: 'contactNumber' },
                                                ]}
                                                data={employeeData}
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
                                                        icon: () => <VisibilityIcon />,
                                                        tooltip: 'View',
                                                        onClick: (event, employeeData) => handleClickEdit(employeeData)
                                                    }
                                                ]}
                                            />
                                            {/* : null} */}
                                        </Box>
                                    </PerfectScrollbar>
                                </Card>
                            </Box>
                        </form>
                    )}
                </Formik>
            </Container>
        </Page>
    );
};

