import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import MaterialTable from "material-table";
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
  Button
} from '@material-ui/core';
import * as Yup from "yup";
import { Formik } from 'formik';

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

const screenCode = 'STATUTORY';
export default function StatutoryListing() {
  const classes = useStyles();
  const [statutoryDetails, setStatutoryDetails] = useState();
  const [groups, setGroups] = useState();
  const [statutoryDetailsSearchList, setstatutoryDetailsSearchList] = useState({
    groupID: '0',
  })

  const navigate = useNavigate();
  let encrypted = "";
  const handleClick = () => {
    encrypted = btoa('0');
    navigate('/app/statutory/addedit/' + encrypted);
  }

  const handleClickEdit = (statutoryID) => {
    encrypted = btoa(statutoryID.toString());
    navigate('/app/statutory/addedit/' + encrypted);
  }

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });

  useEffect(() => {
    trackPromise(
      getPermissions(),
    );
  }, []);

  useEffect(() => {
    trackPromise(
      GetGroupsForDropdown());
  }, []);

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWSTATUTORYDETAILS');

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

    setstatutoryDetailsSearchList({
      ...statutoryDetailsSearchList,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function GetGroupsForDropdown() {
    const groups = await services.GetAllGroups();
    setGroups(groups);
  }

  async function GetStatutoryDetails() {
    var result = await services.GetStatutoryDetails(statutoryDetailsSearchList.groupID);
    setStatutoryDetails(result);
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

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setstatutoryDetailsSearchList({
      ...statutoryDetailsSearchList,
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
            isEdit={true}
            toolTiptitle={"Add Statutory"}
          />
        </Grid>
      </Grid>
    )
  }

  return (
    <Page
      className={classes.root}
      title="Statutory"
    >
      <Container maxWidth={false}>
        <Formik
          initialValues={{
            groupID: statutoryDetailsSearchList.groupID,
          }}
          validationSchema={
            Yup.object().shape({
              groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
            })
          }
          onSubmit={() => trackPromise(GetStatutoryDetails())}
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
                    title={cardTitle("Statutory")}
                  />
                  <PerfectScrollbar>
                    <Divider />
                    <CardContent style={{ marginBottom: "2rem" }}>
                      <Grid container spacing={3}>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="groupID">
                            Group   *
                          </InputLabel>
                          <TextField select
                            error={Boolean(touched.groupID && errors.groupID)}
                            fullWidth
                            helperText={touched.groupID && errors.groupID}
                            size='small'
                            name="groupID"
                            onChange={(e) => handleChange(e)}
                            value={statutoryDetailsSearchList.groupID}
                            variant="outlined"
                            InputProps={{
                              readOnly: !permissionList.isGroupFilterEnabled ? true : false
                            }}
                          >
                            <MenuItem value="0">--Select Group--</MenuItem>
                            {generateDropDownMenu(groups)}
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}></Grid>
                        <Grid item md={4} xs={12}>
                          <Box display="flex" container justifyContent="flex-end" p={2} >
                            <Button
                              color="primary"
                              type="submit"
                              variant="contained"
                            //onClick={handleSearch}
                            >
                              Search
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                    <Box minWidth={1050} style={{ marginRight: '20px', marginLeft: '20px' }}>
                      {statutoryDetails && statutoryDetails.length > 0 ?
                        <MaterialTable
                          title="Multiple Actions Preview"
                          columns={[
                            { title: 'Deduction Type', field: 'deductionTypeName' },
                            {
                              title: 'Apply Party', field: 'applyPartyID', lookup: {
                                1: "Employer",
                                2: "Employee"
                              }
                            },
                            { title: 'Designation ', field: 'designationName' },
                            { title: 'Amount (%)', field: 'percentageAmount' },
                            { title: 'Status', field: 'isActive', render: rowData => rowData.isActive == true ? 'Active' : 'Inactive' },
                          ]}
                          data={statutoryDetails}
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
                              icon: 'mode',
                              tooltip: 'Edit Item',
                              onClick: (event, rowData) => { handleClickEdit(rowData.statutoryID) }
                            },
                          ]}
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
  );
};

