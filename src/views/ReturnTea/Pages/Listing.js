import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Button, Card, makeStyles, Container, CardHeader, CardContent, Divider, MenuItem, Grid, InputLabel, TextField } from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder'
import { LoadingComponent } from './../../../utils/newLoader';
import MaterialTable from "material-table";
import { useAlert } from 'react-alert';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { AgriGenERPEnum } from '../../Common/AgriGenERPEnum/AgriGenERPEnum';
import { DatePicker } from "@material-ui/pickers";
import CountUp from 'react-countup';

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
    row: {
        marginTop: '1rem'
    }
}));

const screenCode = 'RETURNTEA';

export default function ReturnTeaListing() {
    const agriGenERPEnum = new AgriGenERPEnum();
    const [title, setTitle] = useState("Returned Tea");
    const classes = useStyles();
    const [GroupList, setGroupList] = useState([]);
    const [FactoryList, setFactoryList] = useState([]);
    const [InvoiceList, setInvoiceList] = useState([]);
    const [Brokers, setBrokers] = useState([]);
    const [BuyerList, setBuyerList] = useState([]);
    const [SellingMarks, setSellingMarks] = useState([]);
    const [Grades, setGrades] = useState([]);
    const [invoiceStatus, setInvoiceStatus] = useState([]);
    const [selectedDispatchDate, setSelectedDispatchDate] = useState(new Date());
    const [status, setStatus] = useState([]);
    const [returnTeaDetails, setReturnTeaDetails] = useState({
        groupID: 0,
        factoryID: 0,
        invNo: 0,
        dispatchDate: '',
        returnFrom: '',
        brokerID: 0,
        buyerID: 0,
        typeID: 0
    });
    const [returnTeaListing, setReturnTeaListing] = useState([]);
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });
    const navigate = useNavigate();
    const alert = useAlert();
    let encrypted = "";
    const handleClick = () => {
        encrypted = btoa('0');
        navigate('/app/returnTea/addEdit/' + encrypted)
    }

    const handleClickEdit = (returnTeaID) => {
        encrypted = btoa(returnTeaID.toString());
        navigate('/app/returnTea/addEdit/' + encrypted);
    }

    useEffect(() => {
        trackPromise(
            getPermission());
        trackPromise(
            getGroupsForDropdown());
    }, []);

    useEffect(() => {
        if (returnTeaDetails.groupID > 0) {
            trackPromise(
                getFactoriesForDropdown(),
                getStatusForDropdown());
        }
    }, [returnTeaDetails.groupID]);

    useEffect(() => {
        if (returnTeaDetails.factoryID > 0) {
            trackPromise(
                getFactoriesForDropdown(),
                getAllInvoiceNumbers(),
                getBrokersForDropdown(),
                getBuyersForDropdown(),
                getSellingMarksForDropdown(),
                getGradesForDropdown()
            );
        }
    }, [returnTeaDetails.factoryID]);

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

        setReturnTeaDetails({
            ...returnTeaDetails,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroupList(groups);
    }

    async function getFactoriesForDropdown() {
        const factories = await services.getFactoryByGroupID(returnTeaDetails.groupID);
        setFactoryList(factories);
    }

    async function getAllInvoiceNumbers() {
        const invoice = await services.getAllInvoiceNumbers(returnTeaDetails.groupID, returnTeaDetails.factoryID);
        setInvoiceList(invoice);
    }

    async function getBrokersForDropdown() {
        const brokers = await services.getBrokerList(returnTeaDetails.groupID, returnTeaDetails.factoryID);
        setBrokers(brokers);
    }

    async function getBuyersForDropdown() {
        const buyers = await services.getBuyerList(returnTeaDetails.groupID, returnTeaDetails.factoryID);
        setBuyerList(buyers);
    }

    async function getSellingMarksForDropdown() {
        const sellingMarks = await services.getSellingMarkList(returnTeaDetails.groupID, returnTeaDetails.factoryID);
        setSellingMarks(sellingMarks);
    }

    async function getGradesForDropdown() {
        const grades = await services.getGradeDetails(returnTeaDetails.groupID, returnTeaDetails.factoryID);
        setGrades(grades);
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


    async function getReturnTeaDetails() {
        let model = {
            factoryID: parseInt(returnTeaDetails.factoryID),
            teaProductDispatchID: parseInt(returnTeaDetails.invNo),
            dispatchDate: (selectedDispatchDate.toISOString().split('T')[0]).split('-')[0],
            returnFrom: returnTeaDetails.returnFrom == 0 ? null : returnTeaDetails.returnFrom,
            brokerID: returnTeaDetails.brokerID == 0 ? null : returnTeaDetails.brokerID,
            buyerID: returnTeaDetails.buyerID == 0 ? null : returnTeaDetails.buyerID,
            typeID: parseInt(returnTeaDetails.typeID)
        }
        const response = await services.getReturnTeaDetails(model);
        if (response.statusCode == "Success" && response.data != null) {
            response.data.forEach((x) => {
                x.returnDate = x.returnDate.split('T')[0]
                x.sellingMarkID = SellingMarks[x.sellingMarkID]
                x.brokerID = Brokers[x.brokerID]
                x.buyerID == 0 ? x.buyerID = '-' : x.buyerID = BuyerList[x.buyerID]
                x.teaGradeID = Grades[x.teaGradeID]
                x.returnedNetWeight = x.returnedNetWeight.toFixed(2)
                x.returnedAmount = <CountUp
                    end={x.returnedAmount.toFixed(2)}
                    decimals={2}
                    separator=','
                    decimal="."
                    duration={0.1}
                />
            })
            setReturnTeaListing(response.data);
            if (response.data.length == 0) {
                alert.error("No records to display");
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
        setReturnTeaDetails({
            ...returnTeaDetails,
            [e.target.name]: value
        });
        setReturnTeaListing([])
    }

    function handleTypeChange(e) {
        const target = e.target;
        const value = target.value

        setReturnTeaDetails({
            ...returnTeaDetails,
            [e.target.name]: value,
            statusCode: status[value]
        })
        status[value] == agriGenERPEnum.InvoiceStatusCode.Withdraw ?
            setTitle("Withdrawn Tea")
            :
            setTitle("Return Tea")
    }

    function clearFormFields() {
        setReturnTeaDetails({
            ...returnTeaDetails,
            invNo: 0,
            dispatchDate: '',
            returnFrom: '',
            brokerID: 0,
            buyerID: 0,
            typeID: 0
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
                        toolTiptitle={"Edit Return Tea"}
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
                            groupID: returnTeaDetails.groupID,
                            factoryID: returnTeaDetails.factoryID,
                            invNo: returnTeaDetails.invNo,
                            typeID: returnTeaDetails.typeID
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
                                invNo: Yup.number().required('Invoice Number is required').min("1", 'Invoice Number is required'),
                                typeID: Yup.number().required('Type is required').min("1", 'Type is required'),
                            })
                        }
                        onSubmit={() => trackPromise(getReturnTeaDetails())}
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
                                        <CardHeader title={cardTitle(title)} />
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
                                                            name="groupID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={returnTeaDetails.groupID}
                                                            variant="outlined"
                                                            id="groupID"
                                                            size='small'
                                                            disabled={!permissionList.isGroupFilterEnabled}
                                                        >
                                                            <MenuItem value="0">--Select Group--</MenuItem>
                                                            {generateDropDownMenu(GroupList)}
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
                                                            value={returnTeaDetails.factoryID}
                                                            variant="outlined"
                                                            id="factoryID"
                                                            size='small'
                                                            disabled={!permissionList.isFactoryFilterEnabled}
                                                        >
                                                            <MenuItem value="0">--Select Factory--</MenuItem>
                                                            {generateDropDownMenu(FactoryList)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={8}>
                                                        <InputLabel shrink id="invNo">
                                                            Invoice Number *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.invNo && errors.invNo)}
                                                            fullWidth
                                                            helperText={touched.invNo && errors.invNo}
                                                            name="invNo"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={returnTeaDetails.invNo}
                                                            variant="outlined"
                                                            id="invNo"
                                                            size='small'
                                                        >
                                                            <MenuItem value="0">--Select Invoice Number--</MenuItem>
                                                            {generateDropDownMenu(InvoiceList)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={8}>
                                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                            <DatePicker
                                                                autoOk
                                                                variant="inline"
                                                                openTo="month"
                                                                views={["year"]}
                                                                label="Dispatch Year *"
                                                                helperText="Select dispatch year"
                                                                value={selectedDispatchDate}
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
                                                            error={Boolean(touched.groupID && errors.typeID)}
                                                            fullWidth
                                                            helperText={touched.groupID && errors.typeID}
                                                            name="typeID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleTypeChange(e)}
                                                            value={returnTeaDetails.typeID}
                                                            variant="outlined"
                                                            id="typeID"
                                                            size='small'
                                                        >
                                                            <MenuItem value="0">--Select Type-- </MenuItem>
                                                            {generateDropDownMenu(invoiceStatus)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={8}>
                                                        <InputLabel shrink id="returnFrom">
                                                            Return From
                                                        </InputLabel>
                                                        <TextField select
                                                            fullWidth
                                                            name="returnFrom"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={returnTeaDetails.returnFrom}
                                                            variant="outlined"
                                                            id="returnFrom"
                                                            size='small'
                                                        >
                                                            <MenuItem value="0">--Select Return From-- </MenuItem>
                                                            <MenuItem value="1">Broker</MenuItem>
                                                            <MenuItem value="2">Buyer</MenuItem>
                                                        </TextField>
                                                    </Grid>
                                                    {returnTeaDetails.returnFrom > 0 ? (
                                                        returnTeaDetails.returnFrom == agriGenERPEnum.ReturnTeaFrom.Broker ?
                                                            <Grid item md={3} xs={8}>
                                                                <InputLabel shrink id="brokerID">
                                                                    Broker
                                                                </InputLabel>
                                                                <TextField select
                                                                    fullWidth
                                                                    name="brokerID"
                                                                    onBlur={handleBlur}
                                                                    onChange={(e) => handleChange(e)}
                                                                    value={returnTeaDetails.brokerID}
                                                                    variant="outlined"
                                                                    id="brokerID"
                                                                    size='small'
                                                                >
                                                                    <MenuItem value="0">Select Broker</MenuItem>
                                                                    {generateDropDownMenu(Brokers)}
                                                                </TextField>
                                                            </Grid>
                                                            :
                                                            <Grid item md={3} xs={8}>
                                                                <InputLabel shrink id="buyerID">
                                                                    Buyer
                                                                </InputLabel>
                                                                <TextField select
                                                                    fullWidth
                                                                    name="buyerID"
                                                                    onBlur={handleBlur}
                                                                    onChange={(e) => handleChange(e)}
                                                                    value={returnTeaDetails.buyerID}
                                                                    variant="outlined"
                                                                    id="buyerID"
                                                                    size='small'
                                                                >
                                                                    <MenuItem value="0"> Select Buyer</MenuItem>
                                                                    {generateDropDownMenu(BuyerList)}
                                                                </TextField>
                                                            </Grid>
                                                    )
                                                        : null}

                                                </Grid>
                                                <Box display="flex" justifyContent="flex-end" p={2} >
                                                    <Button
                                                        color="primary"
                                                        type="reset"
                                                        variant="outlined"
                                                        onClick={() => clearFormFields()}
                                                        size='small'
                                                    >
                                                        Clear
                                                    </Button>
                                                    <div>&nbsp;</div>
                                                    <Button
                                                        color="primary"
                                                        type="submit"
                                                        variant="contained"
                                                        size='small'
                                                    >
                                                        Search
                                                    </Button>
                                                </Box>
                                            </CardContent>
                                            <Box minWidth={1050}>
                                                {returnTeaListing.length > 0 ?
                                                    <MaterialTable
                                                        title="Multiple Actions Preview"
                                                        columns={[
                                                            { title: 'Return Date', field: 'returnDate' },
                                                            { title: 'Invoice Number', field: 'invoiceNo' },
                                                            { title: 'Broker Name', field: 'brokerID' },
                                                            { title: 'Buyer Name', field: 'buyerID' },
                                                            { title: 'Selling Marks', field: 'sellingMarkID' },
                                                            { title: 'Grade', field: 'teaGradeID' },
                                                            { title: 'Return-Quantity (Kg)', field: 'returnedNetWeight' },
                                                            { title: 'Return-Amount (Rs)', field: 'returnedAmount' },
                                                        ]}
                                                        data={returnTeaListing}
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
                                                            onClick: (event, rowData) => handleClickEdit(rowData.returnedTeaID)
                                                        }]}
                                                    />
                                                    : null}
                                            </Box>
                                        </PerfectScrollbar>
                                    </Card>
                                </Box>
                            </form>)}
                    </Formik>
                </Container>
            </Page >
        </Fragment >
    );
}
