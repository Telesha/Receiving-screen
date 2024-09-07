import React, { useState, useEffect, createContext } from 'react';
import {
    Box, Card, makeStyles, Container, CardHeader, CardContent,
    Divider, MenuItem, Grid, InputLabel, TextField, Button, Typography, CardActions,
} from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import * as Yup from "yup";
import { Formik, validateYupSchema } from 'formik';
import { Tooltip, IconButton } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import { AgriGenERPEnum } from 'src/views/Common/AgriGenERPEnum/AgriGenERPEnum';

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.dark,
        minHeight: '100%',
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3)
    },
    card: {
        maxWidth: 340,
        margin: 10,
        backgroundColor: '#f5f5f5',
        boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)'
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'left'
    },
    button: {
        marginTop: 10
    },
    icon: {
        marginTop: -18,
        justifyContent: 'space-between',
    },
    dataRow: {
        display: 'flex',
        justifyContent: 'space-eveenly',
        marginLeft: 30,

    },
    label: {
        marginLeft: -10
    }


}));

const screenCode = 'CONFIGURATION';

export default function ConfigurationListing() {
    const agriGenERPEnum = new AgriGenERPEnum();
    const classes = useStyles();
    const [groups, setGroups] = useState([]);
    const [factories, setFactories] = useState([]);
    const [configurationType, setConfigurationType] = useState([]);
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });
    const [configuration, setConfiguration] = useState({
        groupID: 0,
        factoryID: 0,
        configurationTypeID: 0,
        dayOT: 0,
        nightOT: 0,
        doubleOT: 0,
        netKiloRate: 0,
        overKiloRate: 0,
        kiloValue: 0,
        holidayPay: 0
    });

    const [configurationDetails, setConfigurationDetails] = useState([]);
    const [configurationTypeID, setConfigurationTypeID] = useState(0);

    const navigate = useNavigate();

    let encrypted = "";
    const handleClick = () => {
        encrypted = btoa('0');
        navigate('/app/configuration/addedit/' + encrypted);
    }
    const handleClickEdit = (configurationDetailID) => {
        encrypted = btoa(configurationDetailID.toString());
        navigate('/app/configuration/addedit/' + encrypted);
    }


    useEffect(() => {
        trackPromise(
            getPermissions());
        trackPromise(
            getGroupsForDropdown());
    }, []);


    useEffect(() => {
        trackPromise(
            getfactoriesForDropDown()
        );
    }, [configuration.groupID]);

    useEffect(() => {
        setConfigurationDetails([])
    }, [configuration.configurationTypeID]);

    useEffect(() => {
        trackPromise(getConfigurationType());
    }, []);

    useEffect(() => {
        trackPromise(
            getConfigurationDetails()
        );
    }, []);

    async function getPermissions() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWCONFIGURATION');

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
        const result = await services.GetAllGroups();
        setGroups(result);
    }

    async function getfactoriesForDropDown() {
        const factories = await services.GetAllFactoriesByGroupID(configuration.groupID);
        setFactories(factories);
    }

    async function getConfigurationType() {
        let response = await services.GetConfigurationTypes();
        setConfigurationType(response);
    }

    async function getConfigurationDetails() {
        let response = await services.GetConfigurationDetails(configuration.factoryID, configuration.configurationTypeID);
        setConfigurationDetails(response)
        if(response.length > 0){
            setConfigurationTypeID(response[0].configurationTypeID)
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
            factoryID: 0,
            configurationTypeID: 0
        })

    }

    function handleFactoryChange(e) {
        setConfiguration({
            ...configuration,
            [e.target.name]: parseInt(e.target.value),
            configurationTypeID: 0
        })

    }

    function handleChange1(e) {
        setConfiguration({
            ...configuration,
            [e.target.name]: parseInt(e.target.value)
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
                        isEdit={true}
                        toolTiptitle={"Add Configuration"}
                    />
                </Grid>
            </Grid>
        )
    }

    return (
        <Page
            className={classes.root}
            title="Configuration"
        >
            <Container maxWidth={false}>
                <Formik
                    initialValues={{
                        groupID: configuration.groupID,
                        factoryID: configuration.factoryID,
                        configurationTypeID: configuration.configurationTypeID,

                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number()
                                .required('Group is required')
                                .min("1", 'Group is required'),
                            factoryID: Yup.number()
                                .required('Factory is required')
                                .min("1", 'Factory is required'),
                            configurationTypeID: Yup.number()
                                .required('Configuration Type is required')
                                .min("1", 'Configuration Type is required'),
                        })
                    }
                    onSubmit={() => trackPromise(getConfigurationDetails())}
                    enableReinitialize
                >
                    {({
                        errors,
                        handleBlur,
                        handleChange,
                        handleSubmit,
                        isSubmitting,
                        touched,
                        values,
                        props
                    }) => (
                        <form
                            onSubmit={handleSubmit}
                        >

                            <Box mt={0}>
                                <Card>
                                    <CardHeader
                                        title={cardTitle("Configuration")}
                                    />

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
                                                    size='small'
                                                    name="groupID"
                                                    onBlur={handleBlur}
                                                    onChange={(e) => handleGroupChange(e)}
                                                    value={configuration.groupID}
                                                    variant="outlined"
                                                    id="groupID"
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
                                                >
                                                    <MenuItem value="0">--Select Configuration Type--</MenuItem>
                                                    {generateDropDownMenu(configurationType)}
                                                </TextField>
                                            </Grid>
                                        </Grid>

                                        <Box display="flex" flexDirection="row-reverse" p={2} >
                                            <Button
                                                color="primary"
                                                type="submit"
                                                variant="contained"
                                                size='small'
                                            >
                                                Search
                                            </Button>
                                        </Box>

                                        {/* {configuration.configurationTypeID == agriGenERPEnum.ConfigurationType.OT ? */}
                                        {configurationTypeID == agriGenERPEnum.ConfigurationType.OT ?
                                            configurationDetails.map((config) => (
                                                <>
                                                    <Divider />
                                                    <Card className={classes.card}>
                                                        <CardContent>
                                                            <div className={classes.title}>
                                                                <Typography >
                                                                    Configuration Details
                                                                </Typography>
                                                                <CardActions>
                                                                    <Tooltip title="Edit" className={classes.icon}>
                                                                        <IconButton
                                                                            onClick={() => handleClickEdit(config.configurationDetailID)}>
                                                                            <EditIcon />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </CardActions>
                                                            </div>

                                                            <Grid container spacing={3} className={classes.dataRow}>
                                                                <Grid item xs={4}
                                                                >
                                                                    <Typography variant="body1" color="textSecondary" className={classes.label} >Day OT</Typography>
                                                                </Grid>
                                                                <Grid item xs={4}>
                                                                    <Typography variant="body1" color="textSecondary" >:</Typography>
                                                                </Grid>
                                                                <Grid item xs={4}>
                                                                    <Typography variant="body1" >{config.dayOT}</Typography>
                                                                </Grid>
                                                            </Grid>
                                                            <Grid container spacing={3} className={classes.dataRow}>
                                                                <Grid item xs={4}>
                                                                    <Typography variant="body1" color="textSecondary" className={classes.label}>Night OT</Typography>
                                                                </Grid>
                                                                <Grid item xs={4}>
                                                                    <Typography variant="body1" color="textSecondary">:</Typography>
                                                                </Grid>
                                                                <Grid item xs={4}>
                                                                    <Typography variant="body1">{config.nightOT}</Typography>
                                                                </Grid>
                                                            </Grid>
                                                            <Grid container spacing={3} className={classes.dataRow}>
                                                                <Grid item xs={4}>
                                                                    <Typography variant="body1" color="textSecondary" className={classes.label}>Double OT</Typography>
                                                                </Grid>
                                                                <Grid item xs={4}>
                                                                    <Typography variant="body1" color="textSecondary">:</Typography>
                                                                </Grid>
                                                                <Grid item xs={4}>
                                                                    <Typography variant="body1">{config.doubleOT}</Typography>
                                                                </Grid>
                                                            </Grid>

                                                        </CardContent>
                                                    </Card>
                                                </>
                                            )) :
                                            configurationTypeID == agriGenERPEnum.ConfigurationType.KiloRate ?
                                                configurationDetails.map((config) => (
                                                    <>
                                                        <Divider />
                                                        <Card className={classes.card}>
                                                            <CardContent>
                                                                <div className={classes.title}>
                                                                    <Typography >
                                                                        Configuration Details
                                                                    </Typography>
                                                                    <CardActions>
                                                                        <Tooltip title="Edit" className={classes.icon}>
                                                                            <IconButton
                                                                                onClick={() => handleClickEdit(config.configurationDetailID)}>
                                                                                <EditIcon />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    </CardActions>
                                                                </div>
                                                                <Grid container spacing={3} className={classes.dataRow}>
                                                                    <Grid item xs={5}>
                                                                        <Typography variant="body1" color="textSecondary" className={classes.label} >Cash Kilo Rate</Typography>
                                                                    </Grid>
                                                                    <Grid item xs={3}>
                                                                        <Typography variant="body1" color="textSecondary" >:</Typography>
                                                                    </Grid>
                                                                    <Grid item xs={4}>
                                                                        <Typography variant="body1" >{config.netKiloRate}</Typography>
                                                                    </Grid>
                                                                </Grid>
                                                                <Grid container spacing={3} className={classes.dataRow}>
                                                                    <Grid item xs={5}>
                                                                        <Typography variant="body1" color="textSecondary" className={classes.label}>Over Kilo Rate</Typography>
                                                                    </Grid>
                                                                    <Grid item xs={3}>
                                                                        <Typography variant="body1" color="textSecondary">:</Typography>
                                                                    </Grid>
                                                                    <Grid item xs={4}>
                                                                        <Typography variant="body1">{config.overKiloRate}</Typography>
                                                                    </Grid>
                                                                </Grid>


                                                            </CardContent>
                                                        </Card>
                                                    </>
                                                )) :
                                                configurationTypeID == agriGenERPEnum.ConfigurationType.NormValue ?
                                                    configurationDetails.map((config) => (
                                                        <>
                                                            <Divider />
                                                            <Card className={classes.card}>
                                                                <CardContent>
                                                                    <div className={classes.title}>
                                                                        <Typography >
                                                                            Configuration Details
                                                                        </Typography>
                                                                        <CardActions>
                                                                            <Tooltip title="Edit" className={classes.icon}>
                                                                                <IconButton
                                                                                    onClick={() => handleClickEdit(config.configurationDetailID)}>
                                                                                    <EditIcon />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                        </CardActions>
                                                                    </div>
                                                                    <Grid container spacing={3} className={classes.dataRow}>
                                                                        <Grid item xs={4}
                                                                        >
                                                                            <Typography variant="body1" color="textSecondary" className={classes.label} >Norm Value</Typography>
                                                                        </Grid>
                                                                        <Grid item xs={4}>
                                                                            <Typography variant="body1" color="textSecondary" >:</Typography>
                                                                        </Grid>
                                                                        <Grid item xs={4}>
                                                                            <Typography variant="body1" >{config.kiloValue}</Typography>
                                                                        </Grid>
                                                                    </Grid>

                                                                </CardContent>
                                                            </Card>
                                                        </>
                                                    )) :
                                                    configurationTypeID == agriGenERPEnum.ConfigurationType.HolidayPay ?
                                                        configurationDetails.map((config) => (
                                                            <>
                                                                <Divider />
                                                                <Card className={classes.card}>
                                                                    <CardContent>
                                                                        <div className={classes.title}>
                                                                            <Typography >
                                                                                Configuration Details
                                                                            </Typography>
                                                                            <CardActions>
                                                                                <Tooltip title="Edit" className={classes.icon}>
                                                                                    <IconButton
                                                                                        onClick={() => handleClickEdit(config.configurationDetailID)}>
                                                                                        <EditIcon />
                                                                                    </IconButton>
                                                                                </Tooltip>
                                                                            </CardActions>
                                                                        </div>
                                                                        <Grid container spacing={3} className={classes.dataRow}>
                                                                            <Grid item xs={4}
                                                                            >
                                                                                <Typography variant="body1" color="textSecondary" className={classes.label} >Holiday Pay</Typography>
                                                                            </Grid>
                                                                            <Grid item xs={4}>
                                                                                <Typography variant="body1" color="textSecondary" >:</Typography>
                                                                            </Grid>
                                                                            <Grid item xs={4}>
                                                                                <Typography variant="body1" >{config.holidayPay}</Typography>
                                                                            </Grid>
                                                                        </Grid>


                                                                    </CardContent>
                                                                </Card>
                                                            </>
                                                        )) : configurationTypeID == agriGenERPEnum.ConfigurationType.Other ?
                                                            configurationDetails.map((config) => (
                                                                <>
                                                                    <Divider />
                                                                    <Card className={classes.card}>
                                                                        <CardContent>
                                                                            <div className={classes.title}>
                                                                                <Typography >
                                                                                    Configuration Details
                                                                                </Typography>
                                                                                <CardActions>
                                                                                    <Tooltip title="Edit" className={classes.icon}>
                                                                                        <IconButton
                                                                                            onClick={() => handleClickEdit(config.configurationDetailID)}>
                                                                                            <EditIcon />
                                                                                        </IconButton>
                                                                                    </Tooltip>
                                                                                </CardActions>
                                                                            </div>
                                                                            <Grid container spacing={3} className={classes.dataRow}>
                                                                                <Grid item xs={4}
                                                                                >
                                                                                    <Typography variant="body1" color="textSecondary" className={classes.label} >Other</Typography>
                                                                                </Grid>
                                                                                <Grid item xs={4}>
                                                                                    <Typography variant="body1" color="textSecondary" >:</Typography>
                                                                                </Grid>
                                                                                <Grid item xs={4}>
                                                                                    <Typography variant="body1" >{config.other}</Typography>
                                                                                </Grid>
                                                                            </Grid>


                                                                        </CardContent>
                                                                    </Card>
                                                                </>
                                                            )) :
                                                            null
                                        }
                                    </CardContent>
                                </Card>
                            </Box>
                        </form>
                    )}
                </Formik>
            </Container >
        </Page >
    );
};

