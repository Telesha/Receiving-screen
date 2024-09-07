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
    InputLabel,
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
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
import CreatePDF from './CreatePDF';
import ReactToPrint from 'react-to-print';
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



const screenCode = 'CREATEPAYSLIP';

export default function CreatePayslip() {
    const navigate = useNavigate();
    const [title, setTitle] = useState("Create Payslip")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [estates, setEstates] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const componentRef = useRef([]);
    const [paySlipInput, setPaySlipInput] = useState({
        groupID: 0,
        estateID: 0,
        divisionID: 0,
        empNo: '',
        year: new Date().getUTCFullYear().toString(),
        month: ((new Date().getUTCMonth()) + 1).toString().padStart(2, '0'),
    })
    const [paySlipData, setPaySlipData] = useState([])
    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupName: '0',
        estateName: '0',
        divisionName: '0',
        year: '',
        month: '',
        monthName: ''
    });
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });
    const alert = useAlert();

    let encrypted = "";
    let encryptedMonth = "";
    let encryptedYear = "";

    const handleClickEdit = (employeeId, month, year) => {
        encrypted = btoa(employeeId.toString());
        encryptedMonth = btoa(month.toString());
        encryptedYear = btoa(year.toString());
        navigate('/app/createPayslip/viewCreatePayslip/' + encrypted + "/" + encryptedMonth + "/" + encryptedYear);
    }

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission());
    }, []);

    useEffect(() => {
        if (paySlipInput.groupID > 0) {
            trackPromise(getEstateDetailsByGroupID());
        };
    }, [paySlipInput.groupID]);

    useEffect(() => {
        if (paySlipInput.estateID > 0) {
            trackPromise(
                getDivisionDetailsByEstateID());
        };
    }, [paySlipInput.estateID]);

    useEffect(() => {
        setPaySlipData([])
    }, [paySlipInput.divisionID]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWCREATEPAYSLIP');

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

        setPaySlipInput({
            ...paySlipInput,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            estateID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(paySlipInput.groupID);
        setEstates(response);
    };

    async function getDivisionDetailsByEstateID() {
        var response = await services.getDivisionDetailsByEstateID(paySlipInput.estateID);
        setDivisions(response);
    };

    async function GetDetails() {
        let model = {
            groupID: parseInt(paySlipInput.groupID),
            estateID: parseInt(paySlipInput.estateID),
            divisionID: parseInt(paySlipInput.divisionID),
            month: paySlipInput.month,
            year: paySlipInput.year,
            empNo: paySlipInput.empNo
        }
        const response = await services.GetPaySlipDetails(model);
        if (response.length != 0) {
            getSelectedDropdownValuesForReport(model);
            setPaySlipData(response);
        } else {
            alert.error("No records to display");
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

    function handleClear() {

        setPaySlipInput({
            ...paySlipInput,
            divisionID: 0,
            month: '',
            year: ''
        });


        setSelectedDate(new Date());

        setSelectedSearchValues({
            ...selectedSearchValues,
            divisionName: '0',
            month: '',
            year: '',
            monthName: ''
        });
    }

    function handleDateChange(date) {
        let monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        var month = (date.getUTCMonth() + 1).toString().padStart(2, '0'); //months from 1-12
        var year = date.getUTCFullYear();
        let monthName = monthNames[month - 1];

        setPaySlipInput({
            ...paySlipInput,
            month: month.toString(),
            year: year.toString()
        });

        setSelectedSearchValues({
            ...selectedSearchValues,
            monthName: monthName
        });

        setPaySlipData({
            ...paySlipData,
            monthName: monthName,
            year: year.toString()
        })

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
        setPaySlipInput({
            ...paySlipInput,
            [e.target.name]: value
        });
    }


    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: groups[searchForm.groupID],
            estateName: estates[searchForm.estateID],
            divisionName: divisions[searchForm.divisionID],
            month: searchForm.month,
            year: searchForm.year
        });
        //GetDetails();
    }

    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: paySlipInput.groupID,
                            estateID: paySlipInput.estateID,
                            divisionID: paySlipInput.divisionID,
                            empNo: paySlipInput.empNo
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                                estateID: Yup.number().required('Estate is required').min("1", 'Estate is required'),
                                divisionID: Yup.number().required('Division is required').min('1', 'Division is required')
                            })
                        }
                        onSubmit={() => trackPromise(GetDetails())}
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
                                                            value={paySlipInput.groupID}
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
                                                            value={paySlipInput.estateID}
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
                                                            value={paySlipInput.divisionID}
                                                            variant="outlined"
                                                        >
                                                            <MenuItem value="0">--Select Division--</MenuItem>
                                                            {generateDropDownMenu(divisions)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="empNo">
                                                            Emp No
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.empNo && errors.empNo)}
                                                            fullWidth
                                                            helperText={touched.empNo && errors.empNo}
                                                            name="empNo"
                                                            onBlur={handleBlur}
                                                            size='small'
                                                            onChange={(e) => handleChange(e)}
                                                            value={paySlipInput.empNo}
                                                            variant="outlined"
                                                            id="empNo"
                                                            type="text"
                                                        >
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
                                                    //onClick={() => trackPromise(GetDetails())}
                                                    >
                                                        Search
                                                    </Button>
                                                    <div>&nbsp;</div>
                                                    <Button
                                                        color="primary"
                                                        type="reset"
                                                        variant="outlined"
                                                        onClick={handleClear}
                                                    >
                                                        Clear
                                                    </Button>

                                                </Box>
                                            </CardContent>
                                            {paySlipData.length > 0 ?
                                                <Box minWidth={1050} >
                                                    <MaterialTable
                                                        title="Multiple Actions Preview"
                                                        columns={[
                                                            { title: 'Employee No', field: 'employeeCode', width: "20%" },
                                                            { title: 'Employee Name', field: 'employeeName', width: "50%" },
                                                        ]}
                                                        data={paySlipData}
                                                        options={{
                                                            exportButton: false,
                                                            showTitle: false,
                                                            headerStyle: { textAlign: "left" },
                                                            cellStyle: { textAlign: "left" },
                                                            columnResizable: false,
                                                            actionsColumnIndex: -1,
                                                            pageSize: 10
                                                        }}
                                                        actions={[{
                                                            icon: VisibilityIcon,
                                                            tooltip: 'View',
                                                            onClick: (event, rows) => handleClickEdit(rows.employeeId, rows.month, rows.year)
                                                        }]}
                                                    />
                                                </Box>
                                                : null}

                                            {paySlipData.length > 0 ?
                                                <Box display="flex" justifyContent="flex-end" p={2}>
                                                    <ReactToPrint
                                                        documentTitle={'Employee Payslip'}
                                                        trigger={() => (
                                                            <Button
                                                                color="primary"
                                                                id="btnRecord"
                                                                type="submit"
                                                                variant="contained"
                                                                className={classes.colorCancel}
                                                                size="small"
                                                            >
                                                                PDF
                                                            </Button>
                                                        )}
                                                        content={() => componentRef.current}
                                                    />

                                                    <div hidden={true}>
                                                        <CreatePDF
                                                            ref={componentRef}
                                                            paySlipData={paySlipData}

                                                        />

                                                    </div>
                                                </Box>
                                                : null}
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