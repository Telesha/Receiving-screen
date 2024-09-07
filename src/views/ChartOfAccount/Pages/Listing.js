import React, { useState, useEffect, createContext } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Box,
    Card,
    Grid,
    Tab,
    Tabs,
    Paper,
    Button,
    InputLabel,
    TextField,
    MenuItem,
    makeStyles,
    Container,
    CardHeader,
    CardContent,
    Divider
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import tokenDecoder from 'src/utils/tokenDecoder';
import { LoadingComponent } from 'src/utils/newLoader';
import authService from 'src/utils/permissionAuth';
import tokenService from 'src/utils/tokenDecoder';
import { ChartOfAccount } from '../Components/ChartComponent';
import { AccountTypePopUp } from '../PopUps/AccountType/AccountType';
import { ParentHeaderPopUp } from '../PopUps/ParentHeader/ParentHeader';
import { DetailTypePopUp } from '../PopUps/DetailType/DetailType';
import { LedgerAccountPopUp } from '../PopUps/LedgerAccount/LedgerAccount';

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
    mainButtons: {
        marginRight: '0.5rem'
    },
    tabBarBackround: {
        backgroundColor: "white",
        maxWidth: "1150px",
    },
    tabTitle: {
        color: "black",
        maxWidth: "3rem"
    },
    spanStyle: {
        color: "black",
        fontSize: "0.8rem"
    }
}));

const screenCode = 'CHARTOFACCOUNT';

export default function ChartOfAccountListing(props) {
    const [open, setOpen] = useState(false);
    const [openParentHeader, setOpenParentHeader] = useState(false);
    const [openDetailType, setOpenDetailType] = useState(false);
    const [openLedgerAccount, setOpenLedgerAccount] = useState(false);

    const classes = useStyles();
    const navigate = useNavigate();

    const [value, setValue] = React.useState(0);
    const [AccountTypeDetailsList, setAccountTypeDetailsList] = useState([])
    const [ParentHeaderDetailsList, setParentHeaderDetailsList] = useState([])
    const [ChartOfAccountDetailsList, setChartOfAccountDetailsList] = useState();
    const [FilteredChartsOfAccountDetailsList, setFilteredChartsOfAccountDetailsList] = useState();
    const [GroupList, setGroupList] = useState();
    const [FactoryList, setFactoryList] = useState();
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: true,
        isFactoryFilterEnabled: true,
        isAuthorizedToDelete: true,
        isAuthorizedToAccountType: true
    });
    const [FormDetails, setFormDetails] = useState({
        groupID: tokenDecoder.getGroupIDFromToken(),
        factoryID: tokenDecoder.getFactoryIDFromToken()
    });
    const [TabFiltersName, setTabFiltersName] = useState()
    useEffect(() => {
        trackPromise(getPermission());
        trackPromise(getAllGroups());
        trackPromise(getFactoryByGroupID(tokenDecoder.getGroupIDFromToken()));
    }, [])

    useEffect(() => {
        trackPromise(GetChartOfAccountDetails(FormDetails.groupID, FormDetails.factoryID));
    }, [FormDetails.groupID])

    useEffect(() => {
        trackPromise(GetChartOfAccountDetails(FormDetails.groupID, FormDetails.factoryID));
        trackPromise(GetAllAccountTypes(FormDetails.groupID, FormDetails.factoryID))
    }, [FormDetails.factoryID])

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode === 'VIEWCHARTOFACCOUNT');

        if (isAuthorized === undefined) {
            navigate('/404');
        }

        var isGroupFilterEnabled = permissions.find(p => p.permissionCode === 'GROUPDROPDOWN');
        var isFactoryFilterEnabled = permissions.find(p => p.permissionCode === 'FACTORYDROPDOWN');
        var isAuthorizedToDelete = permissions.find(p => p.permissionCode === 'UPDATECHARTOFACCOUNTSTATUS');
        var isAuthorizedToAccountType = permissions.find(p => p.permissionCode === 'VIEWACCOUNTTYPE');

        setPermissions({
            ...permissionList,
            isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
            isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
            isAuthorizedToDelete: isAuthorizedToDelete !== undefined,
            isAuthorizedToAccountType: isAuthorizedToAccountType !== undefined
        });

        setFormDetails({
            ...FormDetails,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }


    const handleChange = (event, newValue) => {
        const filterName = TabFiltersName[newValue];
        setValue(newValue);
        let tempArray = ChartOfAccountDetailsList;
        if (filterName.match("All Accounts")) {
            setFilteredChartsOfAccountDetailsList(ChartOfAccountDetailsList);
        } else {
            setFilteredChartsOfAccountDetailsList(tempArray.filter(e => e.accountType === filterName))
        }

    };

    function HandleCreateAccountType() {
        if (open === true) {
            ReloadAllAcoountTypesAndAccountDetails();
        }
        setOpen(!open);
    }

    function HandleCreateParentHeader() {
        if (openParentHeader === true) {
            ReloadAllAcoountTypesAndAccountDetails();
        }
        setOpenParentHeader(!openParentHeader);
    }

    const HandleCreateChildHeader = () => {
        if (openDetailType === true) {
            ReloadAllAcoountTypesAndAccountDetails();
        }
        setOpenDetailType(!openDetailType);
    }

    const HandleCreateAccount = () => {
        if (openLedgerAccount === true) {
            ReloadAllAcoountTypesAndAccountDetails();
        }
        setOpenLedgerAccount(!openLedgerAccount);
    }

    const HandleViewTreeViewAccount = () => {
        let decryptedGroupID = btoa(FormDetails.groupID.toString());
        let decryptedFactoryID = btoa(FormDetails.factoryID.toString());

        navigate('/app/chartOfAccount/viewTreeView/' + decryptedGroupID + '/' + decryptedFactoryID);
    }

    async function GetChartOfAccountDetails(groupID, factoryID) {
        const result = await services.GetChartOfAccountDetailsByGroupIDAndFactoryID(groupID, factoryID);
        setAccountTypeDetailsList(result.accountTypeDetailsList)
        setParentHeaderDetailsList(result.parentHeaderDetailsList)

        let array = [];
        let tempAccountTypeArray = result.accountTypeDetailsList;
        let tempParentHeaderArray = result.parentHeaderDetailsList;
        let tempChildHeaderArray = result.childHeaderDetailsList;
        let tempLedgerAccountArray = result.ledgerAccountDetailsList;

        let isDelete = 0;

        for (const element of tempAccountTypeArray) {
            for (const child of tempParentHeaderArray) {
                if (element.accountTypeID == child.accountTypeID) {
                    isDelete = 0;
                    break;
                } else {
                    isDelete = 1;
                }
            }

            let object = {
                id: element.accountTypeID + "-" + "1",
                accountNumber: element.accountTypeCode,
                accountName: element.accountTypeName,
                accountType: element.accountTypeName,
                accountLevel: element.level,
                accountCurrentBalance: element.totalBalance,
                action: isDelete
            }
            array.push(object);
        }

        for (const element of tempParentHeaderArray) {
            for (const child of tempChildHeaderArray) {
                if (element.parentHeaderID == child.parentHeaderID) {
                    isDelete = 0;
                    break;
                } else {
                    isDelete = 1;
                }
            }

            let object = {
                id: element.parentHeaderID + "-" + "2",
                accountNumber: element.parentHeaderCode,
                accountName: element.parentHeaderName,
                accountType: element.accountTypeName,
                parentId: element.accountTypeID + "-" + "1",
                accountLevel: element.level,
                accountCurrentBalance: element.totalBalance,
                action: isDelete
            }
            array.push(object);
        }

        for (const element of tempChildHeaderArray) {
            for (const child of tempLedgerAccountArray) {
                if (element.childHeaderID == child.childHeaderID) {
                    isDelete = 0;
                    break;
                } else {
                    isDelete = 1;
                }
            }

            let object = {
                id: element.childHeaderID + "-" + "3",
                accountNumber: element.childHeaderCode,
                accountName: element.childHeaderName,
                accountType: element.accountTypeName,
                parentId: element.parentHeaderID + "-" + "2",
                accountLevel: element.level,
                accountCurrentBalance: element.totalBalance,
                action: isDelete
            }
            array.push(object);
        }


        for (const element of tempLedgerAccountArray) {
            //const ledgerTrasaction = await services.GetLedgerTrasactionDetailsByLedgerAccountID(element.ledgerAccountID);

            if (element.ledgerTransactionCount > 0) {
                isDelete = 0;
            }
            else {
                isDelete = 1;
            }

            let object = {
                id: element.ledgerAccountID + "-" + "4",
                accountNumber: element.ledgerAccountCode,
                accountName: element.ledgerAccountName,
                accountType: element.accountTypeName,
                parentId: element.childHeaderID + "-" + "3",
                accountLevel: element.level,
                accountCurrentBalance: element.balance,
                action: isDelete
            }
            array.push(object);
        }
        setChartOfAccountDetailsList(array);
        const tabNames = await services.GetAllAccountAccountTypes(groupID, factoryID);
        setTabFiltersName(tabNames);
        if (tabNames[value].match('All Accounts')) {
            setFilteredChartsOfAccountDetailsList(array)
        } else {
            setFilteredChartsOfAccountDetailsList(array.filter(e => e.accountType === tabNames[value]));
        }
    }

    function cardTitle(titleName) {
        return (
            <>
                <Grid container spacing={1}>
                    <Grid item md={2} xs={12}>
                        {titleName}
                    </Grid>
                    <Grid item md={10} xs={14}>
                        <Box display="flex" justifyContent="flex-end" p={1}>
                            <Button
                                color="inherit"
                                variant="contained"
                                size="small"
                                className={classes.mainButtons}
                                onClick={HandleViewTreeViewAccount}
                            >
                                View Accounts Hierarchy
                            </Button>
                            {permissionList.isAuthorizedToAccountType == true ? (
                                <Button
                                    color="inherit"
                                    variant="contained"
                                    size="small"
                                    className={classes.mainButtons}
                                    onClick={HandleCreateAccountType}
                                >
                                    Create Account Type
                                </Button>
                            ) : null}
                            <AccountTypePopUp open={open} HandleCreateAccountType={HandleCreateAccountType} />
                            <Button
                                color="inherit"
                                variant="contained"
                                size="small"
                                className={classes.mainButtons}
                                onClick={HandleCreateParentHeader}
                            >
                                Create Parent Header
                            </Button>
                            <ParentHeaderPopUp openParentHeader={openParentHeader} HandleCreateParentHeader={HandleCreateParentHeader} />
                            <Button
                                color="inherit"
                                variant="contained"
                                size="small"
                                className={classes.mainButtons}
                                onClick={HandleCreateChildHeader}
                            >
                                Create Child Header
                            </Button>
                            <DetailTypePopUp openDetailType={openDetailType} HandleCreateChildHeader={HandleCreateChildHeader} />
                            <Button
                                color="primary"
                                variant="contained"
                                size="small"
                                onClick={HandleCreateAccount}
                            >
                                Create Ledger Account
                            </Button>
                            <LedgerAccountPopUp openLedgerAccount={openLedgerAccount} HandleCreateAccount={HandleCreateAccount} />
                        </Box>
                    </Grid>
                </Grid>
                <Grid container spacing={1}>
                    <Grid item md={3} xs={12}>
                        <InputLabel shrink id="groupID">
                            Group *
                        </InputLabel>

                        <TextField select
                            fullWidth
                            name="groupID"
                            onChange={(e) => {
                                handleChange1(e)
                                loadFactory(e)
                            }}
                            value={FormDetails.groupID}
                            variant="outlined"
                            id="groupID"
                            size='small'
                            disabled={!permissionList.isGroupFilterEnabled}
                        >
                            <MenuItem value={'0'} disabled={true}>
                                --Select Group--
                            </MenuItem>
                            {generateDropDownMenu(GroupList)}
                        </TextField>
                    </Grid>
                    <Grid item md={3} xs={12}>
                        <InputLabel shrink id="factoryID">
                            Estate *
                        </InputLabel>

                        <TextField select
                            fullWidth
                            name="factoryID"
                            onChange={(e) => {
                                handleChange1(e)
                            }}
                            value={FormDetails.factoryID}
                            variant="outlined"
                            id="factoryID"
                            size='small'
                            disabled={!permissionList.isFactoryFilterEnabled}
                        >
                            <MenuItem value={'0'}>
                                --Select Estate--
                            </MenuItem>
                            {generateDropDownMenu(FactoryList)}
                        </TextField>
                    </Grid>
                </Grid>
                <br />
                <Grid container
                    direction="row"
                    justifyContent="space-evenly"
                    alignItems="flex-start"
                >
                    <div style={{ width: '100%' }}>
                        <Paper >
                            <Tabs
                                indicatorColor="primary"
                                value={value}
                                onChange={handleChange}
                                variant="scrollable"
                                scrollButtons="auto"
                                className={classes.tabBarBackround}
                            >
                                {
                                    TabFiltersName !== undefined && TabFiltersName.length !== 0 ?
                                        TabFiltersName.map((ob) => {
                                            return (<Tab label={<span className={classes.spanStyle}>{ob}</span>} className={classes.tabTitle} />)
                                        })
                                        : null
                                }
                            </Tabs>
                        </Paper>
                    </div>
                </Grid>
            </>
        )
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

    async function getAllGroups() {
        var response = await services.GetAllGroups();
        setGroupList(response);
    };

    const loadFactory = (event) => {
        setChartOfAccountDetailsList([])
        trackPromise(getFactoryByGroupID(event.target.value));
    };

    async function getFactoryByGroupID(groupID) {
        var response = await services.GetFactoryByGroupID(groupID);
        setFactoryList(response);
    };

    async function GetAllAccountTypes(groupID, factoryID) {
        const result = await services.GetAllAccountAccountTypes(groupID, factoryID)
        setTabFiltersName(result)
    }

    function handleChange1(e) {
        const target = e.target;
        const value = target.value
        setFormDetails({
            ...FormDetails,
            [e.target.name]: value
        });
    }

    async function ReloadAllAcoountTypesAndAccountDetails() {
        trackPromise(GetChartOfAccountDetails(FormDetails.groupID, FormDetails.factoryID));
        trackPromise(GetAllAccountTypes(FormDetails.groupID, FormDetails.factoryID))
    }
    function getDatilsForRefresh() {
        trackPromise(GetChartOfAccountDetails(FormDetails.groupID, FormDetails.factoryID));
    }

    return (
        <Page
            className={classes.root}
            title="Chart Of Account"
        >
            <LoadingComponent />
            <Container maxWidth={false}>
                <Box mt={0}>
                    <Card>
                        <CardHeader
                            title={cardTitle("Chart Of Account")}
                        />
                        <PerfectScrollbar>
                            <Divider />
                            <CardContent>
                                <Card>
                                    <CardContent>
                                        <ChartOfAccount
                                            ChartOfAccountDetailsList={FilteredChartsOfAccountDetailsList}
                                            getDetails={getDatilsForRefresh}
                                            isAuthorizedToDelete={permissionList.isAuthorizedToDelete}
                                        />
                                    </CardContent>
                                </Card>
                            </CardContent>
                        </PerfectScrollbar>
                    </Card>
                </Box>
            </Container>
        </Page>
    )
}
