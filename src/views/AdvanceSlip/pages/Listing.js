import { Box, Card, Grid, CardContent, CardHeader, Container, makeStyles, Divider, InputLabel, MenuItem, TextField, Button, Table, TableHead, TableRow, TableCell, TableBody } from '@material-ui/core';
import React, { Fragment, useState } from 'react'
import { useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Navigate, useNavigate } from 'react-router';
import Page from 'src/components/Page';
import MeterialTable from 'material-table';
import authService from '../../../utils/permissionAuth';
import { trackPromise } from 'react-promise-tracker';
import Services from '../Services';
import tokenService from '../../../utils/tokenDecoder';
import { Formik } from 'formik';
import * as Yup from "yup";
import tokenDecoder from '../../../utils/tokenDecoder';
import { LoadingComponent } from 'src/utils/newLoader';
import { useAlert } from 'react-alert';
import GetAppIcon from '@material-ui/icons/GetApp';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
}));

var screenCode = "ADVANCESLIPGENERATE"

export default function AdvanceSlipListing() {

  const classes = useStyles();
  const [group, setGroup] = useState();
  const [factories, setFactories] = useState();
  const [tabledata, setTableData] = useState([]);
  const [AdvanceSliplist, setAdvanceSlipList] = useState({
    groupID: 0,
    factoryID: 0,
  });
  const [balance, setBalance] = useState(false);
  const [SelectedAdvanceSlipDetailsList, setSelectedAdvanceSlipDetailsList] = useState([]);
  const [IsActionButtonsDisabled, setIsActionButtonsDisabled] = useState(false)
  const alert = useAlert();
  const [GeneratedSlipData, SetGeneratedData] = useState([]);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });

  useEffect(() => {
    getPermissions();
    trackPromise(getGroupsForDropdown());
  }, []);

  useEffect(() => {
    if (AdvanceSliplist.groupID !== 0)
      trackPromise(getFactoriesByGroupID());
  }, [AdvanceSliplist.groupID]);

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWADVANCESLIPGENERATE');

    if (isAuthorized === undefined) {
      Navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
    });

    setAdvanceSlipList({
      ...AdvanceSliplist,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })

  }

  function cardTitle(titleName) {
    return (
      <Grid container spacing={1}>
        <Grid item md={10} xs={12}>
          {titleName}
        </Grid>
      </Grid>
    )
  }

  async function getGroupsForDropdown() {
    const groups = await Services.getGroupsForDropdown();
    setGroup(groups);
  }

  async function getFactoriesByGroupID() {
    const factories = await Services.getFactoryByGroupID(AdvanceSliplist.groupID);
    if (factories.data != null) {

    }
    setFactories(factories);
  }

  async function getAdvanceSlipDetail() {
    const response = await Services.getAdvanceSlipDetail(AdvanceSliplist.groupID, AdvanceSliplist.factoryID);
    if (response.statusCode == "Success" && response.data != null) {
      if (response.data.length == 0) {
        alert.error("No records to display");
      }
      setTableData(response.data);
      setBalance(true)
    }

  }

  async function GetSelectedDetail() {

    var SelectedList = [...SelectedAdvanceSlipDetailsList];
    var GetAdvancePaymentRequestID = SelectedList.map((e) => ({ advancePaymentRequestID: e.advancePaymentRequestID }))
    let AdvanceSlipGenerateModel = {
      AdvanceSlipGenerateRequestList: GetAdvancePaymentRequestID,
      modifiedBy: tokenDecoder.getUserIDFromToken()
    }

    const result = await Services.SelectedAdvanceSlipDetail(AdvanceSlipGenerateModel);
    setIsActionButtonsDisabled(false)

    if (result.statusCode == "Success" && result.data != null) {
      alert.success("success");
      setTableData([]);
      getAdvanceSlipDetail();
      SetGeneratedData([]);
      GetGeneratedAdvanceSlipDetail();
    }
    else {

      alert.error(result.message);
    }
  }

  async function GetGeneratedAdvanceSlipDetail() {
    const response = await Services.GetGeneratedAdvanceSlipDetail(AdvanceSliplist.groupID, AdvanceSliplist.factoryID);

    if (response.statusCode == 'Success' && response.data != null) {
      SetGeneratedData(response.data);
    } else {
      alert.error('No records to display');
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
    setAdvanceSlipList({
      ...AdvanceSliplist,
      [e.target.name]: value
    });
    setTableData([]);
    SetGeneratedData([]);
  }

  function handleRecordSelectionFromTable(rowData) {
    setSelectedAdvanceSlipDetailsList(rowData)
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root}
        title="Advance SLIP">
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: AdvanceSliplist.groupID,
              factoryID: AdvanceSliplist.factoryID
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
              })
            }
            onSubmit={() => trackPromise(getAdvanceSlipDetail(), GetGeneratedAdvanceSlipDetail())}
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
                      title={cardTitle('Advance SLIP Generate')}
                    />
                    <PerfectScrollbar>
                      <Divider />
                      <CardContent style={{ marginBottom: "2rem" }}>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="groupID">
                              Group *
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="groupID"
                              size='small'
                              variant="outlined"
                              onChange={(e) => handleChange(e)}
                              value={AdvanceSliplist.groupID}
                              InputProps={{
                                readOnly: !permissionList.isGroupFilterEnabled ? true : false
                              }}
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(group)}
                            </TextField>
                          </Grid>

                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id='factoryID'>
                              Operation Entity *
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="factoryID"
                              size='small'
                              variant="outlined"
                              id="factoryID"
                              onChange={(e) => handleChange(e)}
                              value={AdvanceSliplist.factoryID}
                              InputProps={{
                                readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                              }}
                            >
                              <MenuItem value="0">--Select Operation Entity--</MenuItem>
                              {generateDropDownMenu(factories)}

                            </TextField>
                          </Grid>
                        </Grid>
                        <Box display="flex" flexDirection="row-reverse" p={2} >
                          <Button
                            color="primary"
                            type="submit"
                            variant="contained"
                          >
                            Search
                          </Button>
                        </Box>
                      </CardContent>
                      <Box minWidth={1000} hidden={tabledata.length <= 0} >
                        <MeterialTable
                          columns={[
                            { title: 'Register Number', field: 'registrationNumber' },
                            { title: 'Customer Name', field: 'customerName' },
                            {
                              title: 'Payment Type', field: 'paymentTypeID', lookup: {
                                1: 'Account',
                                2: 'Cheque',
                                3: 'Cash'
                              }
                            },
                            { title: 'Approved Amount', field: 'approvedAmount' },
                            {
                              title: 'Created Date', field: 'createdDate',
                              render: rowData => rowData.createdDate.split('T')[0]
                            },


                          ]}
                          data={tabledata}
                          options={{
                            exportButton: false,
                            showTitle: false,
                            headerStyle: { textAlign: "left", height: '1%' },
                            cellStyle: { textAlign: "left" },
                            columnResizable: false,
                            actionsColumnIndex: -1,
                            selection: true,
                            selection: true,
                          }}
                          onSelectionChange={(rows) => handleRecordSelectionFromTable(rows)

                          }
                        />
                        {balance ?
                          <Box display="flex" flexDirection="row-reverse" p={2} >
                            <Button
                              color="primary"
                              type="submit"
                              variant="contained"
                              onClick={GetSelectedDetail}
                              disabled={SelectedAdvanceSlipDetailsList.length <= 0 || IsActionButtonsDisabled}
                            >
                              Generate
                            </Button>
                          </Box> : null
                        }
                      </Box>
                      <Box >
                        <CardContent>
                          <Grid container spacing={3} >
                            <Grid item md={12} xs={12}>
                              {!(GeneratedSlipData.length <= 0) ?
                                <Card hidden={(GeneratedSlipData.length <= 0)}>
                                  <CardHeader
                                    title={cardTitle('Selected Advance SLIP Detail')}
                                  />
                                  <Divider />
                                  {GeneratedSlipData.map((data, Index) =>
                                    <CardContent>
                                      <Grid container spacing={3}>
                                        <Grid item md={12} xs={12}>
                                          <Card key={Index}>
                                            <Box style={{ maxHeight: '300px', overflowY: 'auto' }} >
                                              <Table>
                                                <TableHead>
                                                  <TableRow>
                                                    <TableCell>
                                                      Registration Number
                                                    </TableCell>
                                                    <TableCell>
                                                      Customer Name
                                                    </TableCell>
                                                  </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                  {data.objectList.map((i, index) => (
                                                    <TableRow
                                                      key={index} hover>
                                                      <TableCell>
                                                        {i.registrationNumber}
                                                      </TableCell>
                                                      <TableCell>
                                                        {i.customerName}
                                                      </TableCell>
                                                    </TableRow>
                                                  ))}
                                                </TableBody>
                                              </Table>
                                            </Box>
                                            <Divider />
                                            <Box
                                              display="flex"
                                              justifyContent="flex-end"
                                              p={2}
                                            >
                                              <Button
                                                color="primary"
                                                variant="contained"
                                                style={{ textTransform: 'none' }}
                                                size="small"
                                                href={"data:text/plain;base64," + data.fileString}
                                                target="_blank"
                                                download={data.filename + ".txt"}
                                                startIcon={<GetAppIcon />}
                                              >
                                                Download
                                              </Button>
                                            </Box>
                                          </Card>
                                        </Grid>
                                      </Grid>
                                    </CardContent>
                                  )}
                                </Card> : null}
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Box>
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
