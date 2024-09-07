import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const AlertDialogWithoutButton = ({ confirmData, headerMessage, discription, cancelData }) => {
  const [open, setOpen] = React.useState(true);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Dialog
        open={open}
        onBackdropClick="false"
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle id="alert-dialog-slide-title"> <Typography
          color="textSecondary"
          gutterBottom
          variant="h3"
        >
          <Box textAlign="center" >
            {headerMessage}
          </Box>

        </Typography></DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            {discription}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { cancelData(); handleClose(); }} color="primary">
            No
          </Button>
          <Button onClick={() => { confirmData(true); handleClose(); }} color="primary">
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
