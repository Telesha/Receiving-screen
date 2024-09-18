import React, { useState, useEffect, Fragment, useRef } from 'react';
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
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { LoadingComponent } from 'src/utils/newLoader';
import { useAlert } from "react-alert";
import PageHeader from 'src/views/Common/PageHeader';
import DeleteIcon from '@material-ui/icons/Delete';
import { Formik } from 'formik';
import VisibilityIcon from '@material-ui/icons/Visibility';
import * as Yup from "yup";
import { AlertDialogWithoutButton } from '../../Common/AlertDialogWithoutButton';

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

export default function ChildHeaderTypeAddEdit() {
    const [title, setTitle] = useState("Child Header Type");
    const classes = useStyles();
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });
    const [groups, setGroups] = useState([]);
   
    const qtyRef = useRef(null);
    const addButtonRef = useRef(null);
    const [isDisableButton, setIsDisableButton] = useState(false);
    const [isSetDesignation, setIsSetDesignation] = useState(false);
    const [ArrayField, setArrayField] = useState([]);
    const [childHeaderType, setChildHeaderType] = useState({
        groupID: '0',
        childHeaderName: '',
        childHeaderTypeCode: '',
        
    })
    const [accountTypeNames, setAccountTypeNames] = useState();
    const [isUpdate, setIsUpdate] = useState(false);
    const { childHeaderTypeID } = useParams();
    const navigate = useNavigate();
    const alert = useAlert();
    const [dialog, setDialog] = useState(false);
    const handleKeyDown = (event, nextInputRef) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            nextInputRef.current.focus();
        }
    }

    let decrypted = 0;

    const handleKeyDownButton = (event) => {
        if (event.key === 'Enter') {
            saveDetails()
        }
    }

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission());
    }, []);

    useEffect(() => {
        
          trackPromise(getLatestchildHeaderTypeCode());
       
      }, [childHeaderType.groupID]);

    useEffect(() => {
        if (ArrayField.length > 0) {
            setIsSetDesignation(true);
        } else {
            setIsSetDesignation(false);
        }
    }, [ArrayField]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'ADDCHILDHEADERTYPE');

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

        setChildHeaderType({
            ...childHeaderType,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
        });
        getGroupsForDropdown()
    }

    async function getGroupsForDropdown() {
        const groups = await services.getGroupsForDropdown();
        setGroups(groups);
    }

    function handleChange(e) {
        const target = e.target;
        const value = target.value;
        setChildHeaderType({
            ...childHeaderType,
            [e.target.name]: value
        })
    }

   function handleClick() {
        navigate('/app/ChildHeaderType/listing/')
    }

   function handleClick() {

        if (isUpdate == false) {
            if (ArrayField.length != 0) {
                setDialog(true);
            } else {
                navigate('/app/ChildHeaderType/listing/');
            }
        } else {
            navigate('/app/ChildHeaderType/listing/');
        }

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

    async function InactivDetails(row, index) {
        {
            const dataDelete = [...ArrayField];
            const remove = index;
            dataDelete.splice(remove, 1);
            setArrayField([...dataDelete]);
        }
    };

    // async function AddFieldData() {
    //     const isMatch = ArrayField.some(x =>
    //         x.estateID === parseInt(childHeaderType.estateID) &&
    //         x.designationID === parseInt(childHeaderType.designationID) 
            
    //     );
    //     if (isMatch) {
    //         alert.error("The record already exists!")
    //     } else {


    //         let model = {

    //             groupID: childHeaderType.groupID,
    //             childHeaderName: childHeaderType.childHeaderName,
    //             childHeaderTypeCode: childHeaderType.childHeaderTypeCode,
                
    //         }
    //         let response = await services.checkIfAllowanceExists(model);
    //         if (response.statusCode == "Success") {

    //             setIsSetDesignation(true);
    //             var array1 = [...ArrayField];
    //             array1.push({
    //                 groupID: parseInt(childHeaderType.groupID),
                    
    //                 createdBy: parseInt(tokenService.getUserIDFromToken())
    //             });
    //             setArrayField(array1);
    //             setChildHeaderType({
    //                 ...childHeaderType,
                    
    //             });
    //         }
    //         else {
    //             alert.error(response.message);
    //         }
    //     }
    // }
   
   
    async function getLatestchildHeaderTypeCode() {
        if (childHeaderType.factoryID != 0) {
          var result = await services.getLatestchildHeaderTypeCode(childHeaderType.groupID);
    
          if (result === null) {
            setChildHeaderType({ ...childHeaderType, childHeaderTypeCode: '1-00000000', orderNo: 1 });
          } else {
            var splitNum = result.childHeaderTypeCode.split("-")[0];
            setChildHeaderType({ ...childHeaderType, childHeaderTypeCode: `${(parseInt(splitNum) + 1)}-00000000)}` });
          }
        }
      }


    async function confirmRequest() {
        navigate('/app/ChildHeaderType/listing/');
    }

    async function cancelRequest() {
        setDialog(false);
    }

    async function getDetailsByPayRollAllowanceID(payRollAllowanceID) {
        setTitle("Edit Allowance")
        const childHeaderType = await services.getDetailsByPayRollAllowanceID(payRollAllowanceID);
        setIsUpdate(true);
        setChildHeaderType({
            ...childHeaderType,
            groupID: childHeaderType.groupID,
            
            designationWiseAllowanceTypeID: childHeaderType.designationWiseAllowanceTypeID
        });
        
    }
    
    async function saveDetails() {
        // console.log("haaaaaaaaaaaaa")
        if (isUpdate == true) {
            let model = {
                groupID: childHeaderType.groupID,
                childHeaderName: childHeaderType.childHeaderName,
                childHeaderTypeCode: parseFloat(childHeaderType.childHeaderTypeCode),
            }
            let response = await services.UpdatechildHeaderType(model);
            if (response.statusCode == "Success") {
                alert.success(response.message);
                setArrayField([]);
                navigate('/app/childHeaderType/listing');
            } else {
                alert.error(response.message);
            }
     
        } else {
            // console.log("oooooooooo")
            let model = {
                groupID: parseInt(childHeaderType.groupID),
                childHeaderTypeName: childHeaderType.childHeaderName,
                childHeaderTypeCode: childHeaderType.childHeaderTypeCode,
            }
            // console.log(model)
            let response = await services.saveDetails(model);
            
            if (response.statusCode == "Success") {
                alert.success(response.message);
                setIsDisableButton(false);
                setArrayField([]);
                navigate('/app/childHeaderType/listing');
                setIsDisableButton(true);
            }
            else {
                alert.error(response.message);
            }
        }
    }

    async function SaveAccountType() {

        let childModel = {
            groupID: childHeaderType.groupID,
            childHeaderName: childHeaderType.childHeaderName,
            childHeaderTypeCode: parseFloat(childHeaderType.childHeaderTypeCode),
        }
    
        let response = await services.SaveChildHeaderType(childModel);
        if (response.statusCode == "Success") {
          alert.success(response.message);
        //   HandleCreateChildHeaderType();
        }
        else {
          alert.error(response.message);
        }
        clearData();
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
 
    function clearData() {
        setChildHeaderType({
          ...childHeaderType, childHeaderName: '',
          childHeaderTypeCode: '',
          value: '1',
          orderNo: 0,
          accountTypeUniqueCode: 0
        });
      }


    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: childHeaderType.groupID,
                            childHeaderTypeCode: childHeaderType.childHeaderTypeCode,
                            childHeaderName: childHeaderType.childHeaderName,
                            
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group required').min("1", 'Group required'),
                                childHeaderTypeCode: Yup.string().required('child Header Type Code required').min("1", 'child Header Type Code required'),
                                childHeaderName: Yup.string().required('child Header Name required').min("1", 'child Header Name required'),
                                
                            })
                        }
                        validateOnChange={false}
                        validateOnBlur={false}
                        onSubmit={() => SaveAccountType()}
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
                                                <Grid container spacing={2}>
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
                                                                readOnly: !permissionList.isGroupFilterEnabled || isUpdate || isSetDesignation,
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Group--</MenuItem>
                                                            {generateDropDownMenu(groups)}
                                                        </TextField>
                                                        </Grid>
                                                        <Grid item md={4} xs={12}  >
                                                        <InputLabel shrink id="childHeaderTypeCode">
                                                            Child Header Type code *
                                                        </InputLabel>
                                                        <TextField
                                                        error={Boolean(
                                                            touched.childHeaderTypeCode && errors.childHeaderTypeCode
                                                            )}
                                                            helperText={
                                                            touched.childHeaderTypeCode && errors.childHeaderTypeCode
                                                            }
                                                            onBlur={handleBlur}
                                                            name="childHeaderTypeCode"
                                                            onChange={e => handleChange(e)}
                                                            value={childHeaderType.childHeaderTypeCode}
                                                            variant="outlined"
                                                            id="childHeaderTypeCode"
                                                            size="small"
                                                            fullWidth> </TextField>
                                                        </Grid>
                                                
                                                 <Grid item md={4} xs={12}  >
                                                    <InputLabel shrink id="childHeaderName">
                                                        child Header Name *
                                                    </InputLabel>
                                                    <TextField
                                                        error={Boolean(
                                                        touched.childHeaderName && errors.childHeaderName
                                                        )}
                                                        helperText={
                                                        touched.childHeaderName && errors.childHeaderName
                                                        }
                                                        onBlur={handleBlur}
                                                        name="childHeaderName"
                                                        onChange={e => handleChange(e)}
                                                        value={childHeaderType.childHeaderName}
                                                        variant="outlined"
                                                        id="childHeaderName"
                                                        size="small"
                                                        fullWidth>
                                                        </TextField>
                                                        </Grid>
                                                        </Grid>
                                                    <Grid container justify="flex-end" spacing={3}>
                                                    {!isUpdate ?
                                                        <Box pr={2} style={{ marginTop: '20px' }}>
                                                            <Button
                                                                color="primary"
                                                                variant="outlined"
                                                                type="reset"
                                                                onClick={clearData}
                                                                size='small'
                                                            >
                                                                Clear
                                                            </Button>
                                                        </Box>
                                                        : null}
                                                    <Box pr={2} style={{ marginTop: '20px' }}>
                                                        <Button
                                                            color="primary"
                                                            variant="contained"
                                                            size='small'
                                                            onClick={saveDetails}
                                                            // type="submit"
                                                            inputRef={addButtonRef}
                                                            onKeyDown={(e) => handleKeyDownButton(e)}
                                                            disabled={childHeaderType.empName == "" ? true : false}>
                                                            {isUpdate == true ? "Update" : "Save"}
                                                        </Button>
                                                    </Box>
                                                </Grid>
                                            </CardContent>
                                          <Divider />
                                        </PerfectScrollbar>
                                    </Card>
                                </Box>
                                {dialog ?
                                    <AlertDialogWithoutButton confirmData={confirmRequest} cancelData={cancelRequest}
                                        headerMessage={"child Header Type"}
                                        discription={"Added child Header Type Details will be not saved, Are you sure you want to leave?"} />
                                    : null
                                }
                            </form>
                        )}
                    </Formik>
                    {(isUpdate == false) && (ArrayField.length > 0) ?
                        <Box display="flex" justifyContent="flex-end" p={2}>
                           
                        </Box>
                        : null}
                    {isUpdate == true ?
                        <Box display="flex" justifyContent="flex-end" p={2}>
                            
                            
                        </Box>
                        : null}
                </Container>
            </Page>
        </Fragment >
    )
}