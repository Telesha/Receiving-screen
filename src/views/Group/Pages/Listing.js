import React, { useState, useEffect, createContext } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import moment from 'moment';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Avatar,
  Box,
  Card,
  Checkbox,
  Table,
  Grid,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  makeStyles,
  Container,
  CardHeader,
  CardContent,
  Divider
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

export default function GroupListing() {
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

  const [groupData, setGroupData] = useState([]);
  const navigate = useNavigate();
  let encrypted = "";
  const handleClick = () => {
    encrypted = btoa('0');
    navigate('/app/groups/addedit/' + encrypted);
  }

  const handleClickEdit = (groupID) => {
    encrypted = btoa(groupID.toString());
    navigate('/app/groups/addedit/' + encrypted);
  }

  useEffect(() => {
    trackPromise(
      GetAllGroups()
    );
  }, []);

  async function GetAllGroups() {
    const result = await services.GetAllGroups();
    setGroupData(result);
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
            toolTiptitle={"Add Group"}
          />
        </Grid>
      </Grid>
    )
  }

  return (
    <Page
      className={classes.root}
      title="Groups"
    >
      <Container maxWidth={false}>
        <Box mt={0}>
          <Card>
            <CardHeader
              title={cardTitle("Group")}
            />
            <PerfectScrollbar>
              <Divider />
              <Box minWidth={1000}> 
                <MaterialTable
                        title="Multiple Actions Preview"
                        columns={[
                        { title: 'Group Code', field: 'groupCode' },
                        { title: 'Group Name', field: 'groupName' },
                        { title: 'Status', field: 'isActive', lookup: { 
                            true: 'Active', 
                            false: 'Inactive' 
                        } },  
                       ]}
                         data={groupData}
                         options={{
                         exportButton: false,
                         showTitle: false,
                         headerStyle: { textAlign: "left", height: '1%' },
                         cellStyle: { textAlign: "left" },
                         columnResizable: false,
                         actionsColumnIndex: -1
                       }}
                         actions={[
                       { 
                        icon: 'edit',
                        tooltip: 'Edit Group',
                        onClick: (event, groupData) => handleClickEdit(groupData.groupID)
                      }
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

