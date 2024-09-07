import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, CardHeader, MenuItem,
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
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { DatePicker } from "@material-ui/pickers";
import { AgriGenERPEnum } from './../../Common/AgriGenERPEnum/AgriGenERPEnum';

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

const screenCode = 'RETURNTEA';

export default function ReturnTeaAddEdit(props) {
    const [title, setTitle] = useState("Add Return Tea");
    const agriGenERPEnum = new AgriGenERPEnum()
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [brokers, setBrokers] = useState([]);
    const [invoiceStatus, setInvoiceStatus] = useState([]);
    const [grades, setGrades] = useState();
    const [invoiceNumbers, setInvoiceNumbers] = useState([]);
    const [sellingMarks, setSellingMarks] = useState([]);
    const [status, setStatus] = useState([]);
    const [buyerList, setBuyerList] = useState([]);
    const [retrunTea, setReturnTea] = useState({
        groupID: 0,
        factoryID: 0,
        returnDate: new Date(),
        dispatchYear: new Date().toISOString().substring(0, 4),
        returnFromID: 0,
        typeID: 0,
        returnToID: 0,
        invoiceNo: 0,
        noOfPacks: '',
        brokerID: 0,
        buyerID: '',
        gradeID: 0,
        sellingMarksID: 0,
        catalogueDate: '',
        lotNumber: '',
        salesType: 0,
        packWeight: '',
        netWeight: '',
        salesNumber: '',
        teaProductDispatchID: '',
        sellerContractID: '',
        statusCode: '',
        value: '',
        salesRate: '',
        price: '',
        returnedAmount: '',
        sellingDate: ''
    });
    const [isUpdate, setIsUpdate] = useState(false);
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });
    const { returnTeaID } = useParams();
    let decrypted = 0;
    const navigate = useNavigate();
    const alert = useAlert();
    const handleClick = () => {
        navigate('/app/returnTea/listing');
    }

    useEffect(() => {
        trackPromise(
            getPermission());
        trackPromise(
            getGroupsForDropdown()
        );
        decrypted = atob(returnTeaID);
        if (decrypted != 0) {
            trackPromise(
                getReturnedTeaDetailsByID(decrypted))
        }
    }, []);

    useEffect(() => {
        if (retrunTea.groupID !== 0) {
            trackPromise(
                getFactoriesForDropdown(),
                getStatusForDropdown());
        }
    }, [retrunTea.groupID]);

    useEffect(() => {
        if (retrunTea.factoryID !== 0) {
            trackPromise(
                getBrokersForDropdown());
            trackPromise(
                getSellingMarksForDropdown());
            trackPromise(
                getGradesForDropdown());
            trackPromise(
                getInvoiceNumbersForDropdown());
            trackPromise(
                getBuyersForDropdown());
        }
    }, [retrunTea.factoryID]);

    useEffect(() => {
        if (retrunTea.invoiceNo !== 0) {
            trackPromise(
                getSalesDetailsByInvoiceNumber());
        }
    }, [retrunTea.invoiceNo]);


    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWRETURNTEA');
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

        setReturnTea({
            ...retrunTea,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getFactoriesForDropdown() {
        const factories = await services.getFactoryByGroupID(retrunTea.groupID);
        setFactories(factories);
    }

    async function getBrokersForDropdown() {
        const brokers = await services.getBrokerList(retrunTea.groupID, retrunTea.factoryID);
        setBrokers(brokers);
    }

    async function getSellingMarksForDropdown() {
        const sellingMarks = await services.getSellingMarkList(retrunTea.groupID, retrunTea.factoryID);
        setSellingMarks(sellingMarks);
    }

    async function getGradesForDropdown() {
        const grades = await services.getGradeDetails(retrunTea.groupID, retrunTea.factoryID);
        setGrades(grades);
    }

    async function getInvoiceNumbersForDropdown() {
        const invoiceNumbers = await services.getAllInvoiceNumbers(retrunTea.groupID, retrunTea.factoryID);
        setInvoiceNumbers(invoiceNumbers);
    }

    async function getStatusForDropdown() {
        const statusID = await services.GetAllStatus();
        let statusArray = [];
        for (let item of Object.entries(statusID.data)) {
            statusArray[item[1]["statusID"]] = item[1]["statusName"]
        }
        let statusCode = [];
        for (let item of Object.entries(statusID.data)) {
            statusCode[item[1]["statusID"]] = item[1]["statusCode"]
        }
        setInvoiceStatus(statusArray);
        setStatus(statusCode);
    }

    async function getBuyersForDropdown() {
        const buyers = await services.getBuyerList(retrunTea.groupID, retrunTea.factoryID);
        setBuyerList(buyers);
    }

    async function getSalesDetailsByInvoiceNumber() {
        const response = await services.getSalesDetailsByInvoiceNumber(retrunTea.invoiceNo, retrunTea.returnFromID);
        setReturnTea({
            ...retrunTea,
            brokerID: response.brokerID,
            buyerID: response.buyerID,
            gradeID: response.teaGradeID,
            sellingMarksID: response.sellingMarkID,
            catalogueDate: response.catelogDate == null ? true : response.catelogDate.split('T')[0],
            lotNumber: response.lotNumber,
            salesType: response.typeofSales == null ? 0 : response.typeofSales,
            packWeight: response.packWeight,
            salesNumber: response.salesNumber,
            teaProductDispatchID: response.teaProductDispatchID,
            sellerContractID: response.sellerContractID,
            value: response.value,
            salesRate: response.salesRate,
            sellingDate: response.sellingDate
        })
    }

    async function getReturnedTeaDetailsByID(returnTeaID) {
        let response = await services.getReturnedTeaDetailsByID(returnTeaID);
        let data = {
            groupID: response.groupID,
            factoryID: response.factoryID,
            returnDate: response.returnDate.split('T')[0],
            dispatchYear: response.dispatchYear,
            returnFromID: response.returnFromID,
            typeID: response.typeID,
            returnToID: response.returnToID,
            noOfPacks: response.noOfPacks,
            packWeight: response.packWeight,
            netWeight: response.returnedNetWeight,
            invoiceNo: response.teaProductDispatchID,
            brokerID: response.brokerID,
            buyerID: response.buyerID,
            gradeID: response.teaGradeID,
            sellingMarksID: response.sellingMarkID,
            catalogueDate: response.catelogDate == null ? true : response.catelogDate.split('T')[0],
            lotNumber: response.lotNumber,
            salesType: response.typeofSales == null ? 0 : response.typeofSales,
            packWeight: response.packWeight,
            salesNumber: response.salesNumber,
            teaProductDispatchID: response.teaProductDispatchID,
            sellerContractID: response.sellerContractID
        }
        setReturnTea(data);
        setTitle("Edit Return Tea");
        setIsUpdate(true);
    }

    async function saveReturnTea() {
        let model = {
            returnTeaID: atob(returnTeaID),
            groupID: retrunTea.groupID,
            factoryID: retrunTea.factoryID,
            invoiceNo: invoiceNumbers[retrunTea.invoiceNo],
            returnDate: retrunTea.returnDate,
            dispatchYear: retrunTea.dispatchYear,
            returnFromID: retrunTea.returnFromID,
            typeID: retrunTea.typeID,
            returnToID: retrunTea.returnToID,
            noOfPacks: retrunTea.noOfPacks,
            packWeight: retrunTea.packWeight,
            netWeight: Number((retrunTea.noOfPacks * retrunTea.packWeight).toFixed(2)),
            brokerID: parseInt(retrunTea.brokerID),
            buyerID: retrunTea.buyerID,
            teaGradeID: retrunTea.gradeID,
            sellingMarksID: parseInt(retrunTea.sellingMarksID),
            catalogueDate: retrunTea.returnFromID == 1 ? retrunTea.catalogueDate == true : retrunTea.catalogueDate,
            lotNumber: retrunTea.lotNumber,
            salesType: parseInt(retrunTea.salesType),
            salesNumber: retrunTea.salesNumber,
            sellerContractID: retrunTea.sellerContractID,
            teaProductDispatchID: retrunTea.teaProductDispatchID,
            price: retrunTea.sellerContractID == 0 ? retrunTea.value : retrunTea.salesRate,
            returnedAmount: retrunTea.sellerContractID == 0 ? ((retrunTea.noOfPacks * retrunTea.packWeight) * retrunTea.value)
                : ((retrunTea.noOfPacks * retrunTea.packWeight) * retrunTea.salesRate),
            soldDate: retrunTea.sellingDate
        }

        if (isUpdate == true) {
            let response = await services.updateReturnTea(model);
            if (response.statusCode == "Success") {
                alert.success(response.message);
                navigate('/app/returnTea/listing');
            }
            else {
                alert.error(response.message);
            }
        } else {

            let response = await services.saveReturnTea(model);
            if (response.statusCode == "Success") {
                alert.success(response.message);
                navigate('/app/returnTea/listing');
            }
            else {
                alert.error(response.message);
            }
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

    function handleChange(e) {
        const target = e.target;
        const value = target.value
        setReturnTea({
            ...retrunTea,
            [e.target.name]: value
        });
    }
    function handleDateChange(value) {
        setReturnTea({
            ...retrunTea,
            returnDate: value
        });
    }

    function handleChangeReturnFrom(e) {
        const target = e.target;
        const value = target.value

        setReturnTea({
            ...retrunTea,
            returnToID: 1,
            [e.target.name]: value
        })
    }

    function handleTypeChange(e) {
        const target = e.target;
        const value = target.value

        setReturnTea({
            ...retrunTea,
            [e.target.name]: value,
            statusCode: status[value]
        })
        status[value] == agriGenERPEnum.InvoiceStatusCode.Withdraw ?
            setTitle("Add Withdrawn Tea")
            :
            setTitle("Add Return Tea")
    }

    function setSelectedDispatchDate(value) {

        setReturnTea({
            ...retrunTea,
            dispatchYear: value.toISOString().substring(0, 4)
        })
    }

    function clearFormFields() {
        setReturnTea({
            ...retrunTea,
            returnDate: '',
            dispatchYear: '',
            returnFromID: 0,
            typeID: 0,
            returnToID: 0,
            invoiceNo: 0,
            noOfPacks: '',
            brokerID: 0,
            buyerID: '',
            gradeID: 0,
            sellingMarksID: 0,
            catalogueDate: '',
            lotNumber: '',
            salesType: 0,
            packWeight: '',
            netWeight: '',
            salesNumber: '',
            teaProductDispatchID: '',
            sellerContractID: ''
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

    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: retrunTea.groupID,
                            factoryID: retrunTea.factoryID,
                            invoiceNo: retrunTea.invoiceNo,
                            noOfPacks: retrunTea.noOfPacks,
                            returnDate: retrunTea.returnDate,
                            typeID: retrunTea.typeID,
                            dispatchYear: retrunTea.dispatchYear,
                            returnFromID: retrunTea.returnFromID
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
                                invoiceNo: Yup.number().required('Invoice Number is required').min("1", 'Invoice Number is required'),
                                noOfPacks: Yup.number().required('Number of packs is required').integer("Number of packs can not conatin decimal values").test("noOfPacks", "Number of packs can not be negative", val => val > 0),
                                typeID: Yup.number().required('Type is required').min("1", 'Type is required'),
                                dispatchYear: Yup.date().required('Dispatch Year is required'),
                                returnFromID: Yup.number().required('Return from is required').min("1", 'Return from is required'),
                                returnDate: Yup.date().required("Return Date is required")
                            })
                        }
                        enableReinitialize
                        onSubmit={() => trackPromise(saveReturnTea())}
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
                                            <CardContent style={{ marginBottom: "1rem" }}>
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
                                                            value={retrunTea.groupID}
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
                                                            value={retrunTea.factoryID}
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
                                                    <Grid item md={3} xs={8}>
                                                        <InputLabel shrink id="returnDate">
                                                            Return Date *
                                                        </InputLabel>
                                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                            <KeyboardDatePicker
                                                                error={Boolean(touched.returnDate && errors.returnDate)}
                                                                fullWidth
                                                                helperText={touched.returnDate && errors.returnDate}
                                                                onChange={(e) => handleDateChange(e)}
                                                                value={retrunTea.returnDate}
                                                                variant="outlined"
                                                                format="dd/MM/yyyy"
                                                                size='small'
                                                                id="returnDate"
                                                                KeyboardButtonProps={{
                                                                    'aria-label': 'change date',
                                                                }}
                                                            />
                                                        </MuiPickersUtilsProvider>
                                                    </Grid>
                                                    <Grid item md={3} xs={8}>
                                                        <InputLabel shrink id="returnDate">
                                                            Dispatch Year *
                                                        </InputLabel>
                                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                            <DatePicker
                                                                error={Boolean(touched.dispatchYear && errors.dispatchYear)}
                                                                fullWidth
                                                                autoOk
                                                                variant="inline"
                                                                openTo="month"
                                                                views={["year"]}
                                                                helperText="Select dispatch year"
                                                                value={retrunTea.dispatchYear}
                                                                id='dispatchYear'
                                                                onChange={(e) => setSelectedDispatchDate(e)}
                                                                size='small'
                                                            />
                                                        </MuiPickersUtilsProvider>
                                                    </Grid>
                                                </Grid>

                                                <Grid container spacing={3}>
                                                    <Grid item md={3} xs={8}>
                                                        <InputLabel shrink id="typeID">
                                                            Type *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.typeID && errors.typeID)}
                                                            fullWidth
                                                            helperText={touched.typeID && errors.typeID}
                                                            name="typeID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleTypeChange(e)}
                                                            value={retrunTea.typeID}
                                                            variant="outlined"
                                                            id="typeID"
                                                            size='small'
                                                            InputProps={{
                                                                readOnly: isUpdate ? true : false
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Type-- </MenuItem>
                                                            {generateDropDownMenu(invoiceStatus)}
                                                        </TextField>
                                                    </Grid>

                                                    {retrunTea.statusCode == agriGenERPEnum.InvoiceStatusCode.Withdraw ? (
                                                        <>
                                                            <Grid item md={3} xs={8}>
                                                                <InputLabel shrink id="returnFromID">
                                                                    Withdraw From
                                                                </InputLabel>
                                                                <TextField select
                                                                    error={Boolean(touched.returnFromID && errors.returnFromID)}
                                                                    fullWidth
                                                                    helperText={touched.returnFromID && errors.returnFromID}
                                                                    name="returnFromID"
                                                                    onBlur={handleBlur}
                                                                    onChange={(e) => handleChangeReturnFrom(e)}
                                                                    value={retrunTea.returnFromID}
                                                                    variant="outlined"
                                                                    id="returnFromID"
                                                                    size='small'
                                                                    InputProps={{
                                                                        readOnly: isUpdate ? true : false
                                                                    }}
                                                                >
                                                                    <MenuItem value="0">--Select Withdraw From-- </MenuItem>
                                                                    <MenuItem value="1">Broker</MenuItem>
                                                                </TextField>
                                                            </Grid>
                                                            <Grid item md={3} xs={8}>
                                                                <InputLabel shrink id="returnToID">
                                                                    Withdraw To
                                                                </InputLabel>
                                                                <TextField select
                                                                    error={Boolean(touched.returnToID && errors.returnToID)}
                                                                    fullWidth
                                                                    helperText={touched.returnToID && errors.returnToID}
                                                                    name="returnToID"
                                                                    onBlur={handleBlur}
                                                                    onChange={(e) => handleChange(e)}
                                                                    value={retrunTea.returnToID}
                                                                    variant="outlined"
                                                                    id="returnToID"
                                                                    size='small'
                                                                    InputProps={{
                                                                        readOnly: isUpdate ? true : false
                                                                    }}
                                                                >
                                                                    <MenuItem value="0">--Select Withdraw To-- </MenuItem>
                                                                    <MenuItem value="1">To Factory</MenuItem>
                                                                </TextField>
                                                            </Grid>
                                                        </>) :
                                                        <>
                                                            <Grid item md={3} xs={8}>
                                                                <InputLabel shrink id="returnFromID">
                                                                    Return From *
                                                                </InputLabel>
                                                                <TextField select
                                                                    error={Boolean(touched.returnFromID && errors.returnFromID)}
                                                                    fullWidth
                                                                    helperText={touched.returnFromID && errors.returnFromID}
                                                                    name="returnFromID"
                                                                    onBlur={handleBlur}
                                                                    onChange={(e) => handleChangeReturnFrom(e)}
                                                                    value={retrunTea.returnFromID}
                                                                    variant="outlined"
                                                                    id="returnFromID"
                                                                    size='small'
                                                                >
                                                                    <MenuItem value="0">--Select Return From-- </MenuItem>
                                                                    <MenuItem value="1">Broker</MenuItem>
                                                                    <MenuItem value="2">Buyer</MenuItem>
                                                                </TextField>
                                                            </Grid>
                                                            {retrunTea.returnFromID == agriGenERPEnum.ReturnTeaFrom.Broker ? (
                                                                <Grid item md={3} xs={8}>
                                                                    <InputLabel shrink id="returnToID">
                                                                        Return To
                                                                    </InputLabel>
                                                                    <TextField select
                                                                        error={Boolean(touched.returnToID && errors.returnToID)}
                                                                        fullWidth
                                                                        helperText={touched.returnToID && errors.returnToID}
                                                                        name="returnToID"
                                                                        onBlur={handleBlur}
                                                                        onChange={(e) => handleChange(e)}
                                                                        value={retrunTea.returnToID}
                                                                        variant="outlined"
                                                                        id="returnToID"
                                                                        size='small'
                                                                    >
                                                                        <MenuItem value="0">--Select Return To-- </MenuItem>
                                                                        <MenuItem value="1">To Factory</MenuItem>
                                                                        <MenuItem value="2">Denature</MenuItem>
                                                                        <MenuItem value="2">Pending</MenuItem>
                                                                    </TextField>
                                                                </Grid>

                                                            ) :
                                                                <Grid item md={3} xs={8}>
                                                                    <InputLabel shrink id="returnToID">
                                                                        Return To
                                                                    </InputLabel>
                                                                    <TextField select
                                                                        fullWidth
                                                                        name="returnToID"
                                                                        onBlur={handleBlur}
                                                                        onChange={(e) => handleChange(e)}
                                                                        value={retrunTea.returnToID}
                                                                        variant="outlined"
                                                                        id="returnToID"
                                                                        size='small'
                                                                        InputProps={{
                                                                            readOnly: true
                                                                        }}
                                                                    >
                                                                        <MenuItem value="0">--Select Return To-- </MenuItem>
                                                                        <MenuItem value="1">To Broker</MenuItem>
                                                                    </TextField>
                                                                </Grid>}
                                                        </>
                                                    }
                                                </Grid>
                                                <br />
                                                <br />
                                                <Divider />
                                                <br />
                                                {retrunTea.sellerContractID == 0 ? (
                                                    <>
                                                        <Grid container spacing={3}>
                                                            <Grid item md={4} xs={12}>
                                                                <InputLabel shrink id="invoiceNo">
                                                                    Invoice Number
                                                                </InputLabel>
                                                                <TextField select
                                                                    error={Boolean(touched.invoiceNo && errors.invoiceNo)}
                                                                    fullWidth
                                                                    helperText={touched.invoiceNo && errors.invoiceNo}
                                                                    name="invoiceNo"
                                                                    onBlur={handleBlur}
                                                                    onChange={(e) => handleChange(e)}
                                                                    value={retrunTea.invoiceNo}
                                                                    variant="outlined"
                                                                    id="invoiceNo"
                                                                    size='small'
                                                                >
                                                                    <MenuItem value="0">--Select Invoice Number-- </MenuItem>
                                                                    {generateDropDownMenu(invoiceNumbers)}
                                                                </TextField>
                                                            </Grid>

                                                            <Grid item md={4} xs={12}>
                                                                <InputLabel shrink id="noOfPacks">
                                                                    Number of Packs
                                                                </InputLabel>
                                                                <TextField
                                                                    fullWidth
                                                                    error={Boolean(touched.noOfPacks && errors.noOfPacks)}
                                                                    helperText={touched.noOfPacks && errors.noOfPacks}
                                                                    name="noOfPacks"
                                                                    onBlur={handleBlur}
                                                                    onChange={(e) => handleChange(e)}
                                                                    size='small'
                                                                    value={retrunTea.noOfPacks}
                                                                    variant="outlined"
                                                                    id="noOfPacks"
                                                                    type='number'
                                                                >
                                                                </TextField>
                                                            </Grid>

                                                            <Grid item md={4} xs={12}>
                                                                <InputLabel shrink id="brokerID">
                                                                    Broker
                                                                </InputLabel>
                                                                <TextField select
                                                                    error={Boolean(touched.brokerID && errors.brokerID)}
                                                                    fullWidth
                                                                    helperText={touched.brokerID && errors.brokerID}
                                                                    name="brokerID"
                                                                    onBlur={handleBlur}
                                                                    onChange={(e) => handleChange(e)}
                                                                    value={retrunTea.brokerID}
                                                                    variant="outlined"
                                                                    id="brokerID"
                                                                    size='small'
                                                                    InputProps={{
                                                                        readOnly: true
                                                                    }}
                                                                >
                                                                    <MenuItem value="0">--Select Brokers-- </MenuItem>
                                                                    {generateDropDownMenu(brokers)}
                                                                </TextField>
                                                            </Grid>
                                                        </Grid>
                                                        <Grid container spacing={3}>
                                                            <Grid item md={4} xs={12}>
                                                                <InputLabel shrink id="gradeID">
                                                                    Grade
                                                                </InputLabel>
                                                                <TextField select
                                                                    fullWidth
                                                                    name="gradeID"
                                                                    onBlur={handleBlur}
                                                                    onChange={(e) => handleChange(e)}
                                                                    value={retrunTea.gradeID}
                                                                    variant="outlined"
                                                                    id="gradeID"
                                                                    size='small'
                                                                    InputProps={{
                                                                        readOnly: true
                                                                    }}
                                                                >
                                                                    <MenuItem value={'0'}>--Select Grade--</MenuItem>
                                                                    {generateDropDownMenu(grades)}
                                                                </TextField>
                                                            </Grid>
                                                            <Grid item md={4} xs={12}>
                                                                <InputLabel shrink id="sellingMarksID">
                                                                    Selling Marks
                                                                </InputLabel>
                                                                <TextField select
                                                                    fullWidth
                                                                    name="sellingMarksID"
                                                                    onBlur={handleBlur}
                                                                    onChange={(e) => handleChange(e)}
                                                                    size='small'
                                                                    value={retrunTea.sellingMarksID}
                                                                    variant="outlined"
                                                                    id="sellingMarksID"
                                                                    InputProps={{
                                                                        readOnly: true
                                                                    }}
                                                                >
                                                                    <MenuItem value={'0'}>--Select Selling Mark--</MenuItem>
                                                                    {generateDropDownMenu(sellingMarks)}
                                                                </TextField>
                                                            </Grid>
                                                            <Grid item md={4} xs={12}>
                                                                <InputLabel shrink id="packWeight">
                                                                    Pack Weight
                                                                </InputLabel>
                                                                <TextField
                                                                    fullWidth
                                                                    name="packWeight"
                                                                    onBlur={handleBlur}
                                                                    onChange={(e) => handleChange(e)}
                                                                    size='small'
                                                                    value={retrunTea.packWeight}
                                                                    variant="outlined"
                                                                    id="packWeight"
                                                                    InputProps={{
                                                                        readOnly: true
                                                                    }}
                                                                >
                                                                </TextField>
                                                            </Grid>
                                                        </Grid>
                                                        <Grid container spacing={3}>
                                                            <Grid item md={4} xs={12}>
                                                                <InputLabel shrink id="netWeight">
                                                                    Net Weight
                                                                </InputLabel>
                                                                <TextField
                                                                    error={Boolean(touched.netWeight && errors.netWeight)}
                                                                    fullWidth
                                                                    helperText={touched.netWeight && errors.netWeight}
                                                                    name="netWeight"
                                                                    onBlur={handleBlur}
                                                                    onChange={(e) => handleChange(e)}
                                                                    value={Number((retrunTea.noOfPacks * retrunTea.packWeight).toFixed(2))}
                                                                    variant="outlined"
                                                                    id="netWeight"
                                                                    size='small'
                                                                    InputProps={{
                                                                        readOnly: true
                                                                    }}
                                                                >
                                                                </TextField>
                                                            </Grid>

                                                            <Grid item md={4} xs={12}>
                                                                <InputLabel shrink id="salesNumber">
                                                                    Sales Number
                                                                </InputLabel>
                                                                <TextField
                                                                    fullWidth
                                                                    name="salesNumber"
                                                                    onBlur={handleBlur}
                                                                    onChange={(e) => handleChange(e)}
                                                                    size='small'
                                                                    value={retrunTea.salesNumber}
                                                                    variant="outlined"
                                                                    id="salesNumber"
                                                                    InputProps={{
                                                                        readOnly: true
                                                                    }}
                                                                >
                                                                </TextField>
                                                            </Grid>
                                                            <Grid item md={4} xs={12}>
                                                                <InputLabel shrink id="lotNumber">
                                                                    Lot Number
                                                                </InputLabel>
                                                                <TextField
                                                                    error={Boolean(touched.lotNumber && errors.lotNumber)}
                                                                    fullWidth
                                                                    helperText={touched.lotNumber && errors.lotNumber}
                                                                    name="lotNumber"
                                                                    onBlur={handleBlur}
                                                                    onChange={(e) => handleChange(e)}
                                                                    value={retrunTea.lotNumber}
                                                                    variant="outlined"
                                                                    id="lotNumber"
                                                                    size='small'
                                                                    InputProps={{
                                                                        readOnly: true
                                                                    }}
                                                                >
                                                                </TextField>
                                                            </Grid>
                                                        </Grid>
                                                    </>
                                                )
                                                    :
                                                    <>
                                                        <Grid container spacing={3}>
                                                            <Grid item md={4} xs={12}>
                                                                <InputLabel shrink id="invoiceNo">
                                                                    Invoice Number
                                                                </InputLabel>
                                                                <TextField select
                                                                    error={Boolean(touched.invoiceNo && errors.invoiceNo)}
                                                                    fullWidth
                                                                    helperText={touched.invoiceNo && errors.invoiceNo}
                                                                    name="invoiceNo"
                                                                    onBlur={handleBlur}
                                                                    onChange={(e) => handleChange(e)}
                                                                    value={retrunTea.invoiceNo}
                                                                    variant="outlined"
                                                                    id="invoiceNo"
                                                                    size='small'
                                                                >
                                                                    <MenuItem value="0">--Select Invoice Number-- </MenuItem>
                                                                    {generateDropDownMenu(invoiceNumbers)}
                                                                </TextField>
                                                            </Grid>

                                                            <Grid item md={4} xs={12}>
                                                                <InputLabel shrink id="salesType">
                                                                    Sales Type
                                                                </InputLabel>
                                                                <TextField select
                                                                    fullWidth
                                                                    name="salesType"
                                                                    onChange={(e) => handleChange(e)}
                                                                    value={retrunTea.salesType}
                                                                    variant="outlined"
                                                                    id="salesType"
                                                                    size='small'
                                                                    InputProps={{
                                                                        readOnly: true
                                                                    }}
                                                                >
                                                                    <MenuItem value="0">--Select Type Of Sales--</MenuItem>
                                                                    <MenuItem value="1">Public Sale</MenuItem>
                                                                    <MenuItem value="2">Private Sale</MenuItem>
                                                                    <MenuItem value="3">Unsold</MenuItem>

                                                                </TextField>
                                                            </Grid>

                                                            <Grid item md={4} xs={12}>
                                                                <InputLabel shrink id="brokerID">
                                                                    Broker
                                                                </InputLabel>
                                                                <TextField select
                                                                    error={Boolean(touched.brokerID && errors.brokerID)}
                                                                    fullWidth
                                                                    helperText={touched.brokerID && errors.brokerID}
                                                                    name="brokerID"
                                                                    onBlur={handleBlur}
                                                                    onChange={(e) => handleChange(e)}
                                                                    value={retrunTea.brokerID}
                                                                    variant="outlined"
                                                                    id="brokerID"
                                                                    size='small'
                                                                    InputProps={{
                                                                        readOnly: true
                                                                    }}
                                                                >
                                                                    <MenuItem value="0">--Select Brokers-- </MenuItem>
                                                                    {generateDropDownMenu(brokers)}
                                                                </TextField>
                                                            </Grid>
                                                        </Grid>

                                                        <Grid container spacing={3}>
                                                            <Grid item md={4} xs={12}>
                                                                <InputLabel shrink id="buyerID">
                                                                    Buyer
                                                                </InputLabel>
                                                                <TextField select
                                                                    error={Boolean(touched.buyerID && errors.buyerID)}
                                                                    fullWidth
                                                                    helperText={touched.buyerID && errors.buyerID}
                                                                    name="buyerID"
                                                                    onBlur={handleBlur}
                                                                    onChange={(e) => handleChange(e)}
                                                                    value={retrunTea.buyerID}
                                                                    variant="outlined"
                                                                    id="buyerID"
                                                                    size='small'
                                                                    InputProps={{
                                                                        readOnly: true
                                                                    }}
                                                                >
                                                                    <MenuItem value="0">--Select Buyers-- </MenuItem>
                                                                    {generateDropDownMenu(buyerList)}
                                                                </TextField>
                                                            </Grid>

                                                            <Grid item md={4} xs={12}>
                                                                <InputLabel shrink id="gradeID">
                                                                    Grade
                                                                </InputLabel>
                                                                <TextField select
                                                                    error={Boolean(touched.gradeID && errors.gradeID)}
                                                                    fullWidth
                                                                    helperText={touched.gradeID && errors.gradeID}
                                                                    name="gradeID"
                                                                    onBlur={handleBlur}
                                                                    onChange={(e) => handleChange(e)}
                                                                    value={retrunTea.gradeID}
                                                                    variant="outlined"
                                                                    id="gradeID"
                                                                    size='small'
                                                                    InputProps={{
                                                                        readOnly: true
                                                                    }}
                                                                >
                                                                    <MenuItem value={'0'}>--Select Grade--</MenuItem>
                                                                    {generateDropDownMenu(grades)}
                                                                </TextField>

                                                            </Grid>

                                                            <Grid item md={4} xs={12}>
                                                                <InputLabel shrink id="sellingMarksID">
                                                                    Selling Marks
                                                                </InputLabel>
                                                                <TextField select
                                                                    fullWidth
                                                                    name="sellingMarksID"
                                                                    onBlur={handleBlur}
                                                                    onChange={(e) => handleChange(e)}
                                                                    size='small'
                                                                    value={retrunTea.sellingMarksID}
                                                                    variant="outlined"
                                                                    id="sellingMarksID"
                                                                    InputProps={{
                                                                        readOnly: true
                                                                    }}
                                                                >
                                                                    <MenuItem value={'0'}>--Select Selling Mark--</MenuItem>
                                                                    {generateDropDownMenu(sellingMarks)}
                                                                </TextField>
                                                            </Grid>
                                                        </Grid>
                                                        <br />
                                                        <br />

                                                        <Grid container spacing={3}>
                                                            <Grid item md={4} xs={12}>
                                                                <InputLabel shrink id="catalogueDate">
                                                                    Catelogue Date
                                                                </InputLabel>
                                                                <TextField
                                                                    fullWidth
                                                                    name="catalogueDate"
                                                                    type="date"
                                                                    onChange={(e) => handleChange(e)}
                                                                    value={retrunTea.catalogueDate}
                                                                    variant="outlined"
                                                                    size='small'
                                                                    id="catalogueDate"
                                                                    InputProps={{
                                                                        readOnly: true
                                                                    }}
                                                                />
                                                            </Grid>

                                                            <Grid item md={4} xs={12}>
                                                                <InputLabel shrink id="lotNumber">
                                                                    Lot Number
                                                                </InputLabel>
                                                                <TextField
                                                                    error={Boolean(touched.lotNumber && errors.lotNumber)}
                                                                    fullWidth
                                                                    helperText={touched.lotNumber && errors.lotNumber}
                                                                    name="lotNumber"
                                                                    onBlur={handleBlur}
                                                                    onChange={(e) => handleChange(e)}
                                                                    value={retrunTea.lotNumber}
                                                                    variant="outlined"
                                                                    id="lotNumber"
                                                                    size='small'
                                                                    InputProps={{
                                                                        readOnly: true
                                                                    }}
                                                                >
                                                                </TextField>
                                                            </Grid>
                                                            <Grid item md={4} xs={12}>
                                                                <InputLabel shrink id="salesNumber">
                                                                    Sales Number
                                                                </InputLabel>
                                                                <TextField
                                                                    fullWidth
                                                                    name="salesNumber"
                                                                    onBlur={handleBlur}
                                                                    onChange={(e) => handleChange(e)}
                                                                    size='small'
                                                                    value={retrunTea.salesNumber}
                                                                    variant="outlined"
                                                                    id="salesNumber"
                                                                    InputProps={{
                                                                        readOnly: true
                                                                    }}
                                                                >
                                                                </TextField>
                                                            </Grid>
                                                            
                                                        </Grid>

                                                        <Grid container spacing={3}>

                                                            <Grid item md={4} xs={12}>
                                                                <InputLabel shrink id="noOfPacks">
                                                                    Number of Packs
                                                                </InputLabel>
                                                                <TextField
                                                                    fullWidth
                                                                    error={Boolean(touched.noOfPacks && errors.noOfPacks)}
                                                                    helperText={touched.noOfPacks && errors.noOfPacks}
                                                                    name="noOfPacks"
                                                                    onBlur={handleBlur}
                                                                    onChange={(e) => handleChange(e)}
                                                                    size='small'
                                                                    value={retrunTea.noOfPacks}
                                                                    variant="outlined"
                                                                    id="noOfPacks"
                                                                    type='number'
                                                                >
                                                                </TextField>
                                                            </Grid>
                                                            <Grid item md={4} xs={12}>
                                                                <InputLabel shrink id="packWeight">
                                                                    Pack Weight
                                                                </InputLabel>
                                                                <TextField
                                                                    fullWidth
                                                                    name="packWeight"
                                                                    onBlur={handleBlur}
                                                                    onChange={(e) => handleChange(e)}
                                                                    size='small'
                                                                    value={retrunTea.packWeight}
                                                                    variant="outlined"
                                                                    id="packWeight"
                                                                    InputProps={{
                                                                        readOnly: true
                                                                    }}
                                                                >
                                                                </TextField>
                                                            </Grid>

                                                            <Grid item md={4} xs={12}>
                                                                <InputLabel shrink id="netWeight">
                                                                    Net Weight
                                                                </InputLabel>
                                                                <TextField
                                                                    error={Boolean(touched.netWeight && errors.netWeight)}
                                                                    fullWidth
                                                                    helperText={touched.netWeight && errors.netWeight}
                                                                    name="netWeight"
                                                                    onBlur={handleBlur}
                                                                    onChange={(e) => handleChange(e)}
                                                                    value={Number((retrunTea.noOfPacks * retrunTea.packWeight).toFixed(2))}
                                                                    variant="outlined"
                                                                    id="netWeight"
                                                                    size='small'
                                                                    InputProps={{
                                                                        readOnly: true
                                                                    }}
                                                                >
                                                                </TextField>
                                                            </Grid>

                                                            
                                                        </Grid>
                                                    </>
                                                }

                                            </CardContent>
                                            <Box display="flex" justifyContent="flex-end" p={2}>
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
                        )
                        }
                    </Formik >
                </Container >
            </Page >
        </Fragment >
    );
};

