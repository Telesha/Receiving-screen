import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Slide from '@material-ui/core/Slide';
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const FormDialog = ({ userData }) => {
  const [open, setOpen] = React.useState(false);
  const [maxWidth, setMaxWidth] = React.useState('lg');
  const [fullWidth, setFullWidth] = React.useState(true);
  const [data, setData] = useState({
    amount: ''
  })
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setData({ ...data, amount: '' })
  };

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setData({
      ...data,
      [e.target.name]: value
    });
  }

  return (
    <div>
      <Button variant="outlined" color="primary" onClick={handleClickOpen}>
        Request Over Advance
      </Button>
      <Dialog open={open} fullWidth={fullWidth} TransitionComponent={Transition} onClose={handleClose} aria-labelledby="form-dialog-title" style={{ backgroundColor: 'transparent', boxShadow: 'none' }} minWidth={maxWidth}>
        <DialogTitle id="form-dialog-title" >
          <Typography
            color="textSecondary"
            gutterBottom
            variant="h2"
          >
            <Box textAlign="center" >
              Over Advance Request
      </Box>

          </Typography></DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Typography
              color="textPrimary"
              gutterBottom
              variant="h4"
            >
              <Box textAlign="center" >
                Enter Requested Amount
      </Box>

            </Typography>

          </DialogContentText>
          <Typography variant="h4">
            <TextField
              autoFocus
              style={{ fontSize: 40 }}
              margin="dense"
              id="Amount"
              type="number"
              name="amount"
              fullWidth
              onChange={(e) => handleChange(e)}
              value={data.amount}
            /></Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={() => { userData(data.amount); handleClose(); }} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
