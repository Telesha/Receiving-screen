import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { Formik } from 'formik';
import {
  Box,
  Button,
  Container,
  Grid,
  Link,
  TextField,
  Typography,
  makeStyles
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from './Services';
import { Alert, AlertTitle } from '@material-ui/lab';
import { LoadingComponent } from './../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), url("https://upload.wikimedia.org/wikipedia/commons/7/77/Tea_Plantations-Surianalle.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    height: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  }
}));

const LoginView = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState({
    username: "",
    password: ""

  });
  const [isHidden, setIsHidden] = useState(false)

  const [messageModel, setmessageModel] = useState([]);

  async function login(values) {
    let result = await services.login(values);
    if (result.statusCode == "Error") {
      setIsHidden(true);
      setmessageModel(result.message);
      return;
    }
    sessionStorage.setItem('token', result.data);
    // navigate('/app/dashboard');
    navigate('/loader');
  }

  return (
    <Page
      className={classes.root}
      title="Sign in"
    >
      <Box
        display="flex"
        flexDirection="column"
        height="100%"
        justifyContent="center"
      >
        <LoadingComponent />
        <Container maxWidth="sm">
          <Formik
            initialValues={{
              username: userDetails.username,
              password: userDetails.password
            }}
            validationSchema={Yup.object().shape({
              username: Yup.string().max(255).required('Username is required'),
              password: Yup.string().max(255).required('Password is required')
            })}
            onSubmit={(e) => trackPromise(login(e))}
          >
            {({
              errors,
              handleBlur,
              handleChange,
              handleSubmit,
              isSubmitting,
              touched,
              values
            }) => (
              <form onSubmit={handleSubmit}>
                <Box mb={3}>
                  <Typography
                    color="textPrimary"
                    variant="h2"
                  >
                    Sign in
                  </Typography>
                </Box>
                <Grid
                  item
                  xs={12}
                  md={12}
                >
                  {isHidden ? <Alert severity="error">
                    <AlertTitle>Error: <strong>{messageModel}</strong></AlertTitle>

                  </Alert> : null}
                </Grid>
                <TextField
                  error={Boolean(touched.username && errors.username)}
                  fullWidth
                  helperText={touched.username && errors.username}
                  label="Username"
                  margin="normal"
                  name="username"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  type="text"
                  value={values.username}
                  variant="outlined"
                  style={{ backgroundColor: 'transparent' }}
                />
                <TextField
                  error={Boolean(touched.password && errors.password)}
                  fullWidth
                  helperText={touched.password && errors.password}
                  label="Password"
                  margin="normal"
                  name="password"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  type="password"
                  value={values.password}
                  variant="outlined"
                  style={{ backgroundColor: 'transparent' }}
                />
                <Box my={2}>
                  <Button
                    color="primary"
                    disabled={isSubmitting}
                    fullWidth
                    size="large"
                    type="submit"
                    variant="contained"
                  >
                    Sign in now
                  </Button>
                </Box>
              </form>
            )}
          </Formik>
        </Container>
      </Box>
    </Page>
  );
};

export default LoginView;
