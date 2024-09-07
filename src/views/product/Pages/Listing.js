import React, { useState, useEffect, createContext } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import moment from 'moment';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Avatar, Grid, Box, Card, Checkbox, Table, TableBody, TableCell, TableHead,
  TablePagination, TableRow, Typography, makeStyles, Container, CardHeader, Divider
} from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import BorderColorTwoToneIcon from '@material-ui/icons/BorderColorTwoTone';
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

export default function ProductListing() {
  const classes = useStyles();
  const [selectedCustomerIds, setSelectedCustomerIds] = useState([]);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(0);
  const handleLimitChange = (event) => {
    setLimit(event.target.value);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const [productData, setProductData] = useState([]);
  const navigate = useNavigate();
  let encrypted = "";
  const handleClick = () => {
    encrypted = btoa('0');
    navigate('/app/products/addedit/' + encrypted);
  }

  const handleClickEdit = (productID) => {
    encrypted = btoa(productID.toString());
    navigate('/app/products/addedit/' + encrypted);
  }

  useEffect(() => {
    trackPromise(
      GetAllProducts()
    );
  }, []);

  async function GetAllProducts() {
    var result = await services.GetAllProducts();
    setProductData(result);
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
            toolTiptitle={"Add Product"}
          />
        </Grid>
      </Grid>
    )
  }

  return (
    <Page
      className={classes.root}
      title="Products"
    >
      <Container maxWidth={false}>
        <Box mt={0}>
          <Card>
            <CardHeader
              title={cardTitle("Product")}
            />
            <PerfectScrollbar>
              <Divider />
              <Box minWidth={1050}> 
                <MaterialTable
                        title="Multiple Actions Preview"
                        columns={[
                        { title: 'Product Code', field: 'productCode',cellStyle:{width:100} },
                        { title: 'Product Name', field: 'productName',cellStyle:{width:100} },
                        { title: 'Product Description', field: 'productDescription',cellStyle:{width:100} },
                        { title: 'Status', field: 'isActive', lookup: { 
                          true: 'Active', 
                          false: 'Inactive'
                       },cellStyle:{width:100,whiteSpace: 'nowrap',}},
                       ]}
                         data={productData}
                         options={{
                         exportButton: false,
                         showTitle: false,
                         headerStyle: { textAlign: "left", height: '1%',paddingLeft:'1rem'},
                         cellStyle: { textAlign: "left"},
                         columnResizable: false,
                         actionsColumnIndex: -1
                       }}
                         actions={[
                       { 
                        icon: 'edit',
                        tooltip: 'Edit',
                        onClick: (event, productData) => handleClickEdit(productData.productID),
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

