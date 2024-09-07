import React, { useState, useEffect } from 'react';
import 'react-responsive-modal/styles.css';
import { Modal } from 'react-responsive-modal';
import {
  Box, Card, Button, Grid, TextField, MenuItem, FormControlLabel,
  RadioGroup, Radio, FormControl, FormLabel, InputLabel, Typography,
  CardContent, CardHeader
} from '@material-ui/core';
import { useAlert } from "react-alert";
import { Formik, } from 'formik';
import * as Yup from "yup";
import { KeyboardDatePicker } from "@material-ui/pickers";
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import services from '../Services';

export const UpdateRealizedCheque = ({ open, onUpdateRealizedChequeClose, realizingChequeModalData }) => {
  const alert = useAlert();
  const [selectedDate, handleDateChange] = useState(new Date());

  async function updateRealizedCheque() {
    let realizedCheque = {
      ledgerTransactionID: realizingChequeModalData.ledgerTransactionID,
      realizedDate: selectedDate.toISOString(),
    }

    const result = await services.UpdateRealizedCheque(realizedCheque);
    if (result.statusCode == "Success" && result.data != null) {

      onUpdateRealizedChequeClose();
      alert.success(result.message);
    }
    else {

      alert.error(result.message);
    }
  }

  return (

    <Modal open={open} onClose={onUpdateRealizedChequeClose} center
      animationDuration={800}>
      <Formik
        initialValues={{
        }}
        validationSchema={
          Yup.object().shape({
          })
        }
        onSubmit={updateRealizedCheque}
        enableReinitialize
      >
        {({
          errors,
          handleBlur,
          handleSubmit,
          isSubmitting,
          touched,
          values,
          props
        }) => (
          <form onSubmit={handleSubmit}>
            <CardHeader title={"Update Realized Cheque"} />
            <Box width={700} height={500} mt={0}>
              <Card>

                <CardContent style={{ marginBottom: "2rem" }}>
                  <Grid container spacing={4}>
                    <Grid item md={3} xs={12}>
                      <InputLabel shrink id="chequeNumber">
                        Cheque Number *
                      </InputLabel>
                      <TextField
                        error={Boolean(touched.brokerCode && errors.brokerCode)}
                        fullWidth
                        helperText={touched.brokerCode && errors.brokerCode}
                        name="chequeNumber"
                        value={realizingChequeModalData.chequeNumber}
                        variant="outlined"
                        disabled={true}
                        size='small'
                      />
                    </Grid>
                    <Grid item md={3} xs={12}>
                      <InputLabel shrink id="voucherCode">
                        Voucher Code *
                      </InputLabel>
                      <TextField
                        error={Boolean(touched.brokerCode && errors.brokerCode)}
                        fullWidth
                        helperText={touched.brokerCode && errors.brokerCode}
                        name="voucherCode"
                        value={realizingChequeModalData.voucherCode}
                        variant="outlined"
                        disabled={true}
                        size='small'
                      />
                    </Grid>
                    <Grid item md={3} xs={12}>
                      <InputLabel shrink id="referenceNumber">
                        Reference Number *
                      </InputLabel>
                      <TextField
                        error={Boolean(touched.brokerCode && errors.brokerCode)}
                        fullWidth
                        helperText={touched.brokerCode && errors.brokerCode}
                        name="referenceNumber"
                        value={realizingChequeModalData.referenceNumber}
                        variant="outlined"
                        disabled={true}
                        size='small'
                      />
                    </Grid>
                    <Grid item md={3} xs={12}>
                      <InputLabel shrink id="amount">
                        Amount *
                      </InputLabel>
                      <TextField
                        error={Boolean(touched.brokerCode && errors.brokerCode)}
                        fullWidth
                        helperText={touched.brokerCode && errors.brokerCode}
                        name="amount"
                        value={realizingChequeModalData.creditAmount > 0 ?
                          realizingChequeModalData.creditAmount : realizingChequeModalData.debitAmount}
                        variant="outlined"
                        disabled={true}
                        size='small'
                      />
                    </Grid>
                  </Grid>
                  <Grid container spacing={3}>
                    <Grid item md={4} xs={12}>
                      <InputLabel shrink id="createdDate">
                        Created Date *
                      </InputLabel>
                      <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <KeyboardDatePicker
                          fullWidth
                          variant="inline"
                          format="dd/MM/yyyy"
                          margin="dense"
                          id="createdDate"
                          value={realizingChequeModalData.createdDate}
                          KeyboardButtonProps={{
                            'aria-label': 'change date',
                          }}
                          autoOk
                          disabled={true}
                        />
                      </MuiPickersUtilsProvider>
                    </Grid>
                    <Grid item md={4} xs={12}>
                      <InputLabel shrink id="dueDate">
                        Due Date *
                      </InputLabel>
                      <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <KeyboardDatePicker
                          fullWidth
                          variant="inline"
                          format="dd/MM/yyyy"
                          margin="dense"
                          id="dueDate"
                          value={realizingChequeModalData.dueDate}
                          KeyboardButtonProps={{
                            'aria-label': 'change date',
                          }}
                          autoOk
                          disabled={true}
                        />
                      </MuiPickersUtilsProvider>
                    </Grid>
                    <Grid item md={4} xs={12}>
                      <InputLabel shrink id="dueDate">
                        Transaction Date *
                      </InputLabel>
                      <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <KeyboardDatePicker
                          fullWidth
                          variant="inline"
                          format="dd/MM/yyyy"
                          margin="dense"
                          id="dueDate"
                          value={realizingChequeModalData.date}
                          KeyboardButtonProps={{
                            'aria-label': 'change date',
                          }}
                          autoOk
                          disabled={true}
                        />
                      </MuiPickersUtilsProvider>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
              <br />
              <Card>
                <CardContent style={{ marginBottom: "2rem" }}>
                  <Grid container spacing={3}>
                    <Grid item md={6} xs={12}>
                      <InputLabel shrink id="realizedDate">
                        Realized Date *
                      </InputLabel>
                      <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <KeyboardDatePicker
                          fullWidth
                          variant="inline"
                          format="dd/MM/yyyy"
                          margin="dense"
                          id="realizedDate"
                          value={selectedDate}
                          minDate={realizingChequeModalData.date}
                          onChange={(e) => {
                            handleDateChange(e)
                          }}
                          KeyboardButtonProps={{
                            'aria-label': 'change date',
                          }}
                          autoOk
                        />
                      </MuiPickersUtilsProvider>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
              <br />
              <Grid item md={12} xs={12} style={{ marginTop: '0.5rem' }} align="center">
                <Box display="flex" justifyContent="flex-end" >
                  <Button
                    color="primary"
                    type="submit"
                    variant="contained"
                    size='small'
                  >
                    Save
                  </Button>
                </Box>
              </Grid>
            </Box>
          </form>
        )}
      </Formik>

    </Modal>
  )
}