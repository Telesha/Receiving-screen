import React, { useState, useEffect } from 'react';
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
  Chip,
  CardHeader,
  Button
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import PerfectScrollbar from 'react-perfect-scrollbar';
import MaterialTable from "material-table";
import { LoadingComponent } from 'src/utils/newLoader';
import { useAlert } from "react-alert";
import VisibilityIcon from '@material-ui/icons/Visibility';

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
  succes: {
    backgroundColor: "#fce3b6",
    marginLeft: "15px",
    marginBottom: "5px"
  }
}));

const screenCode = 'LEDGERACCOUNTAPPROVAL';

export default function LedgerAccountApprovalListing() {
  const alert = useAlert();
  const [title, setTitle] = useState("Ledger Account Approval")
  const classes = useStyles();
  const [groups, setGroups] = useState();
  const [disableEdit, setDisableEdit] = useState(false);
  const [factories, setFactories] = useState();
  const [accountList, setAccountList] = useState({
    groupID: '0',
    factoryID: '0',
    statusID: '0'
  })
  const [ledgerAccountData, setLedgerAccountData] = useState([]);
  const [PendingRequestCount, setPendingRequestCount] = useState(0)
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const navigate = useNavigate();
  let encrypted = "";

  const handleClickEdit = (ledgerAccountID) => {
    encrypted = btoa(ledgerAccountID.toString());
    navigate('/app/ledgerAcoountApproval/addEdit/' + encrypted);
  }

  const handleClickView = (ledgerAccountID) => {
    encrypted = btoa(ledgerAccountID.toString());
    navigate('/app/ledgerAcoountApproval/addEdit/' + encrypted);
  }

  useEffect(() => {
    trackPromise(getGroupsForDropdown(), getPermissions());
  }, []);

  useEffect(() => {
    trackPromise(getFactoriesForDropDown());
  }, [accountList.groupID]);

  useEffect(() => {
    //  trackPromise(getLedgerAccountDetailsByGroupIDFactoryID())
  }, [accountList.groupID, accountList.factoryID]);

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWLEDGERACCOUNTAPPROVAL');

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

    setAccountList({
      ...accountList,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function GetLedgerAccountDetailsByGroupIDFactoryIDStatusID() {
    const response = await services.GetLedgerAccountDetailsByGroupIDFactoryIDStatusID(accountList.groupID, accountList.factoryID, accountList.statusID);

    if (response.statusCode !== 'Success') {
      alert.error("No records to display");
      setPendingRequestCount(0)
      setLedgerAccountData([])
      return
    }

    const pendingAccountRequest = response.data.reduce((counter, obj) => obj.statusID === 1 ? counter += 1 : counter, 0);

    setPendingRequestCount(pendingAccountRequest)
    setLedgerAccountData(response.data);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroups(groups);
  }

  async function getFactoriesForDropDown() {
    const factory = await services.getFactoryByGroupID(accountList.groupID);
    setFactories(factory);
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
    setAccountList({
      ...accountList,
      [e.target.name]: value,
      statusID: '0'
    });
    setPendingRequestCount(0)
    setLedgerAccountData([]);
  }

  function handleStatusChange(e) {
    const target = e.target;
    const value = target.value
    setAccountList({
      ...accountList,
      [e.target.name]: value
    });
    setPendingRequestCount(0)
    setLedgerAccountData([]);
  }

  function clearData() {
    setAccountList({
      ...accountList,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken()),
      statusID: '0'
    });
    setPendingRequestCount(0)
    setLedgerAccountData([]);

  }

  function searchData() {
    trackPromise(GetLedgerAccountDetailsByGroupIDFactoryIDStatusID())
  }

  return (
    <Page
      className={classes.root}
      title="Ledger Account Approval"
    >
      <Container maxWidth={false}>
        <LoadingComponent />
        <Box mt={0}>
          <Card>
            <CardHeader
              title={title}
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
                      size='small'
                      name="groupID"
                      onChange={(e) => handleChange(e)}
                      value={accountList.groupID}
                      disabled={!permissionList.isGroupFilterEnabled}
                      variant="outlined"
                    >
                      <MenuItem value="0">--Select Group--</MenuItem>
                      {generateDropDownMenu(groups)}
                    </TextField>
                  </Grid>
                  <Grid item md={4} xs={12}>
                    <InputLabel shrink id="factoryID">
                      Estate *
                    </InputLabel>
                    <TextField select
                      fullWidth
                      size='small'
                      name="factoryID"
                      onChange={(e) => handleChange(e)}
                      value={accountList.factoryID}
                      disabled={!permissionList.isFactoryFilterEnabled}
                      variant="outlined"
                      id="factoryID"
                    >
                      <MenuItem value="0">--Select Estate--</MenuItem>
                      {generateDropDownMenu(factories)}
                    </TextField>
                  </Grid>
                  <Grid item md={4} xs={12}>
                    <InputLabel shrink id="factoryID">
                      Status 
                    </InputLabel>
                    <TextField select
                      fullWidth
                      size='small'
                      name="statusID"
                      onChange={(e) => handleStatusChange(e)}
                      value={accountList.statusID}
                      variant="outlined"
                      id="statusID"
                    >
                      <MenuItem value="0">--Select Status--</MenuItem>
                      <MenuItem value="1">Pending</MenuItem>
                      <MenuItem value="2">Approve</MenuItem>
                      <MenuItem value="3">Reject</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
                <Box display="flex" flexDirection="row-reverse" p={2} >
                  <Button
                    color="primary"
                    type="submit"
                    variant="contained"
                    onClick={() => searchData()}
                  >
                    Search
                  </Button>
                  <div>&nbsp;</div>
                  <Button
                    color="primary"
                    type="reset"
                    variant="outlined"
                    onClick={() => clearData()}
                  >
                    Clear
                  </Button>
                </Box>
              </CardContent>

              {
                PendingRequestCount > 0 ?
                  <>
                    <Grid item xs={2} >
                      <Chip className={classes.succes} label={PendingRequestCount + " Pending Requests"} />
                    </Grid>
                  </>
                  : null
              }

              {
                ledgerAccountData.length > 0 ?
                  <Box minWidth={1050}>
                    <MaterialTable
                      title="Multiple Actions Preview"
                      columns={[
                        { title: 'Ledger Account Code', field: 'ledgerAccountCode' },
                        { title: 'Ledger Account Name', field: 'ledgerAccountName' },
                        { title: 'Account Type', field: 'accountTypeName' },
                        { title: 'Parent Header', field: 'parentHeaderName' },
                        {
                          title: 'Is Bank', field: 'isBank', lookup: {
                            false: 'No',
                            true: 'Yes',
                          }
                        },
                        { title: 'Child Header', field: 'childHeaderName' },
                        {
                          title: 'Created Date', render: rowData => {
                            if (rowData.createdDate != null)
                              return rowData.createdDate.split('T')[0]
                          }
                        },
                        {
                          title: 'Status', field: 'statusID', lookup: {
                            1: 'Pending',
                            2: 'Approve',
                            3: 'Reject'
                          },
                          defaultSort: "desc"
                        },
                      ]}
                      data={ledgerAccountData}
                      options={{
                        exportButton: false,
                        showTitle: false,
                        headerStyle: { textAlign: "left", height: '1%' },
                        cellStyle: { textAlign: "left" },
                        columnResizable: false,
                        actionsColumnIndex: -1,
                        rowStyle: rowData => ({
                          backgroundColor: (rowData.statusID === 1) ? '#fce3b6' : '#fff'
                        })
                      }}
                      actions={[
                        rowData => ({
                          hidden: (rowData.statusID !== 1),
                          icon: 'edit',
                          tooltip: 'Edit',
                          onClick: (event, rowData) => handleClickEdit(rowData.ledgerAccountID)
                        }),
                        rowData => ({
                          hidden: (rowData.statusID !== 2 && rowData.statusID !== 3),
                          icon: VisibilityIcon,
                          tooltip: 'Edit',
                          onClick: (event, ledgerAccountData) => handleClickView(ledgerAccountData.ledgerAccountID)
                        }),
                      ]}
                    />
                  </Box>
                  : null
              }
            </PerfectScrollbar>
          </Card>
        </Box>
      </Container>
    </Page>

  );

};
