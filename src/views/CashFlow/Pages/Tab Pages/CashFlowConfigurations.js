import React, { useState, useEffect, Fragment } from 'react';
import { useAlert } from "react-alert";
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Card, Grid, TextField, makeStyles, Button, CardContent, Divider, InputLabel, MenuItem } from '@material-ui/core';
import services from '../../Services';
import { trackPromise } from 'react-promise-tracker';
import { Formik} from 'formik';
import PageHeader from 'src/views/Common/PageHeader';
import * as Yup from "yup";
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { useNavigate, useParams } from 'react-router-dom';
import { LoadingComponent } from '../../../../utils/newLoader';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import Paper from '@material-ui/core/Paper';
import SearchIcon from '@material-ui/icons/Search';


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
    colorRecord: {
        backgroundColor: "green",
    },
    bold: {
        fontWeight: 600,
    }

}));

const screenCode = 'CASHFLOW';

export default function CashFlowConfigurations(props) {

    const navigate = useNavigate();
    const alert = useAlert();
    const { groupID } = useParams();
    const { factoryID } = useParams();
    const classes = useStyles();
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });
    const handleClickNavigate = () => {
        navigate('/app/CashFlow/CashFlowReport');
    }
    const [CashFlowConfigurationDetails, setCashFlowConfigurationDetails] = useState({
        groupID: 0,
        factoryID: 0,
        cashFlowChildSectionName: '0',
        parentSectionID: '0',
        accountFilterType: '0',
        accountFilterText: ''
    });
    const [ProfitAndLossSectionList, setProfitAndLossSectionList] = useState([]);
    const [checked, setChecked] = useState([]);
    const [LeftNewArray, setLeftNewArray] = useState([]);
    const [RightNewArray, setRightNewArray] = useState([]);
    const [RightNewArrayAlreadyStoredAccounts, setRightNewArrayAlreadyStoredAccounts] = useState([])
    const [RemovedLedgerAccountList, setRemovedLedgerAccountList] = useState([]);
    const [ParentSectionNameList, setParentSectionNameList] = useState();
    const leftChecked = intersection(checked, LeftNewArray);
    const rightChecked = intersection(checked, RightNewArray);

    function SetTestValue(e) {

        const value = e.target.value;
        setCashFlowConfigurationDetails({
            ...CashFlowConfigurationDetails,
            [e.target.name]: value,
        });
        sessionStorage.setItem("xy97pq", value)
    }

    function not(a, b) {
        return a.filter((value) => b.map(obj => obj.ledgerAccountID).indexOf(value.ledgerAccountID) === -1);
    }

    function intersection(a, b) {
        return a.filter((value) => b.map(obj => obj.ledgerAccountID).indexOf(value.ledgerAccountID) !== -1);
    }

    const handleToggle = (value) => () => {
        const currentIndex = checked.map(obj => obj.ledgerAccountID).indexOf(value.ledgerAccountID);
        const newChecked = [...checked];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }
        setChecked(newChecked);
    };

    const handleCheckedRight = () => {
        setRemovedLedgerAccountList(not(RemovedLedgerAccountList, leftChecked))
        setRightNewArray(RightNewArray.concat(leftChecked));
        setLeftNewArray(not(LeftNewArray, leftChecked));
        setChecked(not(checked, leftChecked));
    };

    const handleCheckedLeft = () => {

        setRemovedLedgerAccountList(RemovedLedgerAccountList.concat(rightChecked))

        setLeftNewArray(LeftNewArray.concat(rightChecked));
        setRightNewArray(not(RightNewArray, rightChecked));
        setChecked(not(checked, rightChecked));
    };

    const customList = (items) => (
        items.length > 0 ?
            <Paper className={classes.paper}>
                <List dense component="div" role="list">
                    {items.map((value) => {
                        const labelId = `transfer-list-item-${value.ledgerAccountID}-label`;

                        return (
                            <ListItem key={value.ledgerAccountID} role="listitem" button onClick={handleToggle(value)}>
                                <ListItemIcon>
                                    <Checkbox
                                        checked={checked.map(obj => obj.ledgerAccountID).indexOf(value.ledgerAccountID) !== -1}
                                        tabIndex={-1}
                                        disableRipple
                                        inputProps={{ 'aria-labelledby': labelId }}
                                    />
                                </ListItemIcon>
                                <ListItemText id={labelId} primary={value.ledgerAccountName} />
                            </ListItem>
                        );
                    })}
                    <ListItem />
                </List>
            </Paper> : null
    );

    useEffect(() => {
        const DecryptedGroupID = atob(groupID.toString());
        const DecryptedFactoryID = atob(factoryID.toString());

        setCashFlowConfigurationDetails({ ...CashFlowConfigurationDetails, groupID: parseInt(DecryptedGroupID), factoryID: parseInt(DecryptedFactoryID) })
        trackPromise(getPermission());
        trackPromise(GetParentSectionDetails(parseInt(DecryptedGroupID), parseInt(DecryptedFactoryID)))
    }, []);

    async function GetParentSectionDetails(groupID, factoryID) {
        var parentSectionList = [];
        const respose = await services.GetParentSectionDetails(groupID, factoryID)
        for (let item of Object.entries(respose)) {
            parentSectionList[item[1]['cashFlowParentSectionID']] = item[1]['cashFlowParentSectionName'];
        }
        setParentSectionNameList(parentSectionList)
    }

    async function GetCashFlowCreatedSectionDetailsWithGroupFactoryParentSectionID(e) {

        ClearAllArrays();
        const cashFlowParentSectionID = e.target.value
        const respose = await services.GetCashFlowCreatedSectionDetailsWithGroupFactoryParentSectionID(CashFlowConfigurationDetails.groupID, CashFlowConfigurationDetails.factoryID, cashFlowParentSectionID);

        if (respose !== null && respose.length > 0) {
            setProfitAndLossSectionList(respose)
        } else {
            alert.error("Please configure section names")
        }
    }
    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWCONFIGURATIONCHASHFLOW');

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
    }

    async function LoadSetupCofigurations(e) {

        sessionStorage.setItem("xy97pq", "");
        const values = e.target.value
        setCashFlowConfigurationDetails({
            ...CashFlowConfigurationDetails,
            [e.target.name]: values,
            accountFilterText: "",
            accountFilterType: '0'
        });
        setChecked([])
        setLeftNewArray([])
        setRightNewArray([])
        setRightNewArrayAlreadyStoredAccounts([])
        setRemovedLedgerAccountList([])

        const value = e.target.value
        const copConfigDetails = await GetSetupConfigurationDetails(value);

        if (copConfigDetails.data.ledgerAccountList.length === 0) {
            alert.error("Configuration details not found");
        }
        const chartOfAccountList = await GetAllChartOfAccountDetails();
        if (chartOfAccountList.length === 0) {
            alert.error("Ledger accounts not found");
        }

        if (copConfigDetails.data.ledgerAccountList.length === 0) {
            setRightNewArray([]);
            setRightNewArrayAlreadyStoredAccounts([])
        } else {
            setRightNewArray(copConfigDetails.data.ledgerAccountList)
            setRightNewArrayAlreadyStoredAccounts(copConfigDetails.data.ledgerAccountList)
        }
        const inter = await SetAndFilterMainLedgerAccountListArrays(chartOfAccountList, copConfigDetails.data.ledgerAccountList)
    }

    async function SetAndFilterMainLedgerAccountListArrays(chartsOfAccountList, linkedAccountList) {
        const filteredAccountList = not(chartsOfAccountList, linkedAccountList)
        filteredAccountList.length === 0 ?
            setLeftNewArray([]) :
            setLeftNewArray(filteredAccountList);

        return filteredAccountList;
    }

    async function SearchLedgerAccountList() {
        const result = await GetAllChartOfAccountDetails();

        if (result.length === 0) {
            alert.error("Ledger accounts not found");
        }

        if (RightNewArray.length === 0) {
            result.length === 0 ?
                setLeftNewArray([]) :
                setLeftNewArray(result)
        }
        else {
            await SetAndFilterMainLedgerAccountListArrays(result, RightNewArray)
        }
    }

    async function GetSetupConfigurationDetails(cashFlowSectionID) {
        const result = await services.GetSetupConfigurationDetails(parseInt(CashFlowConfigurationDetails.groupID.toString()), parseInt(CashFlowConfigurationDetails.factoryID.toString()), parseInt(cashFlowSectionID.toString()));
        return result;
    }

    async function GetAllChartOfAccountDetails() {

        let requestModel = {
            accountFilterText: sessionStorage.getItem("xy97pq"),
            accountFilterType: parseInt(CashFlowConfigurationDetails.accountFilterType.toString()),
            factoryID: parseInt(CashFlowConfigurationDetails.factoryID.toString()),
            groupID: parseInt(CashFlowConfigurationDetails.groupID.toString())
        }
        const response = await services.GetAllLedgerAccountDetailsByFilters(requestModel);
        return response;
    }

    async function SaveCashFlowConfiguration() {

        let requestModel = {
            groupID: parseInt(CashFlowConfigurationDetails.groupID),
            factoryID: parseInt(CashFlowConfigurationDetails.factoryID),
            cashFlowSectionID: parseInt(CashFlowConfigurationDetails.cashFlowChildSectionName),
            createdBy: parseInt(tokenService.getUserIDFromToken()),
            linkedAccountList: not(RightNewArray, RightNewArrayAlreadyStoredAccounts),
            removedLinkedAccountList: RemovedLedgerAccountList
        }

        const response = await services.SaveCashFlowConfiguration(requestModel)

        if (response.statusCode == "Success") {
            ClearAllArrays();
            alert.success(response.message);
            setTimeout(() => {
                navigate("/app/CashFlow/CashFlowReport")
            }, 1500)
        }
        else {
            alert.error(response.message);
        }
    }

    function cardTitle(titleName) {
        return (
            <Grid container spacing={1}>
                <Grid item md={10} xs={12}>
                    {titleName}
                </Grid>
                <Grid item md={2} xs={12}>
                    <PageHeader
                        onClick={handleClickNavigate}
                    />
                </Grid>
            </Grid>
        )
    }

    function ClearAllArrays() {
        setChecked([])
        setLeftNewArray([])
        setRightNewArray([])
        setRightNewArrayAlreadyStoredAccounts([])
        setRemovedLedgerAccountList([])
        setProfitAndLossSectionList([]);
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
        setCashFlowConfigurationDetails({
            ...CashFlowConfigurationDetails,
            [e.target.name]: value,
            accountFilterText: '',
            accountFilterType: '0',
            cashFlowChildSectionName:'0'
        });
    }

    function handleChangeAccountType(e) {
        const target = e.target;
        const value = target.value
        setCashFlowConfigurationDetails({
            ...CashFlowConfigurationDetails,
            [e.target.name]: value,
            accountFilterText: ""
        });
    }

    return (
        <Fragment>
            <LoadingComponent />

            <Formik
                initialValues={{
                    cashFlowChildSectionName: CashFlowConfigurationDetails.cashFlowChildSectionName,
                    parentSectionID: CashFlowConfigurationDetails.parentSectionID
                }}
                validationSchema={
                    Yup.object().shape({
                        cashFlowChildSectionName: Yup.number().required('Section Name is required').min("1", 'Section Name is required')
                    })
                }
                onSubmit={() => trackPromise(SaveCashFlowConfiguration())}
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

                                <PerfectScrollbar>
                                    <Divider />
                                    <CardContent>
                                        <Grid container spacing={3}>
                                            <Grid item md={4} xs={12}>
                                                <InputLabel shrink id="parentSectionID">
                                                    Parent Section Name *
                                                </InputLabel>
                                                <TextField select
                                                    error={Boolean(touched.parentSectionID && errors.parentSectionID)}
                                                    fullWidth
                                                    helperText={touched.parentSectionID && errors.parentSectionID}
                                                    name="parentSectionID"
                                                    onBlur={handleBlur}
                                                    size='small'
                                                    onChange={(e) => {
                                                        handleChange(e);
                                                        trackPromise(GetCashFlowCreatedSectionDetailsWithGroupFactoryParentSectionID(e));
                                                    }}
                                                    value={CashFlowConfigurationDetails.parentSectionID}
                                                    variant="outlined"
                                                    id="parentSectionID"
                                                >
                                                    <MenuItem value="0">--Select Parent Section Name--</MenuItem>
                                                    {generateDropDownMenu(ParentSectionNameList)}
                                                </TextField>
                                            </Grid>
                                            <Grid item md={4} xs={12}>
                                                <InputLabel shrink id="cashFlowChildSectionName">
                                                    Child Section Name *
                                                </InputLabel>
                                                <TextField select
                                                    error={Boolean(touched.cashFlowChildSectionName && errors.cashFlowChildSectionName)}
                                                    fullWidth
                                                    helperText={touched.cashFlowChildSectionName && errors.cashFlowChildSectionName}
                                                    name="cashFlowChildSectionName"
                                                    onBlur={handleBlur}
                                                    size='small'
                                                    onChange={(e) => {
                                                        trackPromise(LoadSetupCofigurations(e));
                                                    }}
                                                    value={CashFlowConfigurationDetails.cashFlowChildSectionName}
                                                    variant="outlined"
                                                    id="cashFlowChildSectionName"
                                                >
                                                    <MenuItem value="0">--Select Section Name--</MenuItem>
                                                    {generateDropDownMenu(ProfitAndLossSectionList)}
                                                </TextField>
                                            </Grid>

                                        </Grid>

                                        <br />

                                        {
                                            RightNewArray.length > 0 || LeftNewArray.length > 0 ?
                                                <Card>
                                                    <CardContent>
                                                        <Grid container spacing={3}>
                                                            <Grid item md={6} xs={12}>
                                                                <Grid container spacing={1}>
                                                                    <Grid item md={5} xs={12}>
                                                                        <TextField select

                                                                            fullWidth

                                                                            name="accountFilterType"
                                                                            onBlur={handleBlur}
                                                                            onChange={(e) => {
                                                                                handleChangeAccountType(e)
                                                                            }}
                                                                            size='small'
                                                                            value={CashFlowConfigurationDetails.accountFilterType}
                                                                            variant="outlined"
                                                                            id="accountFilterType"
                                                                        >
                                                                            <MenuItem value="0">All Accounts</MenuItem>
                                                                            <MenuItem value="4">Search By Account Type</MenuItem>
                                                                            <MenuItem value="1">Search By Parent Header</MenuItem>
                                                                            <MenuItem value="2">Search By Child Header</MenuItem>
                                                                            <MenuItem value="3">Search By Ledger Header</MenuItem>

                                                                        </TextField>
                                                                    </Grid>
                                                                    {
                                                                        CashFlowConfigurationDetails.accountFilterType !== "0" ?
                                                                            <Grid item md={5} xs={12}>
                                                                                <TextField
                                                                                    variant="outlined"
                                                                                    fullWidth
                                                                                    name="accountFilterText"
                                                                                    id="accountFilterText"
                                                                                    label="Filtering Text" size="small"
                                                                                    value={CashFlowConfigurationDetails.accountFilterText}
                                                                                    onChange={(event) => SetTestValue(event)}
                                                                                    disabled={CashFlowConfigurationDetails.accountFilterType === "0"}
                                                                                />
                                                                            </Grid> : null
                                                                    }
                                                                    <Grid item md={1} xs={12}>
                                                                        <Tooltip title="Filter Account">
                                                                            <IconButton
                                                                                aria-label="filter"
                                                                                onClick={() => trackPromise(SearchLedgerAccountList())}
                                                                            >
                                                                                <SearchIcon />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    </Grid>
                                                                </Grid>
                                                            </Grid>
                                                        </Grid>

                                                        <Grid container spacing={3}>
                                                            <Grid item md={6} xs={12}>

                                                            </Grid>
                                                        </Grid>

                                                        <Grid container spacing={3}>
                                                            <Grid item md={5} xs={12} >
                                                                <Typography variant='h5'>Chart Of Account</Typography> <br />
                                                                {customList(LeftNewArray)}
                                                            </Grid>
                                                            <Grid item md={2} xs={12}>
                                                                <Grid container direction="column" alignItems="center" style={{ marginTop: "30%" }}>

                                                                    <Button
                                                                        variant="outlined"
                                                                        size="small"
                                                                        className={classes.button}
                                                                        onClick={handleCheckedRight}
                                                                        disabled={leftChecked.length === 0}
                                                                        aria-label="move selected right"
                                                                    >
                                                                        &gt;
                                                                    </Button>
                                                                    <Button
                                                                        variant="outlined"
                                                                        size="small"
                                                                        className={classes.button}
                                                                        onClick={handleCheckedLeft}
                                                                        disabled={rightChecked.length === 0}
                                                                        aria-label="move selected left"
                                                                    >
                                                                        &lt;
                                                                    </Button>

                                                                </Grid>
                                                            </Grid>
                                                            <Grid item md={5} xs={12}>
                                                                <Typography variant='h5'>Linked Accounts</Typography> <br />
                                                                {customList(RightNewArray)}
                                                            </Grid>
                                                        </Grid>

                                                        <Box display="flex" flexDirection="row-reverse" p={2} >
                                                            <Button
                                                                color="primary"
                                                                type="submit"
                                                                variant="contained"
                                                                disabled={RightNewArray.length === 0}
                                                            >
                                                                Save
                                                            </Button>
                                                        </Box>
                                                    </CardContent>
                                                </Card> : null
                                        }
                                    </CardContent>
                                </PerfectScrollbar>
                            </Card>
                        </Box>
                    </form>
                )}
            </Formik>
        </Fragment>
    );
}
