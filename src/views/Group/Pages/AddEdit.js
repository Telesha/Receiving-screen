import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  Grid,
  TextField,
  makeStyles,
  Container,
  Button,
  CardContent,
  Divider,
  InputLabel,
  Switch,
  CardHeader,
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from "yup";
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import ObjectCompare from 'src/utils/ObjectCompare';
import { AlertDialogWithoutButton } from 'src/views/Common/AlertDialogWithoutButton';

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

export default function GroupAddEdit(props) {
  const [title, setTitle] = useState("Add Group")
  const [isUpdate, setIsUpdate] = useState(false);
  const [isDisableButton, setIsDisableButton] = useState(false);
  const classes = useStyles();
  const [group, setGroup] = useState({
    groupName: '',
    groupCode: '',
    isActive: true,
  });
  const [groupIsActive, setGroupIsActive] = useState(true);
  const [initialGroup, setInitialGroup] = useState(group);
  const navigate = useNavigate();
  const [dialog, setDialog] = useState(false);

  const handleClick = () => {
    const isChange = ObjectCompare.isObjectEqual(initialGroup, group);
    if (isChange) navigate('/app/groups/listing');
    else setDialog(true);
  }

  const alert = useAlert();
  const { groupID } = useParams();
  let decrypted = 0;

  useEffect(() => {
    getPermissions();
  }, []);

  useEffect(() => {
    decrypted = atob(groupID.toString());
    if (decrypted != 0) {
      trackPromise(
        getGroupDetails(decrypted)
      )
    }
  }, []);

  async function getGroupDetails(groupID) {
    let response = await services.getGroupDetailsByID(groupID);
    let data = response[0];
    setTitle("Update Group");
    setGroup(data);
    setInitialGroup(data);
    setIsUpdate(true);
    setGroupIsActive(response[0]);
  }
  async function getPermissions() {
  }

  async function saveGroup(values) {
    if (isUpdate == true) {

      let updateModel = {
        groupID: atob(groupID.toString()),
        groupCode: values.groupCode,
        groupName: values.groupName,
        isActive: values.isActive,
      }

      let response = await services.updateGroup(updateModel);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        navigate('/app/groups/listing');
      }
      else {
        setGroup({
          ...group,
          isActive: groupIsActive
        });
        alert.error(response.message);
      }
    } else {
      let response = await services.saveGroup(values);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        navigate('/app/groups/listing');
      }
      else {
        alert.error(response.message);
      }
    }
  }

  async function confirmRequest() {
    navigate('/app/groups/listing');
  }

  async function cancelRequest() {
    setDialog(false);

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
          />
        </Grid>
      </Grid>
    )
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupName: group.groupName,
              groupCode: group.groupCode,
              isActive: group.isActive,

            }}
            validationSchema={
              Yup.object().shape({
                groupName: Yup.string().max(255, 'Group Name must be at least 255 characters').required('Group name is required')
                  .matches(/^[^\s]/, 'Group name must not start with a whitespace character')
                  .matches(/^[a-zA-Z\s]*$/, 'Only alphabets and spaces are allowed'),
                groupCode: Yup.string().max(255).required('Group code is required').matches(/^[0-9\b]+$/, 'Only allow numbers')
                  .min(2, 'Group code must be at least 2 characters').max(2, 'Group Code must be at most 2 characters'),
              })
            }
            onSubmit={saveGroup}
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleSubmit,
              isSubmitting,
              handleChange,
              touched,
              values,
              props
            }) => (
              <form onSubmit={handleSubmit}>
                <Box mt={0}>
                  <Card>
                    <CardHeader
                      title={cardTitle(title)}
                    />
                    <PerfectScrollbar>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="groupCode">
                              Group Code *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.groupCode && errors.groupCode)}
                              fullWidth
                              helperText={touched.groupCode && errors.groupCode}
                              name="groupCode"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={values.groupCode}
                              variant="outlined"
                              disabled={isDisableButton}
                              InputProps={{
                                readOnly: isUpdate ? true : false,
                              }}
                              onInput={(e) => {
                                e.target.value = e.target.value.slice(0, 2)
                              }}
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="groupName">
                              Group Name *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.groupName && errors.groupName)}
                              fullWidth
                              helperText={touched.groupName && errors.groupName}
                              name="groupName"
                              size='small'
                              onBlur={handleBlur}
                              onChange={handleChange}
                              value={values.groupName}
                              variant="outlined"
                              disabled={isDisableButton}
                            />
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="isActive">
                              Active
                            </InputLabel>
                            <Switch
                              checked={values.isActive}
                              onChange={(e) => handleChange(e)}
                              name="isActive"
                              disabled={isDisableButton}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                      <Box display="flex" justifyContent="flex-end" p={2}>
                        <Button
                          color="primary"
                          disabled={isSubmitting || isDisableButton}
                          type="submit"
                          variant="contained"
                        >
                          {isUpdate == true ? "Update" : "Save"}
                        </Button>
                      </Box>
                    </PerfectScrollbar>
                  </Card>
                </Box>
                {dialog ?
                  <AlertDialogWithoutButton confirmData={confirmRequest} cancelData={cancelRequest}
                    headerMessage={"Factory Management"}
                    discription={"The added group details will not be saved. Are you sure you want to leave?"} />
                  : null}
              </form>
            )}
          </Formik>
        </Container>
      </Page>
    </Fragment>
  );
};
