import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Box,
    Card,
    Grid,
    makeStyles,
    Container,
    CardHeader,
    CardContent,
    Divider,
    MenuItem,
    InputLabel,
    TextField,
    Paper,
    Chip,
    Button
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from "yup";
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import MaterialTable from "material-table";
import authService from '../../../utils/permissionAuth';
import { useAlert } from "react-alert";
import tokenService from '../../../utils/tokenDecoder';
import { LoadingComponent } from '../../../utils/newLoader';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableFooter from '@material-ui/core/TableFooter';
import _ from 'lodash';
import c from 'react-multiple-select-dropdown-lite';

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

const screenCode = 'FACTORYITEMSTOCKVIEW';

export default function InventoryView(props) {
    const classes = useStyles();
    const alert = useAlert();
    const navigate = useNavigate();

    const [itemCategory, setItemCategory] = useState([]);
    const [item, setItem] = useState([]);
    const [tableDataSupplierWise, setTableDataSupplierWise] = useState([]);
    const [tableDataGRNWise, setTableDataGRNWise] = useState([]);
    const [tableNewDataGRNWise, setTableNewDataGRNWise] = useState([]);
    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [isViewTable, setIsViewTable] = useState(true);
    const [checked, setChecked] = useState(false);

    const [formData, setFormdata] = useState({
        groupID: '0',
        factoryID: '0',
        itemCategory: '0',
        itemName: '0',
        itemCode: '',
        bulkSellingPrice: ''
    })

    const [stockTotal, setStockTotal] = useState({
        inStock: 0,
        buyingPrice: 0,
        sellingPrice: 0
    })

    const [open1, setOpen1] = React.useState(false);

    const handleClickOpen = () => {
        setOpen1(true);
    };

    const handleClose1 = () => {
        setOpen1(false);
        setFormdata({
            ...formData,
            bulkSellingPrice: ''
        })
    };

    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });

    useEffect(() => {
        trackPromise(
            getPermission()
        );
    }, []);

    useEffect(() => {
        trackPromise(
            getItemCategoryForDropDown(),
            getGroupsForDropdown()
        );
    }, [])

    useEffect(() => {
        trackPromise(
            getItemByItemCategoryForDropDown()
        );
    }, [formData.groupID, formData.factoryID, formData.itemCategory])

    useEffect(() => {
        trackPromise(
            getfactoriesForDropDown()
        );
    }, [formData.groupID]);

    useEffect(() => {
        if (formData.bulkSellingPrice != '') {
            calsellingPrice();
        }
        else {
            setTableDataGRNWise([...tableNewDataGRNWise]);
            let totSellingPrice = 0;
            tableNewDataGRNWise.forEach(x => {
                totSellingPrice = totSellingPrice + x.unitPrice;
            });
            setStockTotal({
                ...stockTotal,
                sellingPrice: totSellingPrice
            });
        }
    }, [formData.bulkSellingPrice]);

    useEffect(() => {
        if (formData.groupID > 0 && formData.factoryID > 0) {
            trackPromise(
                GetAllItemsDetails()
            )
        };
    }, [formData.groupID, formData.factoryID]
    );

    async function GetAllItemsDetails() {
        var result = await services.GetAllItemsDetails(formData.groupID, formData.factoryID);
        if (result.statusCode == "Success") {
            setIsViewTable(false);
            setTableDataSupplierWise(result.data);
        }
        else {
            alert.error(result.message);
        }

    }

    const handleCheckBox = (event) => {
        setChecked(event.target.checked);
        setTableDataSupplierWise([]);
        setTableDataGRNWise([]);
        setIsViewTable(true);
    };

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWFACTORYITEMSTOCKVIEW');

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

        setFormdata({
            ...formData,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.getGroupsForDropdown();
        setGroups(groups);
    }
    async function getfactoriesForDropDown() {
        const factory = await services.getfactoriesForDropDown(formData.groupID);
        setFactories(factory);
    }

    async function getItemCategoryForDropDown() {
        var res = await services.getItemCategoryForDropDown();
        setItemCategory(res);
    }

    async function getItemByItemCategoryForDropDown() {
        var res = await services.getItemByItemCategoryForDropDown(formData.groupID, formData.factoryID, formData.itemCategory);
        setItem(res);
    }

    function handleChange(e) {
        const target = e.target;
        const value = target.value
        setFormdata({
            ...formData,
            [e.target.name]: value
        });
        clearTable();
    }

    function handleChangeItemCategory(e) {
        const target = e.target;
        const value = target.value
        setFormdata({
            ...formData,
            itemCategory: value,
            itemName: 0
        });
        clearTable();
    }

    async function handleSearch(values) {
        var res = await services.GetFactoryItemByItemCategoryIDFactoryItemID(values.itemCategory, values.itemName, values.groupID, values.factoryID, values.itemCode);
        if (res.statusCode == "Success") {
            setTableDataSupplierWise(res.data);
            setIsViewTable(false);
        }
        else {
            alert.error("No record to display.");
            setIsViewTable(true);
        }
    }

    async function GetFactoryItemByGRNWise(factoryItemID) {
        var res = await services.GetFactoryItemByItemCategoryIDFactoryItemIDGRNWise(formData.itemCategory, factoryItemID, formData.groupID, formData.factoryID);
        if (res.statusCode == "Success") {
            setTableDataGRNWise(res.data);
            setTableNewDataGRNWise(res.data);
            let totInStock = 0;
            let totBuyingPrice = 0;
            let totSellingPrice = 0;
            res.data.forEach(x => {
                totInStock = totInStock + x.availableQuantity;
                totBuyingPrice = totBuyingPrice + x.buyingPrice;
                totSellingPrice = totSellingPrice + x.unitPrice;
            });
            setStockTotal({
                ...stockTotal,
                inStock: totInStock,
                buyingPrice: totBuyingPrice,
                sellingPrice: totSellingPrice
            });
            handleClickOpen();
        }
        else {
            alert.error("No record to display.");
        }
    }

    async function UpdateFactoryItemGRN() {
        tableDataGRNWise.forEach(x => {
            x.modifiedBy = tokenService.getUserIDFromToken();
        })
        var res = await services.UpdateFactoryItemGRN(tableDataGRNWise);
        if (res.statusCode == "Success") {
            alert.success(res.message);
            handleClose1();
        }
        else {
            alert.error(res.message);
        }
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

    function calsellingPrice() {
        const finalValue = formData.bulkSellingPrice;
        var reg = new RegExp('^[0-9]{1,9}([.][0-9]{1,2})?$');
        if (reg.test(finalValue) == false) {
            alert.error("Allow Only Numbers");
            return;
        }
        let totSellingPrice = 0;
        const newArr = _.cloneDeep(tableDataGRNWise)
        newArr.forEach(x => {
            x.unitPrice = parseFloat(finalValue);
            totSellingPrice = totSellingPrice + x.unitPrice;
        });
        setTableDataGRNWise(newArr)
        setStockTotal({
            ...stockTotal,
            sellingPrice: totSellingPrice
        });
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

    function clearTable() {
        setTableDataSupplierWise([]);
    }

    function changeText(e, rowID, columnID) {
        const target = e.target;
        const value = target.value;
        const finalValue = value == "" ? parseFloat(0) : value
        var reg = new RegExp('^[0-9]{1,9}([.][0-9]{1,2})?$');

        if (reg.test(finalValue) == false) {
            alert.error("Allow Only Numbers");
            return;
        }
        const newArr = [...tableDataGRNWise];
        var idx = newArr.findIndex(e => e.factoryItemGRNID == parseInt(rowID));
        newArr[idx] = { ...newArr[idx], [columnID]: finalValue == "" ? parseFloat(0) : parseFloat(finalValue) };

        setTableDataGRNWise(newArr)
        let totSellingPrice = 0;
        newArr.forEach(x => {
            totSellingPrice = totSellingPrice + x.unitPrice;
        });
        setStockTotal({
            ...stockTotal,
            sellingPrice: totSellingPrice
        });
    }

    return (
        <Page
            className={classes.root}
            title="Inventory View"
        >
            <LoadingComponent />
            <Container maxWidth={false}>
                <Formik
                    initialValues={{
                        groupID: formData.groupID,
                        factoryID: formData.factoryID,
                        itemCategory: formData.itemCategory,
                        itemName: formData.itemName,
                        itemCode: formData.itemCode
                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().required('Group required').min("1", 'Group required'),
                            factoryID: Yup.number().required('Factory required').min("1", 'Factory required'),
                            itemCategory: Yup.string(),
                            itemName: Yup.string(),
                            itemCode: Yup.string()
                        })
                    }
                    onSubmit={(values) => trackPromise(handleSearch(values))}
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
                                        title={cardTitle("Inventory View")}
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
                                                        fullWidth
                                                        name="groupID"
                                                        size='small'
                                                        onChange={(e) => handleChange(e)}
                                                        value={formData.groupID}
                                                        variant="outlined"
                                                        InputProps={{
                                                            readOnly: !permissionList.isGroupFilterEnabled,
                                                        }}
                                                    >
                                                        <MenuItem value="0" disabled={true}>--Select Group--</MenuItem>
                                                        {generateDropDownMenu(groups)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="factoryID">
                                                        Factory *
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="factoryID"
                                                        size='small'
                                                        onChange={(e) => handleChange(e)}
                                                        value={formData.factoryID}
                                                        variant="outlined"
                                                        id="factoryID"
                                                        InputProps={{
                                                            readOnly: !permissionList.isFactoryFilterEnabled,
                                                        }}
                                                    >
                                                        <MenuItem value="0" disabled={true}>--Select Factory--</MenuItem>
                                                        {generateDropDownMenu(factories)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="itemCategory">
                                                        Item Category
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="itemCategory"
                                                        size='small'
                                                        onChange={(e) => handleChangeItemCategory(e)}
                                                        value={formData.itemCategory}
                                                        variant="outlined"
                                                        error={Boolean(touched.itemCategory && errors.itemCategory)}
                                                        helperText={touched.itemCategory && errors.itemCategory}
                                                    >
                                                        <MenuItem value="0">--Select Item Category--</MenuItem>
                                                        {generateDropDownMenu(itemCategory)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="itemName">
                                                        Item
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="itemName"
                                                        size='small'
                                                        onChange={(e) => handleChange(e)}
                                                        value={formData.itemName}
                                                        variant="outlined"
                                                    >
                                                        <MenuItem value="0">--Select Item--</MenuItem>
                                                        {generateDropDownMenu(item)}
                                                    </TextField>
                                                </Grid>
                                            </Grid>
                                            <Grid container spacing={3}>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="itemCode">
                                                        Item Code
                                                    </InputLabel>
                                                    <TextField
                                                        fullWidth
                                                        name="itemCode"
                                                        size='small'
                                                        onChange={(e) => handleChange(e)}
                                                        value={formData.itemCode}
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
                                                    Search
                                                </Button>
                                            </Box>
                                        </CardContent>
                                        <Box minWidth={1000} hidden={isViewTable}>
                                            <MaterialTable
                                                title="Multiple Actions Preview"
                                                columns={[
                                                    { title: 'Item', field: 'itemName' },
                                                    { title: 'Item Code', field: 'itemCode' },
                                                    { title: 'Item Category', field: 'categoryName' },
                                                    {
                                                        title: 'In Stock',
                                                        field: 'availableQuantity',
                                                        render: rowData => (
                                                            <div>
                                                                <Chip label={rowData.availableQuantity} style={{ width: '100px', backgroundColor: rowData.availableQuantity <= 50 ? "#ff9999" : rowData.availableQuantity <= 150 ? "#ffc299" : "#afff99" }} />
                                                            </div>
                                                        ),
                                                    }
                                                ]}
                                                data={tableDataSupplierWise}
                                                options={{
                                                    exportButton: false,
                                                    showTitle: false,
                                                    headerStyle: { textAlign: "left", height: '1%' },
                                                    cellStyle: { textAlign: "left" },
                                                    columnResizable: false,
                                                    actionsColumnIndex: -1
                                                }}
                                                actions={[{
                                                    icon: 'article',
                                                    tooltip: 'GRN Wise',
                                                    onClick: (event, rowData) => trackPromise(GetFactoryItemByGRNWise(rowData.factoryItemID))
                                                }]}
                                            />
                                        </Box>
                                    </PerfectScrollbar>
                                </Card>
                            </Box>
                        </form>
                    )}
                </Formik>
                <Dialog fullWidth={true} maxWidth="lg" open={open1} onClose={handleClose1}>
                    <DialogTitle>GRN Wise Stock</DialogTitle>
                    <Box display="flex" p={2} style={{ marginLeft: '30px' }}>
                        <Grid item md={2} xs={12}>
                            <InputLabel shrink id="bulkSellingPrice">
                                Update Bulk Selling Price
                            </InputLabel>
                            <TextField
                                fullWidth
                                name="bulkSellingPrice"
                                size='small'
                                onChange={(e) => handleChange(e)}
                                value={formData.bulkSellingPrice}
                                variant="outlined"
                            />
                        </Grid>
                    </Box>
                    <DialogContent>
                        <DialogContentText>
                            <Container>
                                <TableContainer component={Paper}>
                                    <Table className={classes.table} aria-label="simple table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Item</TableCell>
                                                <TableCell align="center">Item Category</TableCell>
                                                <TableCell align="center">GRN Number</TableCell>
                                                <TableCell align="center">Supplier</TableCell>
                                                <TableCell align="center">In Stock</TableCell>
                                                <TableCell align="center">Unit Buying Price</TableCell>
                                                <TableCell align="center">Unit Selling Price</TableCell>
                                                <TableCell align="center">Invoice Date</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {tableDataGRNWise.map((row) => {
                                                let ID = row.factoryItemGRNID
                                                return (
                                                    <TableRow key={row.itemName}>
                                                        <TableCell component="th" scope="row">
                                                            {row.itemName}
                                                        </TableCell>
                                                        <TableCell align="center">{row.categoryName}</TableCell>
                                                        <TableCell align="center">{row.grnNumber}</TableCell>
                                                        <TableCell align="center">{row.supplierName}</TableCell>
                                                        <TableCell align="center">
                                                            <div>
                                                                <Chip label={row.availableQuantity} style={{ width: '100px', backgroundColor: row.availableQuantity <= 50 ? "#ff9999" : row.availableQuantity <= 150 ? "#ffc299" : "#afff99" }} />
                                                            </div>
                                                        </TableCell>
                                                        <TableCell align="center">{parseInt(row.buyingPrice).toFixed(2)}</TableCell>
                                                        <TableCell align='center'>
                                                            <Grid width={20} style={{ marginLeft: '10px' }}>
                                                                <TextField
                                                                    style={{ width: '120px' }}
                                                                    size='small'
                                                                    id="outlined-size-small"
                                                                    name={ID}
                                                                    onChange={(e) => changeText(e, row.factoryItemGRNID, 'unitPrice')}
                                                                    value={row.unitPrice}
                                                                    variant="outlined"
                                                                    InputProps={{
                                                                        readOnly: formData.bulkSellingPrice == '' ? false : true,
                                                                    }}
                                                                />
                                                            </Grid>
                                                        </TableCell>
                                                        <TableCell align="center">{row.invoiceDate.split('T')[0]}</TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                        <TableFooter>
                                            <TableRow>
                                                <TableCell colSpan={4}>
                                                    <b>Total</b>
                                                </TableCell>
                                                <TableCell align="center"><b>{parseInt(stockTotal.inStock)}</b></TableCell>
                                                <TableCell></TableCell>
                                                <TableCell></TableCell>
                                                <TableCell></TableCell>
                                            </TableRow>
                                        </TableFooter>
                                    </Table>
                                </TableContainer>
                            </Container>
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose1} >Cancel</Button>
                        <Button onClick={UpdateFactoryItemGRN}>Update</Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Page >
    );
}
