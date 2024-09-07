import React, { useState, useEffect, Fragment } from 'react';
import moment from 'moment';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Grid, Box, Card, MenuItem, Button,
    makeStyles, Container, CardHeader, Divider, CardContent, InputLabel, TextField,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import permissionService from "../../../utils/permissionAuth";
import { LoadingComponent } from '../../../utils/newLoader';
import { Formik } from 'formik';
import * as Yup from "yup";
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";
import tokenService from '../../../utils/tokenDecoder';
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

const screenCode = 'CUSTOMERSAVINGS';

export default function CustomerSavings(probs) {

    const classes = useStyles();
    const alert = useAlert();
    const navigate = useNavigate();
    const [title, setTitle] = useState("Customer Savings")
    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [fromDate, handleFromDate] = useState(new Date());
    const [toDate, handleToDate] = useState(new Date());
    const [totalAmount, setTotalAmount] = useState(0);
    const [searchParamList, setSearchParamList] = useState({
        groupID: 0,
        factoryID: 0,
        registrationNumber: '',
        fromDate: '',
        toDate: ''
    })
    const [customerSavingsData, setCustomerSavingsData] = useState([]);

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

    useEffect(() => {
        setSearchParamList({
            ...searchParamList,
            ['fromDate']: fromDate,
        });
    }, [fromDate]);

    useEffect(() => {
        setSearchParamList({
            ...searchParamList,
            ['toDate']: toDate,
        });
    }, [toDate]);

    async function getPermissions() {
        var permissions = await permissionService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWCUSTOMERSAVINGS');

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

    function handleGroupChange(e) {
        const target = e.target;
        const value = target.value
        setSearchParamList({
            ...searchParamList,
            groupID: value,
            factoryID: 0
        });
        clearTable()
    }

    function handleFactoryChange(e) {
        const target = e.target;
        const value = target.value
        setSearchParamList({
            ...searchParamList,
            factoryID: value,
            registrationNumber: ''
        });
        clearTable();
    }

    function handleChangeEvnt(e) {
        const target = e.target;
        const value = target.value
        setSearchParamList({
            ...searchParamList,
            [e.target.name]: value
        });
        clearTable();
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

    async function GetCustomerSavings() {
        var result = await services.GetCustomerSavings(searchParamList, moment(fromDate).format(), moment(toDate).format());
        if (result.statusCode == "Success" && result.data != null) {
            setCustomerSavingsData(result.data);
            calculateTotalAmount(result.data);
        }
        else {
            alert.error('No records to display');
        }
    }

    function calculateTotalAmount(value) {
        var total = 0;
        value.forEach(element => {
            total = total + element.amount
        });
        setTotalAmount(total);
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

    function clearTable() {
        setCustomerSavingsData([]);
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
                            registrationNumber: searchParamList.registrationNumber
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().min(1, "Please Select a Group").required('Group is required'),
                                factoryID: Yup.number().min(1, "Please Select a Factory").required('Factory is required'),
                                //registrationNumber: Yup.string().required('registration number is required').typeError('Enter valid registration number').matches(/^[0-9]{0,15}$/, 'Please enter valid registration number')
                            })
                        }
                        enableReinitialize
                        onSubmit={() => trackPromise(GetCustomerSavings())}
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
                                                <Grid container spacing={3}>
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
                                                            Factory *
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
                                                                --Select Factory--
                                                            </MenuItem>
                                                            {generateDropDownMenu(factories)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="registrationNumber">
                                                            Registration Number
                                                        </InputLabel>
                                                        <TextField
                                                            size='small'
                                                            fullWidth
                                                            name="registrationNumber"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => {
                                                                handleChangeEvnt(e)
                                                            }}
                                                            value={searchParamList.registrationNumber}
                                                            variant="outlined"
                                                            id="registrationNumber"
                                                        >
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="fromDate">
                                                            From Date *
                                                        </InputLabel>
                                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                            <KeyboardDatePicker
                                                                size='small'
                                                                autoOk
                                                                fullWidth
                                                                variant="inline"
                                                                format="dd/MM/yyyy"
                                                                margin="dense"
                                                                id="fromDate"
                                                                value={fromDate}
                                                                maxDate={new Date()}
                                                                onChange={(e) => {
                                                                    handleFromDate(e);
                                                                    clearTable();
                                                                }}
                                                                KeyboardButtonProps={{
                                                                    'aria-label': 'change date',
                                                                }}
                                                            />
                                                        </MuiPickersUtilsProvider>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="toDate">
                                                            To Date *
                                                        </InputLabel>
                                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                            <KeyboardDatePicker
                                                                size='small'
                                                                autoOk
                                                                fullWidth
                                                                variant="inline"
                                                                format="dd/MM/yyyy"
                                                                margin="dense"
                                                                id="toDate"
                                                                value={toDate}
                                                                maxDate={new Date()}
                                                                onChange={(e) => {
                                                                    handleToDate(e);
                                                                    clearTable();
                                                                }}
                                                                KeyboardButtonProps={{
                                                                    'aria-label': 'change date',
                                                                }}
                                                            />
                                                        </MuiPickersUtilsProvider>
                                                    </Grid>
                                                    <Grid container justify="flex-end">
                                                        <Box pr={2}>
                                                            <Button
                                                                size='small'
                                                                color="primary"
                                                                variant="contained"
                                                                type="submit"
                                                            >
                                                                Search
                                                            </Button>
                                                        </Box>
                                                    </Grid>
                                                    <Box minWidth={1050}>
                                                        {customerSavingsData.length > 0 ?
                                                            <TableContainer >
                                                                <Table aria-label="caption table" >
                                                                    <TableHead>
                                                                        <TableRow>
                                                                            <TableCell align={'left'}>Customer Registration Number</TableCell>
                                                                            <TableCell align={'left'}>Effective Date</TableCell>
                                                                            <TableCell align={'left'}>Fund Type</TableCell>
                                                                            <TableCell align={'left'}>Amount</TableCell>
                                                                        </TableRow>
                                                                    </TableHead>
                                                                    <TableBody>
                                                                        {customerSavingsData.map((data, index) => (
                                                                            <TableRow key={index}>
                                                                                <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                                    {data.registrationNumber}
                                                                                </TableCell>
                                                                                <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                                    {data.effectiveDate.split('T')[0]}
                                                                                </TableCell>
                                                                                <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                                    {data.fundName}
                                                                                </TableCell>
                                                                                <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                                    {data.amount}
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        ))}
                                                                        <TableRow>
                                                                            <TableCell align={'left'} style={{ borderBottom: "none" }}><b>Total</b></TableCell>
                                                                            <TableCell align={'left'} component="th" scope="row">
                                                                                
                                                                            </TableCell>
                                                                            <TableCell align={'left'} component="th" scope="row">
                                                                            </TableCell>
                                                                            <TableCell align={'left'} component="th" scope="row">
                                                                            <b> {totalAmount} </b>
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    </TableBody>
                                                                </Table>
                                                            </TableContainer>
                                                            : null}
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
            </Page>
        </Fragment>
    )
}