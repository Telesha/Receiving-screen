import React, { useState, useEffect, Fragment, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, CardHeader,
  IconButton, TableBody, TableCell, TableContainer, TableHead, TableRow, Table
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import { useNavigate } from 'react-router-dom';
import { LoadingComponent } from './../../../utils/newLoader';
import ClearIcon from '@material-ui/icons/Clear';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
  avatar: {
    marginRight: theme.spacing(2)
  },
  colorCancel: {
    backgroundColor: "red",
  },
  colorRecord: {
    backgroundColor: "green",
  },
}));

const screenCode = 'ADVANCEPAYMENTUPLOAD';

export default function AdvancePaymentUpload(props) {
  const [title, setTitle] = useState("Advance Payment Upload");
  const [fileInfo, setFileInfo] = useState();
  const [jsonData, setJsonData] = useState([]);
  const [columnData, setColumnData] = useState([]);
  const [buttonHidden, setButtonHidden] = useState(true);
  const classes = useStyles();
  const navigate = useNavigate();

  useEffect(() => {
    trackPromise(
      getPermission());
  }, []);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWADVANCEPAYMENTUPLOAD');

    if (isAuthorized === undefined) {
      navigate('/404');
    }
  }

  function cardTitle(titleName) {
    return (
      <Grid container spacing={1}>
        <Grid item md={10} xs={12}>
          {titleName}
        </Grid>
      </Grid>
    )
  }

  const showFile = async (e) => {
    setJsonData([])
    var name = document.getElementById('fileInput');
    setFileInfo(name.files.item(0))
    if (name.files.item(0) != null) {
      if (name.files.item(0).type == "text/plain") {
        const xlsx = require('xlsx');
        const fs = require('fs');
        e.preventDefault()
        const reader = new FileReader()
        reader.onload = async (e) => {
          const text = (e.target.result)
          const buffer = Buffer.from(text, 'base64');
          const workbook = xlsx.read(buffer, { type: 'buffer' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = xlsx.utils.sheet_to_json(worksheet);
          setJsonData(jsonData)
          createTable(jsonData.length == 0 ? [] : jsonData)
        };
        reader.readAsText(e.target.files[0])
      }
    }
    setButtonHidden(false)
  }

  function createTable(data) {
    let result = [];
    for (var property in data[0]) {

      result.push({ name: property, value: property })
    }
    setColumnData(result);
  }

  function resetFields() {
    document.getElementById('fileInput').value = "";
    var name = document.getElementById('fileInput');
    if (name.files.length == 0) {
      setButtonHidden(true);
      setFileInfo(null);
      setJsonData([]);
    }
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <form>
            <Box mt={0}>
              <Card>
                <CardHeader title={cardTitle(title)} />
                <Divider />
                <Box display="flex" justifyContent="flex-start" p={2}>
                  <Button
                    variant="contained"
                    component="label"
                  >
                    Upload File
                    <input
                      type="file"
                      hidden
                      id="fileInput"
                      onChange={(e) => showFile(e)}
                    />
                  </Button>
                  &nbsp;
                  {fileInfo == undefined ? null :
                    (fileInfo.type == "text/plain" ?
                      <span style={{ marginTop: '9px', marginLeft: '5px' }}>{fileInfo.name}</span> :
                      <span style={{ color: 'red', marginTop: '9px', marginLeft: '5px' }}>{fileInfo.name + " not support"}</span>
                    )
                  }
                  &nbsp;
                  {(buttonHidden == true || fileInfo == null) ? null :
                    <IconButton aria-label="delete" size='small' onClick={() => resetFields()}>
                      <ClearIcon color='error' fontSize="medium" />
                    </IconButton>
                  }
                </Box>
                {jsonData.length > 0 ?
                  <Box minWidth={1050}>
                    <TableContainer>
                      <Table aria-label="caption table">
                        <TableHead>
                          <TableRow>
                            {columnData.map((data, index) => {
                              return (
                                <TableCell align={'center'}>{data.name}</TableCell>
                              )
                            })}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {jsonData.map((data, index) => {
                            return (
                              <TableRow>
                                {columnData.map((column) => {
                                  const value = data[column.value];
                                  return (
                                    <TableCell align={'center'}>
                                      {value == undefined ? '-' : value}
                                    </TableCell>
                                  );
                                })}
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box> : null}
              </Card>
            </Box>
          </form>
        </Container>
      </Page>
    </Fragment>
  );
}
