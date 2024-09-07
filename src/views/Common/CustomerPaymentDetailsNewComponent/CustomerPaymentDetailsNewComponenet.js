import React from 'react'
import {
    makeStyles,
    Grid,
    TextField,
    InputLabel,
} from '@material-ui/core';
import CountUp from 'react-countup';
import { useAlert } from "react-alert";
import { LeftCardComponent } from './Components/LeftCard';
import { RightCardComponent } from './Components/RightCard';

const useStyles = makeStyles((theme) => ({
    cardContent: {
        padding: 0
    },
    tableContainer: {
        maxHeight: 160
    },
}));

export const CustomerPaymentDetailsNewComponent = ({
    cropDetails,
    customerBalancePaymentAmount,
    previouseAvailableBalance,
    currentCropDetails,
    currentAvailableBalance,
    isBalancePaymetDone,
    setCropDetails,
    setCurrentCropDetails,
    permissionList,
    TotalBalance,
    RunningBalance,
    PreviousMonthBalanceBroughtForwardAmount,
    PreviousMonthBalanceCarriedForwardAmount,
    BalanceCarriedForwardAmount,
    PreviousMonthDeductionDetailsList,
    CurrentMonthDeductionDetailsList
}) => {
    const classes = useStyles();
    const alert = useAlert();

    function settingCollectionType(data) {
        return data.collectionTypeName;
    }

    function changeReadOnly() {
        if (permissionList.isFactoryItemChangeEnabled || permissionList.isAdvanceRateChangeEnabled) {
            return false;
        }
        else if (!permissionList.isFactoryItemChangeEnabled && !permissionList.isAdvanceRateChangeEnabled) {
            return true;
        }
        else {
            return true;
        }
    }

    function amountChange() {
        if (permissionList.isMonthlyBalanceChangeEnabled || permissionList.isFactoryItemChangeEnabled) {
            return false;
        }
        else if (!permissionList.isMonthlyBalanceChangeEnabled && !permissionList.isFactoryItemChangeEnabled) {
            return true;
        }
        else {
            return true;
        }
    }

    function settingGrossPay(data) {
        if (isBalancePaymetDone) {
            return isNaN(parseFloat(data.totalCrop) * parseFloat(data.rate)) ? 0 : parseFloat(data.totalCrop) * parseFloat(data.rate);
        } else {
            return isNaN(parseFloat(data.totalCrop) * parseFloat(data.minRate)) ? 0 : parseFloat(data.totalCrop) * parseFloat(data.minRate);
        }
    }

    function settingCurrentGrossPay(data) {
        return isNaN(parseFloat(data.totalCrop) * parseFloat(data.minRate)) ? 0 : parseFloat(data.totalCrop) * parseFloat(data.minRate);
    }

    function handleChangeRates(collectionTypeID, rateType, e) {
        const target = e.target;
        const value = target.value
        const newArr = [...cropDetails];
        var idx = newArr.findIndex(x => x.collectionTypeID == parseInt(collectionTypeID));
        if (rateType === 'minRate') {
            if (newArr[idx].maxRate < value) {
                alert.error("Entered advance rate is greater than max rate");
            }
            else {
                newArr[idx] = { ...newArr[idx], minRate: value };
            }
        }
        else if (rateType === 'maxRate') {
            newArr[idx] = { ...newArr[idx], maxRate: value };
        }
        else if (rateType === 'rate') {
            newArr[idx] = { ...newArr[idx], rate: value };
        }
        setCropDetails(newArr);
    }

    function handleChangeRates1(collectionTypeID, rateType, e) {
        const target = e.target;
        const value = target.value
        const newArr = [...currentCropDetails];
        var idx = newArr.findIndex(x => x.collectionTypeID == parseInt(collectionTypeID));

        if (rateType === 'minRate') {
            if (newArr[idx].maxRate < value) {
                alert.error("Entered advance rate is greater than max rate");
            }
            else {
                newArr[idx] = { ...newArr[idx], minRate: value };
            }
        } else if (rateType === 'maxRate') {
            newArr[idx] = { ...newArr[idx], maxRate: value };
        }
        setCurrentCropDetails(newArr);
    }

    function SettingBalanceRate(data) {
        return (
            <TextField
                name="rate"
                onChange={(e) => handleChangeRates(data.collectionTypeID, "rate", e)}
                value={data.rate}
                variant="outlined"
                id="rate"
                size="small"
                style={{ width: 60, }}
                InputProps={{ readOnly: true }}
            >
            </TextField>);
    }

    function SettingsCurrentRate(data) {
        return (
            <TextField
                name="minRate"
                onChange={(e) => handleChangeRates1(data.collectionTypeID, "minRate", e)}
                value={data.minRate}
                variant="outlined"
                id="minRate"
                size="small"
                style={{ width: 60, }}
                InputProps={{ readOnly: changeReadOnly }}
            >
            </TextField>
        );
    }
    
    function SettingsRate(data) {
        return (
            <TextField
                name="minRate"
                onChange={(e) => handleChangeRates(data.collectionTypeID, "minRate", e)}
                value={data.minRate}
                variant="outlined"
                id="minRate"
                size="small"
                InputProps={{ readOnly: changeReadOnly }}
                style={{ width: 60, }}
            >
            </TextField>
        );
    }

    return (
        <>
            {
                cropDetails.length > 0 || CurrentMonthDeductionDetailsList.length > 0 || PreviousMonthDeductionDetailsList.length > 0 ?
                    <>
                        <Grid container spacing={3}>
                            <Grid item md={6} xs={12}>
                                <LeftCardComponent
                                    cropDetails={cropDetails}
                                    isBalancePaymetDone={isBalancePaymetDone}
                                    settingCollectionType={settingCollectionType}
                                    SettingsRate={SettingsRate}
                                    SettingBalanceRate={SettingBalanceRate}
                                    settingGrossPay={settingGrossPay}
                                    customerBalancePaymentAmount={customerBalancePaymentAmount}
                                    previouseAvailableBalance={previouseAvailableBalance}
                                    previousMonthDeductionList={PreviousMonthDeductionDetailsList}
                                    PreviousMonthBalanceCarriedForwardAmount={PreviousMonthBalanceCarriedForwardAmount}
                                    PreviousMonthBalanceBroughtForwardAmount={PreviousMonthBalanceBroughtForwardAmount}
                                />
                            </Grid>
                            <Grid item md={6} xs={12}>
                                <RightCardComponent
                                    currentCropDetails={currentCropDetails}
                                    settingCollectionType={settingCollectionType}
                                    SettingsCurrentRate={SettingsCurrentRate}
                                    settingCurrentGrossPay={settingCurrentGrossPay}
                                    currentAvailableBalance={currentAvailableBalance}
                                    currentMonthDeductionList={CurrentMonthDeductionDetailsList}
                                    BalanceCarriedForwardAmount={BalanceCarriedForwardAmount}
                                />
                            </Grid>
                        </Grid>

                        <Grid container spacing={3}>
                            {permissionList.isViewTotalAmount ?
                                <Grid item md={3} xs={12}>
                                    <InputLabel style={{ marginTop: '0.5rem', fontSize: '1.3rem', fontWeight: 'bold' }}> Total Balance</InputLabel>
                                </Grid>
                                : null}
                            {permissionList.isViewTotalAmount ?
                                <Grid item md={3} xs={12}>
                                    <InputLabel style={{ marginTop: '0.5rem', fontSize: '1.3rem', fontWeight: 'bold' }}>
                                        <CountUp decimals={2} separator=',' end={TotalBalance} duration={1} />
                                    </InputLabel>
                                </Grid>
                                : null}
                            {permissionList.isViewAvailableAmount ?
                                <Grid item md={3} xs={12}>
                                    <InputLabel style={{ marginTop: '0.5rem', fontSize: '1.3rem', fontWeight: 'bold' }}>Available Balance</InputLabel>
                                </Grid>
                                : null}
                            {permissionList.isViewAvailableAmount ?
                                <Grid item md={3} xs={12}>
                                    <InputLabel style={{ marginTop: '0.5rem', fontSize: '1.3rem', fontWeight: 'bold' }}>
                                        <CountUp decimals={2} separator=',' end={RunningBalance} duration={1} />
                                    </InputLabel>
                                </Grid>
                                : null}
                        </Grid>
                    </>
                    : null
            }
        </>
    )

}