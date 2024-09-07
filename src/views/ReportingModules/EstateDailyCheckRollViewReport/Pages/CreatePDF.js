import React from "react";
import {
  Box, TableBody, TableCell, TableContainer, TableHead, TableRow, Table
} from '@material-ui/core';
import ClearIcon from '@material-ui/icons/Clear';
import { AgriGenERPEnum } from "src/views/Common/AgriGenERPEnum/AgriGenERPEnum";

export default class ComponentToPrint extends React.Component {

  render() {
    const agriGenERPEnum = new AgriGenERPEnum();
    const routeSummaryData = this.props.routeSummaryData;
    const searchData = this.props.searchData;

    function getjobTypeINjobID(type) {
      if (type == agriGenERPEnum.GetjobTypeUsingJobID.Cash) {
        return "Cash";
      } else if (type == agriGenERPEnum.GetjobTypeUsingJobID.Kilo) {
        return "Kilo";
      } else if (type == agriGenERPEnum.GetjobTypeUsingJobID.General) {
        return "General";
      } else {
        return "RSM";
      }
    }

    function checkSessions(value) {
      if (value == null) {
        return <ClearIcon style={{ color: "red" }} />
      } else {
        return value;
      }
    }


    return (
      <div>
        <div style={{ width: '1500px', height: '1059px', padding: '20px', marginBottom: "14rem" }}>
          <h3><center><u>Daily Check Roll Details Report</u></center></h3>
          <div>&nbsp;</div>
          <h4><center>{searchData.groupName} - {searchData.estateName} - {searchData.divisionName}</center></h4>
          <h4><center>{searchData.collectedDate}</center></h4>
          <div>&nbsp;</div>
          <div>
            <Box minWidth={1050}>
              <TableContainer style={{ marginLeft: '5px' }}>
                <Table aria-label="caption table">
                  <TableHead>
                    <TableRow>
                      <TableCell align={'left'}>Employee ID</TableCell>
                      <TableCell align={'left'}>FullName</TableCell>
                      <TableCell align={'center'}>EmployeeType</TableCell>
                      <TableCell align={'center'}>JobType</TableCell>
                      <TableCell align={'center'}>WorkType</TableCell>
                      <TableCell align={'center'}>FieldName</TableCell>
                      <TableCell align={'center'}>GangName</TableCell>
                      <TableCell align={'center'}>Amount (Rs)</TableCell>
                      <TableCell align={'center'}>DayOT</TableCell>
                      <TableCell align={'center'}>NetPay</TableCell>
                      <TableCell align={'center'}>OverKiloPay</TableCell>
                      <TableCell align={'center'}>TotalPay</TableCell>
                      <TableCell align={'center'}>Morning Session</TableCell>
                      <TableCell align={'center'}>Noon Session</TableCell>
                      <TableCell align={'center'}>Evening Session</TableCell>

                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {routeSummaryData.map((data, index) => (
                      <TableRow key={index}>
                        <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.employeeID}
                        </TableCell>
                        <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.fullName}
                        </TableCell>
                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.employeeType == agriGenERPEnum.EmployeeType.Register ? "Register" : "Unregister"}
                        </TableCell>
                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {getjobTypeINjobID(data.jobType)}
                        </TableCell>
                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.workType == agriGenERPEnum.EmployeeWorkTypeID.DivisionLabour ? "Division Labour" : "Lent Labour"}
                        </TableCell>
                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.fieldName}
                        </TableCell>
                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.gangName}
                        </TableCell>
                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.total}
                        </TableCell>
                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.dayOT}
                        </TableCell>
                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.netPay}
                        </TableCell>
                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.overKiloPay}
                        </TableCell>
                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.totalPay}
                        </TableCell>
                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {checkSessions(data.morning)}
                        </TableCell>
                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {checkSessions(data.noon)}
                        </TableCell>
                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {checkSessions(data.evening)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </div>
        </div>
      </div>
    );
  }
}
