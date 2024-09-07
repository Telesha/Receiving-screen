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
import { useNavigate } from 'react-router-dom';
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import * as Yup from "yup";
import { LoadingComponent } from 'src/utils/newLoader';
import { Formik } from 'formik';
import { useAlert } from "react-alert";
import _ from 'lodash';
import xlsx from 'json-as-xlsx';
import ReactToPrint from "react-to-print";
import CreatePDF from './CreatePDF';
import MaterialTable from "material-table";
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

const screenCode = 'ACCOUNTRECEIVABLEWITHAGINGREPORT';

export default function AccountsReceivableWithAgingReport(props) {
    const [title, setTitle] = useState("Accounts Receivable Report")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [accountsReceivableDetails, setAccountsReceivableDetails] = useState([]);
    const [csvHeaders, SetCsvHeaders] = useState([]);

    const [totalAmounts, setTotalAmounts] = useState({});

    const [accountsReceivableWithAgingInput, SetaccountsReceivableWithAgingInput] = useState({
        groupID: '0',
        factoryID: '0',
        startDate: new Date().toISOString().substring(0, 10),
        endDate: new Date().toISOString().substring(0, 10)
    });
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });
    const [selectedSearchValues, setSelectedSearchValues] = useState({
        factoryName: "0",
        groupName: "0",
        startDate: "",
        endDate: ""
    })

    const navigate = useNavigate();
    const alert = useAlert();
    const componentRef = useRef();

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission());
    }, []);

    useEffect(() => {
        trackPromise(getFactoriesForDropDown());
    }, [accountsReceivableWithAgingInput.groupID]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWACCOUNTRECEIVABLEWITHAGINGREPORT');

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

        SetaccountsReceivableWithAgingInput({
            ...accountsReceivableWithAgingInput,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getFactoriesForDropDown() {
        const factory = await services.getFactoryByGroupID(accountsReceivableWithAgingInput.groupID);
        setFactories(factory);
    }

    async function GetDetails() {
        let model = {
            groupID: parseInt(accountsReceivableWithAgingInput.groupID),
            factoryID: parseInt(accountsReceivableWithAgingInput.factoryID),
            startDate: (accountsReceivableWithAgingInput.startDate),
            endDate: (accountsReceivableWithAgingInput.endDate),
        }
        getSelectedDropdownValuesForReport(model);

        const response = await services.getAccountsReceivableWithAgingForReport(model);
        if (response.statusCode == "Success" && response.data != null) {
            setAccountsReceivableDetails(response.data);
            if (response.data.length == 0) {
                alert.error("No records to display");
            }

            let invoiceAmountTot = 0;
            let amountReceivedTot = 0;
            let amountOutstandingTot = 0;
            response.data.forEach((x) => {
                invoiceAmountTot += x.invoiceAmount
                amountReceivedTot += x.amountReceived
                amountOutstandingTot += x.amountOutstanding
            })
            setTotalAmounts({
                invoiceAmountTot: invoiceAmountTot.toFixed(2),
                amountReceivedTot: amountReceivedTot.toFixed(2),
                amountOutstandingTot: amountOutstandingTot.toFixed(2)
            })
            createDataForExcel(response.data)
        }
        else {
            alert.error(response.message);
        }
    }

    async function createDataForExcel(array) {
        var res = [];

        var totals = {
            'Customer Name': 'Total',
            'Invoice Amount': 0,
            'Amount Received': 0,
            'Amount Outstanding': 0,
        };

        if (array != null) {
            array.map(x => {
                var vr = {
                    'Customer Name': x.customerName,
                    'Invoice No': x.invoiceNo,
                    'Invoice Date': x.invoiceDate.split('T')[0],
                    'Invoice Amount': x.invoiceAmount.toFixed(2),
                    'Payment Terms': x.paymentTerms,
                    'Amount Received': x.amountReceived.toFixed(2),
                    'Date Received': x.dateReceived.split('T')[0],
                    'Due Date': x.dueDate.split('T')[0],
                    'Amount Outstanding': x.amountOutstanding.toFixed(2),
                    'Days Past': x.daysPast,
                    'Remarks': x.remarks,
                }
                res.push(vr);
            });

            res.push({});
            var vr1 = {
                'Customer Name': 'Total',
                'Invoice Amount': parseFloat((totalAmounts.invoiceAmountTot)).toFixed(2),
                'Amount Received': parseFloat((totalAmounts.amountReceivedTot)).toFixed(2),
                'Amount Outstanding': parseFloat((totalAmounts.amountOutstandingTot)).toFixed(2),
            };
            res.push(vr1);
            res.push({}, {});
            var vr = {
                'Customer Name': "Group: " + selectedSearchValues.groupName,
                'Invoice Amount': "Estate: " + selectedSearchValues.factoryName,
                'Amount Received': "Start Date: " + moment(selectedSearchValues.startDate).format('MM/DD/YYYY'),
                'Amount Outstanding': "End Date: " + moment(selectedSearchValues.endDate).format('MM/DD/YYYY')
            }
            res.push(vr);
        }

        return res;
    }

    async function createFile() {
        var file = await createDataForExcel(accountsReceivableDetails);
        var settings = {
            sheetName: 'Accounts Receivable Report',
            fileName: 'Accounts Receivable Report  ' + ' - ' + selectedSearchValues.groupName + ' - ' + selectedSearchValues.factoryName + ' - ' + accountsReceivableWithAgingInput.date,
            writeOptions: {}
        }
        let keys = Object.keys(file[0])
        let tempcsvHeaders = csvHeaders;
        keys.map((sitem, i) => {
            tempcsvHeaders.push({ label: sitem, value: sitem })
        })
        let dataA = [
            {
                sheet: 'Accounts Receivable Report',
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
        SetaccountsReceivableWithAgingInput({
            ...accountsReceivableWithAgingInput,
            [e.target.name]: value
        });
        setAccountsReceivableDetails([]);
    }

    // function handleDateChange(e) {
    //     setSelectedDate(e);
    //     SetaccountsReceivableWithAgingInput({
    //         ...accountsReceivableWithAgingInput,
    //         date: selectedDate.toISOString().split('T')[0]
    //     });
    //     setAccountsReceivableDetails([]);
    // }

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            factoryName: factories[searchForm.factoryID],
            groupName: groups[searchForm.groupID],
            startDate: searchForm.startDate,
            endDate: searchForm.endDate
        })
    }

    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: accountsReceivableWithAgingInput.groupID,
                            factoryID: accountsReceivableWithAgingInput.factoryID,
                            startDate: accountsReceivableWithAgingInput.startDate,
                            endDate: accountsReceivableWithAgingInput.endDate
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                                factoryID: Yup.number().required('Estate is required').min("1", 'Estate is required'),
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
                                                            value={accountsReceivableWithAgingInput.groupID}
                                                            variant="outlined"
                                                            id="groupID"
                                                            disabled={!permissionList.isGroupFilterEnabled}

                                                        >
                                                            <MenuItem value="0">--Select Group--</MenuItem>
                                                            {generateDropDownMenu(groups)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={3} xs={8}>
                                                        <InputLabel shrink id="factoryID">
                                                            Estate *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.factoryID && errors.factoryID)}
                                                            fullWidth
                                                            helperText={touched.factoryID && errors.factoryID}
                                                            size='small'
                                                            name="factoryID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={accountsReceivableWithAgingInput.factoryID}
                                                            variant="outlined"
                                                            id="factoryID"
                                                            disabled={!permissionList.isFactoryFilterEnabled}

                                                        >
                                                            <MenuItem value="0">--Select Estate--</MenuItem>
                                                            {generateDropDownMenu(factories)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="startDate">
                                                        From Date *
                                                        </InputLabel>
                                                        <TextField
                                                        fullWidth
                                                        name="startDate"
                                                        type='date'
                                                        onChange={(e) => handleChange(e)}
                                                        value={accountsReceivableWithAgingInput.startDate}
                                                        variant="outlined"
                                                        id="startDate"
                                                        size='small'
                                                        />
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="endDate">
                                                        To Date *
                                                        </InputLabel>
                                                        <TextField
                                                        fullWidth
                                                        name="endDate"
                                                        type='date'
                                                        onChange={(e) => handleChange(e)}
                                                        value={accountsReceivableWithAgingInput.endDate}
                                                        variant="outlined"
                                                        id="endDate"
                                                        size='small'
                                                        />
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
                                                <Box minWidth={1050}>
                                                    {accountsReceivableDetails.length > 0 ?
                                                        <MaterialTable
                                                            title="Multiple Actions Preview"
                                                            columns={[
                                                                { title: 'Customer Name', field: 'customerName'},
                                                                { title: 'Invoice No', field: 'invoiceNo'},
                                                                { title: 'Invoice Date', field: 'invoiceDate', render: rowData => rowData.invoiceDate ? new Date(rowData.invoiceDate).toLocaleDateString() : '' },
                                                                { title: 'Invoice Amount', field: 'invoiceAmount', render: rowData => rowData.invoiceAmount ? parseFloat(rowData.invoiceAmount).toFixed(2) : '0.00' },
                                                                { title: 'Payment Terms', field: 'paymentTerms'},
                                                                { title: 'Amount Received', field: 'amountReceived', render: rowData => rowData.amountReceived ? parseFloat(rowData.amountReceived).toFixed(2) : '0.00' },
                                                                { title: 'Date Received', field: 'dateReceived', render: rowData => rowData.dateReceived ? new Date(rowData.dateReceived).toLocaleDateString() : '' },
                                                                { title: 'Due Date', field: 'dueDate', render: rowData => rowData.dueDate ? new Date(rowData.dueDate).toLocaleDateString() : '' },
                                                                { title: 'Amount Outstanding', field: 'amountOutstanding', render: rowData => rowData.amountOutstanding ? parseFloat(rowData.amountOutstanding).toFixed(2) : '0.00' },
                                                                { title: 'Days Past', field: 'daysPast'},
                                                                { title: 'Remarks', field: 'remarks'},
                                                            ]}
                                                            data={accountsReceivableDetails}
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
                                            {accountsReceivableDetails.length > 0 ?
                                                <Box display="flex" justifyContent="flex-end" p={2}>
                                                    <Button
                                                        color="primary"
                                                        id="btnRecord"
                                                        variant="contained"
                                                        style={{ marginRight: '1rem' }}
                                                        className={classes.colorRecord}
                                                        onClick={createFile}
                                                    >
                                                        EXCEL
                                                    </Button>
                                                    <div>&nbsp;</div>
                                                    <ReactToPrint
                                                        documentTitle={"Accounts Receivable Report"}
                                                        trigger={() => <Button
                                                            color="primary"
                                                            id="btnCancel"
                                                            variant="contained"
                                                            style={{ marginRight: '1rem' }}
                                                            className={classes.colorCancel}
                                                        >
                                                            PDF
                                                        </Button>}
                                                        content={() => componentRef.current}
                                                    />
                                                    <div hidden={true}>
                                                        <CreatePDF ref={componentRef} accountsReceivableDetails={accountsReceivableDetails}
                                                            SearchData={selectedSearchValues} accountsReceivableWithAgingInput={accountsReceivableWithAgingInput} />
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