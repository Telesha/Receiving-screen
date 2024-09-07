import React, { useState, useEffect, createContext } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  makeStyles,
  Container,
  CardContent,
  Divider,
  MenuItem,
  Grid,
  InputLabel,
  TextField,
  CardHeader
} from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import MaterialTable from 'material-table';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { Fragment } from 'react';
import { LoadingComponent } from '../../../utils/newLoader';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
}));

const screenCode = "FUNDMAINTAINANCE"

export default function FundMaintenanceListing() {
  const [title, setTitle] = useState("Saving & Fund Maintenance")
  const classes = useStyles();
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [fundMaintenanceData, setFundMaintenanceData] = useState([]);
  const [fundFilterData, setFundFilterData] = useState({
    groupID: '0',
    factoryID: '0'
  })
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const navigate = useNavigate();
  let encrypted = "";

  const handleClick = () => {
    encrypted = btoa('0');
    navigate('/app/fundMaintenance/addedit/' + encrypted);
  }

  const handleClickEdit = (fundMasterID) => {
    encrypted = btoa(fundMasterID.toString());
    navigate('/app/fundMaintenance/addedit/' + encrypted);
  }

  useEffect(() => {
    trackPromise(
      getPermission()
    );
  }, []);

  useEffect(() => {
    trackPromise(
      getFactoriesForDropDown(),
    )
  }, [fundFilterData.groupID]);

  useEffect(() => {
    trackPromise(
      getFundMaintainByFactoryID()
    )
  }, [fundFilterData.factoryID]);


  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'LISTINGEDITFUNDMAINTAINANCE');

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

    setFundFilterData({
      ...fundFilterData,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    });

    getGroupsForDropdown();
  }

  async function getFactoriesForDropDown() {
    const factory = await services.getFactoryByGroupID(fundFilterData.groupID);
    setFactories(factory);
  }

  async function getFundMaintainByFactoryID() {
    var response = await services.getFundMasterDataByFactoryId(fundFilterData.factoryID);
    setFundMaintenanceData(response);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
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
    setFundFilterData({
      ...fundFilterData,
      [e.target.name]: value
    });
  }

  function handleGroupChange(e) {
    const target = e.target;
    const value = target.value
    setFundFilterData({
      ...fundFilterData,
      [e.target.name]: value,
      factoryID: 0,
      factoryItemID: 0
    });
  }

  function handleFactoryChange(e) {
    const target = e.target;
    const value = target.value
    setFundFilterData({
      ...fundFilterData,
      [e.target.name]: value,
      factoryItemID: 0
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
            toolTiptitle={"Add Fund"}
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
        title={title}
      >
        <Container maxWidth={false}>
          <Box mt={0}>
            <Card>
              <CardHeader
                title={cardTitle(title)}
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
                        onChange={(e) => handleGroupChange(e)}
                        value={fundFilterData.groupID}
                        size = 'small'
                        variant="outlined"
                        InputProps={{
                          readOnly: !permissionList.isGroupFilterEnabled,
                      }}
                      >
                        <MenuItem value="0">--Select Group--</MenuItem>
                        {generateDropDownMenu(groups)}
                      </TextField>
                    </Grid>

                    <Grid item md={4} xs={12}>
                      <InputLabel shrink id="factoryID">
                        Factory *
                    </InputLabel>
                      <TextField select
                        fullWidth
                        name="factoryID"
                        onChange={(e) => handleFactoryChange(e)}
                        value={fundFilterData.factoryID}
                        size = 'small'
                        variant="outlined"
                        id="factoryID"
                        InputProps={{
                          readOnly: !permissionList.isGroupFilterEnabled,
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
                    title="Factory Item GRN Table"
                    columns={[
                      { title: 'Fund MasterID', field: 'fundMasterID', hidden: true , width: "10%"  },
                      { title: 'Saving & Fund Code', field: 'fundCode', width: "10%"  },
                      { title: 'Saving & Fund Name', field: 'fundName', width: "50%"   },
                      { title: 'Status', field: 'isActive',lookup: { 
                        true: 'Active', 
                        false: 'Inactive' 
                    }, width: "20%"   }
                    ]}
                    data={fundMaintenanceData}
                    options={{
                      search: true,
                      actionsColumnIndex: -1,
                      showTitle: false,
                      cellStyle: { textAlign: "left",  width: 200, },
                      headerStyle: { textAlign: "left", height: '1%',width: 30, },
                    }}
                    
                    actions={[{
                      icon: 'edit',
                      tooltip: 'Edit',
                      onClick: (event, rowData) => handleClickEdit(rowData.fundMasterID)
                    }]}
                  />
                </Box>
              </PerfectScrollbar>
            </Card>
          </Box>
        </Container>
      </Page>
    </Fragment>
  );
};

