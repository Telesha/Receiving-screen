import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Card, makeStyles, Container, CardHeader, Button, CardContent, Divider, MenuItem, Grid, InputLabel, TextField } from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import MaterialTable from "material-table";
import { LoadingComponent } from '../../../utils/newLoader';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

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
    table: {
        minWidth: 550,
    },
}));

const screenCode = "REQUISITION"

export default function RequisitionAddEdit(props) {

    const classes = useStyles();
    const navigate = useNavigate();
    const alert = useAlert();

    const [title, setTitle] = useState("Add Requisition")
    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [itemCategory, setItemCategory] = useState([]);
    const [itemCategoryForTable, setItemCategoryForTable] = useState([]);
    const [item, setItem] = useState([]);
    const [itemForTable, setItemForTable] = useState([]);
    const [departments, setDepartments] = useState();
    const [gridDatArray, setGridDatArray] = useState([]);

    const [requisitionDetails, setRequisitionDetails] = useState({
        groupID: '0',
        factoryID: '0',
        itemCategory: '0',
        itemName: '0',
        requestAmount: '',
        department: '0',
        estimatedDate: new Date(),
        description: ''
    });
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermissions(),
            getItemCategoryForDropDown(), getDepartmentForDropdown());
    }, []);

    useEffect(() => {
        trackPromise(getFactoriesForDropdown());
    }, [requisitionDetails.groupID]);

    useEffect(() => {
        trackPromise(
            getItemByItemCategoryForDropDown()
        );
    }, [requisitionDetails.groupID, requisitionDetails.factoryID, requisitionDetails.itemCategory])

    const handleClick = () => {
        navigate('/app/requisition/listing');
    }

    async function getPermissions() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDDITREQUISITION');

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

        setRequisitionDetails({
            ...requisitionDetails,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getFactoriesForDropdown() {
        const factories = await services.getAllFactoriesByGroupID(requisitionDetails.groupID);
        setFactories(factories);
    }

    async function getItemCategoryForDropDown() {
        var ItemCategoryArray = [];
        var res = await services.getItemCategoryForDropDown();
        setItemCategoryForTable(res)
        for (let item of Object.entries(res)) {
            ItemCategoryArray[item[1]["itemCategoryID"]] = item[1]["categoryName"]
        }
        setItemCategory(ItemCategoryArray);
    }

    async function getItemByItemCategoryForDropDown() {
        var ItemCategoryArray = [];
        var res = await services.getItemByItemCategoryForDropDown(requisitionDetails.groupID, requisitionDetails.factoryID, requisitionDetails.itemCategory);
        setItemForTable(res)
        for (let item of Object.entries(res)) {
            ItemCategoryArray[item[1]["factoryItemID"]] = item[1]["itemName"]
        }
        setItem(ItemCategoryArray);
    }

    async function getDepartmentForDropdown() {
        setDepartments([
            "Agriculture",
            "Accounting",
            "HR",
            "Sales"
        ])
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

    function handleChange(e) {
        const target = e.target;
        const value = target.value
        setRequisitionDetails({
            ...requisitionDetails,
            [e.target.name]: value
        });
    }

    function handleEstimatedDateChange(e) {
        setRequisitionDetails({
            ...requisitionDetails,
            estimatedDate: e
        });
    }

    function generateTableCategoryID(id) {
        var categoryName = ""

        itemCategoryForTable.forEach(item => {
            if (item.itemCategoryID == id) {
                categoryName = item.categoryName
            }
        });
        return categoryName;
    }

    function generateTableItemID(id) {
        var itemName = ""

        itemForTable.forEach(item => {
            if (item.factoryItemID == id) {
                itemName = item.itemName
            }
        });
        return itemName;
    }

    function generateTableDepartmentID(id) {
        return departments[id];
    }

    async function addToGrid() {

        let model = {
            groupID: requisitionDetails.groupID,
            factoryID: requisitionDetails.factoryID,
            itemCategory: generateTableCategoryID(requisitionDetails.itemCategory),
            itemName: generateTableItemID(requisitionDetails.itemName),
            requestAmount: requisitionDetails.requestAmount,
            department: generateTableDepartmentID(requisitionDetails.department),
            estimatedDate: requisitionDetails.estimatedDate,
            description: requisitionDetails.description
        }
        setGridDatArray([...gridDatArray, model])
    }

    async function onSave() {
        alert.success("Requisition adedd successfuly.");
        navigate('/app/requisition/listing');
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
            <Page
                className={classes.root}
                title={title}
            >
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: requisitionDetails.groupID,
                            factoryID: requisitionDetails.factoryID,
                            itemCategory: requisitionDetails.itemCategory,
                            itemName: requisitionDetails.itemName,
                            requestAmount: requisitionDetails.requestAmount,
                            department: requisitionDetails.department,
                            estimatedDate: requisitionDetails.estimatedDate,
                            description: requisitionDetails.description
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group required').min("1", 'Group is required'),
                                factoryID: Yup.number().required('Factory required').min("1", 'Factory is required'),
                                itemCategory: Yup.number().required('Item category required').min("1", 'Item category required'),
                                itemName: Yup.number().required('Item required').min("1", 'Item required'),
                                requestAmount: Yup.number().required('Request amount required').typeError('Enter valid amount'),
                                description: Yup.string()
                            })
                        }
                        onSubmit={() => trackPromise(addToGrid())}
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
                                            title={cardTitle("Add Requisition")}
                                        />
                                        <PerfectScrollbar>
                                            <Divider />
                                            <CardContent style={{ marginBottom: "2rem" }}>
                                                <Grid container spacing={3}>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="groupID">
                                                            Group  *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.groupID && errors.groupID)}
                                                            helperText={touched.groupID && errors.groupID}
                                                            fullWidth
                                                            name="groupID"
                                                            onChange={(e) => handleChange(e)}
                                                            value={requisitionDetails.groupID}
                                                            variant="outlined"
                                                            size="small"
                                                            InputProps={{
                                                                readOnly: !permissionList.isGroupFilterEnabled,
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Group--</MenuItem>
                                                            {generateDropDownMenu(groups)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="factoryID">
                                                            Factory  *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.factoryID && errors.factoryID)}
                                                            helperText={touched.factoryID && errors.factoryID}
                                                            fullWidth
                                                            name="factoryID"
                                                            onChange={(e) => handleChange(e)}
                                                            value={requisitionDetails.factoryID}
                                                            variant="outlined"
                                                            size="small"
                                                            InputProps={{
                                                                readOnly: !permissionList.isFactoryFilterEnabled,
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Factory--</MenuItem>
                                                            {generateDropDownMenu(factories)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="itemCategory">
                                                            Item Category *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.itemCategory && errors.itemCategory)}
                                                            helperText={touched.itemCategory && errors.itemCategory}
                                                            fullWidth
                                                            name="itemCategory"
                                                            size='small'
                                                            onChange={(e) => handleChange(e)}
                                                            value={requisitionDetails.itemCategory}
                                                            variant="outlined"
                                                        >
                                                            <MenuItem value="0">--Select Item Category--</MenuItem>
                                                            {generateDropDownMenu(itemCategory)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="itemName">
                                                            Item *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.itemName && errors.itemName)}
                                                            helperText={touched.itemName && errors.itemName}
                                                            fullWidth
                                                            name="itemName"
                                                            size='small'
                                                            onChange={(e) => handleChange(e)}
                                                            value={requisitionDetails.itemName}
                                                            variant="outlined"
                                                        >
                                                            <MenuItem value="0">--Select Item--</MenuItem>
                                                            {generateDropDownMenu(item)}
                                                        </TextField>
                                                    </Grid>
                                                </Grid>
                                                <Grid container spacing={3}>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="department">
                                                            Department  *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.department && errors.department)}
                                                            helperText={touched.department && errors.department}
                                                            fullWidth
                                                            name="department"
                                                            onChange={(e) => handleChange(e)}
                                                            value={requisitionDetails.department}
                                                            variant="outlined"
                                                            size="small"
                                                        >
                                                            {generateDropDownMenu(departments)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink>
                                                            Estimated date *
                                                        </InputLabel>
                                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                            <KeyboardDatePicker
                                                                autoOk
                                                                fullWidth
                                                                disablePast
                                                                variant="inline"
                                                                format="dd/MM/yyyy"
                                                                margin="dense"
                                                                id="date-picker-inline"
                                                                value={requisitionDetails.estimatedDate}
                                                                onChange={(e) => {
                                                                    handleEstimatedDateChange(e)
                                                                }}
                                                                KeyboardButtonProps={{
                                                                    'aria-label': 'change date',
                                                                }}
                                                            />
                                                        </MuiPickersUtilsProvider>
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="requestAmount">
                                                            Request Amount *
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.requestAmount && errors.requestAmount)}
                                                            helperText={touched.requestAmount && errors.requestAmount}
                                                            fullWidth
                                                            size='small'
                                                            name="requestAmount"
                                                            onChange={(e) => handleChange(e)}
                                                            value={requisitionDetails.requestAmount}
                                                            variant="outlined"
                                                        />
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="description">
                                                            Description
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.description && errors.description)}
                                                            helperText={touched.description && errors.description}
                                                            fullWidth
                                                            size='small'
                                                            name="description"
                                                            onChange={(e) => handleChange(e)}
                                                            value={requisitionDetails.description}
                                                            variant="outlined"
                                                        />
                                                    </Grid>
                                                </Grid>
                                                <Box display="flex" justifyContent="flex-end" p={2}>
                                                    <Button
                                                        color="primary"
                                                        type="submit"
                                                        variant="contained"
                                                    >
                                                        Add
                                                    </Button>
                                                </Box>
                                            </CardContent>
                                            {gridDatArray.length > 0 ?
                                                <Grid>
                                                    <Box minWidth={1050}>

                                                        <MaterialTable
                                                            title="Multiple Actions Preview"
                                                            columns={[
                                                                { title: 'Estimated Date', field: 'estimatedDate', render: rowData => rowData.estimatedDate.toISOString().split('T')[0] },
                                                                { title: 'Item Category', field: 'itemCategory' },
                                                                { title: 'Item', field: 'itemName' },
                                                                { title: 'Department', field: 'department' }
                                                            ]}
                                                            data={gridDatArray}
                                                            options={{
                                                                exportButton: false,
                                                                showTitle: false,
                                                                headerStyle: { textAlign: "left", height: '1%' },
                                                                cellStyle: { textAlign: "left" },
                                                                columnResizable: false,
                                                                actionsColumnIndex: -1,
                                                                pageSize: 5
                                                            }}
                                                        />
                                                    </Box>
                                                    <Box display="flex" justifyContent="flex-end" p={2}>
                                                        <Button
                                                            color="primary"
                                                            variant="contained"
                                                            onClick={() => onSave()}
                                                        >
                                                            Save
                                                        </Button>
                                                    </Box>
                                                </Grid>
                                                : null}
                                        </PerfectScrollbar>
                                    </Card>
                                </Box>
                            </form>
                        )}
                    </Formik>
                </Container>
            </Page >
        </Fragment>
    )
}