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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  MenuItem
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../../Services';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";
import DeleteIcon from '@material-ui/icons/Delete';
import { trackPromise } from 'react-promise-tracker';
import { LoadingComponent } from '../../../../utils/newLoader';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { AlertDialogWithoutButton } from 'src/views/Common/AlertDialogWithoutButton';
import tokenDecoder from 'src/utils/tokenDecoder';

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100%',
  },
  avatar: {
    marginRight: theme.spacing(2)
  },
  root1: {
    height: 180,
  },
  container: {
    display: 'flex',
  },
  cardContent: {
    border: `2px solid #e8eaf6`
  },

}));

export function MenuConfig({ }) {
  const classes = useStyles();
  const alert = useAlert();
  const [ParentMenuList, setParentMenuList] = useState([])
  const [MenuFormData, setMenuFormData] = useState({
    parentMenuID: 0,
    menuName: "",
    iconTagName: "",
    menuOrderNumber: 0
  })

  useEffect(() => {
    GetAllParentMenuDetails();
  }, []);

  function generateDropDownMenu(data) {
    let items = []
    if (data != null) {
      data.forEach(element => {
        items.push(<MenuItem key={element.parentMenuID} value={element.parentMenuID}>{element.parentMenuName}</MenuItem>);
      });
    }
    return items;
  }

  async function GetAllParentMenuDetails() {
    let response = await services.GetAllParentMenuDetails()
    if (response.statusCode == "Success") {
      setParentMenuList(response.data)
    }   
  }

  async function SaveMenuDetails() {
    let requestModel = {
      parentMenuID: MenuFormData.parentMenuID,
      menuName: MenuFormData.menuName,
      iconTag: MenuFormData.iconTagName.toLocaleLowerCase(),
      menuOrderNo: MenuFormData.menuOrderNumber,
      createdBy: parseInt(tokenDecoder.getUserIDFromToken())
    }
    let response = await services.SaveMenuDetails(requestModel)
    if (response.statusCode == "Success") {
      alert.success(response.message);
    }
    else {
      alert.error(response.message);
    }
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setMenuFormData({
      ...MenuFormData,
      [e.target.name]: value
    });
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page title="Menu">
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
                      title="Menu"
                    />

                    <PerfectScrollbar>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="parentMenuID">
                              Parent Menu ID
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.parentMenuID && errors.parentMenuID)}
                              fullWidth
                              helperText={touched.parentMenuID && errors.parentMenuID}
                              name="parentMenuID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={MenuFormData.parentMenuID}
                              variant="outlined"
                              id="parentMenuID"
                              size='small'
                            >
                              <MenuItem value="0">--Select Parent Menu--</MenuItem>
                              {generateDropDownMenu(ParentMenuList)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="menuName">
                              Menu Name
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="menuName"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              size='small'
                              value={MenuFormData.menuName}
                              variant="outlined"
                              id="menuName"
                            >
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="iconTagName">
                              Icon Tag Name
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="iconTagName"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              size='small'
                              value={MenuFormData.iconTagName}
                              variant="outlined"
                              id="iconTagName"
                              inputProps={{ style: { textTransform: "lowercase" } }}
                            >
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="menuOrderNumber">
                              Menu Order
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="menuOrderNumber"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              size='small'
                              value={MenuFormData.menuOrderNumber}
                              variant="outlined"
                              id="menuOrderNumber"
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
                          onClick={() => trackPromise(SaveMenuDetails())}
                          size='small'
                        >
                          Save Menu
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
