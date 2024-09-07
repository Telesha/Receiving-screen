import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, CardHeader, MenuItem
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from "yup";
import PageHeader from 'src/views/Common/PageHeader';
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
    }

}));

const screenCode = 'CONFIGURATION';

export default function ConfigurationAddEdit(props) {
    const agriGenERPEnum = new AgriGenERPEnum();
    const [title, setTitle] = useState("Add Configuration")
    const [isUpdate, setIsUpdate] = useState(false);
    const [isDisableButton, setIsDisableButton] = useState(false);
    const [enableOT, setEnableOT] = useState(false);
    const [enableKiloRate, setEnableKiloRate] = useState(false);
    const [enableNormValue, setEnableNormValue] = useState(false);
    const [enableHolidayPay, setEnableHolidayPay] = useState(false);
    const [enableOther, setEnableOther] = useState(false);
    const classes = useStyles();
    const [groups, setGroups] = useState([]);
    const [factories, setFactories] = useState([]);
    const [configurationType, setConfigurationType] = useState([]);
    const [configuration, setConfiguration] = useState({
        groupID: "0",
        factoryID: "0",
        configurationTypeID: "0",
        dayOT: 0,
        nightOT: 0,
        doubleOT: 0,
        netKiloRate: 0,
        overKiloRate: 0,
        kiloValue: 0,
        holidayPay: 0,
        other: 0
    });

    const navigate = useNavigate();
    const handleClick = () => {
        navigate('/app/configuration/listing');
    }

    const alert = useAlert();
    const { configurationDetailID } = useParams();
    let decrypted = 0;

    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });

    useEffect(() => {
        getPermissions();
        getGroupsForDropdown();
    }, []);

    useEffect(() => {
        trackPromise(
            getfactoriesForDropDown()
        );
    }, [configuration.groupID]);

    useEffect(() => {
        trackPromise(
            getConfigurationType()
        );
    }, []);

    useEffect(() => {
        decrypted = atob(configurationDetailID.toString());
        if (decrypted != 0) {
            trackPromise(
                getConfigurationDetailsForUpdate(decrypted)
            )
        }
    }, []);

    async function getPermissions() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITCONFIGURATION');
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


        setConfiguration({
            ...configuration,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })

    }

    async function getGroupsForDropdown() {
        const groups = await services.GetAllGroups();
        setGroups(groups);
    }

    async function getfactoriesForDropDown() {
        const factories = await services.GetAllFactoriesByGroupID(configuration.groupID);
        setFactories(factories);
    }

    async function getConfigurationType() {
        let response = await services.GetConfigurationTypes();
        setConfigurationType(response);
    }

    async function getConfigurationDetailsForUpdate(configurationDetailID) {
        let response = await services.GetConfigurationDetailsForUpdate(configurationDetailID);
        let data = {
            configurationDetailID: response.configurationDetailID,
            groupID: response.groupID,
            factoryID: response.factoryID,
            configurationTypeID: response.configurationTypeID,
            dayOT: parseFloat(response.dayOT),
            nightOT: parseFloat(response.nightOT),
            doubleOT: parseFloat(response.doubleOT),
            netKiloRate: parseFloat(response.netKiloRate),
            overKiloRate: parseFloat(response.overKiloRate),
            kiloValue: parseFloat(response.kiloValue),
            holidayPay: parseFloat(response.holidayPay),
            other: parseFloat(response.other)
        };
        setTitle("Edit Configuration Type");
        setConfiguration(data);
        setIsUpdate(true);
    }


    async function saveConfigurationDetails(values) {

        if (isUpdate == true) {
            let model = {
                configurationDetailID: atob(configurationDetailID.toString()),
                configurationTypeID: values.configurationTypeID,
                dayOT: values.dayOT === 0 ? 0 : values.dayOT,
                nightOT: values.nightOT === 0 ? 0 : values.nightOT,
                doubleOT: values.doubleOT === 0 ? 0 : values.doubleOT,
                netKiloRate: values.netKiloRate === 0 ? 0 : values.netKiloRate,
                overKiloRate: values.overKiloRate === 0 ? 0 : values.overKiloRate,
                kiloValue: values.kiloValue === 0 ? 0 : values.kiloValue,
                holidayPay: values.holidayPay === 0 ? 0 : values.holidayPay,
                other: values.other === 0 ? 0 : values.other,
            }
            let response = await services.UpdateConfigurationDetails(model);
            if (response.statusCode == "Success") {
                alert.success(response.message);
                setIsDisableButton(true);
                navigate('/app/configuration/listing');
            }
            else {
                alert.error(response.message);
            }
        } else {

            let response = await services.SaveConfigurationDetails(values);
            if (response.statusCode == "Success") {
                alert.success(response.message);
                setIsDisableButton(true);
                navigate('/app/configuration/listing');
            }
            else {
                alert.error(response.message);
            }
        }
    }

    function generateDropDownMenu(data) {
        let items = []
        if (data != null) {
            for (const [key, value] of Object.entries(data)) {
                items.push(<MenuItem key={key} value={key}>{value}</MenuItem>)
            }
        }
        return items
    }

    function handleGroupChange(e) {
        setConfiguration({
            ...configuration,
            [e.target.name]: parseInt(e.target.value),
            factoryID: "0",
            configurationTypeID: "0",
            dayOT: 0,
            nightOT: 0,
            doubleOT: 0,
            netKiloRate: 0,
            overKiloRate: 0,
            kiloValue: 0,
            holidayPay: 0,
            other: 0
        })

    }

    function handleFactoryChange(e) {
        setConfiguration({
            ...configuration,
            [e.target.name]: parseInt(e.target.value),
            configurationTypeID: "0",
            dayOT: 0,
            nightOT: 0,
            doubleOT: 0,
            netKiloRate: 0,
            overKiloRate: 0,
            kiloValue: 0,
            holidayPay: 0,
            other: 0
        })

    }

    function handleChange1(e) {
        setConfiguration({
            ...configuration,
            [e.target.name]: parseInt(e.target.value)
        })
        setIsDisableButton(true);
    }


    function handleConfigType(e) {

        setConfiguration({
            ...configuration,
            [e.target.name]: parseFloat(e.target.value)
        })
        setIsDisableButton(false);

        if (configuration.configurationTypeID == 1) {
            setEnableOT(true)
        }
        else
            if (configuration.configurationTypeID == 2) {
                setEnableKiloRate(true)
            }
            else
                if (configuration.configurationTypeID == 3) {
                    setEnableNormValue(true)
                }
                else
                    if (configuration.configurationTypeID == 4) {
                        setEnableHolidayPay(true)
                    }

                    else
                        if (configuration.configurationTypeID == 5) {
                            setEnableOther(true)
                        }

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
                        isEdit={false}
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
                            groupID: configuration.groupID,
                            factoryID: configuration.factoryID,
                            configurationTypeID: configuration.configurationTypeID,
                            dayOT: configuration.dayOT,
                            nightOT: configuration.nightOT,
                            doubleOT: configuration.doubleOT,
                            netKiloRate: configuration.netKiloRate,
                            overKiloRate: configuration.overKiloRate,
                            kiloValue: configuration.kiloValue,
                            holidayPay: configuration.holidayPay,
                            other: configuration.other


                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                                factoryID: Yup.number().required('Estate is required').min("1", 'Estate is required'),
                                configurationTypeID: Yup.number().min("1", 'Configuration Type is required').required('Configuration Type is required'),
                                dayOT: Yup.number()
                                    .test('noDecimals', 'Decimal values are not allowed', (val) => {
                                        if (typeof val === 'number'){
                                            return Number.isInteger(val);
                                        }
                                        return true;}) 
                                    .nullable(true),
                                nightOT: Yup.number()
                                    .test('noDecimals', 'Decimal values are not allowed', (val) => {
                                        if (typeof val === 'number'){
                                            return Number.isInteger(val);
                                        }
                                        return true;}) 
                                    .nullable(true),
                                doubleOT: Yup.number()
                                    .test('noDecimals', 'Decimal values are not allowed', (val) => {
                                        if (typeof val === 'number'){
                                            return Number.isInteger(val);
                                        }
                                        return true;}) 
                                    .nullable(true),
                                netKiloRate: enableKiloRate == true ? Yup.number()
                                    .required('Net Kilo Rate is required')
                                    .test('netKiloRate', 'Please enter valid rate', (val) => val > 0)
                                    .typeError('Net Kilo Rate is required')
                                    .test('nonZero', 'Initial value cannot be 0', (val) => val !== 0)
                                    .test('noDecimals', 'Decimal values are not allowed', (val) => {
                                        if (typeof val === 'number'){
                                            return Number.isInteger(val);
                                        }
                                        return true;})
                                : Yup.number().nullable(true),
                                overKiloRate: enableKiloRate == true ? Yup.number()
                                    .required('Over Kilo Rate is required')
                                    .test('overKiloRate', 'Please enter valid rate', (val) => val > 0)
                                    .typeError('Over Kilo Rate is required')
                                    .test('nonZero', 'Initial value cannot be 0', (val) => val !== 0)
                                    .test('noDecimals', 'Decimal values are not allowed', (val) => {
                                        if (typeof val === 'number'){
                                            return Number.isInteger(val);
                                        }
                                        return true;}) 
                                : Yup.number().nullable(true),
                                kiloValue: enableNormValue == true ? Yup.number()
                                    .required('Norm Value is required')
                                    .test('kiloValue', 'Please enter valid rate', (val) => val > 0)
                                    .typeError('Norm Value is required')
                                    .test('nonZero', 'Initial value cannot be 0', (val) => val !== 0)
                                    .test('noDecimals', 'Decimal values are not allowed', (val) => {
                                        if (typeof val === 'number'){
                                            return Number.isInteger(val);
                                        }
                                        return true;}) 
                                : Yup.number().nullable(true),
                                holidayPay: enableHolidayPay == true ? Yup.number()
                                    .required('Holiday Pay is required')
                                    .test('holidayPay', 'Please enter valid rate', (val) => val > 0)
                                    .typeError('Holiday Pay is required')
                                    .test('nonZero', 'Initial value cannot be 0', (val) => val !== 0)
                                    .test('noDecimals', 'Decimal values are not allowed', (val) => {
                                        if (typeof val === 'number'){
                                            return Number.isInteger(val);
                                        }
                                        return true;}) 
                                : Yup.number().nullable(true),
                                other: enableOther == true ? Yup.number()
                                    .required('Rate is required')
                                    .test('other', 'Please enter valid rate', (val) => val > 0)
                                    .typeError('Rate is required')
                                    .test('nonZero', 'Initial value cannot be 0', (val) => val !== 0)
                                    .test('noDecimals', 'Decimal values are not allowed', (val) => {
                                        if (typeof val === 'number'){
                                            return Number.isInteger(val);
                                        }
                                        return true;}) 
                                : Yup.number().nullable(true),
                            })
                        }
                        onSubmit={(event) => trackPromise(saveConfigurationDetails(event))}
                        enableReinitialize
                    >
                        {({
                            errors,
                            handleBlur,
                            handleSubmit,
                            isSubmitting,
                            touched,

                        }) => (
                            <form
                                onSubmit={handleSubmit}
                            >
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
                                                            Group *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.groupID && errors.groupID)}
                                                            fullWidth
                                                            helperText={touched.groupID && errors.groupID}
                                                            name="groupID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleGroupChange(e)}
                                                            value={configuration.groupID}
                                                            variant="outlined"
                                                            size='small'
                                                            id="groupID"
                                                            InputProps={{
                                                                readOnly: isUpdate || !permissionList.isGroupFilterEnabled ? true : false
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Group--</MenuItem>
                                                            {generateDropDownMenu(groups)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="factoryID">
                                                            Estate *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.factoryID && errors.factoryID)}
                                                            fullWidth
                                                            helperText={touched.factoryID && errors.factoryID}
                                                            size='small'
                                                            name="factoryID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleFactoryChange(e)}
                                                            value={configuration.factoryID}
                                                            variant="outlined"
                                                            id="factoryID"
                                                            InputProps={{
                                                                readOnly: isUpdate || !permissionList.isFactoryFilterEnabled ? true : false,
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Estate--</MenuItem>
                                                            {generateDropDownMenu(factories)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="configurationTypeID">
                                                            Configuration Type *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.configurationTypeID && errors.configurationTypeID)}
                                                            fullWidth
                                                            helperText={touched.configurationTypeID && errors.configurationTypeID}
                                                            size='small'
                                                            name="configurationTypeID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange1(e)}
                                                            value={configuration.configurationTypeID}
                                                            variant="outlined"
                                                            id="configurationTypeID"
                                                            InputProps={{
                                                                readOnly: isUpdate ? true : false,
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Configuration Type--</MenuItem>
                                                            {generateDropDownMenu(configurationType)}
                                                        </TextField>
                                                    </Grid>
                                                </Grid>
                                                {configuration.configurationTypeID == agriGenERPEnum.ConfigurationType.OT ? (
                                                    <Grid container spacing={3}>
                                                        <Grid item md={4} xs={12}>
                                                            <InputLabel shrink id="dayOT">
                                                                Day OT
                                                            </InputLabel>
                                                            <TextField
                                                                fullWidth
                                                                error={Boolean(touched.dayOT && errors.dayOT)}
                                                                helperText={touched.dayOT && errors.dayOT}
                                                                type="number"
                                                                name="dayOT"
                                                                id="dayOT"
                                                                onChange={(e) => handleConfigType(e)}
                                                                value={configuration.dayOT}
                                                                size='small'
                                                                variant="outlined"
                                                            />
                                                        </Grid>

                                                        <Grid item md={4} xs={12}>
                                                            <InputLabel shrink id="nightOT">
                                                                Night OT
                                                            </InputLabel>
                                                            <TextField
                                                                fullWidth
                                                                error={Boolean(touched.nightOT && errors.nightOT)}
                                                                helperText={touched.nightOT && errors.nightOT}
                                                                type="number"
                                                                name="nightOT"
                                                                id="nightOT"
                                                                onChange={(e) => handleConfigType(e)}
                                                                value={configuration.nightOT}
                                                                size='small'
                                                                variant="outlined"
                                                            />
                                                        </Grid>

                                                        <Grid item md={4} xs={12}>
                                                            <InputLabel shrink id="doubleOT">
                                                                Double OT
                                                            </InputLabel>
                                                            <TextField
                                                                fullWidth
                                                                error={Boolean(touched.doubleOT && errors.doubleOT)}
                                                                helperText={touched.doubleOT && errors.doubleOT}
                                                                type="number"
                                                                name="doubleOT"
                                                                id="doubleOT"
                                                                onChange={(e) => handleConfigType(e)}
                                                                value={configuration.doubleOT}
                                                                size='small'
                                                                variant="outlined"
                                                            />
                                                        </Grid>
                                                    </Grid>
                                                )
                                                    : configuration.configurationTypeID == agriGenERPEnum.ConfigurationType.KiloRate ? (
                                                        <Grid container spacing={3}>
                                                            <Grid item md={4} xs={12}>
                                                                <InputLabel shrink id="netKiloRate">
                                                                    Cash Kilo Rate
                                                                </InputLabel>
                                                                <TextField
                                                                    fullWidth
                                                                    error={Boolean(touched.netKiloRate && errors.netKiloRate)}
                                                                    helperText={touched.netKiloRate && errors.netKiloRate}
                                                                    type="number"
                                                                    name="netKiloRate"
                                                                    id="netKiloRate"
                                                                    onChange={(e) => handleConfigType(e)}
                                                                    value={configuration.netKiloRate}
                                                                    size='small'
                                                                    variant="outlined"

                                                                />
                                                            </Grid>

                                                            <Grid item md={4} xs={12}>
                                                                <InputLabel shrink id="overKiloRate">
                                                                    Over Kilo Rate
                                                                </InputLabel>
                                                                <TextField
                                                                    fullWidth
                                                                    error={Boolean(touched.overKiloRate && errors.overKiloRate)}
                                                                    helperText={touched.overKiloRate && errors.overKiloRate}
                                                                    type="number"
                                                                    name="overKiloRate"
                                                                    id="overKiloRate"
                                                                    onChange={(e) => handleConfigType(e)}
                                                                    value={configuration.overKiloRate}
                                                                    size='small'
                                                                    variant="outlined"

                                                                />
                                                            </Grid>
                                                        </Grid>)
                                                        :
                                                        configuration.configurationTypeID == agriGenERPEnum.ConfigurationType.NormValue ? (
                                                            <Grid container spacing={3}>
                                                                <Grid item md={4} xs={12}>
                                                                    <InputLabel shrink id="kiloValue">
                                                                        Norm Value
                                                                    </InputLabel>
                                                                    <TextField
                                                                        fullWidth
                                                                        error={Boolean(touched.kiloValue && errors.kiloValue)}
                                                                        helperText={touched.kiloValue && errors.kiloValue}
                                                                        type="number"
                                                                        name="kiloValue"
                                                                        id="kiloValue"
                                                                        onChange={(e) => handleConfigType(e)}
                                                                        value={configuration.kiloValue}
                                                                        size='small'
                                                                        variant="outlined"

                                                                    />
                                                                </Grid>
                                                            </Grid>
                                                        ) :
                                                            configuration.configurationTypeID == agriGenERPEnum.ConfigurationType.HolidayPay ? (
                                                                <Grid container spacing={3}>
                                                                    <Grid item md={4} xs={12}>
                                                                        <InputLabel shrink id="holidayPay">
                                                                            Holiday Pay
                                                                        </InputLabel>
                                                                        <TextField
                                                                            fullWidth
                                                                            error={Boolean(touched.holidayPay && errors.holidayPay)}
                                                                            helperText={touched.holidayPay && errors.holidayPay}
                                                                            type="number"
                                                                            name="holidayPay"
                                                                            id="holidayPay"
                                                                            onChange={(e) => handleConfigType(e)}
                                                                            value={configuration.holidayPay}
                                                                            size='small'
                                                                            variant="outlined"
                                                                        />
                                                                    </Grid>
                                                                </Grid>
                                                            )
                                                                : configuration.configurationTypeID == agriGenERPEnum.ConfigurationType.Other ? (
                                                                    <Grid container spacing={3}>
                                                                        <Grid item md={4} xs={12}>
                                                                            <InputLabel shrink id="other">
                                                                                Other
                                                                            </InputLabel>
                                                                            <TextField
                                                                                fullWidth
                                                                                error={Boolean(touched.other && errors.other)}
                                                                                helperText={touched.other && errors.other}
                                                                                type="number"
                                                                                name="other"
                                                                                id="other"
                                                                                onChange={(e) => handleConfigType(e)}
                                                                                value={configuration.other}
                                                                                size='small'
                                                                                variant="outlined"

                                                                            />
                                                                        </Grid>
                                                                    </Grid>
                                                                )
                                                                    : null}

                                            </CardContent>
                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                <Button
                                                    color="primary"
                                                    disabled={isSubmitting || isDisableButton}
                                                    type="submit"
                                                    variant="contained"
                                                    size='small'
                                                >
                                                    {isUpdate == true ? "UPDATE" : "ADD"}
                                                </Button>
                                            </Box>
                                        </PerfectScrollbar>
                                    </Card>
                                </Box>
                            </form>
                        )}
                    </Formik>
                </Container>
            </Page>
        </Fragment >
    );
};
