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
import { trackPromise } from 'react-promise-tracker';
import * as Yup from "yup";
import { LoadingComponent } from 'src/utils/newLoader';
import { Formik, validateYupSchema } from 'formik';
import { DatePicker, MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import moment from 'moment';
import MaterialTable from "material-table";
import { useAlert } from "react-alert";
import ReactToPrint from 'react-to-print';
import Createpdf from './CreatePDF';

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

const screenCode = 'EMPLOYEEWAGES';

export default function EmployeeWages(props) {
    const [title, setTitle] = useState("Employee Wages")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [estates, setEstates] = useState();
    const [divisions, setDivisions] = useState();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [employeeWagesInput, setEmployeeWagesInput] = useState({
        groupID: '0',
        estateID: '0',
        divisionID: '0',
        year: '',
        month: ''
    });
    const [employeeWagesData, setEmployeeWagesData] = useState([]);
    const componentRef = useRef();
    const [selectedSearchValues, setSelectedSearchValues] = useState();
    const [isTableHide, setIsTableHide] = useState(true);
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });
    function createData(employeeNumber, employeeName, employeeType, jobType, workType, totalEarning, deduction, netPay) {
        return { employeeNumber, employeeName, employeeType, jobType, workType, totalEarning, deduction, netPay };
    }
    const rows = [
        createData("123456", "charitha fsdfdf", "1", "1", "1", "20", "0", "20" ),
        createData("1323", "charithax Sovax", "1", "1",  "1", "20", "0", "20",),
        createData("3737", "V.SELLAIE", "2", "2", "1",  "30", "0", "20"),
        createData("4614", "K.SITHAMBARAM", "2", "2", "1",  "30", "0", "24"),
        createData("5140", "M.SHANMUGAPRIYA", "4", "2", "1", "30", "0", "24"),
    ];
    const alert = useAlert();
    const navigate = useNavigate();

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission());
    }, []);

    useEffect(() => {
        trackPromise(getEstatesForDropdown());
    }, [employeeWagesInput.groupID]);

    useEffect(() => {
        trackPromise(getDivisionsByEstateID());
    }, [employeeWagesInput.estateID]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWEMPLOYEEWAGES');

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
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getEstatesForDropdown() {
        const estates = await services.getEstateByGroupID(employeeWagesInput.groupID);
        setEstates(estates);
    }

    async function getDivisionsByEstateID() {
        const divisions = await services.getDivisionsByEstateID(employeeWagesInput.estateID);
        setDivisions(divisions);
    }

    async function GetDetails() {
        let model = {
            groupID: parseInt(employeeWagesInput.groupID),
            estateID: parseInt(employeeWagesInput.estateID),
            divisionID: parseInt(employeeWagesInput.divisionID),
            applicableYear: employeeWagesInput.year,
            applicableMonth: employeeWagesInput.month
        }

        const response = await services.getEmployeeWagesDetail(model);
        getSelectedDropdownValuesForReport(model);
        setEmployeeWagesData(response);
        setIsTableHide(false);
    }

    async function ClearTable() {
        clearState();
    }
    function clearState() {
        setEmployeeWagesInput({
            ...employeeWagesInput,
            groupID: '0',
            divisionID: '0',
            estateID: '0',
            year: '',
            month: ''
        });
        setEmployeeWagesData([]);
        setIsTableHide(true);
    }
    async function Cancel() {
        setEmployeeWagesData([]);
        setIsTableHide(true);
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

        setEmployeeWagesInput({
            ...employeeWagesInput,
            month: month.toString(),
            year: year.toString()
        });

        setSelectedSearchValues({
            ...selectedSearchValues,
            monthName:monthName
        });

        if (selectedDate != null) {

            var prevMonth = selectedDate.getUTCMonth() + 1
            var prevyear = selectedDate.getUTCFullYear();

            if ((prevyear == year && prevMonth != month) || (prevyear != year)) {
                setSelectedDate(date)
            }
        } else {
            setSelectedDate(date)
        }
    }

    function getSelectedDropdownValuesForReport(searchForm){
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: groups[searchForm.groupID],
            estateName:estates[searchForm.estateID],
            divisionName:divisions[searchForm.divisionID],
            month: searchForm.applicableMonth,
            year: searchForm.applicableYear
        });
    }

    function getjobTypeusingjobID(type){
        if(type == 1){
          return "Cash";
        }else if(type == 2){
          return "Kilo";
        }else if(type == 3){
          return "General";
        }else{
          return "RSM";
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
        setEmployeeWagesInput({
            ...employeeWagesInput,
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
                            groupID: employeeWagesInput.groupID,
                            estateID: employeeWagesInput.estateID,
                            divisionID: employeeWagesInput.divisionID,
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                                estateID: Yup.number().required('Estate is required').min("1", 'Estate is required'),
                                divisionID: Yup.number().required('Division is required').min("1", 'Division is required'),
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
                                                            value={employeeWagesInput.groupID}
                                                            variant="outlined"
                                                            id="groupID"
                                                            size='small'
                                                        >
                                                            <MenuItem value="0">--Select Group--</MenuItem>
                                                            {generateDropDownMenu(groups)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={3} xs={8}>
                                                        <InputLabel shrink id="estateID">
                                                            Estate *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.estateID && errors.estateID)}
                                                            fullWidth
                                                            helperText={touched.estateID && errors.estateID}
                                                            name="estateID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={employeeWagesInput.estateID}
                                                            variant="outlined"
                                                            id="estateID"
                                                            size='small'
                                                        >
                                                            <MenuItem value="0">--Select Estate--</MenuItem>
                                                            {generateDropDownMenu(estates)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={3} xs={8}>
                                                        <InputLabel shrink id="divisionID">
                                                            Division
                                                        </InputLabel>
                                                        <TextField select
                                                            fullWidth
                                                            name="divisionID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={employeeWagesInput.divisionID}
                                                            variant="outlined"
                                                            id="divisionID"
                                                            size='small'
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
                                                        onClick={() =>GetDetails()}
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
                                                        { title: 'Emp No', field: 'employeeNumber' },
                                                        { title: 'Emp Name', field: 'employeeName', },
                                                        { 
                                                            title: 'Emp Type', 
                                                            field: 'employeeType',
                                                            render: rowData => rowData.employeeType == 1 ? 'Register' : 'Unregister' 
                                                        },
                                                        { 
                                                            title: 'Job Type', 
                                                            field: 'jobType',
                                                            render: rowData => getjobTypeusingjobID(rowData.jobType) 
                                                        },
                                                        {
                                                            title: 'Disbersment Type',
                                                            field: 'workType',
                                                            render: rowData => rowData.workType == 1 ? 'Division Labour' : 'Lent Labour',
                                                            cellStyle: {
                                                                textAlign: "center",
                                                            }
                                                        },
                                                        {
                                                            title: 'Total Earnings',
                                                            field: 'totalEarning',
                                                            cellStyle: {
                                                                textAlign: "right",
                                                            }
                                                        },
                                                        {
                                                            title: 'Deductions',
                                                            field: 'deduction',
                                                            cellStyle: {
                                                                textAlign: "right",
                                                            }
                                                        },
                                                        {
                                                            title: 'Net Pay',
                                                            field: 'netPay',
                                                            cellStyle: {
                                                                textAlign: "right",
                                                            }
                                                        },
                                                    ]}
                                                    data={rows}
                                                    options={{
                                                        exportButton: false,
                                                        showTitle: false,
                                                        headerStyle: { textAlign: "center", backgroundColor: "#a8c5f4" },
                                                        cellStyle: { textAlign: "left" },
                                                        columnResizable: false,
                                                        actionsColumnIndex: -1,
                                                        pageSize: 5,
                                                        selection: false
                                                    }}
                                                />
                                            </Box>
                                            {employeeWagesData.length > 0 ?
                                                <Box display="flex" flexDirection="row-reverse" p={2} hidden={isTableHide}>
                                                    <ReactToPrint
                                                    documentTitle={'Employee Wages'}
                                                    trigger={() => <Button
                                                    color='primary'
                                                    id='btnRecord'
                                                    type='submit'
                                                    variant='contained'
                                                    style={{ marginRight: '1rem'}}
                                                    className={classes.colorCancel}
                                                    size= 'small'
                                                    >
                                                        Print
                                                    </Button>}
                                                    content={() => componentRef.current}
                                                    />
                                                    <div hidden={true}>
                                                        <Createpdf ref={componentRef}
                                                        routeSummaryData = {employeeWagesData}
                                                        searchedData = {selectedSearchValues}
                                                        />

                                                    </div>
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