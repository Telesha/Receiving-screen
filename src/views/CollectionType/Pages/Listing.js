import React, { useState, useEffect, createContext } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Avatar, Box, Card, Checkbox, Table, TableBody, TableCell, TableHead, TablePagination, TableRow,
  Typography, makeStyles, Container, CardHeader, CardContent, Divider, MenuItem, Grid, InputLabel, TextField
} from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
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

export default function CollectionTypeListing() {
  const classes = useStyles();
  const [limit, setLimit] = useState(10);
  const [isViewTable, setIsViewTable] = useState(true);
  const [page, setPage] = useState(0);
  const handleLimitChange = (event) => {
    setLimit(event.target.value);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const [collectionTypeData, setCollectionTypeData] = useState([]);
  const [products, setProducts] = useState();
  const [collectionTypeList, setCollectionTypeList] = useState({
    productID: '0'
  })
  const navigate = useNavigate();
  let encrypted = "";
  const handleClick = () => {
    encrypted = btoa('0');
    navigate('/app/collectionTypes/addedit/' + encrypted);
  }

  const handleClickEdit = (collectionTypeID) => {
    encrypted = btoa(collectionTypeID.toString());
    navigate('/app/collectionTypes/addedit/' + encrypted);
  }

  useEffect(() => {
    trackPromise(
      getProductsForDropdown()
    );
  }, []);

  useEffect(() => {
    trackPromise(
      getCollectionTypeDetailsByProductID()
    )
    checkDisbursement();
  }, [collectionTypeList.productID]);

  async function getCollectionTypeDetailsByProductID() {
    var result = await services.getCollectionTypeDetailsByProductID(collectionTypeList.productID);
    setCollectionTypeData(result);
  }

  async function getProductsForDropdown() {
    const products = await services.getProductsForDropdown();
    setProducts(products);
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

  function checkDisbursement() {
    if (collectionTypeList.productID === '0') {
      setIsViewTable(true);
    }
    else{
      setIsViewTable(false);
    }
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setCollectionTypeList({
      ...collectionTypeList,
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
            toolTiptitle={"Add Collection Type"}
          />
        </Grid>
      </Grid>
    )
  }

  return (
    <Page
      className={classes.root}
      title="Collection Types"
    >
      <Container maxWidth={false}>
        <Box mt={0}>
          <Card>
            <CardHeader
              title={cardTitle("Collection Type")}
            />
            <PerfectScrollbar>
              <Divider />
              <CardContent style={{ marginBottom: "2rem" }}>
                <Grid container spacing={3}>
                  <Grid item md={5} xs={12}>
                    <InputLabel shrink id="productID">
                      Product  *
                </InputLabel>
                    <TextField select
                      fullWidth
                      name="productID"
                      onChange={(e) => handleChange(e)}
                      value={collectionTypeList.productID}
                      variant="outlined"
                      size = 'small'
                    >
                      <MenuItem value="0">--Select product--</MenuItem>
                      {generateDropDownMenu(products)}
                    </TextField>
                  </Grid>
                </Grid>
              </CardContent>
              <Box minWidth={1000} hidden={isViewTable}> 
                <MaterialTable
                        title="Multiple Actions Preview"
                        columns={[
                        { title: 'CollectionType Code', field: 'collectionTypeCode' },
                        { title: 'CollectionType Name', field: 'collectionTypeName' },
                        { title: 'Status', field: 'isActive', lookup: { 
                          true: 'Active', 
                          false: 'Inactive'
                       }},
                       ]}
                         data={collectionTypeData}
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
                        tooltip: 'Edit',
                        onClick: (event, collectionTypeData) => handleClickEdit(collectionTypeData.collectionTypeID)
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

