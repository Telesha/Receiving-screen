import React, { useState, useEffect, Fragment } from 'react';
import {
    Box,
    Card,
    makeStyles,
    Container,
    Divider,
    CardContent,
    Grid,
    TextField,
    MenuItem,
    InputLabel,
    CardHeader,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { LoadingComponent } from 'src/utils/newLoader';
import { useAlert } from "react-alert";
import PageHeader from 'src/views/Common/PageHeader';
import { Formik } from 'formik';
import * as Yup from "yup";
import MaterialTable from 'material-table';

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
    succes: {
        backgroundColor: "#fce3b6",
        marginLeft: "15px",
        marginBottom: "5px"
    }
}));

const screenCode = 'CHILDHEADERTYPE';

export default function ChildHeaderType() {
    const [title, setTitle] = useState("Child Header Type");
    const classes = useStyles();
    const alert = useAlert();
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });
    const [groups, setGroups] = useState([]);
    
    const [allowanceData, setAllowanceData] = useState([]);
    const [isShowTable, setIsShowTable] = useState(false);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const [childHeaderType, setChildHeaderType] = useState({
        groupID: '0',
        
        allowanceTypeID: '0',
    })
    const [isDisable, setIsDisable] = useState(false);
    const navigate = useNavigate();
    const [page, setPage] = useState(0);
    const [IDDataForDefaultLoad, setIsIDDataForDefaultLoad] = useState(null);

    let encrypted = "";

    const handleClick = () => {
        encrypted = btoa('0');
        navigate('/app/ChildHeaderType/addEdit/' + encrypted)
    }

    useEffect(() => {
        const IDdata = JSON.parse(
            sessionStorage.getItem('ChildHeaderType-page-search-parameters-id')
        );
        trackPromise(
            getPermission(IDdata),
            getGroupsForDropdown(),
        );
    }, []);

    useEffect(() => {
        sessionStorage.removeItem(
            'ChildHeaderType-page-search-parameters-id'
        );
    }, []);

    useEffect(() => {
        setIsDisable();
    }, [childHeaderType.groupID, ]);

    async function getPermission(IDdata) {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWCHILDHEADERTYPE');

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
        const isInitialLoad = IDdata === null
        if (isInitialLoad) {
            setChildHeaderType({
                ...childHeaderType,
                groupID: parseInt(tokenService.getGroupIDFromToken()),
                
            });
        }
        else {
            setChildHeaderType({
                ...childHeaderType,
                groupID: IDdata.groupID,
                
            });
            setPage(IDdata.page)
            setIsIDDataForDefaultLoad(IDdata)
            loadPreviousData(IDdata);
        }
    }

    async function loadPreviousData(IDdata) {
        let model = {
            groupID: parseInt(IDdata.groupID),
            
        }
        let item = await services.getAllAllowanceDetails(model);
        if (item.data.length !== 0 && item.statusCode === 'Success') {
            setAllowanceData(item.data);
            setIsShowTable(true);
        } else {
            setAllowanceData(item.data);
            alert.error("No Records To Display")
        }
    }
    async function getGroupsForDropdown() {
        const groups = await services.getGroupsForDropdown();
        setGroups(groups);
    }

    async function getAllowancesByGroupIDEstateIDDesignationID() {

        let model = {
            groupID: parseInt(childHeaderType.groupID),
            
        }
        let item = await services.getAllAllowanceDetails(model);
        if (item.data.length !== 0 && item.statusCode === 'Success') {
            setAllowanceData(item.data);
            setIsShowTable(true);

        } else {
            setAllowanceData(item.data);
            alert.error("No Records To Display")
        }
    }

    const handleClickEdit = (childHeaderTypeID) => {
        encrypted = btoa(childHeaderTypeID);
        let modelID = {
            groupID: parseInt(childHeaderType.groupID),
            
            page: page

        };
        sessionStorage.setItem('ChildHeaderType-page-search-parameters-id', JSON.stringify(modelID));
        navigate('/app/ChildHeaderType/addEdit/' + encrypted);
    }

    const handleCancelDelete = () => {
        setDeleteConfirmationOpen(false);
    };

    function handleChange(e) {
        const target = e.target;
        const value = target.value
        setChildHeaderType({
            ...childHeaderType,
            [e.target.name]: value,
        });
        setAllowanceData([]);
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
                <Grid item md={2} xs={12}>
                    <PageHeader
                        onClick={handleClick}
                        isEdit={true}
                        toolTiptitle={"Add Child Header Type"}
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
                            groupID: childHeaderType.groupID,
                            
                        }}

                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                                
                            })
                        }
                        onSubmit={() => trackPromise(getAllowancesByGroupIDEstateIDDesignationID())}
                        enableReinitialize
                    >
                        {({
                            errors,
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
                                            <CardContent style={{ marginBottom: "2rem" }}>
                                                <Grid container spacing={3}>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="groupID">
                                                            Group *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.groupID && errors.groupID)}
                                                            fullWidth
                                                            helperText={touched.groupID && errors.groupID}
                                                            size='small'
                                                            name="groupID"
                                                            onChange={(e) => handleChange(e)}
                                                            value={childHeaderType.groupID}
                                                            variant="outlined"
                                                            id="groupID"
                                                            InputProps={{
                                                                readOnly: !permissionList.isGroupFilterEnabled,
                                                            }} >
                                                            <MenuItem value="0">--Select Group--</MenuItem>
                                                            {generateDropDownMenu(groups)}
                                                        </TextField>
                                                    </Grid>
                                                    </Grid>
                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                    <Button
                                                        color="primary"
                                                        type="submit"
                                                        variant="contained" >
                                                        Search
                                                    </Button>
                                                </Box>
                                            </CardContent>
                                            <Box minWidth={1050}>
                                            {allowanceData.length > 0 && isShowTable ? (
                                                <MaterialTable
                                                    title="Multiple Actions Preview"
                                                    columns={[
                                                        { title: 'Child Header Type Code', field: 'empNo' },
                                                        { title: 'Child Header Name', field: 'employeeName' },
                                                        {
                                                            cellStyle: {
                                                                textAlign: 'right',
                                                                paddingRight: '550px',
                                                            },
                                                            headerStyle: {
                                                                textAlign: 'left',
                                                                paddingRight: '200px',
                                                            },
                                                        },
                                                    ]}
                                                    data={allowanceData}
                                                    options={{
                                                        exportButton: false,
                                                        showTitle: false,
                                                        headerStyle: { textAlign: 'left', height: '1%' },
                                                        cellStyle: { textAlign: 'left' },
                                                        columnResizable: false,
                                                        actionsColumnIndex: -1,
                                                        pageSize: 10,
                                                    }}
                                                    actions={[
                                                        {
                                                            icon: 'mode',
                                                            tooltip: 'Edit',
                                                            onClick: (event, rowData) => handleClickEdit(rowData.childHeaderTypeID),
                                                        },
                                                    ]}
                                                />
                                            ) : null}
                                                    
                                            </Box>
                                            <Dialog open={deleteConfirmationOpen} onClose={handleCancelDelete}>
                                                <DialogTitle>Delete Confirmation</DialogTitle>
                                                <DialogContent>
                                                    <p>Are you sure you want to delete this record ?</p>
                                                </DialogContent>
                                                <DialogActions>
                                                    
                                                    <Button
                                                        onClick={handleCancelDelete} color="primary">
                                                        Cancel
                                                    </Button>
                                                </DialogActions>
                                            </Dialog>
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