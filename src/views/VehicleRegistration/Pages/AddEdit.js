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
    InputLabel,
    CardHeader,
    Divider,
    MenuItem
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik } from "formik";
import * as Yup from "yup";
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
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
var screenCode = "VEHICLEREGISTRATION"
export default function VehicleRegistrationAddEdit(props) {
    const [title, setTitle] = useState("Vehicle Registration Add")
    const classes = useStyles();
    const [isUpdate, setisUpdate] = useState(false);
    const [IsDisableButton, setIsDisableButton] = useState(false);
    const [factories, setFactories] = useState();
    const [VehicleTypes, setVehicleTypes] = useState();
    const [groups, setGroups] = useState();
    const [VehicleDetail, setVehicleDetail] = useState({
        vehicleID: 0,
        groupID: 0,
        factoryID: 0,
        vehicleTypeID: 0,
        vehicleNumber: '',
        fuelTypeID: 0,
        capacity: '',
    });
    const navigate = useNavigate();
    const { vehicleID } = useParams();
    const alert = useAlert();
    let decrypted = 0;
    const handleClick = () => {
        navigate('/app/VehicleRegistration/listing');
    }
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });

    useEffect(() => {
        decrypted = atob(vehicleID.toString());
        if (decrypted != 0) {
            trackPromise(GetVehicleDetailsByVehicleID(decrypted));
        }
        trackPromise(getPermissions(), getGroupsForDropdown());
    }, []);

    useEffect(() => {
        if (VehicleDetail.groupID !== 0) {
            trackPromise(
                getfactoriesForDropDown()
            )
        }
    }, [VehicleDetail.groupID]);

    useEffect(() => {
        if (VehicleDetail.factoryID !== 0) {
            trackPromise(
                getVehicleTypeForDropdown()
            );
        }
    }, [VehicleDetail.factoryID]);

    async function getPermissions() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITVEHICLEREGISTRATION');

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
        if (decrypted == 0) {
            setVehicleDetail({
                ...VehicleDetail,
                groupID: parseInt(tokenService.getGroupIDFromToken()),
                factoryID: parseInt(tokenService.getFactoryIDFromToken()),
            })
        }
    }

    async function getfactoriesForDropDown() {
        const factory = await services.getfactoriesForDropDown(VehicleDetail.groupID);
        setFactories(factory);
    }
    async function getGroupsForDropdown() {
        const groups = await services.getGroupsForDropdown();
        setGroups(groups);
    }
    async function getVehicleTypeForDropdown() {
        const result = await services.getVehicleTypeByFactoryID(VehicleDetail.factoryID);
        setVehicleTypes(result);
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
    async function GetVehicleDetailsByVehicleID(vehicleID) {
        let response = await services.GetVehicleDetailsByVehicleID(vehicleID);
        setTitle("Edit Vehicle");
        setVehicleDetail({
            ...VehicleDetail,
            groupID: response.groupID,
            factoryID: response.factoryID,
            vehicleNumber: response.vehicleRegistrationNumber,
            fuelTypeID: response.fuelTypeID,
            capacity: response.capacity,
            vehicleTypeID: response.vehicleTypeID,
        });
        setisUpdate(true);
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
        const value = target.value;
        setVehicleDetail({
            ...VehicleDetail,
            [e.target.name]: value
        });
    }
    async function SaveVehicle(values) {
        if (isUpdate == true) {
            let updateModel = {
                vehicleID: parseInt(atob(vehicleID.toString())),
                factoryID: parseInt(values.factoryID),
                groupID: parseInt(values.groupID),
                vehicleNumber: values.vehicleNumber,
                fuelTypeID: parseInt(values.fuelTypeID),
                capacity: values.capacity,
                vehicleTypeID: values.vehicleTypeID,
                modifiedBy: parseInt(tokenService.getUserIDFromToken())
            }
            let response = await services.updateVehicleDetail(updateModel);
            if (response.statusCode == "Success") {
                alert.success(response.message);
                setIsDisableButton(true);
                setVehicleDetail(updateModel);
                navigate('/app/VehicleRegistration/listing');
            }
            else {
                alert.error(response.message);
            }
        }
        else {
            let response = await services.saveVehicleDetail(values);

            if (response.statusCode == "Success") {
                alert.success(response.message);
                setIsDisableButton(true);
                setVehicleDetail(values);
                navigate('/app/VehicleRegistration/listing');
            }
            else {
                alert.error(response.message);
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
                            groupID: VehicleDetail.groupID,
                            factoryID: VehicleDetail.factoryID,
                            vehicleNumber: VehicleDetail.vehicleNumber,
                            fuelTypeID: VehicleDetail.fuelTypeID,
                            capacity: VehicleDetail.capacity,
                            vehicleTypeID: VehicleDetail.vehicleTypeID
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group required').min("1", 'Group required'),
                                factoryID: Yup.number().required('factoryID required').min("1", 'factoryID required'),
                                vehicleTypeID: Yup.string().required('vehicleTypeID required'),
                                vehicleNumber: Yup.string().required('Vehicle Number is required'),
                                fuelTypeID: Yup.number().max(255).required('Fual Type is required'),
                                capacity: Yup.string().required('Capacity  is required').matches(/^\s*(?=.*[0-9])\d*(?:\.\d{1,2})?\s*$/, 'Capacity allow Only 2 decimals'),
                            })
                        }
                        onSubmit={(e) => trackPromise(SaveVehicle(e))}
                        enableReinitialize
                    >
                        {({
                            errors,
                            handleBlur,
                            handleSubmit,
                            isSubmitting,
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
                                                <Grid container spacing={3}>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="groupID">
                                                            Group  *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.groupID && errors.groupID)}
                                                            fullWidth
                                                            helperText={touched.groupID && errors.groupID}
                                                            name="groupID"
                                                            size='small'
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={VehicleDetail.groupID}
                                                            variant="outlined"
                                                            id="groupID"
                                                            InputProps={{
                                                                readOnly: !permissionList.isGroupFilterEnabled ? true : false
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Group--</MenuItem>
                                                            {generateDropDownMenu(groups)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="factoryID">
                                                            Operation Entity *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.factoryID && errors.factoryID)}
                                                            fullWidth
                                                            helperText={touched.factoryID && errors.factoryID}
                                                            name="factoryID"
                                                            onBlur={handleBlur}
                                                            size='small'
                                                            onChange={(e) => handleChange(e)}
                                                            value={VehicleDetail.factoryID}
                                                            variant="outlined"
                                                            id="factoryID"
                                                            InputProps={{
                                                                readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Operation Entity--</MenuItem>
                                                            {generateDropDownMenu(factories)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="vehicleTypeID">
                                                            Vehicle Type*
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.vehicleTypeID && errors.vehicleTypeID)}
                                                            fullWidth
                                                            helperText={touched.vehicleTypeID && errors.vehicleTypeID}
                                                            name="vehicleTypeID"
                                                            size='small'
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={VehicleDetail.vehicleTypeID}
                                                            variant="outlined"
                                                            id="vehicleTypeID"
                                                        >
                                                            <MenuItem value="0">--Select VehicleType--</MenuItem>
                                                            {generateDropDownMenu(VehicleTypes)}
                                                        </TextField>
                                                    </Grid> <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="vehicleNumber">
                                                            Vehicle Register Number *
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.vehicleNumber && errors.vehicleNumber)}
                                                            fullWidth
                                                            helperText={touched.vehicleNumber && errors.vehicleNumber}
                                                            name="vehicleNumber"
                                                            size='small'
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={VehicleDetail.vehicleNumber}
                                                            disabled={IsDisableButton}
                                                            variant="outlined"
                                                            InputProps={{
                                                                readOnly: isUpdate ? true : false,
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="fuelTypeID">
                                                            Fual Type *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.fuelTypeID && errors.fuelTypeID)}
                                                            fullWidth
                                                            helperText={touched.fuelTypeID && errors.fuelTypeID}
                                                            name="fuelTypeID"
                                                            size='small'
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={VehicleDetail.fuelTypeID}
                                                            variant="outlined"
                                                        >
                                                            <MenuItem value="0">--Select Fual Type--</MenuItem>
                                                            <MenuItem value="1">Petrol</MenuItem>
                                                            <MenuItem value="2">Diesel</MenuItem>
                                                            <MenuItem value="3">Kerosene</MenuItem>
                                                            <MenuItem value="4">Gas</MenuItem>
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="capacity">
                                                            Capacity *
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.capacity && errors.capacity)}
                                                            fullWidth
                                                            helperText={touched.capacity && errors.capacity}
                                                            name="capacity"
                                                            size='small'
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={VehicleDetail.capacity}
                                                            variant="outlined"
                                                        />
                                                    </Grid>
                                                </Grid>

                                            </CardContent>
                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                <Button
                                                    color="primary"
                                                    disabled={isSubmitting || IsDisableButton}
                                                    type="submit"
                                                    variant="contained"
                                                >
                                                    {isUpdate == true ? "Update" : "Save"}
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
        </Fragment>
    );
};