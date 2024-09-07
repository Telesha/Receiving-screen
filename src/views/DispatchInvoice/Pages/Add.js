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
import tokenService from '../../../utils/tokenDecoder';
import { KeyboardDatePicker } from "@material-ui/pickers";
import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import moment from 'moment';
import DeleteIcon from '@material-ui/icons/Delete';
import ReactToPrint from "react-to-print";
import CreatePDF from './CreatePDF';

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

export default function DispatchInvoiceAdd(props) {
    const [title, setTitle] = useState("Add Dispatch Invoice");
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [brokers, setBrokers] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [sellingMarks, setSellingMarks] = useState([]);
    const [manufactureNumbers, setManufactureNumbers] = useState([]);
    const [sampleQuantity, setSampleQuantity] = useState();
    const [grades, setGrades] = useState();
    const [factories, setFactories] = useState();
    const [handleNoOfBags, setHandleNoOfBags] = useState(false);
    const [selectedDate, handleDateChange] = useState(new Date().toISOString());
    const [names, setNames] = useState({});
    const componentRef = useRef();
    const [dipatchInv, setDispatchInv] = useState({
        groupID: 0,
        factoryID: 0,
        batchNo: "",
        factoryCode: 0,
        dateOfDispatched: new Date(),
        natureOfDispatch: 3,
        manufactureNumber: '',
        sellingMarkID: 0,
        brokerID: 0,
        invoiceNo: "",
        teaGradeID: 0,
        salesTypeID: 0,
        noOfPackages: '',
        dispatchQty: 0,
        fullOrHalf: 1,
        manufactureYear: "",
        typeOfPack: 0,
        packNo: "",
        packNetWeight: '',
        grossQuantity: '',
        netQuantity: '',
        dispatchCondt: "",
        manufactureDate: '',
        vehicleID: 0,
        sampleQuantity: "",
        isActive: true,
        packWeight: '',
        sampleQuantity: '',
        //numberOfBag: '',
        dispatchInvoiceApproval: 0
    });

    const [isUpdate, setIsUpdate] = useState(false);
    const [isDisableButton, setIsDisableButton] = useState(true);
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
        isViewApproveEnabled: false
    });
    const [dispatchList, setDispatchList] = useState([]);
    const [manufactureDetailList, setManufactureDetailList] = useState([]);
    const [selectedSearchValues, setSelectedSearchValueS] = useState([]);
    const [manufactureDate, setManufactureDate] = useState([]);
    const [netQuantity, setNetQuantity] = useState([])
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
        trackPromise(
            getFactoriesForDropdown());
    }, [dipatchInv.groupID]);

    useEffect(() => {
        if (dipatchInv.factoryID > 0) {
            trackPromise(
                getBrokersForDropdown(),
                getVehiclesForDropdown(),
                getSellingMarksForDropdown(),
                getGradesForDropdown(),
                GetFactoryCodeByFactoryID()
            );
        }
    }, [dipatchInv.factoryID]);

    useEffect(() => {
        if (dipatchInv.teaGradeID > 0) {
            trackPromise(
                getManufactureNumbersForDropdown());
        }
    }, [dipatchInv.teaGradeID]);

    useEffect(() => {
        if (dipatchInv.teaGradeID > 0) {
            trackPromise(
                getSampleValueByGradeID());
        }
    }, [dipatchInv.teaGradeID]);

    useEffect(() => {
        // if (dipatchInv.manufactureNumber > 0) {
        trackPromise(
            GetManufactureDateByManufactureNumber());
        //  }
    }, [dipatchInv.manufactureNumber]);

    useEffect(() => {
        if (dipatchInv.noOfPackages > 0) {
            trackPromise(
                calculate());
        }
    }, [dipatchInv.noOfPackages]);

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
            isViewApproveEnabled: isViewApproveEnabled !== undefined,
        });
        setDispatchInv({
            ...dipatchInv,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
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

    async function getSelectedSearchValue() {
        let model = {
            factoryID: factories[dipatchInv.factoryID],
            dispatchDate: dipatchInv.dispatchDate,
            sellingMarks: sellingMarks[dipatchInv.sellingMarkID],
            factoryCode: dipatchInv.factoryCode,
            broker: brokers[dipatchInv.brokerID],
            vehicleID: vehicles[dipatchInv.vehicleID]
        }
        setSelectedSearchValueS(model);
    }

    async function AddManufactureDetails() {
        let model = {
            invoiceNo: dipatchInv.invoiceNo,
            teaGradeID: parseInt(dipatchInv.teaGradeID),
            manufactureNumber: dipatchInv.manufactureNumber,
            manufactureDate: moment(manufactureDate.manufactureDate).format(),
        }
        setManufactureDetailList(manufactureDetailList => [...manufactureDetailList, model]);
        ClearManufactureNumberAndDate();
        setManufactureDate([])
        setIsDisableButton(true);
    }

    async function AddDispatchDetails() {
        let model = {
            invoiceNo: dipatchInv.invoiceNo,
            typeOfPack: parseInt(dipatchInv.typeOfPack),
            noOfPackages: parseInt(dipatchInv.noOfPackages),
            teaGradeID: parseInt(dipatchInv.teaGradeID),
            grossQuantity: parseFloat(Number(dipatchInv.packWeight) * Number(dipatchInv.noOfPackages)),
            sampleQuantity: sampleQuantity,
            fullOrHalf: parseInt(dipatchInv.fullOrHalf),
            packWeight: parseFloat(dipatchInv.packWeight),
            netQuantity: parseFloat((Number(dipatchInv.packWeight) *
                Number(dipatchInv.noOfPackages))),
            natureOfDispatch: parseInt(dipatchInv.natureOfDispatch) == 0 ? null : parseInt(dipatchInv.natureOfDispatch),
            manufactureDetailList: manufactureDetailList
        }

        setDispatchList(dispatchList => [...dispatchList, model]);
        setNames({
            teaGradeID: grades[dipatchInv.teaGradeID],
            vehicleID: vehicles[dipatchInv.vehicleID]
        })
        getSelectedSearchValue();
        clearmanufactureFormFields();
    }

    async function ApproveAndNew() {
        let saveModel = {
            groupID: parseInt(dipatchInv.groupID),
            factoryID: parseInt(dipatchInv.factoryID),
            dateOfDispatched: dipatchInv.dateOfDispatched,
            sellingMarkID: parseInt(dipatchInv.sellingMarkID),
            brokerID: parseInt(dipatchInv.brokerID),
            manufactureYear: moment(selectedDate).format('YYYY-MM-DD'),
            vehicleID: parseInt(dipatchInv.vehicleID),
            dispatchInvoiceApproval: 1,
            dispatchYear: moment(selectedDate).format('YYYY')
        }

        if (dispatchList.length == 0) {
            alert.error("Please Add a Reocrd");
        } else {
            let response = await services.saveDispatchInvoice(saveModel, dispatchList);

            if (response.statusCode == "Success") {
                alert.success("Dispatch Invoice Approval is pending");
                clearmanufactureFormFields();
                setDispatchList([]);
            }
            else {
                alert.error(response.message);
                clearmanufactureFormFields();
                setDispatchList([]);
            }
        }
    }

    async function ApproveClick() {
        let saveModel = {
            groupID: parseInt(dipatchInv.groupID),
            factoryID: parseInt(dipatchInv.factoryID),
            dateOfDispatched: dipatchInv.dateOfDispatched,
            sellingMarkID: parseInt(dipatchInv.sellingMarkID),
            brokerID: parseInt(dipatchInv.brokerID),
            manufactureYear: moment(selectedDate).format('YYYY-MM-DD'),
            vehicleID: parseInt(dipatchInv.vehicleID),
            dispatchInvoiceApproval: 2,
            dispatchYear: moment(selectedDate).format('YYYY')
        }
        if (dispatchList.length == 0) {
            alert.error("Please Add a Reocrd");
        } else {
            let response = await services.saveDispatchInvoice(saveModel, dispatchList);

            if (response.statusCode == "Success") {
                alert.success("Dispatch Invoice Approved Successfully");
                clearmanufactureFormFields();
                setDispatchList([]);
            }
            else {
                alert.error(response.message);
                clearmanufactureFormFields();
                setDispatchList([]);
            }
        }
    }

    async function removeManufactureDetailList(index) {
        if (isUpdate == true) {
            const res = await services.DeleteManufacureList(index.teaProductDispatchDetailsID);
            if (res == 1) {
                setManufactureDetailList(manufactureDetailList.splice(index, 1))
                let decrypted = 0;
                decrypted = atob(teaProductDispatchID);
                alert.success('Item deleted successfully');

            } if (res !== 1) {

                const dataDelete = [...manufactureDetailList];
                dataDelete.splice(index, 1);
                setManufactureDetailList([...dataDelete]);
            }
            else {
                alert.error('Failed');
            }
        } else {

            const dataDelete = [...manufactureDetailList];
            dataDelete.splice(index, 1);
            setManufactureDetailList([...dataDelete]);
        }
    }

    async function handleClickRemove(index) {
        if (isUpdate == true) {

            const res = await services.DeleteDispatch(index.teaProductDispatchID);
            const dataDelete = [...dispatchList];
            dataDelete.splice(index, 1);
            setDispatchList([...dataDelete]);

            if (res == 1) {
                setDispatchList(dispatchList.splice(index, 1))
                let decrypted = 0;
                decrypted = atob(teaProductDispatchID);
                alert.success('Item deleted successfully');
            } else {

                alert.error('Failed');
            }
        } else {

            const dataDelete = [...dispatchList];
            dataDelete.splice(index, 1);
            setDispatchList([...dataDelete]);
        }
    }

    async function calculate() {

        if (isUpdate == true) {
            const calValue = (Number(dipatchInv.packWeight) * Number(dipatchInv.noOfPackages)) - Number(sampleQuantity)
            setNetQuantity(calValue)
            setDispatchInv({
                ...dipatchInv,
                netQuantity: calValue
            });
        } else {
            const calValue = (Number(dipatchInv.packWeight) * Number(dipatchInv.noOfPackages)) - Number(sampleQuantity)
            setNetQuantity(calValue)
            setDispatchInv({
                ...dipatchInv,
                netQuantity: calValue
            });
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

    function handleChange1(e) {
        const target = e.target;
        const value = target.value
        if (value != 0) {
            setIsDisableButton(false)
        }
        setDispatchInv({
            ...dipatchInv,
            [e.target.name]: value
        });
    }

    function handleChange(e) {
        const target = e.target;
        const value = target.value
        setDispatchInv({
            ...dipatchInv,
            [e.target.name]: value
        });
    }

    function handleChange3(e) {
        const target = e.target;
        const value = target.value

        setDispatchInv({
            ...dipatchInv,
            [e.target.name]: value
        });
        if (target.value > 0) {
            setHandleNoOfBags(true)
        }
    }

    function handleDateOfDispatchedChange(value) {
        setDispatchInv({
            ...dipatchInv,
            dateOfDispatched: value
        });
    }


    async function ClearManufactureNumberAndDate() {
        setDispatchInv({
            ...dipatchInv,
            manufactureNumber: 0,
            manufactureDate: '',

        });
    }

    async function clearmanufactureFormFields() {
        setDispatchInv({
            ...dipatchInv,
            manufactureNumber: '',
            invoiceNo: '',
            teaGradeID: 0,
            manufactureDate: '',
            fullOrHalf: 1,
            typeOfPack: 0,
            packNetWeight: '',
            noOfPackages: '',
            netQuantity: '',
            grossQuantity: '',
            packWeight: '',
            //numberOfBag: ''
        });
        setManufactureDetailList([]);
        setManufactureDate([]);
        setSampleQuantity([]);
        setNetQuantity([]);
    }

    function clearFormFields() {
        setDispatchInv({
            ...dipatchInv,
            batchNo: '',
            brokerID: 0,
            dateOfDispatched: '',
            manufactureNumber: '',
            sellingMarkID: 0,
            invoiceNo: '',
            teaGradeID: 0.,
            noOfPackages: '',
            fullOrHalf: 1,
            typeOfPack: '',
            packNo: '',
            packNetWeight: '',
            grossQuantity: '',
            sampleQuantity: '',
            netQuantity: '',
            manufactureYear: '',
            manufactureDate: '',
            vehicleID: 0,
            natureOfDispatch: 3,
            packWeight: '',
            //numberOfBag: ''
        });
        setManufactureDetailList([]);
        setDispatchList([]);
        setSampleQuantity([]);
        setNetQuantity([]);
    }

    function clearFields() {
        setDispatchInv({
            ...dipatchInv,
            noOfPackages: '',
            fullOrHalf: 1,
            typeOfPack: 0,
            packNetWeight: '',
            grossQuantity: '',
            netQuantity: '',
            packWeight: '',
            netQuantity: '',
            sampleAllowance: ''
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

    function settingInvoiceNo(data) {
        return data;
    }
    function settingTop(data) {
        if (data == 1) {
            return 'CHEST';
        }
        else if (data == 2) {
            return 'DJ-MWPS';
        }
        else if (data == 3) {
            return 'MWPS';
        }
        else if (data == 4) {
            return 'PS';
        }
        else if (data == 5) {
            return 'SPBS';
        }
        else {
            return null;
        }
    }

    function settingNop(data) {
        return data;
    }
    function settingGrade(data) {
        let grade = grades.filter((item, index) => index == data);
        return grade;
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
                            natureOfDispatch: dipatchInv.natureOfDispatch,
                            dateOfDispatched: dipatchInv.dateOfDispatched,
                            manufactureNumber: dipatchInv.manufactureNumber,
                            sellingMarkID: dipatchInv.sellingMarkID,
                            brokerID: dipatchInv.brokerID,
                            invoiceNo: dipatchInv.invoiceNo,
                            teaGradeID: dipatchInv.teaGradeID,
                            noOfPackages: dipatchInv.noOfPackages,
                            fullOrHalf: dipatchInv.fullOrHalf,
                            typeOfPack: dipatchInv.typeOfPack,
                            packNo: dipatchInv.packNo,
                            packNetWeight: dipatchInv.packNetWeight,
                            grossQuantity: dipatchInv.grossQuantity,
                            sampleQuantity: dipatchInv.sampleQuantity,
                            netQuantity: dipatchInv.netQuantity,
                            manufactureYear: dipatchInv.manufactureYear,
                            manufactureDate: dipatchInv.manufactureDate,
                            vehicleID: dipatchInv.vehicleID,
                            dateOfDispatched: dipatchInv.dateOfDispatched,
                            packWeight: dipatchInv.packWeight,
                            sampleQuantity: dipatchInv.sampleQuantity,
                            netQuantity: dipatchInv.netQuantity,
                            //numberOfBag: dipatchInv.numberOfBag,
                            sampleAllowance: dipatchInv.sampleAllowance

                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
                                natureOfDispatch: Yup.number().required('Nature of Dispatch is required').min("1", 'Nature of Dispatch is required'),
                                brokerID: Yup.number().required('Broker is required').min("1", 'Broker is required'),
                                sellingMarkID: Yup.number().required('Selling Mark is required').min("1", 'Selling Mark is required'),
                                teaGradeID: Yup.number().required('Grade is required').min("1", 'Grade is required'),
                                fullOrHalf: Yup.number().required('Full/Half is required').min("1", 'Full/Half is required'),
                                vehicleID: Yup.number().required('Vehicle Number is required').min("1", 'Vehicle Number is required'),
                                invoiceNo: Yup.string().required('Invoice Number is required').min("1", 'Invoice Number is required'),
                                typeOfPack: Yup.number().required('Type of Pack is required').min("1", 'Type of Pack is required'),
                                noOfPackages: Yup.number().required('Number Of Packages is required').min("1", 'Number Of Packages is required'),
                                dateOfDispatched: Yup.date().required('Date Of Dispatched is required').typeError('Invalid date'),
                                packWeight: Yup.number().required('Pack Weight is required').test('packWeight', 'Please enter valid weight', (val) => val > 0)
                                    .typeError('Pack weight is required'),
                                //numberOfBag: handleNoOfBags == true ? Yup.number().test('numberOfBag', 'Number of bags can not be negative', (val) => val > 0) : Yup.number().optional(),
                            })
                        }
                        onSubmit={(event) => trackPromise(AddDispatchDetails(event))}
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
                                                                readOnly: isUpdate || !permissionList.isGroupFilterEnabled ? true : false
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
                                                            size='small'
                                                            id="factoryID"
                                                            InputProps={{
                                                                readOnly: isUpdate || !permissionList.isFactoryFilterEnabled ? true : false
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Factory--</MenuItem>
                                                            {generateDropDownMenu(factories)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="dateOfDispatched">
                                                            Dispatched Date *
                                                        </InputLabel>
                                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                            <KeyboardDatePicker
                                                                error={Boolean(touched.dateOfDispatched && errors.dateOfDispatched)}
                                                                helperText={touched.dateOfDispatched && errors.dateOfDispatched}
                                                                autoOk
                                                                fullWidth
                                                                variant="inline"
                                                                format="dd/MM/yyyy"
                                                                margin="dense"
                                                                name="dateOfDispatched"
                                                                id="dateOfDispatched"
                                                                size='small'
                                                                value={dipatchInv.dateOfDispatched}
                                                                onChange={(e) => {
                                                                    handleDateOfDispatchedChange(e);
                                                                }}
                                                                KeyboardButtonProps={{
                                                                    'aria-label': 'change date',
                                                                }}
                                                                InputProps={{ readOnly: true }}
                                                            />
                                                        </MuiPickersUtilsProvider>
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                            <DatePicker
                                                                autoOk
                                                                variant="inline"
                                                                openTo="month"
                                                                views={["year"]}
                                                                label=" Dispatch Year*"
                                                                value={selectedDate}
                                                                size='small'
                                                                disableFuture={true}
                                                                onChange={(date) => handleDateChange(date)}
                                                            />
                                                        </MuiPickersUtilsProvider>
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
                                                            // onChange={(e) => handleChange(e)}
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
                                                            error={Boolean(touched.sellingMarkID && errors.sellingMarkID)}
                                                            helperText={touched.sellingMarkID && errors.sellingMarkID}
                                                            name="sellingMarkID"
                                                            size='small'
                                                            onChange={(e) => {
                                                                handleChange(e)
                                                            }}
                                                            value={dipatchInv.sellingMarkID}
                                                            variant="outlined"
                                                            id="sellingMarkID"
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
                                                            error={Boolean(touched.brokerID && errors.brokerID)}
                                                            helperText={touched.brokerID && errors.brokerID}
                                                            name="brokerID"
                                                            onChange={(e) => {
                                                                handleChange(e)
                                                            }}
                                                            value={dipatchInv.brokerID}
                                                            variant="outlined"
                                                            id="brokerID"
                                                            size='small'
                                                        >
                                                            <MenuItem value={'0'}>
                                                                --Select Broker--
                                                            </MenuItem>
                                                            {generateDropDownMenu(brokers)}
                                                        </TextField>
                                                    </Grid>
                                                </Grid>

                                                <Grid container spacing={4}>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="vehicleID">
                                                            Vehicle Number *
                                                        </InputLabel>
                                                        <TextField select
                                                            fullWidth
                                                            error={Boolean(touched.vehicleID && errors.vehicleID)}
                                                            helperText={touched.vehicleID && errors.vehicleID}
                                                            name="vehicleID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={dipatchInv.vehicleID}
                                                            size='small'
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
                                                                error={Boolean(touched.invoiceNo && errors.invoiceNo)}
                                                                helperText={touched.invoiceNo && errors.invoiceNo}
                                                                name="invoiceNo"
                                                                onBlur={handleBlur}
                                                                onChange={(e) => handleChange(e)}
                                                                value={dipatchInv.invoiceNo}
                                                                size='small'
                                                                variant="outlined" >
                                                            </TextField>
                                                        </Grid>
                                                        <Grid item md={3} xs={12}>
                                                            <InputLabel shrink id="teaGradeID">
                                                                Grade *
                                                            </InputLabel>
                                                            <TextField select
                                                                fullWidth
                                                                error={Boolean(touched.teaGradeID && errors.teaGradeID)}
                                                                helperText={touched.teaGradeID && errors.teaGradeID}
                                                                name="teaGradeID"
                                                                onChange={(e) => {
                                                                    handleChange(e)
                                                                }}
                                                                value={dipatchInv.teaGradeID}
                                                                variant="outlined"
                                                                size='small'
                                                                id="teaGradeID"
                                                            >
                                                                <MenuItem value={'0'}>
                                                                    --Select Grade--
                                                                </MenuItem>
                                                                {generateDropDownMenu(grades)}
                                                            </TextField>
                                                        </Grid>
                                                    </Grid>

                                                    <CardContent>
                                                        <Card style={{ padding: 20, marginTop: 20 }}>
                                                            <Grid container spacing={4}>
                                                                <Grid item md={3} xs={12}>
                                                                    <InputLabel shrink id="manufactureNumber">
                                                                        Manufacture Number
                                                                    </InputLabel>

                                                                    <TextField select
                                                                        fullWidth
                                                                        error={Boolean(touched.manufactureNumber && errors.manufactureNumber)}
                                                                        helperText={touched.manufactureNumber && errors.manufactureNumber}
                                                                        name="manufactureNumber"
                                                                        size='small'
                                                                        onChange={(e) => {
                                                                            handleChange1(e)
                                                                        }}
                                                                        value={dipatchInv.manufactureNumber}
                                                                        variant="outlined"
                                                                        id="manufactureNumber"
                                                                    >
                                                                        <MenuItem value={'0'}>
                                                                            --Select Manufacture Number--
                                                                        </MenuItem>
                                                                        {generateDropDownMenu(manufactureNumbers)}

                                                                    </TextField>
                                                                </Grid>
                                                                <Grid item md={3} xs={12}>
                                                                    <InputLabel shrink id="manufactureDate">
                                                                        Manufacture Date
                                                                    </InputLabel>
                                                                    <TextField
                                                                        fullWidth
                                                                        error={Boolean(touched.manufactureDate && errors.manufactureDate)}
                                                                        helperText={touched.manufactureDate && errors.manufactureDate}
                                                                        name="manufactureDate"
                                                                        InputProps={{
                                                                            readOnly: true
                                                                        }}
                                                                        onBlur={handleBlur}
                                                                        size='small'
                                                                        onChange={(e) => handleChange1(e)}
                                                                        value={manufactureDate}
                                                                        variant="outlined"
                                                                        type='date' >
                                                                    </TextField>
                                                                </Grid>

                                                            </Grid>
                                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                                <Button
                                                                    color="primary"
                                                                    variant="contained"
                                                                    onClick={() => AddManufactureDetails()}
                                                                    disabled={isDisableButton}
                                                                    size='small'
                                                                >
                                                                    Add
                                                                </Button>

                                                            </Box>
                                                            {(manufactureDetailList.length > 0) ?
                                                                <TableContainer >
                                                                    <Table className={classes.table} aria-label="caption table">
                                                                        <TableHead>
                                                                            <TableRow>
                                                                                <TableCell>Manufacture Number</TableCell>
                                                                                <TableCell>Fully Utiliesed</TableCell>
                                                                                <TableCell >Actions</TableCell>
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
                                                                                        />
                                                                                    </TableCell>
                                                                                    <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                                        <DeleteIcon
                                                                                            style={{
                                                                                                color: "red",
                                                                                                cursor: "pointer"
                                                                                            }}
                                                                                            size="small"
                                                                                            onClick={() => removeManufactureDetailList(index)}
                                                                                        >
                                                                                        </DeleteIcon>
                                                                                    </TableCell>
                                                                                </TableRow>
                                                                            ))}

                                                                        </TableBody>
                                                                    </Table>
                                                                </TableContainer>
                                                                : null}
                                                            <br />
                                                            <br />
                                                            <Divider />
                                                            <br /><br />
                                                            <Grid container spacing={4}>

                                                                <Grid item md={3} xs={12}>
                                                                    <InputLabel shrink id="fullOrHalf">
                                                                        Full / Half *
                                                                    </InputLabel>

                                                                    <TextField select
                                                                        fullWidth
                                                                        error={Boolean(touched.fullOrHalf && errors.fullOrHalf)}
                                                                        helperText={touched.fullOrHalf && errors.fullOrHalf}
                                                                        name="fullOrHalf"
                                                                        onChange={(e) => {
                                                                            handleChange(e)
                                                                        }}
                                                                        value={dipatchInv.fullOrHalf}
                                                                        variant="outlined"
                                                                        id="fullOrHalf"
                                                                        size='small'
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
                                                                        helperText={touched.typeOfPack && errors.typeOfPack}
                                                                        name="typeOfPack"
                                                                        onBlur={handleBlur}
                                                                        onChange={(e) => handleChange(e)}
                                                                        value={dipatchInv.typeOfPack}
                                                                        variant="outlined"
                                                                        id="typeOfPack"
                                                                        size='small'
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
                                                                        Net Weight Each (Kg) *
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
                                                                    <InputLabel shrink id="sampleQuantity">
                                                                        Sample Quantity (Kg) *
                                                                    </InputLabel>
                                                                    <TextField
                                                                        fullWidth
                                                                        error={Boolean(touched.sampleQuantity && errors.sampleQuantity)}
                                                                        helperText={touched.sampleQuantity && errors.sampleQuantity}
                                                                        name="sampleQuantity"
                                                                        type='number'
                                                                        onBlur={handleBlur}
                                                                        onChange={(e) => handleChange(e)}
                                                                        value={sampleQuantity}
                                                                        size='small'
                                                                        InputProps={{
                                                                            readOnly: isUpdate ? true : false,
                                                                        }}
                                                                        variant="outlined" />
                                                                </Grid>

                                                                <Grid item md={3} xs={12}>
                                                                    <InputLabel shrink id="grossQuantity">
                                                                        Gross Weight (Kg) *
                                                                    </InputLabel>
                                                                    <TextField
                                                                        fullWidth
                                                                        error={Boolean(touched.grossQuantity && errors.grossQuantity)}
                                                                        helperText={touched.grossQuantity && errors.grossQuantity}
                                                                        name="packNetWeight"
                                                                        type='number'
                                                                        onBlur={handleBlur}
                                                                        onChange={(e) => handleChange(e)}
                                                                        value={
                                                                            (Number(dipatchInv.packWeight) *
                                                                                Number(dipatchInv.noOfPackages))
                                                                        }
                                                                        size='small'
                                                                        variant="outlined" >
                                                                    </TextField>
                                                                </Grid>

                                                                <Grid item md={3} xs={12}>
                                                                    <InputLabel shrink id="netQuantity">
                                                                        Net Total(Kg) *
                                                                    </InputLabel>
                                                                    <TextField
                                                                        fullWidth
                                                                        error={Boolean(touched.netQuantity && errors.netQuantity)}
                                                                        helperText={touched.netQuantity && errors.netQuantity}
                                                                        name="netQuantity"
                                                                        type='number'
                                                                        onBlur={handleBlur}
                                                                        onChange={(e) => handleChange(e)}
                                                                        size='small'
                                                                        value={
                                                                            (Number(dipatchInv.packWeight) *
                                                                                Number(dipatchInv.noOfPackages))
                                                                        }
                                                                        InputProps={{
                                                                            readOnly: true
                                                                        }}
                                                                        variant="outlined"
                                                                    />
                                                                </Grid>
                                                                <Grid item md={3} xs={12}>
                                                                    <InputLabel shrink id="natureOfDispatch">
                                                                        Nature Of Dispatch *
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
                                                                        Number of Bags
                                                                    </InputLabel>
                                                                    <TextField
                                                                        fullWidth
                                                                        error={Boolean(touched.numberOfBag && errors.numberOfBag)}
                                                                        helperText={touched.numberOfBag && errors.numberOfBag}
                                                                        name="numberOfBag"
                                                                        type='number'
                                                                        onBlur={handleBlur}
                                                                        onChange={(e) => handleChange3(e)}
                                                                        value={dipatchInv.numberOfBag}
                                                                        size='small'
                                                                        variant="outlined"
                                                                    />
                                                                </Grid>
                                                            </Grid> */}

                                                            <br />
                                                            <br />
                                                            <Divider />
                                                            <br /><br />

                                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                                <Button
                                                                    color="primary"
                                                                    type="reset"
                                                                    variant="outlined"
                                                                    onClick={() => clearFields()}
                                                                    size='small'
                                                                >
                                                                    Clear
                                                                </Button>
                                                                <div>&nbsp;</div>
                                                                <Button
                                                                    color="primary"
                                                                    variant="contained"
                                                                    type='submit'
                                                                    size='small'
                                                                >
                                                                    Add
                                                                </Button>
                                                            </Box>
                                                            <Box minWidth={1050}>

                                                                {(dispatchList.length > 0) ?
                                                                    <TableContainer >
                                                                        <Table className={classes.table} aria-label="caption table">
                                                                            <TableHead>
                                                                                <TableRow>
                                                                                    <TableCell>Invoice No</TableCell>
                                                                                    <TableCell>Grade</TableCell>
                                                                                    <TableCell>Vehicle No</TableCell>
                                                                                    <TableCell>TOP</TableCell>
                                                                                    <TableCell>NOP</TableCell>
                                                                                    <TableCell>PW (KG)</TableCell>
                                                                                    <TableCell>GW (KG)</TableCell>
                                                                                    <TableCell>SA (KG)</TableCell>
                                                                                    <TableCell>Net Qty (KG)</TableCell>
                                                                                    <TableCell >Actions</TableCell>

                                                                                </TableRow>
                                                                            </TableHead>
                                                                            <TableBody>
                                                                                {dispatchList.map((rowData, index) => (
                                                                                    <TableRow key={index}>
                                                                                        <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                                            {settingInvoiceNo(rowData.invoiceNo)}
                                                                                        </TableCell>
                                                                                        <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                                            {settingGrade(rowData.teaGradeID)}
                                                                                        </TableCell>
                                                                                        <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                                            {vehicles[dipatchInv.vehicleID]}
                                                                                        </TableCell>
                                                                                        <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                                            {settingTop(rowData.typeOfPack)}
                                                                                        </TableCell>
                                                                                        <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                                            {settingNop(rowData.noOfPackages)}
                                                                                        </TableCell>
                                                                                        <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                                            {rowData.packWeight}
                                                                                        </TableCell>
                                                                                        <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                                            {rowData.grossQuantity}
                                                                                        </TableCell>
                                                                                        <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                                            {rowData.sampleQuantity}
                                                                                        </TableCell>
                                                                                        <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                                            {rowData.netQuantity}
                                                                                        </TableCell>
                                                                                        <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                                            <DeleteIcon
                                                                                                style={{
                                                                                                    color: "red",
                                                                                                    marginBottom: "-1rem",
                                                                                                    marginTop: "0rem",
                                                                                                    cursor: "pointer"
                                                                                                }}
                                                                                                size="small"
                                                                                                onClick={() => handleClickRemove(index)}
                                                                                            >
                                                                                            </DeleteIcon>
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                ))}

                                                                            </TableBody>
                                                                        </Table>
                                                                    </TableContainer>
                                                                    : null}
                                                            </Box>
                                                        </Card>
                                                    </CardContent>
                                                </Card>
                                            </CardContent>


                                            <Box display="flex" justifyContent="flex-end" p={2}>

                                            </Box>
                                        </PerfectScrollbar>
                                    </Card>
                                </Box>
                            </form>
                        )}

                    </Formik>
                    <Box display="flex" justifyContent="flex-end" p={2}>
                        <ReactToPrint
                            documentTitle={"Dispatch Invoice"}
                            trigger={() => <Button
                                color="primary"
                                id="btnRecord"
                                type="submit"
                                variant="contained"
                                style={{ marginRight: '1rem' }}
                                className={classes.colorCancel}
                            >
                                Print
                            </Button>}
                            content={() => componentRef.current}
                        />
                        <div hidden={true}>

                            <CreatePDF ref={componentRef}
                                searchData={selectedSearchValues}
                                dispatchList={dispatchList}
                                names={names}
                            />
                        </div>
                        <div>&nbsp;</div>
                        <Button
                            color="primary"
                            type="reset"
                            variant="outlined"
                            onClick={() => clearFormFields()}
                            size='small'
                        >
                            Cancel
                        </Button>
                        <div>&nbsp;</div>
                        <Button
                            color="primary"
                            variant="contained"
                            onClick={ApproveAndNew}
                            size='small'
                        >
                            {isUpdate == true ? "Send to Approve" : "Send to Approve"}
                        </Button>
                        <div>&nbsp;</div>
                        {permissionList.isViewApproveEnabled ? (
                            <Button
                                color="primary"
                                variant="contained"
                                onClick={ApproveClick}
                                size='small'
                                className={classes.colorRecord}
                            >
                                {isUpdate == true ? "Approve" : "Approve"}
                            </Button>) : null
                        }
                        <div>&nbsp;</div>
                    </Box>
                </Container >
            </Page >
        </Fragment >
    );
};

