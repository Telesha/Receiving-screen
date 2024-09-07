import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Grid, Box, Card, MenuItem, Button,
    makeStyles, Container, CardHeader, Divider, CardContent, InputLabel, TextField, Typography
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
import { useAlert } from "react-alert";
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";
import { AlertDialogWithoutButton } from '../../Common/AlertDialogWithoutButton';
import moment from 'moment';

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

const screenCode = 'SALARYCALCULATION';

export default function SalaryCalculation(probs) {

    const classes = useStyles();
    const alert = useAlert();
    const navigate = useNavigate();
    const [title, setTitle] = useState("Salary Calculation")
    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [dialog, setDialog] = useState(false);
    const [isCleared, setIsCleared] = useState(false);
    const [searchParamList, setSearchParamList] = useState({
        groupID: 0,
        factoryID: 0,
        effectiveDate: new Date()
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
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWSALARYCALCULATION');

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
            factoryID: 0,
            effectiveDate: new Date()
        });
    }

    function handleFactoryChange(e) {
        const target = e.target;
        const value = target.value
        setSearchParamList({
            ...searchParamList,
            factoryID: value,
            effectiveDate: new Date()
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
        var result = await services.ExecutePayPlanner(parseInt(searchParamList.factoryID), searchParamList.effectiveDate.toISOString());
        if (result.statusCode == "Success") {
            alert.success(result.message);
            setDialog(false);
            ClearFields();
            setIsCleared(!isCleared)
        }
        else {
            alert.error(result.message);
            setDialog(false);
            ClearFields();
            setIsCleared(!isCleared)
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

    function handleDateChange(value, field) {
        setSearchParamList({
            ...searchParamList,
            effectiveDate: value
        });
    }

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
            effectiveDate: new Date()
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
                                effectiveDate: Yup.string().required('Effective Date is required'),
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
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="effectiveDate">
                                                            Effective Date *
                                                        </InputLabel>
                                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                            <KeyboardDatePicker
                                                                key={isCleared}
                                                                error={Boolean(touched.effectiveDate && errors.effectiveDate)}
                                                                helperText={touched.effectiveDate && errors.effectiveDate}
                                                                autoOk
                                                                fullWidth
                                                                maxDate={new Date()}
                                                                variant="inline"
                                                                format="dd/MM/yyyy"
                                                                margin="dense"
                                                                id="effectiveDate"
                                                                name="effectiveDate"
                                                                value={searchParamList.effectiveDate}
                                                                onChange={(e) => handleDateChange(e, "effectiveDate")}
                                                                KeyboardButtonProps={{
                                                                    'aria-label': 'change date',
                                                                }}
                                                                InputProps={{ readOnly: true }}
                                                            />
                                                        </MuiPickersUtilsProvider>
                                                    </Grid>
                                                </Grid>
                                                <br></br>
                                                <br />
                                                <Grid container alignItems="center" justify="center">
                                                    <Box border={2} borderRadius={16} borderColor="green" style={{ marginTop: "3rem", padding: "1rem" }}>
                                                        <Grid item md={9} xs={12}>
                                                            <Grid alignItems="center" justify="center">
                                                                <CardHeader titleTypographyProps={{ variant: 'h4' }} style={{ marginLeft: '5rem' }}
                                                                    title="Salary Calculation"
                                                                />
                                                            </Grid>
                                                            <Grid item md={12} xs={12}>
                                                                {searchParamList.groupID !== 0 && (
                                                                    <Typography variant="h5" style={{ margin: '1rem' }}>
                                                                        Group: {groups ? groups[searchParamList.groupID] : ''}
                                                                    </Typography>
                                                                )}
                                                                {searchParamList.factoryID !== 0 && (
                                                                    <Typography variant="h5" style={{ margin: '1rem' }}>
                                                                        Estate : {factories ? factories[searchParamList.factoryID] : ''}
                                                                    </Typography>
                                                                )}
                                                                <Typography variant="h5" style={{ margin: '1rem' }}>
                                                                    Date: {moment(searchParamList.effectiveDate).format("YYYY-MM-DD")}
                                                                </Typography>
                                                            </Grid>
                                                            <Box justifyContent="flex-end" p={2} style={{ marginLeft: '10rem' }}>
                                                                <Button
                                                                    fullWidth="true"
                                                                    size="large"
                                                                    color="primary"
                                                                    type="submit"
                                                                    id="btnRecord"
                                                                    variant="contained"
                                                                    className={classes.colorApprove}
                                                                    style={{ marginLeft: '5rem' }}
                                                                >
                                                                    Calculate
                                                                </Button>
                                                            </Box>
                                                        </Grid>
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