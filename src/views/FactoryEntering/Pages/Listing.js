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
    InputLabel
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import * as Yup from "yup";
import { LoadingComponent } from 'src/utils/newLoader';
import { Formik, validateYupSchema } from 'formik';
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import MaterialTable from "material-table";
import VisibilityIcon from '@material-ui/icons/Visibility';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";

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
    }
}));

const screenCode = 'FACTORYENTERING';

export default function FactoryEnteringListing(props) {
    const [title, setTitle] = useState("Bought Leaf Receiving")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [routes, setRoutes] = useState();
    const [factoryInput, setFactoryInput] = useState({
        groupID: 0,
        factoryID: 0,
        routeID: 0,
        date: null
    })
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });
    let encrypted = "";
    const navigate = useNavigate();
    const handleClick = () => {
        encrypted = btoa('0');
        navigate('/app/factoryEntering/addEdit/' + encrypted)
    }
    const handleClickEdit = (greenLeafReceivingID) => {
        encrypted = btoa(greenLeafReceivingID.toString());
        navigate('/app/factoryEntering/addEdit/' + encrypted);
    }
    const handleClickView = (greenLeafReceivingID) => {
        encrypted = btoa(greenLeafReceivingID.toString());
        navigate('/app/factoryEntering/view/' + encrypted);
    }
    const alert = useAlert();
    const componentRef = useRef();
    const [greenLeafList, setGreenLeafList] = useState([]);


    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission());
    }, []);

    useEffect(() => {
        trackPromise(getFactoriesForDropDown());
    }, [factoryInput.groupID]);

    useEffect(() => {
        trackPromise(
            getRoutesByFactoryID()
        )
    }, [factoryInput.factoryID]);


    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWFACTORYENTERING');

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

        setFactoryInput({
            ...factoryInput,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }
    async function getFactoriesForDropDown() {
        const factory = await services.getFactoryByGroupID(factoryInput.groupID);
        setFactories(factory);
    }

    async function getRoutesByFactoryID() {
        const route = await services.getRoutesForDropDown(factoryInput.factoryID);
        setRoutes(route);
    }

    async function GetGreenLeafReceivingList() {
        const response = await services.GetGreenLeafReceiving(factoryInput.groupID, factoryInput.factoryID, factoryInput.routeID, factoryInput.date);

        if (response.statusCode == "Success" && response.data != null) {
            setGreenLeafList(response.data);
            if (response.data.length == 0) {
                alert.error("No records to display");
            }
        }
        else {
            alert.error(response.message);

        }
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
                        toolTiptitle={"Add Bought Leaf Receiving"}
                    />
                </Grid>
            </Grid>
        )
    }

    function handleChange(e) {
        const target = e.target;
        const value = target.value
        setFactoryInput({
            ...factoryInput,
            [e.target.name]: value
        });
    }
    function handleDateChange(value) {
        setFactoryInput({
            ...factoryInput,
            date: value
        });
    }

    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: factoryInput.groupID,
                            factoryID: factoryInput.factoryID,
                            routeID: factoryInput.routeID,
                            date: factoryInput.date
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
                                date: Yup.date().required('Date is required').typeError('Invalid date'),
                            })
                        }
                        onSubmit={() => trackPromise(GetGreenLeafReceivingList())}
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
                                                <Grid container spacing={3}>
                                                    <Grid item md={3} xs={8}>
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
                                                            onChange={(e) => handleChange(e)}
                                                            value={factoryInput.groupID}
                                                            disabled={!permissionList.isGroupFilterEnabled}
                                                            variant="outlined"
                                                            id="groupID"

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
                                                            size='small'
                                                            name="factoryID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={factoryInput.factoryID}
                                                            disabled={!permissionList.isFactoryFilterEnabled}
                                                            variant="outlined"
                                                            id="factoryID"

                                                        >
                                                            <MenuItem value="0">--Select Factory--</MenuItem>
                                                            {generateDropDownMenu(factories)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={3} xs={8}>
                                                        <InputLabel shrink id="routeID">
                                                            Route
                                                        </InputLabel>
                                                        <TextField select
                                                            fullWidth
                                                            size='small'
                                                            name="routeID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={factoryInput.routeID}
                                                            variant="outlined"
                                                            id="routeID"

                                                        >
                                                            <MenuItem value="0">--Select Routes--</MenuItem>
                                                            {generateDropDownMenu(routes)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={8}>
                                                        <InputLabel shrink id="date">
                                                            Date *
                                                        </InputLabel>
                                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                            <KeyboardDatePicker
                                                                error={Boolean(touched.date && errors.date)}
                                                                helperText={touched.date && errors.date}
                                                                autoOk
                                                                fullWidth
                                                                variant="inline"
                                                                format="dd/MM/yyyy"
                                                                margin="dense"
                                                                id="date"
                                                                name="date"
                                                                value={factoryInput.date}
                                                                onChange={(e) => handleDateChange(e)}
                                                                KeyboardButtonProps={{
                                                                    'aria-label': 'change date',
                                                                }}
                                                                InputProps={{ readOnly: true }}
                                                            />
                                                        </MuiPickersUtilsProvider>
                                                    </Grid>
                                                </Grid>
                                                <Box display="flex" flexDirection="row-reverse" p={2} >
                                                    <Button
                                                        color="primary"
                                                        type="submit"
                                                        variant="contained"
                                                    >
                                                        Search
                                                    </Button>
                                                </Box>
                                                <br />

                                            </CardContent>
                                            <Box minWidth={1050}>
                                                {greenLeafList.length > 0 ?
                                                    <MaterialTable
                                                        title="Multiple Actions Preview"
                                                        columns={[
                                                            { title: 'Date', field: 'leafReceivedDate', render: rowData => rowData.leafReceivedDate.split('T')[0] },
                                                            { title: 'Route Name', field: 'routeName' },
                                                        ]}
                                                        data={greenLeafList}
                                                        options={{
                                                            exportButton: false,
                                                            showTitle: false,
                                                            headerStyle: { textAlign: "left", height: '1%' },
                                                            cellStyle: { textAlign: "left" },
                                                            columnResizable: false,
                                                            actionsColumnIndex: -1,
                                                            pageSize: 10
                                                        }}
                                                        actions={[{
                                                            icon: 'edit',
                                                            tooltip: 'Edit',
                                                            onClick: (event, rowData) => handleClickEdit(rowData.greenLeafReceivingID)
                                                        },
                                                        {
                                                            icon: VisibilityIcon,
                                                            tooltip: 'View',
                                                            onClick: (event, rowData) => handleClickView(rowData.greenLeafReceivingID)
                                                        }
                                                        ]}
                                                    /> : null}
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
    )
}