import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Grid, Box, Card, MenuItem, Button,
    makeStyles, Container, CardHeader, Divider, CardContent, InputLabel, TextField
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import permissionService from "../../../utils/permissionAuth";
import { LoadingComponent } from '../../../utils/newLoader';
import { Formik } from 'formik';
import * as Yup from "yup";
import tokenService from '../../../utils/tokenDecoder';
import tokenDecoder from '../../../utils/tokenDecoder';
import { useAlert } from "react-alert";
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { DatePicker, KeyboardDatePicker } from "@material-ui/pickers";
import { AlertDialogWithoutButton } from '../../Common/AlertDialogWithoutButton';

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
    table: {
        minWidth: 650,
    },
    paper: {
        backgroundColor: "#424242",
    },
}));

const screenCode = 'MONTHLYSALARYEXECUTION';

export default function MonthlySalaryExecution(probs) {

    const classes = useStyles();
    const alert = useAlert();
    const navigate = useNavigate();
    const [title, setTitle] = useState("Monthly Salary Execution")
    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [dialog, setDialog] = useState(false);
    const [searchParamList, setSearchParamList] = useState({
        groupID: 0,
        factoryID: 0,
        //effectiveDate: '',
        year: new Date().getUTCFullYear().toString(),
        month: (new Date().getUTCMonth() + 1).toString().padStart(2, '0')
    })
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });

    useEffect(() => {
        trackPromise(
            getPermissions()
        )
    }, []);

    useEffect(() => {
        if (searchParamList.groupID != 0) {
            trackPromise(
                getFactoriesForDropdown(searchParamList.groupID)
            );
        }
    }, [searchParamList.groupID])

    async function getPermissions() {
        var permissions = await permissionService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWMONTHLYSALARYEXECUTION');

        if (isAuthorized === undefined) {
            navigate('/app/unauthorized');
        }

        var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
        var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');

        setPermissions({
            ...permissionList,
            isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
            isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined
        });

        setSearchParamList({
            ...searchParamList,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
        getGroupsForDropdown();
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getFactoriesForDropdown(groupID) {
        const factories = await services.getAllFactoriesByGroupID(groupID);
        setFactories(factories);
    }

    function handleDateChange(date) {
        let monthNames = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December'
        ];
        var month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
        var year = date.getUTCFullYear();
        //let monthName = monthNames[month - 1];

        // setSelectedSearchValues({
        //   ...selectedSearchValues,
        //   monthName: monthName
        // });
        setSearchParamList({
            ...searchParamList,
            month: month.toString(),
            year: year.toString()
        });
        setSelectedDate(date);
        // setPaymentCheckrollDetails([]);
    }

    function handleGroupChange(e) {
        const target = e.target;
        const value = target.value
        setSearchParamList({
            ...searchParamList,
            groupID: value,
            factoryID: 0,
            effectiveDate: ''
        });
    }

    function handleFactoryChange(e) {
        const target = e.target;
        const value = target.value
        setSearchParamList({
            ...searchParamList,
            factoryID: value,
            effectiveDate: ''
        });
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

    async function CalculateSalary() {
        let model = {
            estateID: parseInt(searchParamList.factoryID),
            year: (searchParamList.year).toString(),
            month: (searchParamList.month).toString(),
            createdBy: parseInt(tokenDecoder.getUserIDFromToken())
        }
        var result = await services.MonthlySalaryExecution(model);
        if (result.statusCode == "Success") {
            alert.success(result.message);
            setDialog(false);
            ClearFields();
        }
        else {
            alert.error(result.message);
            setDialog(false);
            ClearFields();
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

    // function handleDateChange(value, field) {
    //     setSearchParamList({
    //         ...searchParamList,
    //         effectiveDate: value
    //     });
    // }

    async function cancelRequest() {
        setDialog(false);
    }

    async function confirmRequest() {
        CalculateSalary();
    }

    async function CalculateSalaryConfirm() {
        setDialog(true);
    }

    function ClearFields() {
        setSearchParamList({
            ...searchParamList,
            effectiveDate: ''
        });
    }

    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: searchParamList.groupID,
                            factoryID: searchParamList.factoryID,
                            effectiveDate: searchParamList.effectiveDate,
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().min(1, "Please Select a Group").required('Group is required'),
                                factoryID: Yup.number().min(1, "Please Select a Estate").required('Estate is required'),
                                // effectiveDate: Yup.string().required('Effective Date is required'),
                            })
                        }
                        enableReinitialize
                        onSubmit={() => trackPromise(CalculateSalaryConfirm())}
                    >
                        {({
                            errors,
                            handleBlur,
                            handleSubmit,
                            touched,
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
                                                <Grid container spacing={2}>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="groupID">
                                                            Group *
                                                        </InputLabel>
                                                        <TextField select
                                                            size='small'
                                                            error={Boolean(touched.groupID && errors.groupID)}
                                                            fullWidth
                                                            helperText={touched.groupID && errors.groupID}
                                                            name="groupID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => {
                                                                handleGroupChange(e)
                                                            }}
                                                            value={searchParamList.groupID}
                                                            variant="outlined"
                                                            id="groupID"
                                                            InputProps={{
                                                                readOnly: !permissionList.isGroupFilterEnabled,
                                                            }}
                                                        >
                                                            <MenuItem value={'0'} disabled={true}>
                                                                --Select Group--
                                                            </MenuItem>
                                                            {generateDropDownMenu(groups)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="groupID">
                                                            Estate *
                                                        </InputLabel>
                                                        <TextField select
                                                            size='small'
                                                            error={Boolean(touched.factoryID && errors.factoryID)}
                                                            fullWidth
                                                            helperText={touched.factoryID && errors.factoryID}
                                                            name="factoryID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => {
                                                                handleFactoryChange(e)
                                                            }}
                                                            value={searchParamList.factoryID}
                                                            variant="outlined"
                                                            id="factoryID"
                                                            InputProps={{
                                                                readOnly: !permissionList.isFactoryFilterEnabled,
                                                            }}
                                                        >
                                                            <MenuItem value={'0'} disabled={true}>
                                                                --Select Estate--
                                                            </MenuItem>
                                                            {generateDropDownMenu(factories)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={3}>
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
                                                <br></br>
                                                <Grid container justify="flex-end">
                                                    <Box pr={2}>
                                                        <Button
                                                            size='small'
                                                            color="primary"
                                                            variant="contained"
                                                            type='submit'
                                                        >
                                                            Calculate
                                                        </Button>
                                                    </Box>
                                                </Grid>
                                            </CardContent>
                                        </PerfectScrollbar>
                                    </Card>
                                </Box>
                            </form>
                        )}
                    </Formik>
                </Container>
                {dialog ?
                    <AlertDialogWithoutButton confirmData={confirmRequest} cancelData={cancelRequest}
                        headerMessage={"Confirm To Authorize"}
                        discription={"Are you sure want to Calculate Salary ?"} />
                    : null
                }
            </Page>
        </Fragment>
    )
}