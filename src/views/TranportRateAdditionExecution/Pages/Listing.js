import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Box,
    Card,
    Grid,
    TextField,
    makeStyles,
    Container,
    Button,
    CardContent,
    MenuItem,
    Divider,
    InputLabel,
    CardHeader,
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik } from 'formik';
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { AgriGenERPEnum } from 'src/views/Common/AgriGenERPEnum/AgriGenERPEnum';

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
    colorApprove: {
        backgroundColor: "green",
    },
    textCenter: {
        textAlign: 'center',
    },
    fontColors: {
        color: 'grey'
    }

}));

const screenCode = 'TRANSPORTRATEADDITIONEXECUTION';

export default function TransportRateAdditionExecution(props) {
    const [title, setTitle] = useState("Transport Rate Addition Execution");
    const classes = useStyles();
    const navigate = useNavigate();
    const agriGenERPEnum = new AgriGenERPEnum();
    const [FactoryList, setFactoryList] = useState([]);
    const [GroupList, setGroupList] = useState([]);
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });
    const [searchData, setSearchData] = useState({
        groupID: 0,
        factoryID: 0,
    });
    const [transportRate, setTransportRate] = useState({
        previouseYear: '-',
        previouseMonth: '-',
        executionStatusID: '-',
        currentYear: '-',
        currentMonth: '-',
    });
    const [isDisplay, setIsDisplay] = useState(true);
    const alert = useAlert();
    const defaultProps = {
        border: 1,
        style: { width: '50rem', height: '10rem' },
    };
    const currentProps = {
        border: 3,
        style: { width: '50rem', height: '12rem' },
    };
    const newProps = {
        border: 1,
        style: { width: '50rem', height: '10rem' },
    };
    const BalancePayment = Object.freeze({ "Pending": 1, "Execution_Started": 2, "Complete": 3 })
    const [sheduleStatus, setSheduleStatus] = useState();
    const [isCurrentMonth, setIsCurrentMonth] = useState(false);


    useEffect(() => {
        trackPromise(
            getPermissions(),
            getAllGroups(),
            checkScheduleAlreadyStarted()
        );
    }, [])

    useEffect(() => {
        trackPromise(
            getFactoriesForDropdown()
        )
    }, [searchData.groupID])

    useEffect(() => {
        if (searchData.groupID > 0 && searchData.factoryID > 0) {
            trackPromise(
                getTransportRateAdditionData(),
                checkScheduleAlreadyStarted()
            )
        }
    }, [searchData.factoryID])


    async function getPermissions() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWTRANSPORTRATEADDITIONEXECUTION');

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

        setSearchData({
            ...searchData,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getAllGroups() {
        var response = await services.getAllGroups();
        setGroupList(response);
    };

    async function getFactoriesForDropdown() {
        const factories = await services.getFactoryByGroupID(searchData.groupID);
        setFactoryList(factories);
    }

    function handleChange(e) {
        const target = e.target;
        const value = target.value
        setSearchData({
            ...searchData,
            [e.target.name]: value
        });

        if (value === '0') {
            setIsDisplay(false);
        }
        else if (e.target.name === "groupID" && searchData.factoryID == 0) {
            setIsDisplay(false);
        }
        else if (e.target.name === "factoryID" && searchData.groupID == 0) {
            setIsDisplay(false);
        }
        else {
            setIsDisplay(true);
        }
    }

    function settingMonth(data) {
        if (data != null) {
            if (parseInt(data) < 12) {
                return (parseInt(data) + 1).toString().padStart(2, '0');
            }
            else {
                return "01";
            }
        }
    }
    function settingYear(data) {
        if (data != null) {
            if (parseInt(data) < 12) {
                return transportRate.currentYear;
            }
            else {
                return (parseInt(transportRate.currentYear) + 1).toString();
            }
        }
    }

    function changeIconName() {
        if (sheduleStatus == agriGenERPEnum.LeafDeductionExecutionStatus.Pending) {
            return "Pending";
        }
        else if (sheduleStatus == agriGenERPEnum.LeafDeductionExecutionStatus.Execution_Started) {
            return "Started";
        }
        else {
            return "Start";
        }
    }

    function generateDropDownMenu(data) {
        let items = []
        if (data != null) {
            for (const [key, value] of Object.entries(data)) {
                items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
            }
        }
        return items;
    }

    async function getTransportRateAdditionData() {
        const listData = await services.getTransportRateAdditionData(searchData.groupID, searchData.factoryID);
        if (listData.statusCode === "Success") {
            setTransportRate(listData.data);
        } else {
            alert.error("error occured in data loading")
        }
        if (parseInt(listData.data.currentMonth) == parseInt(listData.data.acctualCurrentMonth)) {
            setIsCurrentMonth(true);
        }
        else {
            setIsCurrentMonth(false);
        }
    }

    async function checkScheduleAlreadyStarted() {
        const result = await services.checkScheduleAlreadyStarted(searchData.groupID, searchData.factoryID);
        if (result.statusCode === "Success") {
            const data = result.data;
            if (data.executionStatusID == parseInt(agriGenERPEnum.TransportRateAdditionExecutionStatus.Pending)) {
                setSheduleStatus(parseInt(agriGenERPEnum.TransportRateAdditionExecutionStatus.Pending))
            } else {
                setSheduleStatus(parseInt(agriGenERPEnum.TransportRateAdditionExecutionStatus.Execution_Started))
            }
        } else {
            setSheduleStatus(0);
        }
    }

    async function Start(data) {
        let response = await services.checkBalanceRatesSet(data.currentMonth, data.currentYear, searchData.groupID, searchData.factoryID);
        let rateSet = response.data;
        if (rateSet > 0) {
            let response = await services.saveTransportRateAdditionExecutionRecord(data, searchData.groupID, searchData.factoryID);
            if (response.statusCode === "Success") {
                checkScheduleAlreadyStarted();
                alert.success(response.message);
            } else {
                alert.error(response.message)
            }
        } else if (rateSet == -1) {
            alert.error("Please approve saved balance rates");
        } else {
            alert.error("Please set balance rates");
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

    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: searchData.groupID,
                            factoryID: searchData.factoryID
                        }}
                    >
                        {({
                            handleSubmit,
                        }) => (
                            <form onSubmit={handleSubmit}>
                                <Box mt={0}>
                                    <Card>
                                        <CardHeader title={cardTitle("Transport Rate Addition Execution")} />
                                        <PerfectScrollbar>
                                            <Divider />
                                            <CardContent>
                                                <Grid container spacing={2}>
                                                    <Grid item md={6} sx={12}>
                                                        <InputLabel shrink id="groupID">
                                                            Group *
                                                        </InputLabel>
                                                        <TextField select
                                                            fullWidth
                                                            name="groupID"
                                                            size='small'
                                                            onChange={(e) => handleChange(e)}
                                                            value={searchData.groupID}
                                                            variant="outlined"
                                                            id="groupID"
                                                            InputProps={{
                                                                readOnly: !permissionList.isGroupFilterEnabled,
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Group--</MenuItem>
                                                            {generateDropDownMenu(GroupList)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={6} xs={12}>
                                                        <InputLabel shrink id="factoryID">
                                                            Factory *
                                                        </InputLabel>
                                                        <TextField select
                                                            fullWidth
                                                            name="factoryID"
                                                            size='small'
                                                            onChange={(e) => handleChange(e)}
                                                            value={searchData.factoryID}
                                                            variant="outlined"
                                                            id="factoryID"
                                                            InputProps={{
                                                                readOnly: !permissionList.isFactoryFilterEnabled,
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Factory--</MenuItem>
                                                            {generateDropDownMenu(FactoryList)}
                                                        </TextField>
                                                    </Grid>
                                                </Grid>
                                                <br />
                                                {transportRate.previouseMonth != "0" && isDisplay ?
                                                    <Grid container alignItems="center" justify="center">
                                                        <Box border={1} borderRadius={16} borderColor="grey" {...defaultProps}>
                                                            <Grid item md={9} xs={12}>
                                                                <CardHeader style={{ marginLeft: '15rem', alignItems: "center", justify: "center" }}
                                                                    titleTypographyProps={{ variant: 'h4' }}
                                                                    title="Previous Execution Schedule"
                                                                    className={classes.fontColors}
                                                                />
                                                            </Grid>
                                                            <Grid container spacing={3} alignItems="center" justify="center">
                                                                <Grid item md={3} xs={12}>
                                                                    <CardHeader style={{ marginLeft: '2rem', marginTop: '-1rem' }} titleTypographyProps={{ variant: 'h6' }}
                                                                        title="Year"
                                                                        className={classes.fontColors}
                                                                    />
                                                                    <TextField
                                                                        fullWidth
                                                                        name="previouseYear"
                                                                        value={transportRate.previouseYear}
                                                                        InputProps={{
                                                                            readOnly: true,
                                                                            style: { fontSize: 25, fontStyle: "initial", textAlign: "right", marginLeft: '2rem', color: 'grey' },
                                                                            disableUnderline: true
                                                                        }}
                                                                        className={classes.fontColors}
                                                                    />
                                                                </Grid>
                                                                <Grid item md={3} xs={12}>
                                                                    <CardHeader style={{ marginLeft: '2rem', marginTop: '-1rem' }} titleTypographyProps={{ variant: 'h6' }}
                                                                        title="Month"
                                                                        className={classes.fontColors}
                                                                    />
                                                                    <TextField
                                                                        fullWidth
                                                                        name="previouseMonth"
                                                                        value={transportRate.previouseMonth}
                                                                        InputProps={{
                                                                            readOnly: true,
                                                                            style: { fontSize: 25, fontStyle: "initial", textAlign: "right", marginLeft: '3rem', color: "grey" },
                                                                            disableUnderline: true
                                                                        }}
                                                                    />
                                                                </Grid>
                                                                <Grid item md={3} xs={12}>
                                                                    <CardHeader style={{ marginLeft: '2rem', marginTop: '0.7rem' }} titleTypographyProps={{ variant: 'h6' }}
                                                                        title=""
                                                                    />
                                                                    <TextField
                                                                        fullWidth
                                                                        name="executionStatusID"
                                                                        value={transportRate.executionStatusID === BalancePayment.Complete ? "Completed" : "Not Complete"}
                                                                        InputProps={{
                                                                            readOnly: true,
                                                                            style: { fontSize: 25, fontStyle: "initial", textAlign: "right", marginLeft: '2rem', color: 'grey' },
                                                                            disableUnderline: true
                                                                        }}
                                                                        className={classes.fontColors}
                                                                    />
                                                                </Grid>
                                                            </Grid>
                                                        </Box>
                                                    </Grid> : null}
                                                {isDisplay ?
                                                    <Grid container alignItems="center" justify="center">
                                                        <Box border={1} borderRadius={16} borderColor="green" {...currentProps} style={{ marginTop: "3rem", marginLeft: "5rem", marginRight: '5rem' }}>
                                                            <Grid item md={12} xs={12} style={{ display: 'flex', justifyContent: 'center' }} >
                                                                <CardHeader titleTypographyProps={{ variant: 'h1' }}
                                                                    title="Current Execution Schedule"
                                                                />
                                                            </Grid>
                                                            <Grid container spacing={3} alignItems="center" justify="center">
                                                                <Grid item md={3} xs={12}>
                                                                    <CardHeader style={{ marginLeft: '2rem', marginTop: '-1rem' }} titleTypographyProps={{ variant: 'h6' }}
                                                                        title="Year"
                                                                    />
                                                                    <TextField
                                                                        fullWidth
                                                                        name="currentYear"
                                                                        value={transportRate.currentYear}
                                                                        InputProps={{
                                                                            readOnly: true,
                                                                            style: { fontSize: 60, fontStyle: "initial", textAlign: "right", marginLeft: '0rem' },
                                                                            disableUnderline: true
                                                                        }}
                                                                    />
                                                                </Grid>
                                                                <Grid item md={3} xs={12}>
                                                                    <CardHeader style={{ marginLeft: '6rem', marginTop: '-1rem' }} titleTypographyProps={{ variant: 'h6' }}
                                                                        title="Month"
                                                                    />
                                                                    <TextField
                                                                        fullWidth
                                                                        name="currentMonth"
                                                                        value={transportRate.currentMonth}
                                                                        InputProps={{
                                                                            readOnly: true,
                                                                            style: { fontSize: 60, fontStyle: "initial", textAlign: "right", marginLeft: '6rem' },
                                                                            disableUnderline: true
                                                                        }}
                                                                    />
                                                                </Grid>
                                                                <Grid item md={3} xs={12}>
                                                                    <CardHeader style={{ marginLeft: '6rem', marginTop: '0.7rem' }} titleTypographyProps={{ variant: 'h6' }}
                                                                        title=""
                                                                    />
                                                                    <Button
                                                                        color="primary"
                                                                        disabled={isCurrentMonth || (sheduleStatus == 1 || sheduleStatus == 2)}
                                                                        type="submit"
                                                                        variant="contained"
                                                                        size="large"
                                                                        fullWidth="true"
                                                                        className={classes.colorApprove}
                                                                        onClick={() => Start(transportRate)}
                                                                        style={{ marginLeft: '5rem' }}
                                                                    >
                                                                        {changeIconName()}
                                                                    </Button>
                                                                </Grid>
                                                            </Grid>
                                                        </Box>
                                                    </Grid> : null}
                                                {isDisplay ?
                                                    <Grid container alignItems="center" justify="center">
                                                        <Box border={1} borderRadius={16} borderColor="grey" {...newProps} style={{ marginTop: "3rem", marginLeft: '12rem', marginRight: '12rem' }}>
                                                            <Grid item md={12} xs={12} style={{ display: 'flex', justifyContent: 'center' }}>
                                                                <CardHeader
                                                                    titleTypographyProps={{ variant: 'h4' }}
                                                                    title="Next Execution Schedule"
                                                                    className={classes.fontColors}
                                                                />
                                                            </Grid>
                                                            <Grid container spacing={3} alignItems="center" justify="center">
                                                                <Grid item md={3} xs={12}>
                                                                    <CardHeader style={{ marginLeft: '2rem', marginTop: '-1rem' }} titleTypographyProps={{ variant: 'h6' }}
                                                                        title="Year"
                                                                        className={classes.fontColors}
                                                                    />
                                                                    <TextField
                                                                        fullWidth
                                                                        name="nextYear"
                                                                        value={settingYear(transportRate.currentMonth)}
                                                                        InputProps={{
                                                                            readOnly: true,
                                                                            style: { fontSize: 25, fontStyle: "initial", textAlign: "right", marginLeft: '2rem', color: 'grey' },
                                                                            disableUnderline: true
                                                                        }}
                                                                    />
                                                                </Grid>
                                                                <Grid item md={3} xs={12}>
                                                                    <CardHeader style={{ marginLeft: '2rem', marginTop: '-1rem' }} titleTypographyProps={{ variant: 'h6' }}
                                                                        title="Month"
                                                                        className={classes.fontColors}
                                                                    />
                                                                    <TextField
                                                                        fullWidth
                                                                        name="nextMonth"
                                                                        value={settingMonth(transportRate.currentMonth)}
                                                                        InputProps={{
                                                                            readOnly: true,
                                                                            style: { fontSize: 25, fontStyle: "initial", textAlign: "right", marginLeft: '3rem', color: 'grey' },
                                                                            disableUnderline: true
                                                                        }}
                                                                    />
                                                                </Grid>
                                                                <Grid item md={3} xs={12}>
                                                                    <CardHeader style={{ marginTop: '0.7rem' }} titleTypographyProps={{ variant: 'h6' }}
                                                                        title=""
                                                                    />
                                                                    <TextField
                                                                        fullWidth
                                                                        name="executionStatusID"
                                                                        value={"Next Schedule"}
                                                                        InputProps={{
                                                                            readOnly: true,
                                                                            style: { fontSize: 25, fontStyle: "initial", textAlign: "right", marginLeft: '2rem', color: 'grey' },
                                                                            disableUnderline: true
                                                                        }}
                                                                    />
                                                                </Grid>
                                                            </Grid>
                                                        </Box>
                                                    </Grid> : null
                                                }



                                            </CardContent>
                                        </PerfectScrollbar>
                                    </Card>
                                </Box>
                            </form>
                        )}


                    </Formik>
                </Container>
            </Page>
        </Fragment >
    )

}