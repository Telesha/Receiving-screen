import React, { useState, useEffect, Fragment } from 'react';
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
    Button,
    Typography
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { LoadingComponent } from 'src/utils/newLoader';
import { useAlert } from "react-alert";
import PageHeader from 'src/views/Common/PageHeader';
import { Formik } from 'formik';
import * as Yup from "yup";

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
    }
}));

const screenCode = 'CHECKROLLCONFIGURATION';

export default function CheckrollConfiguration() {
    const [title, setTitle] = useState("Checkroll Configuration");
    const classes = useStyles();
    const alert = useAlert();
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });
    const [groups, setGroups] = useState([]);
    const [estate, setEstate] = useState([]);
    const [checkrollConfigSearch, setCheckrollConfigSearch] = useState({
        groupID: '0',
        estateID: '0'
    })
    const [checrollDetailList, setChecrollDetailList] = useState({
        checkrollConfigID: '',
        normalOT: '',
        nightOT: '',
        sundayOT: '',
        cashKilo: '',
        machinePluckingCashKilo: '',
        overKilo: '',
        machinePluckingOverKilo: '',
        cashDayPluckingOverKiloRate: '',
        CashDayPluckingKiloRate: ''
    });
    const [isDisable, setIsDisable] = useState(false);
    const navigate = useNavigate();
    let encryptedID = "";

    const handleClick = () => {
        encryptedID = btoa('0');
        navigate('/app/checkrollConfiguration/addEdit/' + encryptedID)
    }

    const EditCheckrollConfigDetails = (checkrollConfigID) => {
        encryptedID = btoa(checkrollConfigID.toString());
        navigate('/app/checkrollConfiguration/addEdit/' + encryptedID)
    }

    useEffect(() => {
        trackPromise(
            getPermission(),
            getGroupsForDropdown()
        )
    }, [])

    useEffect(() => {
        trackPromise(
            getEstateDetailsByGroupID()
        )
    }, [checkrollConfigSearch.groupID])

    useEffect(() => {
        setIsDisable();
    }, [checkrollConfigSearch.groupID, checkrollConfigSearch.estateID]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWCHECKROLLCONFIURATION');

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

        setCheckrollConfigSearch({
            ...checkrollConfigSearch,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            estateID: parseInt(tokenService.getFactoryIDFromToken())
        });
    }

    async function getGroupsForDropdown() {
        const groups = await services.getGroupsForDropdown();
        setGroups(groups);
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstatesByGroupID(checkrollConfigSearch.groupID);
        setEstate(response);
    }

    async function getDetails() {
        var response = await services.getCheckrollDetailsByGroupIDAndEstateID(checkrollConfigSearch.groupID, checkrollConfigSearch.estateID);
        if (response && Object.keys(response).length > 0) {
            setChecrollDetailList({
                ...checrollDetailList,
                normalOT: response.normalOTRate,
                nightOT: response.nightOTRate,
                sundayOT: response.sundayOTRate,
                cashKilo: response.cashKiloRate,
                machinePluckingCashKilo: response.machinePluckingCashKilo,
                overKilo: response.overKiloRate,
                machinePluckingOverKilo: response.machinePluckingOverKilo,
                checkrollConfigID: response.checkrollConfigurationID,
                cashDayPluckingOverKiloRate: response.cashDayPluckingOverKiloRate,
                cashDayPluckingKiloRate: response.cashDayPluckingKiloRate
            })
            setIsDisable(true);
        } else {
            alert.error("No Records to Display")
        }
    }

    function handleChange(e) {
        const target = e.target;
        const value = target.value;

        setCheckrollConfigSearch({
            ...checkrollConfigSearch,
            [e.target.name]: value
        })
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

    function cardTitle(titleName) {
        return (
            <Grid container spacing={1}>
                <Grid item md={10} xs={12}>
                    {titleName}
                </Grid>
                <Grid item md={2} xs={12}>
                    <PageHeader
                        onClick={handleClick}
                        isEdit={true}
                        toolTiptitle={"Add Checkroll Configurations"}
                    />
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
                            groupID: checkrollConfigSearch.groupID,
                            estateID: checkrollConfigSearch.estateID
                        }}

                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                                estateID: Yup.number().required('Estate is required').min("1", 'Estate is required')
                            })
                        }
                        onSubmit={() => trackPromise(getDetails())}
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
                                                <Grid container spacing={2}>
                                                    <Grid item md={4} xs={12}>
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
                                                            value={checkrollConfigSearch.groupID}
                                                            variant="outlined"
                                                            id="groupID"
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
                                                            size='small'
                                                            name="estateID"
                                                            onChange={(e) => handleChange(e)}
                                                            value={checkrollConfigSearch.estateID}
                                                            variant="outlined"
                                                            id="estateID"
                                                            InputProps={{
                                                                readOnly: !permissionList.isFactoryFilterEnabled,
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Estate--</MenuItem>
                                                            {generateDropDownMenu(estate)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={12} >
                                                        <center>
                                                            <Box display="flex" container justifyContent="flex-start" p={2} >
                                                                <Button
                                                                    color="primary"
                                                                    variant="contained"
                                                                    type="submit"
                                                                    size='small'
                                                                >
                                                                    Search
                                                                </Button>
                                                            </Box>
                                                        </center>
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                            <Divider />
                                            {isDisable ?
                                                <Box justifyContent="center" container p={2}>
                                                    <Card>
                                                        <CardContent>
                                                            <Grid container spacing={2}>
                                                                <Grid item md={3} xs={12} style={{ padding: '1vh', paddingTop: 'x' }}>
                                                                    <Typography p={2} style={{ fontWeight: 'bold', }}>
                                                                        Over Time Rate (Rs.)
                                                                    </Typography>
                                                                </Grid>
                                                                <Grid item md={3} xs={12}>
                                                                    <InputLabel shrink id="normalOT">
                                                                        Normal OT Rate
                                                                    </InputLabel>
                                                                    <TextField
                                                                        fullWidth
                                                                        name="normalOT"
                                                                        onBlur={handleBlur}
                                                                        size='small'
                                                                        onChange={(e) => handleChange(e)}
                                                                        value={checrollDetailList.normalOT}
                                                                        variant="outlined"
                                                                        id="normalOT"
                                                                        type="text"
                                                                        inputProps={{
                                                                            readOnly: true
                                                                        }}
                                                                    >
                                                                    </TextField>
                                                                </Grid>
                                                                <Grid item md={3} xs={12}>
                                                                    <InputLabel shrink id="nightOT">
                                                                        Night OT Rate
                                                                    </InputLabel>
                                                                    <TextField
                                                                        fullWidth
                                                                        name="nightOT"
                                                                        onBlur={handleBlur}
                                                                        size='small'
                                                                        onChange={(e) => handleChange(e)}
                                                                        value={checrollDetailList.nightOT}
                                                                        variant="outlined"
                                                                        id="nightOT"
                                                                        type="text"
                                                                        inputProps={{
                                                                            readOnly: true
                                                                        }}
                                                                    >
                                                                    </TextField>
                                                                </Grid>
                                                                <Grid item md={3} xs={12}>
                                                                    <InputLabel shrink id="sundayOT">
                                                                        Sunday OT Rate
                                                                    </InputLabel>
                                                                    <TextField
                                                                        fullWidth
                                                                        name="sundayOT"
                                                                        onBlur={handleBlur}
                                                                        size='small'
                                                                        onChange={(e) => handleChange(e)}
                                                                        value={checrollDetailList.sundayOT}
                                                                        variant="outlined"
                                                                        id="sundayOT"
                                                                        type="text"
                                                                        inputProps={{
                                                                            readOnly: true
                                                                        }}
                                                                    >
                                                                    </TextField>
                                                                </Grid>
                                                            </Grid>
                                                            <Grid container spacing={2}>
                                                                <Grid item md={3} xs={12} style={{ padding: '1vh', paddingTop: '20px' }}>
                                                                    <Typography p={2} style={{ fontWeight: 'bold' }}>
                                                                        Cash Kilo Rate (Rs.)
                                                                    </Typography>
                                                                </Grid>
                                                                <Grid item md={3} xs={12}>
                                                                    <InputLabel shrink id="cashKilo">
                                                                        Plucking Cash Kilo <br />Rate
                                                                    </InputLabel>
                                                                    <TextField
                                                                        fullWidth
                                                                        name="cashKilo"
                                                                        onBlur={handleBlur}
                                                                        size='small'
                                                                        onChange={(e) => handleChange(e)}
                                                                        value={checrollDetailList.cashKilo}
                                                                        variant="outlined"
                                                                        id="cashKilo"
                                                                        type="text"
                                                                        inputProps={{
                                                                            readOnly: true
                                                                        }}
                                                                    >
                                                                    </TextField>
                                                                </Grid>
                                                                <Grid item md={3} xs={12}>
                                                                    <InputLabel shrink id="machinePluckingCashKilo">
                                                                        Machine Plucking Cash Kilo Rate
                                                                    </InputLabel>
                                                                    <TextField
                                                                        fullWidth
                                                                        name="machinePluckingCashKilo"
                                                                        onBlur={handleBlur}
                                                                        size='small'
                                                                        onChange={(e) => handleChange(e)}
                                                                        value={checrollDetailList.machinePluckingCashKilo}
                                                                        variant="outlined"
                                                                        id="machinePluckingCashKilo"
                                                                        type="text"
                                                                        inputProps={{
                                                                            readOnly: true
                                                                        }}
                                                                    >
                                                                    </TextField>
                                                                </Grid>
                                                                {/* <Grid item md={3} xs={12}>
                                                                    <InputLabel shrink id="cashDayPluckingKiloRate">
                                                                        Cash Day Plucking Kilo <br />Rate
                                                                    </InputLabel>
                                                                    <TextField
                                                                        error={Boolean(touched.cashDayPluckingKiloRate && errors.cashDayPluckingKiloRate)}
                                                                        fullWidth
                                                                        helperText={touched.cashDayPluckingKiloRate && errors.cashDayPluckingKiloRate}
                                                                        name="cashDayPluckingKiloRate"
                                                                        onBlur={handleBlur}
                                                                        size='small'
                                                                        onChange={(e) => handleChange(e)}
                                                                        value={checrollDetailList.cashDayPluckingKiloRate}
                                                                        variant="outlined"
                                                                        id="cashDayPluckingKiloRate"
                                                                        type="text"
                                                                        inputProps={{
                                                                            readOnly: true
                                                                        }}
                                                                    >
                                                                    </TextField>
                                                                </Grid> */}
                                                            </Grid>
                                                            <Grid container spacing={2}>
                                                                <Grid item md={3} xs={12} style={{ padding: '1vh', paddingTop: '20px' }}>
                                                                    <Typography p={2} style={{ fontWeight: 'bold' }}>
                                                                        Over Kilo Rate (Rs.)
                                                                    </Typography>
                                                                </Grid>
                                                                <Grid item md={3} xs={12}>
                                                                    <InputLabel shrink id="overKilo">
                                                                        Plucking Over Kilo <br />Rate
                                                                    </InputLabel>
                                                                    <TextField
                                                                        fullWidth
                                                                        name="overKilo"
                                                                        onBlur={handleBlur}
                                                                        size='small'
                                                                        onChange={(e) => handleChange(e)}
                                                                        value={checrollDetailList.overKilo}
                                                                        variant="outlined"
                                                                        id="overKilo"
                                                                        type="text"
                                                                        inputProps={{
                                                                            readOnly: true
                                                                        }}
                                                                    >
                                                                    </TextField>
                                                                </Grid>
                                                                <Grid item md={3} xs={12}>
                                                                    <InputLabel shrink id="machinePluckingOverKilo">
                                                                        Machine Plucking Over Kilo Rate
                                                                    </InputLabel>
                                                                    <TextField
                                                                        fullWidth
                                                                        name="machinePluckingOverKilo"
                                                                        onBlur={handleBlur}
                                                                        size='small'
                                                                        onChange={(e) => handleChange(e)}
                                                                        value={checrollDetailList.machinePluckingOverKilo}
                                                                        variant="outlined"
                                                                        id="machinePluckingOverKilo"
                                                                        type="text"
                                                                        inputProps={{
                                                                            readOnly: true
                                                                        }}
                                                                    >
                                                                    </TextField>
                                                                </Grid>
                                                                <Grid item md={3} xs={12}>
                                                                    <InputLabel shrink id="cashDayPluckingOverKiloRate">
                                                                        Cash Day Plucking Over Kilo Rate
                                                                    </InputLabel>
                                                                    <TextField
                                                                        error={Boolean(touched.cashDayPluckingOverKiloRate && errors.cashDayPluckingOverKiloRate)}
                                                                        fullWidth
                                                                        helperText={touched.cashDayPluckingOverKiloRate && errors.cashDayPluckingOverKiloRate}
                                                                        name="cashDayPluckingOverKiloRate"
                                                                        onBlur={handleBlur}
                                                                        size='small'
                                                                        onChange={(e) => handleChange(e)}
                                                                        value={checrollDetailList.cashDayPluckingOverKiloRate}
                                                                        variant="outlined"
                                                                        id="cashDayPluckingOverKiloRate"
                                                                        type="text"
                                                                        inputProps={{
                                                                            readOnly: true
                                                                        }}
                                                                    >
                                                                    </TextField>
                                                                </Grid>
                                                            </Grid>
                                                            <Grid item md={12} xs={12} >
                                                                <center>
                                                                    <Box display="flex" container justifyContent="flex-end" p={2} >
                                                                        <Button
                                                                            color="primary"
                                                                            variant="contained"
                                                                            size='small'
                                                                            onClick={() => EditCheckrollConfigDetails(checrollDetailList.checkrollConfigID)}
                                                                        >
                                                                            Edit
                                                                        </Button>
                                                                    </Box>
                                                                </center>
                                                            </Grid>
                                                        </CardContent>
                                                    </Card>
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
        </Fragment >
    )
}