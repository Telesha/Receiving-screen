import React, { useState, useEffect, Fragment } from 'react';
import { Box, Card, makeStyles, Container, CardHeader, Button, CardContent, Divider, MenuItem, Grid, InputLabel, TextField, Paper } from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import tokenDecoder from '../../../utils/tokenDecoder';
import { LoadingComponent } from '../../../utils/newLoader';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";
import moment from 'moment';
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';

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
    stickyHeader: {
        position: 'sticky',
        left: 0,
        backgroundColor: 'white',
    },
    stickyColumn: {
        position: 'sticky',
        left: 0,
        zIndex: 1,
        backgroundColor: 'white',
    },
}));

const screenCode = 'NORMCONFIGURATION';

export default function NormConfigurationListing() {

    const classes = useStyles();
    const navigate = useNavigate();
    const alert = useAlert();
    const [groups, setGroups] = useState();
    const [estates, setEstates] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [isShowTable, setIsShowTable] = useState(false);
    const [fieldsForDropdown, setFieldsForDropDown] = useState([]);
    const [harvestingJob, setHarvestingJob] = useState([]);
    const [normConfigTableViewData, setNormConfigTableViewData] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const [normConfigViewDetails, setNormConfigViewDetails] = useState({
        groupID: 0,
        estateID: 0,
        divisionID: 0,
        fieldID: 0,
        harvestingJob: 0,
        genderID: 0,
        year: new Date().getUTCFullYear().toString(),
        month: ((new Date().getUTCMonth()) + 1).toString().padStart(2, '0'),
    });
    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupID: '0',
        estateID: '0',
        divisionID: '0',
        regNo: '0',
        fromDate: '',
        toDate: ''
    });

    let encrypted = "";
    const handleClick = () => {
        encrypted = btoa('0');
        navigate('/app/normConfiguration/addEdit/' + encrypted);
    }

    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermissions(), getHarvestingJobType());
    }, []);

    useEffect(() => {
        if (normConfigViewDetails.groupID > 0) {
            trackPromise(getEstateDetailsByGroupID());
        };
    }, [normConfigViewDetails.groupID]);

    useEffect(() => {
        if (normConfigViewDetails.estateID > 0) {
            trackPromise(
                getDivisionDetailsByEstateID());
        };
    }, [normConfigViewDetails.estateID]);

    useEffect(() => {
        if (normConfigViewDetails.divisionID > 0) {
            trackPromise(
                getFieldDetailsByDivisionID()
            )
            setNormConfigViewDetails({
                ...normConfigViewDetails,
                fieldID: 0,
                genderID: 0,
                month: ((new Date().getUTCMonth()) + 1).toString().padStart(2, '0'),
                year: ((new Date().getUTCFullYear())).toString()
            })
            setSelectedDate(new Date);
        }
    }, [normConfigViewDetails.divisionID])

    useEffect(() => {
        setNormConfigViewDetails({
            ...normConfigViewDetails,
            genderID: 0,
            month: ((new Date().getUTCMonth()) + 1).toString().padStart(2, '0'),
            year: ((new Date().getUTCFullYear())).toString()
        })
        setSelectedDate(new Date);
    }, [normConfigViewDetails.fieldID])

    async function getPermissions() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWNORMCONFIGURATION');

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

        setNormConfigViewDetails({
            ...normConfigViewDetails,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            estateID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

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
        setNormConfigViewDetails({
            ...normConfigViewDetails,
            [e.target.name]: value
        });
        setIsShowTable(false);
        setNormConfigTableViewData([]);
    }

    async function getData() {
        setNormConfigTableViewData([]);
        let model = {
            groupID: parseInt(normConfigViewDetails.groupID),
            estateID: parseInt(normConfigViewDetails.estateID),
            divisionID: parseInt(normConfigViewDetails.divisionID),
            fieldID: parseInt(normConfigViewDetails.fieldID),
            genderID: parseInt(normConfigViewDetails.genderID),
            harvestingJobTypeID: parseInt(normConfigViewDetails.harvestingJob),
            month: normConfigViewDetails.month,
            year: normConfigViewDetails.year,
        }
        getSelectedDropdownValuesForReport(model);
        let response = await services.GetNormConfigurationViewDetail(model);
        if (response.statusCode == "Success" && response.data.length != 0) {
            setNormConfigTableViewData(response.data)
        }
        else {
            alert.error("No records to display")
        }
    }

    async function saveUpdatedDetails() {
        let newArray = []
        monthDays.forEach((x, i) => {
            newArray.push(`day${i + 1}Min`)
            newArray.push(`day${i + 1}Norm`)
            newArray.push(`day${i + 1}Max`)
        })
        let failedCount = 0
        normConfigTableViewData.forEach(x => {
            newArray.forEach(y => {
                if (x[y] == null || x[y] < 0) {
                    failedCount++
                }
            })
        })

        if (failedCount == 0) {
            const model = normConfigTableViewData.map(row => ({
                ...row,
                modifiedBy: parseInt(tokenDecoder.getUserIDFromToken()),
                modifiedDate: new Date().toISOString()
            }))
            let response = await services.UpdateNormConfigurationDetails(model);
            if (response.statusCode == "Success") {
                alert.success(response.message);
                window.location.reload(false);
            }
            else {
                alert.error(response.message);
            }
        }
        else {
            alert.error('Please enter a valid number');
        }
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(normConfigViewDetails.groupID);
        setEstates(response);
    };

    async function getDivisionDetailsByEstateID() {
        var response = await services.getDivisionDetailsByEstateID(normConfigViewDetails.estateID);
        setDivisions(response);
    };

    async function getFieldDetailsByDivisionID() {
        var response = await services.getFieldDetailsByDivisionID(normConfigViewDetails.divisionID);
        setFieldsForDropDown(response);
    };

    async function getHarvestingJobType() {
        var response = await services.getHarvestingJobType();
        setHarvestingJob(response);
    };

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: groups[searchForm.groupID],
            estateName: estates[searchForm.estateID],
            divisionName: divisions[searchForm.divisionID],
            fieldName: fieldsForDropdown[searchForm.fieldID],
        });
    }

    function changeText(value, index, rowIdx) {
        const valueTwo = value === "" ? null : parseInt(value);
        const newArr = [...normConfigTableViewData];
        newArr[rowIdx] = { ...newArr[rowIdx], [`day${index + 1}Min`]: valueTwo };
        setNormConfigTableViewData(newArr);
    }


    function changeText2(value, index, rowIdx) {
        const valueTwo = value === "" ? null : parseInt(value);
        const newArr = [...normConfigTableViewData];
        newArr[rowIdx] = { ...newArr[rowIdx], [`day${index + 1}Norm`]: valueTwo };
        setNormConfigTableViewData(newArr);
    }

    function changeText3(value, index, rowIdx) {
        const valueTwo = value === "" ? null : parseInt(value);
        const newArr = [...normConfigTableViewData];
        newArr[rowIdx] = { ...newArr[rowIdx], [`day${index + 1}Max`]: valueTwo };
        setNormConfigTableViewData(newArr);
    }

    function handleDateChange(date) {
        let monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        var month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
        var year = date.getUTCFullYear();

        setNormConfigViewDetails({
            ...normConfigViewDetails,
            month: month.toString(),
            year: year.toString()
        });
        setSelectedDate(date);
        setNormConfigTableViewData([]);
    }

    const daysInMonth = (year, month) => {
        return new Date(year, month, 0).getDate();
    };
    const numberOfDays = daysInMonth(normConfigViewDetails.year, normConfigViewDetails.month);
    const monthDays = Array.from({ length: numberOfDays }, (_, index) => {
        const day = index + 2;
        const formattedDay = new Date(normConfigViewDetails.year, normConfigViewDetails.month - 1, day)
            .toISOString().split('T')[0];
        return formattedDay
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
                        toolTiptitle={"Add Norm Configuration"}
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
                title="View Norm Configuration"
            >
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: normConfigViewDetails.groupID,
                            estateID: normConfigViewDetails.estateID,
                            divisionID: normConfigViewDetails.divisionID,
                            genderID: normConfigViewDetails.genderID,
                            date: normConfigViewDetails.date

                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group required').min("1", 'Group is required'),
                                estateID: Yup.number().required('Factory required').min("1", 'Factory is required'),
                                divisionID: Yup.number().required('Division is required').min('1', 'Division is required'),
                                date: Yup.string()
                            })
                        }
                        onSubmit={() => trackPromise(getData())}
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
                                            title={cardTitle("View Norm Configuration")}
                                        />
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
                                                        value={normConfigViewDetails.groupID}
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
                                                        value={normConfigViewDetails.estateID}
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
                                                        value={normConfigViewDetails.divisionID}
                                                        variant="outlined"
                                                        defaultValue={0}
                                                    >
                                                        <MenuItem value="0">--Select Division--</MenuItem>
                                                        {generateDropDownMenu(divisions)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="fieldID">
                                                        Field
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.fieldID && errors.fieldID)}
                                                        fullWidth
                                                        helperText={touched.fieldID && errors.fieldID}
                                                        name="fieldID"
                                                        onBlur={handleBlur}
                                                        size='small'
                                                        onChange={(e) => {
                                                            handleChange(e)
                                                        }}
                                                        value={normConfigViewDetails.fieldID}
                                                        variant="outlined"
                                                        id="fieldID"
                                                    >
                                                        <MenuItem value={'0'}>--Select Field--</MenuItem>
                                                        {generateDropDownMenu(fieldsForDropdown)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="genderID">
                                                        Gender
                                                    </InputLabel>
                                                    <TextField select fullWidth
                                                        error={Boolean(touched.genderID && errors.genderID)}
                                                        helperText={touched.genderID && errors.genderID}
                                                        size='small'
                                                        onBlur={handleBlur}
                                                        id="genderID"
                                                        name="genderID"
                                                        value={
                                                            normConfigViewDetails.genderID
                                                        }
                                                        type="text"
                                                        variant="outlined"
                                                        onChange={(e) => handleChange(e)}>
                                                        <MenuItem value="0">--Select Gender--</MenuItem>
                                                        <MenuItem value="1">Male</MenuItem>
                                                        <MenuItem value="2">Female</MenuItem>
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="harvestingJob">
                                                        Plucking Job Type
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.harvestingJob && errors.harvestingJob)}
                                                        fullWidth
                                                        helperText={touched.harvestingJob && errors.harvestingJob}
                                                        name="harvestingJob"
                                                        onBlur={handleBlur}
                                                        size='small'
                                                        onChange={(e) => {
                                                            handleChange(e)
                                                        }}
                                                        value={normConfigViewDetails.harvestingJob}
                                                        variant="outlined"
                                                        id="harvestingJob"
                                                    >
                                                        <MenuItem value={'0'}>--Select Plucking Job Type--</MenuItem>
                                                        {generateDropDownMenu(harvestingJob)}
                                                    </TextField>
                                                    </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                        <DatePicker
                                                            autoOk
                                                            variant="inline"
                                                            openTo="month"
                                                            views={['year', 'month']}
                                                            label="Year and Month *"
                                                            helperText="Select applicable month"
                                                            value={selectedDate}
                                                            disableFuture={true}
                                                            onChange={date => handleDateChange(date)}
                                                            size="small"
                                                        />
                                                    </MuiPickersUtilsProvider>

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
                                            {normConfigTableViewData.length > 0 ? (
                                                <TableContainer component={Paper} style={{ maxHeight: '550px', overflowY: 'auto' }}>
                                                    <Table size="small" aria-label="sticky table" Table stickyHeader>
                                                        <TableRow>
                                                            <TableCell className={`${classes.stickyColumn}`} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="left" rowSpan={2}>
                                                                Field Name
                                                            </TableCell>
                                                            <TableCell className={`${classes.stickyColumn}`} style={{ left: 74, border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="left" rowSpan={2}>
                                                                Gender
                                                            </TableCell>
                                                            <TableCell className={`${classes.stickyColumn}`} style={{ left: 148, border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="left" rowSpan={2}>
                                                                Harvesting Job Type
                                                            </TableCell>
                                                            {monthDays.map((row, index) => {
                                                                return (
                                                                    <React.Fragment key={index}>
                                                                        <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="center" colSpan={3}>
                                                                            {moment(row).format('MMMM DD')}
                                                                        </TableCell>
                                                                    </React.Fragment>
                                                                );
                                                            })}
                                                        </TableRow>
                                                        <TableRow>
                                                            {monthDays.map((row, index) => {
                                                                return (
                                                                    <React.Fragment key={index}>
                                                                        <TableCell style={{ border: "1px solid black" }} align="center" >
                                                                            {'Min'}
                                                                        </TableCell>
                                                                        <TableCell style={{ border: "1px solid black" }} align="center" >
                                                                            {'Norm'}
                                                                        </TableCell>
                                                                        <TableCell style={{ border: "1px solid black" }} align="center" >
                                                                            {'Max'}
                                                                        </TableCell>
                                                                    </React.Fragment>
                                                                );
                                                            })}
                                                        </TableRow>
                                                        <TableBody>
                                                            {normConfigTableViewData.map((row, index) => {
                                                                return (
                                                                    <TableRow key={index}>
                                                                        <TableCell className={`${classes.stickyColumn}`} style={{ border: "1px solid black" }} align="left" component="th" scope="row">
                                                                            {row.fieldName}
                                                                        </TableCell>
                                                                        <TableCell className={`${classes.stickyColumn}`} style={{ left: 74, border: "1px solid black" }} align="left" component="th" scope="row">
                                                                            {(row.genderID === 1) ? 'Male' : 'Female'}
                                                                        </TableCell>
                                                                        <TableCell className={`${classes.stickyColumn}`} style={{ left: 148, border: "1px solid black" }} align="left" component="th" scope="row">
                                                                            {row.harvestingJobTypeName}
                                                                        </TableCell>
                                                                        {monthDays.map((rows, dayIndex) => {
                                                                            return (
                                                                                <React.Fragment key={dayIndex}>
                                                                                    <TableCell style={{ border: "1px solid black", minWidth: "80px" }} align="center">
                                                                                        <TextField
                                                                                            size="small"
                                                                                            id="outlined-size-small"
                                                                                            name="minValue"
                                                                                            InputProps={{
                                                                                                inputProps: {
                                                                                                    type: 'text',
                                                                                                    style: { textAlign: 'right', textDecoration: 'none' },
                                                                                                },
                                                                                                disableUnderline: true,
                                                                                            }}
                                                                                            onWheel={event => event.target.blur()}
                                                                                            onChange={(e) => {
                                                                                                const value = e.target.value.trim();
                                                                                                if (!value.includes('-') && (value === "" || value === " " || (!isNaN(parseFloat(value)) && parseFloat(value) !== 0))) {
                                                                                                    changeText(value, dayIndex, index);
                                                                                                } else {
                                                                                                    alert.error("Enter a valid amount");
                                                                                                }
                                                                                            }}
                                                                                            value={row[`day${dayIndex + 1}Min`] || ''}
                                                                                        />
                                                                                    </TableCell>

                                                                                    <TableCell style={{ border: "1px solid black", minWidth: "80px" }} align="center">
                                                                                        <TextField
                                                                                            size="small"
                                                                                            id="outlined-size-small"
                                                                                            name="normValue"
                                                                                            InputProps={{
                                                                                                inputProps: {
                                                                                                    type: 'text',
                                                                                                    style: { textAlign: 'right', textDecoration: 'none' },
                                                                                                },
                                                                                                disableUnderline: true,
                                                                                            }}
                                                                                            onWheel={event => event.target.blur()}
                                                                                            onChange={(e) => {
                                                                                                const value = e.target.value.trim();
                                                                                                if (((!isNaN(parseInt(value)) && parseInt(value) !== 0) || value === "") && !value.includes('-')) {
                                                                                                    changeText2(value, dayIndex, index);
                                                                                                } else {
                                                                                                    alert.error("Enter a valid amount");
                                                                                                }
                                                                                            }}
                                                                                            value={row[`day${dayIndex + 1}Norm`] || ''}
                                                                                        />
                                                                                    </TableCell>

                                                                                    <TableCell style={{ border: "1px solid black", minWidth: "80px" }} align="center">
                                                                                        <TextField
                                                                                            size="small"
                                                                                            id="outlined-size-small"
                                                                                            name="maxValue"
                                                                                            InputProps={{
                                                                                                inputProps: {
                                                                                                    type: 'text',
                                                                                                    style: { textAlign: 'right', textDecoration: 'none' },
                                                                                                },
                                                                                                disableUnderline: true,
                                                                                            }}
                                                                                            onWheel={event => event.target.blur()}
                                                                                            onChange={(e) => {
                                                                                                const trimmedValue = e.target.value.trim();
                                                                                                if (!trimmedValue.includes('-') && (trimmedValue === "" || trimmedValue === "0" || (!isNaN(parseFloat(trimmedValue))))) {
                                                                                                    changeText3(e.target.value, dayIndex, index);
                                                                                                } else {
                                                                                                    alert.error("Please enter a valid number");
                                                                                                }
                                                                                            }}
                                                                                            value={row[`day${dayIndex + 1}Max`]}
                                                                                        />
                                                                                    </TableCell>
                                                                                </React.Fragment>
                                                                            );
                                                                        })}
                                                                    </TableRow>
                                                                );
                                                            })}
                                                        </TableBody>

                                                    </Table>
                                                </TableContainer>
                                            ) : null}

                                            {normConfigTableViewData.length > 0 ? (
                                                <Box display="flex" justifyContent="flex-end" p={2}>
                                                    <Button
                                                        color="primary"
                                                        id="btnUpdate"
                                                        variant="contained"
                                                        style={{ marginRight: '1rem' }}
                                                        onClick={saveUpdatedDetails}
                                                        size="small"
                                                    >
                                                        Update
                                                    </Button>
                                                </Box>

                                            ) : null}
                                        </Box>
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