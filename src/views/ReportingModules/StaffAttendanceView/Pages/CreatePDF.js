import React from "react";
import MaterialTable from "material-table";
import { Box } from '@material-ui/core';

export default class ComponentToPrint extends React.Component {
    render() {
        const staffAttendancesViewDetails = this.props.staffAttendancesViewDetails;
        const searchData = this.props.searchData;
        
        return (
            <div>
                <div style={{ width: '1093px', height: '1059px', padding: '20px', marginBottom: "14rem" }}>
                    <h2><center><u>Staff Attendance View Report</u></center></h2>
                    <div>&nbsp;</div>
                    <h3><center>Group - {searchData.groupName} </center></h3>
                    <div>&nbsp;</div>
                    <h3><center>Estate - {searchData.estateName}</center></h3>
                    <div>&nbsp;</div>
                    <h3><center>Division - {searchData.divisionName}</center></h3>
                    <div>&nbsp;</div>
                    <h3><center>Date - {searchData.attendanceDate}</center></h3>
                    <div>&nbsp;</div>
                    <div>
                        <Box minWidth={1050}>
                            <MaterialTable
                                columns={[
                                    { title: 'EMP No', field: 'employeeID' },
                                    { title: 'EMP Name', field: 'employeeName' },
                                    {
                                        title: 'EMP Type', field: 'employeeTypeID', lookup: {
                                            1: "Register",
                                            2: "Unregister"
                                        }
                                    },
                                    {
                                        title: 'Job Category', field: 'jobCategoryID', lookup: {
                                            1: "Weeding",
                                            2: "Fertilizing"
                                        }
                                    },
                                    {
                                        title: 'Job', field: 'jobTypeName'
                                    },
                                    {
                                        title: 'Work Type', field: 'workTypeID', lookup: {
                                            1: "Lent labor",
                                            2: "Division labor"
                                        }
                                    },
                                    { title: 'Field', field: 'fieldName' },
                                    {
                                        title: 'Attendance', field: 'attendance',
                                        render: rowData => rowData.isFullDay == true ? "Full" : rowData.isHalfDay == true ? "Half" : rowData.isLeave == true ? "Half" : '-'
                                    },
                                    {
                                        title: 'Is Task Complete', field: 'isTaskComlete',
                                        render: rowData => rowData.isTaskComlete == true ? "yes" : "No"
                                    },
                                ]}
                                data={staffAttendancesViewDetails}
                                options={{
                                    showTitle: false,
                                    headerStyle: { textAlign: "left", height: '1%' },
                                    cellStyle: { textAlign: "left" },
                                    actionsColumnIndex: -1,
                                    pageSize: 5,
                                    search: false
                                }}
                            />
                        </Box>
                    </div>
                    <div>&nbsp;</div>
                    <h3><center>***** End of List *****</center></h3>
                </div>
            </div>
        );
    }
}