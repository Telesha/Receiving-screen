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
import EventIcon from '@material-ui/icons/Event';
import { useAlert } from "react-alert";
import MaterialTable from "material-table";
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

const screenCode = 'FACTORYITEMSUMMARYREPORT';

export default function FactoryItemSummaryReport() {

    const navigate = useNavigate();
    const classes = useStyles();
    const [title, setTitle] = useState("Factory Item Summary Report");
    const [factoryItemInput, setFactoryItemInput] = useState({
        groupID: '0',
        factoryID: '0',
        routeID: '0',
        factoryItemID: '0',
        itemCategoryID: '0',
        startDate: new Date().toISOString().substring(0, 10),
        endDate: new Date().toISOString().substring(0, 10)
    })
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;
    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [routes, setRoutes] = useState();
    const [factoryItems, setFactoryItems] = useState();
    const [ItemCategoryList, setItemCategoryList] = useState();
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
    const [factoryItemSumReportData, setFactoryItemSumReportData] = useState([]);
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
        trackPromise(getFactoriesForDropDown());
    }, [factoryItemInput.groupID]);

    useEffect(() => {
        trackPromise(
            getRoutesByFactoryID()
        )
    }, [factoryItemInput.factoryID]);

    useEffect(() => {
        trackPromise(
            getfactoryItemsForDropDown()
        )
    }, [factoryItemInput.groupID, factoryItemInput.factoryID, factoryItemInput.itemCategoryID]);

    useEffect(() => {
        trackPromise(getAllActiveItemCategory())
    }, [])

    useEffect(() => {
        setFactoryItemInput({
          ...factoryItemInput,
          itemCategoryID: 0,
          factoryItemID: 0,
        })
      }, [factoryItemInput.routeID])
    
      useEffect(() => {
        setFactoryItemInput({
          ...factoryItemInput,
          factoryItemID: 0,
        }
        )
      }, [factoryItemInput.itemCategoryID])

    async function getPermissions() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWFACTORYITEMSUMMARYREPORT');

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

        setFactoryItemInput({
            ...factoryItemInput,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }
    async function getFactoriesForDropDown() {
        const factory = await services.getFactoryByGroupID(factoryItemInput.groupID);
        setFactories(factory);
    }

    async function getRoutesByFactoryID() {
        const route = await services.getRoutesForDropDown(factoryItemInput.factoryID);
        setRoutes(route);
    }

    async function getAllActiveItemCategory() {
        const result = await services.getAllActiveItemCategory();
        setItemCategoryList(result);
    }

    async function getfactoryItemsForDropDown() {
        const factoryItem = await services.getfactoryItemsByGroupIDFactoryIDItemCategoryID(factoryItemInput.groupID, factoryItemInput.factoryID, factoryItemInput.itemCategoryID);
        setFactoryItems(factoryItem);
    }

    async function GetDetails() {
        let model = {
            groupID: parseInt(factoryItemInput.groupID),
            factoryID: parseInt(factoryItemInput.factoryID),
            routeID: parseInt(factoryItemInput.routeID),
            startDate:moment(factoryItemInput.startDate.toString()).format().split('T')[0],
            endDate: moment(factoryItemInput.endDate.toString()).format().split('T')[0],
            itemCategoryID: parseInt(factoryItemInput.itemCategoryID),
            factoryItemID: parseInt(factoryItemInput.factoryItemID)
        }

        getSelectedDropdownValuesForReport(model);
        const factoryItemdata = await services.GetFactoryItemSummaryDetails(model);
        if (factoryItemdata.statusCode == "Success" && factoryItemdata.data != null) {
            setFactoryItemSumReportData(factoryItemdata.data);
            createDataForExcel(factoryItemdata.data);
            if (factoryItemdata.data.length == 0) {
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
                    'Route Name': x.routeName,
                    'Item Category': x.categoryName,
                    'Factory Item': x.itemName,
                    'Quantity': x.quantity,
                }
                res.push(vr);
            });
        }

        return res;
    }


    async function createFile() {
        var file = await createDataForExcel(factoryItemSumReportData);
        var settings = {
            sheetName: 'Factory Item Summary Report',
            fileName: 'Factory Item Summary Report' + ' ' + selectedSearchValues.groupName + ' ' + selectedSearchValues.factoryName + '  ' + selectedSearchValues.startDate + ' - ' + selectedSearchValues.endDate,
            writeOptions: {}
        }
        let keys = Object.keys(file[0])
        let tempcsvHeaders = csvHeaders;
        keys.map((sitem, i) => {
            tempcsvHeaders.push({ label: sitem, value: sitem })
        })
        let dataA = [
            {
                sheet: 'Factory Item Summary Report',
                columns: tempcsvHeaders,
                content: file
            }
        ]
        xlsx(dataA, settings);
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        var startDate = moment(searchForm.startDate.toString()).format().split('T')[0]
        var endDate = moment(searchForm.endDate.toString()).format().split('T')[0]    
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: groups[searchForm.groupID],
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
        setFactoryItemInput({
            ...factoryItemInput,
            [e.target.name]: value
        });
        setFactoryItemSumReportData([]);
    }

    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: factoryItemInput.groupID,
                            factoryID: factoryItemInput.factoryID,
                            startDate: factoryItemInput.startDate,
                            endDate: factoryItemInput.endDate
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
                                startDate: Yup.string(),
                                endDate: Yup.string(),
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
                                                            value={factoryItemInput.groupID}
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
                                                            value={factoryItemInput.factoryID}
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
                                                            value={factoryItemInput.routeID}
                                                            variant="outlined"
                                                            id="routeID"
                                                            size = 'small'
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
                                                            value={factoryItemInput.startDate}
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
                                                            value={factoryItemInput.endDate}
                                                            variant="outlined"
                                                            id="endDate"
                                                            size='small'
                                                        />
                                                    </Grid>

                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="itemCategoryID">
                                                            Item Category
                                                        </InputLabel>
                                                        <TextField select
                                                            fullWidth
                                                            name="itemCategoryID"
                                                            onChange={(e) => handleChange(e)}
                                                            value={factoryItemInput.itemCategoryID}
                                                            size = 'small'
                                                            variant="outlined" >
                                                            <MenuItem value={0} >--Select Item Category--</MenuItem>
                                                            {generateDropDownMenu(ItemCategoryList)}
                                                            
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="factoryItemID">
                                                            Factory Item
                                                        </InputLabel>
                                                        <TextField select
                                                            fullWidth
                                                            name="factoryItemID"
                                                            onChange={(e) => handleChange(e)}
                                                            value={factoryItemInput.factoryItemID}
                                                            variant="outlined"
                                                            id="factoryItemID"
                                                            size = 'small'
                                                        >
                                                            <MenuItem value="0" >--Select Factory Item--</MenuItem>
                                                            {generateDropDownMenu(factoryItems)}
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
                                            </CardContent>

                                            <Box minWidth={1050}>
                                                {factoryItemSumReportData.length > 0 ?
                                                    <MaterialTable
                                                        title="Multiple Actions Preview"
                                                        columns={[
                                                            { title: 'Route Name', field: 'routeName' },
                                                            { title: 'Item Category', field: 'categoryName' },
                                                            { title: 'Factory Item', field: 'itemName' },
                                                            { title: 'Quantity', field: 'quantity' }
                                                        ]}
                                                        data={factoryItemSumReportData}
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

                                            {factoryItemSumReportData.length > 0 ?
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
                                                        documentTitle={"Factory Item Summary Report"}
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
                                                        <CreatePDF ref={componentRef} FactoryItemSumReportData={factoryItemSumReportData}
                                                        SelectedSearchValues={selectedSearchValues} />
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
