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
    }
}));

const screenCode = "REQUISITION"

export default function QuotationInquiry(props) {

    const classes = useStyles();
    const navigate = useNavigate();
    const alert = useAlert();

    const [title, setTitle] = useState("Add Quotation")
    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [gridDatArray, setGridDatArray] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [suppliersForTable, setSuppliersForTable] = useState([]);

    const [quotationCallDetails, setQuotationCallDetails] = useState({
        groupID: '0',
        factoryID: '0',
        itemCategory: '0',
        itemName: '0',
        department: '0',
        supplierID: '0',
        estimatedDate: new Date()
    })

    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermissions());
    }, []);

    useEffect(() => {
        trackPromise(getFactoriesForDropdown());
    }, [quotationCallDetails.groupID]);

    useEffect(() => {
        trackPromise(getSuppliers());
    }, [quotationCallDetails.groupID, quotationCallDetails.factoryID]);

    const handleClick = () => {
        navigate('/app/requisition/listing');
    }

    async function getPermissions() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWQUOTATIONINQUIRY');

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

        setQuotationCallDetails({
            ...quotationCallDetails,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getFactoriesForDropdown() {
        const factories = await services.getAllFactoriesByGroupID(quotationCallDetails.groupID);
        setFactories(factories);
    }

    async function getSuppliers() {
        var supplierArray = [];
        const suppliers = await services.GetSuppliersByGroupIDAndFactoryID(quotationCallDetails.groupID, quotationCallDetails.factoryID);
        setSuppliersForTable(suppliers)
        for (let item of Object.entries(suppliers)) {
            if (item[1]["isActive"] === true) {
                supplierArray[item[1]["supplierID"]] = item[1]["supplierName"] + [" - "] + item[1]["nicBRNumber"]
            }
        }
        setSuppliers(supplierArray);
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
        setQuotationCallDetails({
            ...quotationCallDetails,
            [e.target.name]: value
        });
    }

    function handleEstimatedDateChange(e) {
        setQuotationCallDetails({
            ...quotationCallDetails,
            estimatedDate: e
        });
    }

    function generateTableSupplierID(id) {
        var supplierName = ""
        suppliersForTable.forEach(item => {
            if (item.supplierID == id) {
                supplierName = item.supplierName + " - " + item.nicBRNumber
            }
        });
        return supplierName;
    }

    async function addToGrid() {
        setGridDatArray([...gridDatArray, quotationCallDetails])
    }

    async function onSave() {
        alert.success("Quotation added successfuly.");
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
                            groupID: quotationCallDetails.groupID,
                            factoryID: quotationCallDetails.factoryID,
                            supplierID: quotationCallDetails.supplierID
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group required').min("1", 'Group is required'),
                                factoryID: Yup.number().required('Factory required').min("1", 'Factory is required'),
                                supplierID: Yup.number().required('Supplier required').min("1", 'Supplier required')
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
                                            title={cardTitle("Add Quotation")}
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
                                                            value={quotationCallDetails.groupID}
                                                            variant="outlined"
                                                            size="small"
                                                            InputProps={{
                                                                readOnly: !permissionList.isGroupFilterEnabled,
                                                            }}
                                                            disabled={true}
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
                                                            value={quotationCallDetails.factoryID}
                                                            variant="outlined"
                                                            size="small"
                                                            InputProps={{
                                                                readOnly: !permissionList.isFactoryFilterEnabled,
                                                            }}
                                                            disabled={true}
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
                                                            value={quotationCallDetails.itemCategory}
                                                            variant="outlined"
                                                            disabled={true}
                                                        >
                                                            <MenuItem value="0">Fertilizer</MenuItem>
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
                                                            value={quotationCallDetails.itemName}
                                                            variant="outlined"
                                                            disabled={true}
                                                        >
                                                            <MenuItem value="0">Uria - 50Kg</MenuItem>
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
                                                            value={quotationCallDetails.department}
                                                            variant="outlined"
                                                            size="small"
                                                            disabled={true}
                                                        >
                                                            <MenuItem value="0">Agriculture</MenuItem>
                                                        </TextField>
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
                                                            value="50"
                                                            variant="outlined"
                                                            disabled={true}
                                                        />
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink>
                                                            Quotation date *
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
                                                                value={quotationCallDetails.estimatedDate}
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
                                                        <InputLabel shrink id="supplierID">
                                                            Supplier *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.supplierID && errors.supplierID)}
                                                            helperText={touched.supplierID && errors.supplierID}
                                                            fullWidth
                                                            name="supplierID"
                                                            onChange={(e) => handleChange(e)}
                                                            value={quotationCallDetails.supplierID}
                                                            variant="outlined"
                                                            size="small"
                                                        >
                                                            <MenuItem value="0">--Select Suppliers--</MenuItem>
                                                            {generateDropDownMenu(suppliers)}
                                                        </TextField>
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
                                                                { title: 'Quotation No.', render: rowData => "QT10" + rowData.tableData.id },
                                                                { title: 'Quotation Date', field: 'estimatedDate', render: rowData => rowData.estimatedDate.toISOString().split('T')[0] },
                                                                { title: 'Supplier', field: 'supplierID', render: rowData => generateTableSupplierID(rowData.supplierID) }
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