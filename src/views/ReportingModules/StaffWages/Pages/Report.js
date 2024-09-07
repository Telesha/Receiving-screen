import React, { useState, useEffect, Fragment, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
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
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import * as Yup from "yup";
import { LoadingComponent } from 'src/utils/newLoader';
import { Formik } from 'formik';
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import moment from 'moment';
import MaterialTable from "material-table";
import { useAlert } from "react-alert";
import VisibilityIcon from '@material-ui/icons/Visibility';

import Dialog from '@material-ui/core/Dialog';
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
    colorCancel: {
        backgroundColor: "red",
    },
    colorRecordAndNew: {
        backgroundColor: "#FFBE00"
    },
    colorRecord: {
        backgroundColor: "green",
    }
}));



const screenCode = 'STAFFWAGES';

export default function StaffWages(props) {
    const [title, setTitle] = useState("Staff Wages")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [routes, setRoutes] = useState();
    const [balance, setBalance] = useState(false);
    const [open, setOpen] = React.useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [staffWagesInput, setStaffWagesInput] = useState({
        groupID: '0',
        factoryID: '0',
        routeID: '0',
        year: '',
        month: ''
    })
    const [isTableHide, setIsTableHide] = useState(true);
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });
    const alert = useAlert();
    function createData(empNo, empName, empType, disbersmentType, totalEarnings) {
        return { empNo, empName, empType, disbersmentType, totalEarnings };
    }
    const rows = [
        createData("3661", "G.JAYASEELY", "Permenent", "Cash", "86000.00" ),
        createData("5147", "A.T.C.CHANDRA MALKANTHY", "Permenent",  "Cash", "79800.00"),
        createData("3737", "V.SELLAIE", "Tempory",  "Cash",  "89400.00"),
        createData("4614", "K.SITHAMBARAM", "Tempory",  "Bank",  "71700.00"),
        createData("5140", "M.SHANMUGAPRIYA", "Permenent", "Bank", "78900.00"),
        // createData("4797", "M.SHANMUGAPRIYA", "Register", "Bank", "30000.00", "0.00", "30000.00"),
        // createData("20001", "K.RAMAIE", "Contract", "Cash Kilo", "Cash", "15500.00", "960.00", "14540.00"),
        // createData("20006", "A.SELLAMMAH", "Contract", "Cash Kilo", "Cash", "29500.00", "1500.00", "28000.00"),
        // createData("20037", "C.ANTHONIAMMAH", "Contract", "Cash Kilo", "Cash", "22000.00", "1000.00", "21000.00"),
        // createData("20002", "J.k.MARIAIE", "Contract", "RSM", "Cash", "45000.00", "2560.00", "42440.00"),

        // createData("5718", "R.G.GANESHAMOORTHY", "Registered", "Sundry", "Cash", "25500", "750", "24750.00"),
        // createData("5962", "R.WIJAYAKUMAR", "Registered", "Sundry", "Cash", "17000", "500", "16500.00"),
        // createData("5832", "R.RAJALETCHUMY", "Registered", "Sundry", "Cash", "22000", "1000", "21000.00"),
        // createData("5931", "S.K.ROSHAN", "Registered", "Sundry", "Cash", "18500", "1500", "17000.00"),
        // createData("5961", "M.THIRUMONEY", "Registered", "Sundry", "Cash", "10500", "0", "10500.00"),

    ];
    const navigate = useNavigate();

      const handleClose = () => {
        setOpen(false);
      };


      let encrypted = "";
      const handleClickEdit = (id) => {
        encrypted = btoa(id);
        navigate('/app/StaffWages/viewStaffWages/' + encrypted);
    }

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission());
    }, []);

    useEffect(() => {
        trackPromise(getFactoriesForDropDown());
    }, [staffWagesInput.groupID]);

    useEffect(() => {
        trackPromise(
            getRoutesByFactoryID()
        )
    }, [staffWagesInput.factoryID]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWSTAFFWAGES');



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

        setStaffWagesInput({
            ...staffWagesInput,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }
    async function getFactoriesForDropDown() {
        const factory = await services.getFactoryByGroupID(staffWagesInput.groupID);
        setFactories(factory);
    }

    async function getRoutesByFactoryID() {
        const route = await services.getRoutesForDropDown(staffWagesInput.factoryID);
        setRoutes(route);
    }

    async function GetDetails() {
        await timeout(1000);
        setIsTableHide(false);
        setBalance(true)
    }
    function timeout(delay) {
        return new Promise(res => setTimeout(res, delay));
    }
    async function ClearTable() {
        clearState();
    }
    function clearState() {
        setStaffWagesInput({
            ...staffWagesInput,
            routeID: '0',
            year: '',
            month: ''
        });
        setIsTableHide(true);
        setBalance(false)
    }
    async function Cancel() {
        setIsTableHide(true);
        setBalance(false)
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

    function handleDateChange(date) {
        let monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        var month = date.getUTCMonth() + 1; //months from 1-12
        var year = date.getUTCFullYear();
        var currentmonth = moment().format('MM');
        let monthName = monthNames[month - 1];

        setStaffWagesInput({
            ...staffWagesInput,
            month: month.toString(),
            year: year.toString()
        });

        if (selectedDate != null) {

            var prevMonth = selectedDate.getUTCMonth() + 1
            var prevyear = selectedDate.getUTCFullYear();

            if ((prevyear == year && prevMonth != month) || (prevyear != year)) {
                setSelectedDate(date)
                //setSearchStarted(true)

            }
        } else {
            setSelectedDate(date)
            //setSearchStarted(true)
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

    function handleChange(e) {
        const target = e.target;
        const value = target.value
        setStaffWagesInput({
            ...staffWagesInput,
            [e.target.name]: value
        });
    }

    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: staffWagesInput.groupID,
                            factoryID: staffWagesInput.factoryID
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
                                            <CardContent>
                                                <Grid container spacing={3}>
                                                    <Grid item md={3} xs={8}>
                                                        <InputLabel shrink id="groupID">
                                                            Group *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.groupID && errors.groupID)}
                                                            fullWidth
                                                            helperText={touched.groupID && errors.groupID}
                                                            name="groupID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={staffWagesInput.groupID}
                                                            variant="outlined"
                                                            id="groupID"
                                                            size='small'

                                                        >
                                                            <MenuItem value="0">--Select Group--</MenuItem>
                                                            <MenuItem value="1">Ispahani</MenuItem>
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={3} xs={8}>
                                                        <InputLabel shrink id="factoryID">
                                                            Estate *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.factoryID && errors.factoryID)}
                                                            fullWidth
                                                            helperText={touched.factoryID && errors.factoryID}
                                                            name="factoryID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={staffWagesInput.factoryID}
                                                            variant="outlined"
                                                            id="factoryID"
                                                            size='small'

                                                        >
                                                            <MenuItem value="0">--Select Factory--</MenuItem>
                                                            <MenuItem value="1">Ispahani</MenuItem>
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={3} xs={8}>
                                                        <InputLabel shrink id="routeID">
                                                            Division
                                                        </InputLabel>
                                                        <TextField select
                                                            fullWidth
                                                            name="routeID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={staffWagesInput.routeID}
                                                            variant="outlined"
                                                            id="routeID"
                                                            size='small'

                                                        >
                                                            <MenuItem value="0">--Select Division--</MenuItem>
                                                            <MenuItem value="1">Division One</MenuItem>
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                            <DatePicker
                                                                autoOk
                                                                variant="inline"
                                                                openTo="month"
                                                                views={["year", "month"]}
                                                                label="Year and Month *"
                                                                helperText="Select appicable month"
                                                                value={selectedDate}
                                                                disableFuture={true}
                                                                onChange={(date) => handleDateChange(date)}
                                                                size='small'
                                                            />
                                                        </MuiPickersUtilsProvider>
                                                    </Grid>

                                                </Grid>
                                                <br />
                                                <Box display="flex" flexDirection="row-reverse" p={2} >
                                                    <Button
                                                        color="primary"
                                                        type="submit"
                                                        variant="contained"
                                                        onClick={() => trackPromise(GetDetails())}
                                                    >
                                                        Search
                                                    </Button>
                                                    <div>&nbsp;</div>
                                                    <Button
                                                        color="primary"
                                                        type="reset"
                                                        variant="outlined"
                                                        onClick={ClearTable}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </Box>
                                            </CardContent>
                                            <Box minWidth={1050} hidden={isTableHide}>
                                                <MaterialTable
                                                    title="Multiple Actions Preview"
                                                    columns={[
                                                        { title: 'Emp No', field: 'empNo', },
                                                        { title: 'Emp Name', field: 'empName', },
                                                        { title: 'Emp Type', field: 'empType' },
                                                        {
                                                            title: 'Disbersment Type',
                                                            field: 'disbersmentType'
                                                        },
                                                        {
                                                            title: 'Total Earnings',
                                                            field: 'totalEarnings'
                                                        }
                                                    ]}
                                                    data={rows}
                                                    options={{
                                                        exportButton: false,
                                                        showTitle: false,
                                                        headerStyle: {  backgroundColor: "#a8c5f4" },
                                                        cellStyle: { textAlign: "left" },
                                                        columnResizable: false,
                                                        actionsColumnIndex: -1,
                                                        pageSize: 5,
                                                        //selection: true
                                                    }}
                                                    actions={[{

                                                        icon: VisibilityIcon,
                                                        tooltip: 'View',
                                                        onClick: (event, rows) => handleClickEdit(rows.tableData.id)
                                                    }]}
                                                />
                                            </Box>
                                            {balance ?
                                                <Box display="flex" flexDirection="row-reverse" p={2} >
                                                    <Button
                                                        color="primary"
                                                        type="submit"
                                                        variant="contained"
                                                    >
                                                        Print
                                                    </Button>
                                                    <div>&nbsp;</div>
                                                    <Button
                                                        color="primary"
                                                        type="reset"
                                                        variant="outlined"
                                                        onClick={() => Cancel()}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </Box> :
                                                null
                                            }
                                        </PerfectScrollbar>
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