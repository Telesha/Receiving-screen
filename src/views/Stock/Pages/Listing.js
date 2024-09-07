import React, { useState, useEffect, createContext } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Button,Card, makeStyles, Container, CardHeader, CardContent, Divider, MenuItem, Grid, InputLabel, TextField } from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import MaterialTable from "material-table";
import { useAlert } from "react-alert";

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

const screenCode = 'STOCKENTERING';
export default function StockEnteringListing() {
  const classes = useStyles();
  const [stockDetailsData, setStockDetailsData] = useState([]);
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [manufactureNumbers, setManufactureNumbers] = useState([]);
  const [stockDetails, setStockList] = useState({
    groupID: '0',
    factoryID: '0',
    manufactureNumberID: '0'
  })

  const [grades, setGrades] = useState();
  const alert = useAlert();
  const navigate = useNavigate();
  let encrypted = "";
  const handleClick = () => {
    encrypted = btoa('0');
    navigate('/app/stockEntering/addEdit/' + encrypted);
  }

  const handleClickEdit = (stockDetailsID) => {
    encrypted = btoa(stockDetailsID.toString());
    navigate('/app/stockEntering/addEdit/' + encrypted);
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
    if (stockDetails.groupID > 0) {
      trackPromise(getFactoriesForDropdown());
    }
  }, [stockDetails.groupID]);


  useEffect(() => {
    if (stockDetails.factoryID > 0) {
      trackPromise(getBatchNumbersForDropdown());
    }
  }, [stockDetails.factoryID]);

  useEffect(() => {
    if (stockDetails.manufactureNumberID > 0) {
      trackPromise(getGradesForDropdown());
    }
  }, [stockDetails.manufactureNumberID]);

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWSTOCKENTERING');

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

    setStockList({
      ...stockDetails,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getStockDetailsByGroupIDFactoryIDDManufactureID() {
    const stockItem = await services.GetStockDetailsByGroupIDFactoryIDManufactureID(stockDetails.groupID, stockDetails.factoryID, stockDetails.manufactureNumberID);
    if (stockItem.statusCode == 'Success' && stockItem.data != 0) {
      let data = stockItem.data;

      data.forEach(x => {
        x.createdDate = x.createdDate.split('T')[0];
        x.manufactureNumber = manufactureNumbers[x.manufactureNumberID];
        x.teaGradeName = grades[x.teaGradeID];
      });

      setStockDetailsData(data);
    }
    else
    {
      alert.error("No Data To Display.");
    }
    
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getAllFactoriesByGroupID(stockDetails.groupID);
    setFactories(factories);
  }

  async function getBatchNumbersForDropdown() {
    const batchNumbers = await services.GetBatchNumbersByGroupIDFactoryID(stockDetails.groupID, stockDetails.factoryID);
    setManufactureNumbers(batchNumbers);
  }

  async function getGradesForDropdown() {
    const grades = await services.GetGradeDetails(stockDetails.manufactureNumberID);
    setGrades(grades);
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
    setStockList({
      ...stockDetails,
      [e.target.name]: value
    });
  }

  function clearFormFields() {
    setStockList({
      ...stockDetails,
      groupID: '0',
      factoryID: '0',
      manufactureNumberID: '0'
    });
    setStockDetailsData([]);
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
            toolTiptitle={"Add Stock Item"}
          />
        </Grid>
      </Grid>
    )
  }

  return (
    <Page
      className={classes.root}
      title="Stocks"
    >
      <Container maxWidth={false}>
        <Box mt={0}>
          <Card>
            <CardHeader
              title={cardTitle("Stocks")}
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
                      onChange={(e) => handleChange(e)}
                      value={stockDetails.groupID}
                      variant="outlined"
                      id="groupID"
                      size="small"
                    >
                      <MenuItem value="0">--Select Group--</MenuItem>
                      {generateDropDownMenu(groups)}
                    </TextField>
                  </Grid>
                  <Grid item md={4} xs={12}>
                    <InputLabel shrink id="factoryID">
                      Operation Entity *
                    </InputLabel>
                    <TextField select
                      fullWidth
                      name="factoryID"
                      onChange={(e) => handleChange(e)}
                      value={stockDetails.factoryID}
                      variant="outlined"
                      id="factoryID"
                      size="small"
                    >
                      <MenuItem value="0">--Select Operation Entity--</MenuItem>
                      {generateDropDownMenu(factories)}
                    </TextField>
                  </Grid>
                  <Grid item md={3} xs={12}>
                    <InputLabel shrink id="manufactureNumberID">
                      Manufacture Number *
                    </InputLabel>

                    <TextField select
                      fullWidth
                      name="manufactureNumberID"
                      size='small'
                      onChange={(e) => {
                        handleChange(e)
                      }}
                      value={stockDetails.manufactureNumberID}
                      variant="outlined"
                      id="manufactureNumberID"
                    >
                      <MenuItem value={'0'}>
                        --Select Manufacture Number--
                      </MenuItem>
                      {generateDropDownMenu(manufactureNumbers)}

                    </TextField>
                  </Grid>
                </Grid>
                <Box display="flex" justifyContent="flex-end" p={2} >
                  <Button
                    color="primary"
                    type="reset"
                    variant="outlined"
                    onClick={() => clearFormFields()}
                    size='small'
                  >
                    Clear
                  </Button>
                  <div>&nbsp;</div>
                  <Button
                    color="primary"
                    type="submit"
                    variant="contained"
                    onClick={() => getStockDetailsByGroupIDFactoryIDDManufactureID()}
                    size='small'
                  >
                    Search
                  </Button>
                </Box>
              </CardContent>
              <Box minWidth={1050}>
                {stockDetailsData != 0 ?
                  <MaterialTable
                    title="Multiple Actions Preview"
                    columns={[
                      { title: 'Manufacture Number', field: 'manufactureNumber' },
                      { title: 'Tea Grade', field: 'teaGradeID' },
                      { title: 'Tea Grade Name', field: 'teaGradeName' },
                      { title: 'Amount', field: 'amount' },
                      { title: 'Date', field: 'createdDate' }
                    ]}
                    data={stockDetailsData}
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
                        tooltip: 'Edit Stock',
                        onClick: (event, rowData) => { handleClickEdit(rowData.stockDetailsID) }
                      },
                    ]}
                  />
                  : null
                  }
                
              </Box>
            </PerfectScrollbar>
          </Card>
        </Box>
      </Container>
    </Page>
  );
};
