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
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import * as Yup from "yup";
import { LoadingComponent } from 'src/utils/newLoader';
import { Formik, validateYupSchema } from 'formik';
import { DatePicker, MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import moment from 'moment';
import { useAlert } from "react-alert";
import _ from 'lodash';
import xlsx from 'json-as-xlsx';
import ReactToPrint from "react-to-print";
import CreatePDF from './CreatePDF';
import MaterialTable from "material-table";

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

const screenCode = 'STOKEBALANCEREPORT';

export default function GreenLeafRouteDetails(props) {
    const [title, setTitle] = useState("Available GRN Report")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [stockBalanceDetails, setStockBalanceDetails] = useState([]);
    const [csvHeaders, SetCsvHeaders] = useState([]);
    const [ItemCategoryList, setItemCategoryList] = useState();
    const [factoryItems, setFactoryItems] = useState();

    const [stockBalanceReportInput, setStockBalanceReportInput] = useState({
        groupID: '0',
        factoryID: '0',
        itemCategoryID: 0,
        factoryItemID: 0,
        date: ''
    });
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });
    const [selectedSearchValues, setSelectedSearchValues] = useState({
        factoryName: "0",
        groupName: "0"
    })

    const navigate = useNavigate();
    const alert = useAlert();
    const componentRef = useRef();

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission());
    }, []);

    useEffect(() => {
        trackPromise(getFactoriesForDropDown());
    }, [stockBalanceReportInput.groupID]);

    useEffect(() => {
        trackPromise(getAllActiveItemCategory())
    }, []);

    useEffect(() => {
        trackPromise(
            getfactoryItemsForDropDown());
    }, [stockBalanceReportInput.groupID, stockBalanceReportInput.factoryID, stockBalanceReportInput.itemCategoryID]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWSTOKEBALANCEREPORT');

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

        setStockBalanceReportInput({
            ...stockBalanceReportInput,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getFactoriesForDropDown() {
        const factory = await services.getFactoryByGroupID(stockBalanceReportInput.groupID);
        setFactories(factory);
    }

    async function getAllActiveItemCategory() {
        const result = await services.getAllActiveItemCategory();
        setItemCategoryList(result);
    }

    async function getfactoryItemsForDropDown() {
        const factoryItem = await services.getfactoryItemsByGroupIDFactoryIDItemCategoryID(stockBalanceReportInput.groupID, stockBalanceReportInput.factoryID, stockBalanceReportInput.itemCategoryID);
        setFactoryItems(factoryItem);
    }

    async function GetDetails() {
        let model = {
            groupID: parseInt(stockBalanceReportInput.groupID),
            factoryID: parseInt(stockBalanceReportInput.factoryID),
            itemCategoryID: parseInt(stockBalanceReportInput.itemCategoryID),
            factoryItemID: parseInt(stockBalanceReportInput.factoryItemID),
        }
        getSelectedDropdownValuesForReport(model);

        const response = await services.getStockBalanceDetailsForReport(model);
        if (response.statusCode == "Success" && response.data != null) {
            setStockBalanceDetails(response.data);
            if (response.data.length == 0) {
                alert.error("No records to display");
            }
        }
        else {
            alert.error(response.message);
        }
    }

    async function createDataForExcel(array) {
        var res = [];
        if (array != null) {
            array.map(x => {
                var vr = {
                    'Item Category': x.categoryName,
                    'Factory Item': x.itemName,
                    'GRN Number': x.grnNumber,
                    'Supplier Name': x.supplierName,
                    'Quantity': x.quantity,
                    'Unit Price (LKR)': x.unitPrice.toFixed(2),
                    'Total Price (LKR)': (x.quantity * x.unitPrice).toFixed(2),
                }
                res.push(vr);
            });
        }
        return res;
    }

    async function createFile() {
        var file = await createDataForExcel(stockBalanceDetails);
        var settings = {
            sheetName: 'Available GRN Report',
            fileName: 'Available GRN Report  ' + ' - ' + selectedSearchValues.groupName + ' - ' + selectedSearchValues.factoryName + ' - ' + stockBalanceReportInput.date,
            writeOptions: {}
        }
        let keys = Object.keys(file[0])
        let tempcsvHeaders = csvHeaders;
        keys.map((sitem, i) => {
            tempcsvHeaders.push({ label: sitem, value: sitem })
        })
        let dataA = [
            {
                sheet: 'Available GRN Report',
                columns: tempcsvHeaders,
                content: file
            }
        ]
        xlsx(dataA, settings);
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
            </Grid>
        )
    }

    function handleChange(e) {
        const target = e.target;
        const value = target.value
        setStockBalanceReportInput({
            ...stockBalanceReportInput,
            [e.target.name]: value
        });
        setStockBalanceDetails([]);
    }

    function handleDateChange(e) {
        setSelectedDate(e);
        setStockBalanceReportInput({
            ...stockBalanceReportInput,
            date: selectedDate.toISOString().split('T')[0]
        });
        setStockBalanceDetails([]);
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            factoryName: factories[searchForm.factoryID],
            groupName: groups[searchForm.groupID]
        })
    }

    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: stockBalanceReportInput.groupID,
                            factoryID: stockBalanceReportInput.factoryID,
                            collectionTypeID: stockBalanceReportInput.collectionTypeID
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
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
                                                            value={stockBalanceReportInput.groupID}
                                                            variant="outlined"
                                                            id="groupID"
                                                            disabled={!permissionList.isGroupFilterEnabled}
                                                            size = 'small'
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
                                                            value={stockBalanceReportInput.factoryID}
                                                            variant="outlined"
                                                            id="factoryID"
                                                            disabled={!permissionList.isFactoryFilterEnabled}
                                                            size = 'small'
                                                        >
                                                            <MenuItem value="0">--Select Factory--</MenuItem>
                                                            {generateDropDownMenu(factories)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={8}>
                                                        <InputLabel shrink id="itemCategoryID">
                                                            Item Category
                                                        </InputLabel>
                                                        <TextField select
                                                            fullWidth
                                                            name="itemCategoryID"
                                                            onChange={(e) => handleChange(e)}
                                                            value={stockBalanceReportInput.itemCategoryID}
                                                            size = 'small'
                                                            variant="outlined" >
                                                            <MenuItem value={0} disabled={true}>--Select Item Category--</MenuItem>
                                                            {generateDropDownMenu(ItemCategoryList)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={8}>
                                                        <InputLabel shrink id="factoryItemID">
                                                            Factory Item
                                                        </InputLabel>
                                                        <TextField select
                                                            fullWidth
                                                            name="factoryItemID"
                                                            onChange={(e) => handleChange(e)}
                                                            value={stockBalanceReportInput.factoryItemID}
                                                            variant="outlined"
                                                            id="factoryItemID"
                                                            size = 'small'
                                                        >
                                                            <MenuItem value="0" disabled={true}>--Select Factory Item--</MenuItem>
                                                            {generateDropDownMenu(factoryItems)}
                                                        </TextField>
                                                    </Grid>
                                                </Grid>
                                                <Box display="flex" flexDirection="row-reverse" p={2} >
                                                    <Button
                                                        color="primary"
                                                        type="submit"
                                                        variant="contained"
                                                        size = 'small'
                                                    >
                                                        Search
                                                    </Button>
                                                </Box>
                                                <br />
                                                <Box minWidth={1050}>
                                                    {stockBalanceDetails.length > 0 ?
                                                        <MaterialTable
                                                            title="Multiple Actions Preview"
                                                            columns={[
                                                                { title: 'Item Category', field: 'categoryName' },
                                                                { title: 'Factory Item', field: 'itemName' },
                                                                { title: 'GRN Number', field: 'grnNumber' },
                                                                { title: 'Supplier', field: 'supplierName' },
                                                                { title: 'Quantity', field: 'quantity' },
                                                                { title: 'Unit Price (LKR)', render: rowData => rowData.unitPrice.toFixed(2) },
                                                                { title: 'Total Price (LKR)', render: rowData => (rowData.quantity.toFixed(2) * rowData.unitPrice.toFixed(2)).toFixed(2) },

                                                            ]}
                                                            data={stockBalanceDetails}
                                                            options={{
                                                                exportButton: false,
                                                                showTitle: false,
                                                                headerStyle: { textAlign: "left", height: '1%' },
                                                                cellStyle: { textAlign: "left" },
                                                                columnResizable: false,
                                                                actionsColumnIndex: -1,
                                                                pageSize: 5
                                                            }}
                                                        /> : null}
                                                </Box>
                                            </CardContent>
                                            {stockBalanceDetails.length > 0 ?
                                                <Box display="flex" justifyContent="flex-end" p={2}>
                                                    <Button
                                                        color="primary"
                                                        id="btnRecord"
                                                        variant="contained"
                                                        style={{ marginRight: '1rem' }}
                                                        className={classes.colorRecord}
                                                        onClick={createFile}
                                                        size = 'small'
                                                    >
                                                        EXCEL
                                                    </Button>
                                                    <div>&nbsp;</div>
                                                    <ReactToPrint
                                                        documentTitle={"Available GRN Report"}
                                                        trigger={() => <Button
                                                            color="primary"
                                                            id="btnCancel"
                                                            variant="contained"
                                                            style={{ marginRight: '1rem' }}
                                                            className={classes.colorCancel}
                                                            size = 'small'
                                                        >
                                                            PDF
                                                        </Button>}
                                                        content={() => componentRef.current}
                                                    />
                                                    <div hidden={true}>
                                                        <CreatePDF ref={componentRef} StockBalanceDetails={stockBalanceDetails}
                                                            SearchData={selectedSearchValues} StockBalanceReportInput={stockBalanceReportInput} />
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