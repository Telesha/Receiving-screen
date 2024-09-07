import React, { useState, useEffect, Fragment, useRef } from 'react';
import {
    Box,
    Card,
    makeStyles,
    Container,
    Divider,
    CardContent,
    Grid,
    TextField,
    MenuItem,
    InputLabel,
    CardHeader,
    Button
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { LoadingComponent } from 'src/utils/newLoader';
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
    },
    succes: {
        backgroundColor: "#fce3b6",
        marginLeft: "15px",
        marginBottom: "5px"
    },
    table: {
        width: 650,
    },
    colorRecord: {
        backgroundColor: "green",
    },
    colorCancel: {
        backgroundColor: "red",
    },
}));

const screenCode = 'CHECKROLLDATEBLOCKER';

export default function CheckrollDateBlocker() {

    const [title, setTitle] = useState("Date Blocker");
    const classes = useStyles();
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });
    const [groupList, setGroupList] = useState([]);
    const [estateList, setEstateList] = useState([]);
    const [divisionList, setDivisionList] = useState([]);
    const [dateBlock, setDateBlock] = useState({
        groupID: '0',
        estateID: '0',
        divisionID: '0',
        unlockDateCount: '',
        attendanceExecutionDateID: ''
    });
    const navigate = useNavigate();
    const alert = useAlert();

    useEffect(() => {
        trackPromise(
            getPermission(),
            getGroupsForDropDown()
        );
    }, [])

    useEffect(() => {
        trackPromise(getEstateDetailsByGroupID());
        setDateBlock({
            ...dateBlock,
            estateID: '0',
            divisionID: '0',
            unlockDateCount: '',
        })
    }, [dateBlock.groupID])

    useEffect(() => {
        if (dateBlock.estateID > 0) {
            trackPromise(getDivisionDetailsByEstateID());
        }
        setDateBlock({
            ...dateBlock,
            divisionID: '0',
            unlockDateCount: '',
        })
    }, [dateBlock.estateID])

    useEffect(() => {
        trackPromise(getCheckrollDateBlockerDetails());
        setDateBlock({
            ...dateBlock,
            unlockDateCount: '',
        })
    }, [dateBlock.divisionID])

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWCHECKROLLDATEBLOCKER');

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

        setDateBlock({
            ...dateBlock,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            estateID: parseInt(tokenService.getFactoryIDFromToken())
        });
    }

    async function getGroupsForDropDown() {
        const groups = await services.getGroupsForDropdown();
        setGroupList(groups);
    }

    async function getEstateDetailsByGroupID() {
        var estate = await services.getEstatesByGroupID(dateBlock.groupID);
        setEstateList(estate);
    }

    async function getDivisionDetailsByEstateID() {
        var division = await services.getDivisionDetailsByEstateID(dateBlock.estateID);
        setDivisionList(division);
    };

    function generateDropDownMenu(data) {
        let items = []
        if (data != null) {
            for (const [key, value] of Object.entries(data)) {
                items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
            }
        }
        return items
    }

    async function getCheckrollDateBlockerDetails() {
        const model = {
            groupID: parseInt(dateBlock.groupID),
            estateID: parseInt(dateBlock.estateID),
            divisionID: parseInt(dateBlock.divisionID)
        }

        const response = await services.getCheckrollDateBlockerDetails(model);

        setDateBlock({
            ...dateBlock,
            unlockDateCount: response[0].unlockDateCount == 0 && response[0].attendanceExecutionDateID == 0 ? '' : response[0].unlockDateCount,
            attendanceExecutionDateID: response[0].attendanceExecutionDateID
        })
    }

    async function updateDateBlock(data) {
        if (dateBlock.attendanceExecutionDateID == 0) {
            if (dateBlock.unlockDateCount.toString().trim() === '' || parseInt(dateBlock.unlockDateCount) === 0) {
                alert.error("Please enter a valid count greater than 0");
                return;
            }

            const formattedCount = parseInt(dateBlock.unlockDateCount).toFixed(2);

            let model = {
                groupID: parseInt(dateBlock.groupID),
                estateID: parseInt(dateBlock.estateID),
                divisionID: parseInt(dateBlock.divisionID),
                unlockDateCount: parseInt(formattedCount),
                createdBy: parseInt(tokenService.getUserIDFromToken())
            }

            let response = await services.saveDateBlockCount(model);

            if (response.statusCode == "Success") {
                alert.success(response.message);
                getCheckrollDateBlockerDetails();
            }
            else {
                alert.error(response.message);
            }
        } else {
            let model = {
                attendanceExecutionDateID: parseInt(dateBlock.attendanceExecutionDateID),
                groupID: parseInt(dateBlock.groupID),
                estateID: parseInt(dateBlock.estateID),
                divisionID: parseInt(dateBlock.divisionID),
                unlockDateCount: dateBlock.unlockDateCount,
                createdBy: parseInt(tokenService.getUserIDFromToken())
            }

            let response = await services.updateDateBlockCount(model);
            if (response.statusCode == "Success") {
                alert.success(response.message);
            }
            else {
                alert.error(response.message);
            }
        }
    }

    function handleChange(e) {
        const target = e.target;
        const value = target.value;

        setDateBlock({
            ...dateBlock,
            [e.target.name]: value
        })
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
                            groupID: dateBlock.groupID,
                            estateID: dateBlock.estateID,
                            divisionID: dateBlock.divisionID,
                            unlockDateCount: dateBlock.unlockDateCount,

                        }}

                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                                estateID: Yup.number().required('Estate is required').min("1", 'Estate is required'),
                                divisionID: Yup.number().required('Division is required').min("1", 'Division is required'),
                                unlockDateCount: Yup.number()
                                    .required('Unlock date count is required')
                                    .typeError('Unlock date count must be a number')
                                    .integer('Unlock date count must be an integer')
                                    .min(0, 'Unlock date count cannot be negative')
                                    .max(40, 'Unlock date count cannot be more than 40')
                            })
                        }
                        onSubmit={() => trackPromise((updateDateBlock()))}
                        enableReinitialize
                    >
                        {({
                            errors,
                            handleBlur,
                            handleSubmit,
                            touched
                        }) => (
                            <form onSubmit={handleSubmit} >
                                <Box mt={0}>
                                    <Card>
                                        <CardHeader
                                            title={cardTitle(title)}
                                        />
                                        <Divider />
                                        <CardContent>
                                            <Grid container spacing={2}>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="groupID">
                                                        Group *
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.groupID && errors.groupID)}
                                                        fullWidth
                                                        helperText={touched.groupID && errors.groupID}
                                                        size='small'
                                                        name="groupID"
                                                        onChange={(e) => handleChange(e)}
                                                        value={dateBlock.groupID}
                                                        variant="outlined"
                                                        id="groupID"
                                                        InputProps={{
                                                            readOnly: !permissionList.isGroupFilterEnabled,
                                                        }}
                                                    >
                                                        <MenuItem value="0">--Select Group--</MenuItem>
                                                        {generateDropDownMenu(groupList)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="estateID">
                                                        Estate *
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.estateID && errors.estateID)}
                                                        fullWidth
                                                        helperText={touched.estateID && errors.estateID}
                                                        size='small'
                                                        name="estateID"
                                                        onChange={(e) => handleChange(e)}
                                                        value={dateBlock.estateID}
                                                        variant="outlined"
                                                        id="estateID"
                                                        InputProps={{
                                                            readOnly: !permissionList.isFactoryFilterEnabled,
                                                        }}
                                                    >
                                                        <MenuItem value="0">--Select Estate--</MenuItem>
                                                        {generateDropDownMenu(estateList)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="divisionID">
                                                        Division *
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.divisionID && errors.divisionID)}
                                                        fullWidth
                                                        helperText={touched.divisionID && errors.divisionID}
                                                        size='small'
                                                        name="divisionID"
                                                        onChange={(e) => handleChange(e)}
                                                        value={dateBlock.divisionID}
                                                        variant="outlined"
                                                        id="divisionID"
                                                    >
                                                        <MenuItem value="0">--Select Division--</MenuItem>
                                                        {generateDropDownMenu(divisionList)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="unlockDateCount">
                                                        Unlock Dates
                                                    </InputLabel>
                                                    <TextField
                                                        error={Boolean(touched.unlockDateCount && errors.unlockDateCount)}
                                                        fullWidth
                                                        helperText={touched.unlockDateCount && errors.unlockDateCount}
                                                        name="unlockDateCount"
                                                        onBlur={handleBlur}
                                                        size='small'
                                                        onChange={(e) => handleChange(e)}
                                                        value={dateBlock.unlockDateCount}
                                                        variant="outlined"
                                                        id="unlockDateCount"
                                                        type="text"
                                                    >
                                                    </TextField>
                                                </Grid>
                                            </Grid>
                                            <br />
                                            <Grid container justify="flex-end">
                                                <Box pr={2}>
                                                    <Button
                                                        color="primary"
                                                        variant="contained"
                                                        type="submit"
                                                        size='small'
                                                    >
                                                        Update
                                                    </Button>
                                                </Box>
                                            </Grid>
                                        </CardContent>
                                        <br />
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