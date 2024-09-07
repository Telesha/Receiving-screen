import React, { useState, useEffect } from 'react';
import Page from 'src/components/Page';
import {
    makeStyles,
    Container,
    Box,
    Card,
    CardHeader,
    Grid,
    Divider,
    CardContent,
    InputLabel,
    TextField,
    MenuItem,
    Button
} from '@material-ui/core';
import PageHeader from 'src/views/Common/PageHeader';
import { useNavigate } from 'react-router-dom';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Formik} from 'formik';
import * as Yup from "yup";
import services from '../../AccountFreeze/Service';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { DatePicker, MuiPickersUtilsProvider} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import moment from 'moment';
import MaterialTable from "material-table";
import { LoadingComponent } from '../../../utils/newLoader';

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

const screenCode = 'ACCOUNTFREEZE';

export default function AccountFreezeListing() {
    const classes = useStyles();
    const [GroupList, setGroupList] = useState([]);
    const [FactoryList, setFactoryList] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [AccountFreezeData, setAccountFreezeData] = useState([]);

    const [accountFreezeDetail, setAccountFreezeDetail] = useState({
        groupID: 0,
        factoryID: 0,
        date: ''
    });
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });

    function cardTitle(titleName) {
        return (
            <Grid container spacing={1}>
                <Grid item md={10} xs={12}>
                    {titleName}
                </Grid>
                <Grid item md={2} xs={12}>
                    <PageHeader
                        onClick={handleClick}
                        isEdit={true}
                        toolTiptitle={"Add Financial Month Freeze"}
                    />
                </Grid>
            </Grid>
        )
    }
    const navigate = useNavigate();
    let encrypted = "";
    const handleClick = () => {
        encrypted = btoa('0');
        navigate('/app/FinancialMonthFreeze/addedit/' + encrypted);
    }

    const handleClickEdit = (ledgerAccountFreezID) => {
        encrypted = btoa(ledgerAccountFreezID.toString());
        navigate('/app/FinancialMonthFreeze/addedit/' + encrypted);
    }



    function handleChange(e) {
        const target = e.target;
        const value = target.value;
        setAccountFreezeDetail({
            ...accountFreezeDetail,
            [e.target.name]: value
        });
        setAccountFreezeData([]);
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

    function handleDateChange(date) {
        var month = date.getUTCMonth() + 1; //months from 1-12
        var year = date.getUTCFullYear();
        var currentmonth = moment().format('MM');
        setAccountFreezeDetail({
            ...accountFreezeDetail,
            month: month.toString(),
            year: year.toString()
        });

        if (selectedDate != null) {

            var prevMonth = selectedDate.getUTCMonth() + 1
            var prevyear = selectedDate.getUTCFullYear();

            if ((prevyear == year && prevMonth != month) || (prevyear != year)) {
                setSelectedDate(date)

            }
        } else {
            setSelectedDate(date)
        }
    }

    useEffect(() => {
        trackPromise(getPermission());
        trackPromise(getGroupsForDropdown());
    }, []);

    useEffect(() => {
        trackPromise(
            getFactoriesForDropdown());
    }, [accountFreezeDetail.groupID]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWACCOUNTFREEZE');

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

        setAccountFreezeDetail({
            ...accountFreezeDetail,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroupList(groups);
    }

    async function getFactoriesForDropdown() {
        const factories = await services.getFactoryByGroupID(accountFreezeDetail.groupID);
        setFactoryList(factories);
    }

    async function getAccountFreezeDetails(values) {
        let model = {
            groupID: parseInt(values.groupID),
            factoryID: parseInt(values.factoryID),
            date: selectedDate.toLocaleDateString()
        }
        const response = await services.getAccountFreezeDetails(model);

        let data1 = response.data

        data1.forEach(x => {
            if (x.isFreez == true) {
                x.isFreez = "Freezed"
            }
            else {
                x.isFreez = "Unfreezed"
            }
        });
        setAccountFreezeData(response.data);
    }





    return (
        <Page
            className={classes.root}
            title="Financial Month Freeze"
        >
            <LoadingComponent />
            <Container maxWidth={false}>
                <Formik
                    initialValues={{
                        groupID: accountFreezeDetail.groupID,
                        factoryID: accountFreezeDetail.factoryID,
                        date: accountFreezeDetail.date
                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                            factoryID: Yup.number().required('Estate is required').min("1", 'Estate is required'),
                        })
                    }
                    onSubmit={(event) => trackPromise(getAccountFreezeDetails(event))}
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
                                        title={cardTitle("Financial Month Freeze")}
                                    />
                                    <PerfectScrollbar>
                                        <Divider />
                                        <CardContent style={{ marginBottom: "2rem" }}>
                                            <Grid container spacing={3}>
                                                <Grid item md={4} xs={12}>
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
                                                        value={accountFreezeDetail.groupID}
                                                        disabled={!permissionList.isGroupFilterEnabled}
                                                        variant="outlined"
                                                        id="groupID"
                                                        size='small'
                                                    >
                                                        <MenuItem value="0">--Select Group--</MenuItem>
                                                        {generateDropDownMenu(GroupList)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="factoryID">
                                                       Estate *
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.factoryID && errors.factoryID)}
                                                        fullWidth
                                                        helperText={touched.factoryID && errors.factoryID}
                                                        name="factoryID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={accountFreezeDetail.factoryID}
                                                        disabled={!permissionList.isFactoryFilterEnabled}
                                                        variant="outlined"
                                                        id="factoryID"
                                                        size='small'
                                                    >
                                                        <MenuItem value="0">--Select Estate--</MenuItem>
                                                        {generateDropDownMenu(FactoryList)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={8}>
                                                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                        <DatePicker
                                                            autoOk
                                                            variant="inline"
                                                            fullWidth={true}
                                                            openTo="month"
                                                            views={["year"]}
                                                            label="Year *"
                                                            helperText="Select applicable year"
                                                            value={selectedDate}
                                                            disableFuture={true}
                                                            onChange={(date) => handleDateChange(date)}

                                                        />
                                                    </MuiPickersUtilsProvider>
                                                </Grid>
                                            </Grid>
                                            <Box display="flex" flexDirection="row-reverse" p={2} >
                                                <Button
                                                    color="primary"
                                                    type="submit"
                                                    variant="contained"
                                                    size='small'
                                                >
                                                    Search
                                                </Button>
                                            </Box>
                                            <Box minWidth={1050}>
                                                {AccountFreezeData.length > 0 ?
                                                    <MaterialTable
                                                        title="Multiple Actions Preview"
                                                        columns={[
                                                            { title: 'Year', field: 'applicableYear' },
                                                            { title: 'Month', field: 'applicableMonth' },
                                                            { title: 'Create By', field: 'userName' },
                                                            { title: 'Status', field: 'isFreez' },
                                                            { title: 'Created Date', field: 'createdDate', render: rowData => rowData.createdDate.split(' ')[0] },
                                                        ]}
                                                        data={AccountFreezeData}
                                                        options={{
                                                            exportButton: false,
                                                            showTitle: false,
                                                            headerStyle: { textAlign: "left", height: '1%' },
                                                            cellStyle: { textAlign: "left" },
                                                            columnResizable: false,
                                                            actionsColumnIndex: -1,
                                                            pageSize: 10
                                                        }}
                                                        actions={[{
                                                            icon: 'edit',
                                                            tooltip: 'Edit',
                                                            onClick: (event, rowData) => handleClickEdit(rowData.ledgerAccountFreezID)
                                                        }]}
                                                    />
                                                    : null}
                                            </Box>
                                        </CardContent>
                                    </PerfectScrollbar>
                                </Card>
                            </Box>
                        </form>
                    )}
                </Formik>
            </Container>
        </Page >
    );
}

