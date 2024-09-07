import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Box,
    Card,
    makeStyles,
    Container,
    CardContent,
    Divider,
    MenuItem,
    Grid,
    InputLabel,
    TextField,
    CardHeader,
    Button,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    Paper,
    TableBody
} from '@material-ui/core';
import Page from 'src/components/Page';
import { Formik } from 'formik';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { useNavigate } from 'react-router-dom';
import services from '../Services'
import * as Yup from "yup";
import { useAlert } from "react-alert";
import { LoadingComponent } from 'src/utils/newLoader';
import _ from 'lodash';

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.dark,
        minHeight: '100%',
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3)
    },
}));

const screenCode = "LEAFDEDUCTION";

export default function LeafDeduction() {
    const classes = useStyles();
    const [title, setTitle] = useState("Leaf Deduction")
    const navigate = useNavigate();

    const [formData, setFormdata] = useState({
        groupID: '0',
        factoryID: '0',
        routeID: '0',
        accountTypeID: '0',
        bulkLeafDeductionPercentage: ''
    });

    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });
    const [groups, setGroups] = useState()
    const [factories, setFactories] = useState();
    const [routes, setRoutes] = useState();
    const [allSupplierDetails, setAllSupplierDetails] = useState([]);
    const [isViewTable, setIsViewTable] = useState(true);
    const alert = useAlert();

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWLEAFDEDUCTION');
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

        setFormdata({
            ...formData,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    useEffect(() => {
        trackPromise(
            getPermission(), getGroupsForDropdown()
        );
    }, []);

    useEffect(() => {
        if(formData.groupID !== 0){
            trackPromise(
                getfactoriesForDropDown()
            );
        }
    }, [formData.groupID]);

    useEffect(() => {
        if(formData.factoryID !== 0){
            trackPromise(
                getRoutesByFactoryID()
            );
        }
    }, [formData.factoryID]);

    useEffect(()=>{
        changeLeafDeductionPrecentage();
     }, [formData.bulkLeafDeductionPercentage]);

    async function getGroupsForDropdown() {
        const groups = await services.getGroupsForDropdown();
        setGroups(groups);
    }

    async function getfactoriesForDropDown() {
        const factory = await services.getfactoriesForDropDown(formData.groupID);
        setFactories(factory);
    }

    async function getRoutesByFactoryID() {
        const routeList = await services.getRoutesForDropDown(formData.factoryID);
        setRoutes(routeList);
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

    async function GetAllSupplierDetailsForLeafDeduction() {
        const responseList = await services.GetAllSupplierDetailsForLeafDeduction(formData.groupID, formData.factoryID, formData.routeID, formData.accountTypeID);
        if (responseList.data.length > 0) {
            setAllSupplierDetails(responseList.data);
            setIsViewTable(false);
        } else {
            alert.error("No records to display");
            setIsViewTable(true);
        }
    }

    function changeText(e, rowID, columnID) {
        const target = e.target;
        const value = target.value;
        const finalValue = value == "" ? parseFloat(0) : value
        var reg = new RegExp('^(0\.[0-9]{1,2}|0|0\.|0\.[0-9]{1}|[0-9]{1}|[0-9]{1}\.[0-9]{1,2})$');

        if (reg.test(finalValue) == false) {
            alert.error("Allow Only Numbers below 1 with two decimal places");
            return;
        }

        const newArr = [...allSupplierDetails];
        var ind = newArr.findIndex(e => e.customerAccountID == parseInt(rowID));
        newArr[ind] = {...newArr[ind], [columnID]: finalValue == "" ? parseFloat(0) : parseFloat(finalValue) };
        setAllSupplierDetails(newArr)
    }
    function changeLeafDeductionPrecentage() {
        const finalValue = formData.bulkLeafDeductionPercentage;
        var reg = new RegExp('^(0\.[0-9]{1,2}|0|0\.|0\.[0-9]{1}|[0-9]{1}|[0-9]{1}\.[0-9]{1,2})$');

        if (finalValue != "" && !reg.test(finalValue)) {
            alert.error("Allow Only Numbers below 1 with two decimal places");
            return;
        }
        let totbulkLeafDeductionPercentage = 0;
        const newArr =_.cloneDeep(allSupplierDetails)
        newArr.forEach(x => {
            x.leafDeductionRate = parseFloat(finalValue);
            totbulkLeafDeductionPercentage = totbulkLeafDeductionPercentage + x.leafDeductionRate;
        });
        setAllSupplierDetails(newArr)
    }

    function handleChange(e) {
        const target = e.target;
        const value = target.value;
        setFormdata({
            ...formData,
            [e.target.name]: value
        });
    }

    function refreshPage() {
        window.location.reload(false);
    }

    async function UpdateLeafDeduction() {
        allSupplierDetails.forEach(x => {
            x.modifiedBy = tokenService.getUserIDFromToken();
        })
        let arr=[];
        var res = await services.UpdateLeafDeductionPercentage(allSupplierDetails);
        if (res.statusCode == "Success") {
            alert.success(res.message);
            for(var i=0;i<res.data.length;i++){
                const data = allSupplierDetails.find(x => x.customerAccountID == res.data[i].customerAccountID);
                arr.push(data);
            }
            setAllSupplierDetails(arr);
            refreshPage()
        } else {
            alert.error(res.message);
        }
    }

    function cardTitle(titleName) {
        return (
            <Grid container spacing={1} >
                <Grid item md={10} xs={12}>
                    {titleName}
                </Grid>
            </Grid >
        )
    }

    return (
        <Page
            className={classes.root}
            title="Leaf Deduction"
        >
            <LoadingComponent/>
            <Container maxWidth={false}>
                <Formik
                    initialValues={{
                        groupID: formData.groupID,
                        factoryID: formData.factoryID,
                        routeID: formData.routeID,
                        accountTypeID: formData.accountTypeID,
                        bulkLeafDeductionPercentage: formData.bulkLeafDeductionPercentage
                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().required('Group required').min("1", 'Group required'),
                            factoryID: Yup.number().required('Factory required').min("1", 'Factory required'),
                        })
                    }
                    onSubmit={(e) => trackPromise(GetAllSupplierDetailsForLeafDeduction(e))}
                    enableReinitialize
                >
                    {({
                        errors,
                        handleSubmit,
                        touched,
                    }) => (
                        <form onSubmit={handleSubmit}>
                            <Box mt={0}>
                                <Card>
                                    <CardHeader
                                        title={cardTitle(title)}
                                    />
                                    <PerfectScrollbar>
                                        <Divider />
                                        <CardContent style={{ marginBottom: '2rem' }}>
                                            <Grid container spacing={3}>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="groupID">
                                                        Group  *
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.groupID && errors.groupID)}
                                                        fullWidth
                                                        helperText={touched.groupID && errors.groupID}
                                                        name="groupID"
                                                        onChange={(e) => handleChange(e)}
                                                        value={formData.groupID}
                                                        variant="outlined"
                                                        size='small'
                                                        InputProps={{
                                                            readOnly: !permissionList.isGroupFilterEnabled,
                                                        }}
                                                    >
                                                        <MenuItem value="0" disabled={true}>--Select Group--</MenuItem>
                                                        {generateDropDownMenu(groups)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="factoryID">
                                                        Operation Entity *
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        helperText={touched.factoryID && errors.factoryID}
                                                        name="factoryID"
                                                        onChange={(e) => handleChange(e)}
                                                        value={formData.factoryID}
                                                        variant="outlined"
                                                        size='small'
                                                        id="factoryID"
                                                        InputProps={{
                                                            readOnly: !permissionList.isFactoryFilterEnabled,
                                                        }}
                                                    >
                                                        <MenuItem value="0" disabled={true}>--Select Factory--</MenuItem>
                                                        {generateDropDownMenu(factories)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="routeID">
                                                        Route
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="routeID"
                                                        onChange={(e) => handleChange(e)}
                                                        value={formData.routeID}
                                                        variant="outlined"
                                                        size="small"
                                                    >
                                                        <MenuItem value="0">--Select Route--</MenuItem>
                                                        {generateDropDownMenu(routes)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="routeID">
                                                        Account Type
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="accountTypeID"
                                                        onChange={(e) => handleChange(e)}
                                                        variant="outlined"
                                                        size="small"
                                                        defaultValue={0}
                                                    > 
                                                        <MenuItem value="0">--Select Account Type--</MenuItem>
                                                        <MenuItem value="1">Supplier</MenuItem>
                                                        <MenuItem value="2">Dealer</MenuItem>
                                                        <MenuItem value="3">Estate</MenuItem>
                                                    </TextField>
                                                </Grid>
                                            </Grid>
                                            <br />
                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                <Button
                                                    color="primary"
                                                    type="submit"
                                                    variant="contained"
                                                >
                                                    Search
                                                </Button>
                                            </Box>
                                        </CardContent>
                                        <center>
                                            <Box maxWidth={1150} hidden={isViewTable}>
                                                <Card>
                                                    <Box p={2} style={{ marginLeft: '30px', display: "flex", justifyContent: 'right' }}>
                                                        <Grid item md={3} xs={4}>
                                                            <InputLabel shrink id="bulkLeafDeductionPercentage">
                                                                Bulk Leaf Deduction Percentage
                                                            </InputLabel>
                                                            <TextField
                                                                fullWidth
                                                                name="bulkLeafDeductionPercentage"
                                                                size='small'
                                                                type='number'
                                                                onChange={(e) => handleChange(e)}
                                                                value={formData.bulkLeafDeductionPercentage}
                                                                variant="outlined"
                                                            />
                                                        </Grid>
                                                    </Box>
                                                    <Container>
                                                        <TableContainer component={Paper}>
                                                            <Table className={classes.table} aria-label="simple table">
                                                                <TableHead>
                                                                    <TableRow>
                                                                        <TableCell align="center">Reg. Number</TableCell>
                                                                        <TableCell align="center">Supplier Name</TableCell>
                                                                        <TableCell align="center">Supplier Route</TableCell>
                                                                        <TableCell align="center">Leaf Deduction Percentage</TableCell>
                                                                    </TableRow>
                                                                </TableHead>
                                                                <TableBody>
                                                                    {allSupplierDetails.map((row) => {
                                                                        let ID = row.customerAccountID
                                                                        return (
                                                                            <TableRow key={row.registrationNumber}>
                                                                                <TableCell align="center" component="th" scope="row">{row.registrationNumber}</TableCell>
                                                                                <TableCell align="center">{row.fullName}</TableCell>
                                                                                <TableCell align="center">{row.routeName}</TableCell>
                                                                                <TableCell align='center'>
                                                                                    <Grid width={20} style={{ marginLeft: '10px' }}>
                                                                                        <TextField
                                                                                            style={{ width: '120px' }}
                                                                                            size='small'
                                                                                            id="outlined-size-small"
                                                                                            name={ID}
                                                                                            type='number'
                                                                                            onChange={(e) => changeText(e, row.customerAccountID, 'leafDeductionRate')}
                                                                                            value={row.leafDeductionRate}
                                                                                            variant="outlined"
                                                                                        />
                                                                                    </Grid>
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        );
                                                                    })}
                                                                </TableBody>
                                                            </Table>
                                                        </TableContainer>
                                                    </Container>
                                                    <br />
                                                    <Box display="flex" justifyContent="flex-end" p={2}>
                                                        <Button
                                                            color="primary"
                                                            onClick={UpdateLeafDeduction}
                                                            variant="contained"
                                                        >
                                                            Update
                                                        </Button>
                                                    </Box>
                                                </Card>
                                            </Box>
                                        </center>
                                    </PerfectScrollbar>
                                </Card>
                            </Box>
                        </form>
                    )}
                </Formik>
            </Container>
        </Page>
    )
}
