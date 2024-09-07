import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import moment from 'moment';
import { v4 as uuid } from 'uuid';
import PerfectScrollbar from 'react-perfect-scrollbar';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
  makeStyles
} from '@material-ui/core';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import tokenService from '../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import services from '../Services';


const data = [
  {
    id: uuid(),
    ref: 'CDD1049',
    amount: 30.5,
    customer: {
      name: 'Ekaterina Tankova'
    },
    createdAt: 1555016400000,
    status: 'pending'
  },
  {
    id: uuid(),
    ref: 'CDD1048',
    amount: 25.1,
    customer: {
      name: 'Cao Yu'
    },
    createdAt: 1555016400000,
    status: 'delivered'
  },
  {
    id: uuid(),
    ref: 'CDD1047',
    amount: 10.99,
    customer: {
      name: 'Alexa Richardson'
    },
    createdAt: 1554930000000,
    status: 'refunded'
  },
  {
    id: uuid(),
    ref: 'CDD1046',
    amount: 96.43,
    customer: {
      name: 'Anje Keizer'
    },
    createdAt: 1554757200000,
    status: 'pending'
  },
  {
    id: uuid(),
    ref: 'CDD1045',
    amount: 32.54,
    customer: {
      name: 'Clarke Gillebert'
    },
    createdAt: 1554670800000,
    status: 'delivered'
  },
  {
    id: uuid(),
    ref: 'CDD1044',
    amount: 16.76,
    customer: {
      name: 'Adam Denisov'
    },
    createdAt: 1554670800000,
    status: 'delivered'
  }
];

const useStyles = makeStyles(() => ({
  root: {},
  actions: {
    justifyContent: 'flex-end'
  }
}));

const LatestOrders = ({ className, ...rest }) => {
  const classes = useStyles();
  const [orders] = useState(data);
  const [factoryItemDetails, setFactoryItemDetails] = useState([]);

  useEffect(() => {
    trackPromise(GetDetails());
  }, []);


  async function GetDetails() {
    let model = {
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    }
    const customerData = await services.GetLatestFactoryItemDetailsforDashboard(model);
    setFactoryItemDetails(customerData.data);
  }

  return (
    <Card
      className={clsx(classes.root, className)}
      {...rest}
    >
      <CardHeader title="Latest Factory Items" />
      <Divider />
      <CardContent>
      {factoryItemDetails.length > 0 ?
      <Box display="flex" height={300}>
        <PerfectScrollbar>
          <Box minWidth={800}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sortDirection="desc">
                    <Tooltip
                      enterDelay={300}
                      title="Sort"
                    >
                      <TableSortLabel
                        active
                        direction="desc"
                      >
                        Date
                      </TableSortLabel>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    Item Code
                  </TableCell>
                  <TableCell>
                    Item Name
                  </TableCell>
                  <TableCell>
                    Item Category
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {factoryItemDetails.map((order) => (
                  <TableRow
                    hover
                  >
                    <TableCell>
                      {order.createdDate.split('T')[0]}
                    </TableCell>
                    <TableCell>
                      {order.itemCode}
                    </TableCell>
                    <TableCell>
                      {order.itemName}
                    </TableCell>
                    <TableCell>
                      {order.categoryName}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </PerfectScrollbar> 
        </Box>:
        <Box  display="flex" height={300}>
        <Box m="auto" >
          <img src='/static/images/no-data-found.png' height={150} width={150}
            style={{ display: "block", margin: "auto" }}
          />
          <h5 style={{ display: "block", textAlign: "center", fontFamily: "roboto" }}>No Records Found</h5>
          <br />
        </Box>
        </Box>
      }


      {/* <Box
        display="flex"
        justifyContent="flex-end"
        p={2}
      >
        <Button
          color="primary"
          endIcon={<ArrowRightIcon />}
          size="small"
          variant="text"
        >
          View all
        </Button>
      </Box> */}
      </CardContent>
    </Card>
  );
};

LatestOrders.propTypes = {
  className: PropTypes.string
};

export default LatestOrders;
