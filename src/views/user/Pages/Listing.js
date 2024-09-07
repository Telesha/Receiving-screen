import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Avatar,
  Box,
  Card,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  makeStyles,
  Container,
  CardHeader,
  Grid,
  CardContent,
  MenuItem,
  InputLabel,
  TextField
} from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import NoEncryptionIcon from '@material-ui/icons/NoEncryption';
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
  avatar: {
    marginRight: theme.spacing(2)
  }

}));

const screenCode = 'USER';
export default function UserListing(props) {
  const classes = useStyles();
  const [selectedCustomerIds, setSelectedCustomerIds] = useState([]);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(0);
  const [userData, setUserData] = useState([]);
  const [isViewTable, setIsViewTable] = useState(true);
  const [groups, setGroups] = useState();
  const [roles, setRoles] = useState()
  const [factories, setFactories] = useState();
  const [userList, setUserList] = useState({
    groupID: '0',
    factoryID: '0',
    roleID: 0,
  })
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });

  const handleLimitChange = (event) => {
    setLimit(event.target.value);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const navigate = useNavigate();
  let encrypted = "";
  const handleClick = () => {
    encrypted = btoa('0');
    navigate('/app/users/addedit/' + encrypted);
  }

  const handleClickEdit = (userID) => {
    encrypted = btoa(userID.toString());
    navigate('/app/users/addedit/' + encrypted);
  }

  const handleClickChangePassword = (userID) => {
    encrypted = btoa(userID.toString());
    navigate('/app/users/passwordChange/' + encrypted);
  }

  useEffect(() => {
    trackPromise(getPermission());
    trackPromise(getGroupsForDropdown());
  }, []);

  useEffect(() => {
    trackPromise(
      getFactoriesForDropdown()
    );
  }, [userList.groupID]);



  useEffect(() => {
    trackPromise(
      getUserDetailsByGroupIDFactoryID(),
      getRolesForDropdown()
    )
    checkDisbursement();
  }, [userList.factoryID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWUSER');

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

    setUserList({
      ...userList,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })

    trackPromise(getGroupsForDropdown());
  }

  async function getUserDetailsByGroupIDFactoryID() {
    var result = await services.getUserDetailsByGroupIDFactoryID(userList.groupID, userList.factoryID);
    setUserData(result);
  }

  async function getRolesForDropdown() {
    const roles = await services.getRolesbyRoleLevelForListing(userList.factoryID);
    setRoles(roles);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getAllFactoriesByGroupID(userList.groupID);
    setFactories(factories);
  }

  function checkDisbursement() {
    if (userList.factoryID === '0') {
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
    setUserList({
      ...userList,
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
            toolTiptitle={"Add User"}
          />
        </Grid>
      </Grid>
    )
  }

  return (
    <Page
      className={classes.root}
      title="Users"
    >
      <Container maxWidth={false}>
        <Box mt={0}>
          <Card>
            <CardHeader
              title={cardTitle("User")}
            />
            <PerfectScrollbar>
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
                      size='small'
                      value={userList.groupID}
                      variant="outlined"
                      InputProps={{
                        readOnly: !permissionList.isGroupFilterEnabled ? true : false,
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
                      value={userList.factoryID}
                      variant="outlined"
                      InputProps={{
                        readOnly: !permissionList.isFactoryFilterEnabled ? true : false,
                      }}
                    >
                      <MenuItem value="0">--Select Factory--</MenuItem>
                      {generateDropDownMenu(factories)}
                    </TextField>
                  </Grid>
                </Grid>
              </CardContent>
              <Box minWidth={1000}>
                <MaterialTable
                  hidden={isViewTable}
                  title="Multiple Actions Preview"
                  columns={[
                    { title: 'Username', field: 'userName' },
                    { title: 'Role Name', field: 'roleName' },
                    { title: 'First Name', field: 'firstName' },
                    { title: 'Last Name', field: 'lastName' },
                    {
                      title: 'Status', field: 'isActive', lookup: {
                        true: 'Active',
                        false: 'Inactive'
                      }
                    },

                  ]}

                  data={userData}
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
                      tooltip: 'Edit User',
                      onClick: (event, userData) => handleClickEdit(userData.userID)
                    },
                    {
                      icon: () => <NoEncryptionIcon />,
                      tooltip: 'Reset',
                      onClick: (event, userData) => handleClickChangePassword(userData.userID)
                    }
                  ]}
                />
              </Box>
            </PerfectScrollbar>
          </Card>
        </Box>
      </Container>
    </Page>
  );
};
