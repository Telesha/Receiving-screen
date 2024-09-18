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
    Chip,
    CardHeader,
    Button,
    Typography
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import tokenDecoder from '../../../utils/tokenDecoder';
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

export default function CheckrollConfigurationAddEdit() {
    const [title, setTitle] = useState("Checkroll Configuration");
    const classes = useStyles();
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
    const [checkrollDetails, setCheckrollDetails] = useState({
        normalOT: '',
        nightOT: '',
        sundayOT: '',
        cashKilo: '',
        machinePluckingCashKilo: '',
        overKilo: '',
        machinePluckingOverKilo: '',
        // cashDayPluckingKiloRate: '',
        cashDayPluckingOverKiloRate: ''
    });
    const [checkrollConfigurationID, setCheckrollConfigurationID] = useState(0);
    const [isUpdate, setIsUpdate] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [isHide, setIsHide] = useState(true);
    const { checkrollConfigID } = useParams();
    const navigate = useNavigate();
    const alert = useAlert();
    let decrypted = 0;

    useEffect(() => {
        decrypted = atob(checkrollConfigID.toString());
        if (decrypted != 0) {
            setCheckrollConfigurationID(decrypted);
            trackPromise(getAllCheckrollConfigurationDetails(decrypted));
        }
        trackPromise(
            getPermission()
        )
    }, [])

    useEffect(() => {
        trackPromise(
            getEstateDetailsByGroupID()
        )
        setIsHide(true)
    }, [checkrollConfigSearch.groupID])

    useEffect(() => {
        if (parseInt(checkrollConfigSearch.groupID) !== 0 && parseInt(checkrollConfigSearch.estateID) !== 0) {
            setIsHide(false)
        }
        ClearChechrollConfigData()
        setCheckrollConfigSearch({
            ...checkrollConfigSearch,
            estateID: '0'
        })
        // setIsHide(true)
    }, [checkrollConfigSearch.groupID])

    useEffect(() => {
        trackPromise(
            getDetails()
        )
        ClearChechrollConfigData()
    }, [checkrollConfigSearch.estateID])

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITVIEWCHECKROLLCONFIURATION');

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

        getGroupsForDropdown()
    }

    async function getGroupsForDropdown() {
        const groups = await services.getGroupsForDropdown();
        setGroups(groups);
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstatesByGroupID(checkrollConfigSearch.groupID);
        setEstate(response);
    }

    function handleChange(e) {
        const target = e.target;
        const value = target.value;

        setCheckrollDetails({
            ...checkrollDetails,
            [e.target.name]: value
        })
    }

    function handleChange1(e) {
        const target = e.target;
        const value = target.value;

        setCheckrollConfigSearch({
            ...checkrollConfigSearch,
            [e.target.name]: value
        })
    }

    function handleClick() {
        navigate('/app/checkrollConfiguration/listing/')
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

    async function getDetails() {
        setIsHide(true)
        var response = await services.getCheckrollDetailsByGroupIDAndEstateID(checkrollConfigSearch.groupID, checkrollConfigSearch.estateID);
        console.log('response', response)
        if (response && Object.keys(response).length > 0) {
            setCheckrollDetails({
                ...checkrollDetails,
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
            setIsEdit(true);
            setIsHide(false);
        } else {
            // alert.error("No Records to Display")
            setIsEdit(false);
            setIsHide(false);
        }
    }

    async function saveCheckrollConfigurations() {
        if (isUpdate || isEdit) {
            const updateModel = {
                checkrollConfigID: isEdit ? parseInt(checkrollDetails.checkrollConfigID) : parseInt(checkrollConfigurationID),
                normalOTRate: checkrollDetails.normalOT === '' ? parseFloat(0) : parseFloat(checkrollDetails.normalOT),
                nightOTRate: checkrollDetails.nightOT === '' ? parseFloat(0) : parseFloat(checkrollDetails.nightOT),
                sundayOTRate: checkrollDetails.sundayOT === '' ? parseFloat(0) : parseFloat(checkrollDetails.sundayOT),
                cashKiloRate: parseFloat(checkrollDetails.cashKilo),
                machinePluckingCashKilo: parseFloat(checkrollDetails.machinePluckingCashKilo),
                machinePluckingOverKilo: parseFloat(checkrollDetails.machinePluckingOverKilo),
                // cashDayPluckingKiloRate: parseFloat(checkrollDetails.cashDayPluckingKiloRate),
                cashDayPluckingOverKiloRate: parseFloat(checkrollDetails.cashDayPluckingOverKiloRate),
                overKiloRate: parseFloat(checkrollDetails.overKilo),
                modifiedBy: tokenDecoder.getUserIDFromToken()
            };

            const resposne = await services.updateCheckrollConfigurationDetails(updateModel);

            if (resposne.statusCode == 'Success') {
                alert.success(resposne.message);
            } else {
                alert.error(resposne.message);
            }
            navigate('/app/checkrollConfiguration/listing/')
        } else {
            const model = {
                groupID: checkrollConfigSearch.groupID,
                estateID: checkrollConfigSearch.estateID,
                normalOTRate: checkrollDetails.normalOT == '' ? parseFloat(0) : parseFloat(checkrollDetails.normalOT),
                nightOTRate: checkrollDetails.nightOT == '' ? parseFloat(0) : parseFloat(checkrollDetails.nightOT),
                sundayOTRate: checkrollDetails.sundayOT == '' ? parseFloat(0) : parseFloat(checkrollDetails.sundayOT),
                cashKiloRate: parseFloat(checkrollDetails.cashKilo),
                machinePluckingCashKilo: parseFloat(checkrollDetails.machinePluckingCashKilo),
                machinePluckingOverKilo: parseFloat(checkrollDetails.machinePluckingOverKilo),
                overKiloRate: parseFloat(checkrollDetails.overKilo),
                // cashDayPluckingKiloRate: parseFloat(checkrollDetails.cashDayPluckingKiloRate),
                cashDayPluckingOverKiloRate: parseFloat(checkrollDetails.cashDayPluckingOverKiloRate),
                createdBy: tokenDecoder.getUserIDFromToken()

            }
            const response = await services.saveCheckrollConfigurationDetails(model);
            if (response.statusCode == 'Success') {
                alert.success(response.message);
                navigate('/app/checkrollConfiguration/listing/')
            } else {
                alert.error(response.message);
            }
        }
    }

    async function getAllCheckrollConfigurationDetails(checkrollConfigID) {
        let response = await services.getAllCheckrollConfiguationDetails(checkrollConfigID);
        setCheckrollDetails({
            ...checkrollDetails,
            normalOT: response.normalOTRate,
            nightOT: response.nightOTRate,
            sundayOT: response.sundayOTRate,
            cashKilo: response.cashKiloRate,
            machinePluckingCashKilo: response.machinePluckingCashKilo,
            machinePluckingOverKilo: response.machinePluckingOverKilo,
            overKilo: response.overKiloRate,
            cashDayPluckingOverKiloRate: response.cashDayPluckingOverKiloRate,
            // cashDayPluckingKiloRate: response.cashDayPluckingKiloRate
        })

        setCheckrollConfigSearch({
            ...checkrollConfigSearch,
            groupID: response.groupID,
            estateID: response.estateID,
        })
        setIsUpdate(true)
        setTitle("Edit - Checkroll Configuration")
    }

    function ClearChechrollConfigData() {
        setCheckrollDetails({
            ...checkrollDetails,
            normalOT: '',
            nightOT: '',
            sundayOT: '',
            cashKilo: '',
            machinePluckingCashKilo: '',
            machinePluckingOverKilo: '',
            overKilo: '',
            cashDayPluckingOverKiloRate: ''
        })
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
                            estateID: checkrollConfigSearch.estateID,
                            normalOT: checkrollDetails.normalOT,
                            nightOT: checkrollDetails.nightOT,
                            sundayOT: checkrollDetails.sundayOT,
                            cashKilo: checkrollDetails.cashKilo,
                            machinePluckingCashKilo: checkrollDetails.machinePluckingCashKilo,
                            machinePluckingOverKilo: checkrollDetails.machinePluckingOverKilo,
                            // cashDayPluckingKiloRate: checkrollDetails.cashDayPluckingKiloRate,
                            cashDayPluckingOverKiloRate: checkrollDetails.cashDayPluckingOverKiloRate,
                            overKilo: checkrollDetails.overKilo
                        }}

                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                                estateID: Yup.number().required('Estate is required').min("1", 'Estate is required'),
                                normalOT: Yup.string()
                                    .matches(/^\d{1,5}(\.\d+)?$/, 'Please enter valid OT rate')
                                    .matches(/^\d{1,5}(\.\d{1,2})?$/, 'Please enter one or two decimal value for OT rate'),
                                nightOT: Yup.string()
                                    .matches(/^\d{1,5}(\.\d+)?$/, 'Please enter valid OT rate')
                                    .matches(/^\d{1,5}(\.\d{1,2})?$/, 'Please enter one or two decimal value for OT rate'),
                                sundayOT: Yup.string()
                                    .matches(/^\d{1,5}(\.\d+)?$/, 'Please enter valid OT rate')
                                    .matches(/^\d{1,5}(\.\d{1,2})?$/, 'Please enter one or two decimal value for OT rate'),
                                cashKilo: Yup.string().required('Plucking Cash kilo rate is required')
                                    .matches(/^\d{1,5}(\.\d+)?$/, 'Please enter valid cash kilo rate')
                                    .matches(/^\d{1,5}(\.\d{1,2})?$/, 'Please enter two decimal value for cash kilo rate')
                                    .test('amount', "Please provide valid cash kilo rate", val => val > 0),
                                machinePluckingCashKilo: Yup.string().required('Machine Plucking Cash kilo rate is required')
                                    .matches(/^\d{1,5}(\.\d+)?$/, 'Please enter valid cash kilo rate')
                                    .matches(/^\d{1,5}(\.\d{1,2})?$/, 'Please enter two decimal value for cash kilo rate')
                                    .test('amount', "Please provide valid cash kilo rate", val => val > 0),
                                overKilo: Yup.string().required('Plucking Over kilo rate is required')
                                    .matches(/^\d{1,5}(\.\d+)?$/, 'Please enter valid over kilo rate')
                                    .matches(/^\d{1,5}(\.\d{1,2})?$/, 'Please enter two decimal value for over kilo rate')
                                    .test('amount', "Please provide valid over kilo rate", val => val > 0),
                                machinePluckingOverKilo: Yup.string().required('Machine Plucking Over kilo rate is required')
                                    .matches(/^\d{1,5}(\.\d+)?$/, 'Please enter valid cash kilo rate')
                                    .matches(/^\d{1,5}(\.\d{1,2})?$/, 'Please enter two decimal value for cash kilo rate')
                                    .test('amount', "Please provide valid cash kilo rate", val => val > 0),
                                // cashDayPluckingKiloRate: Yup.string().required('Cash Day Plucking kilo rate is required')
                                //     .matches(/^\d{1,5}(\.\d+)?$/, 'Please enter valid cash kilo rate')
                                //     .matches(/^\d{1,5}(\.\d{1,2})?$/, 'Please enter two decimal value for cash kilo rate')
                                //     .test('amount', "Please provide valid cash kilo rate", val => val > 0),
                                cashDayPluckingOverKiloRate: Yup.string().required('Cash Day Plucking Over kilo rate is required')
                                    .matches(/^\d{1,5}(\.\d+)?$/, 'Please enter valid cash kilo rate')
                                    .matches(/^\d{1,5}(\.\d{1,2})?$/, 'Please enter two decimal value for cash kilo rate')
                                    .test('amount', "Please provide valid cash kilo rate", val => val > 0),
                            })
                        }
                        onSubmit={() => trackPromise(saveCheckrollConfigurations())}
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
                                                            onChange={(e) => handleChange1(e)}
                                                            value={checkrollConfigSearch.groupID}
                                                            variant="outlined"
                                                            id="groupID"
                                                            InputProps={{
                                                                readOnly: !permissionList.isGroupFilterEnabled || isUpdate,
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
                                                            onChange={(e) => handleChange1(e)}
                                                            value={checkrollConfigSearch.estateID}
                                                            variant="outlined"
                                                            id="estateID"
                                                            InputProps={{
                                                                readOnly: !permissionList.isFactoryFilterEnabled || isUpdate,
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Estate--</MenuItem>
                                                            {generateDropDownMenu(estate)}
                                                        </TextField>
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                            <Divider />
                                            {!isHide ?
                                                <Box justifyContent="center" container p={2}>
                                                    <Card>
                                                        <CardContent>
                                                            <Grid container spacing={2}>
                                                                <Grid item md={3} xs={12} style={{ padding: '1vh', paddingTop: '5vh' }}>
                                                                    <Typography p={2} style={{ fontWeight: 'bold' }}>
                                                                        Over Time Rate (Rs.)
                                                                    </Typography>
                                                                </Grid>
                                                                <Grid item md={3} xs={12}>
                                                                    <InputLabel shrink id="normalOT">
                                                                        Normal OT <br /> Rate
                                                                    </InputLabel>
                                                                    <TextField
                                                                        // shrink id="normalOT"
                                                                        error={Boolean(touched.normalOT && errors.normalOT)}
                                                                        fullWidth
                                                                        helperText={touched.normalOT && errors.normalOT}
                                                                        name="normalOT"
                                                                        onBlur={handleBlur}
                                                                        size='small'
                                                                        onChange={(e) => handleChange(e)}
                                                                        value={checkrollDetails.normalOT}
                                                                        variant="outlined"
                                                                        id="normalOT"
                                                                        type="text"
                                                                    >
                                                                    </TextField>
                                                                </Grid>
                                                                <Grid item md={3} xs={12}>
                                                                    <InputLabel shrink id="nightOT">
                                                                        Night OT <br /> Rate
                                                                    </InputLabel>
                                                                    <TextField
                                                                        error={Boolean(touched.nightOT && errors.nightOT)}
                                                                        fullWidth
                                                                        helperText={touched.nightOT && errors.nightOT}
                                                                        name="nightOT"
                                                                        onBlur={handleBlur}
                                                                        size='small'
                                                                        onChange={(e) => handleChange(e)}
                                                                        value={checkrollDetails.nightOT}
                                                                        variant="outlined"
                                                                        id="nightOT"
                                                                        type="text"
                                                                    >
                                                                    </TextField>
                                                                </Grid>
                                                                <Grid item md={3} xs={12}>
                                                                    <InputLabel shrink id="sundayOT">
                                                                        Sunday OT <br /> Rate
                                                                    </InputLabel>
                                                                    <TextField
                                                                        error={Boolean(touched.sundayOT && errors.sundayOT)}
                                                                        fullWidth
                                                                        helperText={touched.sundayOT && errors.sundayOT}
                                                                        name="sundayOT"
                                                                        onBlur={handleBlur}
                                                                        size='small'
                                                                        onChange={(e) => handleChange(e)}
                                                                        value={checkrollDetails.sundayOT}
                                                                        variant="outlined"
                                                                        id="sundayOT"
                                                                        type="text"
                                                                    >
                                                                    </TextField>
                                                                </Grid>
                                                            </Grid>
                                                            <Grid container spacing={2}>
                                                                <Grid item md={3} xs={12} style={{ padding: '1vh', paddingTop: '5vh' }}>
                                                                    <Typography p={2} style={{ fontWeight: 'bold' }}>
                                                                        Cash Kilo Rate (Rs.)*
                                                                    </Typography>
                                                                </Grid>
                                                                <Grid item md={3} xs={12}>
                                                                    <InputLabel shrink id="cashKilo">
                                                                        Plucking Cash Kilo <br /> Rate
                                                                    </InputLabel>
                                                                    <TextField
                                                                        error={Boolean(touched.cashKilo && errors.cashKilo)}
                                                                        fullWidth
                                                                        helperText={touched.cashKilo && errors.cashKilo}
                                                                        name="cashKilo"
                                                                        onBlur={handleBlur}
                                                                        size='small'
                                                                        onChange={(e) => handleChange(e)}
                                                                        value={checkrollDetails.cashKilo}
                                                                        variant="outlined"
                                                                        id="cashKilo"
                                                                        type="text"
                                                                    >
                                                                    </TextField>
                                                                </Grid>
                                                                <Grid item md={3} xs={12}>
                                                                    <InputLabel shrink id="machinePluckingCashKilo">
                                                                        Machine Plucking Cash Kilo <br /> Rate
                                                                    </InputLabel>
                                                                    <TextField
                                                                        error={Boolean(touched.machinePluckingCashKilo && errors.machinePluckingCashKilo)}
                                                                        fullWidth
                                                                        helperText={touched.machinePluckingCashKilo && errors.machinePluckingCashKilo}
                                                                        name="machinePluckingCashKilo"
                                                                        onBlur={handleBlur}
                                                                        size='small'
                                                                        onChange={(e) => handleChange(e)}
                                                                        value={checkrollDetails.machinePluckingCashKilo}
                                                                        variant="outlined"
                                                                        id="machinePluckingCashKilo"
                                                                        type="text"
                                                                    >
                                                                    </TextField>
                                                                </Grid>
                                                                {/* <Grid item md={3} xs={12}>
                                                                <InputLabel shrink id="cashDayPluckingKiloRate">
                                                                    Cash Day Plucking Kilo Rate
                                                                </InputLabel>
                                                                <TextField
                                                                    error={Boolean(touched.cashDayPluckingKiloRate && errors.cashDayPluckingKiloRate)}
                                                                    fullWidth
                                                                    helperText={touched.cashDayPluckingKiloRate && errors.cashDayPluckingKiloRate}
                                                                    name="cashDayPluckingKiloRate"
                                                                    onBlur={handleBlur}
                                                                    size='small'
                                                                    onChange={(e) => handleChange(e)}
                                                                    value={checkrollDetails.cashDayPluckingKiloRate}
                                                                    variant="outlined"
                                                                    id="cashDayPluckingKiloRate"
                                                                    type="text"
                                                                >
                                                                </TextField>
                                                            </Grid> */}
                                                            </Grid>
                                                            <Grid container spacing={2}>
                                                                <Grid item md={3} xs={12} style={{ padding: '1vh', paddingTop: '5vh' }}>
                                                                    <Typography p={2} style={{ fontWeight: 'bold' }}>
                                                                        Over Kilo Rate (Rs.)*
                                                                    </Typography>
                                                                </Grid>
                                                                <Grid item md={3} xs={12}>
                                                                    <InputLabel shrink id="overKilo">
                                                                        Plucking Over Kilo<br />Rate
                                                                    </InputLabel>
                                                                    <TextField
                                                                        error={Boolean(touched.overKilo && errors.overKilo)}
                                                                        fullWidth
                                                                        helperText={touched.overKilo && errors.overKilo}
                                                                        name="overKilo"
                                                                        onBlur={handleBlur}
                                                                        size='small'
                                                                        onChange={(e) => handleChange(e)}
                                                                        value={checkrollDetails.overKilo}
                                                                        variant="outlined"
                                                                        id="overKilo"
                                                                        type="text"
                                                                    >
                                                                    </TextField>
                                                                </Grid>
                                                                <Grid item md={3} xs={12}>
                                                                    <InputLabel shrink id="machinePluckingOverKilo">
                                                                        Machine Plucking Over Kilo <br /> Rate
                                                                    </InputLabel>
                                                                    <TextField
                                                                        error={Boolean(touched.machinePluckingOverKilo && errors.machinePluckingOverKilo)}
                                                                        fullWidth
                                                                        helperText={touched.machinePluckingOverKilo && errors.machinePluckingOverKilo}
                                                                        name="machinePluckingOverKilo"
                                                                        onBlur={handleBlur}
                                                                        size='small'
                                                                        onChange={(e) => handleChange(e)}
                                                                        value={checkrollDetails.machinePluckingOverKilo}
                                                                        variant="outlined"
                                                                        id="machinePluckingOverKilo"
                                                                        type="text"
                                                                    >
                                                                    </TextField>
                                                                </Grid>
                                                                <Grid item md={3} xs={12}>
                                                                    <InputLabel shrink id="cashDayPluckingOverKiloRate">
                                                                        Cash Day Plucking Over Kilo <br /> Rate
                                                                    </InputLabel>
                                                                    <TextField
                                                                        error={Boolean(touched.cashDayPluckingOverKiloRate && errors.cashDayPluckingOverKiloRate)}
                                                                        fullWidth
                                                                        helperText={touched.cashDayPluckingOverKiloRate && errors.cashDayPluckingOverKiloRate}
                                                                        name="cashDayPluckingOverKiloRate"
                                                                        onBlur={handleBlur}
                                                                        size='small'
                                                                        onChange={(e) => handleChange(e)}
                                                                        value={checkrollDetails.cashDayPluckingOverKiloRate}
                                                                        variant="outlined"
                                                                        id="cashDayPluckingOverKiloRate"
                                                                        type="text"
                                                                    >
                                                                    </TextField>
                                                                </Grid>
                                                            </Grid>
                                                            <br></br>
                                                            <br></br>
                                                            <Grid container justify="flex-end">
                                                                <Box pr={2} >
                                                                    <Button
                                                                        color="primary"
                                                                        variant="outlined"
                                                                        type='reset'
                                                                        size='small'
                                                                        onClick={ClearChechrollConfigData}
                                                                        disabled={isUpdate || isEdit}
                                                                    >
                                                                        Clear
                                                                    </Button>
                                                                </Box>
                                                                <Box pr={2} >
                                                                    <Button
                                                                        color="primary"
                                                                        variant="contained"
                                                                        size='small'
                                                                        type="submit"
                                                                    >
                                                                        {isUpdate || isEdit ? 'Update' : 'Save'}
                                                                    </Button>
                                                                </Box>
                                                            </Grid>
                                                        </CardContent>
                                                    </Card>
                                                </Box> : null}
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