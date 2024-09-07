import React, { useState, useEffect, Fragment, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Button, Card, makeStyles, Container, CardHeader, CardContent, Divider, MenuItem, Grid, InputLabel, TextField, IconButton, DialogContentText, Typography } from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder'
import { LoadingComponent } from './../../../utils/newLoader';
import MaterialTable from "material-table";
import { useAlert } from "react-alert";
import ReactToPrint from "react-to-print";
import CreatePDF from './CreatePDF';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import xlsx from 'json-as-xlsx';
import moment from 'moment';

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

const screenCode = 'CHECKROLLADVANCEADVANCEISSUERECOVER';

export default function CheckRollAdvanceissuerecoverListing() {
    const [title, setTitle] = useState("Advance Listing");
    const classes = useStyles();
    const componentRef = useRef();
    const [GroupList, setGroupList] = useState([]);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [FactoryList, setFactoryList] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [advanceIssueDetailList, setAdvanceIssueDetailList] = useState([]);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const [selectedAdvanceIssueID, setSelectedAdvanceIssueID] = useState(null);
    const [csvHeaders, SetCsvHeaders] = useState([]);
    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupName: "0",
        factoryName: "0",
        divisionName: "0",
        fromDate: '',
        toDate: ''
    });
    const [advanceIssue, setAdvanceIssue] = useState({
        groupID: 0,
        factoryID: 0,
        divisionID: 0,
        regNumber: '',
        fromDate: new Date().toISOString().substring(0, 10),
        toDate: new Date().toISOString().substring(0, 10)
    });
    const [isTableHide, setIsTableHide] = useState(false);
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });

    const open = Boolean(anchorEl);
    const alert = useAlert();
    const navigate = useNavigate();
    let encrypted = "";
    const handleClick = () => {
        encrypted = btoa('0');
        navigate('/app/checkrolladvanceissuerecover/add/' + encrypted)
    }

    const handleClickEdit = (advanceIssueID) => {
        encrypted = btoa(advanceIssueID);
        navigate('/app/checkrolladvanceissuerecover/add/' + encrypted);
    }

    useEffect(() => {
        trackPromise(
            getPermission());
        trackPromise(
            getGroupsForDropdown());
    }, []);

    useEffect(() => {
        if (advanceIssue.groupID > 0) {
            trackPromise(
                getFactoriesForDropdown());
        }
    }, [advanceIssue.groupID]);

    useEffect(() => {
        trackPromise(
            getDivisionDetailsByEstateID());
    }, [advanceIssue.factoryID]);

    useEffect(() => {
        setAdvanceIssue({
            ...advanceIssue,
            regNumber: ''
        })
    }, [advanceIssue.divisionID]);

    useEffect(() => {
        setIsTableHide(false);
    }, [advanceIssue.regNumber, advanceIssue.divisionID]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWCHECKROLLADVANCEADVANCEISSUERECOVER');
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
        setAdvanceIssue({
            ...advanceIssue,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroupList(groups);
    }

    async function getFactoriesForDropdown() {
        const factories = await services.getFactoryByGroupID(advanceIssue.groupID);
        setFactoryList(factories);
    }

    async function getDivisionDetailsByEstateID() {
        var response = await services.getDivisionDetailsByEstateID(advanceIssue.factoryID);
        setDivisions(response);
    };

    async function GetDetails() {
        let model = {
            groupID: parseInt(advanceIssue.groupID),
            factoryID: parseInt(advanceIssue.factoryID),
            divisionID: advanceIssue.divisionID == 0 ? null : parseInt(advanceIssue.divisionID),
            registrationNumber: advanceIssue.regNumber,
            startDate: moment(advanceIssue.fromDate.toString()).format('').split('T')[0],
            endDate: moment(advanceIssue.toDate.toString()).format('').split('T')[0]
        };
        getSelectedDropdownValuesForReport(model);

        const routeData = await services.GetAdvanceAmountDetails(model);
        if (routeData.statusCode == "Success" && routeData.data != null) {
            setAdvanceIssueDetailList(routeData.data);
            createDataForExcel(routeData.data)
            setIsTableHide(true);
            if (routeData.data.length == 0) {
                alert.error("No records to display");
            }
        }
        else {
            alert.error(routeData.message);
        }
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        var fromDate = moment(searchForm.fromDate).format().split('T')[0]
        var toDate = moment(searchForm.toDate).format().split('T')[0]

        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: GroupList[searchForm.groupID],
            factoryName: FactoryList[searchForm.factoryID],
            divisionName: divisions[searchForm.divisionID],
            startDate: [fromDate],
            endDate: [toDate]
        });
    }

    async function createDataForExcel(array) {
        var res = [];
        if (array != null) {
            array.map(x => {
                var vr = {
                    'Date': x.createdDate.split('T')[0],
                    'Employee Number': x.registrationNumber,
                    'Employee Name': x.firstName,
                    'Advance Amount (Rs.)': x.advanceAmount
                }
                res.push(vr);
            });
            res.push({});
            var vr = {
                'Date': "Group : " + selectedSearchValues.groupName,
                'Employee Number': "Estate : " + selectedSearchValues.factoryName,
                'Employee Name': "Division : " + selectedSearchValues.divisionName,
                'Advance Amount (Rs.)': "From Date : " + advanceIssue.fromDate
            }
            res.push(vr);
            var vr = {
                'Advance Amount (Rs.)': "To Date : " + advanceIssue.toDate
            }
            res.push(vr);
        }

        return res;
    }

    async function createFile() {
        var file = await createDataForExcel(advanceIssueDetailList);
        var settings = {
            sheetName: 'Advance Details',
            fileName: 'Advance Details' + ' - ' + selectedSearchValues.divisionName,
            writeOptions: {}
        }
        let keys = Object.keys(file[0])
        let tempcsvHeaders = csvHeaders;
        keys.map((sitem, i) => {
            tempcsvHeaders.push({ label: sitem, value: sitem })
        })
        let dataA = [
            {
                sheet: 'Advance Details',
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
        return items;
    }

    function handleChange(e) {
        const target = e.target;
        const value = target.value
        setAdvanceIssue({
            ...advanceIssue,
            [e.target.name]: value
        });
    }

    async function handleClickDelete(advanceIssueID) {
        setSelectedAdvanceIssueID(advanceIssueID);
        setDeleteConfirmationOpen(true);
    }

    const handleConfirmDelete = async () => {
        setDeleteConfirmationOpen(false);

        const res = await services.DeleteAdvanceDetails(selectedAdvanceIssueID);

        if (res.statusCode === "Success") {
            alert.success(res.message);
            trackPromise(GetDetails());
        } else {
            alert.error(res.message);
        }
    };

    const handleCancelDelete = () => {
        setDeleteConfirmationOpen(false);
    };

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
                        toolTiptitle={"Add Advance"}
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
                            groupID: advanceIssue.groupID,
                            factoryID: advanceIssue.factoryID,
                            divisionID: advanceIssue.divisionID
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
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
                                        <CardHeader title={cardTitle(title)} />
                                        <PerfectScrollbar>
                                            <Divider />
                                            <CardContent>
                                                <Grid container spacing={3}>
                                                    <Grid item md={3} xs={8}>
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
                                                            value={advanceIssue.groupID}
                                                            variant="outlined"
                                                            id="groupID"
                                                            size='small'
                                                            disabled={!permissionList.isGroupFilterEnabled}
                                                        >
                                                            <MenuItem value="0">--Select Group--</MenuItem>
                                                            {generateDropDownMenu(GroupList)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={3} xs={8}>
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
                                                            value={advanceIssue.factoryID}
                                                            variant="outlined"
                                                            id="factoryID"
                                                            size='small'
                                                            disabled={!permissionList.isFactoryFilterEnabled}
                                                        >
                                                            <MenuItem value="0">--Select Factory--</MenuItem>
                                                            {generateDropDownMenu(FactoryList)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="divisionID">
                                                            Division *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.divisionID && errors.divisionID)}
                                                            fullWidth
                                                            helperText={touched.divisionID && errors.divisionID}
                                                            name="divisionID"
                                                            size='small'
                                                            onBlur={handleBlur}
                                                            onChange={(e) => {
                                                                handleChange(e);
                                                            }}
                                                            value={advanceIssue.divisionID}
                                                            variant="outlined"
                                                            id="divisionID"
                                                        >
                                                            <MenuItem value={0}>--Select Division--</MenuItem>
                                                            {generateDropDownMenu(divisions)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="regNumber">
                                                            Employee Number
                                                        </InputLabel>
                                                        <TextField
                                                            fullWidth
                                                            name="regNumber"
                                                            onChange={(e) => handleChange(e)}
                                                            value={advanceIssue.regNumber}
                                                            variant="outlined"
                                                            id="regNumber"
                                                            size="small"
                                                        >
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={8}>
                                                        <InputLabel shrink id="fromDate">
                                                            From Date *
                                                        </InputLabel>
                                                        <TextField
                                                            fullWidth
                                                            name="fromDate"
                                                            type='date'
                                                            onChange={(e) => handleChange(e)}
                                                            value={advanceIssue.fromDate}
                                                            variant="outlined"
                                                            id="fromDate"
                                                            size='small'
                                                            inputProps={{ max: new Date().toISOString().split('T')[0] }}
                                                        />
                                                    </Grid>
                                                    <Grid item md={3} xs={8}>
                                                        <InputLabel shrink id="toDate">
                                                            To Date *
                                                        </InputLabel>
                                                        <TextField
                                                            fullWidth
                                                            name="toDate"
                                                            type='date'
                                                            onChange={(e) => handleChange(e)}
                                                            value={advanceIssue.toDate}
                                                            variant="outlined"
                                                            id="toDate"
                                                            size='small'
                                                            inputProps={{ max: new Date().toISOString().split('T')[0] }}
                                                        />
                                                    </Grid>
                                                </Grid>
                                                <Box display="flex" flexDirection="row-reverse" p={2} >
                                                    <Button
                                                        color="primary"
                                                        type="submit"
                                                        variant="contained"
                                                        size='small'
                                                        onClick={() => (GetDetails())}
                                                    >
                                                        Search
                                                    </Button>
                                                </Box>
                                            </CardContent>
                                            <Box minWidth={1000}>
                                                {advanceIssueDetailList.length > 0 && isTableHide ? (
                                                    <MaterialTable
                                                        title="Multiple Actions Preview"
                                                        columns={[
                                                            { title: 'Date', field: 'createdDate', render: rowData => rowData.createdDate.split('T')[0] },
                                                            { title: 'Employee Number', field: 'registrationNumber' },
                                                            { title: 'Employee Name', field: 'firstName' },
                                                            {
                                                                title: 'Advance Amount (Rs.)', field: 'advanceAmount',
                                                                cellStyle: {
                                                                    textAlign: 'right',
                                                                    paddingRight: '125px',
                                                                },
                                                            },
                                                        ]}
                                                        data={advanceIssueDetailList}
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
                                                                icon: 'mode',
                                                                tooltip: 'Edit',
                                                                onClick: (event, rowData) => handleClickEdit(rowData.advanceIssueID)
                                                            },
                                                            {
                                                                icon: 'delete',
                                                                tooltip: 'Delete',
                                                                onClick: (event, rowData) => handleClickDelete(rowData.advanceIssueID)
                                                            }
                                                        ]}
                                                    />
                                                ) : null}
                                                <Dialog open={deleteConfirmationOpen} onClose={handleCancelDelete}>
                                                    <DialogTitle id="alert-dialog-slide-title">
                                                        <Typography
                                                            color="textSecondary"
                                                            gutterBottom
                                                            variant="h3">
                                                            <Box textAlign="center">
                                                                Delete Confirmation
                                                            </Box>
                                                        </Typography>
                                                    </DialogTitle>
                                                    <DialogContent>
                                                        <DialogContentText id="alert-dialog-slide-description">
                                                            <Typography variant="h4">Are you sure want to delete this record ?</Typography>
                                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                            <br />
                                                        </DialogContentText>
                                                    </DialogContent>
                                                    <DialogActions>
                                                        <Button onClick={handleConfirmDelete} color="primary">
                                                            Delete
                                                        </Button>
                                                        <Button onClick={handleCancelDelete} color="primary">
                                                            Cancel
                                                        </Button>

                                                    </DialogActions>
                                                </Dialog>
                                                {advanceIssueDetailList.length > 0 && isTableHide ?
                                                    <Box display="flex" justifyContent="flex-end" p={2}>
                                                        <Button
                                                            color="primary"
                                                            id="btnRecord"
                                                            type="submit"
                                                            variant="contained"
                                                            style={{ marginRight: '1rem', backgroundColor: 'green' }}
                                                            className={classes.colorRecord}
                                                            onClick={() => createFile()}
                                                        >
                                                            EXCEL
                                                        </Button>
                                                        <ReactToPrint
                                                            documentTitle={"Advance Issue Signature Sheet"}
                                                            trigger={() => <Button
                                                                color="primary"
                                                                id="btnRecord"
                                                                type="submit"
                                                                variant="contained"
                                                                style={{ marginRight: '1rem', backgroundColor: 'red' }}
                                                                className={classes.colorCancel}
                                                            >
                                                                PDF
                                                            </Button>}
                                                            content={() => componentRef.current}
                                                        />
                                                        <div hidden={true}>
                                                            <CreatePDF ref={componentRef}
                                                                advanceIssue={advanceIssue} searchData={selectedSearchValues} advanceIssueDetailList={advanceIssueDetailList}
                                                            />
                                                        </div>
                                                    </Box> : null}
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
}
