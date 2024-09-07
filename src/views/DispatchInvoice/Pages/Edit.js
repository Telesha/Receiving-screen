import React, { useState, useEffect, Fragment, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, CardHeader, MenuItem, Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from "yup";
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
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
    },
    colorCancel: {
        backgroundColor: "red",
    },
    colorRecord: {
        backgroundColor: "green",
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 200,
    },
}));

const screenCode = 'DISPATCHINVOICE';

export default function DispatchInvoiceEdit(props) {
    const [title, setTitle] = useState("View Dispatch Invoice");
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [brokers, setBrokers] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [sellingMarks, setSellingMarks] = useState([]);
    const [manufactureNumbers, setManufactureNumbers] = useState([]);
    const [sampleQuantity, setSampleQuantity] = useState();
    const [grades, setGrades] = useState();
    const [factories, setFactories] = useState();
    const [dipatchInv, setDispatchInv] = useState({
        groupID: 0,
        factoryID: 0,
        batchNo: "",
        factoryCode: 0,
        dateOfDispatched: new Date(),
        natureOfDispatch: 0,
        manufactureNumber: 0,
        sellingMarkID: 0,
        brokerID: 0,
        invoiceNo: "",
        teaGradeID: 0,
        salesTypeID: 0,
        noOfPackages: '',
        dispatchQty: 0,
        fullOrHalf: 0,
        manufactureYear: "",
        typeOfPack: 0,
        packNo: "",
        packNetWeight: '',
        grossQuantity: '',
        netQuantity: '',
        dispatchCondt: "",
        manufactureDate: "",
        vehicleID: 0,
        sampleQuantity: "",
        isActive: true,
        packWeight: '',
        grossWeight: '',
        sampleQuantity: '',
        // numberOfBag: '',
        dispatchYear: new Date()
    });
    const agriGenERPEnum = new AgriGenERPEnum();
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
        isViewApproveEnabled: false
    });
    const [manufactureDetailList, setManufactureDetailList] = useState([]);
    const [manufactureDate, setManufactureDate] = useState([]);
    const { teaProductDispatchID } = useParams();
    let decrypted = 0;
    const navigate = useNavigate();
    const alert = useAlert();
    const handleClick = () => {
        navigate('/app/dispatchInvoice/listing');
    }

    useEffect(() => {
        trackPromise(
            getPermission());
        trackPromise(
            getGroupsForDropdown());

    }, []);

    useEffect(() => {
        if (dipatchInv.groupID !== 0) {
            trackPromise(
                getFactoriesForDropdown());
        }
    }, [dipatchInv.groupID]);

    useEffect(() => {
        if (dipatchInv.factoryID !== 0) {
            trackPromise(
                getBrokersForDropdown(),
                getVehiclesForDropdown(),
                getSellingMarksForDropdown(),
                getGradesForDropdown(),
            );
        }
    }, [dipatchInv.groupID], [dipatchInv.factoryID]);

    useEffect(() => {
        if (dipatchInv.factoryID !== 0) {
            trackPromise(
                GetFactoryCodeByFactoryID()
            )
        }
    }, [dipatchInv.factoryID]);

    useEffect(() => {
        if (dipatchInv.teaGradeID !== 0) {
            trackPromise(
                getManufactureNumbersForDropdown());
        }
    }, [dipatchInv.teaGradeID]);

    useEffect(() => {
        if (dipatchInv.teaGradeID !== 0) {
            trackPromise(
                getSampleValueByGradeID());
        }
    }, [dipatchInv.teaGradeID]);

    useEffect(() => {
        if (dipatchInv.manufactureNumber !== 0) {
            trackPromise(
                GetManufactureDateByManufactureNumber());
        }
    }, [dipatchInv.manufactureNumber]);

    useEffect(() => {
        decrypted = atob(teaProductDispatchID);
        if (decrypted !== 0) {
            trackPromise(
                getDispatchInvoiceDetails(decrypted),
                GetDispatchList(decrypted),
            )
        }
    }, []);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'ADDDISPATCHINVOICE');
        if (isAuthorized === undefined) {
            navigate('/404');
        }
        var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
        var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');
        var isViewApproveEnabled = permissions.find(p => p.permissionCode == 'VIEWDISPATCHINVOICEAPPROVE');

        setPermissions({
            ...permissionList,
            isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
            isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
            isViewApproveEnabled: isViewApproveEnabled !== undefined
        });

    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getFactoriesForDropdown() {
        const factories = await services.getFactoryByGroupID(dipatchInv.groupID);
        setFactories(factories);
    }

    async function getBrokersForDropdown() {
        const brokers = await services.GetBrokerList(dipatchInv.groupID, dipatchInv.factoryID);
        setBrokers(brokers);
    }

    async function getGradesForDropdown() {
        const grades = await services.GetGradeDetails(dipatchInv.groupID, dipatchInv.factoryID);
        setGrades(grades);

    }

    async function getVehiclesForDropdown() {
        const vehicles = await services.GetVehicleList(dipatchInv.groupID, dipatchInv.factoryID);
        setVehicles(vehicles);
    }

    async function getSellingMarksForDropdown() {
        const sellingMarks = await services.GetSellingMarkList(dipatchInv.groupID, dipatchInv.factoryID);
        setSellingMarks(sellingMarks);
    }

    async function GetManufactureDateByManufactureNumber() {
        const response = await services.GetManufactureDateByManufactureNumber(dipatchInv.manufactureNumber);
        setManufactureDate(response.fromDateOfManufaturing.split('T')[0]);
    }

    async function GetFactoryCodeByFactoryID() {
        const response = await services.getFactoryCodeByFactoryID(dipatchInv.factoryID);
        setDispatchInv({
            ...dipatchInv,
            factoryCode: response.factoryCode
        })
    }

    async function getManufactureNumbersForDropdown() {
        let data = await services.GetManufactureNumbersByGradeID(dipatchInv.teaGradeID);
        var options = []
        for (let item of Object.entries(data)) {
            options[item[1]["manufactureNumber"]] = item[1]["manufactureNumber"];
        }
        setManufactureNumbers(options);
    }

    async function getSampleValueByGradeID() {
        const response = await services.GetSampleValueByGradeID(dipatchInv.teaGradeID);
        setSampleQuantity(response.sampleAllowance);
    }

    async function GetDispatchList(teaProductDispatchID) {
        let response = await services.GetDispatchList(teaProductDispatchID);
        setManufactureDetailList(manufactureDetailList);
    }

    async function getDispatchInvoiceDetails(teaProductDispatchID) {
        let response = await services.GetDispatchInvoiceDetailsByID(teaProductDispatchID);
        let data = {
            teaProductDispatchID: response.teaProductDispatchID,
            groupID: response.groupID,
            factoryID: response.factoryID,
            dateOfDispatched: response.dateofDispatched.split('T')[0],
            sellingMarkID: response.sellingMarkID,
            brokerID: response.brokerID,
            invoiceNo: response.invoiceNo,
            manufactureYear: response.manufactureYear,
            vehicleID: response.vehicleID,
            natureOfDispatch: response.dispatchNature,
            teaGradeID: response.teaGradeID,
            fullOrHalf: response.fullOrHalf,
            typeOfPack: response.typeOfPack,
            packNetWeight: response.packNetWeight,
            noOfPackages: response.noOfPackages,
            grossQuantity: response.grossQuantity,
            sampleQuantity: response.sampleQuantity,
            netQuantity: response.netQuantity,
            dispatchInvoiceApproval: response.dispatchInvoiceApproval,
            packWeight: response.packWeight,
            // numberOfBag: response.numberOfBag,
            dispatchYear: response.dispatchYear
        }
        setDispatchInv(data);
    }

    async function Approve() {
        let updateModel = {
            teaProductDispatchID: atob(teaProductDispatchID),
            dispatchInvoiceApproval: 2
        }
        let response = await services.updateDispatchInvoice(updateModel);
        if (response.statusCode == "Success") {
            alert.success(response.message);
            navigate('/app/dispatchInvoice/listing');
        }
        else {
            alert.error(response.message);
        }
    }

    async function Reject() {
        let updateModel = {
            teaProductDispatchID: atob(teaProductDispatchID),
            dispatchInvoiceApproval: 3
        }
        let response = await services.updateDispatchInvoice(updateModel);
        alert.error(response.message);
        navigate('/app/dispatchInvoice/listing');

    }

    function generateDropDownMenu(data) {
        let items = []
        if (data != null) {
            for (const [key, value] of Object.entries(data)) {
                items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
            }
        }
        return items;
    }

    function handleChange(e) {
        const target = e.target;
        const value = target.value
        setDispatchInv({
            ...dipatchInv,
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
                    />
                </Grid>
            </Grid>
        )
    }

    function settingManufactureNumber(data) {
        return data;
    }
    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: dipatchInv.groupID,
                            factoryID: dipatchInv.factoryID,
                            batchNo: dipatchInv.batchNo,
                            dateOfDispatched: dipatchInv.dateOfDispatched,
                            manufactureNumber: dipatchInv.manufactureNumber,
                            sellingMarkID: dipatchInv.sellingMarkID,
                            brokerID: dipatchInv.brokerID,
                            invoiceNo: dipatchInv.invoiceNo,
                            gradeID: dipatchInv.gradeID,
                            noOfPackages: dipatchInv.noOfPackages,
                            fullOrHalf: dipatchInv.fullOrHalf,
                            typeofPack: dipatchInv.typeOfPack,
                            packNo: dipatchInv.packNo,
                            packNetWeight: dipatchInv.packNetWeight,
                            grossQuantity: dipatchInv.grossQuantity,
                            sampleQuantity: dipatchInv.sampleQuantity,
                            netQuantity: dipatchInv.netQuantity,
                            manufactureYear: dipatchInv.manufactureYear,
                            manufactureDate: dipatchInv.manufactureDate,
                            vehicleID: dipatchInv.vehicleID,
                            teaGradeID: dipatchInv.teaGradeID,

                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required')
                            })
                        }
                        enableReinitialize
                    >
                        {({
                            errors,
                            handleBlur,
                            handleSubmit,
                            isSubmitting,
                            touched,
                            values,
                            props
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
                                                <Grid container spacing={4}>
                                                    <Grid item md={3} xs={12}>
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
                                                            value={dipatchInv.groupID}
                                                            variant="outlined"
                                                            id="groupID"
                                                            size='small'
                                                            InputProps={{
                                                                readOnly: true
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Group--</MenuItem>
                                                            {generateDropDownMenu(groups)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
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
                                                            value={dipatchInv.factoryID}
                                                            variant="outlined"
                                                            id="factoryID"
                                                            size='small'
                                                            InputProps={{
                                                                readOnly: true
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Factory--</MenuItem>
                                                            {generateDropDownMenu(factories)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="dateOfDispatched">
                                                            Date of Dispatched *
                                                        </InputLabel>
                                                        <TextField
                                                            fullWidth
                                                            name="dateOfDispatched"
                                                            type="date"
                                                            onChange={(e) => handleChange(e)}
                                                            InputProps={{
                                                                readOnly: true
                                                            }}
                                                            value={dipatchInv.dateOfDispatched}
                                                            variant="outlined"
                                                            id="dateOfDispatched"
                                                            size='small'
                                                        />
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="dispatchYear">
                                                            Dispatch Year *
                                                        </InputLabel>
                                                        <TextField
                                                            fullWidth
                                                            name="dispatchYear"
                                                            InputProps={{
                                                                readOnly: true
                                                            }}
                                                            value={dipatchInv.dispatchYear}
                                                            variant="outlined"
                                                            id="dispatchYear"
                                                            size='small'
                                                        />
                                                    </Grid>
                                                </Grid>

                                                <Grid container spacing={4}>

                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="factoryCode">
                                                            Factory Code
                                                        </InputLabel>
                                                        <TextField
                                                            fullWidth
                                                            error={Boolean(touched.factoryCode && errors.factoryCode)}
                                                            helperText={touched.factoryCode && errors.factoryCode}
                                                            name="factoryCode"
                                                            onBlur={handleBlur}
                                                            value={dipatchInv.factoryCode}
                                                            size='small'
                                                            variant="outlined"
                                                            InputProps={{
                                                                readOnly: true
                                                            }}
                                                        >
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="sellingMarkID">
                                                            Selling Mark *
                                                        </InputLabel>

                                                        <TextField select
                                                            fullWidth
                                                            name="sellingMarkID"
                                                            onChange={(e) => {
                                                                handleChange(e)
                                                            }}
                                                            value={dipatchInv.sellingMarkID}
                                                            InputProps={{
                                                                readOnly: true
                                                            }}
                                                            variant="outlined"
                                                            id="sellingMarkID"
                                                            size='small'
                                                        >
                                                            <MenuItem value={'0'}>
                                                                --Select Selling Mark--
                                                            </MenuItem>
                                                            {generateDropDownMenu(sellingMarks)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="brokerID">
                                                            Broker Name *
                                                        </InputLabel>

                                                        <TextField select
                                                            fullWidth
                                                            name="brokerID"
                                                            size='small'
                                                            onChange={(e) => {
                                                                handleChange(e)
                                                            }}
                                                            value={dipatchInv.brokerID}
                                                            InputProps={{
                                                                readOnly: true
                                                            }}
                                                            variant="outlined"
                                                            id="brokerID">
                                                            <MenuItem value={'0'}>
                                                                --Select Broker Name--
                                                            </MenuItem>
                                                            {generateDropDownMenu(brokers)}

                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="vehicleID">
                                                            Vehicle Number *
                                                        </InputLabel>
                                                        <TextField select
                                                            fullWidth
                                                            size='small'
                                                            name="vehicleID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={dipatchInv.vehicleID}
                                                            InputProps={{
                                                                readOnly: true
                                                            }}
                                                            variant="outlined" >
                                                            <MenuItem value={'0'}>
                                                                --Select Vehicle Number--
                                                            </MenuItem>
                                                            {generateDropDownMenu(vehicles)}
                                                        </TextField>
                                                    </Grid>

                                                </Grid>
                                                <br />
                                                <br />
                                                <Divider />
                                                <br /><br />
                                                <Card style={{ padding: 20, marginTop: 20 }}>
                                                    <Grid container spacing={4}>
                                                        <Grid item md={3} xs={12}>
                                                            <InputLabel shrink id="invoiceNo">
                                                                Invoice No *
                                                            </InputLabel>
                                                            <TextField
                                                                fullWidth
                                                                size='small'
                                                                name="invoiceNo"
                                                                onBlur={handleBlur}
                                                                InputProps={{
                                                                    readOnly: true
                                                                }}
                                                                onChange={(e) => handleChange(e)}
                                                                value={dipatchInv.invoiceNo}
                                                                variant="outlined" >
                                                            </TextField>
                                                        </Grid>

                                                        <Grid item md={3} xs={12}>
                                                            <InputLabel shrink id="teaGradeID">
                                                                Grade *
                                                            </InputLabel>

                                                            <TextField select
                                                                fullWidth
                                                                size='small'
                                                                name="teaGradeID"
                                                                onChange={(e) => {
                                                                    handleChange(e)
                                                                }}
                                                                value={dipatchInv.teaGradeID}
                                                                InputProps={{
                                                                    readOnly: true
                                                                }}
                                                                variant="outlined"
                                                                id="teaGradeID"
                                                            >
                                                                <MenuItem value={'0'}>
                                                                    --Select Grade--
                                                                </MenuItem>
                                                                {generateDropDownMenu(grades)}

                                                            </TextField>
                                                        </Grid>
                                                    </Grid>
                                                    <CardContent >
                                                        <Card style={{ padding: 20, marginTop: 20 }}>
                                                            <TableContainer hidden={true}>
                                                                <Table className={classes.table} aria-label="caption table">
                                                                    <TableHead>
                                                                        <TableRow>
                                                                            <TableCell>Manufacture Number</TableCell>
                                                                            <TableCell>Fully Utiliesed</TableCell>
                                                                        </TableRow>
                                                                    </TableHead>
                                                                    <TableBody>
                                                                        {manufactureDetailList.map((rowData, index) => (
                                                                            <TableRow key={index}>
                                                                                <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                                    {settingManufactureNumber(rowData.manufactureNumber)}
                                                                                </TableCell>
                                                                                <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                                    <input type="checkbox"
                                                                                        defaultChecked
                                                                                        disabled={true}
                                                                                    />
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        ))}

                                                                    </TableBody>
                                                                </Table>
                                                            </TableContainer>
                                                            <br />
                                                            <Divider hidden={true} />
                                                            <br /><br />
                                                            <Grid container spacing={4}>

                                                                <Grid item md={3} xs={12}>
                                                                    <InputLabel shrink id="fullOrHalf">
                                                                        Full / Half
                                                                    </InputLabel>

                                                                    <TextField select
                                                                        fullWidth
                                                                        size='small'
                                                                        name="fullOrHalf"
                                                                        onChange={(e) => {
                                                                            handleChange(e)
                                                                        }}
                                                                        value={dipatchInv.fullOrHalf}
                                                                        InputProps={{
                                                                            readOnly: true
                                                                        }}
                                                                        variant="outlined"
                                                                        id="fullOrHalf"
                                                                    >
                                                                        <MenuItem value={'0'}>
                                                                            --Select  Full / Half--
                                                                        </MenuItem>
                                                                        <MenuItem value={'1'}>Full</MenuItem>
                                                                        <MenuItem value={'2'}>Half</MenuItem>
                                                                    </TextField>
                                                                </Grid>
                                                                <Grid item md={3} xs={12}>
                                                                    <InputLabel shrink id="typeOfPack">
                                                                        Types Of Packs *
                                                                    </InputLabel>
                                                                    <TextField select
                                                                        error={Boolean(touched.typeOfPack && errors.typeOfPack)}
                                                                        fullWidth
                                                                        size='small'
                                                                        helperText={touched.typeOfPack && errors.typeOfPack}
                                                                        name="typeOfPack"
                                                                        onBlur={handleBlur}
                                                                        onChange={(e) => handleChange(e)}
                                                                        InputProps={{
                                                                            readOnly: true
                                                                        }}
                                                                        value={dipatchInv.typeOfPack}
                                                                        variant="outlined"
                                                                        id="typeOfPack"
                                                                    >
                                                                        <MenuItem value="0">--Select Types Of Packs--</MenuItem>
                                                                        <MenuItem value="1">CHEST</MenuItem>
                                                                        <MenuItem value="2">DJ-MWPS</MenuItem>
                                                                        <MenuItem value="3">MWPS</MenuItem>
                                                                        <MenuItem value="4">PS</MenuItem>
                                                                        <MenuItem value="5">SPBS</MenuItem>

                                                                    </TextField>
                                                                </Grid>
                                                                <Grid item md={3} xs={12}>
                                                                    <InputLabel shrink id="noOfPackages">
                                                                        No Of Packages *
                                                                    </InputLabel>
                                                                    <TextField
                                                                        fullWidth
                                                                        error={Boolean(touched.noOfPackages && errors.noOfPackages)}
                                                                        helperText={touched.noOfPackages && errors.noOfPackages}
                                                                        name="noOfPackages"
                                                                        type='number'
                                                                        onBlur={handleBlur}
                                                                        onChange={(e) => handleChange(e)}
                                                                        value={dipatchInv.noOfPackages}
                                                                        size='small'
                                                                        variant="outlined"
                                                                    />
                                                                </Grid>
                                                                <Grid item md={3} xs={12}>
                                                                    <InputLabel shrink id="packWeight">
                                                                        Pack Weight *
                                                                    </InputLabel>
                                                                    <TextField
                                                                        fullWidth
                                                                        error={Boolean(touched.packWeight && errors.packWeight)}
                                                                        helperText={touched.packWeight && errors.packWeight}
                                                                        name="packWeight"
                                                                        type='number'
                                                                        onBlur={handleBlur}
                                                                        onChange={(e) => handleChange(e)}
                                                                        value={dipatchInv.packWeight}
                                                                        size='small'
                                                                        variant="outlined"
                                                                    />
                                                                </Grid>
                                                            </Grid>
                                                            <Grid container spacing={4}>
                                                                <Grid item md={3} xs={12}>
                                                                    <InputLabel shrink id="grossQuantity">
                                                                        Gross Weight (KG) *
                                                                    </InputLabel>
                                                                    <TextField
                                                                        fullWidth
                                                                        error={Boolean(touched.grossQuantity && errors.grossQuantity)}
                                                                        helperText={touched.grossQuantity && errors.grossQuantity}
                                                                        name="grossQuantity"
                                                                        type='number'
                                                                        onBlur={handleBlur}
                                                                        onChange={(e) => handleChange(e)}
                                                                        value={dipatchInv.grossQuantity}
                                                                        size='small'
                                                                        variant="outlined" >
                                                                    </TextField>
                                                                </Grid>


                                                                <Grid item md={3} xs={12}>
                                                                    <InputLabel shrink id="sampleQuantity">
                                                                        Sample Qty (KG) *
                                                                    </InputLabel>
                                                                    <TextField
                                                                        fullWidth
                                                                        size='small'
                                                                        name="sampleQuantity"
                                                                        onBlur={handleBlur}
                                                                        onChange={(e) => handleChange(e)}
                                                                        InputProps={{
                                                                            readOnly: true
                                                                        }}
                                                                        value={dipatchInv.sampleQuantity}
                                                                        variant="outlined" >

                                                                    </TextField>
                                                                </Grid>

                                                                <Grid item md={3} xs={12}>
                                                                    <InputLabel shrink id="netQuantity">
                                                                        Net Qty (KG) *
                                                                    </InputLabel>
                                                                    <TextField
                                                                        fullWidth
                                                                        name="netQuantity"
                                                                        type='number'
                                                                        size='small'
                                                                        onBlur={handleBlur}
                                                                        onChange={(e) => handleChange(e)}
                                                                        InputProps={{
                                                                            readOnly: true
                                                                        }}
                                                                        value={dipatchInv.netQuantity}
                                                                        variant="outlined" >
                                                                    </TextField>
                                                                </Grid>

                                                                <Grid item md={3} xs={12}>
                                                                    <InputLabel shrink id="natureOfDispatch">
                                                                        Nature Of Dispatch
                                                                    </InputLabel>
                                                                    <TextField select
                                                                        error={Boolean(touched.natureOfDispatch && errors.natureOfDispatch)}
                                                                        fullWidth
                                                                        helperText={touched.natureOfDispatch && errors.natureOfDispatch}
                                                                        name="natureOfDispatch"
                                                                        onBlur={handleBlur}
                                                                        onChange={(e) => handleChange(e)}
                                                                        value={dipatchInv.natureOfDispatch}
                                                                        variant="outlined"
                                                                        size='small'
                                                                        id="natureOfDispatch"
                                                                        InputProps={{
                                                                            readOnly: true
                                                                        }}
                                                                    >
                                                                        <MenuItem value="0">--Select Nature Of Dispatch--</MenuItem>
                                                                        <MenuItem value="1">Incomplete</MenuItem>
                                                                        <MenuItem value="2">Complete</MenuItem>
                                                                        <MenuItem value="3">Invoice</MenuItem>
                                                                    </TextField>
                                                                </Grid>
                                                            </Grid>

                                                            {/* <Grid container spacing={4}>
                                                                <Grid item md={3} xs={12}>
                                                                    <InputLabel shrink id="numberOfBag">
                                                                        Number of Bag
                                                                    </InputLabel>
                                                                    <TextField
                                                                        fullWidth
                                                                        error={Boolean(touched.numberOfBag && errors.numberOfBag)}
                                                                        helperText={touched.numberOfBag && errors.numberOfBag}
                                                                        name="numberOfBag"
                                                                        type='number'
                                                                        onBlur={handleBlur}
                                                                        onChange={(e) => handleChange(e)}
                                                                        value={dipatchInv.numberOfBag}
                                                                        size='small'
                                                                        variant="outlined"
                                                                        InputProps={{
                                                                            readOnly: true
                                                                        }}
                                                                    />
                                                                </Grid>
                                                            </Grid> */}

                                                            <br />
                                                            <br />
                                                            <Divider />
                                                            <br /><br />
                                                        </Card>
                                                    </CardContent>
                                                </Card>
                                            </CardContent>

                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                {permissionList.isViewApproveEnabled && dipatchInv.dispatchInvoiceApproval == agriGenERPEnum.DispatchInvoiceApproval.SendToApprove ? (
                                                    <>
                                                        <Button
                                                            color="primary"
                                                            variant="contained"
                                                            onClick={Approve}
                                                            size='small'
                                                            className={classes.colorRecord}
                                                        >
                                                            Approve
                                                        </Button>
                                                        <div>&nbsp;</div>

                                                        <Button
                                                            color="primary"
                                                            variant="contained"
                                                            onClick={Reject}
                                                            size='small'
                                                            className={classes.colorCancel}
                                                        >
                                                            Reject
                                                        </Button></>
                                                ) : null
                                                }
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

