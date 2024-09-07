import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  Grid,
  makeStyles,
  Container,
  Button,
  CardContent,
  Divider,
  InputLabel,
  CardHeader,
  Table,
  TableBody,
  TableCell, TableHead,
  TableRow,
  Tooltip,
  TextField,
  MenuItem
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../../Services';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import DeleteIcon from '@material-ui/icons/Delete';
import { trackPromise } from 'react-promise-tracker';
import { LoadingComponent } from '../../../../utils/newLoader';
import { AlertDialogWithoutButton } from 'src/views/Common/AlertDialogWithoutButton';
import Services from '../../Services';
import MaterialTable from "material-table";
import tokenDecoder from 'src/utils/tokenDecoder';

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100%',
  },
  container: {
    display: 'flex',
    width: "fullWidth"
  },
  cardContent: {
    border: `2px solid #e8eaf6`
  },
}));

export function PermissionConfig({ }) {
  const classes = useStyles();
  const alert = useAlert();

  const [ScreenList, setScreenList] = useState([])
  const [PermissionFormData, setPermissionFormData] = useState({
    screenID: 0,
    permissionCode: "",
    permissionName: "",
    orderID: 0,
  })
  const [PermissionDetailsList, setPermissionDetailsList] = useState([])

  useEffect(() => {
    trackPromise(GetAllScreenDetails());
  }, []);

  function generateDropDownMenu(data) {
    let items = []
    if (data != null) {
      data.forEach(element => {
        items.push(<MenuItem key={element.screenID} value={element.screenID}>{element.screenName}</MenuItem>);
      });
    }
    return items;
  }

  async function SaveScreenDetails() {
    let response = await Services.SaveScreenPermissionDetails(PermissionDetailsList);
    if (response.statusCode == "Success") {
      alert.success(response.message);
    }
    else {
      alert.error(response.message);
    }
  }

  async function AddPermissionDetails() {
    let model = {
      screenID: PermissionFormData.screenID,
      permissionCode: PermissionFormData.permissionCode.toLocaleUpperCase(),
      permissionName: PermissionFormData.permissionName,
      orderID: PermissionFormData.orderID,
      createdBy: parseInt(tokenDecoder.getUserIDFromToken())
    }

    setPermissionDetailsList(result => [...result, model]);
  }


  async function GetAllScreenDetails() {
    let response = await Services.GetAllScreenDetails();

    if (response.statusCode == "Success") {
      setScreenList(response.data)
    }
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setPermissionFormData({
      ...PermissionFormData,
      [e.target.name]: value
    });
  }

  function ScreenNameFinder(screenID) {
    let sd = ScreenList.filter(x => {
      if (x.screenID === screenID) {
        return x
      }
    })

    return sd[0].screenName
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page title="Permission">
        <Container>
          <Formik
            initialValues={{
              // bankID: account.bankID,
              // branchID: account.branchID,
              // accountNumber: account.accountNumber,
              // accountName: account.accountName
            }}
            validationSchema={
              Yup.object().shape({
                bankID: Yup.number().min(1, "Bank is required").required('Bank is required')
              })
            }
            // onSubmit={saveUser}
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleSubmit,
              isSubmitting,
              touched,
              values,
            }) => (
              <form onSubmit={handleSubmit}>
                <Box mt={2}>
                  <Card>
                    <CardHeader
                      title="Permission"
                    />

                    <PerfectScrollbar>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="screenID">
                              Screen ID
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.screenID && errors.screenID)}
                              fullWidth
                              helperText={touched.screenID && errors.screenID}
                              name="screenID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={PermissionFormData.screenID}
                              variant="outlined"
                              id="screenID"
                              size='small'
                            >
                              <MenuItem value="0">--Select Sccreen--</MenuItem>
                              {generateDropDownMenu(ScreenList)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="permissionName">
                              Permission Name
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="permissionName"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              size='small'
                              value={PermissionFormData.permissionName}
                              variant="outlined"
                              id="permissionName"
                            >
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="permissionCode">
                              Permission Code
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="permissionCode"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              size='small'
                              value={PermissionFormData.permissionCode}
                              variant="outlined"
                              id="permissionCode"
                              inputProps={{ style: { textTransform: "uppercase" } }}
                            >
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="orderID">
                              Permission Order
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="orderID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              size='small'
                              value={PermissionFormData.orderID}
                              variant="outlined"
                              id="orderID"
                            >
                            </TextField>
                          </Grid>
                        </Grid>

                      </CardContent>
                      <Box display="flex" justifyContent="flex-end" p={2}>
                        <Button
                          color="primary"
                          type="reset"
                          variant="outlined"
                          onClick={() => trackPromise(AddPermissionDetails())}
                          size='small'
                        >
                          Add
                        </Button>
                      </Box>

                      <Box minWidth={1000}>
                        {PermissionDetailsList.length > 0 ?
                          <MaterialTable
                            title="Multiple Actions Preview"
                            columns={[
                              { title: 'Screen Name', field: 'screenID', render: rowData => ScreenNameFinder(rowData.screenID) },
                              { title: 'Permission Code', field: 'permissionCode' },
                              { title: 'Permission Name', field: 'permissionName' },
                              { title: 'Permission Order', field: 'orderID' }
                            ]}
                            data={PermissionDetailsList}
                            options={{
                              exportButton: false,
                              showTitle: false,
                              headerStyle: { textAlign: "left", height: '1%' },
                              cellStyle: { textAlign: "left" },
                              columnResizable: false,
                              actionsColumnIndex: -1
                            }}
                          // actions={[
                          //   {
                          //     icon: 'edit',
                          //     tooltip: 'Edit Contract',
                          //     onClick: (event, rowData) => handleClickEdit(rowData.sellerContractID)
                          //   }
                          // ]}
                          /> : null}
                      </Box>

                      <Box display="flex" justifyContent="flex-end" p={2}>
                        <Button
                          color="primary"
                          type="reset"
                          variant="outlined"
                          onClick={() => trackPromise(SaveScreenDetails())}
                          size='small'
                        >
                          Save Permission Details
                        </Button>
                      </Box>

                    </PerfectScrollbar>
                  </Card>
                </Box>
              </form>
            )}
          </Formik>
        </Container>

      </Page>
    </Fragment >
  );
};
