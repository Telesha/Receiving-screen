import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Grid, Box, Card, MenuItem, Typography, Button, makeStyles, Container, CardHeader, Divider, CardContent, InputLabel, TextField } from '@material-ui/core';
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
import { DatePicker } from "@material-ui/pickers";
import tokenDecoder from '../../../utils/tokenDecoder';

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
    colorApprove: {
        backgroundColor: '#4caf50',
    }
}));

const screenCode = 'SALAREXECUTION';

export default function SalaryExecutionListing(probs) {

    const classes = useStyles();
    const alert = useAlert();
    const navigate = useNavigate();
    const [title] = useState("Salary Execution");
    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isExecuteButtonDisabled, setIsExecuteButtonDisabled] = useState(false);
    const [searchParamList, setSearchParamList] = useState({
        groupID: 0,
        factoryID: 0,
        year: new Date().getUTCFullYear().toString(),
        month: (new Date().getUTCMonth() + 1).toString().padStart(2, '0')
    });
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });
    const [crossJobStatus, setCrossJobStatus] = useState('');

    useEffect(() => {
        trackPromise(
            getPermissions()
        )
    }, []);

    useEffect(() => {
        if (searchParamList.groupID !== 0) {
            trackPromise(
                getFactoriesForDropdown(searchParamList.groupID)
            );
        }
    }, [searchParamList.groupID]);

    useEffect(() => {
        if (searchParamList.groupID !== 0 && searchParamList.factoryID !== 0) {
            CheckCrossJob();
        }
    }, [searchParamList]);

    async function getPermissions() {
        const permissions = await permissionService.getPermissionsByScreen(screenCode);
        const isAuthorized = permissions.find(p => p.permissionCode === 'VIEWSALARYEXECUTION');

        if (isAuthorized === undefined) {
            navigate('/app/unauthorized');
        }

        const isGroupFilterEnabled = permissions.find(p => p.permissionCode === 'GROUPDROPDOWN');
        const isFactoryFilterEnabled = permissions.find(p => p.permissionCode === 'FACTORYDROPDOWN');

        setPermissions({
            isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
            isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined
        });

        setSearchParamList({
            ...searchParamList,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        });

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
        const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
        const year = date.getUTCFullYear();
        setSearchParamList({
            ...searchParamList,
            month: month,
            year: year.toString()
        });
        setSelectedDate(date);
    }

    function handleGroupChange(e) {
        const value = e.target.value;
        setSearchParamList({
            ...searchParamList,
            groupID: value,
            factoryID: 0,
            effectiveDate: ''
        });
    }

    function handleFactoryChange(e) {
        const value = e.target.value;
        setSearchParamList({
            ...searchParamList,
            factoryID: value,
            effectiveDate: ''
        });
    }

    function generateDropDownMenu(data) {
        const items = [];
        if (data != null) {
            for (const [key, value] of Object.entries(data)) {
                items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
            }
        }
        return items;
    }

    function cardTitle(titleName) {
        return (
            <Grid container spacing={1}>
                <Grid item md={10} xs={12}>
                    {titleName}
                </Grid>
            </Grid>
        );
    }

    async function CheckCrossJob() {
        let model = {
            estateID: parseInt(searchParamList.factoryID),
            year: (searchParamList.year).toString(),
            month: (searchParamList.month).toString(),
            createdBy: parseInt(tokenDecoder.getUserIDFromToken())
        }
        const response = await services.executeCrossJob(model);
        if (response.statusCode === "Error") {
            setIsExecuteButtonDisabled(false);
            setCrossJobStatus('Error');
        } else {
            setIsExecuteButtonDisabled(true);
            setCrossJobStatus('Success');
        }
    }

    async function CalculateSalary(event) {
        event.preventDefault();

        if (isExecuteButtonDisabled) {
            alert.error("Salary calculation is already done for the month.");
            return;
        }

        if (crossJobStatus === 'Error') {
            let model = {
                groupID: parseInt(searchParamList.groupID),
                estateID: parseInt(searchParamList.factoryID),
                date: selectedDate,
                createdBy: parseInt(tokenDecoder.getUserIDFromToken())
            };
            const result = await services.SalaryExecution(model);

            if (result.statusCode === "Success") {
                alert.success("Salary execution is successfully done");
                setIsExecuteButtonDisabled(true);
                setCrossJobStatus('Success');
            }
        }
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
                                factoryID: Yup.number().min(1, "Please Select an Estate").required('Estate is required'),
                            })
                        }
                        enableReinitialize
                    >
                        {({
                            errors,
                            handleBlur,
                            touched,
                        }) => (
                            <form onSubmit={CalculateSalary}>
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
                                                                handleGroupChange(e);
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
                                                        <InputLabel shrink id="factoryID">
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
                                                                handleFactoryChange(e);
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
                                                <br />
                                                <Grid container alignItems="center" justify="center">
                                                    <Box border={1} borderRadius={16} borderColor="green" style={{ marginTop: "3rem", padding: "1rem" }}>
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
                                                                        Estate: {factories ? factories[searchParamList.factoryID] : ''}
                                                                    </Typography>
                                                                )}
                                                                <Typography variant="h5" style={{ margin: '1rem' }}>
                                                                    Date: {`${selectedDate.getUTCFullYear()}-${(selectedDate.getUTCMonth() + 1).toString().padStart(2, '0')}`}
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
                                                                    disabled={isExecuteButtonDisabled}
                                                                >
                                                                    Start
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
            </Page>
        </Fragment>
    );
}
