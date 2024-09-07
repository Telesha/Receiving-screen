import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {
  AppBar,
  Badge,
  Box,
  Hidden,
  IconButton,
  Toolbar,
  Button,
  makeStyles,
  Avatar,
  Typography,
  withStyles,
  Tooltip,
  Grid
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import NotificationsIcon from '@material-ui/icons/NotificationsOutlined';
import InputIcon from '@material-ui/icons/Input';
import Logo from 'src/components/Logo';
import Popover from '@material-ui/core/Popover';
import tokenService from '../../utils/tokenDecoder';
import { Offline, Online, Detector } from "react-detect-offline"
import WifiIcon from '@material-ui/icons/Wifi';
import RssFeedIcon from '@material-ui/icons/RssFeed';
import sessionStorageReadWrite from 'src/utils/sessionStorageReadWrite'
import { AlertDialog } from 'src/views/Common/AlertDialog';
import webConfigurationRead from 'src/utils/webConfigurationRead';

const useStyles = makeStyles(() => ({
  root: {
    background: '#ffffff'
  },
  avatar: {
    width: 50,
    height: 50
  }
}));

const NameTextTypography = withStyles({
  root: {
    color: "#5D605F"
  }
})(Typography);

const CaptionTextTypography = withStyles({
  root: {
    color: "#0308AB"
  }
})(Typography);

// const user = {
//   avatar: '/static/images/avatars/avatar_6.png',
//   jobTitle: tokenService.getRoleNameFromToken(),
//   name: tokenService.getUserNameFromToken()
// };

const TopBar = ({
  className,
  onMobileNavOpen,
  ...rest
}) => {
  const classes = useStyles();
  const [notifications] = useState([]);

  const [userName, setUserName] = useState()
  const [roleName, setRoleName] = useState()
  const [message, setMessage] = useState('Logout Confirmation AgriGEN');
  const [EnableConfirmMessage, setEnableConfirmMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmPopUp, setconfirmPopUp] = useState();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;
  const [ConnectionCheckConfiguration, setConnectionCheckConfiguration] = useState({
    isEnabled: true,
    interval: 5000,
    timeout: 5000
  })
  const navigate = useNavigate();

  const logout = async (values) => {
    ClearAllSessionStorageItems();
    navigate('/signin');
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handlePasswordChange = (event) => {
    let encryptedUserID = btoa(tokenService.getUserIDFromToken().toString())
    navigate("/app/users/changeUserPassword/" + encryptedUserID)
    setAnchorEl(false);
  }

  useEffect(() => {
    setUserName(tokenService.getUserNameFromToken())
    setRoleName(tokenService.getRoleNameFromToken())
  }, []);

  const user = {
    //avatar: '/static/images/not_found.png',
    jobTitle: roleName,
    name: userName
  };

  function ClearAllSessionStorageItems() {
    sessionStorageReadWrite.removeTokenFromSession();
    sessionStorageReadWrite.removeLastSelectedMainMenuIDFromSession();
    sessionStorageReadWrite.removeLastSelectedParentMenuIDFromSession();
    sessionStorageReadWrite.removeLastSelectedScreenIDFromSession();
  }

  function confirmData(y) {
    if (y) {
      logout(confirmPopUp);
    }
  }

  async function confirmMessage(data) {
    setIsLoading(true);
    setEnableConfirmMessage(true);
    setconfirmPopUp(data);
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }

  useEffect(() => {
    GetConnectionCheckConfigDetails()
  }, [])


  async function GetConnectionCheckConfigDetails() {
    const response = await webConfigurationRead.ReadConnectionCheckConfig();
    if (response != null && response != undefined) {
      setConnectionCheckConfiguration(response);
    }
  }

  return (
    <AppBar
      className={clsx(classes.root, className)}
      elevation={0}
      {...rest}
    >
      <Toolbar>

        <Hidden mdDown>
          <RouterLink to="/">
            <Logo />
          </RouterLink>
          <Box flexGrow={1} />

          <Box paddingRight="20px">
            {
              ConnectionCheckConfiguration.isEnabled === true ?
                <Detector
                  polling={{
                    interval: ConnectionCheckConfiguration.interval,
                    timeout: ConnectionCheckConfiguration.timeout,
                  }}
                  render={({ online }) => (
                    online ?
                      <WifiIcon style={{
                        color: "green"
                      }} /> : <WifiIcon style={{
                        color: "#FF9B86"
                      }} />
                  )}
                /> :
                <RssFeedIcon
                  style={{
                    color: "green"
                  }}
                />
            }
          </Box>

          <Box
            paddingRight="10px">
            <NameTextTypography
              color="primary"
              variant="h6"  >
              {user.name}
            </NameTextTypography >
            <CaptionTextTypography

              variant="caption" >
              {user.jobTitle}
            </CaptionTextTypography>
          </Box>
          <Box>
            <Avatar
              className={classes.avatar}
              // component={RouterLink}
              src={user.avatar}
              // to="/app/dashboard"
              style={{ cursor: 'pointer' }}
              onClick={handleClick}
            />
            <Popover
              id={id}
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <Button color="primary" onClick={handlePasswordChange}>Change Password</Button>
            </Popover>
          </Box>
          <IconButton >
            <Badge
              badgeContent={notifications.length}
              color="primary"
              variant="dot"
            >
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Tooltip title="Sign out">
            <IconButton >
              <InputIcon
                onClick={() => confirmMessage()}
              />
            </IconButton>
          </Tooltip>
        </Hidden>
        <Hidden lgUp>
          <IconButton
            color="primary"
            onClick={onMobileNavOpen} >
            <MenuIcon />
          </IconButton>
          <Box flexGrow={1} />
          <Box
            paddingRight="5px">
            <NameTextTypography
              variant="h6" >
              {user.name}
            </NameTextTypography>

          </Box>
          <Box>
            <Avatar
              className={classes.avatar}
              component={RouterLink}
              src={user.avatar}
              to="/app/account"
            />
          </Box>
          <IconButton color="inherit">
            <InputIcon
              onClick={logout}
            />
          </IconButton>

        </Hidden>
        <div hidden={true}>
          <Grid item>
            <AlertDialog
              confirmData={confirmData}
              headerMessage={message}
              viewPopup={EnableConfirmMessage}
              discription={'Are you sure want to Logout?'}
              setViewPopup={setEnableConfirmMessage}
            />
          </Grid>
        </div>
      </Toolbar>
    </AppBar>
  );
};

TopBar.propTypes = {
  className: PropTypes.string,
  onMobileNavOpen: PropTypes.func
};

export default TopBar;