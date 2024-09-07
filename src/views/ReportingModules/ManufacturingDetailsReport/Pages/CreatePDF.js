import React from "react";
import tokenService from '../../../../utils/tokenDecoder';
import {
    Box,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Table
} from '@material-ui/core';


export default class ComponentToPrint extends React.Component {
    render() {
        const manufacturingDetails = this.props.manufacturingDetails;
        const searchData = this.props.searchData;

        return (
            <div>
                <h3><center><u>Manufacturing Details Report</u></center></h3>
                <div>&nbsp;</div>
                <h4><center>{searchData.groupName} - {searchData.factoryName}</center></h4>
                <h4><center>{searchData.startDate} - {searchData.endDate}</center></h4>
                <div>&nbsp;</div>
                <div>
                    <Box minWidth={1050}>
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
                          </TableContainer>
                    </Box>
                </div>
                <div>&nbsp;</div>
                <h3><center>***** End of List *****</center></h3>
            </div>
        );

    }

}