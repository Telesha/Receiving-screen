import React from "react";
import {
    Box,
    TableBody,
    TableCell,
    TableRow,
    Table,
    Grid,
} from '@material-ui/core';
import moment from 'moment';

export default class ComponentToPrint extends React.Component {
    render() {
        const amalgamationDetails = this.props.amalgamationDetails;
        const selectedSearchValues = this.props.selectedSearchValues;
        const amalgamationData = this.props.amalgamationData;
        const totals = this.props.totals;
        return (
            <div>
                <div>
                    <h1><center><u>Amalgamation Report</u></center></h1>
                    <div>&nbsp;</div>
                    <h3><center>Group - {selectedSearchValues.groupID}</center></h3>
                    <div>&nbsp;</div>
                    <h3><center>Estate - {selectedSearchValues.estateID}</center></h3>
                    <div>&nbsp;</div>
                    <h3><center>Division - {selectedSearchValues.divisionID}</center></h3>
                    <div>&nbsp;</div>
                    <h3><center>Year - {selectedSearchValues.year}    Month - {moment(selectedSearchValues.month).format('MMMM')}</center></h3>
                    <div>&nbsp;</div>
                    <br></br>

                    <div>
                        <Box minWidth={1050}>
                            <Grid style={{ display: "flex" }}>
                                <Grid style={{ flex: 1, width: "800px" }}>
                                    <Table size="small" style={{ width: "800px" }}>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell style={{ border: "0px", fontSize: "15px", width: "25%" }} align="left"> Normal Plucking Days </TableCell>
                                                <TableCell style={{ border: "0px", fontSize: "16px", width: "25%" }} align="right"> {parseFloat(amalgamationData.normalTappingDays)} </TableCell>
                                                <TableCell style={{ border: "0px", fontSize: "15px", width: "25%" }} align="left"> Days </TableCell>
                                                <TableCell style={{ border: "0px", fontSize: "16px", width: "25%" }} align="right"> {parseFloat(amalgamationData.normalTappingDaysAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell style={{ border: "0px", fontSize: "15px", width: "25%" }} align="left"> Normal Sundry Days </TableCell>
                                                <TableCell style={{ border: "0px", fontSize: "16px", width: "25%" }} align="right"> {parseFloat(amalgamationData.normalSundryDays)} </TableCell>
                                                <TableCell style={{ border: "0px", fontSize: "15px", width: "25%" }} align="left"> Days </TableCell>
                                                <TableCell style={{ border: "0px", fontSize: "16px", width: "25%" }} align="right"> {parseFloat(amalgamationData.normalSundryDaysAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell style={{ border: "0px", fontSize: "15px", width: "25%" }} align="left"> Holiday Pay </TableCell>
                                                <TableCell style={{ border: "0px", fontSize: "16px", width: "25%" }} align="right">  </TableCell>
                                                <TableCell style={{ border: "0px", fontSize: "15px", width: "25%" }} align="left">  </TableCell>
                                                <TableCell style={{ border: "0px", fontSize: "16px", width: "25%", borderBottom: "2px solid black" }} align="right"> {parseFloat(amalgamationData.holidayPayAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell colSpan={2} style={{ border: "0px", fontWeight: "bold", fontSize: "16px", width: "25%" }} align="left"> Total For EPF </TableCell>
                                                <TableCell colSpan={2} style={{ border: "0px", fontWeight: "bold", fontSize: "16px", width: "25%" }} align="right"> {parseFloat(totals.totalForEPF).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                            </TableRow>
                                            <br></br>
                                            <TableRow>
                                                <TableCell style={{ border: "0px", fontSize: "15px", width: "25%" }} align="left"> Over Kilos </TableCell>
                                                <TableCell style={{ border: "0px", fontSize: "16px", width: "25%" }} align="right"> {parseFloat(amalgamationData.overKilos).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                <TableCell style={{ border: "0px", fontSize: "15px", width: "25%" }} align="left">  Kg</TableCell>
                                                <TableCell style={{ border: "0px", fontSize: "16px", width: "25%" }} align="right"> {parseFloat(amalgamationData.overKilosAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> PI </TableCell>
                                                <TableCell style={{ border: "0px solid black", fontSize: "16px", width: "25%" }} align="right"> {parseFloat(totals.PIDays)} </TableCell>
                                                <TableCell style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Days </TableCell>
                                                <TableCell style={{ border: "0px solid black", fontSize: "16px", width: "25%" }} align="right"> {parseFloat(totals.PIDaysAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Cash work - Sundry </TableCell>
                                                <TableCell style={{ border: "0px solid black", fontSize: "16px", width: "25%" }} align="right">  {parseFloat(amalgamationData.cashWorkSundryDays)} </TableCell>
                                                <TableCell style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left">  Days </TableCell>
                                                <TableCell style={{ border: "0px solid black", fontSize: "16px", width: "25%" }} align="right"> {parseFloat(amalgamationData.cashSundryAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Contract Plucking </TableCell>
                                                <TableCell style={{ border: "0px solid black", fontSize: "16px", width: "25%" }} align="right"> {parseFloat(amalgamationData.contractPluckingKilos).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                <TableCell style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left">  </TableCell>
                                                <TableCell style={{ border: "0px solid black", fontSize: "16px", width: "25%" }} align="right"> {parseFloat(amalgamationData.contractPluckingAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Cash Day Plucking </TableCell>
                                                <TableCell style={{ border: "0px solid black", fontSize: "16px", width: "25%" }} align="right">  {parseFloat(amalgamationData.cashDayPluckingDays)} </TableCell>
                                                <TableCell style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left">  Days </TableCell>
                                                <TableCell style={{ border: "0px solid black", fontSize: "16px", width: "25%" }} align="right"> {parseFloat(amalgamationData.cashDayPlucking).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Cash Plucking </TableCell>
                                                <TableCell style={{ border: "0px solid black", fontSize: "16px", width: "25%" }} align="right"> {parseFloat(amalgamationData.cashPluckingKilos).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                <TableCell style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left">  Kg</TableCell>
                                                <TableCell style={{ border: "0px solid black", fontSize: "16px", width: "25%" }} align="right"> {parseFloat(amalgamationData.cashPluckingAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Extra Rate </TableCell>
                                                <TableCell style={{ border: "0px solid black", fontSize: "16px", width: "25%" }} align="right">  </TableCell>
                                                <TableCell style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left">  </TableCell>
                                                <TableCell style={{ border: "0px solid black", fontSize: "16px", width: "25%" }} align="right"> {parseFloat(amalgamationData.extraRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Over Time </TableCell>
                                                <TableCell style={{ border: "0px solid black", fontSize: "16px", width: "25%" }} align="right">  </TableCell>
                                                <TableCell style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left">  </TableCell>
                                                <TableCell style={{ border: "0px solid black", fontSize: "16px", width: "25%" }} align="right"> {parseFloat(amalgamationData.overTime).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> BF Coins </TableCell>
                                                <TableCell style={{ border: "0px solid black", fontSize: "16px", width: "25%" }} align="right">  </TableCell>
                                                <TableCell style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left">  </TableCell>
                                                <TableCell style={{ border: "0px solid black", fontSize: "16px", width: "25%" }} align="right"> {parseFloat(amalgamationData.bfCoins).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell style={{ border: "0px", fontSize: "15px", width: "25%" }} align="left"> Other Earnings </TableCell>
                                                <TableCell style={{ border: "0px", fontSize: "16px", width: "25%" }} align="right">  </TableCell>
                                                <TableCell style={{ border: "0px", fontSize: "15px", width: "25%" }} align="left">  </TableCell>
                                                <TableCell style={{ border: "0px", fontSize: "16px", width: "25%", borderBottom: "2px solid black" }} align="right"> {parseFloat(amalgamationData.otherEarnings).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontWeight: "bold", fontSize: "16px", width: "25%" }} align="left"> Total Gross Wages </TableCell>
                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontWeight: "bold", fontSize: "16px", width: "25%" }} align="right"> {parseFloat(totals.totalGrossWages).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell colSpan={4} style={{ border: "0px solid black", fontWeight: "bold", fontSize: "18px", width: "25%" }} align="left"> <u>Deductions</u> </TableCell>
                                            </TableRow>
                                            {amalgamationData.epF10 != 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> 10% EPF </TableCell>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.epF10).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                </TableRow>
                                            ) : null}
                                            {amalgamationData.payCards != 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Pay Cards </TableCell>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.payCards).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                </TableRow>
                                            ) : null}
                                            {amalgamationData.cashAdvance != 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Cash Advance </TableCell>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.cashAdvance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                </TableRow>
                                            ) : null}
                                            {amalgamationData.festivalAdvance != 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Festival Advance </TableCell>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.festivalAdvance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                </TableRow>
                                            ) : null}
                                            {amalgamationData.festivalSaving != 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Festival Saving </TableCell>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.festivalSaving).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                </TableRow>
                                            ) : null}
                                            {amalgamationData.coopMembership != 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Co-op membership </TableCell>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.coopMembership).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                </TableRow>
                                            ) : null}
                                            {amalgamationData.unionCheck != 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Union Check </TableCell>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.unionCheck).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                </TableRow>
                                            ) : null}
                                            {amalgamationData.bankRecoveries != 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Bank Loan </TableCell>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.bankRecoveries).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                </TableRow>
                                            ) : null}
                                            {amalgamationData.templeRecoveries != 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Temple Recoveries </TableCell>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.templeRecoveries).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                </TableRow>
                                            ) : null}
                                            {amalgamationData.insuranceRecoveries != 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Insurance Recoveries </TableCell>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.insuranceRecoveries).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                </TableRow>
                                            ) : null}
                                            {amalgamationData.tea != 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Tea </TableCell>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.tea).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                </TableRow>
                                            ) : null}
                                            {amalgamationData.welfare != 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Welfare </TableCell>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.welfare).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                </TableRow>
                                            ) : null}
                                            {amalgamationData.creheFund != 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Crehe Fund </TableCell>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.creheFund).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                </TableRow>
                                            ) : null}
                                            {amalgamationData.funeralFund != 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Funeral Fund </TableCell>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.funeralFund).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                </TableRow>
                                            ) : null}
                                            {amalgamationData.dhoby != 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Dhoby </TableCell>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.dhoby).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                </TableRow>
                                            ) : null}
                                            {amalgamationData.barber != 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Barber </TableCell>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.barber).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                </TableRow>
                                            ) : null}
                                            {amalgamationData.waterSchemeRecoveries != 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Water Scheme Recoveries </TableCell>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.waterSchemeRecoveries).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                </TableRow>
                                            ) : null}
                                            {amalgamationData.foodStuffRecoveries != 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Food Stuff Recoveries </TableCell>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.foodStuffRecoveries).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                </TableRow>
                                            ) : null}
                                            {amalgamationData.foodPack != 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Food Pack </TableCell>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.foodPack).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                </TableRow>
                                            ) : null}
                                            {amalgamationData.electricity != 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Electricity </TableCell>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.electricity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                </TableRow>
                                            ) : null}
                                            {amalgamationData.coopRecoveries != 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Co-op Recoveries </TableCell>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.coopRecoveries).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                </TableRow>
                                            ) : null}
                                            {amalgamationData.stamp != 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Stamp </TableCell>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.stamp).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                </TableRow>
                                            ) : null}
                                            {amalgamationData.saving != 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Saving </TableCell>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.saving).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                </TableRow>
                                            ) : null}
                                            {amalgamationData.fine != 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Fine </TableCell>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.fine).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                </TableRow>
                                            ) : null}
                                            {amalgamationData.otherDeductions != 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Other Deductions </TableCell>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.otherDeductions).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                </TableRow>
                                            ) : null}
                                            {amalgamationData.transport != 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Transport </TableCell>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.transport).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                </TableRow>
                                            ) : null}
                                            <TableRow>
                                                <TableCell style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> {amalgamationData.tools != 0 ? "Tools" : ""} </TableCell>
                                                <TableCell style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left">  </TableCell>
                                                <TableCell style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left">  </TableCell>
                                                <TableCell style={{ border: "0px solid black", fontSize: "15px", width: "25%", borderBottom: "2px solid black" }} align="right"> {amalgamationData.tools != 0 ? (parseFloat(amalgamationData.tools).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : ""} </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontWeight: "bold", fontSize: "16px", width: "25%" }} align="left"> Total Deductions </TableCell>
                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontWeight: "bold", fontSize: "16px", width: "25%" }} align="right"> {parseFloat(totals.totalDeductions).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </Grid>
                                &nbsp;
                                <Grid style={{ border: "0px solid black", flex: 2, marginLeft: "0px", width: "100px" }}>
                                    <Grid style={{ border: "2px solid black", marginLeft: "0px" }}>
                                        <Table>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontWeight: "bold", fontSize: "16px", width: "50%" }} align="center"> <u>EPF Contribution</u> </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell style={{ border: "0px solid black", fontWeight: "bold", fontSize: "16px", width: "50%" }} align="left"> EPF 10% </TableCell>
                                                    <TableCell style={{ border: "0px solid black", fontWeight: "bold", fontSize: "16px", width: "50%" }} align="right"> {parseFloat(amalgamationData.epF10).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell style={{ border: "0px solid black", fontWeight: "bold", fontSize: "16px", width: "50%" }} align="left"> EPF 12% </TableCell>
                                                    <TableCell style={{ border: "0px solid black", fontWeight: "bold", fontSize: "16px", width: "50%" }} align="right"> {parseFloat(amalgamationData.epF12).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell style={{ border: "0px solid black", fontWeight: "bold", fontSize: "16px", width: "50%" }} align="left"> EPF 22% </TableCell>
                                                    <TableCell style={{ border: "0px solid black", fontWeight: "bold", fontSize: "16px", width: "50%" }} align="right"> {parseFloat(totals.EPF22).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell colSpan={2} style={{ border: "0px solid black", fontWeight: "bold", fontSize: "16px", width: "50%" }} align="center"> <u>ETF Contribution</u> </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell style={{ border: "0px solid black", fontWeight: "bold", fontSize: "16px", width: "50%" }} align="left"> ETF 3% </TableCell>
                                                    <TableCell style={{ border: "0px solid black", fontWeight: "bold", fontSize: "16px", width: "50%" }} align="right"> {parseFloat(amalgamationData.etF3).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </Grid>
                                    <Grid style={{ border: "2px solid black", marginLeft: "0px", marginTop: "150px" }}>
                                        <Table>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell style={{ border: "0px solid black", fontWeight: "bold", fontSize: "16px", width: "50%" }} align="left"> Balance Pay </TableCell>
                                                    <TableCell style={{ border: "0px solid black", fontWeight: "bold", fontSize: "16px", width: "50%" }} align="right"> {parseFloat(totals.balancePay).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}  </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell style={{ border: "0px solid black", fontSize: "16px", width: "50%" }} align="left"> Unpaid Coins </TableCell>
                                                    <TableCell style={{ border: "0px solid black", fontWeight: "bold", fontSize: "16px", width: "50%" }} align="right"> {parseFloat(amalgamationData.unpaidCoins).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell style={{ border: "0px solid black", fontWeight: "bold", fontSize: "16px", width: "50%" }} align="left"> Balance Payment Due</TableCell>
                                                    <TableCell style={{ border: "0px solid black", fontWeight: "bold", fontSize: "16px", width: "50%" }} align="right"> {parseFloat(totals.balancePayDue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Box>
                    </div>
                    <div>&nbsp;</div>
                    {/* <h3><center>***** End of List *****</center></h3> */}
                </div>
            </div>
        );

    }

}