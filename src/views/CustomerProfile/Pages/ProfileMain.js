import React, { useState, useEffect, Fragment } from 'react';
import Page from 'src/components/Page';
import {
    Box,
    Card,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
    makeStyles,
    Container,
    Divider,
    TableContainer,
    CardContent,
    Grid,
    TextField,
    MenuItem,
    CardHeader
} from '@material-ui/core';
import { useNavigate } from 'react-router-dom';
import { LoadingComponent } from '../../../utils/newLoader';
import { Formik } from 'formik';
import * as Yup from "yup";
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import Avatar from '@material-ui/core/Avatar';
import EcoIcon from '@material-ui/icons/Eco';
import { blue } from '@material-ui/core/colors';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import SearchIcon from '@material-ui/icons/Search';
import BookmarksIcon from '@material-ui/icons/Bookmarks';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import CountUp from 'react-countup';
import services from '../Services';
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import LocalAtmIcon from '@material-ui/icons/LocalAtm';
import CreditCardIcon from '@material-ui/icons/CreditCard';
import HomeWorkIcon from '@material-ui/icons/HomeWork';
import GroupAddIcon from '@material-ui/icons/GroupAdd';
import { useAlert } from "react-alert";
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import VisibilityIcon from '@material-ui/icons/Visibility';
import Checkbox from '@material-ui/core/Checkbox';
import { trackPromise } from 'react-promise-tracker';
import tokenService from '../../../utils/tokenDecoder';
import permissionService from "../../../utils/permissionAuth";

import moment from 'moment';
import { AlertDialogWithoutButton } from 'src/views/Common/AlertDialogWithoutButton';

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.dark,
        minHeight: '100%',
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3)

    },
    rootTab: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
    },
    avatar: {
        marginRight: theme.spacing(2),
        backgroundColor: blue[800]
    },
    card: {
        backgroundColor: "#ffffff",
        borderRadius: '10px',
        boxShadow: ' 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
        marginInlineStart: theme.spacing(2),
        marginInlineEnd: theme.spacing(2),
        minHeight: 350,
        maxHeight: 350,
    },
    blue: {
        backgroundColor: blue[500],
    },
    searchRoot: {
        padding: '2px 4px',
        display: 'flex',
        alignItems: 'center'
    },
    input: {
        marginLeft: theme.spacing(1),
        flex: 1,
    },
    iconButton: {
        padding: 10,
    },
    divider: {
        height: 28,
        margin: 4,
    },
    large: {
        width: theme.spacing(20),
        height: theme.spacing(20),
        boxShadow: ' 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
        marginLeft: theme.spacing(5),
        position: "relative",
        overflow: "hidden",
        display: 'flex',
        zIndex: 1,
    },
    cardroot: {
    },
    profileInfoCard: {
        backgroundColor: "#ffffff",
        borderRadius: '10px',
        boxShadow: ' 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
        marginTop: theme.spacing(-12),
        marginInlineStart: theme.spacing(2),
        marginInlineEnd: theme.spacing(2),
        minHeight: 350,
        maxHeight: 350
    },
    profileAvatar: {
        marginTop: theme.spacing(-10),
    },
    Gridv1: {
        marginTop: theme.spacing(2),
    },
    NameTag: {
        marginLeft: theme.spacing(25),
        marginBottom: theme.spacing(2),
    },
    cardV1: {
        backgroundColor: "#ffffff",
        borderRadius: '10px',
        boxShadow: ' 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
        marginInlineStart: theme.spacing(2),
        marginInlineEnd: theme.spacing(2),
        marginTop: theme.spacing(-12),
        minHeight: 350,
        maxHeight: 350
    },
    table: {
        minWidth: 500,
        overflow: "scroll"
    },
    tableContainer: {
        maxHeight: 170
    }
}));


function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box p={3}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

const screenCode = 'CUSTOEMRPROFILE';

export default function CustomerProfileMain(props) {
    var element = document.getElementById("CustomerProfile");
    const classes = useStyles();
    const [title, setTitle] = useState("Customer Profile")
    const navigate = useNavigate();
    const alert = useAlert();
    const [value, setValue] = React.useState(0);
    const [regNo, setregNo] = useState("");
    const [searchReg, setSearchReg] = useState({
        groupID: 0,
        factoryID: 0,
        RegNo: ""
    });

    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });

    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [customerInformation, setCustomerInformation] = useState({
        customerID: 0,
        registrationNumber: "",
        groupName: "",
        factoryName: "",
        routeName: "",
        address: "",
        addressTwo: "",
        addressThree: "",
        mobile: "",
        firstName: "",
        secondName: "",
        lastName: "",
        joiningDate: "",
        customerBiometricData: "",
        balance: 0,
    })


    const [customerProfileInfoModel, setCustomerProfileInfoModel] = React.useState({
        totalCollectionCount: [],
        monthlyCollection: [],
        yearlyCollection: [],
        dailyCollection: []
    });

    const [customerAccountsNDependantModel, setCustomerAccountsNDependantModel] = React.useState({
        dependantInfoList: [],
        otherAccountsInfoList: []
    });

    const [customerProfileTransactionModel, setCustomerProfileTransactionModel] = React.useState({
        advancePaymentList: [],
        balancePaymentItemList: [],
        factoryItemList: [],
        loanList: []
    });
    const [dialog, setDialog] = useState(false);
    const handleClose = () => {
        setDialog(false);
    };

    useEffect(() => {
        trackPromise(
            getPermissions()
        )
    }, []);

    useEffect(() => {
        if (searchReg.groupID != 0) {
            trackPromise(
                getFactoriesForDropdown(searchReg.groupID)
            );
        }
    }, [searchReg.groupID])


    useEffect(() => {
        getGroupsForDropdown();

    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [searchReg.RegNo]);

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getFactoriesForDropdown(groupID) {
        const factories = await services.getAllFactoriesByGroupID(groupID);
        setFactories(factories);
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


    async function getPermissions() {
        var permissions = await permissionService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == "VIEWCUSTOMERPROFILE");

        if (isAuthorized === undefined) {
            navigate('/app/unauthorized');
        }

        var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
        var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');

        setPermissions({
            ...permissionList,
            isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
            isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined
        });

        setSearchReg({
            ...searchReg,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        });

        getGroupsForDropdown();
    }

    function OtherAccounts(item) {
        setDialog(true);
        setregNo(item.registrationNumber);
    }


    function handleGroupChange(e) {
        const target = e.target;
        const value = parseInt(target.value);
        setSearchReg({
            ...searchReg,
            [e.target.name]: value
        });

        if (value != 0) {
            getFactoriesForDropdown(value);
        }

    }

    function handleFactoryChange(e) {
        const target = e.target;
        const value = parseInt(target.value);
        setSearchReg({
            ...searchReg,
            [e.target.name]: value
        });

    }

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    function cardTitle(titleName) {
        return (
            <Grid container spacing={1}>
                <Grid item md={10} xs={12}>
                    {titleName}
                </Grid>
                <Grid item md={2} xs={12}>
                </Grid>
            </Grid>
        )
    }

    async function handleSearchClick() {

        trackPromise(LoadData(searchReg))

    }


    async function LoadData(searchData) {
        var res = await services.getCustomerInfo(searchData);

        if (res.data != null) {
            var collections = await services.getCustomerCollectionInfo(searchData);
            var transactions = await services.getCustomerTransactionInfo(searchData);
            var Accs = await services.getCustomerAccountInfo(searchData);

            setCustomerInformation(res.data);
            setCustomerProfileInfoModel(collections.data);
            setCustomerProfileTransactionModel(transactions.data);
            setCustomerAccountsNDependantModel(Accs.data);

        } else {
            alert.error("CAN'T FIND THIS CUSTOMER REGISTRATION NUMBER");
            await clearAll();
        }
    }
    async function clearAll() {
        setCustomerInformation({
            customerID: 0,
            registrationNumber: "",
            groupName: "",
            factoryName: "",
            routeName: "",
            address: "",
            addressTwo: "",
            addressThree: "",
            mobile: "",
            firstName: "",
            secondName: "",
            lastName: "",
            customerBiometricData: "",
            balance: 0,
        })


        setCustomerProfileInfoModel({
            totalCollectionCount: [],
            monthlyCollection: [],
            yearlyCollection: [],
            dailyCollection: []
        });

        setCustomerAccountsNDependantModel({
            dependantInfoList: [],
            otherAccountsInfoList: []
        });

        setCustomerProfileTransactionModel({
            advancePaymentList: [],
            balancePaymentItemList: [],
            factoryItemList: [],
            loanList: []
        });
    }
    function onChangeReg(event) {
        setSearchReg({
            ...searchReg,
            [event.target.name]: event.target.value
        });
    }

    function renderCollectionInfo(dataArray) {
        var total = 0;
        let dataset = dataArray === undefined || dataArray == null ? null : (
            dataArray.map((item) => {
                total = total + item.total
                return (
                    <ListItem button>
                        <ListItemIcon>
                            <BookmarksIcon />
                        </ListItemIcon>
                        <ListItemText primary={item.collectionTypeName} />
                        <ListItemSecondaryAction>
                            <Typography>
                                <CountUp
                                    end={item.total}
                                    decimals={2}
                                    suffix=" Kg"
                                    decimal="."
                                />

                            </Typography>
                        </ListItemSecondaryAction>

                    </ListItem>
                );

            }));

        return (
            <List component="nav" aria-label="main mailbox folders">
                {dataset}
                <Divider />
                <ListItem button>
                    <ListItemIcon>
                        <MonetizationOnIcon />
                    </ListItemIcon>
                    <ListItemText primary="Total" />
                    <ListItemSecondaryAction>
                        <Typography>
                            <CountUp
                                end={total}
                                decimals={2}
                                suffix=" Kg"
                                decimal="."
                            />
                        </Typography>
                    </ListItemSecondaryAction>
                </ListItem>
            </List>

        );


    }


    function renderTransactionInfo(dataArray) {
        let dataset = dataArray === undefined || dataArray == null ? null : (
            dataArray.map((item, index) => {

                return (
                    <TableRow key={index}>
                        <TableCell component="th" scope="row">
                            {moment(item.issuingDate).format('L')}
                        </TableCell>
                        <TableCell align="right"><CountUp
                            end={item.amount}
                            decimals={2}
                            decimal="."
                        /></TableCell>
                        <TableCell align="right">{item.applicableMonth}</TableCell>
                        <TableCell align="right">{item.applicableYear}</TableCell>
                    </TableRow>
                );
            }));

        return (
            <TableContainer component={Paper}>
                <Table className={classes.table} size="small" aria-label="a dense table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell align="right">Amount&nbsp;(LKR)</TableCell>
                            <TableCell align="right">Applicable Month</TableCell>
                            <TableCell align="right">Applicable Year</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {dataset}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    }

    function renderDailyCollectionInfo(dataArray) {
        let dataset = dataArray === undefined || dataArray === null ? null : (
            dataArray.map((item, index) => {

                return (
                    <TableBody>
                        <TableRow key={index}>
                            <TableCell component="th" scope="row">
                                <Typography variant="h5">{moment(item.category).format('L')}</Typography>

                            </TableCell>
                            <TableCell align="right">
                            </TableCell>
                            <TableCell align="right"></TableCell>
                        </TableRow>
                        {item.itemList.map(data => {
                            return (
                                <TableRow key={index}>
                                    <TableCell component="th" scope="row"> </TableCell>
                                    <TableCell align="right">{data.collectionTypeName}</TableCell>
                                    <TableCell align="right">
                                        <CountUp
                                            end={data.total}
                                            decimals={2}
                                            decimal="."
                                        />
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                );
            }));

        return (
            <TableContainer component={Paper} className={classes.tableContainer}>
                <Table className={classes.table} size="small" aria-label="a dense table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell align="right">CollectionType Name</TableCell>
                            <TableCell align="right">Weight&nbsp;(Kg)</TableCell>

                        </TableRow>
                    </TableHead>
                    {dataset}


                </Table>
            </TableContainer>
        );
    }

    function renderYearlyCollectionInfo(dataArray) {
        let dataset = dataArray === undefined || dataArray == null ? null : (
            dataArray.map((item, index) => {

                return (
                    <TableBody>
                        <TableRow key={index}>
                            <TableCell component="th" scope="row">
                                <Typography variant="h5">{item.category}</Typography>

                            </TableCell>
                            <TableCell align="right">
                            </TableCell>
                            <TableCell align="right"></TableCell>
                        </TableRow>
                        {item.itemList.map(data => {
                            return (
                                <TableRow key={index}>
                                    <TableCell component="th" scope="row"> </TableCell>
                                    <TableCell align="right">{data.collectionTypeName}</TableCell>
                                    <TableCell align="right">
                                        <CountUp
                                            end={data.total}
                                            decimals={2}
                                            decimal="."
                                        />
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                );
            }));

        return (
            <TableContainer component={Paper} className={classes.tableContainer}>
                <Table className={classes.table} size="small" aria-label="a dense table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell align="right">CollectionType Name</TableCell>
                            <TableCell align="right">Weight&nbsp;(Kg)</TableCell>

                        </TableRow>
                    </TableHead>
                    {dataset}


                </Table>
            </TableContainer>
        );
    }


    function renderMonthlyCollectionInfo(dataArray) {
        let dataset = dataArray === undefined || dataArray == null ? null : (
            dataArray.map((item, index) => {

                return (
                    <TableBody>
                        <TableRow key={index}>
                            <TableCell component="th" scope="row">
                                <Typography variant="h5">{moment(item.category).format('MMMM')} </Typography>
                            </TableCell>
                            <TableCell component="th" scope="row">
                                <Typography variant="h5">{item.year}</Typography>
                            </TableCell>
                            <TableCell align="right">
                            </TableCell>
                            <TableCell align="right"></TableCell>
                        </TableRow>
                        {item.itemList.map(data => {
                            return (
                                <TableRow key={index}>
                                    <TableCell component="th" scope="row"> </TableCell>
                                    <TableCell align="right"></TableCell>
                                    <TableCell align="right">{data.collectionTypeName}</TableCell>
                                    <TableCell align="right">
                                        <CountUp
                                            end={data.total}
                                            decimals={2}
                                            decimal="."
                                        />
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                );
            }));

        return (
            <TableContainer component={Paper} className={classes.tableContainer}>
                <Table className={classes.table} size="small" aria-label="a dense table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Month</TableCell>
                            <TableCell>Year</TableCell>
                            <TableCell align="right">CollectionType Name</TableCell>
                            <TableCell align="right">Amount&nbsp;(Kg)</TableCell>

                        </TableRow>
                    </TableHead>
                    {dataset}


                </Table>
            </TableContainer>
        );
    }

    function renderDependantAccountsInfo(dataArray) {

        let dataset = dataArray === undefined || dataArray == null ? null : (
            dataArray.map((item, index) => {

                return (
                    <TableRow key={index}>
                        <TableCell component="th" scope="row">
                            {item.supplimentaryName}
                        </TableCell>
                        <TableCell align="right">{item.nic}</TableCell>
                        <TableCell align="right">{item.transactionTypeName}</TableCell>
                    </TableRow>
                );

            }));

        return (
            <TableContainer component={Paper}>
                <Table className={classes.table} size="small" aria-label="a dense table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell align="right">NIC</TableCell>
                            <TableCell align="right">Transaction Type</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {dataset}
                    </TableBody>
                </Table>
            </TableContainer>
        );


    }

    function confirmData(regNo) {
        setDialog(false);
        setSearchReg({
            ...searchReg,
            RegNo: regNo
        })
        var formData = {
            groupID: searchReg.groupID,
            factoryID: searchReg.factoryID,
            RegNo: regNo
        }
        trackPromise(LoadData(formData));
        setTimeout(() => { element.scrollIntoView({ behavior: 'smooth' }); }, 100)
    }

    function renderOtherAccountsInfo(dataArray) {

        let dataset = dataArray === undefined || dataArray == null ? null : (
            dataArray.map((item, index) => {

                return (
                    <TableRow key={index}>
                        <TableCell component="th" scope="row">
                            {item.registrationNumber}
                        </TableCell>
                        <TableCell align="right">{item.balance}</TableCell>
                        <TableCell align="right">{item.routeName}</TableCell>
                        <TableCell align="right"><Checkbox
                            checked={item.isDefault}
                            color="primary"
                            inputProps={{ 'aria-label': 'secondary checkbox' }}
                        /></TableCell>
                        <TableCell align="right"><IconButton aria-label="delete" color="primary" onClick={(e) => OtherAccounts(item)}>
                            <VisibilityIcon />
                        </IconButton></TableCell>
                    </TableRow>
                );

            }));

        return (
            <TableContainer component={Paper}>
                <Table className={classes.table} size="small" aria-label="a dense table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Registration No</TableCell>
                            <TableCell align="right">Balance</TableCell>
                            <TableCell align="right">Route</TableCell>
                            <TableCell align="right">Is Default</TableCell>
                            <TableCell align="right">View Account</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {dataset}
                    </TableBody>
                </Table>
            </TableContainer>
        );


    }





    return (
        <Fragment>
            <LoadingComponent />
            <Page
                className={classes.root}
                title="Customer Profile"
            >
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{}}
                        validationSchema={
                            Yup.object().shape({})
                        }
                        enableReinitialize
                    >
                        {() => (
                            <form>
                                <Box mt={0}>
                                    <Card>
                                        <CardHeader
                                            title={cardTitle(title)}
                                        />
                                        <Divider />
                                        <Card id="CustomerProfile" className={classes.cardroot}>
                                            <CardContent>
                                                <Grid container spacing={3} >
                                                    <Grid item xs={4} ></Grid>
                                                    <Grid item xs={8}>
                                                        <Paper component="form" className={classes.searchRoot}>
                                                            <IconButton className={classes.iconButton} aria-label="menu">
                                                                <SupervisorAccountIcon />
                                                            </IconButton>
                                                            <TextField
                                                                fullWidth
                                                                variant="outlined"
                                                                select
                                                                name="groupID"
                                                                onChange={(e) => handleGroupChange(e)}
                                                                value={searchReg.groupID}
                                                                label="Select Group"
                                                                size="small"
                                                                InputProps={{
                                                                    readOnly: !permissionList.isGroupFilterEnabled,
                                                                }}
                                                            >
                                                                <MenuItem value="0">--Select Group--</MenuItem>
                                                                {generateDropDownMenu(groups)}
                                                            </TextField>
                                                            <Divider className={classes.divider} orientation="vertical" />
                                                            <IconButton className={classes.iconButton} aria-label="menu">
                                                                <HomeWorkIcon />
                                                            </IconButton>
                                                            <TextField
                                                                fullWidth
                                                                variant="outlined"
                                                                select
                                                                name="factoryID"
                                                                onChange={(e) => handleFactoryChange(e)}
                                                                value={searchReg.factoryID}
                                                                label="Select Factory"
                                                                size="small"
                                                                InputProps={{
                                                                    readOnly: !permissionList.isFactoryFilterEnabled,
                                                                }}
                                                            >
                                                                <MenuItem value="0">--Select Factory--</MenuItem>
                                                                {generateDropDownMenu(factories)}
                                                            </TextField>
                                                            <Divider className={classes.divider} orientation="vertical" />
                                                            <IconButton className={classes.iconButton} aria-label="menu">
                                                                <CreditCardIcon />
                                                            </IconButton>

                                                            <TextField
                                                                variant="outlined"
                                                                fullWidth
                                                                name="RegNo"
                                                                id="standard-basic"
                                                                label="Registration No" size="small"
                                                                value={searchReg.RegNo}
                                                                onChange={(e) => onChangeReg(e)}
                                                            />

                                                            <Divider className={classes.divider} orientation="vertical" />
                                                            <IconButton type="button" className={classes.iconButton} aria-label="search" onClick={(e) => handleSearchClick()}>
                                                                <SearchIcon />
                                                            </IconButton>
                                                        </Paper>
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                        </Card>
                                        <div className={classes.profileAvatar} hidden={customerInformation.customerID == 0 ? true : false}>
                                            <Grid container spacing={3}>
                                                <Grid item xs={2} >
                                                    <div>
                                                        {customerInformation.customerBiometricData === null ?
                                                            <Avatar aria-label="recipe" className={classes.large}><SupervisorAccountIcon /></Avatar> :
                                                            <Avatar aria-label="recipe" src={'data:image/jpg;base64,' + customerInformation.customerBiometricData} className={classes.large}></Avatar>
                                                        }

                                                    </div>
                                                </Grid>
                                            </Grid>
                                        </div>
                                        <div hidden={customerInformation.customerID == 0 ? true : false}>
                                            <Grid container spacing={3}>
                                                <Grid item xs={6} >
                                                    <Card className={classes.profileInfoCard}>
                                                        <CardContent>
                                                            <div className={classes.NameTag}>
                                                                <Typography variant="h4" gutterBottom>
                                                                    {customerInformation.firstName + " " + customerInformation.secondName + " " + customerInformation.lastName}
                                                                </Typography>
                                                                <br /><br />
                                                                <Typography variant="h5">
                                                                    {"RegNo:" + customerInformation.registrationNumber}
                                                                </Typography>
                                                                <Typography variant="h5">
                                                                    {customerInformation.address}
                                                                </Typography >
                                                                <Typography variant="h5">
                                                                    {customerInformation.mobile}
                                                                </Typography>
                                                                <Typography variant="h5">
                                                                    {customerInformation.factoryName}
                                                                </Typography>
                                                                <Typography variant="h5">
                                                                    {customerInformation.routeName}
                                                                </Typography>
                                                                <Typography variant="h5">
                                                                    {"Joined Date:" + moment(customerInformation.joiningDate).format('MMMM Do YYYY')}
                                                                </Typography>
                                                            </div>
                                                            <Grid container spacing={3} alignContent="center" >
                                                                <Grid item xs={3} ></Grid>
                                                                <Grid item xs={6} alignContent="center" alignItems="center"  >
                                                                    <Card >
                                                                        <CardContent>
                                                                            <Typography variant="h4" align="center">
                                                                                Balance :  <CountUp
                                                                                    end={customerInformation.balance}
                                                                                    decimals={2}
                                                                                    suffix=" LKR"
                                                                                    decimal="."
                                                                                />
                                                                            </Typography>
                                                                        </CardContent>
                                                                    </Card>
                                                                </Grid>
                                                                <Grid item xs={3} ></Grid>
                                                            </Grid>


                                                        </CardContent>
                                                    </Card>
                                                </Grid>


                                                <Grid item xs={6} >
                                                    <Card className={classes.cardV1}>
                                                        <CardHeader
                                                            avatar={
                                                                <Avatar aria-label="recipe" className={classes.avatar}><EcoIcon /></Avatar>
                                                            }
                                                            title={<Typography variant="h5">Leaf Collection To-Date Values</Typography>}
                                                            subheader=""
                                                        />
                                                        <CardContent>
                                                            {renderCollectionInfo(customerProfileInfoModel.totalCollectionCount)}
                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                            </Grid>
                                            <br />

                                            <Grid container spacing={3} className={classes.Gridv1}>
                                                <Grid item xs={6} >
                                                    <Card className={classes.card}>
                                                        <CardHeader
                                                            avatar={
                                                                <Avatar aria-label="recipe" className={classes.avatar}><EcoIcon /></Avatar>
                                                            }
                                                            title={<Typography variant="h5">Collection Count Details</Typography>}
                                                            subheader=""
                                                        />
                                                        <CardContent>
                                                            <div className={classes.rootTab}>
                                                                <AppBar position="static">
                                                                    <Tabs value={value} onChange={handleChange} aria-label="simple tabs example">
                                                                        <Tab label="Daily" {...a11yProps(0)} />
                                                                        <Tab label="Monthly" {...a11yProps(1)} />
                                                                        <Tab label="Yearly" {...a11yProps(2)} />
                                                                    </Tabs>
                                                                </AppBar>
                                                                <TabPanel value={value} index={0}>
                                                                    {renderDailyCollectionInfo(customerProfileInfoModel.dailyCollection)}
                                                                </TabPanel>
                                                                <TabPanel value={value} index={1}>
                                                                    {renderMonthlyCollectionInfo(customerProfileInfoModel.monthlyCollection)}
                                                                </TabPanel>
                                                                <TabPanel value={value} index={2}>
                                                                    {renderYearlyCollectionInfo(customerProfileInfoModel.yearlyCollection)}
                                                                </TabPanel>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                                <Grid item xs={6} >
                                                    <Card className={classes.card}>
                                                        <CardHeader
                                                            avatar={
                                                                <Avatar aria-label="recipe" className={classes.avatar}><LocalAtmIcon /></Avatar>
                                                            }
                                                            title={<Typography variant="h5">Last Advance Payment Details</Typography>}
                                                            subheader=""
                                                        />
                                                        <CardContent>
                                                            {renderTransactionInfo(customerProfileTransactionModel.advancePaymentList)}
                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                            </Grid>

                                            <Grid container spacing={3}>
                                                <Grid item xs={6} >
                                                    <Card className={classes.card}>
                                                        <CardHeader
                                                            avatar={
                                                                <Avatar aria-label="recipe" className={classes.avatar}><AccountBalanceWalletIcon /></Avatar>
                                                            }
                                                            title={<Typography variant="h5">Last Balance Payment Details</Typography>}
                                                            subheader=""
                                                        />
                                                        <CardContent>
                                                            {renderTransactionInfo(customerProfileTransactionModel.balancePaymentItemList)}
                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                                <Grid item xs={6} >
                                                    <Card className={classes.card}>
                                                        <CardHeader
                                                            avatar={
                                                                <Avatar aria-label="recipe" className={classes.avatar}>
                                                                    <HomeWorkIcon />
                                                                </Avatar>
                                                            }
                                                            title={<Typography variant="h5">Last Factory Item Details</Typography>}
                                                            subheader=""
                                                        />
                                                        <CardContent>
                                                            {renderTransactionInfo(customerProfileTransactionModel.factoryItemList)}
                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                            </Grid>
                                            <Grid container spacing={3}>
                                                <Grid item xs={6} >
                                                    <Card className={classes.card}>
                                                        <CardHeader
                                                            avatar={
                                                                <Avatar aria-label="recipe" className={classes.avatar}>
                                                                    <CreditCardIcon />
                                                                </Avatar>
                                                            }
                                                            title={<Typography variant="h5">Loan Details</Typography>}
                                                            subheader=""
                                                        />
                                                        <CardContent>
                                                            {renderTransactionInfo(customerProfileTransactionModel.loanList)}
                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                                <Grid item xs={6} >
                                                    <Card className={classes.card}>
                                                        <CardHeader
                                                            avatar={
                                                                <Avatar aria-label="recipe" className={classes.avatar}>
                                                                    <GroupAddIcon />
                                                                </Avatar>
                                                            }
                                                            title={<Typography variant="h5">Dependant Details</Typography>}
                                                            subheader=""
                                                        />
                                                        <CardContent>
                                                            {renderDependantAccountsInfo(customerAccountsNDependantModel.dependantInfoList)}

                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                            </Grid>
                                            <Grid container spacing={3}>
                                                <Grid item xs={6} >
                                                    <Card className={classes.card}>
                                                        <CardHeader
                                                            avatar={
                                                                <Avatar aria-label="recipe" className={classes.avatar}>
                                                                    <AccountCircleIcon />
                                                                </Avatar>
                                                            }
                                                            title={<Typography variant="h5">Other Accounts</Typography>}
                                                            subheader=""
                                                        />
                                                        <CardContent>
                                                            {renderOtherAccountsInfo(customerAccountsNDependantModel.otherAccountsInfoList)}

                                                        </CardContent>
                                                    </Card>
                                                </Grid>

                                            </Grid>
                                        </div>
                                        <br />
                                    </Card>
                                </Box>
                            </form>
                        )}
                    </Formik>
                </Container>
                {
                    dialog ?
                        <AlertDialogWithoutButton confirmData={() => confirmData(regNo)} cancelData={handleClose}
                            headerMessage={"Confirm To View Account"}
                            discription={"Do you need to view " + regNo + " account"} />
                        : null
                }

            </Page>
        </Fragment>
    )
}