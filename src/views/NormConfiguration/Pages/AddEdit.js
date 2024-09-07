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
import { LoadingComponent } from '../../../utils/newLoader';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";
import tokenDecoder from '../../../utils/tokenDecoder';
import { useParams } from 'react-router-dom';
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { CustomMultiSelect } from 'src/utils/CustomMultiSelect';

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

const screenCode = "NORMCONFIGURATION"

export default function NormConfigurationAddEdit(props) {

    const classes = useStyles();
    const navigate = useNavigate();
    const alert = useAlert();
    const [title, setTitle] = useState("Add Norm Configuration")
    const [groups, setGroups] = useState();
    const [estates, setEstates] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [fieldsForDropdown, setFieldsForDropDown] = useState([]);
    const [harvestingJob, setHarvestingJob] = useState([]);
    const [isUpdate, setIsUpdate] = useState(false);
    const [isDisableButton, setIsDisableButton] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [fields, setFields] = useState([]);
    const [isCleared, setIsCleared] = useState(false);
    const [genderListBoth, setGenderList] = useState([1, 2]);
    const [genderListMale, setGenderListMale] = useState([1]);
    const [genderListFemale, setGenderListFemale] = useState([2]);

    const [normConfigDetails, SetNormConfigDetails] = useState({
        groupID: 0,
        estateID: 0,
        divisionID: 0,
        fieldID: 0,
        genderID: 0,
        harvestingJob: 0,
        year: new Date().getUTCFullYear().toString(),
        month: ((new Date().getUTCMonth()) + 1).toString().padStart(2, '0'),
        normValue: 0,
        normDate: '0',
        minNormValue: 0,
        maxNormValue: 0
    });

    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });

    //For multiple dropdown
    const [selectedOptions, setSelectedOptions] = useState([]);
    const getOptionLabel = option => `${option.label}`;
    const getOptionDisabled = option => option.value === "foo";
    const handleToggleOption = selectedOptions =>
        setSelectedOptions(selectedOptions);
    const handleClearOptions = () => setSelectedOptions([]);
    const handleSelectAll = isSelected => {
        if (isSelected) {
            setSelectedOptions(fields);
        } else {
            handleClearOptions();
        }
    };

    //seperating only the values inside selectedOptions.
    const valuesArray = selectedOptions.map(option => option.value);

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermissions(), getHarvestingJobType());
    }, []);

    useEffect(() => {
        if (normConfigDetails.groupID > 0) {
            trackPromise(getEstateDetailsByGroupID());
        };
    }, [normConfigDetails.groupID]);

    useEffect(() => {
        if (normConfigDetails.estateID > 0) {
            trackPromise(
                getDivisionDetailsByEstateID());
        };
    }, [normConfigDetails.estateID]);

    useEffect(() => {
        if (normConfigDetails.divisionID > 0) {
            trackPromise(
                getFieldDetailsByDivisionIDForDropdown(),
                getFieldDetailsByDivisionID(),
                setIsCleared(!isCleared)
            )
        }
    }, [normConfigDetails.divisionID])

    useEffect(() => {
        if (isUpdate == false) {
            SetNormConfigDetails({
                ...normConfigDetails,
                month: ((new Date().getUTCMonth()) + 1).toString().padStart(2, '0'),
                year: ((new Date().getUTCFullYear())).toString()
            })
            setSelectedDate(new Date);
        }
    }, [normConfigDetails.divisionID, normConfigDetails.fieldID])

    const { configurationDetailID } = useParams();
    let decrypted = 0;

    const handleClick = () => {
        navigate('/app/normConfiguration/listing');
    }

    async function getPermissions() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITNORMCONFIGURATION');

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

        SetNormConfigDetails({
            ...normConfigDetails,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            estateID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(normConfigDetails.groupID);
        setEstates(response);
    };

    async function getDivisionDetailsByEstateID() {
        var response = await services.getDivisionDetailsByEstateID(normConfigDetails.estateID);
        setDivisions(response);
    };

    async function getFieldDetailsByDivisionID() {
        var response = await services.getFieldDetailsByDivisionID(normConfigDetails.divisionID);
        setFieldsForDropDown(response);
    };

    async function getHarvestingJobType() {
        var response = await services.getHarvestingJobType();
        setHarvestingJob(response);
    };

    //For get fields for the multiple selcet dropdown
    async function getFieldDetailsByDivisionIDForDropdown() {
        var response = await services.getFieldDetailsByDivisionIDForDropdown(normConfigDetails.divisionID);
        var newCollectionTypeArray = [];
        for (var i = 0; i < response.length; i++) {
            newCollectionTypeArray.push({ label: response[i].fieldName, value: response[i].fieldID })
        }
        setFields(newCollectionTypeArray);
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
        SetNormConfigDetails({
            ...normConfigDetails,
            [e.target.name]: value
        });
    }

    async function saveDetails() {
        let result = [];
        if (valuesArray.length === 0) {
            result.push({
                fieldID: 0,
                normDate1: monthDays[0], normDate2: monthDays[1], normDate3: monthDays[2],
                normDate4: monthDays[3], normDate5: monthDays[4], normDate6: monthDays[5],
                normDate7: monthDays[6], normDate8: monthDays[7], normDate9: monthDays[8],
                normDate10: monthDays[9], normDate11: monthDays[10], normDate12: monthDays[11],
                normDate13: monthDays[12], normDate14: monthDays[13], normDate15: monthDays[14],
                normDate16: monthDays[15], normDate17: monthDays[16], normDate18: monthDays[17],
                normDate19: monthDays[18], normDate20: monthDays[19], normDate21: monthDays[20],
                normDate22: monthDays[21], normDate23: monthDays[22], normDate24: monthDays[23],
                normDate25: monthDays[24], normDate26: monthDays[25], normDate27: monthDays[26],
                normDate28: monthDays[27],
                normDate29: monthDays[28] ? monthDays[28] : '0',
                normDate30: monthDays[29] ? monthDays[29] : '0',
                normDate31: monthDays[30] ? monthDays[30] : '0',
            });
        } else {
            valuesArray.forEach(x => {
                result.push({
                    fieldID: x,
                    normDate1: monthDays[0], normDate2: monthDays[1], normDate3: monthDays[2],
                    normDate4: monthDays[3], normDate5: monthDays[4], normDate6: monthDays[5],
                    normDate7: monthDays[6], normDate8: monthDays[7], normDate9: monthDays[8],
                    normDate10: monthDays[9], normDate11: monthDays[10], normDate12: monthDays[11],
                    normDate13: monthDays[12], normDate14: monthDays[13], normDate15: monthDays[14],
                    normDate16: monthDays[15], normDate17: monthDays[16], normDate18: monthDays[17],
                    normDate19: monthDays[18], normDate20: monthDays[19], normDate21: monthDays[20],
                    normDate22: monthDays[21], normDate23: monthDays[22], normDate24: monthDays[23],
                    normDate25: monthDays[24], normDate26: monthDays[25], normDate27: monthDays[26],
                    normDate28: monthDays[27],
                    normDate29: monthDays[28] ? monthDays[28] : '0',
                    normDate30: monthDays[29] ? monthDays[29] : '0',
                    normDate31: monthDays[30] ? monthDays[30] : '0',
                });
            });
        }

        let model = {
            configurationDetailID: atob(configurationDetailID.toString()),
            NormDatesSaveModel: result,
            groupID: normConfigDetails.groupID,
            estateID: normConfigDetails.estateID,
            divisionID: normConfigDetails.divisionID,
            fieldID: normConfigDetails.fieldID,
            genderID: (normConfigDetails.genderID == 0 ? genderListBoth : normConfigDetails.genderID == 1 ? genderListMale : genderListFemale),
            harvestingJob: normConfigDetails.harvestingJob,
            month: normConfigDetails.month,
            year: normConfigDetails.year,
            normValue: parseFloat(normConfigDetails.normValue).toFixed(2),
            minNormValue: parseInt(normConfigDetails.minNormValue),
            maxNormValue: parseInt(normConfigDetails.maxNormValue),
            createdBy: parseInt(tokenDecoder.getUserIDFromToken())
        }

        if (isUpdate == true) {
            let response = await services.UpdateNormConfigurationDetails(model);
            if (response.statusCode == "Success") {
                alert.success(response.message);
                setIsDisableButton(true);
                navigate('/app/normConfiguration/listing');
            }
            else {
                alert.error(response.message);
            }
        } else {
            let response = await services.saveDetails(model);
            if (response.statusCode == "Success") {
                if(response.data > 0){
                    alert.success('Successfully added records');
                    alert.error('Failed to add some records');
                }
                else
                {
                    alert.success(response.message);
                }
                setIsDisableButton(true);
                navigate('/app/normConfiguration/listing');
            }
            else {
                alert.error(response.message);
            }
        }
    }

    //This was removed because the update is now happening inside listing

    // async function getDetailsByConfigurationDetailID(configurationDetailID) {
    //     const normConfigDetails = await services.GetDetailsByConfigurationDetailID(configurationDetailID);
    //     SetNormConfigDetails({
    //         ...normConfigDetails,
    //         groupID: normConfigDetails.groupID,
    //         estateID: normConfigDetails.estateID,
    //         divisionID: normConfigDetails.divisionID,
    //         fieldID: normConfigDetails.fieldID,
    //         genderID: normConfigDetails.genderID,
    //         normDate: normConfigDetails.normDate,
    //         minNormValue: normConfigDetails.minNormValue,
    //         maxNormValue: normConfigDetails.maxNormValue,
    //         normValue: parseFloat(normConfigDetails.normValue).toFixed(2)
    //     })
    //     setTitle("Edit Norm Configuration");
    //     setIsUpdate(true);
    // }

    //Set an array for the length of the picked month
    const daysInMonth = (year, month) => {
        return new Date(year, month, 0).getDate();
    };
    const numberOfDays = daysInMonth(normConfigDetails.year, normConfigDetails.month);
    const monthDays = Array.from({ length: numberOfDays }, (_, index) => {
        const day = index + 2;
        const formattedDay = new Date(normConfigDetails.year, normConfigDetails.month - 1, day)
            .toISOString().split('T')[0];
        return formattedDay
    });

    function handleDateChange(date) {
        let monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        var month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
        var year = date.getUTCFullYear();
        let monthName = monthNames[month - 1];

        SetNormConfigDetails({
            ...normConfigDetails,
            month: month.toString(),
            year: year.toString()
        });

        setSelectedDate(date);
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
                            groupID: normConfigDetails.groupID,
                            estateID: normConfigDetails.estateID,
                            divisionID: normConfigDetails.divisionID,
                            fieldID: normConfigDetails.fieldID,
                            harvestingJob: normConfigDetails.harvestingJob,
                            normValue: normConfigDetails.normValue,
                            genderID: normConfigDetails.genderID,
                            minNormValue: normConfigDetails.minNormValue,
                            maxNormValue: normConfigDetails.maxNormValue
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group required').min("1", 'Group is required'),
                                estateID: Yup.number().required('Factory required').min("1", 'Factory is required'),
                                divisionID: Yup.number().required('Division is required').min('1', 'Division is required'),
                                fieldID: Yup.number().required('Field is required').max(255),
                                harvestingJob: Yup.number().required('Plucking Job is required').min('1', 'Plucking Job is required'),
                                normValue: Yup.number().when([], (schema) => {
                                    return schema
                                        .required('Norm Value is required')
                                        .test('not-zero', 'Norm Value is required', (value) => value !== 0)
                                        .test('not-negative', 'Norm Value cannot be negative', (value) => value >= 0)
                                        .test('decimal-places', 'Only two decimal places allowed', (value) => /^\d+(\.\d{1,2})?$/.test(value.toString()))
                                        .typeError('Norm Value must be a number');
                                }),
                                maxNormValue: Yup.number().nullable()
                                    .typeError('Max Norm Value must be a number')
                                    .test('not-negative', 'Norm Value cannot be negative', (value) => value >= 0)
                                    .test('decimal-places', 'Only two decimal places allowed', (value) => /^\d+(\.\d{1,2})?$/.test(value.toString())),
                                minNormValue: Yup.number().when(['maxNormValue', 'normValue'], (maxNormValue, normValue, schema) => {
                                    return schema
                                        //.test('larger-than', 'MinValue must be smaller than MaxValue', (value) => value < maxNormValue)
                                        //.lessThan(normValue, 'MinValue must be smaller than Norm Value')
                                        .required('Min Norm Value is required')
                                        .typeError('Min Norm Value must be a number')
                                        .test('not-negative', 'Min Norm Value cannot be negative', (value) => value >= 0)
                                        .test('not-zero', 'Min Norm Value is required', (value) => value !== 0)
                                        .test('decimal-places', 'Only two decimal places allowed', (value) => /^\d+(\.\d{1,2})?$/.test(value.toString()))
                                        .typeError('Min Norm Value must be a number');
                                }),
                            })
                        }
                        onSubmit={() => trackPromise(saveDetails())}
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
                                                            value={normConfigDetails.groupID}
                                                            variant="outlined"
                                                            disabled={isUpdate}
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
                                                            disabled={isUpdate}
                                                            size='small'
                                                            onChange={(e) => {
                                                                handleChange(e)
                                                            }}
                                                            value={normConfigDetails.estateID}
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
                                                        <InputLabel shrink id="divisionID">
                                                            Division *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.divisionID && errors.divisionID)}
                                                            helperText={touched.divisionID && errors.divisionID}
                                                            fullWidth
                                                            name="divisionID"
                                                            disabled={isUpdate}
                                                            size='small'
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={normConfigDetails.divisionID}
                                                            variant="outlined"
                                                        >
                                                            <MenuItem value="0">--Select Division--</MenuItem>
                                                            {generateDropDownMenu(divisions)}
                                                        </TextField>
                                                    </Grid>
                                                </Grid>

                                                <Grid container spacing={3}>
                                                    {isUpdate == true ? (
                                                        <Grid item md={4} xs={12}>
                                                            <InputLabel shrink id="fieldID">
                                                                Field *
                                                            </InputLabel>
                                                            <TextField select
                                                                error={Boolean(touched.fieldID && errors.fieldID)}
                                                                fullWidth
                                                                helperText={touched.fieldID && errors.fieldID}
                                                                name="fieldID"
                                                                onBlur={handleBlur}
                                                                size='small'
                                                                disabled={isUpdate}
                                                                onChange={(e) => {
                                                                    handleChange(e)
                                                                }}
                                                                value={normConfigDetails.fieldID}
                                                                variant="outlined"
                                                                id="fieldID"
                                                            >
                                                                <MenuItem value={'0'}>--Select Field--</MenuItem>
                                                                {generateDropDownMenu(fieldsForDropdown)}
                                                            </TextField>
                                                        </Grid>
                                                    ) :
                                                        <Grid item md={4} xs={12} >
                                                            <InputLabel shrink id="fieldID">
                                                                Field
                                                            </InputLabel>
                                                            <CustomMultiSelect
                                                                error={Boolean(touched.fieldID && errors.fieldID)}
                                                                helperText={touched.fieldID && errors.fieldID}
                                                                items={fields}
                                                                getOptionLabel={getOptionLabel}
                                                                getOptionDisabled={getOptionDisabled}
                                                                selectedValues={selectedOptions}
                                                                placeholder="Fields"
                                                                selectAllLabel="Select all"
                                                                onToggleOption={handleToggleOption}
                                                                onClearOptions={handleClearOptions}
                                                                onSelectAll={handleSelectAll}
                                                            />
                                                        </Grid>
                                                    }

                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="genderID">
                                                            Gender
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.genderID && errors.genderID)}
                                                            fullWidth
                                                            helperText={touched.genderID && errors.genderID}
                                                            size='small'
                                                            onBlur={handleBlur}
                                                            id="genderID"
                                                            name="genderID"
                                                            value={
                                                                normConfigDetails.genderID
                                                            }
                                                            type="text"
                                                            disabled={isUpdate}
                                                            variant="outlined"
                                                            onChange={(e) => handleChange(e)}>
                                                            <MenuItem value={0}>--Select Gender--</MenuItem>
                                                            <MenuItem value={1}>Male</MenuItem>
                                                            <MenuItem value={2}>Female</MenuItem>
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="harvestingJob">
                                                            Plucking Job Type *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.harvestingJob && errors.harvestingJob)}
                                                            fullWidth
                                                            helperText={touched.harvestingJob && errors.harvestingJob}
                                                            name="harvestingJob"
                                                            onBlur={handleBlur}
                                                            size='small'
                                                            disabled={isUpdate}
                                                            onChange={(e) => {
                                                                handleChange(e)
                                                            }}
                                                            value={normConfigDetails.harvestingJob}
                                                            variant="outlined"
                                                            id="harvestingJob"
                                                        >
                                                            <MenuItem value={'0'}>--Select Plucking Job Type--</MenuItem>
                                                            {generateDropDownMenu(harvestingJob)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="normValue">
                                                            Norm Value *
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.normValue && errors.normValue)}
                                                            helperText={touched.normValue && errors.normValue}
                                                            fullWidth
                                                            size='small'
                                                            name="normValue"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={normConfigDetails.normValue}
                                                            variant="outlined"
                                                        />
                                                    </Grid>

                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="minNormValue">
                                                            Min Value *
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.minNormValue && errors.minNormValue)}
                                                            helperText={touched.minNormValue && errors.minNormValue}
                                                            fullWidth
                                                            size='small'
                                                            name="minNormValue"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={normConfigDetails.minNormValue}
                                                            variant="outlined"
                                                        />
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="maxNormValue">
                                                            Max Value
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.maxNormValue && errors.maxNormValue)}
                                                            helperText={touched.maxNormValue && errors.maxNormValue}
                                                            fullWidth
                                                            size='small'
                                                            name="maxNormValue"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={normConfigDetails.maxNormValue}
                                                            variant="outlined"
                                                        />
                                                    </Grid>
                                                    {isUpdate == true ? (
                                                        <Grid item md={4} xs={12}>
                                                            <InputLabel shrink id="normDate">
                                                                Date *
                                                            </InputLabel>
                                                            <TextField
                                                                fullWidth
                                                                name="normDate"
                                                                onChange={(e) => handleChange(e)}
                                                                value={normConfigDetails.normDate.split('T')[0]}
                                                                disabled={isUpdate}
                                                                variant="outlined"
                                                                id="normDate"
                                                                size='small'
                                                            />
                                                        </Grid>
                                                    ) :
                                                        <Grid item md={4} xs={12}>
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
                                                    }
                                                </Grid>
                                            </CardContent>

                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                <Button
                                                    color="primary"
                                                    variant="contained"
                                                    size='small'
                                                    disabled={isSubmitting || isDisableButton}
                                                    type="submit"
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
            </Page >
        </Fragment>
    )
}