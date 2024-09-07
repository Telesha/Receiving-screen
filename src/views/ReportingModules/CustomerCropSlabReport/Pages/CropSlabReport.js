import React, { useState, useEffect, Fragment, useRef } from 'react'
import Page from 'src/components/Page';
import services from '../Services';
import * as Yup from "yup";
import { LoadingComponent } from 'src/utils/newLoader';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, validateYupSchema } from 'formik';
import PerfectScrollbar from 'react-perfect-scrollbar';
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import {
    Box,
    Card,
    Table,
    Grid,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Button,
    InputLabel,
    TextField,
    MenuItem,
    makeStyles,
    Container,
    CardHeader,
    CardContent,
    Divider,
    TableContainer
} from '@material-ui/core';
import { trackPromise } from 'react-promise-tracker';
import { useAlert } from "react-alert";
import ReactToPrint from "react-to-print";
import CreatePDF from './CreatePDF';
import xlsx from 'json-as-xlsx';
import moment from 'moment';

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

const screenCode = 'CUSTOMERCROPSLABREPORT';
export default function CropSlabReport() {

    const navigate = useNavigate();
    const classes = useStyles();
    const [title, setTitle] = useState("Customer Crop Slab Report");
    const [FormDetails, setFormDetails] = useState({
        groupID: '0',
        factoryID: '0',
        factoryItemID: '0',
        routeID: '0',
        slabValue: '0',
        startDate: new Date().toISOString().substring(0, 10),
        endDate: new Date().toISOString().substring(0, 10)
    })
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;
    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [routes, setRoutes] = useState();
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
        isBalanceRateChangeEnabled: false,
    });
    const [slabReportData, setSlabReportData] = useState([]);
    const handleClose = () => {
        setAnchorEl(null);
    };
    const handleClickPop = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const alert = useAlert();
    const [slabReportTotal, setSlabReportTotal] = useState({
        cropNetWeight: 0
    });
    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupName:"0",
        factoryName: "0",
        startDate: '',
        endDate: ''
    })
    const [csvHeaders, SetCsvHeaders] = useState([])
    const componentRef = useRef();

    useEffect(() => {
        trackPromise(getPermissions());
        trackPromise(getGroupsForDropdown());
    }, []);

    useEffect(() => {
        getFactoriesForDropdown();
    }, [FormDetails.groupID]);

    useEffect(() => {
        trackPromise(
            getRoutesByFactoryID()
        )
    }, [FormDetails.factoryID]);

    async function getPermissions() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWCUSTOMERCROPSLABREPORT');

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

        setFormDetails({
            ...FormDetails,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getFactoriesForDropdown() {
        const factories = await services.getAllFactoriesByGroupID(FormDetails.groupID);
        setFactories(factories);
    }

    async function getRoutesByFactoryID() {
        const route = await services.getRoutesForDropDown(FormDetails.factoryID);
        setRoutes(route);
    }

    async function GetDetails() {
        let model = {
            groupID: parseInt(FormDetails.groupID),
            factoryID: parseInt(FormDetails.factoryID),
            routeID: parseInt(FormDetails.routeID),
            startDate:moment(FormDetails.startDate.toString()).format().split('T')[0],
            endDate: moment(FormDetails.endDate.toString()).format().split('T')[0],
            slabValue: parseInt(FormDetails.slabValue)
        }

        getSelectedDropdownValuesForReport(model);
        const slabData = await services.GetCropSlabReportDetails(model);
        if (slabData.statusCode == "Success" && slabData.data != null) {
            setSlabReportData(slabData.data);
            calTotal(slabData.data);
            createDataForExcel(slabData.data);
            if(slabData.data.length == 0){
                alert.error("No records to display"); 
            }
        }
        else {
            alert.error("Error");
        }
    }

    async function createDataForExcel(array) {
        var res = [];
        if (array != null) {
            array.map(x => {
                var vr = {
                   'Route': x.routeName,
                   'RegistrationNumber': x.registrationNumber,
                   'SupplierName': x.name,
                   'Crop (KG)': x.cropNetWeight
                }
                res.push(vr);
            });
            var vr = {
                'Route': "Total",
                'RegistrationNumber': "",
                'SupplierName': "",
                'Crop (KG)': slabReportTotal.cropNetWeight
             }
             res.push(vr);
        }

        return res;
    }


    async function createFile() {
        var file = await createDataForExcel(slabReportData);
        var settings = {
            sheetName: 'Customer Crop Slab Report',
            fileName: 'Customer Crop Slab Report' + ' ' + selectedSearchValues.groupName + ' ' + selectedSearchValues.factoryName + '  ' + selectedSearchValues.startDate + ' - ' + selectedSearchValues.endDate,
            writeOptions: {}
        }
        let keys = Object.keys(file[0])
        let tempcsvHeaders = csvHeaders;
        keys.map((sitem, i) => {
            tempcsvHeaders.push({ label: sitem, value: sitem })
        })
        let dataA = [
            {
                sheet: 'Customer Crop Slab Report',
                columns: tempcsvHeaders,
                content: file
            }
        ]
        xlsx(dataA, settings);
    }

    function calTotal(data) {
        let total = 0;
        data.forEach(element => {
            total += parseFloat(element.cropNetWeight);
        });
        setSlabReportTotal({
            ...slabReportTotal,
            cropNetWeight: total
        });
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        var startDate = moment(searchForm.startDate.toString()).format().split('T')[0]
        var endDate = moment(searchForm.endDate.toString()).format().split('T')[0]
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName:groups[searchForm.groupID],
            factoryName: factories[searchForm.factoryID],
            startDate: [startDate],
            endDate: [endDate]
        })
    }

    function cardTitle(titleName) {
        return (
            <Grid container spacing={1}>
                <Grid item md={10} xs={12}>
                    {titleName}
                </Grid>
            </Grid>
        )
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

    function handleChange(e) {
        const target = e.target;
        const value = target.value
        setFormDetails({
            ...FormDetails,
            [e.target.name]: value
        });
        setSlabReportData([]);
    }

    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: FormDetails.groupID,
                            factoryID: FormDetails.factoryID,
                            slabValue: FormDetails.slabValue,
                            startDate: FormDetails.startDate,
                            endDate: FormDetails.endDate
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
                                slabValue: Yup.number().required('Slab Value is required').min("1", 'Slab Value is required'),
                                startDate: Yup.string(),
                                endDate: Yup.string(),
                            })
                        }
                        onSubmit={() => trackPromise(GetDetails())}
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
                                                    <Grid item md={4} xs={8}>
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
                                                            value={FormDetails.groupID}
                                                            variant="outlined"
                                                            id="groupID"
                                                            size='small'
                                                            disabled={!permissionList.isGroupFilterEnabled}

                                                        >
                                                            <MenuItem value="0">--Select Group--</MenuItem>
                                                            {generateDropDownMenu(groups)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={4} xs={8}>
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
                                                            value={FormDetails.factoryID}
                                                            variant="outlined"
                                                            id="factoryID"
                                                            size='small'
                                                            disabled={!permissionList.isFactoryFilterEnabled}

                                                        >
                                                            <MenuItem value="0">--Select Factory--</MenuItem>
                                                            {generateDropDownMenu(factories)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={4} xs={8}>
                                                        <InputLabel shrink id="slabValue">
                                                            Slab Value *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.slabValue && errors.slabValue)}
                                                            fullWidth
                                                            helperText={touched.slabValue && errors.slabValue}
                                                            name="slabValue"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={FormDetails.slabValue}
                                                            variant="outlined"
                                                            id="slabValue"
                                                            size='small'
                                                        >
                                                            <MenuItem value={'0'}>
                                                                --Select Slab Value--
                                                            </MenuItem>
                                                            <MenuItem value={'1'}>0 - 500</MenuItem>
                                                            <MenuItem value={'2'}>501 - 1000</MenuItem>
                                                            <MenuItem value={'3'}>Greater Than 1000</MenuItem>
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={4} xs={8}>
                                                        <InputLabel shrink id="routeID">
                                                            Route
                                                        </InputLabel>
                                                        <TextField select
                                                            fullWidth
                                                            name="routeID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={FormDetails.routeID}
                                                            variant="outlined"
                                                            id="routeID"
                                                            size='small'
                                                        >
                                                            <MenuItem value="0">--Select Routes--</MenuItem>
                                                            {generateDropDownMenu(routes)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={4} xs={8}>
                                                        <InputLabel shrink id="startDate">
                                                            From Date *
                                                        </InputLabel>
                                                        <TextField
                                                            fullWidth
                                                            name="startDate"
                                                            type='date'
                                                            onChange={(e) => handleChange(e)}
                                                            value={FormDetails.startDate}
                                                            variant="outlined"
                                                            id="startDate"
                                                            size='small'
                                                        />
                                                    </Grid>
                                                    <Grid item md={4} xs={8}>
                                                        <InputLabel shrink id="endDate">
                                                            To Date *
                                                        </InputLabel>
                                                        <TextField
                                                            fullWidth
                                                            name="endDate"
                                                            type='date'
                                                            onChange={(e) => handleChange(e)}
                                                            value={FormDetails.endDate}
                                                            variant="outlined"
                                                            id="endDate"
                                                            size='small'
                                                        />
                                                    </Grid>

                                                </Grid>

                                                <Box display="flex" justifyContent="flex-end" p={2}>
                                                    <Button
                                                        color="primary"
                                                        type="submit"
                                                        variant="contained"
                                                        size='small'
                                                    >
                                                        Search
                                                    </Button>
                                                </Box>

                                                <br />
                                                <Box minWidth={1050}>
                                                    {slabReportData.length > 0 ?
                                                        <TableContainer >
                                                            <Table aria-label="caption table">
                                                                <TableHead>
                                                                    <TableRow>
                                                                        <TableCell align={'center'}>Route</TableCell>
                                                                        <TableCell align={'center'}>Registration Number</TableCell>
                                                                        <TableCell align={'center'}>Supplier Name</TableCell>
                                                                        <TableCell align={'center'}>Crop (KG)</TableCell>
                                                                    </TableRow>
                                                                </TableHead>
                                                                <TableBody>
                                                                    {slabReportData.map((data, index) => (
                                                                        <TableRow key={index}>
                                                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                                {data.routeName}
                                                                            </TableCell>
                                                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                                {data.registrationNumber}
                                                                            </TableCell>
                                                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                                {data.name}
                                                                            </TableCell>
                                                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                                {data.cropNetWeight}
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                                <TableRow>
                                                                    <TableCell align={'center'}><b>Total</b></TableCell>
                                                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                    </TableCell>
                                                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                    </TableCell>
                                                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                        <b> {slabReportTotal.cropNetWeight} </b>
                                                                    </TableCell>
                                                                </TableRow>
                                                            </Table>
                                                        </TableContainer> : null}
                                                </Box>

                                            </CardContent>

                                            {slabReportData.length > 0 ?
                                                <Box display="flex" justifyContent="flex-end" p={2}>
                                                    <Button
                                                        color="primary"
                                                        id="btnRecord"
                                                        type="submit"
                                                        variant="contained"
                                                        style={{ marginRight: '1rem' }}
                                                        className={classes.colorRecord}
                                                        onClick={createFile}
                                                        size='small'
                                                    >
                                                        EXCEL
                                                    </Button>
                                                    <div>&nbsp;</div>
                                                    <ReactToPrint
                                                        documentTitle={"Customer Crop Slab Report"}
                                                        trigger={() => <Button
                                                            color="primary"
                                                            id="btnCancel"
                                                            variant="contained"
                                                            style={{ marginRight: '1rem' }}
                                                            className={classes.colorCancel}
                                                            size='small'
                                                        >
                                                            PDF
                                                        </Button>}
                                                        content={() => componentRef.current}
                                                    />
                                                    <div hidden={true}>
                                                        <CreatePDF ref={componentRef} FormDetails={FormDetails} TotalAmount={slabReportTotal}
                                                            SlabReportSearchData={selectedSearchValues} CropSlabData={slabReportData} />
                                                    </div>
                                                </Box> : null}
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
