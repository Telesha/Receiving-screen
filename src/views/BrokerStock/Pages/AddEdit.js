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
    Divider,
    InputLabel,
    CardHeader,
    MenuItem
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import * as Yup from 'yup';
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from 'react-alert';
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { useFormik, Form, FormikProvider } from 'formik';

const useStyles = makeStyles(theme => ({
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

const screenCode = 'BROKERSTOCK';
export default function BrokerStockAddEdit(props) {
    const [title, setTitle] = useState('Add Broker Stock');
    const [isUpdate, setIsUpdate] = useState(false);
    const [isDisableButton, setIsDisableButton] = useState(false);
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [brokers, setBrokers] = useState();
    const [sellingMarks, setSellingMarks] = useState();
    const [grades, setGrades] = useState([]);
    const [invoiceNumber, setInvoiceNumber] = useState([]);
    const [dispatchDateVal, setDispatchDateVal] = useState(new Date());
    const [brokerStock, setBrokerStock] = useState({
        groupID: 0,
        factoryID: 0,
        brokerID: 0,
        date: null,
        sellingMarksID: 0,
        gradeID: 0,
        dispatchDate: new Date(),
        invoiceNumber: '',
        pkgs: 0,
        pkgWt: 0,
        grossQt: 0,
        stockQt: 0,
        statusID: 0,
        mainGrade: 0,
        offGrade: 0,
        totalQt: 0,
        invoiceQt: 0,
        brokerQt: 0,
        balance: 0,
        gradeTypeID: 0

    });
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });
    const navigate = useNavigate();
    const handleClick = () => {
        navigate('/app/brokerStock/listing');
    };
    const alert = useAlert();
    const { brokerStockID } = useParams();

    let decrypted = 0;

    const BrokerStockMarkSchema = Yup.object().shape({
        groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
        factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
        brokerID: Yup.number().required('Broker is required').min("1", 'Broker is required'),
        sellingMarksID: Yup.number().required('Selling Mark is required').min("1", 'Selling Mark is required'),
        gradeTypeID: Yup.number().required('Grade Type is required').min("1", 'Grade Type is required'),
        gradeID: Yup.number().required('Grade is required').min("1", 'Grade is required'),
        dispatchDate: Yup.string().nullable().required('Dispatch Date is required'),
        invoiceNumber: Yup.string().required('Invoice Number is required'),
        pkgs: Yup.number().required('Pkgs is required').min("1", 'Pkgs is required'),
        pkgWt: Yup.number().required('Package Weight is required').min("1", 'Package Weight is required'),
        grossQt: Yup.number().required('Gross Quantity is required').min("1", 'Gross Quantity is required'),
        stockQt: Yup.number().required('Stock Quantity is required').min("1", 'Stock Quantity is required'),
        statusID: Yup.number().required('Status Type is required').min("1", 'Status Type is required')
    });

    const formik = useFormik({
        initialValues: {
            groupID: brokerStock.groupID,
            factoryID: brokerStock.factoryID,
            brokerID: brokerStock.brokerID,
            sellingMarksID: brokerStock.sellingMarksID,
            gradeTypeID: brokerStock.gradeTypeID,
            gradeID: brokerStock.gradeID,
            dispatchDate: brokerStock.dispatchDate,
            invoiceNumber: brokerStock.invoiceNumber,
            pkgs: brokerStock.pkgs,
            pkgWt: brokerStock.pkgWt,
            grossQt: brokerStock.grossQt,
            stockQt: brokerStock.stockQt,
            statusID: brokerStock.statusID,
            mainGrade: brokerStock.mainGrade,
            offGrade: brokerStock.offGrade,
            totalQt: brokerStock.totalQt,
            invoiceQt: brokerStock.invoiceQt,
            brokerQt: brokerStock.brokerQt,
            balance: brokerStock.balance,
        },
        validationSchema: BrokerStockMarkSchema,
        onSubmit: (values) => {
            BrokerStockSave(values)
        },
    });

    useEffect(() => {
        trackPromise(
            getPermissions(),
            getGroupsForDropdown());
    }, []);

    useEffect(() => {
        if (formik.values.groupID != 0) {
            trackPromise(
                getFactoriesForDropdown()
            );
        }
    }, [formik.values.groupID]);

    useEffect(() => {
        if (formik.values.gradeTypeID != 0) {
            trackPromise(
                getAllGradesForDropdown()
            )
        }
    }, [formik.values.gradeTypeID]);

    useEffect(() => {
        if (formik.values.factoryID != 0) {
            trackPromise(
                getBrokersForDropdown(),
                getSellingMarkForDropdown()
            )
        }
    }, [formik.values.factoryID]);

    useEffect(() => {
        if ((brokerStock.factoryID != null) &&
            (brokerStock.brokerID != null)) {
            GetInvoiceNumbersForDropdown()
        }
    }, [
        formik.values.brokerID])

    useEffect(() => {
        decrypted = atob(brokerStockID.toString());
        if (decrypted != 0) {
            trackPromise(
                getDataForEdit(decrypted),
            )
        }
    }, []);

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getFactoriesForDropdown() {
        const factories = await services.getFactoryByGroupID(formik.values.groupID);
        setFactories(factories);
    }

    async function getBrokersForDropdown() {
        const brokers = await services.GetBrokerList(formik.values.groupID, formik.values.factoryID);
        setBrokers(brokers);
    }

    async function getSellingMarkForDropdown() {
        const sellingMarks = await services.GetSellingMarkList(formik.values.groupID, formik.values.factoryID);
        setSellingMarks(sellingMarks);
    }

    async function getAllGradesForDropdown() {
        const grades = await services.GetGradeList(formik.values.groupID, formik.values.factoryID, formik.values.gradeTypeID);
        setGrades(grades);
    }

    async function getPermissions() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(
            p => p.permissionCode == 'ADDEDITBROKERSTOCK'
        );

        if (isAuthorized === undefined) {
            navigate('/404');
        }
        var isGroupFilterEnabled = permissions.find(
            p => p.permissionCode == 'GROUPDROPDOWN'
        );
        var isFactoryFilterEnabled = permissions.find(
            p => p.permissionCode == 'FACTORYDROPDOWN'
        );

        setPermissions({
            ...permissionList,
            isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
            isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined
        });

        if (decrypted == 0) {
            setValues({
                ...values,
                groupID: parseInt(tokenService.getGroupIDFromToken()),
                factoryID: parseInt(tokenService.getFactoryIDFromToken())
            });
        }
    }

    async function getDataForEdit(brokerStockID) {
        let response = await services.GetBrokerStockDetailsBybrokerStockID(brokerStockID);
        setValues({
            ...values,
            groupID: response.groupID,
            factoryID: response.factoryID,
            brokerID: parseInt(response.brokerID),
            sellingMarksID: parseInt(response.sellingMarksID),
            gradeTypeID: parseInt(response.gradeTypeID),
            gradeID: parseInt(response.gradeID),
            dispatchDate: new Date(response.dispatchDate.split('T')[0]),
            invoiceNumber: response.invoiceNumber,
            pkgs: parseInt(response.pkgs),
            pkgWt: parseFloat(response.pkgWt),
            grossQt: parseFloat(response.grossQt),
            stockQt: parseFloat(response.stockQt),
            statusID: parseInt(response.statusID),
            mainGrade: parseFloat(response.mainGrade),
            offGrade: parseFloat(response.offGrade),
            totalQt: parseFloat(response.totalQt),
            invoiceQt: parseFloat(response.invoiceQt),
            brokerQt: parseFloat(response.brokerQt),
            balance: parseFloat(response.balance),
        });
        setTitle("Edit Broker Stock");
        setDispatchDateVal(new Date(response.dispatchDate.split('T')[0]))
        setIsUpdate(true);
    }

    const { errors, setValues, touched, handleSubmit, isSubmitting, values, handleBlur } = formik;

    async function BrokerStockSave(values) {
        if (isUpdate == true) {
            let model = {
                brokerStockID: parseInt(atob(brokerStockID.toString())),
                groupID: parseInt(values.groupID),
                factoryID: parseInt(values.factoryID),
                brokerID: parseInt(values.brokerID),
                sellingMarksID: parseInt(values.sellingMarksID),
                gradeTypeID: parseInt(values.gradeTypeID),
                gradeID: parseInt(values.gradeID),
                dispatchDate: dispatchDateVal,
                invoiceNumber: values.invoiceNumber,
                pkgs: parseInt(values.pkgs),
                pkgWt: parseFloat(values.pkgWt),
                grossQt: parseFloat(values.grossQt),
                stockQt: parseFloat(values.stockQt),
                statusID: parseInt(values.statusID),
                mainGrade: parseFloat(values.mainGrade),
                offGrade: parseFloat(values.offGrade),
                totalQt: parseFloat(values.totalQt),
                invoiceQt: parseFloat(values.invoiceQt),
                brokerQt: parseFloat(values.brokerQt),
                balance: parseFloat(values.balance)
            }

            let response = await services.UpdateBrokerStock(model);
            if (response.statusCode == "Success") {
                alert.success("Broker Stock saved succefully!");
                setIsDisableButton(true);
                navigate('/app/brokerStock/listing');
                setIsUpdate(false);
            }
            else {
                setBrokerStock({
                    ...brokerStock,
                    isActive: isDisableButton
                })
                alert.error("Broker Stock not saved!");
                setIsUpdate(false);
            }
        } else {
            let saveModel = {
                groupID: parseInt(values.groupID),
                factoryID: parseInt(values.factoryID),
                brokerID: parseInt(values.brokerID),
                sellingMarksID: parseInt(values.sellingMarksID),
                gradeTypeID: parseInt(values.gradeTypeID),
                gradeID: parseInt(values.gradeID),
                dispatchDate: dispatchDateVal,
                invoiceNumber: values.invoiceNumber,
                pkgs: parseInt(values.pkgs),
                pkgWt: parseFloat(values.pkgWt),
                grossQt: parseFloat(values.grossQt),
                stockQt: parseFloat(values.stockQt),
                statusID: parseInt(values.statusID),
                mainGrade: parseFloat(values.mainGrade),
                offGrade: parseFloat(values.offGrade),
                totalQt: parseFloat(values.totalQt),
                invoiceQt: parseFloat(values.invoiceQt),
                brokerQt: parseFloat(values.brokerQt),
                balance: parseFloat(values.balance),
            }
            let response = await services.SaveBrokerStock(saveModel);
            if (response.statusCode == "Success") {
                alert.success("Broker Stock saved succefully!");
                setIsDisableButton(true);
                navigate('/app/brokerStock/listing');
                setIsUpdate(false);
            }
            else {
                alert.error("Broker Stock not saved!");
                setIsUpdate(false);
            }
        }
    }

    async function GetInvoiceNumbersForDropdown() {
        let model = {
            groupID: parseInt(values.groupID),
            factoryID: parseInt(values.factoryID),
            brokerID: parseInt(values.brokerID)
        };
        const response = await services.GetInvoiceNumbersByBrokerID(model);
        setInvoiceNumber(response);
    }

    function generateDropDownMenu(data) {
        let items = [];
        if (data != null) {
            for (const [key, value] of Object.entries(data)) {
                items.push(
                    <MenuItem key={key} value={key}>
                        {value}
                    </MenuItem>
                );
            }
        }
        return items;
    }

    function handleDispatchDateChange(value) {
        setDispatchDateVal(value);
    }

    function clearFormFields() {
        if (isUpdate == true) {
            alert.info("Broker Stock update canceled!");
        }
        else {
            alert.info("Broker Stock saving canceled!");
        }
        navigate('/app/brokerStock/listing');
    }

    function cardTitle(titleName) {
        return (
            <Grid container spacing={1}>
                <Grid item md={10} xs={12}>
                    {titleName}
                </Grid>
                <Grid item md={2} xs={12}>
                    <PageHeader onClick={handleClick} />
                </Grid>
            </Grid>
        );
    }

    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <FormikProvider value={formik}>
                        <Form autoComplete="off"
                            disabled={!(formik.isValid && formik.dirty)}
                            noValidate onSubmit={handleSubmit}
                        >
                            <Box mt={0}>
                                <Card>
                                    <CardHeader title={cardTitle(title)} />
                                    <PerfectScrollbar>
                                        <Divider />
                                        <CardContent>
                                            <Grid container spacing={3}>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="groupID">
                                                        Group *
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.groupID && errors.groupID)}
                                                        fullWidth
                                                        helperText={touched.groupID && errors.groupID}
                                                        name="groupID"
                                                        onBlur={handleBlur}
                                                        onChange={formik.handleChange}
                                                        value={formik.values.groupID}
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
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="factoryID">
                                                        Factory *
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.factoryID && errors.factoryID)}
                                                        fullWidth
                                                        helperText={touched.factoryID && errors.factoryID}
                                                        name="factoryID"
                                                        onBlur={handleBlur}
                                                        onChange={formik.handleChange}
                                                        value={formik.values.factoryID}
                                                        variant="outlined"
                                                        id="factoryID"
                                                        size='small'
                                                        InputProps={{
                                                            readOnly: isUpdate || !permissionList.isFactoryFilterEnabled ? true : false
                                                        }}
                                                    >
                                                        <MenuItem value="0">--Select Factory--</MenuItem>
                                                        {generateDropDownMenu(factories)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="brokerID">
                                                        Broker Name *
                                                    </InputLabel>
                                                    <TextField
                                                        select
                                                        error={Boolean(touched.brokerID && errors.brokerID)}
                                                        fullWidth
                                                        helperText={touched.brokerID && errors.brokerID}
                                                        size='small'
                                                        name="brokerID"
                                                        onBlur={handleBlur}
                                                        onChange={formik.handleChange}
                                                        value={formik.values.brokerID}
                                                        variant="outlined"
                                                        id="brokerID"
                                                        disabled={!permissionList.isGroupFilterEnabled}
                                                    >
                                                        <MenuItem value="0">--Select Broker--</MenuItem>
                                                        {generateDropDownMenu(brokers)}
                                                    </TextField>
                                                </Grid>
                                            </Grid>
                                            <Grid container spacing={3}>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="sellingMarksID">
                                                        Selling Mark *
                                                    </InputLabel>
                                                    <TextField
                                                        select
                                                        error={Boolean(touched.sellingMarksID && errors.sellingMarksID)}
                                                        fullWidth
                                                        helperText={touched.sellingMarksID && errors.sellingMarksID}
                                                        size='small'
                                                        name="sellingMarksID"
                                                        onBlur={handleBlur}
                                                        onChange={formik.handleChange}
                                                        value={formik.values.sellingMarksID}
                                                        variant="outlined"
                                                        id="sellingMarksID"
                                                    >
                                                        <MenuItem value="0">--Select Selling Mark--</MenuItem>
                                                        {generateDropDownMenu(sellingMarks)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="gradeTypeID">
                                                        Grade Type *
                                                    </InputLabel>
                                                    <TextField
                                                        select
                                                        error={Boolean(touched.gradeTypeID && errors.gradeTypeID)}
                                                        fullWidth
                                                        helperText={touched.gradeTypeID && errors.gradeTypeID}
                                                        size='small'
                                                        name="gradeTypeID"
                                                        onBlur={handleBlur}
                                                        onChange={formik.handleChange}
                                                        value={formik.values.gradeTypeID}
                                                        variant="outlined"
                                                        id="brokerID"
                                                    >
                                                        <MenuItem value="0">--Select Grade Type--</MenuItem>
                                                        <MenuItem value="1">Main Grade</MenuItem>
                                                        <MenuItem value="2">Off Grade</MenuItem>
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="gradeID">
                                                        Grade *
                                                    </InputLabel>
                                                    <TextField
                                                        select
                                                        error={Boolean(touched.gradeID && errors.gradeID)}
                                                        fullWidth
                                                        helperText={touched.gradeID && errors.gradeID}
                                                        size='small'
                                                        name="gradeID"
                                                        onBlur={handleBlur}
                                                        onChange={formik.handleChange}
                                                        value={formik.values.gradeID}
                                                        variant="outlined"
                                                        id="gradeID"
                                                    >
                                                        <MenuItem value="0">--Select Grade--</MenuItem>
                                                        {generateDropDownMenu(grades)}
                                                    </TextField>
                                                </Grid>
                                            </Grid>
                                            <Grid container spacing={3}>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="sellingDate">
                                                        Dispatch Date *
                                                    </InputLabel>
                                                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                        <KeyboardDatePicker
                                                            error={Boolean(touched.dispatchDate && errors.dispatchDate)}
                                                            helperText={touched.dispatchDate && errors.dispatchDate}
                                                            autoOk
                                                            fullWidth
                                                            variant="inline"
                                                            format="dd/MM/yyyy"
                                                            margin="dense"
                                                            name="dispatchDate"
                                                            id="dispatchDate"
                                                            value={dispatchDateVal}
                                                            onChange={(e) => {
                                                                handleDispatchDateChange(e);
                                                            }}
                                                            KeyboardButtonProps={{
                                                                'aria-label': 'change date',
                                                            }}
                                                            InputProps={{ readOnly: true }}
                                                        />
                                                    </MuiPickersUtilsProvider>
                                                </Grid>
                                                <Grid item md={3} xs={8}>
                                                    <InputLabel shrink id="invoiceNumber">
                                                        Invoice Number *
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.invoiceNumber && errors.invoiceNumber)}
                                                        fullWidth
                                                        helperText={touched.invoiceNumber && errors.invoiceNumber}
                                                        size='small'
                                                        name="invoiceNumber"
                                                        onBlur={handleBlur}
                                                        onChange={formik.handleChange}
                                                        value={formik.values.invoiceNumber}
                                                        variant="outlined"
                                                        id="invoiceNumber"
                                                        disabled={!permissionList.isGroupFilterEnabled}
                                                    >
                                                        <MenuItem value="0">--Select Invoice Number--</MenuItem>
                                                        {generateDropDownMenu(invoiceNumber)}
                                                    </TextField>
                                                </Grid>
                                            </Grid>
                                            <Grid container spacing={3}>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="pkgs">
                                                        PKGS *
                                                    </InputLabel>
                                                    <TextField
                                                        error={Boolean(
                                                            touched.pkgs && errors.pkgs
                                                        )}
                                                        fullWidth
                                                        helperText={touched.pkgs && errors.pkgs}
                                                        size='small'
                                                        name="pkgs"
                                                        onBlur={handleBlur}
                                                        onChange={formik.handleChange}
                                                        value={formik.values.pkgs}
                                                        variant="outlined"
                                                        disabled={isDisableButton}
                                                        multiline={true}
                                                    />
                                                </Grid>
                                            </Grid>
                                            <Grid container spacing={3}>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="customerAddress">
                                                        Package Weight *
                                                    </InputLabel>
                                                    <TextField
                                                        error={Boolean(touched.pkgWt && errors.pkgWt)}
                                                        fullWidth
                                                        helperText={touched.pkgWt && errors.pkgWt}
                                                        size='small'
                                                        name="pkgWt"
                                                        onBlur={handleBlur}
                                                        onChange={formik.handleChange}
                                                        value={formik.values.pkgWt}
                                                        variant="outlined"
                                                        disabled={isDisableButton}
                                                        multiline={true}
                                                    />
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="grossQt">
                                                        Gross Quantity *
                                                    </InputLabel>
                                                    <TextField
                                                        error={Boolean(touched.grossQt && errors.grossQt)}
                                                        fullWidth
                                                        helperText={touched.grossQt && errors.grossQt}
                                                        size='small'
                                                        name="grossQt"
                                                        onBlur={handleBlur}
                                                        onChange={formik.handleChange}
                                                        value={formik.values.grossQt}
                                                        variant="outlined"
                                                        disabled={isDisableButton}
                                                        multiline={true}
                                                    />
                                                </Grid>
                                            </Grid>
                                            <Grid container spacing={3}>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="stockQt">
                                                        Stock Quantity *
                                                    </InputLabel>
                                                    <TextField
                                                        error={Boolean(touched.stockQt && errors.stockQt)}
                                                        fullWidth
                                                        helperText={touched.stockQt && errors.stockQt}
                                                        size='small'
                                                        name="stockQt"
                                                        onBlur={handleBlur}
                                                        onChange={formik.handleChange}
                                                        value={formik.values.stockQt}
                                                        variant="outlined"
                                                        disabled={isDisableButton}
                                                        multiline={true}
                                                    />
                                                </Grid>
                                            </Grid>
                                            <Grid container spacing={3}>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="statusID">
                                                        Status *
                                                    </InputLabel>
                                                    <TextField
                                                        select
                                                        error={Boolean(touched.statusID && errors.statusID)}
                                                        fullWidth
                                                        helperText={touched.statusID && errors.statusID}
                                                        size='small'
                                                        name="statusID"
                                                        onBlur={handleBlur}
                                                        onChange={formik.handleChange}
                                                        value={formik.values.statusID}
                                                        variant="outlined"
                                                        id="statusID"
                                                    >
                                                        <MenuItem value="0">--Select Status Type--</MenuItem>
                                                        <MenuItem value="1">Catelogue</MenuItem>
                                                        <MenuItem value="2">Pending</MenuItem>
                                                        <MenuItem value="3">Shotout</MenuItem>
                                                        <MenuItem value="4">Unsold</MenuItem>
                                                        <MenuItem value="5">Withdraw</MenuItem>
                                                    </TextField>
                                                </Grid>
                                            </Grid>
                                            <Grid container spacing={3}>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="mainGrade">
                                                        Main Grade
                                                    </InputLabel>
                                                    <TextField
                                                        error={Boolean(touched.mainGrade && errors.mainGrade)}
                                                        fullWidth
                                                        helperText={touched.mainGrade && errors.mainGrade}
                                                        size='small'
                                                        name="mainGrade"
                                                        onBlur={handleBlur}
                                                        onChange={formik.handleChange}
                                                        value={formik.values.mainGrade}
                                                        variant="outlined"
                                                        disabled={isDisableButton}
                                                        multiline={true}
                                                    />
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="offGrade">
                                                        Off Grade
                                                    </InputLabel>
                                                    <TextField
                                                        error={Boolean(touched.offGrade && errors.offGrade)}
                                                        fullWidth
                                                        helperText={touched.offGrade && errors.offGrade}
                                                        size='small'
                                                        name="offGrade"
                                                        onBlur={handleBlur}
                                                        onChange={formik.handleChange}
                                                        value={formik.values.offGrade}
                                                        variant="outlined"
                                                        disabled={isDisableButton}
                                                        multiline={true}
                                                    />
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="totalQt">
                                                        Total Quantity
                                                    </InputLabel>
                                                    <TextField
                                                        error={Boolean(touched.totalQt && errors.totalQt)}
                                                        fullWidth
                                                        helperText={touched.totalQt && errors.totalQt}
                                                        size='small'
                                                        name="totalQt"
                                                        onBlur={handleBlur}
                                                        onChange={formik.handleChange}
                                                        value={formik.values.totalQt}
                                                        variant="outlined"
                                                        disabled={isDisableButton}
                                                        multiline={true}
                                                    />
                                                </Grid>
                                            </Grid>
                                            <Grid container spacing={3}>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="invoiceQt">
                                                        Invoice Quantity
                                                    </InputLabel>
                                                    <TextField
                                                        error={Boolean(touched.invoiceQt && errors.invoiceQt)}
                                                        fullWidth
                                                        helperText={touched.invoiceQt && errors.invoiceQt}
                                                        size='small'
                                                        name="invoiceQt"
                                                        onBlur={handleBlur}
                                                        onChange={formik.handleChange}
                                                        value={formik.values.invoiceQt}
                                                        variant="outlined"
                                                        disabled={isDisableButton}
                                                        multiline={true}
                                                    />
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="brokerQt">
                                                        Broker Quantity
                                                    </InputLabel>
                                                    <TextField
                                                        error={Boolean(touched.brokerQt && errors.brokerQt)}
                                                        fullWidth
                                                        helperText={touched.brokerQt && errors.brokerQt}
                                                        size='small'
                                                        name="brokerQt"
                                                        onBlur={handleBlur}
                                                        onChange={formik.handleChange}
                                                        value={formik.values.brokerQt}
                                                        variant="outlined"
                                                        disabled={isDisableButton}
                                                        multiline={true}
                                                    />
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="comment">
                                                        Balanace to be send
                                                    </InputLabel>
                                                    <TextField
                                                        error={Boolean(touched.balance && errors.balance)}
                                                        fullWidth
                                                        helperText={touched.balance && errors.balance}
                                                        size='small'
                                                        name="balance"
                                                        onBlur={handleBlur}
                                                        onChange={formik.handleChange}
                                                        value={formik.values.balance}
                                                        variant="outlined"
                                                        disabled={isDisableButton}
                                                        multiline={true}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                        <Box display="flex" justifyContent="flex-end" p={2}>
                                            <Button
                                                color="primary"
                                                type="reset"
                                                variant="outlined"
                                                onClick={() => clearFormFields()}
                                            >
                                                Cancel
                                            </Button>
                                            <div>&nbsp;</div>
                                            <Button
                                                color="primary"
                                                disabled={isSubmitting || isDisableButton}
                                                type="submit"
                                                variant="contained"
                                            >
                                                {isUpdate == true ? "Update" : "Save"}
                                            </Button>
                                        </Box>
                                    </PerfectScrollbar>
                                </Card>
                            </Box>
                        </Form>
                    </FormikProvider>
                </Container>
            </Page >
        </Fragment >
    );
}
