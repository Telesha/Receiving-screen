import React from "react";
import {
  TableBody, TableCell, TableHead, TableRow, Table
} from '@material-ui/core';
import moment from 'moment';
import Paper from '@material-ui/core/Paper';


export default class ComponentToPrint extends React.Component {

  render() {
    const factoryData = this.props.factoryData;
    const voucherData = this.props.voucherData;

    return (
      <Paper elevation={0} style={{ width: '100%', height: '100%' }}>
        <div style={{ fontFamily: 'sans-serif', height: '100%', position: 'relative' }}>
          <div>
            <div style={{ width: '100%', display: 'flex' }}>
              <div style={{ fontSize: "14px", width: '60%' }}>
                <p style={{ textAlign: 'left', paddingBottom: '3px', fontSize: '16px' }}>{factoryData.factoryName}</p>
                <p style={{ textAlign: 'left', paddingBottom: '3px' }}>{factoryData.address1 + ", " + factoryData.address2 + ". " + "  Phone:" + factoryData.contactNumber}</p>
              </div>
              <div style={{ fontSize: "14px", width: '40%' }}>
                <p style={{ textAlign: 'right', paddingBottom: '3px', fontSize: '11px' }}>CASH PAYMENT VOUCHER</p>
                <p style={{ textAlign: 'right', paddingBottom: '3px', fontSize: '11px' }}>VOUCHER NO : {(voucherData.voucherDetails).length == 0 ? "" : voucherData.voucherDetails[0].referenceNumber}</p>
                <p style={{ textAlign: 'right', paddingBottom: '3px', fontSize: '11px' }}>{moment(voucherData.issuingDate).format('DD/MMMM/YYYY')}</p>
                <p style={{ textAlign: 'right', paddingBottom: '3px', fontSize: '11px' }}>CHEQE NO : </p>
              </div>
            </div>
            <div style={{ width: '100%', display: 'flex' }}>
              <p style={{ width: '100%', display: 'flex', fontSize: '12px' }}>Payable to : <p style={{ textAlign: 'right', paddingBottom: '3px', fontSize: '12px' }}>{voucherData.customerName + "(" + voucherData.registrationNumber + ")"}</p></p>
            </div>
            <div style={{ width: '100%', display: 'flex' }}>
              <p style={{ width: '100%', display: 'flex', fontSize: '12px' }}>Address : <p style={{ textAlign: 'right', paddingBottom: '3px', fontSize: '12px' }}>{voucherData.adress}</p></p>
            </div>
            <div style={{ width: '100%', display: 'flex' }}>
              <p style={{ width: '100%', display: 'flex', fontSize: '12px' }}>Description :
                <p style={{ textAlign: 'right', paddingBottom: '3px', fontSize: '13px' }}>
                  {("B/L ADVANCE_") + (voucherData.yearMonth.length != 0 ? (" " + moment(voucherData.yearMonth[0].applicableMonth).format('MMMM')) : "") + (voucherData.yearMonth.length != 0 ? (voucherData.yearMonth.length == 2 ? ("/" + (moment(voucherData.yearMonth[1].applicableMonth).format('MMMM'))) : "") : "")}
                </p>
              </p>
            </div>
            &nbsp;
            <div style={{ width: '100%', display: 'flex' }}>
              <Table style={{ width: '100%' }}>
                <TableHead>
                  <TableRow>
                    <TableCell align={'left'} style={{ border: "1px solid black", padding: "2px", fontSize: "10px", }}>Ac Code</TableCell>
                    <TableCell align={'left'} style={{ border: "1px solid black", padding: "2px", fontSize: "10px", }}>Account</TableCell>
                    <TableCell align={'left'} style={{ border: "1px solid black", padding: "2px", fontSize: "10px", }}>Description</TableCell>
                    <TableCell align={'right'} style={{ border: "1px solid black", padding: "2px", fontSize: "10px", }}>Debit</TableCell>
                    <TableCell align={'right'} style={{ border: "1px solid black", padding: "2px", fontSize: "10px" }}>Credit</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {voucherData.voucherDetails.map((data, index) => (
                    <TableRow key={index}>
                      <TableCell align={'left'} scope="row" style={{ borderBottom: "none", borderLeft: '1px solid black', fontSize: '10px', padding: "2px" }}>
                        {data.ledgerAccountCode}
                      </TableCell>
                      <TableCell align={'left'} scope="row" style={{ borderBottom: "none", borderLeft: '1px solid black', fontSize: '10px', padding: "2px" }}>
                        {data.accountName}
                      </TableCell>
                      <TableCell align={'left'} scope="row" style={{ borderBottom: "none", borderLeft: '1px solid black', fontSize: '10px', padding: "2px" }}>
                        {data.description}
                      </TableCell>
                      <TableCell align={'right'} scope="row" style={{ borderBottom: "none", borderLeft: '1px solid black', fontSize: '10px', padding: "2px" }}>
                        {data.debit != 0 ? data.debit.toFixed(2) : ''}
                      </TableCell>
                      <TableCell align={'right'} scope="row" style={{ borderBottom: "none", borderLeft: '1px solid black', borderRight: '1px solid black', fontSize: '10px', padding: "2px" }}>
                        {data.credit != 0 ? data.credit.toFixed(2) : ''}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableBody>
                  <TableRow>
                    <TableCell style={{ fontSize: "12px", padding: "2px", borderTop: '1px solid black', borderBottom: 'none' }}></TableCell>
                    <TableCell style={{ fontSize: "12px", padding: "2px", borderTop: '1px solid black', borderBottom: 'none' }}></TableCell>
                    <TableCell style={{ fontSize: "12px", padding: "2px", borderTop: '1px solid black', borderBottom: 'none' }}></TableCell>
                    <TableCell align={'right'} scope="row" style={{ border: "1px solid black", fontSize: "10px", padding: "2px" }}>
                      {voucherData.totalDebit == undefined ? "" : (voucherData.totalDebit).toFixed(2)}
                    </TableCell>
                    <TableCell align={'right'} scope="row" style={{ border: "1px solid black", fontSize: "10px", padding: "2px" }}>
                      {voucherData.totalCredit == undefined ? "" : (voucherData.totalCredit).toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <br></br>
            <br></br>
            <br></br>
            <br></br>
            <div style={{ width: '100%', display: 'flex', position: "absolute" }}>
              <div style={{ width: '20%' }}>
                <p style={{ width: '100%', textAlign: 'left', fontSize: '12px' }}>Prepared By</p>
              </div>
              <div style={{ width: '20%' }}>
                <p style={{ width: '100%', textAlign: 'center', fontSize: '12px' }}>Checked By</p>
              </div>
              <div style={{ width: '20%' }}>
                <p style={{ width: '100%', textAlign: 'center', fontSize: '12px' }}>Approved By</p>
              </div>
              <div style={{ width: '20%' }}>
                <p style={{ width: '100%', textAlign: 'center', fontSize: '12px' }}>{moment(new Date()).format('DD/MMMM/YYYY  hh:mm a ')}</p>
              </div>
              <div style={{ width: '20%' }}>
                <p style={{ width: '100%', textAlign: 'right', fontSize: '12px' }}>Received By</p>
              </div>
            </div>
          </div>
        </div>
      </Paper>
    );
  }
}
