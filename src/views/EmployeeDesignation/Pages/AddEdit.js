import React, { useState, useEffect, Fragment } from 'react';
import {
    Box,
    Card,
    Grid,
    TextField,
    makeStyles,
    Container,
    Button,
    CardContent,
    InputLabel,
    CardHeader,
    Divider,
    MenuItem,
    Switch
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik } from "formik";
import * as Yup from "yup";
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
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
var screenCode = "EMPLOYEEDESIGNATION"
export default function EmployeeDesignationAddEdit(props) {
    const [title, setTitle] = useState("Employee Designation Add")
    const classes = useStyles();
    const [isUpdate, setisUpdate] = useState(false);
    const [IsDisableButton, setIsDisableButton] = useState(false);
    const [factories, setFactories] = useState();
    const [groups, setGroups] = useState();
    const [employeeCategories, setEmployeeCategories] = useState([]);
    const [designationDetail, setDesignationDetail] = useState({
        vehicleID: 0,
        groupID: 0,
        factoryID: 0,
        vehicleTypeID: 0,
        designationCode: '',
        designationName: '',
        fuelTypeID: 0,
        basicSalary: '',
        employeeCategoryID: 0,
        isActive: true
    });
    const navigate = useNavigate();
    const { designationID } = useParams();
    const alert = useAlert();
    let decrypted = 0;
    const handleClick = () => {
        navigate('/app/employeeDesignation/listing');
    }
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });

    useEffect(() => {
        decrypted = atob(designationID.toString());
        if (decrypted != 0) {
            trackPromise(GetDesignationDetailsByDesignationID(decrypted));
        }
        trackPromise(getPermissions(), getGroupsForDropdown(), getEmployeeCategoriesForDropdown());
    }, []);

    useEffect(() => {
        if (designationDetail.groupID !== 0) {
            trackPromise(
                getfactoriesForDropDown()
            )
        }
    }, [designationDetail.groupID]);

    async function getPermissions() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITEMPLOYEEDESIGNATION');

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
        if (decrypted == 0) {
            setDesignationDetail({
                ...designationDetail,
                groupID: parseInt(tokenService.getGroupIDFromToken()),
                factoryID: parseInt(tokenService.getFactoryIDFromToken()),
            })
        }
    }

    async function getfactoriesForDropDown() {
        const factory = await services.getfactoriesForDropDown(designationDetail.groupID);
        setFactories(factory);
    }
    async function getGroupsForDropdown() {
        const groups = await services.getGroupsForDropdown();
        setGroups(groups);
    }

    async function getEmployeeCategoriesForDropdown() {
        const employeeCategories = await services.GetEmployeeCategoriesData();
        setEmployeeCategories(employeeCategories);
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

    async function GetDesignationDetailsByDesignationID(vehicleID) {
        let response = await services.GetDesignationDetailsByDesignationID(vehicleID);
        setTitle("Edit Employee Designation");
        setDesignationDetail({
            ...designationDetail,
            groupID: response.groupID,
            factoryID: response.factoryID,
            employeeCategoryID: response.employeeCategoryID,
            designationCode: response.designationCode,
            designationName: response.designationName,
            basicSalary: response.basicSalary,
            isActive: response.isActive
        });
        setisUpdate(true);
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

    function handleChange(e) {
        const target = e.target;
        const value = target.value;
        setDesignationDetail({
            ...designationDetail,
            [e.target.name]: value
        });
    }

    function handleChangeActive(e) {
        const target = e.target;
        const value = target.name === 'isActive' ? target.checked : target.value;
        setDesignationDetail({
            ...designationDetail,
            [e.target.name]: value
        });
    }

    const handleChange1 = (e) => {
        const { value } = e.target;
        const regex = /^\d*\.?\d{0,2}$/;
        if (regex.test(value)) {
            setDesignationDetail({ ...designationDetail, basicSalary: value });
        }
    };

    async function SaveDesignation(values) {
        if (isUpdate == true) {
            let updateModel = {
                designationID: parseInt(atob(designationID.toString())),
                factoryID: parseInt(values.factoryID),
                groupID: parseInt(values.groupID),
                designationCode: values.designationCode,
                designationName: values.designationName,
                employeeCategoryID: parseInt(values.employeeCategoryID),
                basicSalary: parseFloat(values.basicSalary),
                modifiedBy: parseInt(tokenService.getUserIDFromToken()),
                isActive: values.isActive
            }
            let response = await services.updateDesignationDetail(updateModel);
            if (response.statusCode == "Success") {
                alert.success("Designation Updated Successfully");
                setIsDisableButton(true);
                navigate('/app/employeeDesignation/listing');
            }
            else {
                if (response.data == -2) {
                    alert.error("Designation Code Already Exists");
                }
                else {
                    alert.error("Error Occured When Designation Details Update");
                }
            }
        }
        else {
            let response = await services.saveDesignationDetail(values);
            if (response.statusCode == "Success") {
                alert.success("Designation Save Successfully");
                setIsDisableButton(true);
                navigate('/app/employeeDesignation/listing');
            }
            else {
                if (response.data == -2) {
                    alert.error("Designation Code Already Exists");
                } else if (response.data == -3) {
                    alert.error("Designation Record Already Exists");
                } else {
                    alert.error("Error Occured When Designation Details Save");
                }
            }

        }
    }

    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: designationDetail.groupID,
                            factoryID: designationDetail.factoryID,
                            designationCode: designationDetail.designationCode,
                            designationName: designationDetail.designationName,
                            basicSalary: designationDetail.basicSalary,
                            employeeCategoryID: designationDetail.employeeCategoryID,
                            isActive: designationDetail.isActive
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group required').min("1", 'Group required'),
                                factoryID: Yup.number().required('factoryID required').min("1", 'factoryID required'),
                                employeeCategoryID: Yup.number().required('Emp Category required').min("1", 'Emp Category required'),
                                basicSalary: Yup.number().required('Basic Salary is required'),
                                designationCode: Yup.string().required('Designation Code is required'),
                                designationName: Yup.string().required('Designation Name is required'),
                            })
                        }
                        onSubmit={(e) => trackPromise(SaveDesignation(e))}
                        enableReinitialize
                    >
                        {({
                            errors,
                            handleBlur,
                            handleSubmit,
                            isSubmitting,
                            touched
                        }) => (
                            <form onSubmit={handleSubmit}>
                                <Box mt={0}>
                                    <Card>
                                        <CardHeader
                                            title={cardTitle(title)}
                                        />
                                        <Divider />
                                        <CardContent>
                                            <Grid container spacing={3}>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="groupID">
                                                        Group  *
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.groupID && errors.groupID)}
                                                        fullWidth
                                                        helperText={touched.groupID && errors.groupID}
                                                        name="groupID"
                                                        size='small'
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={designationDetail.groupID}
                                                        variant="outlined"
                                                        id="groupID"
                                                        InputProps={{
                                                            readOnly: !permissionList.isGroupFilterEnabled ? true : isUpdate ? true : false
                                                        }}
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
                                                        size='small'
                                                        onChange={(e) => handleChange(e)}
                                                        value={designationDetail.factoryID}
                                                        variant="outlined"
                                                        id="factoryID"
                                                        InputProps={{
                                                            readOnly: !permissionList.isFactoryFilterEnabled ? true : isUpdate ? true : false
                                                        }}
                                                    >
                                                        <MenuItem value="0">--Select Estate--</MenuItem>
                                                        {generateDropDownMenu(factories)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="employeeCategoryID">
                                                        Employee Category *
                                                    </InputLabel>
                                                    <TextField select fullWidth
                                                        error={Boolean(touched.employeeCategoryID && errors.employeeCategoryID)}
                                                        helperText={touched.employeeCategoryID && errors.employeeCategoryID}
                                                        size='small'
                                                        onBlur={handleBlur}
                                                        id="employeeCategoryID"
                                                        name="employeeCategoryID"
                                                        value={designationDetail.employeeCategoryID}
                                                        type="text"
                                                        variant="outlined"
                                                        onChange={(e) => handleChange(e)}
                                                        InputProps={{
                                                            readOnly: isUpdate ? true : false,
                                                        }}
                                                    >
                                                        <MenuItem value="1">Staff</MenuItem>

                                                    </TextField>
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="designationCode">
                                                        Designation Code *
                                                    </InputLabel>
                                                    <TextField
                                                        error={Boolean(touched.designationCode && errors.designationCode)}
                                                        fullWidth
                                                        helperText={touched.designationCode && errors.designationCode}
                                                        name="designationCode"
                                                        size='small'
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={designationDetail.designationCode}
                                                        disabled={IsDisableButton}
                                                        variant="outlined"
                                                        InputProps={{
                                                            readOnly: isUpdate ? true : false,
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="designationName">
                                                        Designation Name *
                                                    </InputLabel>
                                                    <TextField
                                                        error={Boolean(touched.designationName && errors.designationName)}
                                                        fullWidth
                                                        helperText={touched.designationName && errors.designationName}
                                                        name="designationName"
                                                        size='small'
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={designationDetail.designationName}
                                                        disabled={IsDisableButton}
                                                        variant="outlined"
                                                    />
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="basicSalary">
                                                        Basic Salary *
                                                    </InputLabel>
                                                    <TextField
                                                        error={Boolean(touched.basicSalary && errors.basicSalary)}
                                                        fullWidth
                                                        helperText={touched.basicSalary && errors.basicSalary}
                                                        name="basicSalary"
                                                        size='small'
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange1(e)}
                                                        value={designationDetail.basicSalary}
                                                        disabled={IsDisableButton}
                                                        variant="outlined"
                                                    />
                                                </Grid>
                                                <Grid container spacing={3} style={{ marginLeft: '0.5rem' }}>
                                                    <Grid item md={3} xs={8}>
                                                        <InputLabel shrink id="isActive">
                                                            Active
                                                        </InputLabel>
                                                        <Switch
                                                            checked={designationDetail.isActive}
                                                            onChange={(e) => handleChangeActive(e)}
                                                            name="isActive"
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                        <Box display="flex" justifyContent="flex-end" p={2}>
                                            <Button
                                                color="primary"
                                                disabled={isSubmitting || IsDisableButton}
                                                type="submit"
                                                variant="contained"
                                            >
                                                {isUpdate == true ? "Update" : "Save"}
                                            </Button>
                                        </Box>
                                    </Card>
                                </Box>
                            </form>
                        )}
                    </Formik>
                </Container>
            </Page>
        </Fragment >
    );
};