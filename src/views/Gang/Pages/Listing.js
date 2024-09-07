import React, { useState, useEffect, createContext } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Card, makeStyles, Container, CardHeader, CardContent, Divider, MenuItem, Grid, InputLabel, TextField } from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import MaterialTable from "material-table";

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

const screenCode = 'GANGREGISTRATION';
export default function GangRegistrationListing() {
  const classes = useStyles();
  const [gangData, setGangData] = useState([]);
  const [groups, setGroups] = useState();
  const [estates, setEstates] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [gangList, setGangList] = useState({
    groupID: '0',
    estateID: '0',
    divisionID: '0'
  })

  const navigate = useNavigate();
  let encrypted = "";
  const handleClick = () => {
    encrypted = btoa('0');
    navigate('/app/gangRegistration/addedit/' + encrypted);
  }

  const handleClickEdit = (gangID) => {
    encrypted = btoa(gangID.toString());
    navigate('/app/gangRegistration/addedit/' + encrypted);
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
    getGangDetailsByGroupIDEstateIDDivisionID();
  }, [gangList.groupID,gangList.estateID,gangList.divisionID]);

  useEffect(() => {
    getEstateDetailsByGroupID();
  }, [gangList.groupID]);

  useEffect(() => {
    getDivisionDetailsByEstateID();
  }, [gangList.estateID]);

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWGANGLISTING');

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

    setGangList({
      ...gangList,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      estateID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGangDetailsByGroupIDEstateIDDivisionID() {
    const gangItem = await services.getGangDetailsByGroupIDEstateIDDivisionID(gangList.groupID,gangList.estateID,gangList.divisionID);
    setGangData(gangItem);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getEstateDetailsByGroupID() {
    var response = await services.getEstateDetailsByGroupID(gangList.groupID);
    setEstates(response);
  }

  async function getDivisionDetailsByEstateID() {
    var response = await services.getDivisionDetailsByEstateID(gangList.estateID);
    setDivisions(response);
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
    setGangList({
      ...gangList,
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
            toolTiptitle={"Add Gang Item"}
          />
        </Grid>
      </Grid>
    )
  }

  return (
    <Page
      className={classes.root}
      title="Gangs"
    >
      <Container maxWidth={false}>
        <Box mt={0}>
          <Card>
            <CardHeader
              title={cardTitle("Gangs")}
            />
            <PerfectScrollbar>
              <Divider />
              <CardContent style={{ marginBottom: "2rem" }}>
                <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                              <InputLabel shrink id="groupID">  
                                Group  *
                              </InputLabel>
                              <TextField select
                                fullWidth
                                name="groupID"
                                onChange={(e) => handleChange(e)}
                                value={gangList.groupID}
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

                           <Grid item md={4} xs={12}>
                              <InputLabel shrink id="estateID">
                                Estate *
                              </InputLabel>
                              <TextField select 
                                fullWidth 
                                name="estateID" 
                                size='small'
                                onChange={(e) => {
                                  handleChange(e)
                                }}
                                value={gangList.estateID}
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
                          <Grid item md={4} xs={12}>
                              <InputLabel shrink id="divisionID">
                                Division * 
                              </InputLabel>
                              <TextField select 
                                fullWidth 
                                name="divisionID"
                                size='small' 
                                onChange={(e) => {
                                  handleChange(e)
                                }}
                                value={gangList.divisionID}
                                variant="outlined"
                                id="divisionID"
                              >
                                <MenuItem value={0}>--Select Division--</MenuItem>
                                {generateDropDownMenu(divisions)}
                              </TextField>
                          </Grid> 
                </Grid>
              </CardContent>
              <Box minWidth={1050}> 
                <MaterialTable
                  title="Multiple Actions Preview"
                  columns={[
                    { title: 'Gang Code', field: 'gangCode' },
                    { title: 'Gang Name', field: 'gangName' },
                    { title: 'Created Date', field: 'createdDate', render: rowData => rowData.createdDate.split('T')[0]},   
                    { title: 'Status', field: 'isActive', render: rowData => rowData.isActive == true ? 'Active' : 'Inactive' },
                  ]}
                  data={gangData}
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
                      tooltip: 'Edit Gang',
                      onClick: (event, rowData) => { handleClickEdit(rowData.gangID) }
                    },
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
