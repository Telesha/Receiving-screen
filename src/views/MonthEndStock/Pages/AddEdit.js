import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button,
  CardContent, Divider, InputLabel,CardHeader, MenuItem
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import tokenDecoder from '../../../utils/tokenDecoder';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik} from 'formik';
import * as Yup from "yup";
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import permissionService from "../../../utils/permissionAuth";
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

const screenCode = 'MONTHENDSTOCK';
export default function MonthEndStockAddEdit(props) {
  const [title, setTitle] = useState("Add Month End Stock")
  const [isUpdate, setIsUpdate] = useState(false);
  const [isDisableButton, setIsDisableButton] = useState(false);
  const classes = useStyles();
  const [groups, setGroups] = useState()
  const [factories, setFactories] = useState()
  const [roleLevels, setRoleLevels] = useState()
  const [monthEndStock, setMonthEndStock] = useState({
    groupID: 0,
    factoryID: 0,
    stockDate: '',
    madeTeaQty: '',
    madeTeaExcess: '',
    gsa: '',
    gsaYearToDate: ''
  });

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const alert = useAlert();
  const params = useParams();

  const navigate = useNavigate();
  const handleClick = () => {

    navigate('/app/monthEndStock/listing');

  }

  useEffect(() => {
    getPermissions();
  }, []);

  useEffect(() => {
    trackPromise(
      getGroupsForDropdown()
    );
  }, []);

  useEffect(() => {
    getFactoriesForDropdown()
  }, [monthEndStock.groupID]);

  useEffect(() => {
    trackPromise(
      getRoleLevelsForDropdown()
    );
  }, []);

  async function getPermissions() {
    var permissions = await permissionService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITMONTHENDSTOCK');

    if (isAuthorized === undefined) {
      navigate('/app/unauthorized');
    }

    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined
    });

    // setMonthEndStock({
    //   monthEndStock,
    //   groupID: parseInt(tokenDecoder.getGroupIDFromToken()),
    //   factoryID: parseInt(tokenDecoder.getFactoryIDFromToken())
    // })

    trackPromise(getGroupsForDropdown());
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getAllFactoriesByGroupID(monthEndStock.groupID);
    setFactories(factories);
  }

  async function getRoleLevelsForDropdown() {
    const response = tokenDecoder.getRoleLevelFromToken();
    const roleLevels = await services.getRoleLevelsByToken(response);
    setRoleLevels(roleLevels);
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

  async function saveMonthEndStock() {
    alert.success("Month End Stock Save Successfully");
    handleClick();
    await timeout(1000);
  }

  function timeout(delay) {
    return new Promise(res => setTimeout(res, delay));
  }

  function handleChange1(e) {
    const target = e.target;
    const value = target.value
    setMonthEndStock({
      ...monthEndStock,
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

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: monthEndStock.groupID,
              factoryID: monthEndStock.factoryID,
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group required').min("1", 'Group required'),
                factoryID: Yup.number().required('Factory required').min("1", 'Factory required'),
              })
            }
            onSubmit={handleClick}
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              isSubmitting,
              touched
            }) => (
              <form>
                <Box mt={0}>
                  <Card>
                    <CardHeader
                      title={cardTitle(title)}
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
                              fullWidth
                              name="groupID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={monthEndStock.groupID}
                              variant="outlined"
                              id="groupID"
                              size = 'small'
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              <MenuItem value="1">Group One</MenuItem>
                              {/* {generateDropDownMenu(groups)} */}
                            </TextField>
                          </Grid>

                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="factoryID">
                              Operation Entity *
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="factoryID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={monthEndStock.factoryID}
                              variant="outlined"
                              id="factoryID"
                              size = 'small'
                            >
                              <MenuItem value="0">--Select Operation Entity--</MenuItem>
                              <MenuItem value="1">Estate One</MenuItem>
                              {/* {generateDropDownMenu(factories)} */}
                            </TextField>
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="stockDate">
                              Stock Date
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="stockDate"
                              type="date"
                              onChange={(e) => handleChange1(e)}
                              value={monthEndStock.stockDate}
                              variant="outlined"
                              size = 'small'
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="madeTeaQty">
                              Made Tea Qty (Kg)
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="madeTeaQty"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={monthEndStock.madeTeaQty}
                              variant="outlined"
                              size = 'small'
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="madeTeaExcess">
                              Made Tea Excess (Kg)
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="madeTeaExcess"
                              onChange={(e) => handleChange1(e)}
                              value={monthEndStock.madeTeaExcess}
                              variant="outlined"
                              size = 'small'
                            />
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="gsa">
                              GSA (Rs)
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="gsa"
                              onChange={(e) => handleChange1(e)}
                              value={monthEndStock.gsa}
                              variant="outlined"
                              size = 'small'
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="gsaYearToDate">
                              GSA Year to Date (Rs)
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="gsaYearToDate"
                              onChange={(e) => handleChange1(e)}
                              value={monthEndStock.gsaYearToDate}
                              variant="outlined"
                              size = 'small'
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                      <Box display="flex" justifyContent="flex-end" p={2}>
                        <Button
                          color="primary"
                          type="submit"
                          variant="contained"
                          onClick={() => trackPromise(saveMonthEndStock())}
                          size = 'small'
                        >
                          Save
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
    </Fragment>
  );
};
