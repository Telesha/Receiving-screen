import React from "react";
import {
  Box,TableBody, TableCell, TableContainer, TableHead, TableRow, Table,Paper
} from '@material-ui/core';
export default class ComponentToPrint extends React.Component {

  render() {
    const factoryItemList = this.props.factoryItemList;
    const searchData = this.props.searchData;
    const totalAmount = factoryItemList.reduce((sum, item) => {
      return sum + (item.approvedAmount ? parseFloat(item.approvedAmount) : 0);
    }, 0);

    const totalQTY = factoryItemList.reduce((sum, item) => {
      return sum + (item.approvedQuantity ? parseFloat(item.approvedQuantity) : 0);
    }, 0);

    const uniqueRegistrationNumbers = new Set(
      factoryItemList.map(item => item.registrationNumber)
    );

    return (
    <Paper>
      <div>
      <h2><left><u><center>Daily Advance And Factory Item Issue Document</center></u></left></h2>
        <div>&nbsp;</div>
        <h4><center>{searchData.groupName}</center></h4>
        <h4><center>{searchData.factoryName}</center></h4> 
        <h4><center>{searchData.routeName}</center></h4>
        <h4><center>{searchData.startDate} </center></h4> 
        <h4><center>{searchData.endDate}</center></h4>
        <div>&nbsp;</div>
        <div>
          <Box>
            <TableContainer >
              <Table aria-label="simple table">
                <TableHead>
                  <TableRow style={{ border: "2px solid black" }}>
                    <TableCell align={'left'} style={{ fontWeight: "bold", border: "2px solid black", fontSize: '25px', width:'100px' }}>Issue Date </TableCell>
                    <TableCell align={'left'}style={{ fontWeight: "bold", border: "2px solid black", fontSize: '25px' ,width:'100px'}}>Supplier Name</TableCell>
                    <TableCell align={'left'}style={{ fontWeight: "bold", border: "2px solid black", fontSize: '25px' ,width:'100px'}}>Registration Number </TableCell>
                    <TableCell align={'Right'}style={{ fontWeight: "bold", border: "2px solid black", fontSize: '25px',width:'100px' }}>Advanced Amount</TableCell>
                    <TableCell align={'left'}style={{ fontWeight: "bold", border: "2px solid black", fontSize: '25px',width:'100px' }}>Item Name</TableCell>
                    <TableCell align={'left'}style={{ fontWeight: "bold", border: "2px solid black", fontSize: '25px' ,width:'100px'}}>Measuring Unit</TableCell>
                    <TableCell align={'Center'}style={{ fontWeight: "bold", border: "2px solid black", fontSize: '25px' ,width:'100px'}}>Quantity</TableCell>
                    <TableCell align={'Center'}style={{ fontWeight: "bold",borderRight: "2px solid black", border: "2px solid black", fontSize: '25px',width:'100px' }}>Signature</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {factoryItemList.map((data, index) => (
                    <TableRow style={{ border: "2px solid black" }} key={index}>
                       <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" , fontWeight: "bold", border: "2px solid black", fontSize: '25px' ,width:'100px' }}>
                        {data.issuingDate.split('T')[0]}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" ,  fontWeight: "bold", border: "2px solid black", fontSize: '25px',width:'100px' }}>
                        {data.supplierName}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none"  ,  fontWeight: "bold", border: "2px solid black", fontSize: '25px',width:'100px'}}>
                        {data.registrationNumber}
                      </TableCell>                    
                      <TableCell align={'Right'} component="th" scope="row" style={{ borderBottom: "none"  ,  fontWeight: "bold", border: "2px solid black", fontSize: '25px',width:'100px'}}>{data.approvedAmount !== null  ? Number(data.approvedAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none"  ,  fontWeight: "bold", border: "2px solid black", fontSize: '25px',width:'100px'}}>
                        {data.itemName}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none"  ,  fontWeight: "bold", border: "2px solid black", fontSize: '25px',width:'100px'}}>
                        {data.measuringUnitName}
                      </TableCell>
                      <TableCell align={'Center'} component="th" scope="row" style={{ borderBottom: "none"  ,  fontWeight: "bold", border: "2px solid black", fontSize: '25px',width:'100px'}}>
                        {data.approvedQuantity !== null ? data.approvedQuantity : '-'}
                      </TableCell>
                      <TableCell align={'Center'} component="th" scope="row" style={{ borderBottom: "none"  ,borderRight: "2px solid black",  fontWeight: "bold", border: "2px solid black", fontSize: '25px',width:'100px'}}>
                        {}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </div>
        <div>&nbsp;</div>
        <h4 style={{ fontWeight: "bold", fontSize: '25px'}}><left>{"Supplier count: " + uniqueRegistrationNumbers.size}</left></h4>
        <h4 style={{ fontWeight: "bold", fontSize: '25px'}}><left>{"Total amount: " + totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</left></h4>
        <h4 style={{ fontWeight: "bold", fontSize: '25px'}}><left>{"Total quantity:" + totalQTY}</left></h4>
      </div>
    </Paper>
    );
  }
}
