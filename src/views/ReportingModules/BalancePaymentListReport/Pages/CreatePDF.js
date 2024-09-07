import React from "react";
import '../print.css';
import moment from "moment";

export default class ComponentToPrint extends React.Component {
  renderqr(data) {
    const searchData = this.props.searchData;
    let qrdata = (data == undefined || data == null || data.length === 0) ? null : (
      data.map((d, index) => {
        return (
          <div key={index} className="record-container" style={{ position: 'relative' }}>
            <div className="table-responsive row-top-gap">
              <div className="header">
                <div style={{ position: 'absolute', top: 0, right: 0, fontSize: '20px', fontWeight: 'bold' }}>INVOICE</div>
                <div style={{ position: 'absolute', top: 0, left: 0, fontSize: '20px', fontWeight: 'bold' }}>TC 19</div>
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
                <div style={{ textAlign: "left", fontSize: "12px" }} colSpan="5" width="50%" height="70"><b>For the month of :</b> {d.month}</div>
                <div style={{ textAlign: "left", fontSize: "12px" }} colSpan="5" width="50%" height="70"><b>Supplier No :</b> {d.registrationNumber}</div>
                <div style={{ textAlign: "left", fontSize: "12px" }} colSpan="5" width="50%" height="70"><b>Supplier Name :</b> {d.firstName}</div>
              </div>
              <div style={{ textAlign: 'center', width: '100%' }}>
                <table style={{ borderCollapse: 'collapse', width: '100%', border: '1px solid black' }}>
                  <thead>
                    <tr>
                      <th style={{ border: '1px solid black', padding: '8px', fontSize: '12px', fontWeight: 'bold' }}>Date</th>
                      <th style={{ border: '1px solid black', padding: '8px', fontSize: '12px', fontWeight: 'bold' }}>Qty</th>
                      <th style={{ border: '1px solid black', padding: '8px', fontSize: '12px', fontWeight: 'bold' }}>Date</th>
                      <th style={{ border: '1px solid black', padding: '8px', fontSize: '12px', fontWeight: 'bold' }}>Qty</th>
                      <th style={{ border: '1px solid black', padding: '8px', fontSize: '12px', fontWeight: 'bold' }}>Date</th>
                      <th style={{ border: '1px solid black', padding: '8px', fontSize: '12px', fontWeight: 'bold' }}>Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.leafDetails.reduce((rows, transaction, transactionIndex) => {
                      if (transactionIndex % 3 === 0) {
                        rows.push([
                          <td key={transactionIndex * 3} style={{ border: '1px solid black', padding: '8px', fontSize: '12px' }}>
                            {moment(transaction.leafCollectedDate).format("YYYY-MM-DD")}
                          </td>,
                          <td key={transactionIndex * 3 + 1} style={{ border: '1px solid black', borderRight: '1px solid black', padding: '8px', fontSize: '12px', textAlign: "right" }}>
                            {transaction.perDayAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>,
                        ]);
                      } else {
                        rows[rows.length - 1].push(
                          <td key={transactionIndex * 3} style={{ border: '1px solid black', padding: '8px', fontSize: '12px' }}>
                            {moment(transaction.leafCollectedDate).format("YYYY-MM-DD")}
                          </td>,
                          <td key={transactionIndex * 3 + 1} style={{ border: '1px solid black', borderRight: '1px solid black', padding: '8px', fontSize: '12px', textAlign: "right" }}>
                            {transaction.perDayAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>,
                        );
                      }
                      if (d.leafDetails.length === 1 && transactionIndex % 3 === 0) {
                        rows[rows.length - 1].push(
                          <td key="emptyCell" style={{ border: '1px solid black', borderRight: '1px solid black', padding: '8px', fontSize: '12px' }}></td>
                        );
                      }

                      return rows;
                    }, []).map((row, rowIndex) => <tr key={rowIndex}>{row}</tr>)}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td style={{ border: '1px solid black', padding: '8px', fontSize: '12px', fontWeight: 'bold' }}></td>
                      <td style={{ border: '1px solid black', padding: '8px', fontSize: '12px', fontWeight: 'bold' }}></td>
                      <td style={{ border: '1px solid black', padding: '8px', fontSize: '12px', fontWeight: 'bold' }}></td>
                      <td style={{ border: '1px solid black', padding: '8px', fontSize: '12px', fontWeight: 'bold' }}></td>
                      <td style={{ border: '1px solid black', padding: '8px', fontSize: '12px', fontWeight: 'bold' }}></td>
                      <td style={{ border: '1px solid black', padding: '8px', fontSize: '12px', fontWeight: 'bold', textAlign: "right" }}>
                        {d.totalPerDayAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <div style={{ textAlign: 'center', width: '100%' }}>
                <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '8px', fontSize: '12px', fontWeight: 'bold' }}></th>
                      <th style={{ padding: '8px', fontSize: '12px', fontWeight: 'bold', textAlign: "right" }}>Qty</th>
                      <th style={{ padding: '8px', fontSize: '12px', fontWeight: 'bold', textAlign: "right" }}>Rs.</th>
                      <th style={{ padding: '8px', fontSize: '12px', fontWeight: 'bold', textAlign: "right" }}>Value(Rs)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '8px', fontSize: '12px', fontWeight: 'bold', lineHeight: '0.3' }}>Total Qty for the month</td>
                      <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0.3' }}>{d.totalPerDayAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0.3' }}>{d.advanceRate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0.3' }}>{(d.totalPerDayAmount * d.advanceRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px', fontSize: '12px', fontWeight: 'bold', lineHeight: '0.3' }}>ExPay</td>
                      <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0.3' }}>{d.totalPerDayAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0.3' }}>{d.exPayRate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0.3' }}>{(d.totalPerDayAmount * d.exPayRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px', fontSize: '12px', fontWeight: 'bold', lineHeight: '0.3' }}>Addition</td>
                      <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0.3' }}></td>
                      <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0.3' }}></td>
                      <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0.3' }}>{d.totalAddition.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px', fontSize: '12px', fontWeight: 'bold', lineHeight: '0.3' }}>Transport</td>
                      <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0.3' }}>{d.totalPerDayAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0.3' }}>{d.transportRate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0.3' }}>{(d.totalPerDayAmount * d.transportRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px', fontSize: '12px', fontWeight: 'bold', lineHeight: '0.3' }}>Advance</td>
                      <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0.3' }}></td>
                      <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0.3' }}></td>
                      <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0.3' }}>{d.totalAdvanceAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px', fontSize: '12px', fontWeight: 'bold', lineHeight: '0.3' }}>Loan</td>
                      <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0.3' }}></td>
                      <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0.3' }}></td>
                      <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0.3' }}>{d.totalLoanAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px', fontSize: '12px', fontWeight: 'bold', lineHeight: '0.3' }}>Factory Item</td>
                      <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0.3' }}></td>
                      <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0.3' }}></td>
                      <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0.3' }}>{d.totalFactoryItem.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px', fontSize: '12px', fontWeight: 'bold', lineHeight: '0.3' }}>Stamp</td>
                      <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0.3' }}></td>
                      <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0.3' }}></td>
                      <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0.3' }}>{d.totalStamp.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px', fontSize: '12px', fontWeight: 'bold', lineHeight: '0.3' }}>Saving</td>
                      <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0.3' }}></td>
                      <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0.3' }}></td>
                      <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0.3' }}>{d.totalSaving.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px', fontSize: '12px', fontWeight: 'bold', lineHeight: '0.3' }}>Deduction</td>
                      <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0.3' }}></td>
                      <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0.3' }}></td>
                      <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0.3' }}>{d.totalDeduction.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px', fontSize: '12px', fontWeight: 'bold', lineHeight: '0.3' }}>Balance Payment Deduction</td>
                      <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0.3' }}></td>
                      <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0.3' }}></td>
                      <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0.3' }}>{d.totalBalancePaymentDeducduction.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px', fontSize: '12px', fontWeight: 'bold', lineHeight: '0.3' }}>Balance Payment Forward</td>
                      <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0.3' }}></td>
                      <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0.3' }}></td>
                      <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0.3' }}>{d.totalBalancePaymentForward.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px', fontSize: '12px', fontWeight: 'bold', lineHeight: '0.3' }}>Balance Carry Forward</td>
                      <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0.3' }}></td>
                      <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0.3' }}></td>
                      <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0.3' }}>{d.totalBalanceCarryForward.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px', fontSize: '14px', fontWeight: 'bold', lineHeight: '0.3' }}>Balance</td>
                      <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0.3' }}></td>
                      <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0.3' }}></td>
                      <td style={{ padding: '8px', fontSize: '14px', textAlign: "right", lineHeight: '0.3' }}><b>{((d.totalPerDayAmount * d.advanceRate) - (d.totalPerDayAmount * d.transportRate) + (d.totalPerDayAmount * d.exPayRate) - (d.totalAdvanceAmount) - (d.totalLoanAmount) + (d.totalAddition) - (d.totalStamp) - (d.totalSaving) - (d.totalFactoryItem) - (d.totalDeduction) - (d.totalBalancePaymentDeducduction) + (d.totalBalancePaymentForward) - (d.totalBalanceCarryForward)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div style={{ textAlign: 'left', width: '35%', position: 'absolute', top: 920, left: 0 }}>
                <div style={{ textAlign: "center", fontSize: "12px" }} ><b>...................................</b></div>
                <div style={{ textAlign: "center", fontSize: "12px" }} ><b>Signature</b></div>
                <div style={{ textAlign: "center", fontSize: "12px" }} ><b>(Manager {searchData.factoryName})</b></div>
              </div>
            </div>
          </div>
        )
      })
    );

    return (
      <div>
        {qrdata}
      </div>
    );
  }


  render() {
    const renderqr = this.renderqr(this.props.supplierData);
    return (
      <table>
        <tbody>
          {renderqr}
        </tbody>
      </table>
    );
  };
}


















