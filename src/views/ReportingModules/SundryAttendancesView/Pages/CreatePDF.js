import React from "react";
import MaterialTable from "material-table";
import { Box } from '@material-ui/core';

export default class ComponentToPrint extends React.Component {
    render() {
        const sundryAttendanceViewDetails = this.props.sundryAttendanceViewDetails;
        const SearchData = this.props.SearchData;
        const sundryAttendanceSearchDetails = this.props.sundryAttendanceSearchDetails.date.toISOString().split('T')[0];
        return (
            <div>
                <div style={{ width: '1093px', height: '1059px', padding: '20px', marginBottom: "14rem" }}>
                    <h2><center><u>Sundry Attendance View Report</u></center></h2>
                    <div>&nbsp;</div>
                    <h3><center>Group - {SearchData.groupName} </center></h3>
                    <div>&nbsp;</div>
                    <h3><center>Estate - {SearchData.estateName}</center></h3>
                    <div>&nbsp;</div>
                    <h3><center>Division - {SearchData.divisionName}</center></h3>
                    <div>&nbsp;</div>
                    <h3><center>{sundryAttendanceSearchDetails}</center></h3>
                    <div>
                        <Box minWidth={1050}>
                            <MaterialTable
                                title="Multiple Actions Preview"
                                columns={[
                                    { title: 'EMP No', field: 'registrationNumber' },
                                    { title: 'EMP Name', field: 'fullName' },
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
                                        title: 'Job', field: 'jobID', lookup: {
                                            1: "Manual Weeding",
                                            2: "Manul Fertilizing"
                                        }
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
                                data={sundryAttendanceViewDetails}
                                options={{
                                    exportButton: false,
                                    showTitle: false,
                                    headerStyle: { textAlign: "center" },
                                    cellStyle: { textAlign: "left" },
                                    columnResizable: false,
                                    actionsColumnIndex: -1,
                                    pageSize: 5
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