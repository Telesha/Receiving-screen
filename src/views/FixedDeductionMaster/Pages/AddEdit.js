import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Card, makeStyles, Container, CardHeader, Button, CardContent, Divider, MenuItem, Grid, InputLabel, TextField, Switch } from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { LoadingComponent } from '../../../utils/newLoader';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";
import PageHeader from 'src/views/Common/PageHeader';
import { useParams } from 'react-router-dom';
import tokenDecoder from '../../../utils/tokenDecoder';

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

const screenCode = "FIXEDDEDUCTIONMASTER"

export default function FixedDeductionMasterAdd(props) {

    const classes = useStyles();
    let decrypted = 0
    const navigate = useNavigate();
    const alert = useAlert();
    const [title, setTitle] = useState("Add Fixed Deduction")
    const [groups, setGroups] = useState();
    const [estates, setEstates] = useState([]);
    const [deductionTypes, setDeductionTypes] = useState([]);
    const [unionDeductionTypes, setUnionDeductionTypes] = useState([]);
    const [foodDeductionTypes, setFoodDeductionTypes] = useState([]);
    const [isUpdate, setIsUpdate] = useState(false);
    const [isDisableButton, setIsDisableButton] = useState(false);
    const [fixedDeductions, setFixedDeductions] = useState({
        groupID: '0',
        estateID: 0,
        fixedDeductionTypeID: 0,
        unionID: 0,
        foodDeductionID: 0,
        deductionRate: '',
        isActive: true
    });
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });
    const { fixedDeductionMasterID } = useParams();

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermissions());
    }, []);

    useEffect(() => {
        if (fixedDeductions.groupID > 0) {
            trackPromise(getEstateDetailsByGroupID());
        };
    }, [fixedDeductions.groupID]);

    useEffect(() => {
        getDeductionTypes();
    }, [fixedDeductions.estateID]);

    useEffect(() => {
        if (fixedDeductions.fixedDeductionTypeID == 3) {
            getUnionDeductionTypes();
        }
        else if (fixedDeductions.fixedDeductionTypeID == 4) {
            getFoodDeductionTypes();
        }
    }, [fixedDeductions.fixedDeductionTypeID]);

    useEffect(() => {
        if (!isUpdate) {
            setFixedDeductions({
                ...fixedDeductions,
                unionID: 0,
                foodDeductionID: 0,
                deductionRate: ''
            });
            setFoodDeductionTypes([]);
            setUnionDeductionTypes([]);
        }

    }, [fixedDeductions.fixedDeductionTypeID]);

    useEffect(() => {
        decrypted = atob(fixedDeductionMasterID.toString());
        if (parseInt(decrypted) > 0) {
            setIsUpdate(true);
            GetDetailsByFixedDeductionMasterID(decrypted);
        }
    }, []);

    const handleClick = () => {
        navigate('/app/fixedDeductionMaster/listing');
    }

    async function getPermissions() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITFIXEDDEDUCTIONMASTER');

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

        setFixedDeductions({
            ...fixedDeductions,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            estateID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(fixedDeductions.groupID);
        setEstates(response);
    };

    async function getDeductionTypes() {
        var response = await services.getDeductionTypes();
        setDeductionTypes(response);
    };

    async function getFoodDeductionTypes() {
        var response = await services.getFoodDeductionTypes(fixedDeductions.fixedDeductionTypeID);
        setFoodDeductionTypes(response);
    };

    async function getUnionDeductionTypes() {
        var response = await services.getUnionDeductionTypes(fixedDeductions.fixedDeductionTypeID);
        setUnionDeductionTypes(response);
    };

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
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
        setFixedDeductions({
            ...fixedDeductions,
            [e.target.name]: value
        });
    }

    function handleChangeForAmount(e) {
        const target = e.target;
        let value = target.value;

        value = value.replace(/[^0-9.]/g, '');
        const decimalParts = value.split('.');

        if (decimalParts.length > 2) {

            value = decimalParts.slice(0, 2).join('.');
        } else if (decimalParts.length === 2) {

            value = `${decimalParts[0]}.${decimalParts[1].slice(0, 2)}`;
        }

        setFixedDeductions({
            ...fixedDeductions,
            [target.name]: value
        });
    }

    async function saveDetails(model) {
        if (isUpdate == true) {
            let updateModel = {
                fixedDeductionMasterID: atob(fixedDeductionMasterID.toString()),
                deductionRate: parseFloat(fixedDeductions.deductionRate),
                fixedDeductionTypeID: parseInt(fixedDeductions.fixedDeductionTypeID),
                unionID: parseInt(fixedDeductions.unionID),
                foodDeductionID: parseInt(fixedDeductions.foodDeductionID),
                isActive: fixedDeductions.isActive,
                modifiedBy: tokenDecoder.getUserIDFromToken(),
                modifiedDate: new Date().toISOString(),
            }
            setIsUpdate(true);
            let response = await services.UpdateFixedDeduction(updateModel);
            if (response.statusCode == "Success") {
                alert.success(response.message);
                navigate('/app/fixedDeductionMaster/listing');
            }
            else {
                alert.error(response.message);
            }
        } else {
            let response = await services.saveDetails(model);
            if (response.statusCode == "Success") {
                alert.success(response.message);
                //setIsDisableButton(true);
            }
            else if (response.statusCode == "Error" && response.data < 0) {
                alert.error("Deduction Rate Already Exists on this deduction type!");
            }
            else {
                alert.error("FIXED DEDUCTION SAVE FAILED!");
            }
            setFixedDeductions({
                ...fixedDeductions,
                deductionRate: ''
            })
        }
    }

    function clearFields() {
        setFixedDeductions({
            ...fixedDeductions,
            fixedDeductionTypeID: 0,
            unionID: 0,
            foodDeductionID: 0,
            deductionRate: ''
        });
        setFoodDeductionTypes([]);
        setUnionDeductionTypes([]);
    }

    function onIsActiveChange() {
        setFixedDeductions({
            ...fixedDeductions,
            isActive: !fixedDeductions.isActive
        });
    }

    async function GetDetailsByFixedDeductionMasterID(fixedDeductionMasterID) {
        const fixedDeductions = await services.GetDetailsByFixedDeductionMasterID(fixedDeductionMasterID);
        setFixedDeductions({
            ...fixedDeductions,
            groupID: fixedDeductions.groupID,
            estateID: fixedDeductions.estateID,
            fixedDeductionTypeID: fixedDeductions.fixedDeductionTypeID,
            unionID: fixedDeductions.unionID,
            foodDeductionID: fixedDeductions.foodDeductionID,
            deductionRate: fixedDeductions.deductionRate,
            isActive: fixedDeductions.isActive,
            modifiedBy: parseInt(tokenDecoder.getUserIDFromToken()),
            modifiedDate: new Date().toISOString()
        })
        setIsUpdate(true);
        setTitle("Edit Fixed Deduction");
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
                            groupID: fixedDeductions.groupID,
                            estateID: fixedDeductions.estateID,
                            fixedDeductionTypeID: fixedDeductions.fixedDeductionTypeID,
                            foodDeductionID: fixedDeductions.foodDeductionID,
                            isActive: fixedDeductions.isActive,
                            unionID: fixedDeductions.unionID,
                            deductionRate: fixedDeductions.deductionRate
                        }}
                        validationSchema={
                            Yup.object().shape({
                                estateID: Yup.number().required('Estate is required').min("1", 'Estate is required'),
                                fixedDeductionTypeID: Yup.number().required('Deduction Type is required').min("1", 'Deduction Type is required'),
                                foodDeductionID: Yup.number().when([], {
                                    is: () => fixedDeductions.fixedDeductionTypeID == 4,
                                    then: Yup.number().required('Food Deduction is required').min(1, 'Food Deduction is required'),
                                    otherwise: Yup.number().notRequired(),
                                }),
                                unionID: Yup.number().when([], {
                                    is: () => fixedDeductions.fixedDeductionTypeID == 3,
                                    then: Yup.number().required('Union Deduction is required').min(1, 'Union Deduction is required'),
                                    otherwise: Yup.number().notRequired(),
                                }),
                                deductionRate: Yup.string().required('Deduction Rate is required').matches(/^[0-9]+([.][0-9]+)?$/, 'Allow only numbers')
                                    .matches(/^(\d+(\.\d{0,2})?|\.?\d{1,2})$/, 'Only allowed 2 decimals.').min('1', 'Deduction Rate is required'),
                            })
                        }
                        onSubmit={saveDetails}
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
                                            <CardContent style={{ marginBottom: "2rem" }}>
                                                <Grid container spacing={3}>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="groupID">
                                                            Group  *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.groupID && errors.groupID)}
                                                            helperText={touched.groupID && errors.groupID}
                                                            fullWidth
                                                            name="groupID"
                                                            onChange={(e) => handleChange(e)}
                                                            value={fixedDeductions.groupID}
                                                            variant="outlined"
                                                            size="small"
                                                            disabled={isUpdate}
                                                            onBlur={handleBlur}
                                                            InputProps={{
                                                                readOnly: !permissionList.isGroupFilterEnabled,
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Group--</MenuItem>
                                                            {generateDropDownMenu(groups)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="estateID">
                                                            Estate *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.estateID && errors.estateID)}
                                                            fullWidth
                                                            helperText={touched.estateID && errors.estateID}
                                                            name="estateID"
                                                            placeholder='--Select Estate--'
                                                            onBlur={handleBlur}
                                                            size='small'
                                                            onChange={(e) => {
                                                                handleChange(e)
                                                            }}
                                                            value={fixedDeductions.estateID}
                                                            disabled={isUpdate}
                                                            variant="outlined"
                                                            id="estateID"
                                                            InputProps={{
                                                                readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                                                            }}
                                                        >
                                                            <MenuItem value={0}>--Select Estate--</MenuItem>
                                                            {generateDropDownMenu(estates)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="fixedDeductionTypeID">
                                                            Deduction Type *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.fixedDeductionTypeID && errors.fixedDeductionTypeID)}
                                                            helperText={touched.fixedDeductionTypeID && errors.fixedDeductionTypeID}
                                                            fullWidth
                                                            name="fixedDeductionTypeID"
                                                            size='small'
                                                            disabled={isUpdate}
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={fixedDeductions.fixedDeductionTypeID}
                                                            variant="outlined"
                                                        >
                                                            <MenuItem value={0}>--Select Deduction Type--</MenuItem>
                                                            {generateDropDownMenu(deductionTypes)}
                                                        </TextField>
                                                    </Grid>
                                                    {!isUpdate || (isUpdate && fixedDeductions.fixedDeductionTypeID == 3) ?
                                                        <Grid item md={4} xs={12}>
                                                            <InputLabel shrink id="unionID">
                                                                Union Deduction Type *
                                                            </InputLabel>
                                                            <TextField select
                                                                error={Boolean(touched.unionID && errors.unionID)}
                                                                helperText={touched.unionID && errors.unionID}
                                                                fullWidth
                                                                name="unionID"
                                                                size='small'
                                                                onBlur={handleBlur}
                                                                onChange={(e) => handleChange(e)}
                                                                value={fixedDeductions.unionID}
                                                                disabled={fixedDeductions.fixedDeductionTypeID != 3 || isUpdate}
                                                                variant="outlined"
                                                            >
                                                                <MenuItem value="0">--Select Union Deduction Type--</MenuItem>
                                                                {generateDropDownMenu(unionDeductionTypes)}
                                                            </TextField>
                                                        </Grid>
                                                        : null}
                                                    {!isUpdate || (isUpdate && fixedDeductions.fixedDeductionTypeID == 4) ?
                                                        <Grid item md={4} xs={12}>
                                                            <InputLabel shrink id="foodDeductionID">
                                                                Food Deduction Type *
                                                            </InputLabel>
                                                            <TextField select
                                                                error={Boolean(touched.foodDeductionID && errors.foodDeductionID)}
                                                                helperText={touched.foodDeductionID && errors.foodDeductionID}
                                                                fullWidth
                                                                name="foodDeductionID"
                                                                size='small'
                                                                onBlur={handleBlur}
                                                                onChange={(e) => handleChange(e)}
                                                                value={fixedDeductions.foodDeductionID}
                                                                disabled={fixedDeductions.fixedDeductionTypeID != 4 || isUpdate}
                                                                variant="outlined"
                                                            >
                                                                <MenuItem value="0">--Select Food Deduction Type--</MenuItem>
                                                                {generateDropDownMenu(foodDeductionTypes)}
                                                            </TextField>
                                                        </Grid>
                                                        : null}
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="deductionRate">
                                                            Deduction Rate *
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.deductionRate && errors.deductionRate)}
                                                            helperText={touched.deductionRate && errors.deductionRate}
                                                            fullWidth
                                                            size='small'
                                                            name="deductionRate"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChangeForAmount(e)}
                                                            value={fixedDeductions.deductionRate}
                                                            variant="outlined"
                                                        />
                                                    </Grid>
                                                </Grid>
                                                {/* <Grid container spacing={3}>
                                                    <Grid item md={10} xs={15}>
                                                        <InputLabel shrink id="isActive">
                                                            Active
                                                        </InputLabel>
                                                        <Switch
                                                            checked={fixedDeductions.isActive}
                                                            onChange={onIsActiveChange}
                                                            name="isActive"
                                                            disabled={isDisableButton}
                                                        />
                                                    </Grid>
                                                </Grid> */}
                                            </CardContent>
                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                {isUpdate != true ?
                                                    <Box pr={2}>
                                                        <Button
                                                            color="primary"
                                                            variant="outlined"
                                                            type='reset'
                                                            size='small'
                                                            onClick={clearFields}
                                                        >
                                                            Clear
                                                        </Button>
                                                    </Box>
                                                    : null}
                                                <div>&nbsp;</div>
                                                <Box pr={2}>
                                                    <Button
                                                        color="primary"
                                                        variant="contained"
                                                        type="submit"
                                                        size='small'
                                                    >
                                                        {isUpdate == true ? "Update" : "Save"}
                                                    </Button>
                                                </Box>
                                            </Box>
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