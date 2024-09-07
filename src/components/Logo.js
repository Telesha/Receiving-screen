import React from 'react';
import { Box, Badge, makeStyles, IconButton, Avatar } from '@material-ui/core';
import sessionStorageReadWrite from 'src/utils/sessionStorageReadWrite';


const useStyles = makeStyles(() => ({
  root: {},
  avatar: {
    width: 200,
    height: 60
  }
}));

const Logo = (props) => {

  function ClearScreenMemory() {
    sessionStorageReadWrite.removeLastSelectedMainMenuIDFromSession();
    sessionStorageReadWrite.removeLastSelectedParentMenuIDFromSession();
    sessionStorageReadWrite.removeLastSelectedScreenIDFromSession();
  }

  const classes = useStyles();
  return (
    <Box>
      <Avatar
        src="/static/images/products/AgriGEN.png"
        to="/app/account"
        className={classes.avatar}
        onClick={() => ClearScreenMemory()}
      />
      {/*       
          <img
            alt="Logo"
            src="/static/images/products/AgriGEN.png"
            class={classes.avatar}
            {...props}
          /> */}

    </Box>

  );
};

export default Logo;
