import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import PerfectScrollbar from 'react-perfect-scrollbar';
import PropTypes from 'prop-types';
import { Doughnut } from 'react-chartjs-2';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Typography,
  colors,
  makeStyles,
  useTheme
} from '@material-ui/core';
import LaptopMacIcon from '@material-ui/icons/LaptopMac';
import PhoneIcon from '@material-ui/icons/Phone';
import TabletIcon from '@material-ui/icons/Tablet';
import {
  startOfMonth,
  endOfMonth,
} from 'date-fns';
import tokenService from '../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import services from '../Services';
import { colorOne, colorTwo, colorThree, colorFour, colorFive, colorSix, colorSeven, colorEight, colorNine, colorTen } from './DashboardColors';

const useStyles = makeStyles(() => ({
  root: {
    height: '100%'
  }
}));

const TrafficByDevice = ({ className, ...rest }) => {
  const classes = useStyles();
  const theme = useTheme();

  const options = {
    animation: false,
    cutoutPercentage: 80,
    layout: { padding: 0 },
    legend: {
      display: false
    },
    maintainAspectRatio: false,
    responsive: true,
    tooltips: {
      backgroundColor: theme.palette.background.default,
      bodyFontColor: theme.palette.text.secondary,
      borderColor: theme.palette.divider,
      borderWidth: 1,
      enabled: true,
      footerFontColor: theme.palette.text.secondary,
      intersect: false,
      mode: 'index',
      titleFontColor: theme.palette.text.primary
    }
  };

  const devices = [
    {
      title: 'Desktop',
      value: 63,
      icon: LaptopMacIcon,
      color: colors.indigo[500]
    },
    {
      title: 'Tablet',
      value: 15,
      icon: TabletIcon,
      color: colors.red[600]
    },
    {
      title: 'Mobile',
      value: 23,
      icon: PhoneIcon,
      color: colors.orange[600]
    }
  ];

  const [totalLeaf, setTotalLeaf] = useState([]);
  const [boxDetails, setBoxDetails] = useState([]);
  const [dataSize, setDataSize] = useState();

  useEffect(() => {
    trackPromise(GetDetails());
  }, []);


  async function GetDetails() {
    var value = [];
    var lable = [];

    let model = {
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken()),
      startDate: startOfMonth(new Date()),
      endDate: endOfMonth(new Date())
    }
    const leafData = await services.GetThisMonthLeafDetailsforDashboard(model);
    setBoxDetails(leafData);

    leafData.map((object, i) => {
      value.push(object.leafNetWeight);
      lable.push(object.collectionTypeName);
    });

     const sum = leafData.reduce(
      (accumulator, currentValue) => accumulator + currentValue.leafNetWeight,
      0,
    );
    setDataSize(sum);

    let data = {
      datasets: [
        {
          data: value,
          backgroundColor: [
            colorFive,
            colorTwo,
            colorFour,
            colorFour,
          ],
          borderWidth: 8,
          borderColor: colors.common.white,
          hoverBorderColor: colors.common.white
        }
      ],
      labels: lable
    };

    setTotalLeaf(data);

  }

  return (
    <Card
      className={clsx(classes.root, className)}
      {...rest}
    >
      <CardHeader title="This Month Leaf Details" />
      <Divider />

      <CardContent>
        {dataSize == 0 ?
          <Box height={300}
            display="flex">
            <Box m="auto" >
              <img src='/static/images/No-records-1.png' height={150} width={150}
                style={{ display: "block", margin: "auto" }}
              />
              <h5 style={{ display: "block", textAlign: "center", fontFamily: "roboto" }}>No Records Found</h5>
            </Box>
          </Box> :
          <>

            <Box
              height={300}
              position="relative"
            >
              <Doughnut
                data={totalLeaf}
                options={options}
              />
            </Box>
            <PerfectScrollbar>
              <Box
                display="flex"
                justifyContent="center"
                mt={2}
                minWidth={400}
                marginBottom={.5}
              >
                {boxDetails.map((object, i) => (
                  <Box
                    p={1}
                    textAlign="center"
                  >
                    <Typography
                      color="textPrimary"
                      variant="body1"
                    >
                      {object.collectionTypeName}
                    </Typography>
                    <Typography
                      variant="h4"
                    >
                      {object.leafNetWeight.toLocaleString()}
                      kg
                    </Typography>
                  </Box>
                ))}
              </Box>
            </PerfectScrollbar>
          </>
        }
      </CardContent>
    </Card>
  );
};

TrafficByDevice.propTypes = {
  className: PropTypes.string
};

export default TrafficByDevice;
