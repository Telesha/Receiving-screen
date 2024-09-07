import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, Switch, CardHeader, MenuItem
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../../AccountFreeze/Service';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik} from 'formik';
import * as Yup from "yup";
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import tokenDecoder from '../../../utils/tokenDecoder';
import { confirmAlert } from 'react-confirm-alert';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";

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
export default function AccountFreezeAddEdit() {
    const classes = useStyles();
    const [title, setTitle] = useState("Add Financial Month Freeze");
    const handleClick = () => {
        navigate('/app/FinancialMonthFreeze/listing');
    }
    const navigate = useNavigate();
    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [AccountFreezeCheck, setAccountFreezeCheck] = useState();
    const [accountFreeze, setAccountFreeze] = useState({
        groupID: 0,
        factoryID: 0,
        isFreeze: false,
        date: ''
    });
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });
    const [isUpdate, setIsUpdate] = useState(false);
    const { ledgerAccountFreezID } = useParams();
    const alert = useAlert();
    let decryptedID = 0;

    useEffect(() => {
        trackPromise(
            getPermission());
        trackPromise(
            getGroupsForDropdown());
    }, []);

    useEffect(() => {
        trackPromise(
            getFactoriesForDropdown());
    }, [accountFreeze.groupID]);

    useEffect(() => {
        decryptedID = atob(ledgerAccountFreezID.toString());
        if (decryptedID != 0) {
            trackPromise(getAccountFreezeDetailsbyAccountID(decryptedID));
        }
    }, []);
    useEffect(() => {
        if (accountFreeze.date != 0 && !isUpdate) {
            trackPromise(checkCurrentMonthalreadyFreeze());
        }
    }, [accountFreeze.date]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITACCOUNTFREEZE');

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

        setAccountFreeze({
            ...accountFreeze,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
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

    const handleClose = () => {
    };

    function handleChange(e) {
        const target = e.target;
        const value = target.name === 'isFreeze' ? target.checked : target.value
        setAccountFreeze({
            ...accountFreeze,
            [e.target.name]: value
        });
    }

    function handleDateChange(value) {
        setAccountFreeze({
            ...accountFreeze,
            date: value
        });
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getFactoriesForDropdown() {
        const factories = await services.getFactoryByGroupID(accountFreeze.groupID);
        setFactories(factories);
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

    async function getAccountFreezeDetailsbyAccountID(ledgerAccountFreezID) {

        let response = await services.getAccountFreezeDetailsbyAccountID(ledgerAccountFreezID);

        let data = {
            groupID: response.data.groupID,
            factoryID: response.data.factoryID,
            applicableMonth: response.data.applicableMonth,
            applicableYear: response.data.applicableYear,
            isFreeze: response.data.isFreez,
            date: response.data.applicableYear.concat("-", response.data.applicableMonth)
        };
        setTitle("Edit Freeze Account");
        setAccountFreeze(data);
        setIsUpdate(true);
    }

    async function checkCurrentMonthalreadyFreeze(datecheck) {

        let isFrozen = false;

        let splitDate = accountFreeze.date.toISOString().split('T')[0]
        let splitYear = splitDate.split('-')[0]
        let splitMonth = splitDate.split('-')[1]

        let cusYearMonth = splitYear + '-' + splitMonth

        let model = {
            groupID: parseInt(accountFreeze.groupID),
            factoryID: parseInt(accountFreeze.factoryID),
            date: cusYearMonth
        }

        let response = await services.checkCurrentMonthalreadyFreeze(model);

        isFrozen = response.data.isFreez;
        setAccountFreezeCheck(isFrozen);
        setAccountFreeze({
            ...accountFreeze,
            isFreeze: response == null ? false : response.data.isFreez
        });
    }

    async function saveAccountFreeze(values) {
        if (isUpdate == true) {

            let updateModel = {
                ledgerAccountFreezID: parseInt(atob(ledgerAccountFreezID)),
                createdBy: parseInt(tokenDecoder.getUserIDFromToken()),
                isFreez: values.isFreeze
            }
            let response = await services.updateFreezeAccount(updateModel);
            if (response.statusCode == "Success") {
                alert.success("Account Freeze Update Successfully");
                navigate('/app/FinancialMonthFreeze/listing');
            }
            else {
                alert.error("Error occured");
            }
        } else {
            let splitDate = accountFreeze.date.toISOString().split('T')[0]
            let savemodel = {
                groupID: parseInt(values.groupID),
                factoryID: parseInt(values.factoryID),
                applicableYear: splitDate.split('-')[0],
                applicableMonth: splitDate.split('-')[1],
                createdBy: tokenDecoder.getUserIDFromToken(),
                IsFreez: values.isFreeze
            }
            let response = await services.saveAccountFreeze(savemodel);
            if (response.statusCode == "Success") {
                alert.success("Account Freeze Successfully");
                navigate('/app/FinancialMonthFreeze/listing');
            }
            else {
                alert.error(response.message);

            }
        }
    }

    async function ConfirmFreeze(values) {


        confirmAlert({
            title: 'Confirm Freeze Status',
            message: 'Are you sure you want to confirm?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => saveAccountFreeze(values)
                },
                {
                    label: 'No',
                    onClick: () => handleClose()
                }
            ],
            closeOnEscape: true,
            closeOnClickOutside: true,
        });

    }

    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: accountFreeze.groupID,
                            factoryID: accountFreeze.factoryID,
                            applicableYear: accountFreeze,
                            applicableMonth: accountFreeze,
                            isFreeze: accountFreeze.isFreeze,
                            date: accountFreeze.date
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                                factoryID: Yup.number().required('Estate is required').min("1", 'Estate is required'),
                                date: Yup.date().required('Month & Year is required'),
                            })
                        }
                        onSubmit={(event) => ConfirmFreeze(event)}
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
                                            title={cardTitle(title)}
                                        />
                                        <PerfectScrollbar>
                                            <Divider />
                                            <CardContent>
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
                                                            value={accountFreeze.groupID}
                                                            variant="outlined"
                                                            id="groupID"
                                                            disabled={!permissionList.isGroupFilterEnabled}
                                                            size='small'
                                                        >
                                                            <MenuItem value="0">--Select Group--</MenuItem>
                                                            {generateDropDownMenu(groups)}
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
                                                            value={accountFreeze.factoryID}
                                                            variant="outlined"
                                                            id="factoryID"
                                                            disabled={!permissionList.isFactoryFilterEnabled}
                                                            size='small'
                                                        >
                                                            <MenuItem value="0">--Select Estate--</MenuItem>
                                                            {generateDropDownMenu(factories)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="date">
                                                            Month & Year *
                                                        </InputLabel>
                                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                            <KeyboardDatePicker
                                                                error={Boolean(touched.date && errors.date)}
                                                                helperText={touched.date && errors.date}
                                                                autoOk
                                                                fullWidth
                                                                views={['year', 'month']}
                                                                variant="inline"
                                                                margin="dense"
                                                                name="date"
                                                                id="date"
                                                                value={accountFreeze.date}
                                                                maxDate={new Date()}
                                                                onChange={(e) => {
                                                                    handleDateChange(e);
                                                                }}
                                                                KeyboardButtonProps={{
                                                                    'aria-label': 'change date',
                                                                }}
                                                                InputProps={{ readOnly: true }}
                                                                disabled={isUpdate}
                                                            />
                                                        </MuiPickersUtilsProvider>
                                                    </Grid>
                                                </Grid>
                                                <br></br>
                                                <br></br>
                                                <br></br>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="isFreeze">
                                                        Freeze
                                                    </InputLabel>
                                                    <Switch
                                                        checked={accountFreeze.isFreeze}
                                                        onChange={(e) => handleChange(e)}
                                                        name="isFreeze"
                                                        id="isFreeze"
                                                    />
                                                </Grid>
                                                {isUpdate == false ? (
                                                    AccountFreezeCheck == false || AccountFreezeCheck == null ? (
                                                        <Box display="flex" justifyContent="flex-end" p={2}>
                                                            <Button
                                                                color="primary"
                                                                type="submit"
                                                                variant="contained"
                                                                size='small'
                                                            >
                                                                Save
                                                            </Button>
                                                            <div>&nbsp;</div>
                                                        </Box>
                                                    ) : null
                                                ) : null}

                                                {isUpdate == false ? (
                                                    AccountFreezeCheck == true ? (
                                                        <Box display="flex" justifyContent="flex-end" p={2}>

                                                            <div>&nbsp;</div>
                                                        </Box>
                                                    ) : null
                                                ) : null}

                                                {isUpdate == true ? (
                                                    <Box display="flex" justifyContent="flex-end" p={2}>
                                                        <Button
                                                            color="primary"
                                                            type="submit"
                                                            variant="contained"
                                                            size='small'
                                                        >
                                                            Update
                                                        </Button>
                                                        <div>&nbsp;</div>
                                                    </Box>) : null}

                                            </CardContent>
                                        </PerfectScrollbar>
                                    </Card>
                                </Box>
                            </form>
                        )}
                    </Formik>
                </Container>
            </Page>
        </Fragment>
    );

}