import React from "react";
import {
    Box,
    TableBody, TableCell, TableContainer, TableHead, TableRow, Table
} from '@material-ui/core';
import CountUp from 'react-countup';


export default class ComponentToPrint extends React.Component {

    render() {
        const searchData = this.props.searchData;
        const reportData = this.props.reportData;
        const totalAmounts = this.props.totalAmounts;

        return (
            <div>
                <div>&nbsp;</div>
                <h3><center><u>Sales Details Report</u></center></h3>
                <div>&nbsp;</div>
                <h4><center>{searchData.groupName} - {searchData.factoryName}</center></h4>
                <h4><center>{searchData.startDate} - {searchData.endDate}</center></h4>
                <h4><center>Selling Mark - {searchData.sellingMarkID === 0 ? "All" : searchData.sellingMark}&nbsp;&nbsp;&nbsp;Broker Name - {searchData.brokerID === undefined ? "All" : searchData.brokerName}</center></h4>
                <h4><center>Type Of Dispatch - {searchData.typeOfDispatch === 0 ? "All" : searchData.typeOfDispatch}&nbsp;&nbsp;&nbsp;Type Of Sale - {searchData.typeOfSale === 0 ? "All" : searchData.typeOfSale} </center></h4>
                <div>&nbsp;</div>
                <div>
                    <Box minWidth={1050}>
                        <TableContainer style={{ marginLeft: '5px' }}>
                            <Table aria-label="caption table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align={'left'}>Date</TableCell>
                                        <TableCell align={'left'}>Lot No</TableCell>
                                        <TableCell align={'left'}>Invoice No</TableCell>
                                        <TableCell align={'left'}>Grade</TableCell>
                                        <TableCell align={'left'}>Bag Wt(Kg)</TableCell>
                                        <TableCell align={'left'}>No of Bags</TableCell>
                                        <TableCell align={'left'}>Net Qty(Kg)</TableCell>
                                        <TableCell align={'left'}>Value Rate(Rs.)</TableCell>
                                        <TableCell align={'left'}>Value Amount(Rs.)</TableCell>
                                        <TableCell align={'left'}>Sale Rate(Rs.)</TableCell>
                                        <TableCell align={'left'}>Sale Amount(Rs.)</TableCell>
                                        <TableCell align={'left'}>Rate +/-(Rs.)</TableCell>
                                        <TableCell align={'left'}>Amount +/-(Rs.)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {reportData.map((data, index) => (
                                        <TableRow key={index}>
                                            <TableCell align={'left'} >
                                                {data.sellingDate}
                                            </TableCell>
                                            <TableCell align={'left'}>
                                                {data.lotNumber}
                                            </TableCell>
                                            <TableCell align={'left'}>
                                                {data.invoiceNo}
                                            </TableCell>
                                            <TableCell align={'left'}>
                                                {data.gradeName}
                                            </TableCell>
                                            <TableCell align={'left'} >
                                                {data.packWeight}
                                            </TableCell>
                                            <TableCell align={'left'} >
                                                {data.noOfPackages}
                                            </TableCell>
                                            <TableCell align={'left'}>
                                                {data.netWeight}
                                            </TableCell>
                                            <TableCell align={'left'}>
                                                <CountUp
                                                    end={data.value.toFixed(2)}
                                                    decimals={2}
                                                    separator=','
                                                    decimal="."
                                                    duration={0.1}
                                                />
                                            </TableCell>
                                            <TableCell align={'left'}>
                                                <CountUp
                                                    end={data.valueAmount.toFixed(2)}
                                                    decimals={2}
                                                    separator=','
                                                    decimal="."
                                                    duration={0.1}
                                                />
                                            </TableCell>
                                            <TableCell align={'left'}>
                                                <CountUp
                                                    end={data.salesRate.toFixed(2)}
                                                    decimals={2}
                                                    separator=','
                                                    decimal="."
                                                    duration={0.1}
                                                />
                                            </TableCell>
                                            <TableCell align={'left'}>
                                                <CountUp
                                                    end={data.salesAmount.toFixed(2)}
                                                    decimals={2}
                                                    separator=','
                                                    decimal="."
                                                    duration={0.1}
                                                />
                                            </TableCell>
                                            <TableCell align={'left'}>
                                                <CountUp
                                                    end={Math.abs(data.rateDiff).toFixed(2)}
                                                    decimals={2}
                                                    separator=","
                                                    decimal="."
                                                    duration={0.1}
                                                    formattingFn={(value) => {
                                                        if (data.rateDiff < 0) {
                                                            return `(${value})`;
                                                        } else {
                                                            return value;
                                                        }
                                                    }}
                                                />

                                            </TableCell>
                                            <TableCell align={'left'}>
                                                <CountUp
                                                    end={Math.abs(data.amountDiff).toFixed(2)}
                                                    decimals={2}
                                                    separator=","
                                                    decimal="."
                                                    duration={0.1}
                                                    formattingFn={(value) => {
                                                        if (data.amountDiff < 0) {
                                                            return `(${value})`;
                                                        } else {
                                                            return value;
                                                        }
                                                    }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableRow style={{ background: '#C1E1C1' }}>
                                    <TableCell align={'left'} colSpan={6} style={{ fontWeight: 'bold' }}
                                    >Total</TableCell>
                                    <TableCell align={'left'} style={{ fontWeight: 'bold' }}>
                                        <CountUp
                                            end={totalAmounts.totalNetQty.toFixed(2)}
                                            decimals={2}
                                            separator=','
                                            decimal="."
                                            duration={0.1}
                                        />
                                    </TableCell>
                                    <TableCell align={'left'} colSpan={2} style={{ fontWeight: 'bold' }}>
                                        <CountUp
                                            end={totalAmounts.totalValueAmount.toFixed(2)}
                                            decimals={2}
                                            separator=','
                                            decimal="."
                                            duration={0.1}
                                        />
                                    </TableCell>
                                    <TableCell align={'left'} style={{ fontWeight: 'bold' }}>
                                        <CountUp
                                            end={totalAmounts.totalSaleAmmount.toFixed(2)}
                                            decimals={2}
                                            separator=','
                                            decimal="."
                                            duration={0.1}
                                        />
                                    </TableCell>
                                    <TableCell align={'left'} colSpan={2} style={{ fontWeight: 'bold' }}>
                                        <CountUp
                                            end={totalAmounts.ammountDiff.toFixed(2)}
                                            decimals={2}
                                            separator=","
                                            decimal="."
                                            duration={0.1}
                                            formattingFn={(value) => {
                                                if (totalAmounts.ammountDiff < 0) {
                                                    return `(${value})`;
                                                } else {
                                                    return value;
                                                }
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align={'left'} style={{ fontWeight: 'bold' }}>
                                    </TableCell>
                                    <TableCell align={'left'} style={{ fontWeight: 'bold' }}>
                                    </TableCell>
                                </TableRow>
                            </Table>
                        </TableContainer>
                    </Box>
                </div>
            </div>
        );
    }
}
