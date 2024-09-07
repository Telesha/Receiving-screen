import React from 'react';
import { Grid } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import CountUp from 'react-countup';
export default class ComponentToPrint extends React.Component {
  render() {
    const profitAndLossData = this.props.profitAndLossData;
    const ParentSectionDetails = this.props.ParentSectionDetails;
    const GrossProfit = this.props.GrossProfit;
    const LossFromOperatingActivitiesAmount = this.props
      .LossFromOperatingActivitiesAmount;
    const NewProfitForThePeriodAmount = this.props.NewProfitForThePeriodAmount;

    function RenderRevenueSection(obj) {
      return (
        <div>
          <div>&nbsp; &nbsp; &nbsp;</div>
          <div>
            <h3>
              <center>
                <u>Profit & Loss Report</u>
              </center>
            </h3>
          </div>
          <div>&nbsp;</div>
          <h4>
            <center>
              Group: {profitAndLossData.groupName} || Estate:{' '}
              {profitAndLossData.factoryName}
            </center>
          </h4>
          <div>&nbsp;</div>
          <h4>
            <center>
              To : {profitAndLossData.selectedYear} -{' '}
              {profitAndLossData.selectedMonth} -{' '}
              {profitAndLossData.selectedDateReport}
            </center>
          </h4>
          <div>&nbsp;</div>
          <div>&nbsp;</div>
          <Grid item xs={9}>
            <Typography
              variant="h5"
              style={{ marginLeft: '5rem' }}
              align="left"
            >
              {obj.parentName}
            </Typography>
            {obj.dataList !== undefined
              ? obj['dataList'].map(objNew => (
                  <Grid Grid container spacing={1}>
                    <Typography
                      variant="h5"
                      style={{ marginLeft: '10rem' }}
                      align="left"
                    >
                      {obj['dataList'].length > 1 ? objNew.childName : ''}
                    </Typography>
                    {objNew.dataList !== undefined
                      ? objNew.dataList.map(object => (
                          <Grid Grid container spacing={1}>
                            <Grid item xs={9}>
                              <Typography
                                style={{ marginLeft: '15rem' }}
                                align="left"
                              >
                                {object.ledgerAccountName}
                              </Typography>
                            </Grid>
                            <Grid item xs={3}>
                              <Typography align="right">
                                
                                <CountUp
                                end={object.actualAmount.toFixed(2)}
                                separator=","
                                decimals={2}
                                decimal="."
                                duration={0.1}/>
                              </Typography>
                            </Grid>
                          </Grid>
                        ))
                      : null}
                  </Grid>
                ))
              : null}
          </Grid>
        </div>
      );
    }

    function RenderCostOfRevenueSection(obj) {
      return (
        <Grid item xs={9}>
          <Typography variant="h5" style={{ marginLeft: '5rem' }} align="left">
            {obj.parentName}
          </Typography>
          <br />
          {obj.dataList !== undefined
            ? obj['dataList'].map(objNew => (
                <Grid Grid container spacing={1}>
                  <Typography
                    variant="h5"
                    style={{ marginLeft: '10rem' }}
                    align="left"
                  >
                    {obj['dataList'].length > 1 ? objNew.childName : ''}
                  </Typography>
                  {objNew.dataList !== undefined
                    ? objNew.dataList.map(object => (
                        <Grid Grid container spacing={1}>
                          <Grid item xs={9}>
                            <Typography
                              style={{ marginLeft: '15rem' }}
                              align="left"
                            >
                              {object.ledgerAccountName}
                            </Typography>
                          </Grid>
                          <Grid item xs={3}>
                            <Typography align="right">
                              <CountUp
                              end={object.actualAmount.toFixed(2)}
                              separator=","
                              decimals={2}
                              decimal="."
                              duration={0.1}/>
                            </Typography>
                          </Grid>
                        </Grid>
                      ))
                    : null}
                </Grid>
              ))
            : null}
        </Grid>
      );
    }

    function RenderOtherIncomeSection(obj) {
      // setOtherIncomeAmount(parseFloat(obj.totalAmount));

      return (
        <Grid item xs={9}>
          <Typography variant="h5" style={{ marginLeft: '5rem' }} align="left">
            {obj.parentName}
          </Typography>
          <br />
          {obj.dataList !== undefined
            ? obj['dataList'].map(objNew => (
                <Grid Grid container spacing={1}>
                  <Typography
                    variant="h5"
                    style={{ marginLeft: '10rem' }}
                    align="left"
                  >
                    {obj['dataList'].length > 1 ? objNew.childName : ''}
                  </Typography>
                  {objNew.dataList !== undefined
                    ? objNew.dataList.map(object => (
                        <Grid Grid container spacing={1}>
                          <Grid item xs={9}>
                            <Typography
                              style={{ marginLeft: '15rem' }}
                              align="left"
                            >
                              {object.ledgerAccountName}
                            </Typography>
                          </Grid>
                          <Grid item xs={3}>
                            <Typography align="right">
                              <CountUp
                                end={object.actualAmount.toFixed(2)}
                                separator=","
                                decimals={2}
                                decimal="."
                                duration={0.1}
                              />
                            </Typography>
                          </Grid>
                        </Grid>
                      ))
                    : null}
                </Grid>
              ))
            : null}
        </Grid>
      );
    }

    function RenderSellingAndMarketingExpensesSection(obj) {
      return (
        <Grid item xs={9}>
          <Typography variant="h5" style={{ marginLeft: '5rem' }} align="left">
            {obj.parentName}
          </Typography>
          <br />
          {obj.dataList !== undefined
            ? obj['dataList'].map(objNew => (
                <Grid Grid container spacing={1}>
                  <Typography
                    variant="h5"
                    style={{ marginLeft: '10rem' }}
                    align="left"
                  >
                    {obj['dataList'].length > 1 ? objNew.childName : ''}
                  </Typography>
                  {objNew.dataList !== undefined
                    ? objNew.dataList.map(object => (
                        <Grid Grid container spacing={1}>
                          <Grid item xs={9}>
                            <Typography
                              style={{ marginLeft: '15rem' }}
                              align="left"
                            >
                              {object.ledgerAccountName}
                            </Typography>
                          </Grid>
                          <Grid item xs={3}>
                            <Typography align="right">
                              <CountUp
                                end={object.actualAmount.toFixed(2)}
                                separator=","
                                decimals={2}
                                decimal="."
                                duration={0.1}
                              />
                            </Typography>
                          </Grid>
                        </Grid>
                      ))
                    : null}
                </Grid>
              ))
            : null}
        </Grid>
      );
    }

    function RenderAdministrationExpensesSection(obj) {
      return (
        <Grid item xs={9}>
          <Typography variant="h5" style={{ marginLeft: '5rem' }} align="left">
            {obj.parentName}
          </Typography>
          <br />
          {obj.dataList !== undefined
            ? obj['dataList'].map(objNew => (
                <Grid Grid container spacing={1}>
                  <Typography
                    variant="h5"
                    style={{ marginLeft: '10rem' }}
                    align="left"
                  >
                    {obj['dataList'].length > 1 ? objNew.childName : ''}
                  </Typography>
                  {objNew.dataList !== undefined
                    ? objNew.dataList.map(object => (
                        <Grid Grid container spacing={1}>
                          <Grid item xs={9}>
                            <Typography
                              style={{ marginLeft: '15rem' }}
                              align="left"
                            >
                              {object.ledgerAccountName}
                            </Typography>
                          </Grid>
                          <Grid item xs={3}>
                            <Typography align="right">
                              <CountUp
                                end={object.actualAmount.toFixed(2)}
                                separator=","
                                decimals={2}
                                decimal="."
                                duration={0.1}
                              />
                            </Typography>
                          </Grid>
                        </Grid>
                      ))
                    : null}
                </Grid>
              ))
            : null}
        </Grid>
      );
    }

    function RenderOtherExpensesSection(obj) {
      return (
        <Grid item xs={9}>
          <Typography variant="h5" style={{ marginLeft: '5rem' }} align="left">
            {obj.parentName}
          </Typography>
          <br />
          {obj.dataList !== undefined
            ? obj['dataList'].map(objNew => (
                <Grid Grid container spacing={1}>
                  <Typography
                    variant="h5"
                    style={{ marginLeft: '10rem' }}
                    align="left"
                  >
                    {obj['dataList'].length > 1 ? objNew.childName : ''}
                  </Typography>
                  {objNew.dataList !== undefined
                    ? objNew.dataList.map(object => (
                        <Grid Grid container spacing={1}>
                          <Grid item xs={9}>
                            <Typography
                              style={{ marginLeft: '15rem' }}
                              align="left"
                            >
                              {object.ledgerAccountName}
                            </Typography>
                          </Grid>
                          <Grid item xs={3}>
                            <Typography align="right">
                              <CountUp
                                end={object.actualAmount.toFixed(2)}
                                separator=","
                                decimals={2}
                                decimal="."
                                duration={0.1}
                              />
                            </Typography>
                          </Grid>
                        </Grid>
                      ))
                    : null}
                </Grid>
              ))
            : null}
        </Grid>
      );
    }

    function RenderFinanceExpensesSection(obj) {
      return (
        <Grid item xs={9}>
          <Typography variant="h5" style={{ marginLeft: '5rem' }} align="left">
            {obj.parentName}
          </Typography>
          <br />
          {obj.dataList !== undefined
            ? obj['dataList'].map(objNew => (
                <Grid Grid container spacing={1}>
                  <Typography
                    variant="h5"
                    style={{ marginLeft: '10rem' }}
                    align="left"
                  >
                    {obj['dataList'].length > 1 ? objNew.childName : ''}
                  </Typography>
                  {objNew.dataList !== undefined
                    ? objNew.dataList.map(object => (
                        <Grid Grid container spacing={1}>
                          <Grid item xs={9}>
                            <Typography
                              style={{ marginLeft: '15rem' }}
                              align="left"
                            >
                              {object.ledgerAccountName}
                            </Typography>
                          </Grid>
                          <Grid item xs={3}>
                            <Typography align="right">
                              <CountUp
                                end={object.actualAmount.toFixed(2)}
                                separator=","
                                decimals={2}
                                decimal="."
                                duration={0.1}
                              />
                            </Typography>
                          </Grid>
                        </Grid>
                      ))
                    : null}
                </Grid>
              ))
            : null}
        </Grid>
      );
    }

    function RenderIncomeTaxExpensesSection(obj) {
      return (
        <Grid item xs={9}>
          <Typography variant="h5" style={{ marginLeft: '5rem' }} align="left">
            {obj.parentName}
          </Typography>
          <br />
          {obj.dataList !== undefined
            ? obj['dataList'].map(objNew => (
                <Grid Grid container spacing={1}>
                  <Typography
                    variant="h5"
                    style={{ marginLeft: '10rem' }}
                    align="left"
                  >
                    {obj['dataList'].length > 1 ? objNew.childName : ''}
                  </Typography>
                  {objNew.dataList !== undefined
                    ? objNew.dataList.map(object => (
                        <Grid Grid container spacing={1}>
                          <Grid item xs={9}>
                            <Typography
                              style={{ marginLeft: '15rem' }}
                              align="left"
                            >
                              {object.ledgerAccountName}
                            </Typography>
                          </Grid>
                          <Grid item xs={3}>
                            <Typography align="right">
                              <CountUp
                                end={object.actualAmount.toFixed(2)}
                                separator=","
                                decimals={2}
                                decimal="."
                                duration={0.1}
                              />
                            </Typography>
                          </Grid>
                        </Grid>
                      ))
                    : null}
                </Grid>
              ))
            : null}
        </Grid>
      );
    }

    return (
      <div>
        <Grid container spacing={1}>
          {ParentSectionDetails.REVENUE !== undefined
            ? ParentSectionDetails.REVENUE.map(obj => RenderRevenueSection(obj))
            : null}
          {ParentSectionDetails.COSTOFREVENUE !== undefined
            ? ParentSectionDetails.COSTOFREVENUE.map(obj =>
                RenderCostOfRevenueSection(obj)
              )
            : null}
          <br />
          <Grid container spacing={1}>
            <Grid item xs={9}>
              <Typography
                variant="h5"
                style={{ marginLeft: '5rem' }}
                align="left"
              >
                Gross Profit
              </Typography>
              <Grid Grid container spacing={1}>
                <Typography
                  variant="h5"
                  style={{ marginLeft: '10rem' }}
                  align="left"
                >
                  {''}
                </Typography>
                <Grid Grid container spacing={1}>
                  <Grid item xs={9}>
                    <Typography style={{ marginLeft: '15rem' }} align="left">
                      {''}
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography
                      style={{
                        marginTop: '-1.2rem',
                        backgroundColor: '#b3e5fc'
                      }}
                      align="right"
                    >
                      <CountUp
                        end= {GrossProfit.toFixed(2)}
                        separator=","
                        decimals={2}
                        decimal="."
                        duration={0.1}
                      />
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <br />
          {ParentSectionDetails.OTHERINCOME !== undefined
            ? ParentSectionDetails.OTHERINCOME.map(obj =>
                RenderOtherIncomeSection(obj)
              )
            : null}
          {ParentSectionDetails.SELLINGANDMARKETINGEXPENSES !== undefined
            ? ParentSectionDetails.SELLINGANDMARKETINGEXPENSES.map(obj =>
                RenderSellingAndMarketingExpensesSection(obj)
              )
            : null}
          {ParentSectionDetails.ADMINISTRATIONEXPENSES !== undefined
            ? ParentSectionDetails.ADMINISTRATIONEXPENSES.map(obj =>
                RenderAdministrationExpensesSection(obj)
              )
            : null}
          {ParentSectionDetails.OTHEREXPENSES !== undefined
            ? ParentSectionDetails.OTHEREXPENSES.map(obj =>
                RenderOtherExpensesSection(obj)
              )
            : null}
          <br />
          <Grid container spacing={1}>
            <Grid item xs={9}>
              <Typography
                variant="h5"
                style={{ marginLeft: '5rem' }}
                align="left"
              >
                Earnings Before Taxes and Interest.(E B T I)
              </Typography>
              <Grid Grid container spacing={1}>
                <Typography
                  variant="h5"
                  style={{ marginLeft: '10rem' }}
                  align="left"
                >
                  {''}
                </Typography>
                <Grid Grid container spacing={1}>
                  <Grid item xs={9}>
                    <Typography style={{ marginLeft: '15rem' }} align="left">
                      {''}
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography
                      style={{
                        marginTop: '-1.2rem',
                        backgroundColor: '#b3e5fc'
                      }}
                      align="right"
                    > 
                      <CountUp
                        end= {LossFromOperatingActivitiesAmount.toFixed(2)}
                        separator=","
                        decimals={2}
                        decimal="."
                        duration={0.1}
                      />
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <br />
          {ParentSectionDetails.FINANCEEXPENSES !== undefined
            ? ParentSectionDetails.FINANCEEXPENSES.map(obj =>
                RenderFinanceExpensesSection(obj)
              )
            : null}
          {ParentSectionDetails.INCOMETAXEXPENSES !== undefined
            ? ParentSectionDetails.INCOMETAXEXPENSES.map(obj =>
                RenderIncomeTaxExpensesSection(obj)
              )
            : null}
          <br />
          <Grid container spacing={1}>
            <Grid item xs={9}>
              <Typography
                variant="h5"
                style={{ marginLeft: '5rem' }}
                align="left"
              >
                Net Profit for the period
              </Typography>
              <Grid Grid container spacing={1}>
                <Typography
                  variant="h5"
                  style={{ marginLeft: '10rem' }}
                  align="left"
                >
                  {''}
                </Typography>
                <Grid Grid container spacing={1}>
                  <Grid item xs={9}>
                    <Typography style={{ marginLeft: '15rem' }} align="left">
                      {''}
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography
                      style={{
                        marginTop: '-1.2rem',
                        backgroundColor: '#b3e5fc'
                      }}
                      align="right"
                    >
                      <CountUp
                        end= {NewProfitForThePeriodAmount.toFixed(2)}
                        separator=","
                        decimals={2}
                        decimal="."
                        duration={0.1}
                      />
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <div>&nbsp; &nbsp; </div>
        <h3>
          <center>***** End of List *****</center>
        </h3>
      </div>
    );
  }
}
