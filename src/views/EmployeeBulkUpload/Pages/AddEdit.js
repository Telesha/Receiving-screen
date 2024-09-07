import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Box,
    Card,
    Button,
    makeStyles,
    Container,
    Divider,
    CardContent,
    CardHeader,
    Grid,
    TextField,
    MenuItem,
    InputLabel,
    Tooltip
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import { Formik } from 'formik';
import * as Yup from "yup";
import CSVReader from 'react-csv-reader';
import { confirmAlert } from 'react-confirm-alert';
import MaterialTable from "material-table";
import { Fragment } from 'react';
import { LoadingComponent } from '../../../utils/newLoader';
import tokenDecoder from '../../../utils/tokenDecoder';
import { useAlert } from "react-alert";
import { CSVLink } from 'react-csv';
import xlsx from 'json-as-xlsx';

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
    row: {
        marginTop: '1rem'
    }
}));

const screenCode = 'EMPLOYEEBULKUPLOAD';
export default function EmployeeBulkUpload() {
    const [title, setTitle] = useState("Employee Bulk Upload")
    const classes = useStyles();
    const alert = useAlert();
    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [divisions, setDivisions] = useState();
    const [isExcelAvailable, setIsExcelAvailable] = useState(false);
    const [attendanceData, setAttendanceData] = useState([]);
    const [errorlist, setErrorList] = useState([]);
    const [customerData, setcustomerData] = useState([]);
    const [IsUploadingFinished, setIsUploadingFinished] = useState(false)
    const [fileError, setFileError] = useState('');
    const [attendanceBulkUpload, setAttendanceBulkUpload] = useState({
        groupID: '0',
        factoryID: '0',
        category: '0',
        divisionID: '0',
        isBCardStatus: '',
        unionID: '0'
    })
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });

    const handleClose = () => {
        setOpen(false);
    };
    const [open, setOpen] = React.useState(true);
    const papaparseOptions = {
        header: true,
        dynamicTyping: false,
        quoteChar: '"',
        skipEmptyLines: true,
        parseNumbers: true,
        transformHeader: header => header.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
            return index === 0 ? word.toLowerCase() : word.toUpperCase();
        }).replace(/\s+/g, '')
    };
    const navigate = useNavigate();
    const regexddmmyyyy = /^([1-9]|[12][0-9]|3[01])\/([1-9]|1[0-2])\/(19|20)\d\d$/;

    const csvHeaders = [
        { label: "EmployeeType", key: "empType" },
        { label: "EmployeeSubCategory", key: "empSubCategory" },
        { label: "EmployeeDesignation", key: "empDesignation" },
        { label: "EmployeeCode", key: "empCode" },
        { label: "RegistrationNumber", key: "regNo" },
        { label: "Gender", key: "gender" },
        { label: "FirstName", key: "firstName" },
        { label: "LastName", key: "lastName" },
        { label: "DateOfBirth", key: "dob" },
        { label: "JoiningDate", key: "joinDate" },
        { label: "EPFESPS Mode", key: "epsESPSMode" },
        { label: "EPFESPS No", key: "epsESPSNo" },
        { label: "ContactNumber", key: "contactNo" },
        { label: "NIC", key: "nic" },
        { label: "Union", key: "union" },
        { label: "isBCardStatus", key: "isBCardStatus" }
    ];

    const csvData = [
        {
            empType: "", empSubCategory: "", empDesignation: "", empCode: "", regNo: "", gender: "", firstName: "", lastName: "", dob: "", joinDate: "", epsESPSMode: "", epsESPSNo: "", contactNo: "", nic: "", union: "", isBCardStatus: ""
        },
    ];

    const csvData2 = [
        {
            empType: "Registered", empSubCategory: "Division", empDesignation: "Sundry", empCode: "2001", regNo: "2001", gender: "Female", firstName: "SUBRAMANIYAM N", lastName: "N/A", dob: "10/5/1977", joinDate: "20/3/2024", epsESPSMode: "EPF", epsESPSNo: "5010", contactNo: "N/A", nic: "771354120V", union: "N/A", isBCardStatus: "Yes"
        },
        {
            empType: "Registered", empSubCategory: "Division", empDesignation: "Sundry", empCode: "2002", regNo: "2002", gender: "Female", firstName: "SUBRAMANIYAM P", lastName: "N/A", dob: "10/5/2001", joinDate: "20/3/2024", epsESPSMode: "EPF", epsESPSNo: "YT/2001", contactNo: "0711312070", nic: "200117602620", union: "N/A", isBCardStatus: "Yes"
        },
        {
            empType: "Casual", empSubCategory: "Division", empDesignation: "Plucker", empCode: "2003", regNo: "2003", gender: "Male", firstName: "MAHESHWARAN R", lastName: "N/A", dob: "7/12/1972", joinDate: "20/3/2024", epsESPSMode: "N/A", epsESPSNo: "N/A", contactNo: "714562584", nic: "723421530", union: "N/A", isBCardStatus: "Yes"
        },
        {
            empType: "Casual", empSubCategory: "Division", empDesignation: "Plucker", empCode: "2004", regNo: "2004", gender: "Male", firstName: "SURESH KUMAR T", lastName: "N/A", dob: "25/12/1992", joinDate: "20/3/2024", epsESPSMode: "N/A", epsESPSNo: "N/A", contactNo: "0714562585", nic: "923202313X", union: "N/A", isBCardStatus: "Yes"
        }
    ];

    const csvData3 = [
        {
            empType: "Registered", empSubCategory: "Section", empDesignation: "ITmanager", empCode: "199810", regNo: "199810", gender: "Female", firstName: "SUBRAMANIYAM N", lastName: "N/A", dob: "10/5/1977", joinDate: "20/3/2024", epsESPSMode: "EPF", epsESPSNo: "501091", contactNo: "N/A", nic: "200165789013", union: "N/A", isBCardStatus: "Yes"
        },
        {
            empType: "Registered", empSubCategory: "Section", empDesignation: "field officer", empCode: "199811", regNo: "199811", gender: "Female", firstName: "SUBRAMANIYAM P", lastName: "N/A", dob: "10/5/2001", joinDate: "20/3/2024", epsESPSMode: "EPF", epsESPSNo: "YT/2007", contactNo: "0711312070", nic: "200165789012", union: "N/A", isBCardStatus: "Yes"
        },
        {
            empType: "Casual", empSubCategory: "Section", empDesignation: "ITmanager", empCode: "199812", regNo: "199812", gender: "Male", firstName: "MAHESHWARAN R", lastName: "N/A", dob: "7/12/1972", joinDate: "20/3/2024", epsESPSMode: "N/A", epsESPSNo: "N/A", contactNo: "714562584", nic: "200165789014", union: "N/A", isBCardStatus: "Yes"
        },
        {
            empType: "Casual", empSubCategory: "Section", empDesignation: "field officer", empCode: "199813", regNo: "199813", gender: "Male", firstName: "SURESH KUMAR T", lastName: "N/A", dob: "25/12/1992", joinDate: "20/3/2024", epsESPSMode: "N/A", epsESPSNo: "N/A", contactNo: "0714562585", nic: "200165789015", union: "N/A", isBCardStatus: "Yes"
        }
    ];

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission());
    }, []);

    useEffect(() => {
        trackPromise(getFactoriesForDropDown()
        );
    }, [attendanceBulkUpload.groupID]);

    useEffect(() => {
        getDivisionsForDropDown()
    }, [attendanceBulkUpload.category]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWEMPLOYEEBULKUPLOAD');

        if (isAuthorized === undefined) {
            navigate('/404');
        }
        var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
        var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');

        setPermissions({
            ...permissionList,
            isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
            isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined
        });

        setAttendanceBulkUpload({
            ...attendanceBulkUpload,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }
    async function getFactoriesForDropDown() {
        const factory = await services.getFactoryByGroupID(attendanceBulkUpload.groupID);
        setFactories(factory);
    }

    async function getDivisionsForDropDown() {
        const divisions = await services.getDivisionDetailsByEstateID(attendanceBulkUpload.factoryID);
        setDivisions(divisions);
    }

    const hardcodedHeaders = [
        'EmployeeType',
        'EmployeeSubCategory',
        'EmployeeDesignation',
        'EmployeeCode',
        'RegistrationNumber',
        'Gender',
        'FirstName',
        'LastName',
        'DateOfBirth',
        'JoiningDate',
        'EPFESPSMode',
        'EPFESPSNo',
        'ContactNumber',
        'NIC',
        'Union',
        'isBCardStatus'
    ];
    const handleLoaded = (data, fileInfo) => {
        if (!fileInfo || fileInfo.type !== 'text/csv') {
            setFileError('Invalid file format, only CSV files are allowed');
            return;
        }

        const csvHeaders = Object.keys(data[0]).map(header => header.trim().toLowerCase());
        const normalizedHardcodedHeaders = hardcodedHeaders.map(header => header.trim().toLowerCase());
        const missingHeaders = normalizedHardcodedHeaders.filter(header => !csvHeaders.includes(header));

        if (missingHeaders.length > 0) {
            const errorMessage = `Invalid Template`;
            setFileError(errorMessage);
        } else {
            setFileError('');
            handleForce(data, fileInfo);
        }
    };

    const handleForce = (data, fileInfo) => {
        if (attendanceData.length > 0) {
            confirmAlert({
                title: 'Confirmation Message',
                message: 'Are you sure to browse a new file without uploading existing file.',
                buttons: [
                    {
                        label: 'Yes',
                        onClick: () => confirmUpload(data, fileInfo)
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
        else {
            confirmUpload(data, fileInfo);
        }
    }

    function confirmUpload(data, fileInfo) {
        setIsUploadingFinished(true);
        setcustomerData(data);
        setAttendanceData(data);
        setIsExcelAvailable(false);
    }

    async function saveEmployeeAttendance() {
        const errorEmpList = [];
        const errorList = [];
        const concatErrorList = [];
        const successEmpList = [];
        const existRegNumbers = await services.getAllRegistrationNumbers(attendanceBulkUpload.groupID, attendanceBulkUpload.factoryID);
        const existEPFESPSNumbers = await services.getAllEPFESPSNumbers(attendanceBulkUpload.groupID, attendanceBulkUpload.factoryID);
        const existNICNumbers = await services.getAllNIC();
        const designationIDs = await services.getDesignationsByEstateID(attendanceBulkUpload.factoryID);

        let datarest = await Promise.all(attendanceData.map(async data => {

            var alreadyExistRegNumbers = existRegNumbers.filter(a => a.registrationNumber === parseInt(data.registrationNumber));
            var alreadyExistEPSNumbers = existEPFESPSNumbers.filter(a => a.epfNumber === data.ePFESPSNo);
            var alreadyExistNICNumbers = existNICNumbers.filter(a => a.nicNumber === parseInt(data.nIC));
            var filteredDesignation = designationIDs.find(designation => designation.designationName === data.employeeDesignation) === undefined ? null : designationIDs.find(designation => designation.designationName === data.employeeDesignation);
            const empDesignationID = filteredDesignation == null ? 0 : filteredDesignation.designationID;

            if (filteredDesignation == null) {
                errorEmpList.push(data);
                errorList.push({ error: "Invalid Designation" });
                return;
            } else if (attendanceBulkUpload.category == '2' && (!(data.employeeDesignation == "Plucker" || data.employeeDesignation == "Sundry"))) {
                errorEmpList.push(data);
                errorList.push({ error: "Labour cannot have this Designation" });
                return;
            } else if (attendanceBulkUpload.category == '1' && (data.employeeDesignation == "Plucker" || data.employeeDesignation == "Sundry")) {
                errorEmpList.push(data);
                errorList.push({ error: "Staff cannot have this Designation" });
                return;
            } else {

                var confirmation = (data.employeeType == "" || data.employeeType == "N/A") &&
                    (data.employeeSubCategory == "" || data.employeeSubCategory == "N/A") &&
                    (data.employeeDesignation == "" || data.employeeDesignation == "N/A") &&
                    (data.employeeCode == "" || data.employeeCode == "N/A") &&
                    (data.registrationNumber !== "" || data.registrationNumber !== "N/A") &&
                    (data.gender == "" || data.gender == "N/A") &&
                    (data.firstName == "" || data.firstName == "N/A") &&
                    (data.lastName == "") && (data.dateOfBirth == "") && (data.joiningDate == "") && (data.union === "") && (data.isBCardStatus == "")
                    ? false : true

                if (confirmation) {
                    if (alreadyExistRegNumbers.length === 0) {
                        if (regexddmmyyyy.test(data.dateOfBirth)) {
                            if (regexddmmyyyy.test(data.joiningDate)) {
                                if (!(data.ePFESPSMode === "N/A" && data.ePFESPSNo !== "N/A")) {
                                    if (!(data.ePFESPSMode !== "N/A" && data.ePFESPSNo === "N/A")) {
                                        if (alreadyExistEPSNumbers.length === 0) {
                                            if (data.contactNumber.length === 9 || data.contactNumber.length === 10 || data.contactNumber == 'N/A') {
                                                if (alreadyExistNICNumbers.length === 0) {
                                                    if (/^(\d{12}|\d{9}[VvXx])$/.test(data.nIC)) {
                                                        var employeeDetails = {
                                                            employees: data,
                                                            groupID: parseInt(attendanceBulkUpload.groupID),
                                                            operationEntityID: parseInt(attendanceBulkUpload.factoryID),
                                                            employeeCategoryID: parseInt(attendanceBulkUpload.category),
                                                            collectionPointID: parseInt(attendanceBulkUpload.divisionID),
                                                            designationID: empDesignationID,
                                                            createdBy: parseInt(tokenDecoder.getUserIDFromToken())
                                                        }
                                                        const response = await services.SaveEmployeeBulkUpload(employeeDetails);
                                                        if (response.statusCode == "Success") {
                                                            successEmpList.push(data);
                                                            return;
                                                        }
                                                        else {
                                                            alert.error(response.message);
                                                            errorEmpList.push(data);
                                                            errorList.push({ error: response.message });
                                                            return;
                                                        }
                                                    }
                                                    errorEmpList.push(data);
                                                    errorList.push({ error: "Invalis NIC" })
                                                    return;
                                                }
                                                alert.error(data.nIC + '  is already existed');
                                                errorEmpList.push(data);
                                                errorList.push({ error: "NIC Number ia already existed" })
                                                return;
                                            }
                                            errorEmpList.push(data);
                                            errorList.push({ error: "Invalid Contact Number" })
                                            return;
                                        }
                                        alert.error('EPF/ESPS Numbers ' + data.ePFESPSNo + '  is already at the table');
                                        errorEmpList.push(data);
                                        errorList.push({ error: "EPF/ESPS Number already existed" })
                                        return;
                                    }
                                    errorEmpList.push(data);
                                    errorList.push({ error: "naaaaa" })
                                    return;
                                }
                                alert.error('Cannot have EPF/ESPS number when EPF/ESPS mode N/A');
                                errorEmpList.push(data);
                                errorList.push({ error: "Cannot have EPF/ESPS number when EPF/ESPS mode N/A" })
                                return;
                            }
                            alert.error("Invalid Date Type");
                            errorEmpList.push(data);
                            errorList.push({ error: "Invalid Date Type" })
                            return;
                        }
                        alert.error("Invalid Date Type");
                        errorEmpList.push(data);
                        errorList.push({ error: "Date of Birth Invalid Date Type" })
                        return;
                    }
                    alert.error('Registration Number ' + data.registrationNumber + '  is already at the table');
                    errorEmpList.push(data);
                    errorList.push({ error: "This Registration Number is already exist" })
                    return;
                }
                errorList.push({ error: "Have Empty Cells" })
            }
        }))

    for (let i = 0; i < errorEmpList.length; i++) {
        concatErrorList.push({ emp: errorEmpList[i], error: errorList[i] })
    }
    setErrorList(concatErrorList);
    if (errorEmpList.length === 0) {
        clearScreen()
        clearData();
        alert.success('All Employee details uploaded successfully');
        setIsExcelAvailable(false);
    } else {
        document.querySelector('.csv-input').value = '';
        alert.info(successEmpList.length + ' record(s) uploaded successfully and ' + errorEmpList.length + ' record(s) failed')
        setIsExcelAvailable(true);
    }
    setAttendanceData(errorEmpList);
}

async function createDataForExcel(array) {
    var res = [];
    if (array != null) {
        array.map(x => {
            var vr = {
                'EmployeeType': x.emp.employeeType,
                'EmployeeSubCategory': x.emp.employeeSubCategory,
                'EmployeeDesignation': x.emp.employeeDesignation,
                'EmployeeCode': x.emp.employeeCode,
                'RegistrationNumber': x.emp.registrationNumber,
                'Gender': x.emp.gender,
                'FirstName': x.emp.firstName,
                'LastName': x.emp.lastName,
                'DateOfBirth': x.emp.dateOfBirth,
                'JoiningDate': x.emp.joiningDate,
                'EPFESPS Mode': x.emp.ePFESPSMode,
                'EPFESPS No': x.emp.ePFESPSNo,
                'ContactNumber': x.emp.contactNumber,
                'NIC': x.emp.nIC,
                'Union': x.emp.union,
                'isBCardStatus': x.emp.isBCardStatus,
                '': "               ",
                'error': x.error.error,
            }
            res.push(vr);
        });
        res.push({});
    }
    return res;
}

async function createFile() {
    var file = await createDataForExcel(errorlist);
    var settings = {
        sheetName: 'Failed Employee List',
        fileName: ' Failed Employee List ',
        writeOptions: {}
    }
    let keys = Object.keys(file[0])
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
        tempcsvHeaders.push({ label: sitem, value: sitem })
    })
    let dataA = [
        {
            sheet: 'Failed Employee List',
            columns: tempcsvHeaders,
            content: file
        }
    ]
    xlsx(dataA, settings);
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

function cardTitle(titleName) {
    return (
        <Grid container spacing={1}>
            <Grid item md={10} xs={12}>
                {titleName}
            </Grid>
        </Grid>
    )
}

function handleChange(e) {
    const target = e.target;
    const value = target.value
    if (target.name === "groupID") {
        setAttendanceBulkUpload({
            ...attendanceBulkUpload,
            [e.target.name]: value,
            factoryID: 0
        });
    } else {
        setAttendanceBulkUpload({
            ...attendanceBulkUpload,
            [e.target.name]: value
        });
    }
    clearScreen();
}

function clearScreen() {
    setAttendanceData([]);
    document.querySelector('.csv-input').value = '';
}

function clearData() {
    setIsUploadingFinished(false);
    setIsExcelAvailable(false);
    setAttendanceData([]);
    setAttendanceBulkUpload({
        ...attendanceBulkUpload,
        category: '0',
        divisionID: '0',
        isBCardStatus: '',
    });
    setFileError('');
}

return (
    <Fragment>
        <LoadingComponent />
        <Page className={classes.root} title={title}>
            <Container maxWidth={false}>
                <Formik
                    initialValues={{
                        groupID: attendanceBulkUpload.groupID,
                        factoryID: attendanceBulkUpload.factoryID,
                        category: attendanceBulkUpload.category,
                        divisionID: attendanceBulkUpload.divisionID,
                        isBCardStatus: attendanceBulkUpload.isBCardStatus,
                        unionID: attendanceBulkUpload.unionID
                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                            factoryID: Yup.number().required('Estate is required').min("1", 'Estate is required'),
                            category: Yup.number().required('Category is required').min("1", 'Category is required'),
                            divisionID: Yup.number().required('Division is required').min("1", 'Division is required'),
                        })
                    }
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
                                                        value={attendanceBulkUpload.groupID}
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
                                                        value={attendanceBulkUpload.factoryID}
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
                                                    <InputLabel shrink id="category">
                                                        Category *
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.category && errors.category)}
                                                        fullWidth
                                                        helperText={touched.category && errors.category}
                                                        name="category"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={attendanceBulkUpload.category}
                                                        variant="outlined"
                                                        id="category"
                                                        size='small'
                                                    >
                                                        <MenuItem value="0">--Select Category--</MenuItem>
                                                        <MenuItem value="1">Staff</MenuItem>
                                                        <MenuItem value="2">Labour</MenuItem>
                                                    </TextField>
                                                </Grid>
                                                {attendanceBulkUpload.category === "2" ?
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="divisionID">
                                                            Division *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.divisionID && errors.divisionID)}
                                                            fullWidth
                                                            helperText={touched.divisionID && errors.divisionID}
                                                            name="divisionID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={attendanceBulkUpload.divisionID}
                                                            variant="outlined"
                                                            id="divisionID"
                                                            size='small'
                                                        >
                                                            <MenuItem value="0">--Select Division--</MenuItem>
                                                            {generateDropDownMenu(divisions)}
                                                        </TextField>
                                                    </Grid>
                                                    : null}
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink>
                                                        Select File *
                                                    </InputLabel>
                                                    <CSVReader
                                                        inputStyle={{ width: '100%', height: '56px' }}
                                                        cssClass="react-csv-input"
                                                        onFileLoaded={handleLoaded}
                                                        parserOptions={papaparseOptions}
                                                        inputId="react-csv-reader-input"
                                                        disabled={(attendanceBulkUpload.factoryID != 0 && attendanceBulkUpload.category === "1") || (attendanceBulkUpload.factoryID != 0 && attendanceBulkUpload.divisionID != 0) ? false : true}
                                                    />
                                                    {fileError && (
                                                        <div style={{
                                                            color: "#f44336",
                                                            marginLeft: "14px",
                                                            marginRight: '14px',
                                                            marginTop: "4px",
                                                            fontSize: "0.75rem",
                                                            fontFamily: "Roboto"
                                                        }}>
                                                            {fileError}
                                                        </div>
                                                    )}
                                                    {attendanceBulkUpload.factoryID === 0 && attendanceBulkUpload.divisionID === 0 && (
                                                        <div style={{
                                                            color: "#f44336",
                                                            marginLeft: "14px",
                                                            marginRight: '14px',
                                                            marginTop: "4px",
                                                            fontSize: "0.75rem",
                                                            fontFamily: "Roboto"
                                                        }}>
                                                            Please select a Group, Estate & Division to enable file upload
                                                        </div>
                                                    )}
                                                </Grid>
                                            </Grid>
                                            {attendanceBulkUpload.category === "2" ?
                                                <Grid direction={{ xs: 'column', sm: 'row' }} style={{ marginTop: '10px' }}>
                                                    <Button variant="contained" color='secondary' component="span" style={{ marginRight: '20px', backgroundColor: '#f5bf2c' }}>
                                                        <CSVLink
                                                            data={csvData}
                                                            headers={csvHeaders}
                                                            style={{ color: 'white', backgroundColor: '#f5bf2c' }}
                                                            filename={"Employee Bulk Upload Template.csv"}
                                                        >
                                                            Template
                                                        </CSVLink>
                                                    </Button>
                                                    <Button variant="contained" color='secondary' component="span" style={{ backgroundColor: '#00ab55' }}>
                                                        <CSVLink
                                                            data={csvData2}
                                                            headers={csvHeaders}
                                                            style={{ color: 'white', backgroundColor: '#00ab55' }}
                                                            filename={"Employee Bulk Upload Sample Template.csv"}
                                                        >
                                                            Sample Data
                                                        </CSVLink>
                                                    </Button>
                                                </Grid>
                                                : attendanceBulkUpload.category === "1" ?
                                                    <Grid direction={{ xs: 'column', sm: 'row' }} style={{ marginTop: '10px' }}>
                                                        <Button variant="contained" color='secondary' component="span" style={{ marginRight: '20px', backgroundColor: '#f5bf2c' }}>
                                                            <CSVLink
                                                                data={csvData}
                                                                headers={csvHeaders}
                                                                style={{ color: 'white', backgroundColor: '#f5bf2c' }}
                                                                filename={"Employee Bulk Upload Template.csv"}
                                                            >
                                                                Template
                                                            </CSVLink>
                                                        </Button>
                                                        <Button variant="contained" color='secondary' component="span" style={{ backgroundColor: '#00ab55' }}>
                                                            <CSVLink
                                                                data={csvData3}
                                                                headers={csvHeaders}
                                                                style={{ color: 'white', backgroundColor: '#00ab55' }}
                                                                filename={"Employee Bulk Upload Sample Template.csv"}
                                                            >
                                                                Sample Data
                                                            </CSVLink>
                                                        </Button>
                                                    </Grid>
                                                    : null}
                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                <Button
                                                    color="primary"
                                                    type="reset"
                                                    variant="outlined"
                                                    onClick={() => clearData()}
                                                    size='small'
                                                >
                                                    Clear
                                                </Button>
                                            </Box>
                                            <br />

                                            {attendanceData.length > 0 && IsUploadingFinished === true ?
                                                <CardHeader style={{ marginLeft: '-1rem' }} titleTypographyProps={{ variant: 'h6' }}
                                                    title="Failed Records"
                                                /> : null}

                                            <Box minWidth={1050}>
                                                {attendanceData.length > 0 ?
                                                    <MaterialTable
                                                        title="Multiple Actions Preview"
                                                        columns={[
                                                            {
                                                                title: 'Employee Type',
                                                                field: 'employeeType',
                                                                render: rowData => {
                                                                    if (rowData.employeeType === "N/A") {
                                                                        return (
                                                                            <div
                                                                                style={{
                                                                                    backgroundColor: '#ffcdd2',
                                                                                    padding: '10px',
                                                                                    borderRadius: '5px'
                                                                                }}
                                                                            >
                                                                                <Tooltip title={'Employee Type is Required'}>
                                                                                    <span>{'Employee Type is Required'}</span>
                                                                                </Tooltip>
                                                                            </div>
                                                                        );
                                                                    } else {
                                                                        return rowData.employeeType;
                                                                    }
                                                                }
                                                            },
                                                            {
                                                                title: 'Employee SubCategory',
                                                                field: 'employeeSubCategory',
                                                                render: rowData => {
                                                                    if (rowData.employeeSubCategory === "N/A") {
                                                                        return (
                                                                            <div
                                                                                style={{
                                                                                    backgroundColor: '#ffcdd2',
                                                                                    padding: '10px',
                                                                                    borderRadius: '5px'
                                                                                }}
                                                                            >
                                                                                <Tooltip title={'Employee SubCategory is Required'}>
                                                                                    <span>{'Employee SubCategory is Required'}</span>
                                                                                </Tooltip>
                                                                            </div>
                                                                        );
                                                                    } else {
                                                                        return rowData.employeeSubCategory;
                                                                    }
                                                                }
                                                            },
                                                            {
                                                                title: 'Employee Designation',
                                                                field: 'employeeDesignation',
                                                                render: rowData => {
                                                                    if (rowData.employeeDesignation === "N/A") {
                                                                        return (
                                                                            <div
                                                                                style={{
                                                                                    backgroundColor: '#ffcdd2',
                                                                                    padding: '10px',
                                                                                    borderRadius: '5px'
                                                                                }}
                                                                            >
                                                                                <Tooltip title={'Employee Designation is Required'}>
                                                                                    <span>{'Employee Designation is Required'}</span>
                                                                                </Tooltip>
                                                                            </div>
                                                                        );
                                                                    } else {
                                                                        return rowData.employeeDesignation;
                                                                    }
                                                                }
                                                            },
                                                            {
                                                                title: 'Employee Code',
                                                                field: 'employeeCode',
                                                                render: rowData => {
                                                                    if (rowData.employeeCode === "N/A") {
                                                                        return (
                                                                            <div
                                                                                style={{
                                                                                    backgroundColor: '#ffcdd2',
                                                                                    padding: '10px',
                                                                                    borderRadius: '5px'
                                                                                }}
                                                                            >
                                                                                <Tooltip title={'Employee Code is Required'}>
                                                                                    <span>{'Employee Code is Required'}</span>
                                                                                </Tooltip>
                                                                            </div>
                                                                        );
                                                                    } else {
                                                                        return rowData.employeeCode;
                                                                    }
                                                                }
                                                            },
                                                            {
                                                                title: 'Registration Number',
                                                                field: 'registrationNumber',
                                                                render: rowData => {
                                                                    if (rowData.registrationNumber === "N/A") {
                                                                        return (
                                                                            <div
                                                                                style={{
                                                                                    backgroundColor: '#ffcdd2',
                                                                                    padding: '10px',
                                                                                    borderRadius: '5px'
                                                                                }}
                                                                            >
                                                                                <Tooltip title={'Registration Number is Required'}>
                                                                                    <span>{'Registration Number is Required'}</span>
                                                                                </Tooltip>
                                                                            </div>
                                                                        );
                                                                    } else {
                                                                        return rowData.registrationNumber;
                                                                    }
                                                                }
                                                            },
                                                            {
                                                                title: 'Gender',
                                                                field: 'gender',
                                                                render: rowData => {
                                                                    if (rowData.gender !== "Male" && rowData.gender !== "Female") {
                                                                        return (
                                                                            <div
                                                                                style={{
                                                                                    backgroundColor: '#ffcdd2',
                                                                                    padding: '10px',
                                                                                    borderRadius: '5px'
                                                                                }}
                                                                            >
                                                                                <Tooltip title={'Gender is Required'}>
                                                                                    <span>{'Gender is Required'}</span>
                                                                                </Tooltip>
                                                                            </div>
                                                                        );
                                                                    } else {
                                                                        return rowData.gender;
                                                                    }
                                                                }
                                                            },
                                                            {
                                                                title: 'First Name',
                                                                field: 'firstName',
                                                                render: rowData => {
                                                                    if (rowData.firstName === "N/A") {
                                                                        return (
                                                                            <div
                                                                                style={{
                                                                                    backgroundColor: '#ffcdd2',
                                                                                    padding: '10px',
                                                                                    borderRadius: '5px'
                                                                                }}
                                                                            >
                                                                                <Tooltip title={'First Name is Required'}>
                                                                                    <span>{'First Name is Required'}</span>
                                                                                </Tooltip>
                                                                            </div>
                                                                        );
                                                                    } else {
                                                                        return rowData.firstName;
                                                                    }
                                                                }
                                                            },
                                                            { title: 'Last Name', field: 'lastName' },
                                                            {
                                                                title: 'DateOfBirth',
                                                                field: 'dateOfBirth',
                                                                render: rowData => {
                                                                    if (!regexddmmyyyy.test(rowData.dateOfBirth)) {
                                                                        return (
                                                                            <div
                                                                                style={{
                                                                                    backgroundColor: '#ffcdd2',
                                                                                    padding: '10px',
                                                                                    borderRadius: '5px'
                                                                                }}
                                                                            >
                                                                                <Tooltip title={'Invalid Date Format.'}>
                                                                                    <span>{rowData.dateOfBirth + 'Invalid Date Format.'}</span>
                                                                                </Tooltip>
                                                                            </div>
                                                                        );
                                                                    } else {
                                                                        return rowData.dateOfBirth;
                                                                    }
                                                                }
                                                            },
                                                            {
                                                                title: 'JoiningDate',
                                                                field: 'joiningDate',
                                                                render: rowData => {
                                                                    if (!regexddmmyyyy.test(rowData.joiningDate)) {
                                                                        return (
                                                                            <div
                                                                                style={{
                                                                                    backgroundColor: '#ffcdd2',
                                                                                    padding: '10px',
                                                                                    borderRadius: '5px'
                                                                                }}
                                                                            >
                                                                                <Tooltip title={'Invalid Date Format.'}>
                                                                                    <span>{rowData.joiningDate + 'Invalid Date Format.'}</span>
                                                                                </Tooltip>
                                                                            </div>
                                                                        );
                                                                    } else {
                                                                        return rowData.joiningDate;
                                                                    }
                                                                }
                                                            },
                                                            {
                                                                title: 'EPF/ESPS Mode',
                                                                field: 'ePFESPSMode',
                                                                render: rowData => {
                                                                    if (rowData.ePFESPSMode === "N/A" && rowData.ePFESPSNo !== "N/A") {
                                                                        return (
                                                                            <div
                                                                                style={{
                                                                                    backgroundColor: '#ffcdd2',
                                                                                    padding: '10px',
                                                                                    borderRadius: '5px'
                                                                                }}
                                                                            >
                                                                                <Tooltip title={'EPF/ESPS Mode Required.'}>
                                                                                    <span>{'EPF/ESPS Mode Required.'}</span>
                                                                                </Tooltip>
                                                                            </div>
                                                                        );
                                                                    } else {
                                                                        return rowData.ePFESPSMode
                                                                    }
                                                                }
                                                            },
                                                            {
                                                                title: 'EPF/ESPS No',
                                                                field: 'ePFESPSNo',
                                                                render: rowData => {
                                                                    if (rowData.ePFESPSMode !== "N/A" && rowData.ePFESPSNo === "N/A") {
                                                                        return (
                                                                            <div
                                                                                style={{
                                                                                    backgroundColor: '#ffcdd2',
                                                                                    padding: '10px',
                                                                                    borderRadius: '5px'
                                                                                }}
                                                                            >
                                                                                <Tooltip title={'EPF/ESPS Number Required.'}>
                                                                                    <span>{'EPF/ESPS Number Required.'}</span>
                                                                                </Tooltip>
                                                                            </div>
                                                                        );
                                                                    } else {
                                                                        return rowData.ePFESPSNo
                                                                    }
                                                                }
                                                            },
                                                            {
                                                                title: 'ContactNumber',
                                                                field: 'contactNumber',
                                                                render: rowData => {
                                                                    if (rowData.contactNumber.length !== 9 && rowData.contactNumber.length !== 10 && rowData.contactNumber !== 'N/A') {
                                                                        return (
                                                                            <div
                                                                                style={{
                                                                                    backgroundColor: '#ffcdd2',
                                                                                    padding: '10px',
                                                                                    borderRadius: '5px'
                                                                                }}
                                                                            >
                                                                                <Tooltip title={'Invalid Contact Number.'}>
                                                                                    <span>{rowData.contactNumber + 'Invalid Contact Number.'}</span>
                                                                                </Tooltip>
                                                                            </div>
                                                                        );
                                                                    } else {
                                                                        return rowData.contactNumber;
                                                                    }
                                                                }
                                                            },
                                                            {
                                                                title: 'NIC',
                                                                field: 'nIC',
                                                                render: rowData => {
                                                                    var result = customerData.filter(
                                                                        a => a.nIC === rowData.nIC
                                                                    );
                                                                    const isValidNIC = /^(\d{12}|\d{9}[VvXx])$/.test(rowData.nIC);
                                                                    if (!isValidNIC) {
                                                                        return (
                                                                            <div
                                                                                style={{
                                                                                    backgroundColor: '#ffcdd2',
                                                                                    padding: '10px',
                                                                                    borderRadius: '5px'
                                                                                }}
                                                                            >
                                                                                <Tooltip title={'Invalid NIC.'}>
                                                                                    <span>{rowData.nIC + 'Invalid NIC.'}</span>
                                                                                </Tooltip>
                                                                            </div>
                                                                        );
                                                                    } else if (result.length > 1) {
                                                                        return (
                                                                            <div
                                                                                style={{
                                                                                    backgroundColor: '#ffcdd2',
                                                                                    padding: '10px',
                                                                                    borderRadius: '5px'
                                                                                }}
                                                                            >
                                                                                <Tooltip title={'Duplicate NIC.'}>
                                                                                    <span>{'Duplicate NIC.'}</span>
                                                                                </Tooltip>
                                                                            </div>
                                                                        );
                                                                    } else {
                                                                        return rowData.nIC;
                                                                    }
                                                                }
                                                            },
                                                            { title: 'Union', field: 'union' },
                                                            { title: 'isBCardStatus', field: 'isBCardStatus' },
                                                        ]}
                                                        data={attendanceData}
                                                        options={{
                                                            exportButton: false,
                                                            showTitle: false,
                                                            headerStyle: { textAlign: "left", height: '1%' },
                                                            cellStyle: { textAlign: "left" },
                                                            columnResizable: false,
                                                            actionsColumnIndex: -1,
                                                            pageSize: 5
                                                        }}
                                                        actions={[

                                                        ]}
                                                    /> : null}
                                            </Box>
                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                {isExcelAvailable ?
                                                    <Button
                                                        color="error"
                                                        id="btnRecord"
                                                        variant="contained"
                                                        style={{ marginRight: '1rem', color: 'white', backgroundColor: '#781515' }}
                                                        className={classes.colorRecord}
                                                        onClick={createFile}
                                                        size='large'
                                                    >
                                                        Errors
                                                    </Button>
                                                    : null}
                                                {attendanceData.length > 0 ?
                                                    <Button
                                                        color="primary"
                                                        type="submit"
                                                        variant="contained"
                                                        style={{ marginRight: '1rem' }}
                                                        onClick={() => (trackPromise(saveEmployeeAttendance()))}
                                                        size=''
                                                    >
                                                        Upload
                                                    </Button>
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
        </Page>
    </Fragment >
)
}
