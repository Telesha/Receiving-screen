import React, { Component } from 'react';
import { usePromiseTracker } from "react-promise-tracker";
import 'react-responsive-modal/styles.css';
import { Modal } from 'react-responsive-modal';
import { ClassicSpinner } from "react-spinners-kit";
import { Grid } from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';

export const LoadingComponent = (props) => {
  const { promiseInProgress } = usePromiseTracker();
  const styles = {
    modal: {
      backgroundColor: "transparent",
      boxShadow: "none",
      overflow: "none",
    },
  };

  return (
    <Grid >
      <Modal
        center
        open={promiseInProgress}
        onClose={promiseInProgress}
        showCloseIcon={false}
        focusTrapped={false}
        styles={styles}
        closeOnOverlayClick={false}
      >
        {/* 
        <ClassicSpinner
          size={60}
          color="#4863A0"
          open={promiseInProgress}
          onClose={promiseInProgress}
        /> */}
        <CircularProgress
          size={60}
        />

      </Modal>

    </Grid>
  );

};

export const ManualLoadingComponent = (props) => {
  const { inProgress } = props.inProgress;
  const styles = {
    modal: {
      backgroundColor: "transparent",
      boxShadow: "none",
      overflow: "none",
    },
  };

  return (
    <Grid >
      <Modal
        center
        open={props.inProgress}
        onClose={props.inProgress}
        showCloseIcon={false}
        focusTrapped={false}
        styles={styles}
        closeOnOverlayClick={false}
      >

        <ClassicSpinner
          size={60}
          color="#4863A0"
          open={props.inProgress}
          onClose={props.inProgress}
        />

      </Modal>

    </Grid>
  );

};