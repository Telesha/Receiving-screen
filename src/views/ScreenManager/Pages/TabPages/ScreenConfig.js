import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  Grid,
  TextField,
  makeStyles,
  Container,
  Button,
  CardContent,
  Divider,
  InputLabel,
  CardHeader,
  FormControl,
} from '@material-ui/core';
import Page from 'src/components/Page';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";
import { trackPromise } from 'react-promise-tracker';
import { LoadingComponent } from '../../../../utils/newLoader';
import MenuItem from '@material-ui/core/MenuItem';
import Services from '../../Services';
import MaterialTable from "material-table";
import services from 'src/views/ScreenManager/Services';
import tokenDecoder from 'src/utils/tokenDecoder';

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100%',
  },
  cardContent: {
    border: `2px solid #e8eaf6`
  },
}));

export function ScreenConfig({ }) {
  const classes = useStyles();
  const alert = useAlert();
  const [MenuList, setMenuList] = useState([])
  const [ScreenFormData, setScreenFormData] = useState({
    menuID: 0,
    screenCode: "",
    screenName: "",
    screenOrderNo: 0,
    iconTag: "",
    routePath: ""
  })
  const [ScreenDetailsList, setScreenDetailsList] = useState([])

  useEffect(() => {
    trackPromise(GetAllMenuDetails());
  }, []);

  function generateDropDownMenu(data) {
    let items = []
    if (data != null) {
      data.forEach(element => {
        items.push(<MenuItem key={element.menuID} value={element.menuID}>{element.menuName}</MenuItem>);
      });
    }
    return items;
  }

  async function SaveScreenDetails() {
    let response = await Services.SaveScreenDetails(ScreenDetailsList);
    if (response.statusCode == "Success") {
      alert.success(response.message);
    }
    else {
      alert.error(response.message);
    }
  }

  async function AddScreenDetails() {
    let model = {
      menuID: ScreenFormData.menuID,
      screenCode: ScreenFormData.screenCode.toLocaleUpperCase(),
      screenName: ScreenFormData.screenName,
      screenOrderNo: ScreenFormData.screenOrderNo,
      iconTag: ScreenFormData.iconTag.toLocaleLowerCase(),
      routePath: ScreenFormData.routePath,
      createdBy: parseInt(tokenDecoder.getUserIDFromToken())
    }

    setScreenDetailsList(result => [...result, model]);
  }


  async function GetAllMenuDetails() {
    let response = await Services.GetAllMenuDetails();
    if (response.statusCode == "Success") {
      setMenuList(response.data)
    }
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setScreenFormData({
      ...ScreenFormData,
      [e.target.name]: value
    });
  }

  function MenuNameFinder(menuID) {

    let sd = MenuList.filter(x => {
      if (x.menuID === menuID) {
        return x
      }
    })

    return sd[0].menuName
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page title="Screen">
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
                      title="Screen"
                    />

                    <PerfectScrollbar>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="menuID">
                              Menu ID
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.menuID && errors.menuID)}
                              fullWidth
                              helperText={touched.menuID && errors.menuID}
                              name="menuID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={ScreenFormData.menuID}
                              variant="outlined"
                              id="menuID"
                              size='small'
                            >
                              <MenuItem value="0">--Select Menu--</MenuItem>
                              {generateDropDownMenu(MenuList)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="screenName">
                              Screen Name
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="screenName"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              size='small'
                              value={ScreenFormData.screenName}
                              variant="outlined"
                              id="screenName"
                            >
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="screenCode">
                              Screen Code
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="screenCode"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              size='small'
                              value={ScreenFormData.screenCode}
                              variant="outlined"
                              id="screenCode"
                              inputProps={{ style: { textTransform: "uppercase" } }}
                            >
                            </TextField>
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>

                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="iconTag">
                              Icon Tag Name
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="iconTag"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              size='small'
                              value={ScreenFormData.iconTag}
                              variant="outlined"
                              id="iconTag"
                              inputProps={{ style: { textTransform: "lowercase" } }}
                            >
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="screenOrderNo">
                              Menu Order
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="screenOrderNo"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              size='small'
                              value={ScreenFormData.screenOrderNo}
                              variant="outlined"
                              id="screenOrderNo"
                            >
                            </TextField>
                          </Grid>
                          <Grid item md={6} xs={12}>
                            <InputLabel shrink id="routePath">
                              Route Path
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="routePath"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              size='small'
                              value={ScreenFormData.routePath}
                              variant="outlined"
                              id="routePath"
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
                          onClick={() => trackPromise(AddScreenDetails())}
                          size='small'
                        >
                          Add
                        </Button>
                      </Box>

                      <Box minWidth={1000}>
                        {ScreenDetailsList.length > 0 ?
                          <MaterialTable
                            title="Multiple Actions Preview"
                            columns={[
                              { title: 'Menu Name', field: 'menuID', render: rowData => MenuNameFinder(rowData.menuID) },
                              { title: 'Screen Code', field: 'screenCode' },
                              { title: 'Screen Name', field: 'screenName' },
                              { title: 'Screen Order', field: 'screenOrderNo' },
                              { title: 'Icon', field: 'iconTag' },
                              { title: 'Route Path', field: 'routePath' }
                            ]}
                            data={ScreenDetailsList}
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
                          Save Screen Details
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
