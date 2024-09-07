import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Box,
    Card,
    makeStyles,
    Container,
    CardHeader,
    CardContent,
    Divider,
    MenuItem,
    Grid,
    InputLabel,
    TextField,
} from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import MaterialTable from "material-table";
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';


const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.dark,
        minHeight: '100%',
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3)
    },
}));

var screenCode = "VEHICLEREGISTRATION"

export default function VehicleRegistrationListing() {
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [Vehicle, setVehicle] = useState();
    const [isViewTable, setIsViewTable] = useState(true);
    const [VehicleData, setVehicleData] = useState({
        groupID: '0',
        factoryID: '0'
    })

    const navigate = useNavigate();
    let encrypted = "";
    const handleClick = () => {
        encrypted = btoa('0');
        navigate('/app/VehicleRegistration/addedit/' + encrypted);
    }
    const handleClickEdit = (vehicleID) => {
        encrypted = btoa(vehicleID.toString());
        navigate('/app/VehicleRegistration/addedit/' + encrypted);
    }
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });

    useEffect(() => {
        getPermissions();
        trackPromise(
            getGroupsForDropdown()
        );
    }, []);

    useEffect(() => {
        if (VehicleData.groupID !== 0) {
            trackPromise(
                getFactoriesByGroupID()
            )
        }
    }, [VehicleData.groupID]);

    useEffect(() => {
        if (VehicleData.factoryID !== 0) {
            trackPromise(
                getVehicleDetailByFactoryID()
            )
            checkvehicleData();
        }
    }, [VehicleData.factoryID]);

    async function getPermissions() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWVEHICLEREGISTRATION');

        if (isAuthorized === undefined) {
            navigate('/404');
        }

        var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
        var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');

        setPermissions({
            ...permissionList,
            isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
            isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
        })

        setVehicleData({
            ...VehicleData,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken()),
        });
    }

    async function getFactoriesByGroupID() {
        const fac = await services.getFactoriesByGroupID(VehicleData.groupID);
        setFactories(fac);
    }

    async function getVehicleDetailByFactoryID() {
        const response = await services.getVehicleDetailByFactoryID(VehicleData.factoryID);
        setVehicle(response);
    }
    async function getGroupsForDropdown() {
        const groups = await services.getGroupsForDropdown();
        setGroups(groups);
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
    function checkvehicleData() {
        if (VehicleData.factoryID === '0') {
            setIsViewTable(true);
        }
        else {
            setIsViewTable(false);
        }
    }
    function handleChange(e) {
        const target = e.target;
        const value = target.value
        setVehicleData({
            ...VehicleData,
            [e.target.name]: value
        });
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
                        toolTiptitle={"Vehicle Registration Add"}
                    />

                </Grid>
            </Grid>
        )
    }

    return (
        <Page
            className={classes.root}
            title="Vehicle Registration"
        >
            <Container maxWidth={false}>
                <Box mt={0}>
                    <Card>
                        <CardHeader
                            title={cardTitle("Vehicle Registration")}
                        />
                        <PerfectScrollbar>
                            <Divider />
                            <CardContent style={{ marginBottom: "2rem" }}>
                                <Grid container spacing={3}>
                                    <Grid item md={4} xs={12}>
                                        <InputLabel shrink id="groupID">
                                            Group  *
                                        </InputLabel>
                                        <TextField select
                                            fullWidth
                                            name="groupID"
                                            size='small'
                                            onChange={(e) => handleChange(e)}
                                            value={VehicleData.groupID}
                                            variant="outlined"
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
                                            fullWidth
                                            name="factoryID"
                                            size='small'
                                            onChange={(e) => handleChange(e)}
                                            value={VehicleData.factoryID}
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
                                </Grid>
                            </CardContent>
                            <Box minWidth={1000} hidden={isViewTable}>
                                <MaterialTable
                                    title="Multiple Actions Preview"
                                    columns={[
                                        { title: 'Vehicle type', field: 'vehicleType' },
                                        { title: 'Registration Number', field: 'vehicleRegistrationNumber' },
                                        { title: 'Capacity', field: 'capacity' },

                                    ]}
                                    data={Vehicle}
                                    options={{
                                        exportButton: false,
                                        showTitle: false,
                                        headerStyle: { textAlign: "left", height: '1%' },
                                        cellStyle: { textAlign: "left", paddingRight: '15rem' },
                                        columnResizable: false,
                                        actionsColumnIndex: -1
                                    }}
                                    actions={[
                                        {
                                            icon: 'edit',
                                            tooltip: 'Edit Vehicle',
                                            onClick: (event, VehicleData) => handleClickEdit(VehicleData.vehicleID)
                                        }
                                    ]}
                                />
                            </Box>
                        </PerfectScrollbar>
                    </Card>
                </Box>
            </Container>
        </Page>
    );
};