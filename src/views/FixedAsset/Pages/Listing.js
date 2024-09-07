import React, { useState, Fragment, createContext } from 'react';
import clsx from 'clsx';
import PropTypes, { func } from 'prop-types';
import moment from 'moment';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Avatar,
  Box,
  Card,
  Checkbox,
  Table,
  Grid,
  TableBody,
  TableCell,
  TableHead,
  MenuItem,
  TextField,
  InputLabel,
  makeStyles,
  Container,
  CardHeader,
  CardContent,
  Button,
  Divider
} from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import BorderColorTwoToneIcon from '@material-ui/icons/BorderColorTwoTone';
import { trackPromise } from 'react-promise-tracker';
import MaterialTable from "material-table";
import * as Yup from "yup";
import { Formik, validateYupSchema } from 'formik';
import { LoadingComponent } from '../../../utils/newLoader';

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

export default function FixedAssetListing() {
  const classes = useStyles();
  const [selectedCustomerIds, setSelectedCustomerIds] = useState([]);
  const [limit, setLimit] = useState(10);
  const [isDisableButton, setIsDisableButton] = useState(true);
  const [page, setPage] = useState(0);
  const [routeList, setRouteList] = useState({
    groupID: '0',
    factoryID: '0',
    category: '0',
    fixedAssetCode: ''
  })
  const handleLimitChange = (event) => {
    setLimit(event.target.value);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const theData = [
    { fixedAssetCode: 'FA01', description: 'HP Pavilion Desktop', category: 'Computer', glNumber: 'GL01' },
    { fixedAssetCode: 'FA02', description: 'Seagate 4TB', category: 'Storage', glNumber: 'GL02' },
    { fixedAssetCode: 'FA03', description: 'LG Air Conditioner 12000BTU', category: 'Air Conditioner', glNumber: 'GL03' },
    { fixedAssetCode: 'FA04', description: 'Toyota Hiace', category: 'Van', glNumber: 'GL04' },
    { fixedAssetCode: 'FA05', description: 'Toyota Axio 2020', category: 'Car', glNumber: 'GL05' }
  ]

  const [groupData, setGroupData] = useState([]);
  const navigate = useNavigate();
  let encrypted = "";
  const handleClick = () => {
    encrypted = btoa('0');
    navigate('/app/fixedAsset/addedit/' + encrypted);
  }

  const handleClickEdit = (groupID) => {
    encrypted = btoa(groupID.toString());
    navigate('/app/fixedAsset/addedit/' + encrypted);
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setRouteList({
      ...routeList,
      [e.target.name]: value
    });
  }

  async function searchDetail() {
    await timeout(600);
    setIsDisableButton(false);
  }

  function timeout(delay) {
    return new Promise(res => setTimeout(res, delay));
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
            isEdit={true}
            toolTiptitle={"Add Fixed Asset"}
          />
        </Grid>
      </Grid>
    )
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page
        className={classes.root}
        title="Groups"
      >
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: routeList.groupID,
              factoryID: routeList.factoryID,
              fixedAssetCode: routeList.fixedAssetCode,
              category: routeList.category,
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group required').min("1", 'Group required'),
                factoryID: Yup.number().required('Factory required').min("1", 'Factory required'),
                fixedAssetCode: Yup.string(),
                category: Yup.number(),
              })
            }
            onSubmit={() => trackPromise(searchDetail())}
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
                      title={cardTitle("Fixed Asset")}
                    />
                    <PerfectScrollbar>
                      <Divider />
                      <CardContent style={{ marginBottom: "2rem" }}>
                        <Grid container spacing={4}>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="groupID">
                              Group  *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.groupID && errors.groupID)}
                              fullWidth
                              helperText={touched.groupID && errors.groupID}
                              name="groupID"
                              size='small'
                              onChange={(e) => handleChange(e)}
                              value={routeList.groupID}
                              variant="outlined"
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              <MenuItem value="1">Group One</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
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
                              value={routeList.factoryID}
                              variant="outlined"
                              id="factoryID"
                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              <MenuItem value="1">Factory One</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="category">
                              Category
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="category"
                              size='small'
                              onChange={(e) => handleChange(e)}
                              value={routeList.category}
                              variant="outlined"
                              id="category"
                            >
                              <MenuItem value="0">--Select Category--</MenuItem>
                              <MenuItem value="1">Office Items</MenuItem>
                              <MenuItem value="2">Vehicles</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="fixedAssetCode">
                              Fixed Asset Code
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="fixedAssetCode"
                              onChange={(e) => handleChange(e)}
                              value={routeList.fixedAssetCode}
                              size='small'
                              variant="outlined"
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                      <Box display="flex" justifyContent="flex-end" p={2}>
                        <Button
                          color="primary"
                          type="submit"
                          variant="contained"
                          size='small'
                        >
                          Search
                        </Button>
                      </Box>
                      <Box minWidth={1000} hidden={isDisableButton}>
                        <MaterialTable
                          title="Multiple Actions Preview"
                          columns={[
                            { title: 'Fixed Asset Code', field: 'fixedAssetCode' },
                            { title: 'Description', field: 'description' },
                            { title: 'Category', field: 'category' },
                            { title: 'G/L Number', field: 'glNumber' },
                          ]}
                          data={theData}
                          options={{
                            exportButton: false,
                            showTitle: false,
                            headerStyle: { textAlign: "left", height: '1%' },
                            cellStyle: { textAlign: "left" },
                            columnResizable: false,
                            actionsColumnIndex: -1
                          }}
                          actions={[
                            {
                              icon: 'edit',
                              tooltip: 'Edit Fixed Asset'
                            }
                          ]}
                        />
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

