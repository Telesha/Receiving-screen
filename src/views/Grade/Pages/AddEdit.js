import React, { useState, useEffect, Fragment, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, Switch, CardHeader, MenuItem, TextareaAutosize
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from "yup";
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
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
    }
}));

const screenCode = 'GRADE';

export default function GradeAddEdit(props) {
    const [title, setTitle] = useState("Add Grade");
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [gradeInput, setGradeInput] = useState({
        groupID: 0,
        factoryID: 0,
        gradeCode: '',
        gradeName: '',
        categoryID: 0,
        typeID: 0,
        allowance: '',
        allowanceT: '',
        isActive: true,
    });
    const [isUpdate, setIsUpdate] = useState(false);
    const [isDisableButton, setIsDisableButton] = useState(false);
    const [isButtonHide, setIsButtonHide] = useState(false);
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });

    let decrypted = 0;
    const navigate = useNavigate();
    const alert = useAlert();
    const handleClick = () => {
        navigate('/app/grade/listing');
    }
    const componentRef = useRef();
    const { gradeID } = useParams();

    useEffect(() => {
        trackPromise(
            getPermission());
        trackPromise(
            getGroupsForDropdown());
    }, []);

    useEffect(() => {
        trackPromise(
            getFactoriesForDropdown());
    }, [gradeInput.groupID]);

    useEffect(() => {
        decrypted = atob(gradeID.toString());
        if (decrypted != 0) {
            trackPromise(
                getGradeDetails(decrypted),
            )
        }

    }, []);


    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITGRADE');
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

        setGradeInput({
            ...gradeInput,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getFactoriesForDropdown() {
        const factories = await services.getFactoryByGroupID(gradeInput.groupID);
        setFactories(factories);
    }

    async function getGradeDetails(gradeID) {
        let response = await services.GetGradeDetailsByID(gradeID);
        let data = {
            gradeID: response.gradeID,
            groupID: response.groupID,
            factoryID: response.factoryID,
            gradeCode: response.gradeCode,
            gradeName: response.gradeName,
            categoryID: response.gradeCategoryID,
            typeID: response.gradeTypeID,
            allowance: response.sampleAllowance,
            allowanceT: response.sampleAllowanceTwo,
            isActive: response.isActive
        };
        setTitle("Edit Grade");
        setGradeInput(data);
        setIsUpdate(true);
    }

    async function saveGradeDetails(values) {
        if (isUpdate == true) {
            let model = {
                gradeID: atob(gradeID.toString()),
                groupID: parseInt(values.groupID),
                factoryID: parseInt(values.factoryID),
                gradeCode: values.gradeCode,
                gradeName: values.gradeName,
                gradeCategoryID: parseInt(values.categoryID),
                gradeTypeID: parseInt(values.typeID),
                rainfallIn: parseFloat(values.rainfallInmm),
                sampleAllowance: parseFloat(values.allowance),
                sampleAllowanceTwo: parseFloat(values.allowanceT),
                isActive: values.isActive,
                createdBy: tokenDecoder.getUserIDFromToken(),
                createdDate: new Date().toISOString()
            }
            let response = await services.UpdateGrade(model);
            if (response.statusCode == "Success") {
                alert.success(response.message);
                setIsDisableButton(true);
                navigate('/app/grade/listing');
            }
            else {
                alert.error(response.message);
            }
        } else {
            let response = await services.SaveGrade(values);
            if (response.statusCode == "Success") {
                alert.success(response.message);
                setIsDisableButton(true);
                navigate('/app/grade/listing');
            }
            else {
                alert.error(response.message);
            }
        }
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

    function handleChange1(e) {
        const target = e.target;
        const value = target.value
        setGradeInput({
            ...gradeInput,
            [e.target.name]: value
        });
    }

    function clearFormFields() {
        setGradeInput({
            ...gradeInput,
            gradeCode: '',
            gradeName: '',
            categoryID: 0,
            typeID: 0,
            allowance: 0,
            allowanceT: 0,
        });
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
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: gradeInput.groupID,
                            factoryID: gradeInput.factoryID,
                            gradeCode: gradeInput.gradeCode,
                            gradeName: gradeInput.gradeName,
                            categoryID: gradeInput.categoryID,
                            typeID: gradeInput.typeID,
                            allowance: gradeInput.allowance,
                            allowanceT: gradeInput.allowanceT,
                            isActive: gradeInput.isActive
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
                                gradeCode: Yup.string().required('Grade Code is required')
                                    .matches(/^.{1,5}$/, 'Grade Code must be at most 5 characters')
                                    .matches(/^[a-zA-Z0-9\\]/g, 'Special Characters are not allowed'),
                                gradeName: Yup.string().required('Grade Name is required')
                                    .matches(/^.{1,30}$/, 'Grade Name must be at most 30 characters'),
                                categoryID: Yup.number().required('Grade Category is required').min("1", 'Grade Category is required'),
                                typeID: Yup.number().required('Grade Type is required').min("1", 'Grade Type is required'),
                                allowance: Yup.string().required('Sample Allowance is required')
                                    .matches(/^[0-9]+([.][0-9]+)?$/, 'Sample allowance should contain only numbers')
                                    .matches(/^(\d+(\.\d{0,2})?|\.?\d{1,2})$/, 'Only allowed 2 decimals')
                            })
                        }
                        onSubmit={(event) => trackPromise(saveGradeDetails(event))}
                        enableReinitialize
                    >
                        {({
                            errors,
                            handleBlur,
                            handleSubmit,
                            handleChange,
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
                                            <CardContent style={{ marginBottom: "1rem" }}>
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
                                                            onChange={(e) => handleChange1(e)}
                                                            value={gradeInput.groupID}
                                                            variant="outlined"
                                                            id="groupID"
                                                            InputProps={{
                                                                readOnly: isUpdate || !permissionList.isGroupFilterEnabled ? true : false
                                                            }}
                                                            size='small'
                                                        >
                                                            <MenuItem value="0">--Select Group--</MenuItem>
                                                            {generateDropDownMenu(groups)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="factoryID">
                                                            Factory  *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.factoryID && errors.factoryID)}
                                                            fullWidth
                                                            helperText={touched.factoryID && errors.factoryID}
                                                            name="factoryID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange1(e)}
                                                            value={gradeInput.factoryID}
                                                            variant="outlined"
                                                            id="factoryID"
                                                            InputProps={{
                                                                readOnly: isUpdate || !permissionList.isFactoryFilterEnabled ? true : false
                                                            }}
                                                            size='small'
                                                        >
                                                            <MenuItem value="0">--Select Factory--</MenuItem>
                                                            {generateDropDownMenu(factories)}
                                                        </TextField>
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                            <CardContent>
                                                <Grid container spacing={3}>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="gradeCode">
                                                            Grade code *
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.gradeCode && errors.gradeCode)}
                                                            fullWidth
                                                            helperText={touched.gradeCode && errors.gradeCode}
                                                            name="gradeCode"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange1(e)}
                                                            value={gradeInput.gradeCode}
                                                            variant="outlined"
                                                            size='small'
                                                        />
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="gradeName">
                                                            Grade Name *
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.gradeName && errors.gradeName)}
                                                            fullWidth
                                                            helperText={touched.gradeName && errors.gradeName}
                                                            name="gradeName"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange1(e)}
                                                            value={gradeInput.gradeName}
                                                            variant="outlined"
                                                            size='small'
                                                        />
                                                    </Grid>

                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="categoryID">
                                                            Grade Category *
                                                        </InputLabel>

                                                        <TextField select
                                                            error={Boolean(touched.categoryID && errors.categoryID)}
                                                            fullWidth
                                                            helperText={touched.categoryID && errors.categoryID}
                                                            name="categoryID"
                                                            onChange={(e) => { handleChange1(e) }}
                                                            value={gradeInput.categoryID}
                                                            variant="outlined"
                                                            id="categoryID"
                                                            size='small'
                                                        >
                                                            <MenuItem value={'0'}>
                                                                --Select Grade Category--
                                                            </MenuItem>
                                                            <MenuItem value={'1'}>M</MenuItem>
                                                            <MenuItem value={'2'}>O</MenuItem>
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="typeID">
                                                            Grade Type *
                                                        </InputLabel>

                                                        <TextField select
                                                            error={Boolean(touched.typeID && errors.typeID)}
                                                            fullWidth
                                                            helperText={touched.typeID && errors.typeID}
                                                            name="typeID"
                                                            onChange={(e) => { handleChange1(e) }}
                                                            value={gradeInput.typeID}
                                                            variant="outlined"
                                                            id="typeID"
                                                            size='small'
                                                        >
                                                            <MenuItem value={'0'}>
                                                                --Select Grade Type--
                                                            </MenuItem>
                                                            <MenuItem value={'1'}>Small Leafy</MenuItem>
                                                            <MenuItem value={'2'}>Leafy</MenuItem>
                                                            <MenuItem value={'3'}>Off Grade</MenuItem>
                                                            <MenuItem value={'4'}>Primer</MenuItem>
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="allowance">
                                                            Sample Allowance *
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.allowance && errors.allowance)}
                                                            fullWidth
                                                            helperText={touched.allowance && errors.allowance}
                                                            name="allowance"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange1(e)}
                                                            value={gradeInput.allowance}
                                                            variant="outlined"
                                                            size='small' >
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="allowanceT">
                                                            Sample Allowance - 2
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.allowanceT && errors.allowanceT)}
                                                            fullWidth
                                                            helperText={touched.allowanceT && errors.allowanceT}
                                                            name="allowanceT"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange1(e)}
                                                            value={gradeInput.allowanceT}
                                                            variant="outlined"
                                                            size='small' >
                                                        </TextField>
                                                    </Grid>
                                                </Grid>
                                                <Grid container spacing={3}>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="isActive">
                                                            Active
                                                        </InputLabel>
                                                        <Switch
                                                            checked={values.isActive}
                                                            onChange={handleChange}
                                                            name="isActive"
                                                            disabled={isDisableButton}
                                                            size='small'
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                <Button
                                                    color="primary"
                                                    type="reset"
                                                    variant="outlined"
                                                    onClick={() => clearFormFields()}
                                                >
                                                    Cancel
                                                </Button>
                                                <div>&nbsp;</div>
                                                <Button
                                                    color="primary"
                                                    disabled={isSubmitting || isDisableButton}
                                                    type="submit"
                                                    variant="contained"
                                                >
                                                    {isUpdate == true ? "Update" : "Save"}
                                                </Button>
                                            </Box>
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
};

