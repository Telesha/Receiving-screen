import React from "react";
import {
  Box, TableBody, TableCell, TableContainer, TableHead, TableRow, Table,
} from '@material-ui/core';
import CountUp from 'react-countup';


export default class ComponentToPrint extends React.Component {

  render() {
    const returnedTeasList = this.props.returnedTeasList;
    const searchData = this.props.searchData;
    const total = this.props.totals;

    return (
      <div>
        <div>&nbsp;</div>
        <h3><center><u>Returned Teas Report</u></center></h3>
        <div className="row pl-2 pb-4 pt-4">
          <div>&nbsp;</div>
          <h3><center> Group: {searchData.groupName}&nbsp; Factoy:  {searchData.factoryName} </center></h3>
          <h3><center>  From Date:  {searchData.fromdate}&nbsp; To Date: {searchData.todate}</center></h3>
          <div>&nbsp;</div>
        </div>
        <div>

          <Box minWidth={1050}>
            <TableContainer style={{ marginLeft: '5px' }}>
              <Table aria-label="caption table">
                <TableHead>
                  <TableRow>
                    <TableCell align={'left'}>Return Date</TableCell>
                    <TableCell align={'left'}>Dispatch Date</TableCell>
                    <TableCell align={'left'}>Return From</TableCell>
                    <TableCell align={'left'}>Return To</TableCell>
                    <TableCell align={'left'}>Invoice No</TableCell>
                    <TableCell align={'left'}>Selling Mark</TableCell>
                    <TableCell align={'left'}>Grade</TableCell>
                    <TableCell align={'left'}>Bag Wt(Kg)</TableCell>
                    <TableCell align={'left'}>Bags</TableCell>
                    <TableCell align={'left'}>Gross Wt(Kg)</TableCell>
                    <TableCell align={'left'}>Net Wt(Kg)</TableCell>
                    <TableCell align={'left'}>Sold Date</TableCell>
                    <TableCell align={'left'}>Sold No</TableCell>
                    <TableCell align={'left'}>Lot No</TableCell>
                    <TableCell align={'left'}>Price (Rs)</TableCell>
                    <TableCell align={'left'}>Proceeds (Rs)</TableCell>
                    <TableCell align={'left'}>Broker</TableCell>
                    <TableCell align={'left'}>Buyer</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {returnedTeasList.map((data, index) => (
                    <TableRow key={index}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell align={'left'} component="th" scope="row">
                        {data.returnDate}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row">
                        {data.dateofDispatched}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row">
                        {data.returnFromID}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row">
                        {data.returnToID}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row">
                        {data.invoiceNo}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row">
                        {data.sellingMarkName}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row">
                        {data.gradeName}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row">
                        {data.packWeight}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row">
                        {data.noOfPacks}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row">
                        {data.grossWeight}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row">
                        {data.returnedNetWeight}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row">
                        {data.soldDate}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row">
                        {data.salesNumber}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row">
                        {data.lotNumber}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row">
                        {data.price}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row">
                        {data.proceeds}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row">
                        {data.brokerName}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row">
                        {data.buyerName}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableRow style={{ background: '#AFE1AF' }}>
                  <TableCell align={'left'} colSpan={8} component="th" scope="row" style={{ borderBottom: 'none', fontWeight: 'bold' }} >
                    Grand Total
                  </TableCell>
                  <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: 'none', fontWeight: 'bold' }}>
                    {total.bagTotal}
                  </TableCell>
                  <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: 'none', fontWeight: 'bold' }}>
                    <CountUp
                      end={total.grossWtTotal}
                      decimals={2}
                      separator=','
                      decimal="."
                      duration={0.1}
                    />
                  </TableCell>  <TableCell align={'left'} colSpan={5} component="th" scope="row" style={{ borderBottom: 'none', fontWeight: 'bold' }}>
                    <CountUp
                      end={total.netWtTotal}
                      decimals={2}
                      separator=','
                      decimal="."
                      duration={0.1}
                    />
                  </TableCell>  <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: 'none', fontWeight: 'bold' }}>
                    <CountUp
                      end={total.proceedsTotal}
                      decimals={2}
                      separator=','
                      decimal="."
                      duration={0.1}
                    />
                  </TableCell><TableCell align={'left'} colSpan={2} component="th" scope="row" style={{ borderBottom: 'none', fontWeight: 'bold' }}>
                  </TableCell>
                </TableRow>
              </Table>
            </TableContainer>
          </Box>
        </div>
      </div>
    );
  }
}
