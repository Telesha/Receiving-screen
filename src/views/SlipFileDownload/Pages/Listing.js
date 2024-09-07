import React, { useState, useEffect, Fragment } from 'react';
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
    InputLabel
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import { LoadingComponent } from '../../../utils/newLoader';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from "yup";
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import moment from 'moment';
import MaterialTable from "material-table";
import GetAppIcon from '@material-ui/icons/GetApp';
import { useAlert } from "react-alert";
import tokenDecoder from '../../../utils/tokenDecoder';

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

const screenCode = 'SLIPFILEDOWNLOAD';

export default function InquiryRegistry(props) {
    const [title, setTitle] = useState("SLIP File Download")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [slipFileData, setSlipFileData] = useState([]);
    const [slipFileDetails, setSlipFileDetails] = useState({
        groupID: '0',
        factoryID: '0',
        month: '',
        year: ''
    })
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });
    const alert = useAlert();
    const navigate = useNavigate();

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission());
    }, []);

    useEffect(() => {
        trackPromise(getFactoriesForDropDown());
    }, [slipFileDetails.groupID]);


    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWSLIPFILEDOWNLOAD');



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

        setSlipFileDetails({
            ...slipFileDetails,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }
    async function getFactoriesForDropDown() {
        const factory = await services.getFactoryByGroupID(slipFileDetails.groupID);
        setFactories(factory);
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

    async function GetDetails() {
        let model = {
            groupID: parseInt(slipFileDetails.groupID),
            factoryID: parseInt(slipFileDetails.factoryID),
            applicableMonth: slipFileDetails.month,
            applicableYear: slipFileDetails.year
        }

        const slipData = await services.GetSLIPFileDetails(model);
        if (slipData.statusCode == "Success" && slipData.data != null) {
            setSlipFileData(slipData.data);
        }
        else {
            alert.error("Error");
        }
    }

    async function DownloadSLIPFile(data) {
        let slipFileID = data

        let updateModel = {
            slipFileGeneratedID: slipFileID,
            modifiedBy: tokenDecoder.getUserIDFromToken()
        }

        const approveObject = await services.DownloadSLIPFile(updateModel);

        if (approveObject.statusCode == "Success") {
            alert.success("Successfully Downloaded");
        }
        else {
            alert.error("Error");
        }
    }

    function handleDateChange(date) {
        var month = date.getUTCMonth() + 1; //months from 1-12
        var year = date.getUTCFullYear();
        var currentmonth = moment().format('MM');
        setSlipFileDetails({
            ...slipFileDetails,
            month: month.toString(),
            year: year.toString()
        });

        if (selectedDate != null) {

            var prevMonth = selectedDate.getUTCMonth() + 1
            var prevyear = selectedDate.getUTCFullYear();

            if ((prevyear == year && prevMonth != month) || (prevyear != year)) {
                setSelectedDate(date)

            }
        } else {
            setSelectedDate(date)
        }
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
        setSlipFileDetails({
            ...slipFileDetails,
            [e.target.name]: value
        });
    }



    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: slipFileDetails.groupID,
                            factoryID: slipFileDetails.factoryID
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group required').min("1", 'Group required'),
                                factoryID: Yup.number().required('Factory required').min("1", 'Factory required')
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
                                                    <Grid item md={4} xs={8}>
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
                                                            value={slipFileDetails.groupID}
                                                            variant="outlined"
                                                            id="groupID"
                                                            size='small'
                                                            disabled={!permissionList.isGroupFilterEnabled}
                                                        >
                                                            <MenuItem value="0">--Select Group--</MenuItem>
                                                            {generateDropDownMenu(groups)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={4} xs={8}>
                                                        <InputLabel shrink id="factoryID">
                                                            Factory *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.factoryID && errors.factoryID)}
                                                            fullWidth
                                                            helperText={touched.factoryID && errors.factoryID}
                                                            name="factoryID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={slipFileDetails.factoryID}
                                                            variant="outlined"
                                                            size='small'
                                                            id="factoryID"
                                                            disabled={!permissionList.isFactoryFilterEnabled}
                                                        >
                                                            <MenuItem value="0">--Select Factory--</MenuItem>
                                                            {generateDropDownMenu(factories)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={4} xs={8}>
                                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                            <DatePicker
                                                                autoOk
                                                                variant="inline"
                                                                openTo="month"
                                                                views={["year", "month"]}
                                                                label="Year and Month *"
                                                                helperText="Select applicable month"
                                                                value={selectedDate}
                                                                size='small'
                                                                disableFuture={true}
                                                                onChange={(date) => handleDateChange(date)}
                                                            />
                                                        </MuiPickersUtilsProvider>
                                                    </Grid>

                                                    <Grid container justify="flex-end">
                                                        <Box pr={2}>
                                                            <Button
                                                                color="primary"
                                                                variant="contained"
                                                                type="submit"
                                                                onClick={() =>trackPromise(GetDetails())}
                                                                size='small'
                                                            >
                                                                Search
                                                            </Button>
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                                <br />
                                                <Box minWidth={1050}>
                                                    {slipFileData.length > 0 ?
                                                        <MaterialTable
                                                            title="Multiple Actions Preview"
                                                            columns={[
                                                                { title: 'Group', field: 'groupName' },
                                                                { title: 'Factory', field: 'factoryName' },
                                                                { title: 'Bank', field: 'bankName' },
                                                                { title: 'Applicable Year', field: 'applicableYear' },
                                                                { title: 'Applicable Month', field: 'applicableMonth' },
                                                                { title: 'FilePath', field: 'filePath' },
                                                                {
                                                                    title: 'Action', field: 'filedata',
                                                                    render: rowData => <Button

                                                                        color="primary"
                                                                        variant="contained"
                                                                        style={{ textTransform: 'none' }}
                                                                        size="small"
                                                                        href={"data:text/plain;base64," + rowData.filedata}
                                                                        target="_blank"
                                                                        download
                                                                        startIcon={<GetAppIcon />}
                                                                        onClick={() => DownloadSLIPFile(rowData.slipFileGeneratedID)}

                                                                    >
                                                                        Download
                                                                    </Button>
                                                                }
                                                            ]}
                                                            data={slipFileData}
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

                                                            ]}
                                                        /> : null}
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
        </Fragment>
    )

}