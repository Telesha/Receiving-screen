import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  makeStyles,
  Container,
  CardHeader,
  CardContent,
  Divider,
  MenuItem,
  Grid,
  InputLabel,
  TextField,
  Button
} from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import MaterialTable from "material-table";
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
}));

var screenCode = "SUPPLIERESTATEMAPPING";

export default function SupplierEstateMappingListing() {
  const classes = useStyles();
  const [mappingData, setMappingData] = useState([]);
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [isSearchClicked, setIsSearchClicked] = useState(false);
  const [routeList, setRouteList] = useState({
    groupID: '0',
    estateID: '0',

  });
  const navigate = useNavigate();
  let encrypted = "";

  const handleClick = () => {
    encrypted = btoa('0');
    navigate('/app/supplierestatemapping/addedit/' + encrypted);
  };

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });


  useEffect(() => {
    getPermissions();
    getGroupsForDropdown();
  }, []);

  useEffect(() => {
    trackPromise(
      getFactoriesByGroupID()
    );
    setIsSearchClicked(false)
  }, [routeList.groupID]);

  useEffect(() => {
    setIsSearchClicked(false)
  }, [routeList.estateID]);

  function getPermissions() {
    authService.getPermissionsByScreen(screenCode)
      .then(permissions => {
        const isAuthorized = permissions.find(p => p.permissionCode === 'VIEWSUPPLIERESTATEMAPPING');

        if (isAuthorized === undefined) {
          navigate('/404');
        }

        const isGroupFilterEnabled = permissions.find(p => p.permissionCode === 'GROUPDROPDOWN');
        const isFactoryFilterEnabled = permissions.find(p => p.permissionCode === 'FACTORYDROPDOWN');

        setPermissions({
          ...permissionList,
          isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
          isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
        });

        setRouteList({
          ...routeList,
          groupID: parseInt(tokenService.getGroupIDFromToken()),
          estateID: parseInt(tokenService.getFactoryIDFromToken())
        });
      })
      .catch(error => {
      });
  }

  async function getFactoriesByGroupID() {
    try {
      const fac = await services.getfactoriesForDropDown(routeList.groupID);
      setFactories(fac);
    } catch (error) {
    }
  }

  async function GetSuppliersForListing() {
    try {
      const mappings = await services.GetSuppliersForListing(routeList.groupID, routeList.estateID);
      setMappingData(mappings);
    } catch (error) {
    }
  }

  async function getGroupsForDropdown() {
    try {
      const groups = await services.getGroupsForDropdown();
      setGroups(groups);
    } catch (error) {
    }
  }

  function generateDropDownMenu(data) {
    let items = [];
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
      }
    }
    return items;
  }

  function handleChange(e) {
    const target = e.target;
    const name = target.name;
    let value = target.value;

    if (name === 'statusID') {
      value = value === '' ? '' : parseInt(value, 10);
    }

    setRouteList({
      ...routeList,
      [name]: value
    });
  }

  const handleClickSearch = () => {
    setIsSearchClicked(true);
    trackPromise(GetSuppliersForListing());
  };

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
            toolTiptitle={"Add Supplier Estate Mapping"}
          />
        </Grid>
      </Grid>
    );
  }

  return (
    <Page
      className={classes.root}
      title="Supplier Estate Mapping"
    >
      <Container maxWidth={false}>
        <Box mt={0}>
          <Card>
            <CardHeader
              title={cardTitle("Supplier Estate Mapping")}
            />
            <PerfectScrollbar>
              <Divider />
              <CardContent style={{ marginBottom: "2rem" }}>
                <Grid container spacing={3}>
                  <Grid item md={3} xs={12}>
                    <InputLabel shrink id="groupID">
                      Group  *
                    </InputLabel>
                    <TextField select
                      fullWidth
                      name="groupID"
                      onChange={(e) => handleChange(e)}
                      size='small'
                      value={routeList.groupID}
                      variant="outlined"
                      InputProps={{
                        readOnly: !permissionList.isGroupFilterEnabled ? true : false
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
                      fullWidth
                      name="estateID"
                      onChange={(e) => handleChange(e)}
                      size='small'
                      value={routeList.estateID}
                      variant="outlined"
                      id="estateID"
                      InputProps={{
                        readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                      }}
                    >
                      <MenuItem value={1}>--Select Estate--</MenuItem>
                      {generateDropDownMenu(factories)}
                    </TextField>
                  </Grid>
                  <br></br>
                  <Grid item md={3} xs={12}>
                    <Box display="flex" justifyContent="flex-end" p={2}>
                      <Button
                        color="primary"
                        type="submit"
                        variant="contained"
                        onClick={handleClickSearch}
                      >
                        Search
                      </Button>
                    </Box>
                  </Grid>

                </Grid>
              </CardContent>
              {isSearchClicked && (
                <Box minWidth={1000}>
                  <MaterialTable
                    title="Multiple Actions Preview"
                    columns={[

                      { title: 'Supplier Name', field: 'supplierName' },
                      { title: 'Supplier Code', field: 'supplierCode' },
                      { title: 'NIC/BR Number', field: 'nicBRNumber' },
                      {
                        title: 'Status',
                        field: 'isActive',
                        lookup: {
                          true: 'Active',
                          false: 'Inactive'
                        }
                      },

                    ]}
                    data={mappingData}
                    options={{
                      exportButton: false,
                      showTitle: false,
                      headerStyle: { textAlign: "left", height: '1%' },
                      cellStyle: { textAlign: "left" },
                      columnResizable: false,
                      actionsColumnIndex: -1
                    }}
                  />
                </Box>
              )}
            </PerfectScrollbar>
          </Card>
        </Box>
      </Container>
    </Page>
  );
}
