import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { trackPromise } from 'react-promise-tracker';
import {
  Box,
  Divider,
  Drawer,
  Hidden,
  List,
  makeStyles,
  Tooltip
} from '@material-ui/core';

import tokenService from '../../../utils/tokenDecoder';
import { CommonGet } from '../../../helpers/HttpClient';
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Collapse from '@material-ui/core/Collapse';
import Icon from '@material-ui/core/Icon';
import { LoadingComponent } from 'src/utils/newLoader';
import sessionStorageReadWrite from 'src/utils/sessionStorageReadWrite';

const user = {
  avatar: '/static/images/avatars/avatar_6.png',
  jobTitle: 'Senior Developer',
  name: 'Katarina Smith'
};

const useStyles = makeStyles(() => ({
  mobileDrawer: {
    width: 275
  },
  desktopDrawer: {
    width: 275,
    top: 64,
    height: 'calc(100% - 64px)'
  },
  avatar: {
    cursor: 'pointer',
    width: 64,
    height: 64
  },
  parentMainMenu: {
    background: '#3f51b5',
    color: "#FFFFFF",
    width: 50,
    height: 'calc(100%)'
  },
  parentMainMenuList: {
  },
  menuList: {
    width: '100%',
    overflowY: 'scroll',
    overflowX: 'hidden'
  },
  RootClass: {
    overflow: 'hidden'
  }
}));

const NavBar = ({ onMobileClose, openMobile }) => {
  const classes = useStyles();
  const location = useLocation();
  const [mainNavigationMenu, setmainNavigationMenu] = useState([])
  const [activeMenuID, setActiveMenuID] = useState()
  const [parentMainMenuList, setParentMainMenuList] = useState([])
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const handleClick = (menuID) => {
    if (menuID == activeMenuID) {
      setActiveMenuID('0')
    } else {
      setActiveMenuID(menuID)
    }
  };

  const handleMainMenuClick = (mainMenuID) => {
    trackPromise(getMenuModelsByRole(mainMenuID))
    ClearScreenMemory();
    navigate('/app/dashboard')
  };

  const buttonProps = (value) => {
    let copyMainMenuList = [...mainNavigationMenu]

    let res = copyMainMenuList.filter(e => e.screenList.some(x => x.screenID === value))

    if (res !== null && res.length > 0) {
      sessionStorageReadWrite.setLastSelectedParentMenuIDFromSession(res[0].parentMenuID);
      sessionStorageReadWrite.setLastSelectedMainMenuIDFromSession(res[0].menuID);
      sessionStorageReadWrite.setLastSelectedScreenIDFromSession(value);
    }

    setSelectedIndex(value)
  };

  useEffect(() => {
    trackPromise(getParentMenuByRole())
    trackPromise(refreshIssue())
  }, []);

  useEffect(() => {
    if (openMobile && onMobileClose) {
      onMobileClose();
    }
  }, [location.pathname]);

  useEffect(() => {
    if (parentMainMenuList.length > 0) {
      let last_click_parent_menu_id = sessionStorageReadWrite.getLastSelectedParentMenuIDFromSession();
      let parentMenuID = parseInt(last_click_parent_menu_id === null ? "0" : last_click_parent_menu_id.toString());

      trackPromise(getMenuModelsByRole(parentMenuID > 0 ? parentMenuID : parentMainMenuList[0].parentMenuID))
    }
  }, [parentMainMenuList]);

  async function refreshIssue() {
    let last_click_menu_id = sessionStorageReadWrite.getLastSelectedMainMenuIDFromSession();
    let last_click_screen_id = sessionStorageReadWrite.getLastSelectedScreenIDFromSession();

    setActiveMenuID(parseInt(last_click_menu_id === null ? "0" : last_click_menu_id.toString()));
    setSelectedIndex(parseInt(last_click_screen_id === null ? "0" : last_click_screen_id.toString()))
  }

  async function getMenuModelsByRole(mainMenuID) {
    const response = await CommonGet('/api/MainNavMenu/GetMenuModelsByRole', 'roleID=' + tokenService.getRoleIDFromToken() + '&mainMenuID=' + mainMenuID);
    setmainNavigationMenu(response)
  }

  async function getParentMenuByRole() {
    const response = await CommonGet('/api/ParentMainMenu/GetParentMenuByRole', 'roleID=' + tokenService.getRoleIDFromToken());
    setParentMainMenuList(response)
  }

  function ClearScreenMemory() {
    sessionStorageReadWrite.removeLastSelectedMainMenuIDFromSession();
    sessionStorageReadWrite.removeLastSelectedParentMenuIDFromSession();
    sessionStorageReadWrite.removeLastSelectedScreenIDFromSession();
    setSelectedIndex(0);
    setActiveMenuID('0');
  }

  const content = (
    <Box
      height="100%"
      display="flex"
      flexDirection="row"
      className={classes.RootClass}
    >
      <LoadingComponent />
      <Divider />
      <div className={classes.parentMainMenu} >
        <List className={classes.parentMainMenuList}>
          {parentMainMenuList.map((item) => (
            <ListItem
              style={{ color: '#ffffff', paddingBottom: 25 }}
              button
              onClick={() => { handleMainMenuClick(item.parentMenuID) }}
              key={item.parentMenuID}
            >
              <Tooltip title={item.parentMenuName}>
                <ListItemIcon >

                  <Icon style={{ fontSize: 20, color: '#ffffff' }} >{`${item.iconTag}`}</Icon>

                </ListItemIcon>
              </Tooltip>
            </ListItem>
          ))}
        </List>

      </div>
      <Box className={classes.menuList}>
        <List >
          {mainNavigationMenu.map((item) => (
            <div key={item.menuID}>

              {item.screenList != null ? (
                <div key={item.menuID}>


                  <ListItem
                    style={{ color: '#3f51b5' }}
                    button
                    onClick={() => { handleClick(item.menuID) }}
                    key={item.menuID}
                  >
                    <ListItemIcon >
                      <Icon style={{ fontSize: 20, color: '#3f51b5' }} >{`${item.iconTag}`}</Icon>
                    </ListItemIcon>
                    <ListItemText style={{ fontSize: 15 }}
                      primary={item.mainMenuName}
                    />
                    {item.menuID == activeMenuID ? (<ExpandLess style={{ color: '#292727' }} />) : (<ExpandMore style={{ color: '#292727' }} />)}
                  </ListItem>
                  <Collapse
                    key={"123"}
                    component="li"
                    in={item.menuID == activeMenuID}
                    timeout="auto"
                    unmountOnExit
                  >
                    <List p={2}>
                      {item.screenList.map((sitem, i) => {
                        return (
                          <RouterLink key={i} to={sitem.routePath} aria-label="group" className="link" >
                            <ListItem
                              button
                              style={{ color: '#82888c', paddingLeft: "10%" }}
                              onClick={() => buttonProps(sitem.screenID)}
                              selected={selectedIndex === sitem.screenID}>

                              <ListItemIcon >
                                <Icon style={{ fontSize: 15, color: '#292727' }} >{`${sitem.iconTag}`}</Icon>
                              </ListItemIcon>
                              <ListItemText style={{ fontSize: 12 }}
                                primary={sitem.screenName}
                              />
                            </ListItem>
                          </RouterLink>
                        );
                      }
                      )}
                    </List>
                  </Collapse>

                </div>
              ) : (
                <div>
                  <RouterLink key={item.screenID} to={item.routePath} aria-label="group" className="link" >
                    <ListItem>
                      <ListItemIcon >
                        <Icon style={{ fontSize: 15 }} >{`${item.iconTag}`}</Icon>
                      </ListItemIcon>
                      <ListItemText style={{ fontSize: 15 }}
                        primary={item.screenName}
                      />
                    </ListItem>
                  </RouterLink>
                </div>

              )}

            </div>

          ))}
        </List>
      </Box>
    </Box>
  );

  return (
    <>
      <Hidden lgUp>
        <Drawer
          anchor="left"
          classes={{ paper: classes.mobileDrawer }}
          onClose={onMobileClose}
          open={openMobile}
          variant="temporary"
        >
          {content}
        </Drawer>
      </Hidden>
      <Hidden mdDown>
        <Drawer
          anchor="left"
          classes={{ paper: classes.desktopDrawer }}
          open
          variant="persistent"
        >
          {content}
        </Drawer>
      </Hidden>
    </>
  );
};

NavBar.propTypes = {
  onMobileClose: PropTypes.func,
  openMobile: PropTypes.bool
};

NavBar.defaultProps = {
  onMobileClose: () => { },
  openMobile: false
};

export default NavBar;
