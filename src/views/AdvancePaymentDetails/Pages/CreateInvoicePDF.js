import React from "react";
import '../print.css';
import moment from 'moment';


export default class ComponentToPrint extends React.Component {

  render() {
    const advancePaymentData = this.props.advancePaymentData;
    const searchData = this.props.searchData;
    const otherData = this.props.otherData;
    const leafData = this.props.leafData;

    return (
      <div style={{ position: 'relative', height: '100%' }}>
        <div>
          <div className="header">
            <div style={{ position: 'absolute', top: 0, right: 0, fontSize: '20px', fontWeight: 'bold' }}>ADVANCE</div>
          </div>
          <br />
          <div style={{ textAlign: 'center', width: '100%' }}>
            <div style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold', marginTop: '20px', width: '100%' }}>{searchData.groupName} (Pvt) Ltd</div>
            <div style={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold', width: '100%' }}>{searchData.factoryName} - {searchData.factoryCode}</div>
            <div style={{ textAlign: 'center', fontSize: '16px', width: '100%' }}>{searchData.address1 == null ? '' : searchData.address1}{searchData.address2 == null ? '' : ', ' + searchData.address2}{searchData.address3 == null ? '' : ', ' + searchData.address3}</div>
            <div style={{ textAlign: 'center', fontSize: '16px', width: '100%' }}>Contact: {searchData.contactNumber} &nbsp; Email: {searchData.email}</div>
          </div>
          <br />
          <div style={{ textAlign: 'center', width: '100%' }}>
            <table style={{ width: '100%' }}>
              <tr>
                <td><div style={{ textAlign: "left", fontSize: "13px" }} width="50%" height="70">Issuing Date : {moment(advancePaymentData[0].issuingDate).format("YYYY-MM-DD")}</div></td>
                <td><div style={{ textAlign: "left", fontSize: "13px" }} width="50%" height="70">Created Date : {moment(advancePaymentData[0].createdDate).format("YYYY-MM-DD")}</div></td>
              </tr>
              <tr>
                <td><div style={{ textAlign: "left", fontSize: "13px" }} width="50%" height="70">Registration No : {advancePaymentData[0].registrationNumber}</div></td>
                <td><div style={{ textAlign: "left", fontSize: "13px" }} width="50%" height="70">Customer Name : {advancePaymentData[0].customerName}</div></td>
              </tr>
              <br></br>
              <tr>
                <td><div style={{ textAlign: "left", fontSize: "15px", marginLeft: 'auto' }} width="50%" height="70">Advance amount : <b>{parseFloat(advancePaymentData[0].approvedAmount).toFixed(2)}</b></div></td>
              </tr>
            </table>
          </div>
          <br />
          <div style={{ textAlign: 'center', width: '100%' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', border: '2px solid black' }}>
              <thead>
                <tr>
                  <th style={{ border: '2px solid black', padding: '4px', fontSize: '13px', fontWeight: 'bold' }}>Date</th>
                  <th style={{ border: '2px solid black', padding: '4px', fontSize: '13px', fontWeight: 'bold' }}>Qty</th>
                  <th style={{ border: '2px solid black', padding: '4px', fontSize: '13px', fontWeight: 'bold' }}>Date</th>
                  <th style={{ border: '2px solid black', padding: '4px', fontSize: '13px', fontWeight: 'bold' }}>Qty</th>
                </tr>
              </thead>
              <tbody>
                {leafData.reduce((rows, transaction, transactionIndex) => {
                  if (transactionIndex % 2 === 0) {
                    rows.push([
                      <td key={transactionIndex * 2} style={{ border: '2px solid black', padding: '4px', fontSize: '13px' }}>
                        {moment(transaction.leafCollectedDate).format("YYYY-MM-DD")}
                      </td>,
                      <td key={transactionIndex * 2 + 1} style={{ border: '2px solid black', borderRight: '1px solid black', padding: '4px', fontSize: '13px', textAlign: "right" }}>
                        {transaction.perDayAmount.toFixed(2)}
                      </td>,
                    ]);
                  } else {
                    rows[rows.length - 1].push(
                      <td key={transactionIndex * 2} style={{ border: '2px solid black', padding: '4px', fontSize: '13px' }}>
                        {moment(transaction.leafCollectedDate).format("YYYY-MM-DD")}
                      </td>,
                      <td key={transactionIndex * 2 + 1} style={{ border: '2px solid black', borderRight: '1px solid black', padding: '4px', fontSize: '13px', textAlign: "right" }}>
                        {transaction.perDayAmount.toFixed(2)}
                      </td>,
                    );
                  }
                  if (leafData.length === 1 && transactionIndex % 2 === 0) {
                    rows[rows.length - 1].push(
                      <td key="emptyCell" style={{ border: '2px solid black', borderRight: '1px solid black', padding: '4px', fontSize: '13px' }}></td>
                    );
                  }

                  return rows;
                }, []).map((row, rowIndex) => <tr key={rowIndex}>{row}</tr>)}
              </tbody>
              <tfoot>
                <tr>
                  <td style={{ border: '2px solid black', padding: '4px', fontSize: '13px', fontWeight: 'bold' }}></td>
                  <td style={{ border: '2px solid black', padding: '4px', fontSize: '13px', fontWeight: 'bold' }}></td>
                  <td style={{ border: '2px solid black', padding: '4px', fontSize: '13px', fontWeight: 'bold' }}></td>
                  <td style={{ border: '2px solid black', padding: '4px', fontSize: '13px', fontWeight: 'bold', textAlign: "right" }}>
                    {parseFloat(otherData.totalPerDayAmount).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <br />
          <br />
          <div style={{ textAlign: 'center', width: '100%' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '8px', fontSize: '13px', lineHeight: '0.3' }}>Total Qty for the period</td>
                  <td style={{ padding: '8px', fontSize: '13px', textAlign: "right", lineHeight: '0.3' }}>{parseFloat(otherData.totalPerDayAmount).toFixed(2)}</td>
                  <td style={{ padding: '8px', fontSize: '13px', textAlign: "right", lineHeight: '0.3' }}>{parseFloat(otherData.advanceRate).toFixed(2)}</td>
                  <td style={{ padding: '8px', fontSize: '13px', textAlign: "right", lineHeight: '0.3' }}>{parseFloat((otherData.totalPerDayAmount) * (otherData.advanceRate)).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', fontSize: '13px', lineHeight: '0.3' }}>Transport</td>
                  <td style={{ padding: '8px', fontSize: '13px', textAlign: "right", lineHeight: '0.3' }}>{parseFloat(otherData.totalPerDayAmount).toFixed(2)}</td>
                  <td style={{ padding: '8px', fontSize: '13px', textAlign: "right", lineHeight: '0.3' }}>{parseFloat(otherData.transportRate).toFixed(2)}</td>
                  <td style={{ padding: '8px', fontSize: '13px', textAlign: "right", lineHeight: '0.3' }}>{parseFloat((otherData.totalPerDayAmount) * (otherData.transportRate)).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', fontSize: '13px', lineHeight: '0.3' }}>Total advance</td>
                  <td style={{ padding: '8px', fontSize: '13px', lineHeight: '0.3' }}></td>
                  <td style={{ padding: '8px', fontSize: '13px', lineHeight: '0.3' }}></td>
                  <td style={{ padding: '8px', fontSize: '13px', textAlign: "right", lineHeight: '0.3' }}>{parseFloat(otherData.advance).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', fontSize: '13px', lineHeight: '0.3' }}>Loan</td>
                  <td style={{ padding: '8px', fontSize: '13px', lineHeight: '0.3' }}></td>
                  <td style={{ padding: '8px', fontSize: '13px', lineHeight: '0.3' }}></td>
                  <td style={{ padding: '8px', fontSize: '13px', textAlign: "right", lineHeight: '0.3' }}>{parseFloat(otherData.loans).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', fontSize: '13px', lineHeight: '0.3' }}>Addition</td>
                  <td style={{ padding: '8px', fontSize: '13px', lineHeight: '0.3' }}></td>
                  <td style={{ padding: '8px', fontSize: '13px', lineHeight: '0.3' }}></td>
                  <td style={{ padding: '8px', fontSize: '13px', textAlign: "right", lineHeight: '0.3' }}>{parseFloat(otherData.additions).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', fontSize: '13px', lineHeight: '0.3' }}>Deduction</td>
                  <td style={{ padding: '8px', fontSize: '13px', lineHeight: '0.3' }}></td>
                  <td style={{ padding: '8px', fontSize: '13px', lineHeight: '0.3' }}></td>
                  <td style={{ padding: '8px', fontSize: '13px', textAlign: "right", lineHeight: '0.3' }}>{parseFloat(otherData.dductions).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', fontSize: '13px', fontWeight: 'bold', lineHeight: '0.3' }}>Balance</td>
                  <td style={{ padding: '8px', fontSize: '13px', lineHeight: '0.3' }}></td>
                  <td style={{ padding: '8px', fontSize: '13px', lineHeight: '0.3' }}></td>
                  <td style={{ padding: '8px', fontSize: '13px', fontWeight: 'bold', textAlign: "right", lineHeight: '0.3' }}>{parseFloat(((otherData.totalPerDayAmount) * (otherData.advanceRate)) + (otherData.additions) - ((otherData.totalPerDayAmount) * (otherData.transportRate)) - (otherData.advance) - (otherData.loans) - (otherData.dductions)).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style={{ textAlign: 'left', width: '30%', position: 'absolute', bottom: 20, marginLeft: 0 }}>
            <div style={{ textAlign: "center", fontSize: "13px" }} ><b>..............................</b></div>
            <div style={{ textAlign: "center", fontSize: "13px" }} ><b>Authorized By</b></div>
            <div style={{ textAlign: "center", fontSize: "13px" }} ><b>{advancePaymentData[0].userName}</b></div>
          </div>
          <div style={{ textAlign: 'left', width: '35%', position: 'absolute', bottom: 20, right: 0 }}>
            <div style={{ textAlign: "center", fontSize: "13px" }} ><b>..............................</b></div>
            <div style={{ textAlign: "center", fontSize: "13px" }} ><b>Approved By</b></div>
            <div style={{ textAlign: "center", fontSize: "13px" }} ><b>Manager</b></div>
          </div>
          {/* </div> */}
        </div>
      </div>
    );

  }

}
