import React, { useState, useEffect, Fragment, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Button, Card, makeStyles, Container, CardHeader, CardContent, Divider, MenuItem, Grid, InputLabel, TextField } from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from "yup";
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder'
import { LoadingComponent } from './../../../utils/newLoader';
import MaterialTable from "material-table";
import { useAlert } from "react-alert";

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

const screenCode = 'GRADE';

export default function GradeListing() {
  const [title, setTitle] = useState("Grade");
  const classes = useStyles();
  const [GroupList, setGroupList] = useState([]);
  const [FactoryList, setFactoryList] = useState([]);
  const [gradeDetail, setGradeDetailDetail] = useState({
    groupID: 0,
    factoryID: 0,
  });
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const navigate = useNavigate();
  let encrypted = "";
  const handleClick = () => {
    encrypted = btoa('0');
    navigate('/app/grade/addEdit/' + encrypted)
  }
  const handleClickEdit = (gradeID) => {
    encrypted = btoa(gradeID.toString());
    navigate('/app/grade/addEdit/' + encrypted);
  }
  const alert = useAlert();
  const componentRef = useRef();
  const [gradeDetailsList, setGradeDetailsList] = useState([]);
  const [firstLoad, setFirstLoad] = useState({
    load: 0
  })

  useEffect(() => {
    if (gradeDetail.factoryID != null) {
      GetGradeDetailsListFirst()
    }
  }, [firstLoad.load]);

  useEffect(() => {
    trackPromise(
      getPermission());
    trackPromise(
      getGroupsForDropdown());
  }, []);

  useEffect(() => {
    trackPromise(
      getFactoriesForDropdown());
  }, [gradeDetail.groupID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWGRADE');
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

    setGradeDetailDetail({
      ...gradeDetail,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })

    setFirstLoad({
      ...firstLoad,
      load: 1
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroupList(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getFactoryByGroupID(gradeDetail.groupID);
    setFactoryList(factories);
  }

  async function GetGradeDetailsListFirst() {
    const response = await services.GetGradeDetails(gradeDetail.groupID, gradeDetail.factoryID);
    if (response.statusCode == "Success" && response.data != null) {
      setGradeDetailsList(response.data);
    }
  }

  async function GetGradeDetailsList() {
    const response = await services.GetGradeDetails(gradeDetail.groupID, gradeDetail.factoryID);
    if (response.statusCode == "Success" && response.data != null) {

      setGradeDetailsList(response.data);
      if (response.data.length == 0) {
        alert.error("No records to display");
      }
    }
    else {
      alert.error(response.message);

    }
  }

  function generateDropDownMenu(data) {
    let items = []
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
      }
    }
    return items;
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setGradeDetailDetail({
      ...gradeDetail,
      [e.target.name]: value
    });
    setGradeDetailsList([]);
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
            toolTiptitle={"Add Grade"}
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
              groupID: gradeDetail.groupID,
              factoryID: gradeDetail.factoryID
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
              })
            }
            onSubmit={() => trackPromise(GetGradeDetailsList())}
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
                    <CardHeader title={cardTitle(title)} />
                    <PerfectScrollbar>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item md={3} xs={8}>
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
                              value={gradeDetail.groupID}
                              variant="outlined"
                              id="groupID"
                              disabled={!permissionList.isGroupFilterEnabled}
                              size='small'
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(GroupList)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={8}>
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
                              value={gradeDetail.factoryID}
                              variant="outlined"
                              id="factoryID"
                              disabled={!permissionList.isFactoryFilterEnabled}
                              size='small'
                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateDropDownMenu(FactoryList)}
                            </TextField>
                          </Grid>
                        </Grid>
                        <Box display="flex" flexDirection="row-reverse" p={2} >
                          <Button
                            color="primary"
                            type="submit"
                            variant="contained"
                          >
                            Search
                          </Button>
                        </Box>
                      </CardContent>
                      <Box minWidth={1050}>
                        {gradeDetailsList.length > 0 ?
                          <MaterialTable
                            title="Multiple Actions Preview"
                            columns={[
                              { title: 'Grade Code', field: 'gradeCode' },
                              { title: 'Grade Name', field: 'gradeName' },
                              {
                                title: 'Grade Category', field: 'gradeCategoryID', lookup: {
                                  1: 'M',
                                  2: 'O'
                                }
                              },
                              {
                                title: 'Grade Type', field: 'gradeTypeID', lookup: {
                                  1: 'SmallLeafy',
                                  2: 'Leafy',
                                  3: 'OffGrade',
                                  4: 'Primer',
                                }
                              },
                              { title: 'Sample Allowance', field: 'sampleAllowance' },
                              {
                                title: 'Status', field: 'isActive',
                                render: rowData => rowData.isActive == true ? 'Active' : 'Inactive'
                              },
                            ]}
                            data={gradeDetailsList}
                            options={{
                              exportButton: false,
                              showTitle: false,
                              headerStyle: { textAlign: "left", height: '1%' },
                              cellStyle: { textAlign: "left" },
                              columnResizable: false,
                              actionsColumnIndex: -1,
                              pageSize: 10
                            }}
                            actions={[{
                              icon: 'edit',
                              tooltip: 'Edit',
                              onClick: (event, rowData) => handleClickEdit(rowData.gradeID)
                            }]}
                          /> : null}
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
}
