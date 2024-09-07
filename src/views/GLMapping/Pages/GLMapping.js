import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Box,
    Card,
    Grid,
    Button,
    InputLabel,
    TextField,
    MenuItem,
    makeStyles,
    Container,
    CardHeader,
    CardContent,
    Chip,
    Divider
} from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import tokenDecoder from 'src/utils/tokenDecoder';
import { Formik } from 'formik';
import * as Yup from "yup";
import { LoadingComponent } from 'src/utils/newLoader';
import authService from 'src/utils/permissionAuth';
import tokenService from 'src/utils/tokenDecoder';
import { GLMappingGrid } from './../Components/GLMappingTable';
import { ViewGLMappingPopup } from './../Components/Popup/ViewGLMappingDetailsPopup';


const useStyles = makeStyles((theme) => ({
    root: {
        // flexGrow: 1,
        backgroundColor: theme.palette.background.dark,
        minHeight: '100%',
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3)
    },
    succes: {
        // backgroundColor: "#bbdefb"
        backgroundColor: "#fce3b6"
    },
}));

const screenCode = 'GLMAPPINGLISTING';
export default function GLMappingListing(props) {

    const [GroupList, setGroupList] = useState();
    const [FactoryList, setFactoryList] = useState();
    const [TransactionTypeList, setTransactionTypeList] = useState()
    const [FormDetails, setFormDetails] = useState({
        groupID: tokenDecoder.getGroupIDFromToken(),
        factoryID: tokenDecoder.getFactoryIDFromToken(),
        transactionTypeID: 0,
        entryTypeID: 0,
    });
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: true,
        isFactoryFilterEnabled: true,
        isAddEditEnabled: true,
        isApproveRejectEnabled: true
    });
    const [GLMappingDetailsList, setGLMappingDetailsList] = useState([])
    const [ViewDetilsPopup, setViewDetilsPopup] = useState(false)
    const [AccountNameDetails, setAccountNameDetails] = useState()
    const [PopupTitle, setPopupTitle] = useState("");
    const [PendingRequestCount, setPendingRequestCount] = useState(0)
    const classes = useStyles();
    const navigate = useNavigate();
    const handleClick = () => {
        navigate('/app/glmapping/addEdit/' + btoa("0") + "/" + btoa("0") + "/" + btoa("0"));
    }

    const data = [
        {
            accountName: "sdsdddd",
            entryType: 1
        },
        {
            accountName: "eeeee",
            entryType: 2
        },
        {
            accountName: "sdsdddd",
            entryType: 1
        },
    ]

    async function handleViewOnly(GLData) {
        const result = await GetAccountNameDetailsByTransactionTypeID(GLData.id, FormDetails.groupID, FormDetails.factoryID)
        setPopupTitle(GLData.transactionType + " - " + "GL Accounts")
        setViewDetilsPopup(true)
    }


    useEffect(() => {
        trackPromise(getPermission());
        trackPromise(getAllGroups());
        trackPromise(getFactoryByGroupID(tokenDecoder.getGroupIDFromToken()));
        trackPromise(GetTransactionTypeList());
        trackPromise(GetGLMappingDetailsList(FormDetails.groupID, FormDetails.factoryID, FormDetails.transactionTypeID, FormDetails.entryTypeID)); // change this
    }, [])

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode === 'VIEWGLMAPPING');

        if (isAuthorized === undefined) {
            navigate('/404');
        }

        var isGroupFilterEnabled = permissions.find(p => p.permissionCode === 'GROUPDROPDOWN');
        var isFactoryFilterEnabled = permissions.find(p => p.permissionCode === 'FACTORYDROPDOWN');
        var isAddEditEnabled = permissions.find(p => p.permissionCode === 'ADDEDITGLMAPPING');
        var isApproveRejectEnabled = permissions.find(p => p.permissionCode === 'APPROVEREJECTGLMAPPINGREQUEST');


        setPermissions({
            ...permissionList,
            isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
            isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
            isAddEditEnabled: isAddEditEnabled !== undefined,
            isApproveRejectEnabled: isApproveRejectEnabled !== undefined

        });

        setFormDetails({
            ...FormDetails,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function GetTransactionTypeList() {
        const result = await services.GetTransactionTypeDetails();
        setTransactionTypeList(result)
    }

    async function getAllGroups() {
        var response = await services.GetAllGroups();
        setGroupList(response);
    };

    const loadFactory = (event) => {
        trackPromise(getFactoryByGroupID(event.target.value));
    };

    async function getFactoryByGroupID(groupID) {
        var response = await services.GetFactoryByGroupID(groupID);
        setFactoryList(response);
    };

    async function GetGLMappingDetailsList(groupID, factoryID, trasactionTypeID, entryTypeID) {
        var response = await services.GetGLMappingDetailsByGroupIDAndFactoryID(groupID, factoryID, trasactionTypeID, entryTypeID); 
        setGLMappingDetailsList(response.glMappingDetails);
        setPendingRequestCount(response.pendingCount)
        let status = response.glMappingDetails.filter(x => x.statusID == 1)
        setPendingRequestCount(status.length)
    }

    async function SearchGLMappingDetails() {
        trackPromise(GetGLMappingDetailsList(FormDetails.groupID, FormDetails.factoryID, FormDetails.transactionTypeID, FormDetails.entryTypeID));
    }

    async function GetAccountNameDetailsByTransactionTypeID(transactionTypeID, groupID, factoryID) {
        const result = await services.GetAccountNameDetailsByTransactionTypeID(transactionTypeID, groupID, factoryID)
        setAccountNameDetails(result)
        return result;
    }

    function cardTitle(titleName) {
        return (
            <Grid container spacing={1}>
                <Grid item md={10} xs={12}>
                    {titleName}
                </Grid>
                <Grid item md={2} xs={12}>
                    <PageHeader
                        isEdit={true}
                        onClick={handleClick}
                        toolTiptitle={"Add GL Mapping"}
                    />
                </Grid>
            </Grid>
        )
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

    function handleChange1(e) {
        const target = e.target;
        const value = target.value
        setFormDetails({
            ...FormDetails,
            [e.target.name]: parseInt(value)
        });
    }

    function generateTransactionTypeDropDownMenu(data) {
        let items = []
        if (data != null) {
            for (const object of TransactionTypeList) {
                items.push(<MenuItem key={object.transactionTypeID} value={object.transactionTypeID}>{object.transactionTypeName}</MenuItem>);
            }
        }
        return items
    }

    return (
        <Page
            className={classes.root}
            title="GL Mapping"
        >
            <LoadingComponent />
            <Container maxWidth={false}>
                <Box mt={0}>
                    <Card>
                        <CardHeader
                            title={cardTitle("GL Mapping")}
                        />
                        <PerfectScrollbar>
                            <Divider />
                            <CardContent>
                                <Formik
                                    initialValues={{
                                        groupID: FormDetails.groupID,
                                        factoryID: FormDetails.factoryID,
                                        transactionTypeID: FormDetails.transactionTypeID,
                                        entryTypeID: FormDetails.entryTypeID
                                    }}
                                    validationSchema={
                                        Yup.object().shape({
                                            groupID: Yup.number().min(1, "Please Select a Group").required('Group is required'),
                                            factoryID: Yup.number().min(1, "Please Select a Estate").required('Estate is required')
                                        })
                                    }
                                    enableReinitialize
                                    onSubmit={(SearchGLMappingDetails)}
                                >
                                    {({
                                        errors,
                                        handleBlur,
                                        handleSubmit,
                                        touched,
                                        values,
                                        isSubmitting
                                    }) => (
                                        <form onSubmit={handleSubmit}>
                                            <Box mt={0}>
                                                <Grid container spacing={1}>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="groupID">
                                                            Group *
                                                        </InputLabel>

                                                        <TextField select
                                                            fullWidth
                                                            size='small'
                                                            name="groupID"
                                                            onChange={(e) => {
                                                                handleChange1(e)
                                                                loadFactory(e)
                                                            }}
                                                            value={FormDetails.groupID}
                                                            variant="outlined"
                                                            id="groupID"
                                                            disabled={!permissionList.isGroupFilterEnabled}
                                                        >
                                                            <MenuItem value={'0'} disabled={true}>
                                                                --Select Group--
                                                            </MenuItem>
                                                            {generateDropDownMenu(GroupList)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="factoryID">
                                                          Estate *
                                                        </InputLabel>

                                                        <TextField select
                                                            fullWidth
                                                            size='small'
                                                            name="factoryID"
                                                            onChange={(e) => {
                                                                handleChange1(e)
                                                            }}
                                                            value={FormDetails.factoryID}
                                                            variant="outlined"
                                                            id="factoryID"
                                                            disabled={!permissionList.isFactoryFilterEnabled}
                                                        >
                                                            <MenuItem value={'0'} disabled={true}>
                                                                --Select Estate--
                                                            </MenuItem>
                                                            {generateDropDownMenu(FactoryList)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="transactionTypeID">
                                                            Transaction Type
                                                        </InputLabel>

                                                        <TextField select
                                                            fullWidth
                                                            size='small'
                                                            name="transactionTypeID"
                                                            onChange={(e) => {
                                                                handleChange1(e)
                                                            }}
                                                            value={FormDetails.transactionTypeID}
                                                            variant="outlined"
                                                            id="transactionTypeID"
                                                        >
                                                            <MenuItem value={'0'} disabled={true}>
                                                                --Select Transaction Type--
                                                            </MenuItem>
                                                            {generateTransactionTypeDropDownMenu(TransactionTypeList)}
                                                        </TextField>
                                                    </Grid>
                                                </Grid>

                                                <Box display="flex" justifyContent="flex-end" p={2}>
                                                    <Button
                                                        color="primary"
                                                        type="submit"
                                                        variant="contained"
                                                        size="small"
                                                    >
                                                        Search
                                                    </Button>
                                                </Box>
                                                {
                                                    PendingRequestCount > 0 ?
                                                        <Grid item xs={2} >
                                                            <Chip className={classes.succes} label={PendingRequestCount + " Pending Requests"} />
                                                        </Grid> : null
                                                }

                                                <br />
                                                {
                                                    GLMappingDetailsList.length > 0 ?
                                                        < GLMappingGrid
                                                            FormDetails={FormDetails}
                                                            handleViewOnly={handleViewOnly}
                                                            GLMapingDataList={GLMappingDetailsList}
                                                            permissionList={permissionList}
                                                        /> : null
                                                }

                                                <ViewGLMappingPopup
                                                    PopupTitle={PopupTitle}
                                                    ViewDetilsPopup={ViewDetilsPopup}
                                                    setViewDetilsPopup={setViewDetilsPopup}
                                                    GLMapingAccountDataList={AccountNameDetails}
                                                />

                                            </Box>
                                        </form>
                                    )}
                                </Formik>
                            </CardContent>
                        </PerfectScrollbar>
                    </Card>
                </Box>
            </Container>
        </Page>
    )
}