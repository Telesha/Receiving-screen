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
import * as Yup from "yup";
import { LoadingComponent } from 'src/utils/newLoader';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, validateYupSchema } from 'formik';
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import { useAlert } from "react-alert";
import MaterialTable from "material-table";
import ReactToPrint from "react-to-print";
import CreatePDF from './CreatePDF';
import xlsx from 'json-as-xlsx';

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

const screenCode = 'CURRENTBLLOANSREPORT';

export default function CurrentBLLoans(props) {
    const [title, setTitle] = useState("Current BL Loans Report")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [routes, setRoutes] = useState();
    const [loanInputData, setLoanInputData] = useState({
        groupID: '0',
        factoryID: '0',
        routeID: '0'
    })
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });
    const navigate = useNavigate();
    const alert = useAlert();
    const [bLLoanDetails, setBLLoanDetails] = useState([]);
    const [csvHeaders, SetCsvHeaders] = useState([])
    const componentRef = useRef();
    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupName: "0",
        factoryName: "0"
    })

    useEffect(() => {
        trackPromise(getGroupsForDropdown(),
            getPermission());
    }, []);

    useEffect(() => {
        trackPromise(getFactoriesForDropDown());
    }, [loanInputData.groupID]);

    useEffect(() => {
        trackPromise(
            getRoutesByFactoryID()
        )
    }, [loanInputData.factoryID]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWCURRENTBLLOANSREPORT');



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

        setLoanInputData({
            ...loanInputData,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getFactoriesForDropDown() {
        const factory = await services.getFactoryByGroupID(loanInputData.groupID);
        setFactories(factory);
    }

    async function getRoutesByFactoryID() {
        const route = await services.getRoutesForDropDown(loanInputData.factoryID);
        setRoutes(route);
    }

    async function GetDetails() {
        let model = {
            groupID: parseInt(loanInputData.groupID),
            factoryID: parseInt(loanInputData.factoryID),
            routeID: parseInt(loanInputData.routeID)
        }
        getSelectedDropdownValuesForReport(model);
        const loanData = await services.GetCurrentBLLoanDetails(model);
        if (loanData.statusCode == "Success" && loanData.data != null) {
            setBLLoanDetails(loanData.data);
            createDataForExcel(loanData.data);
            if (loanData.data.length == 0) {
                alert.error("No records to display");
            }
        }
        else {
            alert.error("No records to display");
        }
    }

    async function createDataForExcel(array) {
        var res = [];
        if (array != null) {
            array.map(x => {
                var vr = {
                    'Route Code': x.routeCode,
                    'Route Name': x.routeName,
                    'Registration Number': x.registrationNumber,
                    'Name': x.name,
                    'Loan Issued Date': x.loanIssuedDate.split('T')[0],
                    'Principal Amount (Rs.)': x.principalAmount.toFixed(2),
                    'Installments': x.numberOfInstalments,
                    'Remaining Installments': x.remainingInstalments,
                    'Capital Outstanding (Rs.)': x.capitalOutstanding.toFixed(2)
                }
                res.push(vr);
            });
        }

        return res;
    }


    async function createFile() {
        var file = await createDataForExcel(bLLoanDetails);
        var settings = {
            sheetName: 'Current BL Loans Report',
            fileName: 'Current BL Loans Report' + ' ' + selectedSearchValues.groupName + ' ' + selectedSearchValues.factoryName,
            writeOptions: {}
        }
        let keys = Object.keys(file[0])
        let tempcsvHeaders = csvHeaders;
        keys.map((sitem, i) => {
            tempcsvHeaders.push({ label: sitem, value: sitem })
        })
        let dataA = [
            {
                sheet: 'Current BL Loans Report',
                columns: tempcsvHeaders,
                content: file
            }
        ]
        xlsx(dataA, settings);
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: groups[searchForm.groupID],
            factoryName: factories[searchForm.factoryID]
        })
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
        setLoanInputData({
            ...loanInputData,
            [e.target.name]: value
        });
        setBLLoanDetails([]);
    }



    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: loanInputData.groupID,
                            factoryID: loanInputData.factoryID
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
                                                            value={loanInputData.groupID}
                                                            variant="outlined"
                                                            id="groupID"
                                                            disabled={!permissionList.isGroupFilterEnabled}
                                                            size = 'small'
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
                                                            value={loanInputData.factoryID}
                                                            variant="outlined"
                                                            id="factoryID"
                                                            disabled={!permissionList.isFactoryFilterEnabled}
                                                            size = 'small'
                                                        >
                                                            <MenuItem value="0">--Select Factory--</MenuItem>
                                                            {generateDropDownMenu(factories)}
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
                                                            value={loanInputData.routeID}
                                                            variant="outlined"
                                                            id="routeID"
                                                            size = 'small'
                                                        >
                                                            <MenuItem value="0">--Select Routes--</MenuItem>
                                                            {generateDropDownMenu(routes)}
                                                        </TextField>
                                                    </Grid>
                                                </Grid>

                                                <Box display="flex" justifyContent="flex-end" p={2}>
                                                    <Button
                                                        color="primary"
                                                        type="submit"
                                                        variant="contained"
                                                        onClick={() => trackPromise(GetDetails())}
                                                        size = 'small'
                                                    >
                                                        Search
                                                    </Button>
                                                </Box>
                                                <br />
                                                <Box minWidth={1050}>
                                                    {bLLoanDetails.length > 0 ?
                                                        <MaterialTable
                                                            title="Multiple Actions Preview"
                                                            columns={[
                                                                { title: 'Route Code', field: 'routeCode' },
                                                                { title: 'Route Name', field: 'routeName' },
                                                                { title: 'Registration Number', field: 'registrationNumber' },
                                                                { title: 'Name', field: 'name' },
                                                                { title: 'Loan Issued Date', field: 'loanIssuedDate', render: rowData => rowData.loanIssuedDate.split('T')[0] },
                                                                { title: 'Principal Amount (Rs.)', field: 'principalAmount', render: rowData => rowData.principalAmount.toFixed(2) },
                                                                { title: 'Installments', field: 'numberOfInstalments' },
                                                                { title: 'Remaining Installments', field: 'remainingInstalments' },
                                                                { title: 'Capital Outstanding (Rs.)', field: 'capitalOutstanding', render: rowData => rowData.capitalOutstanding.toFixed(2) }
                                                            ]}
                                                            data={bLLoanDetails}
                                                            options={{
                                                                exportButton: false,
                                                                showTitle: false,
                                                                headerStyle: { textAlign: "left", height: '1%' },
                                                                cellStyle: { textAlign: "left" },
                                                                columnResizable: false,
                                                                actionsColumnIndex: -1,
                                                                pageSize: 10
                                                            }}
                                                            actions={[

                                                            ]}
                                                        /> : null}
                                                </Box>

                                            </CardContent>
                                            {bLLoanDetails.length > 0 ?
                                                <Box display="flex" justifyContent="flex-end" p={2}>
                                                    <Button
                                                        color="primary"
                                                        id="btnRecord"
                                                        type="submit"
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
                                                        documentTitle={"Current BL Loans Report"}
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
                                                        <CreatePDF ref={componentRef} LoanInputData={loanInputData} BLLoanDetails={bLLoanDetails}
                                                            LoanReportSearchData={selectedSearchValues} />
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