import React from 'react';
import {
  Box,
  Grid,
  InputLabel,
  CardContent,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Table,
} from '@material-ui/core';

export default class ComponentToPrint extends React.Component {
  render() {
    const catalogueData = this.props.catalogueData;
    const routeSummaryTotal = this.props.routeSummaryTotal;
    const searchData = this.props.searchData;
    const totalGrade = this.props.totalGrade;

    return (
      <div>
        <div style={{ width: '1093px', height: '1059px', padding: '20px', marginBottom: "14rem" }}>
        <br />
        <h2><center><u>Catalogue Report</u></center></h2>
          <div>&nbsp;</div>
          <h3><center>{searchData.groupName} - {searchData.factoryName}</center></h3>
          <div>&nbsp;</div>
          <h3><center>{searchData.startDate} - {searchData.endDate}</center></h3>
          <div>&nbsp;</div>
          <div>
            <Box minWidth={1050}>
              <TableContainer style={{ marginLeft: '5px' }}>
                <Table aria-label="caption table">
                  <TableHead>
                    <TableRow>
                      <TableCell align={'center'}>Invoice No</TableCell>
                      <TableCell align={'center'}>Date</TableCell>
                      <TableCell align={'center'}>Selling Mark</TableCell>
                      <TableCell align={'center'}>Grade</TableCell>
                      <TableCell align={'center'}>Broker</TableCell>
                      <TableCell align={'center'}>Gross Qty (KG)</TableCell>
                      <TableCell align={'center'}>Net Qty (KG)</TableCell>

                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {catalogueData.map((data, index) => (
                      <TableRow key={index}>
                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.invoiceNo}
                        </TableCell>
                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.sellingDate}
                        </TableCell>
                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.sellingMarkName}
                        </TableCell>
                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.gradeName}
                        </TableCell>
                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.brokerName}
                        </TableCell>
                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.grossQuantity}
                        </TableCell>
                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.netQuantity}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </div>
          <div>
            <Box>
              <CardContent>
                <Grid container md={12} spacing={2} style={{ marginTop: '1rem', justifyContent: 'end' }}>

                  <Grid item md={2} xs={2}>
                    <InputLabel><b>Main Grade Qty (KG)</b></InputLabel>
                  </Grid>
                  <Grid item md={2} xs={2}>
                    <InputLabel > {": " + catalogueData.filter(x => x.gradeCategoryID === 1)
                      .reduce((totalDebit, item) => totalDebit + item.netQuantity, 0).toFixed(2)} </InputLabel>
                  </Grid>
                </Grid>
                <br />
                <Grid container md={12} spacing={2} style={{ marginTop: '1rem', justifyContent: 'end' }}>

                  <Grid item md={2} xs={2}>
                    <InputLabel><b>Off Grade Qty (KG)</b></InputLabel>
                  </Grid>
                  <Grid item md={2} xs={2}>
                    <InputLabel > {": " + catalogueData.filter(x => x.gradeCategoryID === 2)
                      .reduce((totalDebit, item) => totalDebit + item.netQuantity, 0).toFixed(2)} </InputLabel>
                  </Grid>
                </Grid>
                <br />
                <Grid container md={12} spacing={2} style={{ marginTop: '1rem', justifyContent: 'end' }}>

                  <Grid item md={2} xs={2}>
                    <InputLabel><b>Total Catalogue Qty (KG)</b></InputLabel>
                  </Grid>
                  <Grid item md={2} xs={2}>
                    <InputLabel > {": " + totalGrade} </InputLabel>
                  </Grid>
                </Grid>

                <br />
              </CardContent>
            </Box>
          </div>
        </div>
      </div>
    );
  }
}
