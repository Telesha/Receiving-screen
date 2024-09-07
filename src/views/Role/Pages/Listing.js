import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, makeStyles, Container, CardHeader, CardContent, Divider, MenuItem, Grid, InputLabel, TextField
} from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import MaterialTable from "material-table";
import permissionService from "../../../utils/permissionAuth";
import tokenDecoder from 'src/utils/tokenDecoder';
import { LoadingComponent } from 'src/utils/newLoader';

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

const screenCode = 'ROLE';

export default function RoleListing() {
  const classes = useStyles();
  const [roleData, setRoleData] = useState([]);
  const [groups, setGroups] = useState();
  const [isViewTable, setIsViewTable] = useState(true);
  const [factories, setFactories] = useState();
  const [roleList, setRoleList] = useState({
    groupID: '0',
    factoryID: '0'
  })

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });

  const navigate = useNavigate();

  useEffect(() => {
    trackPromise(getPermissions())
  }, []);

  async function getPermissions() {
    var permissions = await permissionService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWROLE');

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

    setRoleList({
      roleList,
      groupID: parseInt(tokenDecoder.getGroupIDFromToken()),
      factoryID: parseInt(tokenDecoder.getFactoryIDFromToken())
    })

    trackPromise(getGroupsForDropdown());
  }

  let encrypted = "";
  const handleClick = () => {
    encrypted = btoa('0');
    navigate('/app/roles/addedit/' + encrypted);
  }

  const handleClickEdit = (roleID) => {
    encrypted = btoa(roleID.toString());
    navigate('/app/roles/addedit/' + encrypted);
  }

  const handleClickPermission = (roleID, roleLevelID) => {
    encrypted = btoa(roleID.toString());
    let encrypted1 = btoa(roleLevelID.toString());

    navigate('/app/rolePermission/listing/' + encrypted + "/" + encrypted1);
  }

  useEffect(() => {
    trackPromise(
      getFactoriesForDropdown()
    );
  }, [roleList.groupID]);

  useEffect(() => {
    trackPromise(
      getRoleDetailsByGroupIDFactoryID()
    )
    checkDisbursement();
  }, [roleList.factoryID]);

  async function getRoleDetailsByGroupIDFactoryID() {
    var result = await services.getRoleDetailsByGroupIDFactoryID(roleList.groupID, roleList.factoryID);
    setRoleData(result);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getAllFactoriesByGroupID(roleList.groupID);
    setFactories(factories);
  }

  function checkDisbursement() {
    if (roleList.factoryID === '0') {
      setIsViewTable(true);
    }
    else {
      setIsViewTable(false);
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

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setRoleList({
      ...roleList,
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
            toolTiptitle={"Add Role"}
          />
        </Grid>
      </Grid>
    )
  }

  return (
    <Page
      className={classes.root}
      title="Roles"
    >
      <LoadingComponent />
      <Container maxWidth={false}>
        <Box mt={0}>
          <Card>
            <CardHeader
              title={cardTitle("Role")}
            />
            <PerfectScrollbar>
              <Divider />
              <CardContent style={{ marginBottom: "2rem" }}>
                <Grid container spacing={3}>
                  <Grid item md={6} xs={12}>
                    <InputLabel shrink id="groupID">
                      Group  *
                    </InputLabel>
                    <TextField select
                      fullWidth
                      name="groupID"
                      onChange={(e) => handleChange(e)}
                      value={roleList.groupID}
                      size='small'
                      variant="outlined"
                      InputProps={{
                        readOnly: !permissionList.isGroupFilterEnabled,
                      }}
                    >
                      <MenuItem value="0">--Select Group--</MenuItem>
                      {generateDropDownMenu(groups)}
                    </TextField>
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <InputLabel shrink id="factoryID">
                      Estate  *
                    </InputLabel>
                    <TextField select
                      fullWidth
                      name="factoryID"
                      onChange={(e) => handleChange(e)}
                      size='small'
                      value={roleList.factoryID}
                      variant="outlined"
                      InputProps={{
                        readOnly: !permissionList.isFactoryFilterEnabled,
                      }}
                    >
                      <MenuItem value="0">--Select Factory--</MenuItem>
                      {generateDropDownMenu(factories)}
                    </TextField>
                  </Grid>
                  <Grid item md={12} xs={12}>
                    <MaterialTable
                      hidden={isViewTable}
                      title="Multiple Actions Preview"
                      columns={[
                        { title: 'Role Name', field: 'roleName' },
                        {
                          title: 'Status', field: 'isActive', lookup: {
                            true: 'Active',
                            false: 'Inactive'
                          }
                        },
                        { title: 'Role Level ID', field: 'roleLevelID', hidden: true },
                        { title: 'Role Level', field: 'roleLevelName' },
                      ]}
                      data={roleData}
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
                          tooltip: 'Edit Role',
                          onClick: (event, rowData) => { handleClickEdit(rowData.roleID) }
                        },
                        {
                          icon: 'list',
                          tooltip: 'Change Permission',
                          onClick: (event, rowData) => { handleClickPermission(rowData.roleID, rowData.roleLevelID) }
                        }
                      ]}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </PerfectScrollbar>

          </Card>
        </Box>
      </Container>
    </Page>
  );
};