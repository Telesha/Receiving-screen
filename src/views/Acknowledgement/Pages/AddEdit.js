import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, CardHeader, MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
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
import tokenService from '../../../utils/tokenDecoder';
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
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
    colorRecord: {
        backgroundColor: "green",
    },
}));

const screenCode = 'ACKNOWLEDGEMENT';

export default function AcknowledgementAddEdit(props) {
    const [title, setTitle] = useState("Acknowledgement Add");
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [statusList, setStatusList] = useState();
    const [sellingMarks, setSellingMarks] = useState([]);
    const [manufactureDetails, setManufactureDetails] = useState([]);
    const [grades, setGrades] = useState([]);
    const [brokers, setBrokers] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [factories, setFactories] = useState();
    const [acknowledgement, setAcknowledgement] = useState({
        groupID: 0,
        factoryID: 0,
        invoiceNo: 0,
        brokerID: 0,
        sellingMarkID: 0,
        noOfPackages: '',
        dateOfDispatch: '',
        fullOrHalf: 0,
        salesNumber: '',
        lotNumber: '',
        gradeID: 0,
        typeOfPack: 0,
        acknowledgement: '',
        dateOfReceived: "",
        manufactureDate: '',
        sellingDate: "",
        grossQuantity: '',
        sampleQuantity: '',
        packNetWeight: '',
        netQuantity: '',
        avarage: '',
        exeedsnorm: '',
        mastervalidation: '',
        isActive: true,
    });
    const [isUpdate, setIsUpdate] = useState(false);
    const [isDisableButton, setIsDisableButton] = useState(false);
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });
    const { teaProductDispatchID } = useParams();
    let decrypted = 0;
    const navigate = useNavigate();
    const alert = useAlert();
    const handleClick = () => {
        navigate('/app/acknowledgement/listing');
    }

    useEffect(() => {
        trackPromise(
            getPermission());
        trackPromise(
            getGroupsForDropdown());
    }, []);

    useEffect(() => {
        trackPromise(
            getFactoriesForDropdown());
        trackPromise(
            getStatusForDropdown());
        trackPromise(
            getSellingMarksForDropdown());
        trackPromise(
            getBrokersForDropdown());
        trackPromise(
            getGradesForDropdown());
    }, [acknowledgement.groupID]);


    useEffect(() => {
        decrypted = atob(teaProductDispatchID);
        if (decrypted != 0) {
            trackPromise(
                getAcknowledgementDetails(decrypted),
                GetManufactureDetailsByID(decrypted),
            )
        }

    }, []);


    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITACKNOWLEDGEMENT');
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
        setAcknowledgement({
            ...acknowledgement,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.GetAllGroups();

        setGroups(groups);
    }

    async function getFactoriesForDropdown() {
        const factories = await services.GetFactoryByGroupID(acknowledgement.groupID);
        setFactories(factories);
    }

    async function getStatusForDropdown() {
        const status = await services.GetAllStatus();
        setStatusList(status);
    }

    async function getSellingMarksForDropdown() {
        const sellingMarks = await services.GetSellingMarkList(acknowledgement.groupID, acknowledgement.factoryID);
        setSellingMarks(sellingMarks);
    }

    async function getBrokersForDropdown() {
        const brokers = await services.GetBrokerList(acknowledgement.groupID, acknowledgement.factoryID);
        setBrokers(brokers);
    }

    async function getGradesForDropdown() {
        const grades = await services.GetGradeDetails(acknowledgement.groupID, acknowledgement.factoryID);
        setGrades(grades);
    }

    async function GetManufactureDetailsByID(teaProductDispatchID) {
        const manufactureDetails = await services.GetManufactureDetailsByID(teaProductDispatchID);
        setManufactureDetails(manufactureDetails);

        manufactureDetails.forEach(x => {
            x.fromDateOfManufaturing = x.fromDateOfManufaturing.split('T')[0];

        });

    }

    async function getAcknowledgementDetails(teaProductDispatchID) {
        let response = await services.GetAcknowladgementDetailsByID(teaProductDispatchID);
        let data = {
            teaProductDispatchID: response.teaProductDispatchID,
            groupID: response.groupID,
            factoryID: response.factoryID,
            manufactureNumber: response.manufactureNumber,
            dateOfDispatch: response.dateofDispatched.split('T')[0],
            manufactureNumber: response.manufactureNumber,
            sellingMarkID: response.sellingMarkID,
            brokerID: response.brokerID,
            invoiceNo: response.invoiceNo,
            gradeID: response.teaGradeID,
            typeOfPack: response.typeOfPack,
            packNo: response.packNo,
            salesNumber: response.salesNumber,
            lotNumber: response.lotNumber,
            avarage: response.avarage,
            natureOfPack: response.natureOfPack,
            noOfPackages: response.noOfPackages,
            packNetWeight: response.packNetWeight,
            manufactureYear: response.manufactureYear,
            manufactureDate: response.manufactureDate.split('T')[0],
            fullOrHalf: response.fullOrHalf,
            vehicleID: response.vehicleID,
            grossQuantity: response.grossQuantity,
            sampleQuantity: response.sampleQuantity,
            netQuantity: response.netQuantity,
            catelogueRevision: response.catelogueRevision,
            dispatchNature: response.dispatchNature,
            mastervalidation: response.status

        };


        setTitle("Edit Acknowledgement");
        setAcknowledgement(data);
    }

    async function updateAcknowledgement() {
        let updateModel = {
            teaProductDispatchID: atob(teaProductDispatchID),
            groupID: parseInt(acknowledgement.groupID),
            factoryID: parseInt(acknowledgement.factoryID),
            dateOfDispatch: acknowledgement.dateOfDispatch,
            sellingMarkID: parseInt(acknowledgement.sellingMarkID),
            brokerID: parseInt(acknowledgement.brokerID),
            invoiceNo: acknowledgement.invoiceNo,
            teaGradeID: parseInt(acknowledgement.gradeID),
            noOfPackages: parseInt(acknowledgement.noOfPackages),
            fullOrHalf: parseInt(acknowledgement.fullOrHalf),
            typeOfPack: acknowledgement.typeOfPack,
            grossQuantity: parseFloat(acknowledgement.grossQuantity),
            sampleQuantity: parseFloat(acknowledgement.sampleQuantity),
            manufactureDate: acknowledgement.manufactureDate,
            manufactureNumber: acknowledgement.manufactureNumber,
            manufactureYear: selectedDate,
            status: acknowledgement.mastervalidation,
            avarage: parseFloat(acknowledgement.avarage),
            sellingDate: acknowledgement.sellingDate,
            dateOfReceived: acknowledgement.dateOfReceived,
            lotNumber: acknowledgement.lotNumber,
            salesNumber: acknowledgement.salesNumber,
            isActive: true

        }

        let response = await services.updateAcknowledgement(updateModel);
        if (response.statusCode == "Success") {
            alert.success(response.message);
            setIsDisableButton(true);
            navigate('/app/acknowledgement/listing');
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
        return items;
    }

    function handleDateChange(date) {
        var month = date.getUTCMonth() + 1;
        var year = date.getUTCFullYear();
        var currentmonth = moment().format('MM');
        setAcknowledgement({
            ...acknowledgement,
            month: month.toString(),
            year: year.toString()
        });

        if (selectedDate != null) {

            var prevMonth = selectedDate.getUTCMonth() + 1
            var prevyear = selectedDate.getUTCFullYear();

            if ((prevyear == year && prevMonth != month) || (prevyear != year)) {
                setSelectedDate(date)

            }
        } else {
            setSelectedDate(date)
        }
    }

    function handleChange(e) {
        const target = e.target;
        const value = target.value

        setAcknowledgement({
            ...acknowledgement,
            [e.target.name]: value
        });
    }


    function settingManufacturNumber(data) {
        return data;
    }

    function settingManufactureDate(data) {
        return data;
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

    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: acknowledgement.groupID,
                            factoryID: acknowledgement.factoryID,
                            invoiceNo: acknowledgement.invoiceNo,
                            brokerID: acknowledgement.brokerID,
                            sellingMarkID: acknowledgement.sellingMarkID,
                            noOfPackages: acknowledgement.noOfPackages,
                            dateOfDispatch: acknowledgement.dateOfDispatch,
                            fullOrHalf: acknowledgement.fullOrHalf,
                            salesNumber: acknowledgement.salesNumber,
                            lotNumber: acknowledgement.lotNumber,
                            gradeID: acknowledgement.gradeID,
                            acknowledgement: acknowledgement.acknowledgement,
                            dateOfReceived: acknowledgement.dateOfReceived,
                            manufactureDate: acknowledgement.manufactureDate,
                            sellingDate: acknowledgement.sellingDate,
                            grossQuantity: acknowledgement.grossQuantity,
                            sampleQuantity: acknowledgement.sampleQuantity,
                            netQuantity: acknowledgement.netQuantity,
                            average: acknowledgement.average,
                            exeedsnorm: acknowledgement.exeedsnorm,
                            mastervalidation: acknowledgement.mastervalidation
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
                                sellingDate: Yup.string().required('SellingDate is required').min("1", 'SellingDate is required'),
                                salesNumber: Yup.string().required('Sales Number is required').nullable(),
                                lotNumber: Yup.string().required('Lot Number is required').nullable(),
                                dateOfReceived: Yup.string().required('Date is required').min("1", 'Date is required'),
                            })
                        }
                        onSubmit={(event) => trackPromise(updateAcknowledgement(event))}
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
                                                            value={acknowledgement.groupID}
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
                                                            value={acknowledgement.factoryID}
                                                            variant="outlined"
                                                            size='small'
                                                            id="factoryID"
                                                            InputProps={{
                                                                readOnly: true
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Factory--</MenuItem>
                                                            {generateDropDownMenu(factories)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="dateOfDispatch">
                                                            Date of Dispatched *
                                                        </InputLabel>
                                                        <TextField
                                                            fullWidth
                                                            name="dateOfDispatch"
                                                            type="date"
                                                            onChange={(e) => handleChange(e)}
                                                            value={acknowledgement.dateOfDispatch}
                                                            variant="outlined"
                                                            id="dateOfDispatch"
                                                            size='small'
                                                            InputProps={{
                                                                readOnly: true
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                            <DatePicker
                                                                autoOk
                                                                variant="inline"
                                                                openTo="month"
                                                                views={["year"]}
                                                                label="Year *"
                                                                helperText="Select applicable Year"
                                                                value={selectedDate}
                                                                size='small'
                                                                disableFuture={true}
                                                                readOnly={true}
                                                                onChange={(date) => handleDateChange(date)}
                                                            />
                                                        </MuiPickersUtilsProvider>
                                                    </Grid>
                                                </Grid>
                                                <Grid container spacing={4}>

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
                                                            value={acknowledgement.sellingMarkID}
                                                            variant="outlined"
                                                            id="sellingMarkID"
                                                            size='small'
                                                            InputProps={{
                                                                readOnly: true
                                                            }}
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
                                                            onChange={(e) => {
                                                                handleChange(e)
                                                            }}
                                                            value={acknowledgement.brokerID}
                                                            variant="outlined"
                                                            size='small'
                                                            id="brokerID"
                                                            InputProps={{
                                                                readOnly: true
                                                            }}
                                                        >
                                                            <MenuItem value={'0'}>
                                                                --Select Broker--
                                                            </MenuItem>
                                                            {generateDropDownMenu(brokers)}
                                                        </TextField>
                                                    </Grid>
                                                </Grid>
                                                <br>
                                                </br>
                                                <Divider />
                                                <br>
                                                </br>
                                                <Grid container spacing={4}>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="invoiceNo">
                                                            Invoice Number
                                                        </InputLabel>
                                                        <TextField
                                                            fullWidth
                                                            name="invoiceNo"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={acknowledgement.invoiceNo}
                                                            variant="outlined"
                                                            size='small'
                                                            InputProps={{
                                                                readOnly: true
                                                            }}>

                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="gradeID">
                                                            Grade *
                                                        </InputLabel>

                                                        <TextField select
                                                            fullWidth
                                                            name="gradeID"
                                                            onChange={(e) => {
                                                                handleChange(e)
                                                            }}
                                                            value={acknowledgement.gradeID}
                                                            variant="outlined"
                                                            id="gradeID"
                                                            size='small'
                                                            InputProps={{
                                                                readOnly: true
                                                            }}
                                                        >
                                                            <MenuItem value={'0'}>
                                                                --Select Grade--
                                                            </MenuItem>
                                                            {generateDropDownMenu(grades)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="fullOrHalf">
                                                            Full/Half
                                                        </InputLabel>

                                                        <TextField select
                                                            fullWidth
                                                            name="fullOrHalf"
                                                            onChange={(e) => {
                                                                handleChange(e)
                                                            }}
                                                            value={acknowledgement.fullOrHalf}
                                                            variant="outlined"
                                                            size='small'
                                                            id="fullOrHalf"
                                                            InputProps={{
                                                                readOnly: true
                                                            }}
                                                        >
                                                            <MenuItem value={'0'}>
                                                                --Select Full/Half--
                                                            </MenuItem>
                                                            <MenuItem value={'1'}>Full</MenuItem>
                                                            <MenuItem value={'2'}>Half</MenuItem>
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="typeOfPack">
                                                            Type Of Pack *
                                                        </InputLabel>

                                                        <TextField select
                                                            fullWidth
                                                            name="typeOfPack"
                                                            onChange={(e) => {
                                                                handleChange(e)
                                                            }}
                                                            value={acknowledgement.typeOfPack}
                                                            variant="outlined"
                                                            size='small'
                                                            id="typeOfPack"
                                                            InputProps={{
                                                                readOnly: true
                                                            }}
                                                        >
                                                            <MenuItem value={'0'}>
                                                                --Select Type Of Pack--
                                                            </MenuItem>
                                                            <MenuItem value={'1'}>CHEST</MenuItem>
                                                            <MenuItem value={'2'}>DJ-MWPS</MenuItem>
                                                            <MenuItem value={'3'}>MWPS</MenuItem>
                                                            <MenuItem value={'4'}>PS</MenuItem>
                                                            <MenuItem value={'5'}>SPBS</MenuItem>
                                                        </TextField>
                                                    </Grid>

                                                </Grid>
                                                <Grid container spacing={4}>

                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="packNetWeight">
                                                            Pack Net Weight *
                                                        </InputLabel>
                                                        <TextField
                                                            fullWidth
                                                            name="packNetWeight"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={acknowledgement.packNetWeight}
                                                            variant="outlined"
                                                            size='small'
                                                            InputProps={{
                                                                readOnly: true
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="noOfPackages">
                                                            No of Packages *
                                                        </InputLabel>
                                                        <TextField
                                                            fullWidth
                                                            name="noOfPackages"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={acknowledgement.noOfPackages}
                                                            variant="outlined"
                                                            size='small'
                                                            InputProps={{
                                                                readOnly: true
                                                            }} >
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="grossQuantity">
                                                            Gross Amount (KG) *
                                                        </InputLabel>
                                                        <TextField
                                                            fullWidth
                                                            name="grossQuantity"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={acknowledgement.grossQuantity}
                                                            variant="outlined"
                                                            size='small'
                                                            InputProps={{
                                                                readOnly: true
                                                            }} >
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="sampleQuantity">
                                                            Sample Amount (KG) *
                                                        </InputLabel>
                                                        <TextField
                                                            fullWidth
                                                            name="sampleQuantity"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={acknowledgement.sampleQuantity}
                                                            variant="outlined"
                                                            size='small'
                                                            InputProps={{
                                                                readOnly: true
                                                            }} >
                                                        </TextField>
                                                    </Grid>
                                                </Grid>
                                                <Grid container spacing={4}>

                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="netQuantity">
                                                            Net Amount (KG) *
                                                        </InputLabel>
                                                        <TextField
                                                            fullWidth
                                                            name="netQuantity"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={acknowledgement.netQuantity}
                                                            variant="outlined"
                                                            size='small'
                                                            InputProps={{
                                                                readOnly: true
                                                            }} >
                                                        </TextField>
                                                    </Grid>
                                                </Grid>

                                                <Card hidden={true}>
                                                    <br>
                                                    </br>
                                                    <TableContainer  >
                                                        <Table className={classes.table} aria-label="caption table">
                                                            <TableHead >
                                                                <TableRow>
                                                                    <TableCell align={'center'}>Manufacture Number</TableCell>
                                                                    <TableCell align={'center'}>Manufacture Date</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {manufactureDetails.map((rowData, index) => (
                                                                    <TableRow key={index}>
                                                                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                            {settingManufacturNumber(rowData.manufactureNumber)}
                                                                        </TableCell>
                                                                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                            {settingManufactureDate(rowData.fromDateOfManufaturing)}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}

                                                            </TableBody>
                                                        </Table>
                                                    </TableContainer>
                                                </Card>
                                                <br>
                                                </br>
                                                <br>
                                                </br>
                                                <Divider />
                                                <br>
                                                </br>
                                                <Grid container spacing={4}>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="sellingDate">
                                                            Selling Date *
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.sellingDate && errors.sellingDate)}
                                                            fullWidth
                                                            helperText={touched.sellingDate && errors.sellingDate}
                                                            name="sellingDate"
                                                            type="date"
                                                            onChange={(e) => handleChange(e)}
                                                            value={acknowledgement.sellingDate}
                                                            variant="outlined"
                                                            id="sellingDate"
                                                            size='small'
                                                        />
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="salesNumber">
                                                            Sales No *
                                                        </InputLabel>
                                                        <TextField
                                                            fullWidth
                                                            error={Boolean(touched.salesNumber && errors.salesNumber)}
                                                            helperText={touched.salesNumber && errors.salesNumber}
                                                            name="salesNumber"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={acknowledgement.salesNumber}
                                                            size='small'
                                                            variant="outlined" >
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="lotNumber">
                                                            Lot No *
                                                        </InputLabel>
                                                        <TextField
                                                            fullWidth
                                                            error={Boolean(touched.lotNumber && errors.lotNumber)}
                                                            helperText={touched.lotNumber && errors.lotNumber}
                                                            name="lotNumber"
                                                            type="number"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={acknowledgement.lotNumber}
                                                            size='small'
                                                            variant="outlined"
                                                        />
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="dateOfReceived">
                                                            Date *
                                                        </InputLabel>
                                                        <TextField
                                                            fullWidth
                                                            error={Boolean(touched.dateOfReceived && errors.dateOfReceived)}
                                                            helperText={touched.dateOfReceived && errors.dateOfReceived}
                                                            name="dateOfReceived"
                                                            type="date"
                                                            onChange={(e) => handleChange(e)}
                                                            value={acknowledgement.dateOfReceived}
                                                            variant="outlined"
                                                            size='small'
                                                            id="dateOfReceived"
                                                        />
                                                    </Grid>
                                                </Grid>
                                                <Grid container spacing={4}>
                                                </Grid>
                                            </CardContent>
                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                <div>&nbsp;</div>

                                                <Button
                                                    color="primary"
                                                    disabled={isSubmitting || isDisableButton}
                                                    type="submit"
                                                    variant="contained"
                                                    size='small'
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

