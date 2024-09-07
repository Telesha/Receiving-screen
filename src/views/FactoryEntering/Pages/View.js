import React, { useState, useEffect, Fragment, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Box,
    Card,
    Button,
    makeStyles,
    Container,
    Divider,
    CardContent,
    CardHeader,
    Grid,
    TextField,
    MenuItem,
    InputLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Switch
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import * as Yup from "yup";
import { LoadingComponent } from 'src/utils/newLoader';
import { Form, Formik, validateYupSchema } from 'formik';
import PageHeader from 'src/views/Common/PageHeader';

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
    colorCancel: {
        backgroundColor: "red",
    },
    colorRecordAndNew: {
        backgroundColor: "#FFBE00"
    },
    colorRecord: {
        backgroundColor: "green",
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 200,
    },
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
}));

const screenCode = 'FACTORYENTERING';

export default function FactoryEnteringAddEdit(props) {
    const [title, setTitle] = useState("Add Green Leaf Receiving")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [employees, setEmployees] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [routes, setRoutes] = useState();
    const [isView, setIsView] = useState(false);
    const [factoryEnteringInput, setFactoryEnteringInput] = useState({
        groupID: '0',
        factoryID: '0',
        routeID: '0',
        date: '',
        officerID: 0,
        helperID: 0,
        driverID: 0,
        vehicleNumber: 0,
        leafTransporterID: '',
        time: (new Date(Date.now()).getHours() + ':' + new Date(Date.now()).getMinutes()).toString(),
        rainfallInmm: '',
        courceLeaf: '',
        boiledLeaf: '',
        leafCondition: '',
        fieldGrossWeight: '',
        factoryGrossWeight: '',
        lossOrExcess: '',
        fieldBag: '',
        factoryBag: '',
        comment: '',
        factoryWater: '',
        fieldWater: '',
        fieldCouseLeaf: '',
        factoryCouseLeaf: '',
        fieldNetWeight: '',
        factoryNetWeight: '',
        isTemporyHelper: false,
        isTemporyDriver: false,
        isTemporyVehicleNo: false,
        temporyHelper: '',
        temporyDriver: '',
        temporyVehicleNo: '',
        isActive: true
    })
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });
    const { greenLeafReceivingID } = useParams();
    let decrypted = 0;
    const navigate = useNavigate();
    const handleClick = () => {
        navigate('/app/factoryEntering/listing')
    }
    const [DisableUserFields, setDisableUserFields] = useState(true);

    useEffect(() => {
        trackPromise(getPermission());
        trackPromise(getGroupsForDropdown())

    }, []);
    useEffect(() => {
        trackPromise(getFactoriesForDropDown());
    }, [factoryEnteringInput.groupID]);

    useEffect(() => {
        trackPromise(
            getRoutesByFactoryID()
        );
        trackPromise(
            getEmployeesForDropdown()
        );
        trackPromise(
            getVehiclesForDropdown()
        )
    }, [factoryEnteringInput.factoryID]);

    useEffect(() => {
        decrypted = atob(greenLeafReceivingID.toString());
        if (decrypted != 0) {
            trackPromise(
                getGreenLeafDetails(decrypted),
            )
        }

    }, []);


    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITFACTORYENTERING');

        if (isAuthorized === undefined) {
            navigate('/404');
        }
        var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
        var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');

        setPermissions({
            ...permissionList,
            isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
            isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined
        });

        setFactoryEnteringInput({
            ...factoryEnteringInput,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }
    async function getFactoriesForDropDown() {
        const factory = await services.getFactoryByGroupID(factoryEnteringInput.groupID);
        setFactories(factory);
    }

    async function getRoutesByFactoryID() {
        const route = await services.getRoutesForDropDown(factoryEnteringInput.factoryID);
        setRoutes(route);
    }

    async function getEmployeesForDropdown() {
        const employees = await services.getEmployeesForDropdown(factoryEnteringInput.groupID, factoryEnteringInput.factoryID);
        setEmployees(employees);
    }

    async function getVehiclesForDropdown() {
        const vehicles = await services.GetVehicleList(factoryEnteringInput.groupID, factoryEnteringInput.factoryID);
        setVehicles(vehicles);
    }

    async function getGreenLeafDetails(greenLeafReceivingID) {
        let response = await services.GetGreenLeafReceivingDetailsByID(greenLeafReceivingID);
        let data = {
            greenLeafReceivingID: response.greenLeafReceivingID,
            groupID: response.groupID,
            factoryID: response.factoryID,
            routeID: response.routeID,
            date: response.leafReceivedDate.split('T')[0],
            time: response.factoryInTime,
            officerID: response.officerID,
            helperID: response.helperID,
            temporyHelper: response.temporyHelper,
            driverID: response.driverID,
            temporyDriver: response.temporyDriver,
            vehicleNumber: response.vehicleNumber,
            temporyVehicleNo: response.temporyVehicleNumber,
            leafTransporterID: response.leafTransporterID,
            rainfallInmm: response.rainfallIn,
            courceLeaf: response.courseLeafAmount,
            leafCondition: response.leafCondition,
            boiledLeaf: response.boiledLeaf,
            fieldGrossWeight: response.fieldGrossWeight,
            fieldBag: response.fieldBagAmount,
            fieldWater: response.fieldWater,
            fieldCouseLeaf: response.fieldCouseLeaf,
            fieldNetWeight: response.fieldNetWeight,
            factoryGrossWeight: response.factoryGrossWeight,
            factoryBag: response.factoryBagAmount,
            factoryWater: response.factoryWaterAmount,
            factoryCouseLeaf: response.factoryCouseLeaf,
            factoryNetWeight: response.factoryNetWeight,
            comment: response.comment,
            lossOrExcess: response.lossOrExcess,
            isTemporyHelper: response.isTemporyHelper,
            isTemporyDriver: response.isTemporyDriver,
            isTemporyVehicleNo: response.isTemporyVehicleNumber,
        };

        setTitle("View Green Leaf Receiving");
        setFactoryEnteringInput(data);
        setIsView(true);
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
                    />
                </Grid>
            </Grid>
        )
    }

    function handleChange(e) {
        const target = e.target;
        const value = target.value
        setFactoryEnteringInput({
            ...factoryEnteringInput,
            [e.target.name]: value
        });
    }

    function HelperEnabledHandleChange(e) {

        const target = e.target;
        const value = target.name === 'isTemporyHelper' ? target.checked : target.value

        setFactoryEnteringInput({
            ...factoryEnteringInput,
            [e.target.name]: value
        });
    };

    function DriverEnabledHandleChange() {
        setFactoryEnteringInput({
            ...factoryEnteringInput,
            isTemporyDriver: !factoryEnteringInput.isTemporyDriver
        });
    };

    function VehicleNoEnabledHandleChange() {
        setFactoryEnteringInput({
            ...factoryEnteringInput,
            isTemporyVehicleNo: !factoryEnteringInput.isTemporyVehicleNo
        });
    };

    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: factoryEnteringInput.groupID,
                            factoryID: factoryEnteringInput.factoryID,
                            routeID: factoryEnteringInput.routeID,
                            time: factoryEnteringInput.time,
                            date: factoryEnteringInput.date,
                            officerID: factoryEnteringInput.officerID,
                            helperID: factoryEnteringInput.helperID,
                            driverID: factoryEnteringInput.driverID,
                            vehicleNumber: factoryEnteringInput.vehicleNumber,
                            leafTransporterID: factoryEnteringInput.leafTransporterID,
                            rainfallInmm: factoryEnteringInput.rainfallInmm,
                            courceLeaf: factoryEnteringInput.courceLeaf,
                            boiledLeaf: factoryEnteringInput.boiledLeaf,
                            leafCondition: factoryEnteringInput.leafCondition,
                            fieldGrossWeight: factoryEnteringInput.fieldGrossWeight,
                            factoryGrossWeight: factoryEnteringInput.factoryGrossWeight,
                            lossOrExcess: factoryEnteringInput.lossOrExcess,
                            fieldBag: factoryEnteringInput.fieldBag,
                            factoryBag: factoryEnteringInput.factoryBag,
                            comment: factoryEnteringInput.comment,
                            factoryWater: factoryEnteringInput.factoryWater,
                            fieldWater: factoryEnteringInput.fieldWater,
                            fieldCouseLeaf: factoryEnteringInput.fieldCouseLeaf,
                            factoryCouseLeaf: factoryEnteringInput.factoryCouseLeaf,
                            fieldNetWeight: factoryEnteringInput.fieldNetWeight,
                            factoryNetWeight: factoryEnteringInput.factoryNetWeight,
                            temporyHelper: factoryEnteringInput.temporyHelper,
                            temporyDriver: factoryEnteringInput.temporyDriver,
                            temporyVehicleNo: factoryEnteringInput.temporyVehicleNo,
                            isTemporyHelper: factoryEnteringInput.isTemporyHelper,
                            isTemporyDriver: factoryEnteringInput.isTemporyDriver,
                            isTemporyVehicleNo: factoryEnteringInput.isTemporyVehicleNo
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
                                routeID: Yup.number().required('RouteID is required').min("1", 'RouteID is required')
                            })
                        }
                        enableReinitialize
                    >
                        {({
                            errors,
                            handleBlur,
                            handleSubmit,
                            touched,
                            values

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
                                                <Grid container spacing={3}>
                                                    <Grid item md={3} xs={8}>
                                                        <InputLabel shrink id="groupID">
                                                            Group *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.groupID && errors.groupID)}
                                                            fullWidth
                                                            helperText={touched.groupID && errors.groupID}
                                                            name="groupID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={factoryEnteringInput.groupID}
                                                            variant="outlined"
                                                            id="groupID"
                                                            disabled={DisableUserFields}
                                                            InputProps={{
                                                                readOnly: isView || !permissionList.isGroupFilterEnabled ? true : false
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Group--</MenuItem>
                                                            {generateDropDownMenu(groups)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={3} xs={8}>
                                                        <InputLabel shrink id="factoryID">
                                                            Factory *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.factoryID && errors.factoryID)}
                                                            fullWidth
                                                            helperText={touched.factoryID && errors.factoryID}
                                                            name="factoryID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={factoryEnteringInput.factoryID}
                                                            variant="outlined"
                                                            id="factoryID"
                                                            disabled={DisableUserFields}
                                                            InputProps={{
                                                                readOnly: isView || !permissionList.isFactoryFilterEnabled ? true : false
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Factory--</MenuItem>
                                                            {generateDropDownMenu(factories)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={3} xs={8}>
                                                        <InputLabel shrink id="routeID">
                                                            Route *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.routeID && errors.routeID)}
                                                            fullWidth
                                                            helperText={touched.routeID && errors.routeID}
                                                            name="routeID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={factoryEnteringInput.routeID}
                                                            variant="outlined"
                                                            id="routeID"
                                                            disabled={DisableUserFields}
                                                            InputProps={{
                                                                readOnly: isView ? true : false
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Routes--</MenuItem>
                                                            {generateDropDownMenu(routes)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={3} xs={8}>
                                                        <InputLabel shrink id="date">
                                                            Date *
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.date && errors.date)}
                                                            helperText={touched.date && errors.date}
                                                            fullWidth
                                                            name="date"
                                                            type="date"
                                                            onChange={(e) => handleChange(e)}
                                                            value={factoryEnteringInput.date}
                                                            variant="outlined"
                                                            id="date"
                                                            disabled={DisableUserFields}
                                                            InputProps={{
                                                                readOnly: isView ? true : false
                                                            }}
                                                        />
                                                    </Grid>
                                                </Grid>
                                                <Card style={{ padding: 30, marginTop: 20, backgroundColor: "#f5f5f5" }}>
                                                    <CardHeader style={{ marginLeft: '-1rem', marginTop: '-1rem', marginBottom: '2rem' }} titleTypographyProps={{ variant: 'h6' }}
                                                        title="General Information"
                                                    />
                                                    <Grid container spacing={3}>
                                                        <Grid item md={4} xs={12}>
                                                            <InputLabel shrink id="time">
                                                                Factory In Time
                                                            </InputLabel>

                                                            <TextField
                                                                id="time"
                                                                type="time"
                                                                name="time"
                                                                className={classes.textField}
                                                                disabled={DisableUserFields}
                                                                InputLabelProps={{
                                                                    shrink: true,
                                                                }}
                                                                inputProps={{
                                                                    step: 300, // 5 min
                                                                }}
                                                                onChange={(e) => handleChange(e)}
                                                                value={factoryEnteringInput.time}
                                                            />

                                                        </Grid>
                                                    </Grid>
                                                    <Grid container spacing={3}>
                                                        <Grid item md={4} xs={12} ></Grid>
                                                        <Grid item md={4} xs={12}>
                                                            <InputLabel shrink id="isTemporyHelper">
                                                                Is Tempory
                                                            </InputLabel>
                                                            <Switch
                                                                checked={values.isTemporyHelper}
                                                                disabled={DisableUserFields}
                                                                onChange={(e) => HelperEnabledHandleChange(e)}
                                                                name="isTemporyHelper"
                                                                value={factoryEnteringInput.isTemporyHelper}
                                                            />
                                                        </Grid>
                                                        <Grid item md={4} xs={12} >
                                                            <InputLabel shrink id="isTemporyDriver">
                                                                Is Tempory
                                                            </InputLabel>
                                                            <Switch
                                                                checked={values.isTemporyDriver}
                                                                disabled={DisableUserFields}
                                                                onChange={DriverEnabledHandleChange}
                                                                name="isTemporyDriver"
                                                                value={factoryEnteringInput.isTemporyDriver}
                                                            />
                                                        </Grid>

                                                    </Grid>

                                                    <Grid container spacing={3}>
                                                        <Grid item md={4} xs={12} >
                                                            <InputLabel shrink id="officerID">
                                                                Officer
                                                            </InputLabel>
                                                            <TextField select
                                                                error={Boolean(touched.officerID && errors.officerID)}
                                                                fullWidth
                                                                helperText={touched.officerID && errors.officerID}
                                                                disabled={DisableUserFields}
                                                                name="officerID"
                                                                onBlur={handleBlur}
                                                                onChange={(e) => handleChange(e)}
                                                                value={factoryEnteringInput.officerID}
                                                                variant="outlined"
                                                                id="officerID"

                                                            >
                                                                <MenuItem value="0">--Select Officer--</MenuItem>
                                                                {generateDropDownMenu(employees)}
                                                            </TextField>
                                                        </Grid>

                                                        <Grid item md={4} xs={12}>
                                                            <InputLabel shrink id="helperID">

                                                                Helper
                                                            </InputLabel>
                                                            {factoryEnteringInput.isTemporyHelper === false ?
                                                                <TextField select
                                                                    error={Boolean(touched.helperID && errors.helperID)}
                                                                    fullWidth
                                                                    helperText={touched.helperID && errors.helperID}
                                                                    disabled={DisableUserFields}
                                                                    name="helperID"
                                                                    onBlur={handleBlur}
                                                                    onChange={(e) => handleChange(e)}
                                                                    value={factoryEnteringInput.helperID}
                                                                    variant="outlined"
                                                                    id="helperID"

                                                                >
                                                                    <MenuItem value="0">--Select Helper--</MenuItem>
                                                                    {generateDropDownMenu(employees)}
                                                                </TextField> : <TextField
                                                                    fullWidth
                                                                    name="temporyHelper"
                                                                    onBlur={handleBlur}
                                                                    disabled={DisableUserFields}
                                                                    onChange={(e) => handleChange(e)}
                                                                    value={factoryEnteringInput.temporyHelper}
                                                                    variant="outlined"
                                                                    id="temporyHelper"
                                                                >
                                                                </TextField>}
                                                        </Grid>
                                                        <Grid item md={4} xs={12}>
                                                            <InputLabel shrink id="driverID">

                                                                Driver
                                                            </InputLabel>
                                                            {factoryEnteringInput.isTemporyDriver === false ?
                                                                <TextField select
                                                                    error={Boolean(touched.driverID && errors.driverID)}
                                                                    fullWidth
                                                                    helperText={touched.driverID && errors.driverID}
                                                                    name="driverID"
                                                                    onBlur={handleBlur}
                                                                    disabled={DisableUserFields}
                                                                    onChange={(e) => handleChange(e)}
                                                                    value={factoryEnteringInput.driverID}
                                                                    variant="outlined"
                                                                    id="driverID"

                                                                >
                                                                    <MenuItem value="0">--Select Driver--</MenuItem>
                                                                    {generateDropDownMenu(employees)}
                                                                </TextField> : <TextField
                                                                    fullWidth
                                                                    name="temporyDriver"
                                                                    onBlur={handleBlur}
                                                                    disabled={DisableUserFields}
                                                                    onChange={(e) => handleChange(e)}
                                                                    value={factoryEnteringInput.temporyDriver}
                                                                    variant="outlined"
                                                                    id="temporyDriver"
                                                                >
                                                                </TextField>}

                                                        </Grid>

                                                    </Grid>
                                                    <Grid container spacing={3} >
                                                        <Grid item md={4} xs={12} >
                                                            <InputLabel shrink id="isTemporyVehicleNo">
                                                                Is Tempory
                                                            </InputLabel>
                                                            <Switch
                                                                checked={values.isTemporyVehicleNo}
                                                                disabled={DisableUserFields}
                                                                onChange={VehicleNoEnabledHandleChange}
                                                                name="isTemporyVehicleNo"
                                                                value={factoryEnteringInput.isTemporyVehicleNo}
                                                            />
                                                        </Grid>

                                                    </Grid>

                                                    <Grid container spacing={3} >
                                                        <Grid item md={4} xs={12}>
                                                            <InputLabel shrink id="vehicleNumber">

                                                                Vehicle Number
                                                            </InputLabel>
                                                            {factoryEnteringInput.isTemporyVehicleNo === false ?
                                                                <TextField select
                                                                    error={Boolean(touched.vehicleNumber && errors.vehicleNumber)}
                                                                    fullWidth
                                                                    helperText={touched.vehicleNumber && errors.vehicleNumber}
                                                                    name="vehicleNumber"
                                                                    onBlur={handleBlur}
                                                                    disabled={DisableUserFields}
                                                                    onChange={(e) => handleChange(e)}
                                                                    value={factoryEnteringInput.vehicleNumber}
                                                                    variant="outlined"
                                                                    id="vehicleNumber"

                                                                >
                                                                    <MenuItem value="0">--Select Vehicle Number--</MenuItem>
                                                                    {generateDropDownMenu(vehicles)}
                                                                </TextField> : <TextField
                                                                    fullWidth
                                                                    name="temporyVehicleNo"
                                                                    onBlur={handleBlur}
                                                                    onChange={(e) => handleChange(e)}
                                                                    disabled={DisableUserFields}
                                                                    value={factoryEnteringInput.temporyVehicleNo}
                                                                    variant="outlined"
                                                                    id="temporyVehicleNo"
                                                                >
                                                                </TextField>}

                                                        </Grid>
                                                        <Grid item md={4} xs={12}>
                                                            <InputLabel shrink id="leafTransporterID">
                                                                Leaf Trasporter
                                                            </InputLabel>
                                                            <TextField
                                                                fullWidth
                                                                name="leafTransporterID"
                                                                onBlur={handleBlur}
                                                                onChange={(e) => handleChange(e)}
                                                                disabled={DisableUserFields}
                                                                value={factoryEnteringInput.leafTransporterID}
                                                                variant="outlined"
                                                                id="leafTransporterID"
                                                            >
                                                            </TextField>
                                                        </Grid>

                                                        <Grid item md={4} xs={12}>
                                                            <InputLabel shrink id="rainfallInmm">
                                                                Rainfall In mm
                                                            </InputLabel>
                                                            <TextField
                                                                fullWidth
                                                                name="rainfallInmm"
                                                                type='number'
                                                                onBlur={handleBlur}
                                                                onChange={(e) => handleChange(e)}
                                                                disabled={DisableUserFields}
                                                                value={factoryEnteringInput.rainfallInmm}
                                                                variant="outlined"
                                                                id="rainfallInmm"
                                                            >
                                                            </TextField>
                                                        </Grid>
                                                    </Grid>



                                                </Card>
                                                <Card style={{ padding: 20, marginTop: 20, backgroundColor: "#f5f5f5" }}>
                                                    <CardHeader style={{ marginLeft: '-1rem', marginTop: '-1rem', marginBottom: '2rem' }} titleTypographyProps={{ variant: 'h6' }}
                                                        title="Crop Information"
                                                    />
                                                    <Grid container spacing={3}>
                                                        <Grid item md={4} xs={12}>
                                                            <InputLabel shrink id="courceLeaf">
                                                                Cource Leaf (%)
                                                            </InputLabel>
                                                            <TextField
                                                                fullWidth
                                                                name="courceLeaf"
                                                                onBlur={handleBlur}
                                                                onChange={(e) => handleChange(e)}
                                                                value={factoryEnteringInput.courceLeaf}
                                                                disabled={DisableUserFields}
                                                                variant="outlined"
                                                                id="courceLeaf"
                                                            >
                                                            </TextField>
                                                        </Grid>

                                                        <Grid item md={4} xs={12}>
                                                            <InputLabel shrink id="leafCondition">
                                                                Leaf Condition
                                                            </InputLabel>
                                                            <TextField
                                                                fullWidth
                                                                name="leafCondition"
                                                                onBlur={handleBlur}
                                                                onChange={(e) => handleChange(e)}
                                                                value={factoryEnteringInput.leafCondition}
                                                                disabled={DisableUserFields}
                                                                variant="outlined"
                                                                id="leafCondition"
                                                            >
                                                            </TextField>
                                                        </Grid>

                                                        <Grid item md={4} xs={12}>
                                                            <InputLabel shrink id="boiledLeaf">
                                                                Boiled Leaf
                                                            </InputLabel>
                                                            <TextField
                                                                fullWidth
                                                                name="boiledLeaf"
                                                                onBlur={handleBlur}
                                                                onChange={(e) => handleChange(e)}
                                                                value={factoryEnteringInput.boiledLeaf}
                                                                disabled={DisableUserFields}
                                                                variant="outlined"
                                                                id="boiledLeaf"
                                                            >
                                                            </TextField>
                                                        </Grid>

                                                        <TableContainer >
                                                            <Table className={classes.table} aria-label="caption table">
                                                                <TableBody>
                                                                    <TableRow >
                                                                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                            <Grid container >
                                                                                <Grid alignContent={'center'}  >
                                                                                    <InputLabel shrink id="fieldGrossWeight" align={'left'}>
                                                                                        Field Gross Weight (KG)
                                                                                    </InputLabel>
                                                                                    <TextField
                                                                                        fullWidth
                                                                                        name="fieldGrossWeight"
                                                                                        onBlur={handleBlur}
                                                                                        onChange={(e) => handleChange(e)}
                                                                                        value={factoryEnteringInput.fieldGrossWeight}
                                                                                        disabled={DisableUserFields}
                                                                                        variant="outlined"
                                                                                        id="fieldGrossWeight"
                                                                                    >
                                                                                    </TextField>

                                                                                </Grid>
                                                                            </Grid>
                                                                        </TableCell>

                                                                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                            <Grid container >
                                                                                <Grid alignContent={'center'}  >
                                                                                    <InputLabel shrink id="factoryGrossWeight" align={'left'}>
                                                                                        Factory Gross Weight (KG)
                                                                                    </InputLabel>
                                                                                    <TextField
                                                                                        fullWidth
                                                                                        name="factoryGrossWeight"
                                                                                        onBlur={handleBlur}
                                                                                        onChange={(e) => handleChange(e)}
                                                                                        value={factoryEnteringInput.factoryGrossWeight}
                                                                                        disabled={DisableUserFields}
                                                                                        variant="outlined"
                                                                                        id="factoryGrossWeight"
                                                                                    >
                                                                                    </TextField>

                                                                                </Grid>
                                                                            </Grid>
                                                                        </TableCell>

                                                                        <TableCell align={'center'} alignContent={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                            <Grid container >
                                                                                <Grid alignContent={'center'}  >
                                                                                    <InputLabel shrink id="lossOrExcess" align={'left'}>
                                                                                        Loss / Excess (KG)
                                                                                    </InputLabel>
                                                                                    <TextField
                                                                                        fullWidth
                                                                                        name="lossOrExcess"
                                                                                        onBlur={handleBlur}
                                                                                        onChange={(e) => handleChange(e)}
                                                                                        value={factoryEnteringInput.lossOrExcess}
                                                                                        disabled={DisableUserFields}
                                                                                        variant="outlined"
                                                                                        id="lossOrExcess"
                                                                                    >
                                                                                    </TextField>

                                                                                </Grid>
                                                                            </Grid>
                                                                        </TableCell>


                                                                    </TableRow>
                                                                    <TableRow >
                                                                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                            <Grid container >
                                                                                <Grid alignContent={'center'}  >
                                                                                    <InputLabel shrink id="fieldBag" align={'left'}>
                                                                                        Bag (KG)
                                                                                    </InputLabel>
                                                                                    <TextField
                                                                                        fullWidth
                                                                                        name="fieldBag"
                                                                                        onBlur={handleBlur}
                                                                                        onChange={(e) => handleChange(e)}
                                                                                        value={factoryEnteringInput.fieldBag}
                                                                                        disabled={DisableUserFields}
                                                                                        variant="outlined"
                                                                                        id="fieldBag"
                                                                                    >
                                                                                    </TextField>

                                                                                </Grid>
                                                                            </Grid>
                                                                        </TableCell>

                                                                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                            <Grid container >
                                                                                <Grid alignContent={'center'}  >
                                                                                    <InputLabel shrink id="factoryBag" align={'left'}>
                                                                                        Bag (KG)
                                                                                    </InputLabel>
                                                                                    <TextField
                                                                                        fullWidth
                                                                                        name="factoryBag"
                                                                                        onBlur={handleBlur}
                                                                                        onChange={(e) => handleChange(e)}
                                                                                        value={factoryEnteringInput.factoryBag}
                                                                                        disabled={DisableUserFields}
                                                                                        variant="outlined"
                                                                                        id="factoryBag"
                                                                                    >
                                                                                    </TextField>

                                                                                </Grid>
                                                                            </Grid>
                                                                        </TableCell>

                                                                        <TableCell align={'center'} alignContent={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                            <Grid container >
                                                                                <Grid alignContent={'center'}  >
                                                                                    <InputLabel shrink id="comment" align={'left'}>
                                                                                        Comment
                                                                                    </InputLabel>
                                                                                    <TextField
                                                                                        fullWidth
                                                                                        name="comment"
                                                                                        onBlur={handleBlur}
                                                                                        onChange={(e) => handleChange(e)}
                                                                                        value={factoryEnteringInput.comment}
                                                                                        disabled={DisableUserFields}
                                                                                        variant="outlined"
                                                                                        id="comment"
                                                                                    >
                                                                                    </TextField>

                                                                                </Grid>
                                                                            </Grid>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                    <TableRow >
                                                                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                            <Grid container >
                                                                                <Grid alignContent={'center'}  >
                                                                                    <InputLabel shrink id="fieldWater" align={'left'}>
                                                                                        Water (KG)
                                                                                    </InputLabel>
                                                                                    <TextField
                                                                                        fullWidth
                                                                                        name="fieldWater"
                                                                                        onBlur={handleBlur}
                                                                                        onChange={(e) => handleChange(e)}
                                                                                        value={factoryEnteringInput.fieldWater}
                                                                                        disabled={DisableUserFields}
                                                                                        variant="outlined"
                                                                                        id="fieldWater"
                                                                                    >
                                                                                    </TextField>
                                                                                </Grid>
                                                                            </Grid>
                                                                        </TableCell>

                                                                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                            <Grid container >
                                                                                <Grid alignContent={'center'}  >
                                                                                    <InputLabel shrink id="factoryWater" align={'left'}>
                                                                                        Water (KG)
                                                                                    </InputLabel>
                                                                                    <TextField
                                                                                        fullWidth
                                                                                        name="factoryWater"
                                                                                        onBlur={handleBlur}
                                                                                        onChange={(e) => handleChange(e)}
                                                                                        value={factoryEnteringInput.factoryWater}
                                                                                        disabled={DisableUserFields}
                                                                                        variant="outlined"
                                                                                        id="factoryWater"
                                                                                    >
                                                                                    </TextField>
                                                                                </Grid>
                                                                            </Grid>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                    <TableRow >
                                                                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                            <Grid container >
                                                                                <Grid alignContent={'center'}  >
                                                                                    <InputLabel shrink id="fieldCouseLeaf" align={'left'}>
                                                                                        Couse Leaf (KG)
                                                                                    </InputLabel>
                                                                                    <TextField
                                                                                        fullWidth
                                                                                        name="fieldCouseLeaf"
                                                                                        onBlur={handleBlur}
                                                                                        onChange={(e) => handleChange(e)}
                                                                                        value={factoryEnteringInput.fieldCouseLeaf}
                                                                                        disabled={DisableUserFields}
                                                                                        variant="outlined"
                                                                                        id="fieldCouseLeaf"
                                                                                    >
                                                                                    </TextField>

                                                                                </Grid>
                                                                            </Grid>
                                                                        </TableCell>

                                                                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                            <Grid container >
                                                                                <Grid alignContent={'center'}  >
                                                                                    <InputLabel shrink id="factoryCouseLeaf" align={'left'}>
                                                                                        Couse Leaf (KG)
                                                                                    </InputLabel>
                                                                                    <TextField
                                                                                        fullWidth
                                                                                        name="factoryCouseLeaf"
                                                                                        onBlur={handleBlur}
                                                                                        onChange={(e) => handleChange(e)}
                                                                                        value={factoryEnteringInput.factoryCouseLeaf}
                                                                                        disabled={DisableUserFields}
                                                                                        variant="outlined"
                                                                                        id="factoryCouseLeaf"
                                                                                    >
                                                                                    </TextField>

                                                                                </Grid>
                                                                            </Grid>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                    <TableRow >
                                                                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                            <Grid container >
                                                                                <Grid alignContent={'center'}  >
                                                                                    <InputLabel shrink id="fieldNetWeight" align={'left'}>
                                                                                        Field Net Weight (KG)
                                                                                    </InputLabel>
                                                                                    <TextField
                                                                                        fullWidth
                                                                                        name="fieldNetWeight"
                                                                                        onBlur={handleBlur}
                                                                                        onChange={(e) => handleChange(e)}
                                                                                        value={factoryEnteringInput.fieldNetWeight}
                                                                                        disabled={DisableUserFields}
                                                                                        variant="outlined"
                                                                                        id="fieldNetWeight"
                                                                                    >
                                                                                    </TextField>
                                                                                </Grid>
                                                                            </Grid>
                                                                        </TableCell>
                                                                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                            <Grid container >
                                                                                <Grid alignContent={'center'}  >
                                                                                    <InputLabel shrink id="factoryNetWeight" align={'left'}>
                                                                                        Factory Net Weight (KG)
                                                                                    </InputLabel>
                                                                                    <TextField
                                                                                        fullWidth
                                                                                        name="factoryNetWeight"
                                                                                        onBlur={handleBlur}
                                                                                        onChange={(e) => handleChange(e)}
                                                                                        value={factoryEnteringInput.factoryNetWeight}
                                                                                        disabled={DisableUserFields}
                                                                                        variant="outlined"
                                                                                        id="factoryNetWeight"
                                                                                    >
                                                                                    </TextField>
                                                                                </Grid>
                                                                            </Grid>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                </TableBody>
                                                            </Table>
                                                        </TableContainer>
                                                    </Grid>
                                                </Card>
                                                <br />
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