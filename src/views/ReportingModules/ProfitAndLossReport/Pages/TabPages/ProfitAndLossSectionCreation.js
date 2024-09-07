import React, { useState, useEffect, Fragment } from 'react';
import { useAlert } from "react-alert";
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Box, Card, Grid, TextField, makeStyles, Button, CardContent, Divider, InputLabel, MenuItem, Chip
} from '@material-ui/core';
import services from '../../Services';
import { trackPromise } from 'react-promise-tracker';
import { Formik } from 'formik';
import * as Yup from "yup";
import authService from '../../../../../utils/permissionAuth';
import tokenService from '../../../../../utils/tokenDecoder';
import { useNavigate, useParams } from 'react-router-dom';
import { LoadingComponent } from '../../../../../utils/newLoader';
import Typography from '@material-ui/core/Typography';
import lodash from 'lodash';
import DeleteIcon from '@material-ui/icons/Delete';
import { AlertDialog } from './../../../../Common/AlertDialog';


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
    colorCancel: {
        backgroundColor: "red",
    },
    colorRecord: {
        backgroundColor: "green",
    },
    bold: {
        fontWeight: 600,
    }

}));

const screenCode = 'PROFITANDLOSSREPORT';

export default function ProfitAndLossSectionCreation(props) {


    const navigate = useNavigate();
    const alert = useAlert();
    const { groupID } = useParams();
    const { factoryID } = useParams();
    const classes = useStyles();
    const [title, setTitle] = useState("Profit & Loss Setup");
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });
    const handleClickNavigate = () => {
        navigate('/app/profitAndLoss/profitAndLossReport');
    }
    const [ProfitAndLossDetails, setProfitAndLossDetails] = useState({
        groupID: 0,
        factoryID: 0,
        parentSectionID: '0',
        subSectionName: ''
    });

    const [ParentSectionNameList, setParentSectionNameList] = useState();
    const [CreatedSectionNameList, setCreatedSectionNameList] = useState();

    const [message, setMessage] = useState("  Are you sure you want to delete?");
    const [EnableConfirmMessage, setEnableConfirmMessage] = useState(false);
    const [SectionIdToRemove, setSectionIdToRemove] = useState(0);

    useEffect(() => {
        trackPromise(getPermission());
        trackPromise(GetParentSectionDetails());
    }, []);

    useEffect(() => {
        const DecryptedGroupID = atob(groupID.toString());
        const DecryptedFactoryID = atob(factoryID.toString());

        setProfitAndLossDetails({
            ...ProfitAndLossDetails,
            groupID: DecryptedGroupID,
            factoryID: DecryptedFactoryID
        })

    }, [])


    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'ENABLEPROFITANDLOSSCONFIGURATION');

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
    }

    async function GetParentSectionDetails() {



        const respose = await services.GetParentSectionDetails(ProfitAndLossDetails.groupID, ProfitAndLossDetails.factoryID)
        setParentSectionNameList(respose)
    }

    async function SaveprofitAndLossSetupDetails() {
        let requestModel = {
            groupID: parseInt(ProfitAndLossDetails.groupID),
            factoryID: parseInt(ProfitAndLossDetails.factoryID),
            parenSectionID: parseInt(ProfitAndLossDetails.parentSectionID),
            subSectionName: ProfitAndLossDetails.subSectionName.toString(),
            createdBy: parseInt(tokenService.getUserIDFromToken()),

        }

        const response = await services.SaveSubSectionCreation(requestModel)

        if (response.statusCode == "Success") {
            trackPromise(GetProfitAndLossCreatedSecctionDetails(ProfitAndLossDetails.parentSectionID))
            alert.success(response.message);
            ClearAllArrays()
        }
        else {
            alert.error(response.message);
        }
    }

    function ClearAllArrays() {
        setProfitAndLossDetails({
            ...ProfitAndLossDetails,
            subSectionName: ''
        });
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
        setProfitAndLossDetails({
            ...ProfitAndLossDetails,
            [e.target.name]: value
        });
    }

    async function GetProfitAndLossCreatedSecctionDetails(parentsectionID) {

        const respose = await services.GetProfitAndLossCreatedSecctionDetails(parentsectionID, ProfitAndLossDetails.groupID, ProfitAndLossDetails.factoryID);
        if (respose.data !== null && respose.data.length > 0) {
            var result = lodash(respose.data)
                .groupBy(x => x.profitAndLossParentSectionName)
                .map((value, key) => ({ profitAndLossParentSectionName: key, dataList: value }))
                .value();
            setCreatedSectionNameList(result)

        } else {
            alert.error("Please configure section names")
            setCreatedSectionNameList([])
        }
    }

    async function HandleDelete(e) {
        setSectionIdToRemove(parseInt(e.toString()))
        setEnableConfirmMessage(true)
    }

    function confirmData(y) {
        if (y) {
            trackPromise(InActiveProfitAndLossSections())
        }
    }

    async function InActiveProfitAndLossSections() {
        let resuestModel = {
            profitAndLossSectionID: parseInt(SectionIdToRemove.toString()),
            modifiedBy: parseInt(await tokenService.getUserIDFromToken().toString())
        }
        const response = await services.InActiveProfitAndLossSections(resuestModel)

        if (response.statusCode == "Success") {
            alert.success(response.message);
            trackPromise(GetProfitAndLossCreatedSecctionDetails(ProfitAndLossDetails.parentSectionID))
        }
        else {
            alert.error(response.message);
        }
    }

    return (
        <Fragment>
            <LoadingComponent />
            <Formik
                initialValues={{
                    parentSectionID: ProfitAndLossDetails.parentSectionID,
                    subSectionName: ProfitAndLossDetails.subSectionName
                }}
                validationSchema={
                    Yup.object().shape({
                        parentSectionID: Yup.number().required('Parent Section Name is required').min("1", 'Parent Section Name is required'),
                        subSectionName: Yup.string().required('Section Name is required'),
                    })
                }
                onSubmit={() => trackPromise(SaveprofitAndLossSetupDetails())}
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
                                <PerfectScrollbar>
                                    <Divider />
                                    <CardContent>
                                        <Grid container spacing={3}>
                                            <Grid item md={4} xs={12}>
                                                <InputLabel shrink id="parentSectionID">
                                                    Parent Section Name *
                                                </InputLabel>
                                                <TextField select
                                                    error={Boolean(touched.parentSectionID && errors.parentSectionID)}
                                                    fullWidth
                                                    helperText={touched.parentSectionID && errors.parentSectionID}
                                                    size='small'
                                                    name="parentSectionID"
                                                    onBlur={handleBlur}
                                                    onChange={(e) => {
                                                        handleChange(e)
                                                        trackPromise(GetProfitAndLossCreatedSecctionDetails(e.target.value))
                                                    }}
                                                    value={ProfitAndLossDetails.parentSectionID}
                                                    variant="outlined"
                                                    id="parentSectionID"
                                                >
                                                    <MenuItem value="0">--Select Parent Section Name--</MenuItem>
                                                    {generateDropDownMenu(ParentSectionNameList)}
                                                </TextField>
                                            </Grid>
                                            <Grid item md={4} xs={12}>
                                                <InputLabel shrink id="subSectionName">
                                                    Section Name *
                                                </InputLabel>
                                                <TextField
                                                    error={Boolean(touched.subSectionName && errors.subSectionName)}
                                                    fullWidth
                                                    helperText={touched.subSectionName && errors.subSectionName}
                                                    size='small'
                                                    name="subSectionName"
                                                    onBlur={handleBlur}
                                                    onChange={(e) => {
                                                        handleChange(e)
                                                    }}
                                                    value={ProfitAndLossDetails.subSectionName}
                                                    variant="outlined"
                                                    id="subSectionName"
                                                />
                                            </Grid>

                                        </Grid>
                                        <Box display="flex" flexDirection="row-reverse" p={2} >
                                            <Button
                                                color="primary"
                                                type="submit"
                                                variant="contained"
                                            >
                                                Create
                                            </Button>
                                        </Box>
                                        <Box style={{ marginTop: '0.5rem', marginLeft: "20%" }}>
                                            {
                                                CreatedSectionNameList !== undefined ?
                                                    CreatedSectionNameList.map((objNew) =>
                                                        <Grid Grid container spacing={1}>
                                                            <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left">
                                                                <Chip label={objNew.profitAndLossParentSectionName} />
                                                            </Typography>
                                                            {
                                                                objNew.dataList !== undefined ?
                                                                    objNew.dataList.map((object) =>
                                                                        <Grid Grid container spacing={1} style={{ marginTop: '0.1rem' }}>
                                                                            <Grid item md={9} xs={12} >
                                                                                <Typography style={{ marginLeft: "15rem" }} align="left">
                                                                                    <Chip
                                                                                        label={object.profitAndLossSectionName}
                                                                                        key={object.profitAndLossSectionID}
                                                                                        variant="outlined"
                                                                                        deleteIcon={
                                                                                            <DeleteIcon
                                                                                                style={{
                                                                                                    color: "red",
                                                                                                    cursor: "pointer"
                                                                                                }}
                                                                                            />
                                                                                        }
                                                                                        onDelete={() => trackPromise(HandleDelete(object.profitAndLossSectionID))}
                                                                                    />
                                                                                </Typography>
                                                                            </Grid>
                                                                        </Grid>
                                                                    )

                                                                    : null
                                                            }
                                                        </Grid>
                                                    )
                                                    : null
                                            }
                                        </Box>

                                        <div hidden={true}>
                                            <Grid item>
                                                <AlertDialog confirmData={confirmData} headerMessage={message} viewPopup={EnableConfirmMessage} setViewPopup={setEnableConfirmMessage} />
                                            </Grid>
                                        </div>

                                    </CardContent>
                                </PerfectScrollbar>
                            </Card>
                        </Box>
                    </form>
                )}
            </Formik>
        </Fragment>
    );

}