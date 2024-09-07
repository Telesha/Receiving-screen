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
  Switch,
  CardHeader,
  MenuItem
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from "yup";
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';

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

export default function FixedAssetAddEdit(props) {
  const [title, setTitle] = useState("Fixed Asset Registry")
  const [isUpdate, setIsUpdate] = useState(false);
  const [isDisableButton, setIsDisableButton] = useState(false);
  const classes = useStyles();
  const [group, setGroup] = useState({
    groupID: '0',
    factoryID: '0',
    description: '',
    fixedAssetCode: '',
    category: '0',
    subCategory: '0',
    manufacturer: '',
    location: '',
    depreciationEntryFrequency: '0',
    statusID: '0',
    glNumber: '',
    accumulatedDepreciationGL: '0',
    depreciationExpenseGL: '0',
    departmentID: '0',
    fixedAssetName: '',
    manufacturerCountry: '0',
    manufacturerYear: '',
    fixedAssetCurrentAmount: '',
    fixedAssetPreviousAmount: '',
    depreciationPercentage: '',
    expectedTime: ''
  });
  const [groupIsActive, setGroupIsActive] = useState(true);
  const [gridArray, setGridArray] = useState([]);
  const navigate = useNavigate();
  const handleClick = () => {

    navigate('/app/fixedAsset/listing');

  }
  const theData = [
    { subCategory: 1, subCategoryName: 'Computer' },
    { subCategory: 2, subCategoryName: 'Storage' },
    { subCategory: 3, subCategoryName: 'Air Conditioner' }
  ]

  const theData2 = [
    { subCategory: 1, subCategoryName: 'Van' },
    { subCategory: 2, subCategoryName: 'Car' }
  ]

  const alert = useAlert();
  const { groupID } = useParams();
  let decrypted = 0;

  useEffect(() => {
    trackPromise(
      subcategoryset()
    );
  }, [group.category]);

  useEffect(() => {
    decrypted = atob(groupID.toString());
    if (decrypted != 0) {
      trackPromise(
        getGroupDetails(decrypted)
      )
    }
  }, []);

  async function getGroupDetails(groupID) {
    let response = await services.getGroupDetailsByID(groupID);
    let data = response[0];
    setTitle("Update Group");
    setGroup(data);
    setIsUpdate(true);
    setGroupIsActive(response[0]);
  }

  async function subcategoryset() {
    if (group.category == "1") {
      let groupArray = []
      for (let item of Object.entries(theData)) {
        groupArray[item[1]["subCategory"]] = item[1]["subCategoryName"]
      }
      setGridArray(groupArray);
    }
    else if (group.category == "2") {
      let groupArray = []
      for (let item of Object.entries(theData2)) {
        groupArray[item[1]["subCategory"]] = item[1]["subCategoryName"]
      }
      setGridArray(groupArray);
    }
    else {
      setGridArray([]);
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

  async function saveGroup(values) {
    await timeout(1000);
    alert.success("Fixed Asset Save Successfully");
    navigate('/app/fixedAsset/listing');
  }

  function timeout(delay) {
    return new Promise(res => setTimeout(res, delay));
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setGroup({
      ...group,
      [e.target.name]: value
    });
  }

  function clearData() {
    setGroup({
      ...group,
      description: '',
      fixedAssetCode: '',
      category: '0',
      subCategory: '0',
      manufacturer: '',
      location: '',
      depreciationEntryFrequency: '0',
      statusID: '0',
      glNumber: '',
      accumulatedDepreciationGL: '0',
      depreciationExpenseGL: '0',
      departmentID: '0',
      fixedAssetName: '',
      manufacturerCountry: '0',
      manufacturerYear: '',
      fixedAssetCurrentAmount: '',
      fixedAssetPreviousAmount: '',
      depreciationPercentage: '',
      expectedTime: ''
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
              groupID: group.groupID,
              factoryID: group.factoryID,
              description: group.description,
              fixedAssetCode: group.fixedAssetCode,
              category: group.category,
              subCategory: group.subCategory,
              manufacturer: group.manufacturer,
              location: group.location,
              depreciationEntryFrequency: group.depreciationEntryFrequency,
              statusID: group.statusID,
              glNumber: group.glNumber,
              accumulatedDepreciationGL: group.accumulatedDepreciationGL,
              depreciationExpenseGL: group.depreciationExpenseGL,
              departmentID: group.departmentID,
              fixedAssetName: group.fixedAssetName,
              manufacturerCountry: group.manufacturerCountry,
              manufacturerYear: group.manufacturerYear,
              fixedAssetCurrentAmount: group.fixedAssetCurrentAmount,
              fixedAssetPreviousAmount: group.fixedAssetPreviousAmount,
              depreciationPercentage: group.depreciationPercentage,
              expectedTime: group.expectedTime
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group required').min("1", 'Group required'),
                factoryID: Yup.number().required('Factory required').min("1", 'Factory required'),
                description: Yup.string().max(255),
                fixedAssetCode: Yup.string().max(255).required('Fixed Asset Code is required'),
                category: Yup.number().required('Category required').min("1", 'Category required'),
                subCategory: Yup.number(),
                manufacturer: Yup.string().max(255).required('Manufacturer is required'),
                location: Yup.string().max(255),
                depreciationEntryFrequency: Yup.number().required('Depreciation Entry Frequency required').min("1", 'Depreciation Entry Frequency required'),
                statusID: Yup.number().required('Status required').min("1", 'Status required'),
                glNumber: Yup.string().max(255).required('G/L Number is required'),
                accumulatedDepreciationGL: Yup.number().required('Accumulated Depreciation G/L is required').min("1", 'Accumulated Depreciation G/L required'),
                depreciationExpenseGL: Yup.number().required('Depreciation Expense G/L is required').min("1", 'Depreciation Expense G/L required'),
                departmentID: Yup.number().required('Department required').min("1", 'Department required'),
                fixedAssetName: Yup.string().max(255).required('Fixed Asset Name is required'),
                manufacturerCountry: Yup.string().max(255).required('Manufacturer Country is required'),
                manufacturerYear: Yup.string().max(255).required('Manufacturer Year is required'),
                fixedAssetCurrentAmount: Yup.number().required('Fixed Asset Current Amount is required'),
                fixedAssetPreviousAmount: Yup.number().required('Fixed Asset Previous Amount is required'),
                depreciationPercentage: Yup.number().required('Depreciation Percentage is required'),
                expectedTime: Yup.string()
              })
            }
            onSubmit={() => trackPromise(saveGroup())}
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
                        <Grid container spacing={3} style={{ marginTop: '10px', marginBottom: '10px' }}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="groupID">
                              Group *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.groupID && errors.groupID)}
                              fullWidth
                              helperText={touched.groupID && errors.groupID}
                              name="groupID"
                              size='small'
                              onChange={(e) => handleChange(e)}
                              value={values.groupID}
                              variant="outlined"
                              id="groupID"
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              <MenuItem value="1">Group One</MenuItem>
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
                              onChange={(e) => handleChange(e)}
                              value={values.factoryID}
                              variant="outlined"
                              id="factoryID"
                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              <MenuItem value="1">Factory One</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="departmentID">
                              Department *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.departmentID && errors.departmentID)}
                              fullWidth
                              helperText={touched.departmentID && errors.departmentID}
                              name="departmentID"
                              onChange={(e) => handleChange(e)}
                              size='small'
                              value={values.departmentID}
                              variant="outlined"
                              id="departmentID"
                            >
                              <MenuItem value="0">--Select Department--</MenuItem>
                              <MenuItem value="1">Department One</MenuItem>
                            </TextField>
                          </Grid>
                        </Grid>
                      </CardContent>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3} style={{ marginTop: '10px', marginBottom: '10px' }}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="category">
                              Category *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.category && errors.category)}
                              fullWidth
                              helperText={touched.category && errors.category}
                              name="category"
                              onChange={(e) => handleChange(e)}
                              size='small'
                              value={values.category}
                              variant="outlined"
                              id="category"
                            >
                              <MenuItem value="0">--Select Category--</MenuItem>
                              <MenuItem value="1">Office Items</MenuItem>
                              <MenuItem value="2">Vehicles</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="subCategory">
                              Sub Category
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="subCategory"
                              onChange={(e) => handleChange(e)}
                              value={values.subCategory}
                              size='small'
                              variant="outlined"
                              id="subCategory"
                            >
                              <MenuItem value="0">--Select Sub Category--</MenuItem>
                              {generateDropDownMenu(gridArray)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="fixedAssetCode">
                              Fixed Asset Code *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.fixedAssetCode && errors.fixedAssetCode)}
                              fullWidth
                              helperText={touched.fixedAssetCode && errors.fixedAssetCode}
                              name="fixedAssetCode"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              size='small'
                              value={values.fixedAssetCode}
                              variant="outlined"
                              disabled={isDisableButton}
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="fixedAssetName">
                              Fixed Asset Name *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.fixedAssetName && errors.fixedAssetName)}
                              fullWidth
                              helperText={touched.fixedAssetName && errors.fixedAssetName}
                              name="fixedAssetName"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              size='small'
                              value={values.fixedAssetName}
                              variant="outlined"
                              disabled={isDisableButton}
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="description">
                              Description
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.description && errors.description)}
                              fullWidth
                              helperText={touched.description && errors.description}
                              name="description"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              size='small'
                              value={values.description}
                              variant="outlined"
                              disabled={isDisableButton}
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="location">
                              Location
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.location && errors.location)}
                              fullWidth
                              helperText={touched.location && errors.location}
                              name="location"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              size='small'
                              value={values.location}
                              variant="outlined"
                              disabled={isDisableButton}
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="manufacturer">
                              Manufacturer By *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.manufacturer && errors.manufacturer)}
                              fullWidth
                              helperText={touched.manufacturer && errors.manufacturer}
                              name="manufacturer"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              size='small'
                              value={values.manufacturer}
                              variant="outlined"
                              disabled={isDisableButton}
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="manufacturerYear">
                              Manufacturer Year *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.manufacturerYear && errors.manufacturerYear)}
                              fullWidth
                              helperText={touched.manufacturerYear && errors.manufacturerYear}
                              name="manufacturerYear"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              size='small'
                              value={values.manufacturerYear}
                              variant="outlined"
                              disabled={isDisableButton}
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="manufacturerCountry">
                              Manufacturer Country *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.manufacturerCountry && errors.manufacturerCountry)}
                              fullWidth
                              helperText={touched.manufacturerCountry && errors.manufacturerCountry}
                              name="manufacturerCountry"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              size='small'
                              value={values.manufacturerCountry}
                              variant="outlined"
                              disabled={isDisableButton}
                            >
                              <MenuItem value="0">--Select Country--</MenuItem>
                              <MenuItem value="1">Afghanistan</MenuItem>
                              <MenuItem value="2">Canada</MenuItem>
                              <MenuItem value="3">France	</MenuItem>
                              <MenuItem value="4">Hungary</MenuItem>
                              <MenuItem value="5">Sri Lanka</MenuItem>
                              <MenuItem value="6">Ukraine</MenuItem>
                            </TextField>
                          </Grid>
                        </Grid>
                      </CardContent>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3} style={{ marginTop: '10px', marginBottom: '10px' }}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="fixedAssetPreviousAmount">
                              Asset Actual Value *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.fixedAssetPreviousAmount && errors.fixedAssetPreviousAmount)}
                              fullWidth
                              helperText={touched.fixedAssetPreviousAmount && errors.fixedAssetPreviousAmount}
                              name="fixedAssetPreviousAmount"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={values.fixedAssetPreviousAmount}
                              size='small'
                              variant="outlined"
                              disabled={isDisableButton}
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="fixedAssetCurrentAmount">
                              Asset Current Value *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.fixedAssetCurrentAmount && errors.fixedAssetCurrentAmount)}
                              fullWidth
                              helperText={touched.fixedAssetCurrentAmount && errors.fixedAssetCurrentAmount}
                              name="fixedAssetCurrentAmount"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={values.fixedAssetCurrentAmount}
                              size='small'
                              variant="outlined"
                              disabled={isDisableButton}
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="expectedTime">
                              Asset Expired
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.expectedTime && errors.expectedTime)}
                              fullWidth
                              helperText={touched.expectedTime && errors.expectedTime}
                              name="expectedTime"
                              onBlur={handleBlur}
                              type='date'
                              onChange={(e) => handleChange(e)}
                              size='small'
                              value={values.expectedTime}
                              variant="outlined"
                              disabled={isDisableButton}
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="depreciationEntryFrequency">
                              Depreciation Entry Frequency *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.depreciationEntryFrequency && errors.depreciationEntryFrequency)}
                              fullWidth
                              helperText={touched.depreciationEntryFrequency && errors.depreciationEntryFrequency}
                              name="depreciationEntryFrequency"
                              onChange={(e) => handleChange(e)}
                              value={values.depreciationEntryFrequency}
                              size='small'
                              variant="outlined"
                              id="depreciationEntryFrequency"
                            >
                              <MenuItem value="0">--Select Depreciation Entry Frequency--</MenuItem>
                              <MenuItem value="1">Annually</MenuItem>
                              <MenuItem value="2">Monthly</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="depreciationPercentage">
                              Depreciation Percentage (%) *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.depreciationPercentage && errors.depreciationPercentage)}
                              fullWidth
                              helperText={touched.depreciationPercentage && errors.depreciationPercentage}
                              name="depreciationPercentage"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              size='small'
                              value={values.depreciationPercentage}
                              variant="outlined"
                              disabled={isDisableButton}
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="statusID">
                              Fixed Asset Condition *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.statusID && errors.statusID)}
                              fullWidth
                              helperText={touched.statusID && errors.statusID}
                              name="statusID"
                              onChange={(e) => handleChange(e)}
                              size='small'
                              value={values.statusID}
                              variant="outlined"
                              id="statusID"
                            >
                              <MenuItem value="0">--Select Fixed Asset Condition--</MenuItem>
                              <MenuItem value="1">New</MenuItem>
                              <MenuItem value="2">Used</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="glNumber">
                              G/L Number *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.glNumber && errors.glNumber)}
                              fullWidth
                              helperText={touched.glNumber && errors.glNumber}
                              name="glNumber"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              size='small'
                              value={values.glNumber}
                              variant="outlined"
                              disabled={isDisableButton}
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="accumulatedDepreciationGL">
                              Accumulated Depreciation G/L *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.accumulatedDepreciationGL && errors.accumulatedDepreciationGL)}
                              fullWidth
                              helperText={touched.accumulatedDepreciationGL && errors.accumulatedDepreciationGL}
                              name="accumulatedDepreciationGL"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={values.accumulatedDepreciationGL}
                              size='small'
                              variant="outlined"
                              disabled={isDisableButton}
                            >
                              <MenuItem value="0">--Select Accumulated Depreciation G/L--</MenuItem>
                              <MenuItem value="1">BOC Fixed Asset Ledger</MenuItem>
                              <MenuItem value="2">Ledger Income</MenuItem>
                              {/* {generateDropDownMenu(factories)} */}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="depreciationExpenseGL">
                              Depreciation Expense G/L *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.depreciationExpenseGL && errors.depreciationExpenseGL)}
                              fullWidth
                              helperText={touched.depreciationExpenseGL && errors.depreciationExpenseGL}
                              name="depreciationExpenseGL"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={values.depreciationExpenseGL}
                              size='small'
                              variant="outlined"
                              id="depreciationExpenseGL"
                            >
                              <MenuItem value="0">--Select Depreciation Expense G/L--</MenuItem>
                              <MenuItem value="1">Finance Ledger</MenuItem>
                              <MenuItem value="2">BOC Fixed Asset Ledger</MenuItem>
                              {/* {generateDropDownMenu(factories)} */}
                            </TextField>
                          </Grid>

                        </Grid>
                      </CardContent>
                      <Box display="flex" justifyContent="flex-end" p={2}>
                        <Button
                          color="primary"
                          type="submit"
                          variant="outlined"
                          onClick={() => clearData()}
                          size='small'
                        >
                          Clear
                        </Button>
                        <div>&nbsp;</div>
                        <Button
                          color="primary"
                          type="submit"
                          variant="contained"
                          size='small'
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
