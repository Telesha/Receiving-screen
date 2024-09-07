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
import MaterialTable, { MTableAction } from "material-table";
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

var screenCode = "EMPLOYEEDESIGNATION"

export default function EmployeeDesignationListing() {
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [designation, setDesignation] = useState();
    const [isViewTable, setIsViewTable] = useState(true);
    const [designationData, setDesignationData] = useState({
        groupID: '0',
        factoryID: '0'
    })

    const navigate = useNavigate();
    let encrypted = "";
    const handleClick = () => {
        encrypted = btoa('0');
        navigate('/app/employeeDesignation/addedit/' + encrypted);
    }
    const handleClickEdit = (designationID) => {
        encrypted = btoa(designationID.toString());
        navigate('/app/employeeDesignation/addedit/' + encrypted);
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
        if (designationData.groupID !== '0') {
            trackPromise(
                getFactoriesByGroupID()
            )
        }
    }, [designationData.groupID]);

    useEffect(() => {
        if (designationData.factoryID !== '0') {
            trackPromise(
                getDesignationDataByFactoryID()
            )
            checkvehicleData();
        }
    }, [designationData.factoryID]);

    async function getPermissions() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWEMPLOYEEDESIGNATION');

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

        setDesignationData({
            ...designationData,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken()),
        });
    }

    async function getFactoriesByGroupID() {
        const fac = await services.getFactoriesByGroupID(designationData.groupID);
        setFactories(fac);
    }

    async function getDesignationDataByFactoryID() {
        const response = await services.getDesignationDataByFactoryID(designationData.factoryID);
        setDesignation(response);
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
        if (designationData.factoryID === '0') {
            setIsViewTable(true);
        }
        else {
            setIsViewTable(false);
        }
    }

    function handleChange(e) {
        const target = e.target;
        const value = target.value
        setDesignationData({
            ...designationData,
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
                        toolTiptitle={"Employee Designation Add"}
                    />
                </Grid>
            </Grid>
        )
    }

    return (
        <Page
            className={classes.root}
            title="Employee Designation"
        >
            <Container maxWidth={false}>
                <Box mt={0}>
                    <Card>
                        <CardHeader
                            title={cardTitle("Employee Designation")}
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
                                            value={designationData.groupID}
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
                                            Estate *
                                        </InputLabel>
                                        <TextField select
                                            fullWidth
                                            name="factoryID"
                                            size='small'
                                            onChange={(e) => handleChange(e)}
                                            value={designationData.factoryID}
                                            variant="outlined"
                                            id="factoryID"
                                            InputProps={{
                                                readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                                            }}
                                        >
                                            <MenuItem value="0">--Select Estate--</MenuItem>
                                            {generateDropDownMenu(factories)}
                                        </TextField>
                                    </Grid>
                                </Grid>
                            </CardContent>
                            <Box minWidth={1000} hidden={isViewTable}>
                                <MaterialTable
                                    title="Multiple Actions Preview"
                                    columns={[
                                        { title: 'Designation', field: 'designationName' },
                                        { title: 'Designation Code', field: 'designationCode' },
                                        { title: 'Emp Category', field: 'employeeCategoryName' },
                                        {
                                            title: 'Status',
                                            field: 'isActive',
                                            render: rowData => rowData.isActive ? 'Active' : 'Inactive',

                                        },
                                        { title: 'Basic Salary(Rs.)', field: 'basicSalary', render: rowData => rowData.basicSalary.toFixed(2), cellStyle: { textAlign: 'right' }, headerStyle: { textAlign: "right", height: '1%' }, },
                                    ]}
                                    data={designation}
                                    options={{
                                        exportButton: false,
                                        showTitle: false,
                                        headerStyle: { textAlign: "left", height: '1%' },
                                        cellStyle: { textAlign: "left" },
                                        columnResizable: false,
                                        actionsColumnIndex: -1
                                    }}
                                    actions={[
                                        {
                                            icon: 'edit',
                                            tooltip: 'Edit Group',
                                            onClick: (event, designationData) => handleClickEdit(designationData.designationID)
                                        }
                                    ]}
                                    components={{
                                        Action: props => (
                                            <div style={{ textAlign: 'center', width: '100%' }}>
                                                <MTableAction {...props} />
                                            </div>
                                        ),
                                    }}
                                    localization={{
                                        header: {
                                            actions: 'Action',
                                        },
                                    }}
                                />
                            </Box>
                        </PerfectScrollbar>
                    </Card>
                </Box>
            </Container>
        </Page>
    );
};