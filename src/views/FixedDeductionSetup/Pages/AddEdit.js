import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Card, makeStyles, Container, CardHeader, Button, CardContent, Checkbox, Chip, Divider, MenuItem, Grid, InputLabel, TextField, TableCell, Switch, TableRow, TableContainer, TableBody, Table, TableHead, InputAdornment } from '@material-ui/core';
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
    table: {
        minWidth: 550,
    },
    stickyHeader: {
        position: 'sticky',
        left: 0,
        zIndex: 1,
        backgroundColor: 'white',
    },
    stickyColumn: {
        position: 'sticky',
        left: 0,
        zIndex: 1,
        backgroundColor: 'white',
    },
}));

const screenCode = "FIXEDDEDUCTIONSETUP"

export default function FixedDeductionSetupAddEdit(props) {

    const classes = useStyles();
    let decrypted = 0
    const navigate = useNavigate();
    const alert = useAlert();
    const [title, setTitle] = useState("Add Fixed Deduction")
    const [groups, setGroups] = useState();
    const [estates, setEstates] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [fixedDeductionTypes, setFixedDeductionTypes] = useState([]);
    const [unionDeductionTypes, setUnionDeductionTypes] = useState([]);
    const [foodDeductionTypes, setFoodDeductionTypes] = useState([]);
    const [ArrayField, setArrayField] = useState([]);
    const [isUpdate, setIsUpdate] = useState(false);
    const [isTableHide, setIsTableHide] = useState(false);
    const [isDisableButton, setIsDisableButton] = useState(false);
    const [fixedDeductions, setFixedDeductions] = useState({
        groupID: '0',
        estateID: 0,
        divisionID: 0,
        fixedDeductionTypeID: 0,
        unionID: 0,
        foodDeductionID: 0,
        registrationNumber: '',
        isHold: false
    });

    //For table search
    const [searchInput, setSearchInput] = React.useState('');
    const handleSearchInputChange = (event) => {
        setSearchInput(event.target.value);
    };

    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });
    const { fixedDeductionSetupID } = useParams();

    const [selectedRows, setSelectedRows] = useState([]);
    const [dataList, setDataList] = useState(selectedRows)

    const handleSelectAllClick = (event) => {

        if (event.target.checked) {
            setSelectedRows(Array.from({ length: ArrayField.length }, (_, index) => ({
                index,
                data: ArrayField[index],
                registrationNumber : ArrayField[index].registrationNumber
            })));
        } else {
            setSelectedRows([]);
        }
    };

    const handleRowCheckboxClick = (event, regno) => {
        
        const originalIndex = ArrayField.findIndex(
            (row) => row.registrationNumber === regno
        );
        const selectedRowData = ArrayField[originalIndex];
         
         if (event.target.checked) {
            setSelectedRows([...selectedRows, { originalIndex, data: selectedRowData, registrationNumber:regno }]);
         } else {
           setSelectedRows(selectedRows.filter((row) => row.registrationNumber !== regno));
         }
    };

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermissions());
    }, []);

    useEffect(() => {
        if (fixedDeductions.groupID > 0) {
            trackPromise(getEstateDetailsByGroupID());
        };
    }, [fixedDeductions.groupID]);

    useEffect(() => {
        if (fixedDeductions.estateID > 0) {
            trackPromise(
                getDivisionDetailsByEstateID());
        };
    }, [fixedDeductions.estateID]);

    useEffect(() => {
        getFixedDeductionTypes();
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
        setArrayField([]);
        setIsTableHide(false);
    }, [fixedDeductions.divisionID, fixedDeductions.fixedDeductionTypeID]);

    useEffect(() => {
        if (!isUpdate) {
            setFixedDeductions({
                ...fixedDeductions,
                fixedDeductionTypeID: 0
            })
        }
    }, [fixedDeductions.divisionID]);

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
        decrypted = atob(fixedDeductionSetupID.toString());
        if (parseInt(decrypted) > 0) {
            setIsUpdate(true);
            GetDetailsByFixedDeductionMasterID(decrypted);
        }
    }, []);

    const handleClick = () => {
        navigate('/app/fixedDeductionSetup/listing');
    }

    async function getPermissions() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITFIXEDDEDUCTIONSETUP');

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

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(fixedDeductions.groupID);
        setEstates(response);
    };

    async function getDivisionDetailsByEstateID() {
        var response = await services.getDivisionDetailsByEstateID(fixedDeductions.estateID);
        setDivisions(response);
    };

    async function getFixedDeductionTypes() {
        const response = await services.getFixedDeductionsByEstate(fixedDeductions.estateID);
        setFixedDeductionTypes(response);
    };

    async function getUnionDeductionTypes() {
        var response = await services.getUnionDeductionTypes(fixedDeductions.estateID);
        setUnionDeductionTypes(response);
    };

    async function getFoodDeductionTypes() {
        var response = await services.getFoodDeductionTypes(fixedDeductions.estateID);
        setFoodDeductionTypes(response);
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
        setFixedDeductions({
            ...fixedDeductions,
            [e.target.name]: value
        });
    }

    async function handleClickAdd() {
        let model = {
            divisionID : parseInt(fixedDeductions.divisionID), 
            fixedDeductionTypeID : parseInt(fixedDeductions.fixedDeductionTypeID),
            unionTypeID : fixedDeductions.unionID,
            foodDeductionID : fixedDeductions.foodDeductionID
        }
        console.log("model",model )

        const response = await services.GetRegNoEmpNameByDivisionID(model);

        if (response.length > 0) {
            var array1 = [...ArrayField];

            response.forEach((item) => {
                array1.push({
                    groupID: fixedDeductions.groupID,
                    estateID: fixedDeductions.estateID,
                    divisionID: fixedDeductions.divisionID,
                    registrationNumber: item.registrationNumber,
                    fullName: item.fullName,
                    fixedDeductionTypeID: fixedDeductions.fixedDeductionTypeID,
                    fixedDeductionTypeName: fixedDeductionTypes[fixedDeductions.fixedDeductionTypeID],
                    isHold: false,
                    createdBy: parseInt(tokenDecoder.getUserIDFromToken()),
                    createdDate: new Date().toISOString(),
                });
            });

            setArrayField(array1);
            setIsTableHide(true);

            let dataModel = {
                groupID: fixedDeductions.groupID,
                estateID: fixedDeductions.estateID,
                divisionID: fixedDeductions.divisionID,
                registrationNumber: fixedDeductions.registrationNumber,
                fixedDeductionTypeID: fixedDeductions.fixedDeductionTypeID,
            }
            setDataList(dataList => [...dataList, dataModel]);

            console.log("fixedDeductionTypeID", fixedDeductions.fixedDeductionTypeID)
        }
        else if (response.length == 0) {
            alert.error("All the employees have this deduction type setupped")
        }
    }

    const renderChips = (fixedDeductionTypeName) => {
        return fixedDeductionTypeName.split(', ').map((label, index) => (
            <Chip key={index} label={label} size="small" style={{ color: 'green' }} />
        ));
    };

    async function saveDetails() {

        if (isUpdate == true) {
            let updateModel = {
                fixedDeductionSetupID: atob(fixedDeductionSetupID.toString()),
                isHold: fixedDeductions.isHold,
                modifiedBy: tokenDecoder.getUserIDFromToken(),
                modifiedDate: new Date().toISOString(),
            }
            setIsUpdate(true);
            let response = await services.UpdateFixedDeduction(updateModel);
            if (response.statusCode == "Success") {
                alert.success(response.message);
                navigate('/app/fixedDeductionSetup/listing');
            }
            else {
                alert.error("Fixed Deduction Update Failed");
            }
        } else {
            let requestData = selectedRows.map((row) => row.data);
            let response = await services.saveDetails(requestData);
            if (response.statusCode == "Success") {
                alert.success(response.message);
                setIsDisableButton(true);
                navigate('/app/fixedDeductionSetup/listing');
            }
            else {
                alert.error("FIXED DEDUCTION SAVE FAILED!");
                clearFields();
            }
        }
    }

    function clearFields() {
        setFixedDeductions({
            ...fixedDeductions,
            fixedDeductionTypeID: 0,
            unionID: 0,
            foodDeductionID: 0,
        });
        setArrayField([]);
        setFoodDeductionTypes([]);
        setUnionDeductionTypes([]);
    }

    function onIsActiveChange() {
        setFixedDeductions({
            ...fixedDeductions,
            isHold: !fixedDeductions.isHold
        });
    }

    async function GetDetailsByFixedDeductionMasterID(fixedDeductionSetupID) {
        const fixedDeductions = await services.GetDetailsByFixedDeductionMasterID(fixedDeductionSetupID);
        setFixedDeductions({
            ...fixedDeductions,
            groupID: fixedDeductions.groupID,
            estateID: fixedDeductions.estateID,
            divisionID: fixedDeductions.divisionID,
            fixedDeductionTypeID: fixedDeductions.fixedDeductionTypeID,
            unionID: fixedDeductions.unionID,
            foodDeductionID: fixedDeductions.foodDeductionID,
            isHold: fixedDeductions.isHold,
            modifiedBy: parseInt(tokenDecoder.getUserIDFromToken()),
            modifiedDate: new Date().toISOString()
        })
        setIsUpdate(true);
        setTitle("Edit Fixed Deduction Setup");
    }

    //Filtering all data when searching
    const filteredArrayField = ArrayField.filter((row) => {
        return (
            row.registrationNumber.toLowerCase().includes(searchInput.toLowerCase()) ||
            row.fullName.toLowerCase().includes(searchInput.toLowerCase()) ||
            row.fixedDeductionTypeName.toLowerCase().includes(searchInput.toLowerCase())
        );
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
                            divisionID: fixedDeductions.divisionID,
                            fixedDeductionTypeID: fixedDeductions.fixedDeductionTypeID,
                            unionID: fixedDeductions.unionID,
                            foodDeductionID: fixedDeductions.foodDeductionID,
                        }}
                        validationSchema={
                            Yup.object().shape({
                                divisionID: Yup.number().required('Division is required').min('1', 'Division is required'),
                                fixedDeductionTypeID: Yup.number().required('Deduction Type is required').min('1', 'Deduction Type is required'),
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
                            })
                        }
                        onSubmit={handleClickAdd}
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
                                                            disabled={isUpdate}
                                                            onChange={(e) => handleChange(e)}
                                                            value={fixedDeductions.divisionID}
                                                            variant="outlined"
                                                        >
                                                            <MenuItem value="0">--Select Division--</MenuItem>
                                                            {generateDropDownMenu(divisions)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={12} >
                                                        <InputLabel shrink id="fixedDeductionTypeID">
                                                            Deduction Type *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.fixedDeductionTypeID && errors.fixedDeductionTypeID)}
                                                            helperText={touched.fixedDeductionTypeID && errors.fixedDeductionTypeID}
                                                            fullWidth
                                                            name="fixedDeductionTypeID"
                                                            size='small'
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={fixedDeductions.fixedDeductionTypeID}
                                                            variant="outlined"
                                                            disabled={isUpdate}
                                                        >
                                                            <MenuItem value={0}>--Select Deduction Type--</MenuItem>
                                                            {generateDropDownMenu(fixedDeductionTypes)}
                                                        </TextField>
                                                    </Grid>
                                                </Grid>

                                                <br />
                                                {fixedDeductions.fixedDeductionTypeID == 3 ?
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="unionID">
                                                            Union Deduction Type  *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.unionID && errors.unionID)}
                                                            helperText={touched.unionID && errors.unionID}
                                                            fullWidth
                                                            name="unionID"
                                                            onChange={(e) => handleChange(e)}
                                                            value={fixedDeductions.unionID}
                                                            variant="outlined"
                                                            size="small"
                                                            disabled={isUpdate}
                                                            onBlur={handleBlur}
                                                            InputProps={{
                                                                readOnly: !permissionList.isGroupFilterEnabled,
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Union--</MenuItem>
                                                            {generateDropDownMenu(unionDeductionTypes)}
                                                        </TextField>
                                                    </Grid>
                                                    : fixedDeductions.fixedDeductionTypeID == 4 ?
                                                        <Grid item md={3} xs={12}>
                                                            <InputLabel shrink id="foodDeductionID">
                                                                Food Deduction Type  *
                                                            </InputLabel>
                                                            <TextField select
                                                                error={Boolean(touched.foodDeductionID && errors.foodDeductionID)}
                                                                helperText={touched.foodDeductionID && errors.foodDeductionID}
                                                                fullWidth
                                                                name="foodDeductionID"
                                                                onChange={(e) => handleChange(e)}
                                                                value={fixedDeductions.foodDeductionID}
                                                                variant="outlined"
                                                                size="small"
                                                                disabled={isUpdate}
                                                                onBlur={handleBlur}
                                                                InputProps={{
                                                                    readOnly: !permissionList.isGroupFilterEnabled,
                                                                }}
                                                            >
                                                                <MenuItem value="0">--Select Food Deduction--</MenuItem>
                                                                {generateDropDownMenu(foodDeductionTypes)}
                                                            </TextField>
                                                        </Grid>
                                                        : null}
                                                {isUpdate ?
                                                    <Grid container spacing={3}>
                                                        <Grid item md={10} xs={15}>
                                                            <InputLabel shrink id="isHold">
                                                                Hold
                                                            </InputLabel>
                                                            <Switch
                                                                checked={fixedDeductions.isHold}
                                                                onChange={onIsActiveChange}
                                                                name="isHold"
                                                                disabled={isDisableButton}
                                                            />
                                                        </Grid>
                                                    </Grid>
                                                    : null}

                                                <br></br>
                                                {!isUpdate && ArrayField.length == 0 ?
                                                    <Box display="flex" justifyContent="flex-end" p={3}>
                                                        <Button
                                                            color="primary"
                                                            variant="contained"
                                                            type="submit"
                                                            size='small'
                                                        >
                                                            {"Add"}
                                                        </Button>
                                                    </Box>
                                                    : null}
                                            </CardContent>

                                            {ArrayField.length > 0 && isTableHide ?
                                                <Grid item xs={12}>
                                                    <TextField
                                                        label="Search"
                                                        variant="standard"
                                                        size="small"
                                                        value={searchInput}
                                                        onChange={handleSearchInputChange}
                                                        style={{ float: 'right', marginRight: '50px' }}
                                                        InputProps={{
                                                            endAdornment: (
                                                                <InputAdornment position="end">
                                                                    <SearchIcon />
                                                                </InputAdornment>
                                                            ),
                                                        }}
                                                    />
                                                    <TableContainer style={{ maxHeight: '550px', overflowY: 'auto' }}>
                                                        <Table className={classes.table} aria-label="sticky table" stickyHeader size="small" Table>
                                                            <TableHead style={{ position: "sticky", top: 0, zIndex: 1000, background: "white" }}>
                                                                <TableRow>
                                                                    <TableCell className={classes.sticky} align="center"><b>Employee No</b></TableCell>
                                                                    <TableCell className={classes.sticky} align="center"><b>Employee Name</b></TableCell>
                                                                    <TableCell className={classes.sticky} align="center"><b>Deduction Type</b></TableCell>
                                                                    {selectedRows.length == 0 || selectedRows.length === ArrayField.length ?
                                                                        <TableCell className={classes.sticky} align="center">
                                                                            <b>Select All</b>
                                                                            <Checkbox
                                                                                indeterminate={
                                                                                    selectedRows.length > 0 && selectedRows.length < ArrayField.length
                                                                                }
                                                                                checked={selectedRows.length === ArrayField.length}
                                                                                onChange={handleSelectAllClick}
                                                                            />
                                                                        </TableCell>
                                                                        : <TableCell></TableCell>}
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {filteredArrayField.map((row, index) => {
                                                                    return <TableRow key={index}>
                                                                        <TableCell align="center" >{row.registrationNumber}
                                                                        </TableCell>
                                                                        <TableCell align="center" >{row.fullName}
                                                                        </TableCell>
                                                                        <TableCell align="center" >  {renderChips(row.fixedDeductionTypeName)}
                                                                        </TableCell>
                                                                        <TableCell align="center" padding='100px'>
                                                                            <Checkbox
                                                                                checked={selectedRows.some((selectedRow) => selectedRow.registrationNumber === row.registrationNumber)}
                                                                                onChange={(event) => handleRowCheckboxClick(event, row.registrationNumber)}
                                                                            />
                                                                        </TableCell>
                                                                    </TableRow>
                                                                })}
                                                            </TableBody>
                                                        </Table>
                                                    </TableContainer>
                                                </Grid>
                                                : null}

                                            {!isUpdate && ArrayField.length > 0 && isTableHide ?
                                                <Box display="flex" justifyContent="flex-end" p={2}>
                                                    <Box pr={2}>
                                                        <Button
                                                            color="primary"
                                                            variant="contained"
                                                            type="submit"
                                                            size='small'
                                                            onClick={saveDetails}
                                                        >
                                                            {isUpdate == true ? "Update" : "Save"}
                                                        </Button>
                                                    </Box>
                                                </Box>
                                                : null}

                                            {isUpdate ?
                                                <Box display="flex" justifyContent="flex-end" p={2}>
                                                    <Box pr={2}>
                                                        <Button
                                                            color="primary"
                                                            variant="contained"
                                                            type="submit"
                                                            size='small'
                                                            onClick={saveDetails}
                                                        >
                                                            {isUpdate == true ? "Update" : "Save"}
                                                        </Button>
                                                    </Box>
                                                </Box>
                                                : null}
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