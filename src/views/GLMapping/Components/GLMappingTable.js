import React from 'react';
import {makeStyles} from '@material-ui/core';
import MaterialTable from 'material-table';
import { useNavigate } from 'react-router-dom';


const useStyles = makeStyles({
    table: {
        maxHeight: '5rem'
    },
    tableVerticleBorder: {
        borderWidth: 0,
        borderWidth: 1,
        borderColor: 'rgba(224, 224, 224, 1)',
        borderStyle: 'solid'
    }
});

export const GLMappingGrid = ({
    GLMapingDataList, handleViewOnly, permissionList, FormDetails
}) => {


    const classes = useStyles()
    const navigate = useNavigate();

    const columns = [
        { title: 'Transaction Type', field: 'transactionType' },
        {
            title: 'Status',
            field: 'statusID',
            lookup: {
                1: 'Pending',
                2: 'Approved',
                3: 'Rejected'
            },
            defaultSort: "desc"
        },
        //for future use
        // {
        //     title: 'Active / Inactive',
        //     field: 'isActive',
        //     lookup: {
        //         false: 'Inactive',
        //         true: 'Active',
        //     }
        // },
    ];

    const EditGLMappingDetails = (id) => {
        navigate('/app/glmapping/addEdit/' + btoa(id) + "/" + btoa(FormDetails.groupID) + "/" + btoa(FormDetails.factoryID));
    }

    const ApproveGLMappingDetails = (id) => {
        navigate('/app/glmapping/approveReject/' + btoa(id) + "/" + btoa(FormDetails.groupID) + "/" + btoa(FormDetails.factoryID));
    }

    return (
        <MaterialTable
            title={false}
            data={GLMapingDataList}
            columns={columns}
            options={{
                selection: false,
                search: true,
                actionsColumnIndex: -1,
                columnResizable: true,
                rowStyle: rowData => ({
                    backgroundColor: (rowData.statusID === 1) ? '#fce3b6' : '#fff'
                })
            }}
            actions={[
                // {
                //     icon: 'visibilityIcon',
                //     tooltip: 'View GL Accounts',
                //     onClick: (event, GLData) => handleViewOnly(GLData)
                // },
                rowData => ({
                    hidden: !permissionList.isAddEditEnabled,
                    icon: 'delete',
                    tooltip: 'Delete GL Accounts',
                    onClick: (event, GLData) => EditGLMappingDetails(GLData.id)
                }),
                rowData => ({
                    hidden: rowData.statusID === 2 || rowData.statusID === 3 || !permissionList.isApproveRejectEnabled,
                    icon: 'beenhere',
                    tooltip: 'Approve GL Mapping',
                    onClick: (event, GLData) => ApproveGLMappingDetails(GLData.id)
                })
            ]}
        />
    )

}