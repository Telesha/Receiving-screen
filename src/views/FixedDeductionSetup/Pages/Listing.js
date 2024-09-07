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
import { useParams } from 'react-router-dom';

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

const screenCode = 'FIXEDDEDUCTIONSETUP';

export default function FixedDeductionSetupListing(props) {

    const classes = useStyles();
    const navigate = useNavigate();
    const alert = useAlert();
    const { fixedDeductionSetupID } = useParams();
    const [groups, setGroups] = useState();
    const [estates, setEstates] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [IDDataForDefaultLoad, setIsIDDataForDefaultLoad] = useState(null);
    const [deductionTypes, setDeductionTypes] = useState([]);
    const [isTableHide, setIsTableHide] = useState(false);
    const [fixedDeductionsViewData, setFixedDeductionsViewData] = useState([]);
    const [fixedDeductionsViewDetails, setFixedDeductionsViewDetails] = useState({
        groupID: 0,
        estateID: 0,
        divisionID: 0,
        fixedDeductionTypeID: 0,
    });
    
    let encrypted = "";
    const handleClick = () => {
        encrypted = btoa('0');
        navigate('/app/fixedDeductionSetup/addEdit/' + encrypted);
    }

    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });

    useEffect(() => {
        getGroupsForDropdown();
    }, []);

    useEffect(() => {
        getDeductionTypes();
    }, []);

    useEffect(() => {
        const IDdata = JSON.parse(
            sessionStorage.getItem('fixedDeductionSetup-listing-page-search-parameters-id')
        );
        getPermissions(IDdata);

    }, []);

    useEffect(() => {
        sessionStorage.removeItem(
            'fixedDeductionSetup-listing-page-search-parameters-id'
        );
    }, []);

    useEffect(() => {
        if (fixedDeductionsViewDetails.groupID > 0) {
            trackPromise(getEstateDetailsByGroupID());
        };
    }, [fixedDeductionsViewDetails.groupID]);

    useEffect(() => {
        if (fixedDeductionsViewDetails.estateID > 0) {
            trackPromise(
                getDivisionDetailsByEstateID());
        };
    }, [fixedDeductionsViewDetails.estateID]);

    useEffect(() => {
        if (IDDataForDefaultLoad !== null) {
            getData();
        }
    }, [IDDataForDefaultLoad]);

    useEffect(() => {
        setFixedDeductionsViewData([]);
    }, [fixedDeductionsViewDetails.fixedDeductionTypeID]);

    useEffect(() => {
        setIsTableHide(false);
    }, [fixedDeductionsViewDetails.divisionID, fixedDeductionsViewDetails.fixedDeductionTypeID]);

    useEffect(() => {
        if (fixedDeductionsViewDetails.fixedDeductionTypeID >= 0) {
            setFixedDeductionsViewData([]);
        }
    }, [fixedDeductionsViewDetails.fixedDeductionTypeID])

    useEffect(() => {
        if (IDDataForDefaultLoad != null) {
            trackPromise(getData());
        }
    }, [IDDataForDefaultLoad]);

    async function getPermissions(IDdata) {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWFIXEDDEDUCTIONSETUP');

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

        const initialValues = IDdata === null;
        if (initialValues) {
            setFixedDeductionsViewDetails({
                ...fixedDeductionsViewDetails,
                groupID: parseInt(tokenService.getGroupIDFromToken()),
                estateID: parseInt(tokenService.getFactoryIDFromToken()),
            })
        }
        else {
            setFixedDeductionsViewDetails({
                ...fixedDeductionsViewDetails,
                groupID: parseInt(tokenService.getGroupIDFromToken()),
                estateID: parseInt(tokenService.getFactoryIDFromToken()),
                divisionID: IDdata.divisionID,
                fixedDeductionTypeID: parseInt(IDdata.fixedDeductionTypeID)
            })
            setIsIDDataForDefaultLoad(IDdata)
        }
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(fixedDeductionsViewDetails.groupID);
        setEstates(response);
    };

    async function getDivisionDetailsByEstateID() {
        var response = await services.getDivisionDetailsByEstateID(fixedDeductionsViewDetails.estateID);
        setDivisions(response);
    };

    async function getDeductionTypes() {
        const response = await services.getDeductionTypes();
        let deductionTypesArray = [];
        if (response.length != null || response.length != undefined || response.length > 0) {
            for (let item of Object.entries(response)) {
                deductionTypesArray[item[1]["fixedDeductionTypeID"]] = item[1]["fixedDeductionTypeName"];
            }
        }
        setDeductionTypes(deductionTypesArray);
    };

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
        setFixedDeductionsViewDetails({
            ...fixedDeductionsViewDetails,
            [e.target.name]: value
        });
        setFixedDeductionsViewData([]);
    }

    async function getData() {
        let model = {
            groupID: parseInt(fixedDeductionsViewDetails.groupID),
            estateID: parseInt(fixedDeductionsViewDetails.estateID),
            divisionID: parseInt(fixedDeductionsViewDetails.divisionID),
            fixedDeductionTypeID: parseInt(fixedDeductionsViewDetails.fixedDeductionTypeID)
        }
        let response = await services.GetFixedDeductionDetail(model);
        if (response.statusCode == "Success" && response.data.length != 0) {
            setIsTableHide(true);
            setFixedDeductionsViewData(response.data);
        }
        else {
            alert.error("NO RECORDS TO DISPLAY!")
            clearFields();
        }
    }

    const handleClickEdit = (fixedDeductionSetupID) => {
        encrypted = btoa(fixedDeductionSetupID);
        let modelID = {
            groupID: parseInt(fixedDeductionsViewDetails.groupID),
            estateID: parseInt(fixedDeductionsViewDetails.estateID),
            divisionID: parseInt(fixedDeductionsViewDetails.divisionID),
            fixedDeductionTypeID: parseInt(fixedDeductionsViewDetails.fixedDeductionTypeID)
        };
        sessionStorage.setItem(
            'fixedDeductionSetup-listing-page-search-parameters-id',
            JSON.stringify(modelID)
        );
        navigate('/app/fixedDeductionSetup/addEdit/' + encrypted);
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
                        isEdit={true}
                        toolTiptitle={"Add fixed Deduction"}
                    />
                </Grid>
            </Grid>
        )
    }

    function clearFields() {
        setFixedDeductionsViewDetails({
            ...fixedDeductionsViewDetails,
            divisionID: 0,
            fixedDeductionTypeID: 0,
        });
        setFixedDeductionsViewData([]);
    }

    return (
        <Fragment>
            <LoadingComponent />
            <Page
                className={classes.root}
                title="Fixed Deduction Setup"
            >
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: fixedDeductionsViewDetails.groupID,
                            estateID: fixedDeductionsViewDetails.estateID,
                            divisionID: fixedDeductionsViewDetails.divisionID,
                            fixedDeductionTypeID: fixedDeductionsViewDetails.fixedDeductionTypeID
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group required').min("1", 'Group is required'),
                                divisionID: Yup.number().required('Division required').min("1", 'Division is required'),
                                estateID: Yup.number().required('Factory required').min("1", 'Factory is required'),
                            })
                        }
                        onSubmit={() => trackPromise(getData())}
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
                                            title={cardTitle("Fixed Deduction Setup")}
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
                                                            value={fixedDeductionsViewDetails.groupID}
                                                            variant="outlined"
                                                            size="small"
                                                            onBlur={handleBlur}
                                                            InputProps={{
                                                                readOnly: !permissionList.isGroupFilterEnabled,
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Group--</MenuItem>
                                                            {generateDropDownMenu(groups)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
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
                                                            value={fixedDeductionsViewDetails.estateID}
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
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="divisionID">
                                                            Division *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.divisionID && errors.divisionID)}
                                                            helperText={touched.divisionID && errors.divisionID}
                                                            fullWidth
                                                            name="divisionID"
                                                            size='small'
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={fixedDeductionsViewDetails.divisionID}
                                                            variant="outlined"
                                                        >
                                                            <MenuItem value="0">--Select Division--</MenuItem>
                                                            {generateDropDownMenu(divisions)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="fixedDeductionTypeID">
                                                            Deduction Type
                                                        </InputLabel>
                                                        <TextField select
                                                            fullWidth
                                                            name="fixedDeductionTypeID"
                                                            size='small'
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={fixedDeductionsViewDetails.fixedDeductionTypeID}
                                                            variant="outlined"
                                                        >
                                                            <MenuItem value={0}>--Select Deduction Type--</MenuItem>
                                                            {generateDropDownMenu(deductionTypes)}
                                                        </TextField>
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

                                            <Box minWidth={1050}>
                                                {fixedDeductionsViewData.length > 0 && isTableHide ? (
                                                    <MaterialTable
                                                        title="Multiple Actions Preview"
                                                        columns={[
                                                            { title: 'Employee No', field: 'registrationNumber' },

                                                            { title: 'Employee Name', field: 'fullName' },
                                                            {
                                                                title: 'Fixed DeductionType Name', field: 'fixedDeductionTypeName',
                                                            },
                                                            {
                                                                title: 'IsHold',
                                                                field: 'isHold',
                                                                render: rowData => rowData.isHold ? 'Yes' : 'No',
                                                            },
                                                        ]}
                                                        data={fixedDeductionsViewData}
                                                        options={{
                                                            exportButton: false,
                                                            showTitle: false,
                                                            headerStyle: { textAlign: "left", height: '1%' },
                                                            cellStyle: { textAlign: "left" },
                                                            columnResizable: false,
                                                            actionsColumnIndex: -1,
                                                            pageSize: 10
                                                        }}
                                                        actions={[
                                                            {
                                                                icon: 'edit',
                                                                tooltip: 'Edit',
                                                                onClick: (event, fixedDeductionsViewData) => handleClickEdit(fixedDeductionsViewData.fixedDeductionSetupID)
                                                            },
                                                        ]}
                                                    />
                                                ) : null}
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