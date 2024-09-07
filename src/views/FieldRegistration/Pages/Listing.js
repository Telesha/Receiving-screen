import React, { useState, useEffect, createContext } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Card, makeStyles, Container, CardHeader, CardContent, Divider, MenuItem, Grid, InputLabel, TextField, Button } from '@material-ui/core';
import Page from 'src/components/Page';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from 'yup';
import { useAlert } from 'react-alert';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import MaterialTable from "material-table";
import { AlignCenter } from 'react-feather';

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

const screenCode = 'FIELDREGISTRATION';
export default function FieldRegistrationListing() {
  const classes = useStyles();
  const alert = useAlert();
  const [fieldData, setFieldData] = useState([]);
  const [groups, setGroups] = useState();
  const [estates, setEstates] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [fieldList, setFieldList] = useState({
    groupID: '0',
    estateID: '0',
    divisionID: '0'
  })

  const navigate = useNavigate();
  let encrypted = "";
  const handleClick = () => {
    encrypted = btoa('0');
    navigate('/app/fieldRegistration/addedit/' + encrypted);
  }

  const handleClickEdit = (fieldID) => {
    encrypted = btoa(fieldID.toString());
    navigate('/app/fieldRegistration/addedit/' + encrypted);
  }

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });

  useEffect(() => {
    trackPromise(
      getPermissions(),
      getGroupsForDropdown(),
    );
  }, []);

  useEffect(() => {
    setFieldList({
      ...fieldList,
      groupID: 0,
      estateID: 0,
    });
  }, [permissionList.isGroupFilterEnabled == true]);

  // useEffect(() => {
  //   if (fieldList.groupID > 0 || fieldList.estateID > 0 || fieldList.divisionID > 0) {
  //     trackPromise(getFieldDetailsByGroupIDEstateIDDivisionID());
  //   }
  // }, [fieldList.groupID, fieldList.estateID, fieldList.divisionID]);

  useEffect(() => {
    if (fieldList.groupID > 0) {
      trackPromise(getEstateDetailsByGroupID());
    }
  }, [fieldList.groupID]);

  useEffect(() => {
    if (fieldList.estateID > 0) {
      trackPromise(getDivisionDetailsByEstateID());
    }
  }, [fieldList.estateID]);

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWFIELDLISTING');

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

    setFieldList({
      ...fieldList,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      estateID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getFieldDetailsByGroupIDEstateIDDivisionID() {
    const fieldItem = await services.getFieldDetailsByGroupIDEstateIDDivisionID(
      fieldList.groupID == 0 ? null : fieldList.groupID,
      fieldList.estateID == 0 ? null : fieldList.estateID,
      fieldList.divisionID
    );
    if (fieldItem.length != 0) {
      setFieldData(fieldItem);
    }
    else {
      alert.error('No records to display');
    }
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getEstateDetailsByGroupID() {
    var response = await services.getEstateDetailsByGroupID(fieldList.groupID);
    setEstates(response);
  }

  async function getDivisionDetailsByEstateID() {
    var response = await services.getDivisionDetailsByEstateID(fieldList.estateID);
    setDivisions(response);
  }

  async function GetDetails() {
    getFieldDetailsByGroupIDEstateIDDivisionID();
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
    setFieldList({
      ...fieldList,
      [e.target.name]: value
    });
    setFieldData([]);
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
            toolTiptitle={"Add Field Item"}
          />
        </Grid>
      </Grid>
    )
  }

  return (
    <Page className={classes.root} title="Fields">
      <Container maxWidth={false}>
        <Formik
          initialValues={{
            groupID: fieldList.groupID,
            estateID: fieldList.estateID,
            divisionID: fieldList.divisionID,
          }}
          validationSchema={Yup.object().shape({
            groupID: Yup.number().required('Group required').min('1', 'Group required'),
            estateID: Yup.number().required('Estate required').min('1', 'Estate required'),
          })}
          // onSubmit={() => trackPromise(addDetails())}
          enableReinitialize
        >
          {({ errors, handleBlur, handleSubmit, touched }) => (
            <form onSubmit={handleSubmit}>
              <Box mt={0}>
                <Card>
                  <CardHeader
                    title={cardTitle("Fields")}
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
                            onChange={(e) => handleChange(e)}
                            value={fieldList.groupID}
                            variant="outlined"
                            size='small'
                            InputProps={{
                              readOnly: !permissionList.isGroupFilterEnabled,
                            }}
                          >
                            <MenuItem value="0">--Select Group--</MenuItem>
                            {generateDropDownMenu(groups)}
                          </TextField>
                        </Grid>

                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="estateID">
                            Estate *
                          </InputLabel>
                          <TextField select
                            error={Boolean(touched.estateID && errors.estateID)}
                            fullWidth
                            helperText={touched.estateID && errors.estateID}
                            name="estateID"
                            size='small'
                            onChange={(e) => {
                              handleChange(e)
                            }}
                            value={fieldList.estateID}
                            variant="outlined"
                            id="estateID"
                            InputProps={{
                              readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                            }}
                          >
                            <MenuItem value={0}>--Select Estate--</MenuItem>
                            {generateDropDownMenu(estates)}
                          </TextField>
                        </Grid>
                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="divisionID">
                            Division
                          </InputLabel>
                          <TextField select
                            fullWidth
                            name="divisionID"
                            size='small'
                            onChange={(e) => {
                              handleChange(e)
                            }}
                            value={fieldList.divisionID}
                            variant="outlined"
                            id="divisionID"
                          >
                            <MenuItem value={0}>--Select Division--</MenuItem>
                            {generateDropDownMenu(divisions)}
                          </TextField>
                        </Grid>
                        <Grid item md={3} xs={12} container justify="flex-end" style={{ marginTop: 15 }}>
                          <Box pr={2}>
                            <Button
                              color="primary"
                              variant="contained"
                              type="submit"
                              onClick={() => trackPromise(GetDetails())}
                            >
                              Search
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                    <Box minWidth={1000} hidden={fieldData.length == 0}>
                      <MaterialTable
                        title="Multiple Actions Preview"
                        columns={[
                          { title: 'Division Name', field: 'divisionName' },
                          { title: 'Field Code', field: 'fieldCode' },
                          { title: 'Field Name', field: 'fieldName' },
                          { title: 'Section Type', field: 'sectionTypeName' },
                        ]}
                        data={fieldData}
                        options={{
                          exportButton: false,
                          showTitle: false,
                          headerStyle: { textAlign: "left", height: '1%' },
                          cellStyle: { textAlign: "left" },
                          columnResizable: false,
                          actionsColumnIndex: -1,
                          actionsCellStyle: {
                            display: 'flex',
                            justifyContent: 'center',
                            padding: '10px',
                            width: '100%',
                            marginBottom: '-1px',
                          },
                        }}
                        actions={[
                          {
                            icon: 'edit',
                            tooltip: 'Edit Field',
                            onClick: (event, rowData) => { handleClickEdit(rowData.fieldID) }
                          },
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
  );
};
