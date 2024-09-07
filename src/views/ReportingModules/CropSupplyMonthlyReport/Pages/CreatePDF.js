import React from "react";
import {
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Table,
  TableFooter
} from '@material-ui/core';
import moment from 'moment';

export default class ComponentToPrint extends React.Component {

  render() {
    const selectedSearchValues = this.props.selectedSearchValues;
    const cropSupplyDetails = this.props.cropSupplyDetails;
    const monthDays = this.props.monthDays

    const options = {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    };

    return (
      <div>
        <h2><left><u>Crop Supply Monthly Report</u></left></h2>
        <div>&nbsp;</div>
        <h4><left>Group - {selectedSearchValues.groupName} </left></h4>
        <div></div>
        <h4><left>Factory - {selectedSearchValues.factoryName}</left></h4>
        <div></div>
        <h4><left>Route - {selectedSearchValues.routeName}</left></h4>
        <div></div>
        <h4><left>Registration Number - {selectedSearchValues.registrationNumber}</left></h4>
        <div></div>
        <h4><left>Month- {selectedSearchValues.startDate}</left></h4>
        <div>&nbsp;</div>
        <br></br>
        <div>

          <Table size="small" aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="left">
                  Route
                </TableCell>
                <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="left">
                  Reg.No
                </TableCell>
                <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="left">
                  Customer
                </TableCell>
                {monthDays.map((row, index) => {
                  return (
                    <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="center">
                      {moment(row).format('DD')}
                    </TableCell>
                  );
                })}
                <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="left">
                  Total
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cropSupplyDetails.map((row, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell style={{ border: "1px solid black" }} align="left" component="th" scope="row">
                      {row.routeName}
                    </TableCell>
                    <TableCell style={{ border: "1px solid black" }} align="left" component="th" scope="row">
                      {row.registrationNumber}
                    </TableCell>
                    <TableCell style={{ border: "1px solid black" }} align="left" component="th" scope="row">
                      {row.name}
                    </TableCell>
                    {monthDays.map((rows, index) => {
                      var found = row.groupList.find(x => x.cropCollectedDate == rows)
                      return (
                        <TableCell style={{ border: "1px solid black" }} align="center">
                          {found == undefined ? '-' : (found.cropWeight).toLocaleString('en-US', options)}
                        </TableCell>
                      );
                    }
                    )}
                    <TableCell style={{ border: "1px solid black", fontWeight: "bold", alignContent: "left" }} align="left" component="th" scope="row">
                      {(row.totalAmount).toLocaleString('en-US', options)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", color: "red" }} align="center">
                  Total
                </TableCell>
                {monthDays.map((day, index) => {
                  const dayTotal = cropSupplyDetails.reduce((total, row) => {
                    const found = row.groupList.find(x => x.cropCollectedDate === day);
                    return total + (found ? parseFloat(found.cropWeight) : 0);
                  }, 0).toLocaleString('en-US', options);
                  return (
                    <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }} align="center" key={index}>
                      {dayTotal !== 0 ? dayTotal : '-'}
                    </TableCell>
                  );
                })}
                <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }} align="left">
                  {cropSupplyDetails.reduce((total, row) => total + parseFloat(row.totalAmount), 0).toLocaleString('en-US', options)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>

        </div>
        <div>&nbsp;</div>
      </div>
    );

  }

}
