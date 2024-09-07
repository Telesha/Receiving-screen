import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, CardHeader, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik } from 'formik';
import PageHeader from 'src/views/Common/PageHeader';
import * as Yup from "yup";
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
  avatar: {
    marginRight: theme.spacing(2)
  }
}));
const screenCode = 'STOCKENTERING';
export default function StockEnteringAddEdit(props) {
  const [title, setTitle] = useState("Add Stock Details")
  const [isUpdate, setIsUpdate] = useState(false);
  const [isHideField, setIsHideField] = useState(true);

  const classes = useStyles();
  const [groups, setGroups] = useState()
  const [factories, setFactories] = useState()
  const [manufactureNumbers, setManufactureNumbers] = useState([]);
  const [stockDetails, setStockDetails] = useState({
    groupID: '0',
    factoryID: '0',
    amount: '',
    teaGradeID: '0',
    manufactureNumberID: '0',
    stockDetailsID: '0',
    teaGradeName: '0'
  });

  const [grades, setGrades] = useState();
  const [array, setArray] = useState([]);
  const [showarray, setShowArray] = useState([]);
  const navigate = useNavigate();
  let decrypted = 0;
  const alert = useAlert();

  const { stockDetailsID } = useParams();

  const handleClick = () => {
    navigate('/app/stockEntering/listing');
  }


  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });

  useEffect(() => {
    decrypted = atob(stockDetailsID.toString());
    if (decrypted != 0) {
      trackPromise(getStockDetailsByID(decrypted));
    }
    trackPromise(getPermissions(), getGroupsForDropdown());
  }, []);

  useEffect(() => {
    if (stockDetails.groupID > 0) {
      trackPromise(getFactoriesForDropdown());
    }
  }, [stockDetails.groupID]);

  useEffect(() => {
    if (stockDetails.manufactureNumberID > 0) {
      trackPromise(getGradesForDropdown());
    }
  }, [stockDetails.manufactureNumberID]);

  useEffect(() => {
    if (stockDetails.factoryID > 0) {
      trackPromise(getBatchNumbersForDropdown());
    }
  }, [stockDetails.factoryID]);

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getAllFactoriesByGroupID(stockDetails.groupID);
    setFactories(factories);
  }

  async function getGradesForDropdown() {
    const grades = await services.GetGradeDetails(stockDetails.manufactureNumberID);
    setGrades(grades);
  }

  async function getBatchNumbersForDropdown() {
    const batchNumbers = await services.GetBatchNumbersByGroupIDFactoryID(stockDetails.groupID, stockDetails.factoryID);
    setManufactureNumbers(batchNumbers);
  }


  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITSTOCKENTERING');

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

    if (decrypted == 0) {
      setStockDetails({
        ...stockDetails,
        groupID: parseInt(tokenService.getGroupIDFromToken()),
        factoryID: parseInt(tokenService.getFactoryIDFromToken())
      })
    }
  }

  async function getStockDetailsByID(stockDetailsID) {
    let response = await services.GetStockDetailsByStockDetailsID(stockDetailsID);
    let data = response.data;

    setTitle("Edit Stock Entering");

    setStockDetails({
      ...stockDetails,
      groupID: data.groupID,
      factoryID: data.factoryID,
      amount: data.amount,
      teaGradeID: data.teaGradeID,
      manufactureNumberID: data.manufactureNumberID
    });

    setIsUpdate(true);
  }

  async function SaveStockDetails() {

      if (array.length != 0) {
        let response = await services.saveStockDetails(tokenService.getUserIDFromToken(), array);
        if (response.statusCode == "Success")
        {
          alert.success(response.message);
          clearFields();
          handleClick();
        }
        else
        {
          alert.error(response.message);
        }
      }
      else
      {
        alert.error('Enter valid information');
      }
  }

  async function AddTableData() {
    if (isUpdate == true)
    {
        let updateModel = {
          amount: parseFloat(stockDetails.amount),
          modifiedBy: parseInt(tokenService.getUserIDFromToken()),
          stockDetailsID: parseInt(atob(stockDetailsID.toString()))
        }
        let response = await services.UpdateStockDetails(updateModel);
        if (response.statusCode == "Success") {
          alert.success(response.message);
          navigate('/app/stockEntering/listing');
        }
        else {
          alert.error(response.message);
        }
    }
    else
    {
      if (grades != 0) {
        if (array.length == 0) {
          if (stockDetails.amount != 0) {
            setShowArray(
              [...showarray, {
                groupName: groups[stockDetails.groupID],
                factoryName: factories[stockDetails.factoryID],
                manufactureNumberName: manufactureNumbers[stockDetails.manufactureNumberID],
                teaGradeName: grades[stockDetails.teaGradeID],
                amount: parseFloat(stockDetails.amount),
                stockDetailsID: parseInt(stockDetails.stockDetailsID)
              }]
            );

            setArray(
              [...array, {
                groupID: parseInt(stockDetails.groupID),
                factoryID: parseInt(stockDetails.factoryID),
                manufactureNumberID: parseInt(stockDetails.manufactureNumberID),
                teaGradeID: parseInt(stockDetails.teaGradeID),
                amount: parseFloat(stockDetails.amount)
              }]
            );
          }
          else {
            alert.error('Please Enter Assign Amount.');
          }

        }
        else {
          var isIDAvailable = array.find(element => element.teaGradeID == stockDetails.teaGradeID);
          if (isIDAvailable != undefined) {
            alert.error('This Stock Grade Record Already Available');
          }
          else {
            if (stockDetails.amount != 0) {
              setShowArray(
                [...showarray, {
                  groupName: groups[stockDetails.groupID],
                  factoryName: factories[stockDetails.factoryID],
                  manufactureNumberName: manufactureNumbers[stockDetails.manufactureNumberID],
                  teaGradeName: grades[stockDetails.teaGradeID],
                  amount: parseFloat(stockDetails.amount),
                  stockDetailsID: parseInt(stockDetails.stockDetailsID)
                }]
              );

              setArray(
                [...array, {
                  groupID: parseInt(stockDetails.groupID),
                  factoryID: parseInt(stockDetails.factoryID),
                  manufactureNumberID: parseInt(stockDetails.manufactureNumberID),
                  teaGradeID: parseInt(stockDetails.teaGradeID),
                  amount: parseFloat(stockDetails.amount)
                }]
              );
            }
            else {
              alert.error('Please Enter Assign Amount.');
            }
          }
        }

        setStockDetails({
          groupID: stockDetails.groupID,
          factoryID: stockDetails.factoryID,
          manufactureNumberID: stockDetails.manufactureNumberID
        });

        clearGradeInputFields();
      }
      else {
        alert.error('Not Available Grades for This Batch Number');
      }

    }
  }

  function generateDropDownMenu(data) {
    let items = []
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(<MenuItem key={key} value={key}>{value}</MenuItem>)
      }
    }
    return items
  }

  function handleChange1(e) {
    const target = e.target;
    const value = target.value
    setStockDetails({
      ...stockDetails,
      [e.target.name]: value
    });
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

  function clearGradeInputFields() {
    setStockDetails({
      ...stockDetails,
      teaGradeID: '0',
      amount: ''
    });
  }

  function clearFields() {
    setStockDetails({
      ...stockDetails,
      groupID: '0',
      factoryID: '0',
      manufactureNumberID: '0',
      teaGradeID: '0',
      amount: ''
    });
    setIsHideField(true);
    setShowArray([]);
    setArray([]);
  }

  return (
    <Page
      className={classes.root}
      title="Add Stock Details"
    >
      <LoadingComponent />
      <Container maxWidth={false}>
        <Formik
          initialValues={{
            groupID: stockDetails.groupID,
            factoryID: stockDetails.factoryID
          }}
          validationSchema={
            Yup.object().shape({
              groupID: Yup.number().required('Group required').min("1", 'Group required'),
              factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required')
            })
          }
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
                  <CardContent>
                    <Grid container spacing={4}>
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
                          onChange={(e) => handleChange1(e)}
                          value={stockDetails.groupID}
                          variant="outlined"
                          id="groupID"
                          size="small"
                          InputProps={{
                            readOnly: isUpdate ? true : false
                          }}

                        >
                          <MenuItem value="0">--Select Group--</MenuItem>
                          {generateDropDownMenu(groups)}
                        </TextField>
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <InputLabel shrink id="factoryID">
                          Operation Entity *
                        </InputLabel>
                        <TextField select
                          error={Boolean(touched.factoryID && errors.factoryID)}
                          fullWidth
                          helperText={touched.factoryID && errors.factoryID}
                          name="factoryID"
                          onBlur={handleBlur}
                          onChange={(e) => handleChange1(e)}
                          value={stockDetails.factoryID}
                          variant="outlined"
                          id="factoryID"
                          size="small"
                          InputProps={{
                            readOnly: isUpdate ? true : false
                          }}
                        >
                          <MenuItem value="0">--Select Operation Entity--</MenuItem>
                          {generateDropDownMenu(factories)}
                        </TextField>
                      </Grid>
                      <Grid item md={4} xs={12}>
                          <InputLabel shrink id="manufactureNumberID">
                          Manufacture Number *
                        </InputLabel>

                        <TextField select
                          fullWidth
                          error={Boolean(touched.manufactureNumberID && errors.manufactureNumberID)}
                          helperText={touched.manufactureNumberID && errors.manufactureNumberID}
                          name="manufactureNumberID"
                          size="small"
                          InputProps={{
                            readOnly: isUpdate ? true : false
                          }}
                          onChange={(e) => {
                            handleChange1(e)
                          }}
                          value={stockDetails.manufactureNumberID}
                          variant="outlined"
                          id="manufactureNumberID"
                        >
                          <MenuItem value={'0'}>
                            --Select Manufacture Number--
                          </MenuItem>
                          {generateDropDownMenu(manufactureNumbers)}

                        </TextField>
                      </Grid>
                    </Grid>
                    <Grid container spacing={4}>

                      <Grid item md={4} xs={12}>
                        <InputLabel shrink id="teaGradeID">
                          Grade *
                        </InputLabel>

                        <TextField select
                          fullWidth
                          error={Boolean(touched.teaGradeID && errors.teaGradeID)}
                          helperText={touched.teaGradeID && errors.teaGradeID}
                          name="teaGradeID"
                          onChange={(e) => {
                            handleChange1(e)
                          }}
                          value={stockDetails.teaGradeID}
                          variant="outlined"
                          size="small"
                          InputProps={{
                            readOnly: isUpdate ? true : false
                          }}
                          id="teaGradeID"
                        >
                          <MenuItem value={'0'}>
                            --Select Grade--
                          </MenuItem>
                          {generateDropDownMenu(grades)}
                        </TextField>
                      </Grid>


                      <Grid item md={4} xs={12}>
                        <InputLabel shrink id="amount">
                          Amount *
                        </InputLabel>
                        <TextField
                          error={Boolean(touched.amount && errors.amount)}
                          fullWidth
                          helperText={touched.amount && errors.amount}
                          name="amount"
                          type="number"
                          onBlur={handleBlur}
                          onChange={(e) => handleChange1(e)}
                          value={stockDetails.amount}
                          variant="outlined"
                          size="small"
                        />
                      </Grid>
                    </Grid>
                    <Box display="flex" justifyContent="flex-end" p={2}>
                      <Button
                        color="primary"
                        type="submit"
                        variant="contained"
                          onClick={() => AddTableData()}
                      >
                          {isUpdate == true ? "Update" : "Add"}
                      </Button>
                    </Box>
                  </CardContent>

                  {array.length > 0 ? (
                    <Grid xs={12}>

                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell align="center"><b>Group Name</b></TableCell>
                              <TableCell align="center"><b>Factory Name</b></TableCell>
                              <TableCell align="center"><b>Manufacture Number Name</b></TableCell>
                              <TableCell align="center"><b>Tea Grade Name</b></TableCell>
                              <TableCell align="center"><b>Amount</b></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {showarray.map((row, index) => {
                              return <TableRow key={index}>
                                <TableCell align="center" >{row.groupName}
                                </TableCell>
                                <TableCell align="center" >{row.factoryName}
                                </TableCell>
                                <TableCell align="center" >{row.manufactureNumberName}
                                </TableCell>
                                <TableCell align="center" >{row.teaGradeName}
                                </TableCell>
                                <TableCell align="center" >{row.amount}
                                </TableCell>
                              </TableRow>
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>

                  )
                    : null}

                  {array.length > 0 ? (
                    <Box display="flex" justifyContent="flex-end" p={2}>
                      <Button
                        color="primary"
                        type="submit"
                        variant="contained"
                        onClick={() => SaveStockDetails()}
                      >
                      {"Save"}
                      </Button>
                    </Box>
                  ) : null}

                  </PerfectScrollbar>
                </Card>
                
              </Box>
            </form>
          )}
        </Formik>
      </Container>
    </Page>
  );
};
