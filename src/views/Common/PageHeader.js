import React, { useState, useEffect, } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import {
  Box,
  Button,
  SvgIcon,
  makeStyles,
  Tooltip
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';


const useStyles = makeStyles((theme) => ({
  root: {},
  importButton: {
    marginRight: theme.spacing(1)
  },
  exportButton: {
    marginRight: theme.spacing(1)
  }
}));

const PageHeader = ({ className, title, onClick, isEdit, toolTiptitle, ...rest }) => {
  
  const classes = useStyles();
  let toolTip = toolTiptitle === null ? toolTiptitle ? "" : "" : toolTiptitle; 

  return (
    <div
      className={clsx(classes.root, className)}
      {...rest}
    >
      <Box
        display="flex"
        justifyContent="flex-end"
      >
        
        <Tooltip title={isEdit ? toolTip : ""}>
          <Button
            color="primary"
            variant="contained"
            onClick={onClick}
            size ='small'
          >
            <SvgIcon
              fontSize="medium"
              color="action"
            >
              {isEdit ? <AddIcon style={{ color: "white" }} /> : <ArrowBackIcon style={{ color: "white" }} />}
            </SvgIcon>
            
          </Button>
         </Tooltip> 
      </Box>
    </div>
  );
};

PageHeader.propTypes = {
  className: PropTypes.string
};

export default PageHeader;
