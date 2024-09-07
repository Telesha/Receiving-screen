import React from "react";
import moment from 'moment';


export default class ComponentToPrint extends React.Component {

  render() {
    const d = this.props.paySlipDetails;
    const totalDeductions = this.props.totalDeductions;
    const totalEarningEPF = this.props.totalEarningEPF;
    const totalEarnings = this.props.totalEarnings;

    let createdDate = new Date().toString().split('GMT')[0]

    return (
      <div className="record-container" style={{ position: 'relative', backgroundColor: 'white', width: '100%' }}>

        <div style={{ textAlign: 'center', width: '100%' }}>

          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <tr>
              <td style={{ textAlign: "left", borderTop: '1px solid black', fontSize: "12px", width: '70%' }}   > <b>Division :</b> {d.divisionName} </td>
              <td style={{ textAlign: "left", borderTop: '1px solid black', fontSize: "12px" }}   > </td>
            </tr>
            <tr>
              <td style={{ textAlign: "left", fontSize: "12px", lineHeight: '1' }}  > <b>Estate Name :</b> {(d.factoryName)} </td>
              <td style={{ textAlign: "left", fontSize: "12px", lineHeight: '0' }}   > <b>Name :</b> {d.employeeName} </td>
            </tr>
            <tr>
              <td style={{ textAlign: "left", fontSize: "12px" }}   > <b>Group Name :</b> {d.groupName} </td>
              <td style={{ textAlign: "left", fontSize: "12px" }}   > <b>Employee No :</b> {d.employeeCode} </td>
            </tr>
            <tr>
              <td style={{ textAlign: "left", fontSize: "12px" }}   > <b>Month & Year :</b> {moment(d.month).format('MMMM')} / {d.year} </td>
              <td style={{ textAlign: "left", fontSize: "12px" }}   > <b>E.P.F.No :</b> {d.epfNo ? d.epfNo : '-'} </td>
            </tr>
            <tr>
              <td style={{ textAlign: "left", fontSize: "12px" }}   > <b>No. of Days Worked / வேலை செய்த நாட்கள் :............</b> {d.deductionDetails[0].daysWorked} </td>
            </tr>
            <tr>
              <td style={{ textAlign: "left", fontSize: "12px" }}   > <b>Daily Wages / தினசரி ஊதியம் :...........................</b> {d.dailyWages.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </td>
            </tr>
          </table>
          <br />
        </div>
        <div style={{ textAlign: 'center', width: '100%' }}>

          <table style={{ borderCollapse: 'collapse', width: '100%' }}>

            <tbody>
              <tr>
                <td style={{ padding: '8px', borderTop: '1px solid black', fontSize: '12px', lineHeight: '0' }}>Earnings / வருவாய் :</td>
                <td style={{ padding: '8px', borderTop: '1px solid black', fontSize: '12px', textAlign: "right", lineHeight: '0' }}></td>
                <td style={{ padding: '8px', borderTop: '1px solid black', fontSize: '12px', textAlign: "right", lineHeight: '0' }}>{d.earnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontSize: '12px', lineHeight: '0' }}>Holiday Pay / விடுமுறை ஊதியம் :</td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}></td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}>{d.holidayPay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontSize: '12px', lineHeight: '0' }}><b>Total Earning for EPF / ஊழியரின் சேம நிதி (EPF) :</b></td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}></td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}><b>{totalEarningEPF.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b></td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontSize: '12px', lineHeight: '0' }}>Extra Rate / கூடுதல் விகிதம் :</td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}></td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}>{d.extraRate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>

              <tr>
                <td style={{ padding: '8px', fontSize: '12px', lineHeight: '0' }}>Over Killos-Green Leaf/Latex</td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}></td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}>{d.overKillos.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>

              <tr>
                <td style={{ padding: '8px', fontSize: '10px', lineHeight: '0' }}>Over Killo /ஓவர் கிலோஸ்</td>
                <td style={{ marginLeft: "4rem", fontSize: '10px', lineHeight: '0' }} align="left">{d.overKilo.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>

              <tr>
                <td style={{ padding: '8px', fontSize: '12px', lineHeight: '0' }}>Over Time Pay / கூடுதல் நேர ஊதியம் :</td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}></td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}>{d.otPay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontSize: '10px', lineHeight: '0' }}>Day Over Time / நாளுக்கு நாள்</td>
                <td style={{ marginLeft: "4rem", fontSize: '10px', lineHeight: '0' }} align="left">{d.dayOTHrs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>

              <tr>
                <td style={{ padding: '8px', fontSize: '10px', lineHeight: '0' }}>Night Over Time / நேரத்துக்கு மேல் இரவு</td>
                <td style={{ marginLeft: "4rem", fontSize: '10px', lineHeight: '0' }} align="left">{d.nightOTHrs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontSize: '10px', lineHeight: '0' }}>Double Over Time / காலப்போக்கில் இரட்டிப்பு</td>
                <td style={{ marginLeft: "4rem", fontSize: '10px', lineHeight: '0' }} align="left">{d.doubleOTHrs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>

              <tr>
                <td style={{ padding: '8px', fontSize: '12px', lineHeight: '0' }}>Productivity Incentive / உற்பத்தி ஊக்குவிப்பு :</td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}></td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}>{d.productivityIncentive.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontSize: '12px', lineHeight: '0' }}>Cash Day Plucking/ கொழுந்து பறிப்பதுக்கான நாள் ஊதியும் :</td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}></td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}>{d.deductionDetails[0].cashDayPluckingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontSize: '10px', lineHeight: '0' }}>Worked Days / வேலை செய்த நாட்கள்</td>
                <td style={{ marginLeft: "4rem", fontSize: '10px', lineHeight: '0' }} align="left">{d.deductionDetails[0].cashdayPluckingWorkingDays.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontSize: '12px', lineHeight: '0' }}>Cash Plucking/Tapping / கொழுந்து பறிப்பதுக்கான ஊதியும் :</td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}></td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}>{d.cashPlucking.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontSize: '12px', lineHeight: '0' }}>Sundry CashJob Amount / சில்லரை கைக்காசு வேலைக்கான தொகை :</td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}></td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}>{d.deductionDetails[0].sundryCashJobWorkingDays.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontSize: '10px', lineHeight: '0' }}>Worked Days / வேலை செய்த நாட்கள்</td>
                <td style={{ marginLeft: "4rem", fontSize: '10px', lineHeight: '0' }} align="left">{d.dayOTHrs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontSize: '12px', lineHeight: '0' }}>Other Earning / மற்றவைகள் :</td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}></td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}>{d.others.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontSize: '12px', lineHeight: '0' }}>Advance Insensitives / முன்கூட்டிய ஊக்கம் :</td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}></td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}>{d.advanceInsensitives.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontSize: '12px', lineHeight: '0' }}>Previous Unpaid Wages / முன்பு கொடுக்கப்படாத ஊதியம் :</td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}></td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}>{d.previousUnpaidWages.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontSize: '12px', borderBottom: '1px solid black', borderTop: '1px solid black', lineHeight: '0' }}><b>Total Earnings / மொத்த வருவாய் :</b></td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", borderBottom: '1px solid black', borderTop: '1px solid black', lineHeight: '0' }}></td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", borderBottom: '1px solid black', borderTop: '1px solid black', lineHeight: '0' }}><b>{totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b></td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontSize: '12px', lineHeight: '0' }}>E.P.F / ஊழியர் சேமலாப நிதி :</td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}></td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}>{d.epf.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontSize: '12px', lineHeight: '0' }}>Festival Advance / பண்டிகை முற்பணம் (தீபாவளி/கிரிஸதும்ஸ) :</td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}></td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}>{d.deductionDetails[0].festivalAdvance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontSize: '12px', lineHeight: '0' }}>Union Subscription / யூனியன் சந்தா :</td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}></td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}>{d.deductionDetails[0].unionDeductions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontSize: '12px', lineHeight: '0' }}>Religious Activities / மத நடவடிக்கைகள் :</td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}></td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}>{d.deductionDetails[0].religiousActivities.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontSize: '12px', lineHeight: '0' }}>Co-operative / கூட்டுறவு :</td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}></td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}>{d.deductionDetails[0].cooperative.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontSize: '12px', lineHeight: '0' }}>Funeral Fund / மரண கொடுப்பனவு :</td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}></td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}>{d.deductionDetails[0].funeralFund.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontSize: '12px', lineHeight: '0' }}>Wellfare / நலன்புரி கொடுப்பனவு :</td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}></td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}>{d.deductionDetails[0].welfare.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontSize: '12px', lineHeight: '0' }}>Dhoby / வண்ணான் :</td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}></td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}>{d.deductionDetails[0].dhoby.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontSize: '12px', lineHeight: '0' }}>Barber / முடி திருத்துபவர் :</td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}></td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}>{d.deductionDetails[0].barber.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontSize: '12px', lineHeight: '0' }}>Bank Recoveries / வங்கி அறவீடுகள் :</td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}></td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}>{d.deductionDetails[0].bankRecoveries.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontSize: '12px', lineHeight: '0' }}>Insurance Premium / காப்பீட்டு திட்டம் :</td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}></td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}>{d.deductionDetails[0].insuranceRecoveries.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontSize: '12px', lineHeight: '0' }}>Penalty / தண்ட பணம் :</td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}></td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}>{d.deductionDetails[0].penalty.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontSize: '12px', lineHeight: '0' }}>Previous Debts / முந்தைய கடன்கள் :</td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}></td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}>{d.deductionDetails[0].previousDebts.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontSize: '12px', lineHeight: '0' }}>Pay Sheet / ஊதிய தாள் :</td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}></td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}>{d.deductionDetails[0].paySheet.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontSize: '12px', lineHeight: '0' }}>Others / மற்றவைகள் :</td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}></td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}>{d.deductionDetails[0].otherDeductions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontSize: '12px', lineHeight: '0' }}>Water Scheme Recover / குடிநீர் திட்ட அறவீடுகள் :</td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}></td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}>{d.deductionDetails[0].waterSchemeRecoveries.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontSize: '12px', lineHeight: '0' }}>Electricity / மின்சார அறவீடுகள் :</td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}></td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}>{d.deductionDetails[0].electricity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontSize: '12px', lineHeight: '0' }}>Loss of Tools / கருவிகளின் இழப்பு :</td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}></td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}>{d.deductionDetails[0].tools.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontSize: '12px', lineHeight: '0' }}>Crech Fund / சிறுவர் அபிவிருத்தி நிலைய நிதி :</td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}></td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}>{d.deductionDetails[0].creheFund.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontSize: '12px', lineHeight: '0' }}>Recoveries / அறவீடுகள் :</td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}></td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}>{d.deductionDetails[0].recoveries.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontSize: '12px', lineHeight: '0' }}>Tea / தேயிலை தூள் :</td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}></td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}>{d.deductionDetails[0].tea.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontSize: '12px', lineHeight: '0' }}>Debts Recovered / மற்றொருவர் கடன் திரும்பப் பெறப்பட்டது :</td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}></td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}>{d.deductionDetails[0].debtsRecoveredAnother.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontSize: '12px', borderBottom: '1px solid black', borderTop: '1px solid black', lineHeight: '0' }}><b>Total Deductions / மொத்த அறவீடுகள் :</b></td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", borderBottom: '1px solid black', borderTop: '1px solid black', lineHeight: '0' }}></td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", borderBottom: '1px solid black', borderTop: '1px solid black', lineHeight: '0' }}><b>{totalDeductions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b></td>
              </tr>
              {/* Footer */}

              <tr>
                <td style={{ padding: '8px', fontSize: '12px', lineHeight: '0' }}>Part Payment 1 / பகுதி கட்டணம் 1 :</td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}></td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}>{d.monthlyAdvance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontSize: '12px', lineHeight: '0' }}>Part Payment 2 / பகுதி கட்டணம் 2 :</td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}></td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}>{d.deductionDetails[0].foodStuffRecoveries.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontSize: '12px', lineHeight: '0' }}>Made up Amount / சேர்க்கபட்ட தொகை  :</td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}></td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}>{d.madeUpAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontSize: '12px', lineHeight: '0' }}><b>Balance Pay / இறுதி தொகை :</b></td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}></td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}><b>{d.balancePay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b></td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontSize: '12px', lineHeight: '0' }}>EPF Contribution / EPF பங்களிப்பு :</td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}></td>
                <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}>{d.epfContribution.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', borderBottom: '1px solid black', fontSize: '12px', lineHeight: '0' }}>ETF Contribution / ETF பங்களிப்பு :</td>
                <td style={{ padding: '8px', borderBottom: '1px solid black', fontSize: '12px', textAlign: "right", lineHeight: '0' }}></td>
                <td style={{ padding: '8px', borderBottom: '1px solid black', fontSize: '12px', textAlign: "right", lineHeight: '0' }}>{d.etfContribution.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>

            </tbody>
          </table>
        </div>

        <div style={{ fontSize: "10px" }}><b>{createdDate} &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp; ...The solution is provided by Agrithmics (PVT) LTD...</b></div>

      </div>
    );

  }

}
