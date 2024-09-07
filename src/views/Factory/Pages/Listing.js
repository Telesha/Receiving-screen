import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
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
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import MaterialTable from "material-table";
import tokenService from '../../../utils/tokenDecoder';
import authService from '../../../utils/permissionAuth';
import { useAlert } from 'react-alert';


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

const screenCode = 'FACTORY';
export default function FactoryListing(props) {
  const classes = useStyles();
  const [groups, setGroups] = useState();
  const [factoryList, setFactoryList] = useState({
    groupID: '0',
  })
  const [factoryData, setFactoryData] = useState([]);
  const navigate = useNavigate();
  let encryptedID = "";
  const handleClick = () => {
    encryptedID = btoa('0');
    navigate('/app/operationEntities/addEdit/' + encryptedID);
  }

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
  });
  const alert = useAlert();


  useEffect(() => {
    trackPromise(
      getGroupsForDropdown(), getPermission()
    );
  }, []);

  // useEffect(() => {
  //   trackPromise(
  //     getFactoriesByGroupID()
  //   )
  // }, [factoryList.groupID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWFACTORY');

    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,

    });

    setFactoryList({
      ...factoryList,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
    })
  }


  async function getFactoriesByGroupID() {
    var result = await services.getFactoriesByGroupID(factoryList.groupID);
    if (result.length > 0) {
      setFactoryData(result);
    } else {
      alert.error("No Records to Display")
    }

  }

  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroups(groups);
  }

  const EditFactoryDetails = (factoryID) => {
    encryptedID = btoa(factoryID.toString());
    navigate('/app/operationEntities/addEdit/' + encryptedID);
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
    setFactoryList({
      ...factoryList,
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
            toolTiptitle={"Add Operation Entity"}
          />
        </Grid>
      </Grid>
    )
  }

  return (
    <Page
      className={classes.root}
      title="Operation Entities"
    >
      <Container maxWidth={false}>
        <Box mt={0}>
          <Card>
            <CardHeader
              title={cardTitle("Operation Entity")}
            />
            <PerfectScrollbar>
              <Divider />
              <CardContent style={{ marginBottom: "2rem" }}>
                <Grid container spacing={3}>
                  <Grid item md={5} xs={12}>
                    <InputLabel shrink id="groupID">
                      Group  *
                    </InputLabel>
                    <TextField select
                      fullWidth
                      name="groupID"
                      size='small'
                      onChange={(e) => handleChange(e)}
                      value={factoryList.groupID}
                      variant="outlined"
                      InputProps={{
                        readOnly: !permissionList.isGroupFilterEnabled ? true : false
                      }}
                    >
                      <MenuItem value="0">--Select Group--</MenuItem>
                      {generateDropDownMenu(groups)}
                    </TextField>
                  </Grid>
                  <Grid item md={7} xs={12}>
                    <Box style={{ display: 'flex', justifyContent: 'end', paddingTop: '2vh' }}>
                      <Button
                        size="small"
                        color="primary"
                        variant="contained"
                        type="submit"
                        onClick={() => trackPromise(getFactoriesByGroupID())}
                      >
                        Search
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
              {factoryData.length > 0 ?
                <Box minWidth={1050}>
                  <MaterialTable
                    title="Multiple Actions Preview"
                    columns={[
                      { title: 'Operation Entity Code', field: 'factoryCode' },
                      { title: ' Operation Entity Name', field: 'factoryName' },
                      { title: 'Status', field: 'isActive', render: rowData => rowData.isActive == true ? 'Active' : 'Inactive' },
                    ]}
                    data={factoryData}
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
                        tooltip: 'Edit Operation Entity',
                        onClick: (event, rowData) => { EditFactoryDetails(rowData.factoryID) }
                      },
                    ]}
                  />
                </Box> : null}
            </PerfectScrollbar>
          </Card>
        </Box>
      </Container>
    </Page>
  );
};

