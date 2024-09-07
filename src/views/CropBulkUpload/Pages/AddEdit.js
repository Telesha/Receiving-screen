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
import { Formik } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";
import CSVReader from 'react-csv-reader';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import "./style.css";
import { Fragment } from 'react';
import { LoadingComponent } from '../../../utils/newLoader';
import MaterialTable from 'material-table';
import moment from 'moment';
import { isEmpty } from 'lodash';
import { confirmAlert } from 'react-confirm-alert';
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

const screenCode = 'CROPDETAILSBULKUPLOAD';

export default function CropBulkUploadAddEdit(props) {
  const alert = useAlert();
  const classes = useStyles();
  const [formDetails, setFormDetails] = useState({
    groupID: 0,
    factoryID: 0
  });
  const [GroupList, setGroupList] = useState([]);
  const [FactoryList, setFactoryList] = useState([]);
  const [RouteList, setRouteList] = useState([]);
  const [collectionTypeList, setCollectionTypeList] = useState([]);
  const [balancePaymentData, setBalancePaymentData] = useState([]);
  const [cropData, setCropData] = useState([]);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
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
  const handleClose = () => {
  };

  useEffect(() => {
    trackPromise(getPermission());
    trackPromise(getAllGroups());
  }, []);

  useEffect(() => {
    trackPromise(getFactoryByGroupID(formDetails.groupID));
  }, [formDetails.groupID]);

  useEffect(() => {
    trackPromise(getRoutesByGroupID(formDetails.factoryID));
    trackPromise(getCollectionTypeCode(formDetails.factoryID));
    trackPromise(getBalancePaymentDetails(formDetails.groupID, formDetails.factoryID));
  }, [formDetails.factoryID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDCROPDETAILSBULKUPLOAD');

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

    setFormDetails({
      ...formDetails,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  function checkCollectedRouteValidation(collectedRouteCode) {
    return Object.keys(RouteList).find(key => key === collectedRouteCode);
  }

  function checkCollectionTypeValidation(collectionTypeCode) {
    return Object.keys(collectionTypeList).find(key => key === collectionTypeCode);
  }

  async function uploadLeafAmountDetails() {

    var invalidDate = false;
    var isInvalidCollectionType = false;
    var isInvalidCollectedRoute = false;
    var invalidWeight = false;

    cropData.forEach(x => {
      var routeResult = Object.keys(RouteList).find(key => key === x.collectedRouteCode);
      var collectionTypeResult = Object.keys(collectionTypeList).find(key => key === x.collectionTypeCode);

      if (x.status !== "Valid") {
        invalidDate = true;
        return;
      } else if (routeResult === undefined) {
        isInvalidCollectionType = true;
        return;
      } else if (collectionTypeResult === undefined) {
        isInvalidCollectedRoute = true;
        return;
      } else if (isNaN(x.netWeight) || parseFloat(x.netWeight) < 0) {
        invalidWeight = true;
        return;
      }
    })

    if (invalidDate) {
      alert.error("Future dates are not allowing.");
    } else if (isInvalidCollectionType || isInvalidCollectedRoute) {
      alert.error("Invalid collected location or collection type.");
    } else if (invalidWeight) {
      alert.error("Net weight should be a valid number");
    }
    else {
      let object = {
        groupID: parseInt(formDetails.groupID),
        factoryID: parseInt(formDetails.factoryID),
        createdBy: tokenDecoder.getUserIDFromToken(),
        cropUploads: cropData
      };

      if (cropData.length > 0) {
        var response = await services.uploadBulkData(object);
        if (response.statusCode == "Success") {
          alert.success(response.message);
          clearFormFields();
        }
        else {
          alert.error(response.message);
          var copyCropData = cropData;
          copyCropData.forEach(element => {
            var earlierJoining = response.data.find(x => x === element.registrationNumber);
            if (earlierJoining) {
              element.joiningError = true
            }
          });
          setCropData(copyCropData);
        }

      }
    }

  };

  function clearFormFields() {
    setFormDetails({
      ...formDetails,
      leafType: 0,
      rateApplied: 0
    });
    setCropData([]);
    document.querySelector('.csv-input').value = '';
  }

  async function getAllGroups() {
    var response = await services.getAllGroups();
    setGroupList(response);
  };

  async function getFactoryByGroupID(groupID) {
    var response = await services.getFactoryByGroupID(groupID);
    setFactoryList(response);
  };

  async function getRoutesByGroupID(factoryID) {
    var response = await services.getRouteByFactoryID(factoryID);
    setRouteList(response);
  };

  async function getCollectionTypeCode(factoryID) {
    var response = await services.getCollectionTypeByFactoryID(factoryID);
    setCollectionTypeList(response);
  }

  async function getBalancePaymentDetails(groupID, factoryID) {
    var response = await services.getCurrentBalancePaymnetDetail(groupID, factoryID);
    setBalancePaymentData(response);
  }

  const handleForce = (data, fileInfo) => {
    if (cropData.length > 0) {
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

    setCropData([]);
    var extension = fileInfo.name.split(".")[1];

    if (extension.toLowerCase() !== "csv") {
      alert.error("please select csv file");
      document.querySelector('.csv-input').value = '';
    }
    else if (data.length === 0) {
      alert.error("please select csv file with data");
      document.querySelector('.csv-input').value = '';
    }
    else {
      checkTableData(data);
    }
  }

  function checkTableData(data) {
    data.forEach((x, i) => {
      x.id = (i + 1);
      x.collectedRouteCode = x.collectedRouteCode;
      x.collectionTypeCode = x.collectionTypeCode;
      x.status = checkIsMonthValid(x.weightReadTime, x.joiningError);
    });
    setCropData(data);
  }

  function checkIsMonthValid(date, joiningError) {
    var convertedDate = new Date(date);
    var formattedDate = convertedDate.getFullYear() + '' + ((convertedDate.getMonth()+1).toString()).padStart(2, '0');
    var formatteCurrentdDate = new Date().getFullYear() + '' + ((new Date().getMonth()+1).toString()).padStart(2, '0');
    if (joiningError) {
      return "can't upload crop details before the joining date";
    }

    else if (!moment(date, 'M/D/YYYY', true).isValid()) {
      return "Invalid date format"
    }
    else if (Date.parse((new Date().toISOString().split("T")[0]).replaceAll("-", "/")) < Date.parse(date)) {
      return "Invalid date"
    }
    else if (balancePaymentData.lastBalancePaymentSchedule !== null &&
      parseInt(balancePaymentData.lastBalancePaymentSchedule.replaceAll('/', '')) >= parseInt(formattedDate)) {
      return `Balance paymnet is completed for ${moment(date).format("MMMM")} month`
    }
    //  else if (balancePaymentData.firstTransactionDate !== null &&
    //   parseInt(balancePaymentData.firstTransactionDate.replaceAll('/', '')) > parseInt(formattedDate)) {
    //   return `Transaction not permitted for ${moment(date).format("MMMM")} month`
    // } 
    // else if (balancePaymentData.firstTransactionDate === null && balancePaymentData.lastBalancePaymentSchedule === null
    //   && parseInt(formatteCurrentdDate) !== parseInt(formattedDate)) {
    //   return `Transactions not permitted for ${moment(date).format("MMMM")} month`
    // } 

    //********These commented lines for trigger validate 'FirstTransactionDate', but temporary disabled all of these validation********
    else {
      return 'Valid';
    }
  }

  function checkIsMonthValidTable(date, joiningError) {
    var convertedDate = new Date(date);
    var formattedDate = convertedDate.getFullYear() + '' + ((convertedDate.getMonth()+1).toString()).padStart(2, '0');
    var formatteCurrentdDate = new Date().getFullYear() + '' + ((new Date().getMonth()+1).toString()).padStart(2, '0');
    if (joiningError) {
      return false;
    }
    else if (!moment(date, 'M/D/YYYY', true).isValid()) {
      return false;
    }
    else if (Date.parse((new Date().toISOString().split("T")[0]).replaceAll("-", "/")) < Date.parse(date)) {
      return false;
    }
    else if (balancePaymentData.lastBalancePaymentSchedule !== null &&
      parseInt(balancePaymentData.lastBalancePaymentSchedule.replaceAll('/', '')) >= parseInt(formattedDate)) {
      return false;
    }
    // else if (balancePaymentData.firstTransactionDate !== null &&
    //   parseInt(balancePaymentData.firstTransactionDate.replaceAll('/', '')) > parseInt(formattedDate)) {
    //   return false;
    // }
    // else if (balancePaymentData.firstTransactionDate === null && balancePaymentData.lastBalancePaymentSchedule === null
    //   && parseInt(formatteCurrentdDate) !== parseInt(formattedDate)) {
    //   return false;
    // }

    //********These commented lines for trigger validate 'FirstTransactionDate', but temporary disabled all of these validation********
    else {
      return true;
    }
  }
  function handleGroupChange(e) {
    const target = e.target;
    const value = target.value
    setFormDetails({
      ...formDetails,
      groupID: value,
      factoryID: 0
    });
    clearScreen();
  }

  function handleFactoryChange(e) {
    const target = e.target;
    const value = target.value
    setFormDetails({
      ...formDetails,
      factoryID: value
    });
    clearScreen();
  }

  function clearScreen() {
    setCropData([]);
    document.querySelector('.csv-input').value = '';
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

  function clearData() {
    setFormDetails({
      ...formDetails
    });
    setCropData([])
  }
  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={"Crop Details Bulk Upload"}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: formDetails.groupID,
              factoryID: formDetails.factoryID,
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().min(1, "Please Select a Group").required('Group is required'),
                factoryID: Yup.number().min(1, "Please Select a Factory").required('Factory is required'),
              })
            }
            onSubmit={() => trackPromise(uploadLeafAmountDetails())}
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
                      title={cardTitle("Crop Details Bulk Upload")}
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
                              size= 'small'
                              onChange={(e) => {
                                handleGroupChange(e)
                              }}
                              value={formDetails.groupID}
                              variant="outlined"
                              id="groupID"
                              InputProps={{
                                readOnly: !permissionList.isGroupFilterEnabled,
                              }}
                            >
                              <MenuItem value={'0'} disabled={true}>
                                --Select Group--
                              </MenuItem>
                              {generateDropDownMenu(GroupList)}
                            </TextField>

                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="factoryID">
                              Factory *
                            </InputLabel>

                            <TextField select
                              error={Boolean(touched.factoryID && errors.factoryID)}
                              fullWidth
                              helperText={touched.factoryID && errors.factoryID}
                              name="factoryID"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => {
                                handleFactoryChange(e)
                              }}
                              value={formDetails.factoryID}
                              variant="outlined"
                              id="factoryID"
                              InputProps={{
                                readOnly: !permissionList.isFactoryFilterEnabled,
                              }}
                            >
                              <MenuItem value={0} disabled={true}>
                                --Select Factory--
                              </MenuItem>
                              {generateDropDownMenu(FactoryList)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12} >
                            <InputLabel shrink>
                              Select File *
                            </InputLabel>
                            <CSVReader
                              inputStyle={{ width: '95%', height: '54px' }}
                              cssClass="react-csv-input"
                              onFileLoaded={handleForce}
                              parserOptions={papaparseOptions}
                              inputId="react-csv-reader-input"
                            />
                          </Grid>
                        </Grid>
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
                      </CardContent>
                      <Box minWidth={1050}>
                        {cropData.length > 0 ?
                          <MaterialTable
                            title=""
                            columns={[
                              {
                                title: 'Date',
                                field: 'weightReadTime',
                                type: 'date',
                                render: rowData => {
                                  if (!checkIsMonthValidTable(rowData.weightReadTime, rowData.joiningError)) {
                                    return <div style={{ backgroundColor: "#ffcdd2", padding: "10px", borderRadius: "5px" }}><Tooltip title={checkIsMonthValid(rowData.weightReadTime, rowData.joiningError)}>
                                      <span >{isEmpty(rowData.weightReadTime) ? "Empty Date" : rowData.weightReadTime}</span>
                                    </Tooltip></div>
                                  } else {
                                    return rowData.weightReadTime
                                  }
                                },
                              },
                              { title: 'Customer Reg.No', field: 'registrationNumber' },
                              {
                                title: 'Collected location',
                                field: 'collectedRouteCode',
                                lookup: { ...RouteList },
                                render: rowData => {
                                  if (!checkCollectedRouteValidation(rowData.collectedRouteCode)) {
                                    return <div style={{ backgroundColor: "#ffcdd2", padding: "10px", borderRadius: "5px" }}>
                                      <Tooltip title={"Invalid collected location"}>
                                        <span >{RouteList[rowData.collectedRouteCode] ?? "Invalid collected location"}</span>
                                      </Tooltip></div>
                                  } else {
                                    return RouteList[rowData.collectedRouteCode]
                                  }
                                },
                              },
                              {
                                title: 'Collection Type',
                                field: 'collectionTypeCode',
                                lookup: { ...collectionTypeList },
                                render: rowData => {
                                  if (!checkCollectionTypeValidation(rowData.collectionTypeCode)) {
                                    return <div style={{ backgroundColor: "#ffcdd2", padding: "10px", borderRadius: "5px" }}>
                                      <Tooltip title={"Invalid collection type."}>
                                        <span >{collectionTypeList[rowData.collectionTypeCode] ?? "Invalid collection type"}</span>
                                      </Tooltip></div>
                                  } else {
                                    return collectionTypeList[rowData.collectionTypeCode]
                                  }
                                },
                              },
                              {
                                title: 'Net Weight (Kg)',
                                field: 'netWeight',
                                render: rowData => {
                                  if (isNaN(rowData.netWeight) || isEmpty(rowData.netWeight) || parseFloat(rowData.netWeight) < 0) {
                                    return <div style={{ backgroundColor: "#ffcdd2", padding: "10px", borderRadius: "5px" }}>
                                      <Tooltip title={"Invalid or empty weight."}>
                                        <span >{"Invalid or empty weight."}</span>
                                      </Tooltip></div>
                                  } else {
                                    return rowData.netWeight
                                  }
                                }
                              }
                            ]}
                            data={cropData}
                            options={{
                              search: true,
                              actionsColumnIndex: -1
                            }}
                            editable={{
                              onRowAdd: newData =>
                                new Promise((resolve, reject) => {
                                  setTimeout(() => {
                                    checkTableData([...cropData, newData]);
                                    resolve();
                                  }, 1000)
                                }),
                              onRowUpdate: (newData, oldData) =>
                                new Promise((resolve, reject) => {
                                  setTimeout(() => {
                                    const dataUpdate = [...cropData];
                                    const index = oldData.tableData.id;
                                    newData.joiningError = false;
                                    dataUpdate[index] = {
                                      weightReadTime: newData.weightReadTime == oldData.weightReadTime ? newData.weightReadTime : moment(newData.weightReadTime).format('M/D/YYYY'),
                                      registrationNumber: newData.registrationNumber,
                                      collectedRouteCode: newData.collectedRouteCode,
                                      collectionTypeCode: newData.collectionTypeCode,
                                      netWeight: newData.netWeight,
                                    };
                                    checkTableData([...dataUpdate])
                                    resolve();
                                  }, 1000)
                                }),
                              onRowDelete: oldData =>
                                new Promise((resolve, reject) => {
                                  setTimeout(() => {
                                    const dataDelete = [...cropData];
                                    const index = oldData.tableData.id;
                                    dataDelete.splice(index, 1);
                                    setCropData([...dataDelete]);

                                    resolve()
                                  }, 1000)
                                }),
                            }}
                          /> : null}
                      </Box>
                      <br />
                      {cropData.length > 0 ?
                        <Box display="flex" justifyContent="flex-end" p={2}>
                          <Button
                            color="primary"
                            type="submit"
                            variant="contained"
                          >
                            Upload
                          </Button>
                        </Box> : null}
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
