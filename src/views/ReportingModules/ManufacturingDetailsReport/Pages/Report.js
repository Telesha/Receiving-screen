import React, { useState, useEffect, Fragment, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  Grid,
  TextField,
  makeStyles,
  Container,
  Button,
  CardContent,
  Divider,
  InputLabel,
  CardHeader,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@material-ui/core';
import MaterialTable from 'material-table';
import Page from 'src/components/Page';
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from 'yup';
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { useNavigate } from 'react-router-dom';
import { useAlert } from 'react-alert';
import { startOfMonth, endOfMonth, addMonths } from 'date-fns';
import DateRangeSelectorComponent from '../../InquiryRegistry/Utils/DateRangeSelector';
import Popover from '@material-ui/core/Popover';
import EventIcon from '@material-ui/icons/Event';
import xlsx from 'json-as-xlsx';
import ReactToPrint from 'react-to-print';
import CreatePDF from './CreatePDF';
import moment from 'moment';

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
  avatar: {
    marginRight: theme.spacing(2)
  },
  colorCancel: {
    backgroundColor: 'red'
  },
  colorRecord: {
    backgroundColor: 'green'
  }
}));

const screenCode = 'MANUFACTURINGDETAILSREPORT';

export default function ManufacturingDetailsReport(props) {
  const [title, setTitle] = useState('Manufacturing Details Report');
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [GroupList, setGroupList] = useState([]);
  const [FactoryList, setFactoryList] = useState([]);
  const [itemRequestDetail, setItemRequestDetail] = useState({
    groupID: 0,
    factoryID: 0,
    manufacturingNumber: ''
  });

  const [manufacturingDetails, setmanufacturingDetails] = useState([]);
  const [selectedSearchValues, setSelectedSearchValues] = useState({
    groupName: '0',
    factoryName: '0',
    startDate: '',
    endDate: ''
  });
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleClickPop = event => {
    setAnchorEl(event.currentTarget);
  };
  const [DateRange, setDateRange] = useState({
    startDate: startOfMonth(addMonths(new Date(), -5)),
    endDate: endOfMonth(addMonths(new Date(), -0))
  });
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;
  const navigate = useNavigate();
  const alert = useAlert();
  const componentRef = useRef();
  const [csvHeaders, SetCsvHeaders] = useState([]);

  useEffect(() => {
    trackPromise(getPermission());
    trackPromise(getGroupsForDropdown());
  }, []);

  useEffect(() => {
    trackPromise(getFactoriesForDropdown());
  }, [itemRequestDetail.groupID]);
 

  useEffect(() => {
    setItemRequestDetail({
      ...itemRequestDetail,
      manufacturingNumber: ''
    });
  }, [itemRequestDetail.factoryItemID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(
      p => p.permissionCode == 'VIEWMANUFACTURINGDETAILSREPORT'
    );

    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(
      p => p.permissionCode == 'GROUPDROPDOWN'
    );
    var isFactoryFilterEnabled = permissions.find(
      p => p.permissionCode == 'FACTORYDROPDOWN'
    );

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined
    });

    setItemRequestDetail({
      ...itemRequestDetail,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    });
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroupList(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getFactoryByGroupID(
      itemRequestDetail.groupID
    );
    setFactoryList(factories);
  }

  async function GetManufacturingDetails() {
    let model = {
      groupID: parseInt(itemRequestDetail.groupID),
      factoryID: parseInt(itemRequestDetail.factoryID),
      manufacturingNumber: itemRequestDetail.manufacturingNumber,
      startDate: moment(DateRange.startDate.toString())
        .format()
        .split('T')[0],
      endDate: moment(DateRange.endDate.toString())
        .format()
        .split('T')[0]
    };
    getSelectedDropdownValuesForReport(model);

    const itemData = await services.GetManufacturingDetailsReport(model);

    if (itemData.statusCode == 'Success' && itemData.data != null) {
      setmanufacturingDetails(itemData.data);
      createDataForExcel(itemData.data);
      if (itemData.data.length == 0) {
        alert.error('No records to display');
      }
    } else {
      alert.error(itemData.message);
    }
  }

  async function createDataForExcel(array) {
    var res = [];
    if (array != null) {
      array.map(x => {
        var vr = {
          'From Date': x.manufacturedDateFrom.split('T')[0],
          'To Date': x.manufacturedDateTo.split('T')[0],
          'Quantity': x.greenLeafQuantity,
          'Boild Leaf': x.boiledLeaf,
          'water Leaf': x.rainfallIn,
          'Quantity': x.witheredLeafAmount,
          'Dool Amount': x.dhoolWeight,
         }
        res.push(vr);
      });
    }
    return res;
  }

  async function createFile() {
    var file = await createDataForExcel(manufacturingDetails);
    var settings = {
      sheetName: 'Manufacturing Details Report',
      fileName:
        'Manufacturing Details Report' +
        selectedSearchValues.groupName +
        ' - ' +
        selectedSearchValues.factoryName +
        '  ' +
        selectedSearchValues.startDate +
        ' - ' +
        selectedSearchValues.endDate,
      writeOptions: {}
    };

    let keys = Object.keys(file[0]);
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem });
    });

    let dataA = [
      {
        sheet: 'Manufacturing Details Report',
        columns: tempcsvHeaders,
        content: file
      }
    ];
    xlsx(dataA, settings);
  }

  function generateDropDownMenu(data) {
    let items = [];
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(
          <MenuItem key={key} value={key}>
            {value}
          </MenuItem>
        );
      }
    }
    return items;
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value;
    setItemRequestDetail({
      ...itemRequestDetail,
      [e.target.name]: value
    });
    setmanufacturingDetails([]);
  }

  function getSelectedDropdownValuesForReport(searchForm) {
    var startDate = moment(searchForm.startDate.toString())
      .format()
      .split('T')[0];
    var endDate = moment(searchForm.endDate.toString())
      .format()
      .split('T')[0];
    setSelectedSearchValues({
      ...selectedSearchValues,
      groupName: GroupList[searchForm.groupID],
      factoryName: FactoryList[searchForm.factoryID],
      startDate: [startDate],
      endDate: [endDate]
    });
  }

  function cardTitle(titleName) {
    return (
      <Grid container spacing={1}>
        <Grid item md={10} xs={12}>
          {titleName}
        </Grid>
      </Grid>
    );
  }

  return (
    <Fragment>
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: itemRequestDetail.groupID,
              factoryID: itemRequestDetail.factoryID
            }}
            validationSchema={Yup.object().shape({
              groupID: Yup.number()
                .required('Group is required')
                .min('1', 'Group is required'),
              factoryID: Yup.number()
                .required('Factory is required')
                .min('1', 'Factory is required')
            })}
            onSubmit={() => trackPromise(GetManufacturingDetails())}
            enableReinitialize
          >
            {({ errors, handleBlur, handleSubmit, touched }) => (
              <form onSubmit={handleSubmit}>
                <Box mt={0}>
                  <Card>
                    <CardHeader title={cardTitle(title)} />
                    <PerfectScrollbar>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="groupID">
                              Group *
                            </InputLabel>
                            <TextField
                              select
                              error={Boolean(touched.groupID && errors.groupID)}
                              fullWidth
                              helperText={touched.groupID && errors.groupID}
                              name="groupID"
                              onBlur={handleBlur}
                              onChange={e => handleChange(e)}
                              value={itemRequestDetail.groupID}
                              variant="outlined"
                              id="groupID"
                              disabled={!permissionList.isGroupFilterEnabled}
                              size='small'
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(GroupList)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="factoryID">
                              Factory *
                            </InputLabel>
                            <TextField
                              select
                              error={Boolean(
                                touched.factoryID && errors.factoryID
                              )}
                              fullWidth
                              size='small'
                              helperText={touched.factoryID && errors.factoryID}
                              name="factoryID"
                              onBlur={handleBlur}
                              onChange={e => handleChange(e)}
                              value={itemRequestDetail.factoryID}
                              variant="outlined"
                              id="factoryID"
                              disabled={!permissionList.isFactoryFilterEnabled}
                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateDropDownMenu(FactoryList)}
                            </TextField>
                          </Grid>

                          <Grid item md={4} xs={12}>
                            <InputLabel shrink>Date *</InputLabel>
                            <Button
                              aria-describedby={id}
                              variant="contained"
                              fullWidth
                              color="primary"
                              onClick={handleClickPop}
                              size="medium"
                              endIcon={<EventIcon />}
                            >
                              {DateRange.startDate.toLocaleDateString() +
                                ' - ' +
                                DateRange.endDate.toLocaleDateString()}
                            </Button>
                            <Popover
                              id={id}
                              open={open}
                              anchorEl={anchorEl}
                              onClose={handleClose}
                              anchorOrigin={{
                                vertical: 'center',
                                horizontal: 'left'
                              }}
                              transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left'
                              }}
                            >
                              <DateRangeSelectorComponent
                                setDateRange={setDateRange}
                                handleClose={handleClose}
                              />
                            </Popover>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="manufacturingNumber">
                              Manufacturing Number
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="manufacturingNumber"
                              onChange={e => handleChange(e)}
                              value={itemRequestDetail.manufacturingNumber}
                              variant="outlined"
                              id="manufacturingNumber"
                              size='small'
                            ></TextField>
                          </Grid>
                        </Grid>
                        <Box display="flex" flexDirection="row-reverse" p={2}>
                          <Button
                            color="primary"
                            type="submit"
                            variant="contained"
                            size='small'
                          >
                            Search
                          </Button>
                        </Box>
                      </CardContent>
                      <Box minWidth={1050}>
                        {manufacturingDetails.length > 0 ?

                          <TableContainer >
                            <Table  aria-label="caption table">
                              <TableHead>
                                <TableRow>
                                  <TableCell align='center' colSpan={3} >Grean Leaf</TableCell>
                                  <TableCell align='center' colSpan={2}>Diduction</TableCell>
                                  <TableCell align= 'center'colSpan={2}>WitheredLeaf</TableCell>
                                  <TableCell align='center' colSpan={4}>Fiering</TableCell>
                                </TableRow>
                               <TableRow>
                                  <TableCell align={'center'}>From Date</TableCell>
                                  <TableCell align={'center'}>To Date</TableCell>
                                  <TableCell align={'center'}>Quantity</TableCell>

                                  <TableCell align={'center'}>Boild Leaf</TableCell>
                                  <TableCell align={'center'}>Water Leaf</TableCell>

                                  <TableCell align={'center'}>Quantity</TableCell>
                                  <TableCell align={'center'}>Condition</TableCell>

                                  
                                  <TableCell align={'center'}>Dool Amount</TableCell>
                                  {/* <TableCell align={'center'}>Secound Dool Amount</TableCell>
                                  <TableCell align={'center'}>Third Dool Amount</TableCell>
                                  <TableCell align={'center'}>Fouth Dool Amount</TableCell>
                                  <TableCell align={'center'}>Big Bulk Amount</TableCell> */}
                                   




                               </TableRow>
                               </TableHead>
                              <TableBody>
                                {manufacturingDetails.map((data, index) => (
                                  <TableRow key={index}>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none"}}>
                                      {data.manufacturedDateFrom.split('T')[0]}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.manufacturedDateTo.split('T')[0]}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.greenLeafQuantity}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.boiledLeaf}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.rainfallIn}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.witheredLeafAmount}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.witheringCondition}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.dhoolWeight}
                                    </TableCell>
                                    {/* <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.secondDhoolAmount}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.thirdDhoolAmount}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.fourthDhoolAmount}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.bigBulkAmount}
                                    </TableCell> */}
                                    
                                  </TableRow>
                                ))}
                                     

                              </TableBody>
                            
                            </Table>
                          </TableContainer>  : null}
                       </Box>
                       {manufacturingDetails.length > 0 ?
                        <Box display="flex" justifyContent="flex-end" p={2}>
                          <Button
                            color="primary"
                            id="btnRecord"
                            type="submit"
                            variant="contained"
                            style={{ marginRight: '1rem' }}
                            className={classes.colorRecord}
                            onClick={createFile}
                            size='small'
                          >
                            EXCEL
                          </Button>

                          <ReactToPrint
                            documentTitle={"Daily Crop Report"}
                            trigger={() => <Button
                              color="primary"
                              id="btnRecord"
                              size='small'
                              type="submit"
                              variant="contained"
                              style={{ marginRight: '1rem' }}
                              className={classes.colorCancel}

                            >
                              PDF
                            </Button>}
                            content={() => componentRef.current}
                          />
                          <div hidden={true}>
                            <CreatePDF ref={componentRef}
                              manufacturingDetails={manufacturingDetails} searchData={selectedSearchValues}
                            />
                          </div>
                        </Box> : null} 
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
}
