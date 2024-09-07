import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Card, Grid, makeStyles, Container, Button, CardContent, Divider, CardHeader, MenuItem, InputLabel, TextField } from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from "yup";
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import { Mappings } from './Mappings';
import { trackPromise } from 'react-promise-tracker';
import { LoadingComponent } from '../../../utils/newLoader';
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
  },
  root1: {
    flexGrow: 4
  },
}));

const screenCode = 'SUPPLIERESTATEMAPPING'
export default function SupplierEstateMappingAddEdit() {
  const [title, setTitle] = useState("Map Suppliers to Estates");
  const classes = useStyles();
  const [supplierEstateMapping, setSupplierEstateMapping] = useState([]);
  const [supplierGeneralArray, setSupplierGeneralArray] = useState([]);
  const [groups, setGroups] = useState();
  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/app/supplierestatemapping/listing');
  }
  const alert = useAlert();
  const { routeID } = useParams();
  const [isUpdate, setIsUpdate] = useState(false);
  const [supplier, setSupplier] = useState({
    groupID: '0',
    isActive: true
  });
  let decryptedID = 0;
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });

  useEffect(() => {
    decryptedID = atob(routeID.toString());
    if (decryptedID != 0) {
      setIsUpdate(true);
      setTitle("Edit Supplier Estate Mapping");
    }
  }, []);

  useEffect(() => {
    trackPromise(getGroupsForDropdown(), getPermission());
  }, []);

  useEffect(() => {
    setGeneralValues();
  }, [supplierGeneralArray]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITSUPPLIERESTATEMAPPING');

    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
    });
    if (parseInt(atob(routeID.toString())) === 0) {
      setSupplier({
        ...supplier,
        groupID: parseInt(tokenService.getGroupIDFromToken()),

      })
    }
  }

  async function setGeneralValues() {
    if (Object.keys(supplierGeneralArray).length > 0 && isUpdate) {
      setSupplier({
        ...supplier,
        groupID: supplierGeneralArray.groupID,
        isActive: supplierGeneralArray.isActive,
      });
    }
  }

  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroups(groups);
  }

  async function saveMappings() {

    if (!isUpdate) {
      let saveModel = supplierEstateMapping.map((item) => {
        return {
          supplierID: item.supplierID,
          estateID: item.estateID,
          isActive: true,
          createdBy: 1,
          createdDate: new Date()
        }
      });
      let response = await services.saveSupplierEstateMapping(saveModel);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        navigate('/app/supplierestatemapping/listing');
      }
      else {
        alert.error(response.message);
      }
    }
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

  function generateDropDownMenu(data) {
    let items = []
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
      }
    }
    return items
  }

  function handleChange1(e) {
    const target = e.target;
    const value = target.name === 'isActive' ? target.checked : target.value;
    setSupplier({
      ...supplier,
      [e.target.name]: value
    });
  }
  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: supplier.groupID,

            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min(1, 'Please select a group'),

              })
            }
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleSubmit,
              touched,
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
                        <Grid container spacing={3}>
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
                              value={supplier.groupID}
                              variant="outlined"
                              InputProps={{
                                readOnly: isUpdate || !permissionList.isGroupFilterEnabled ? true : false,
                              }}
                              size='small'
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(groups)}
                            </TextField>
                          </Grid>
                        </Grid>

                        {supplier.groupID != 0 &&
                          <Mappings
                            groupID={supplier.groupID}
                            supplierEstateMapping={supplierEstateMapping}
                            setSupplierEstateMapping={setSupplierEstateMapping}
                          />}
                        <Box display="flex" justifyContent="flex-end" hidden={supplier.groupID == 0}>
                          <Button
                            color="primary"
                            type="submit"
                            variant="contained"
                            onClick={() => saveMappings()}
                            style={{ marginTop: '2rem' }}
                          >
                            {isUpdate ? "Update" : "Save"}
                          </Button>
                        </Box>
                      </CardContent>
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
