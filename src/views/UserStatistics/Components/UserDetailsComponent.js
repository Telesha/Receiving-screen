import React from 'react';
import {
    Box,
    Typography,
    Avatar,
    makeStyles,
    withStyles,
    Grid
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.dark,
        minHeight: '100%',
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3)
    },
    avatar: {
        width: theme.spacing(7),
        height: theme.spacing(7),
    },
    row: {
        marginTop: '1rem'
    }
}));

export const UserDetailsComponent = ({ CustomerDetails }) => {

    const classes = useStyles();

    const NameTextTypography = withStyles({
        root: {
            color: "black"
        }
    })(Typography);

    const CaptionTextTypography = withStyles({
        root: {
            color: "#709be0"
        }
    })(Typography);

    function CustomerName(CustomerDetails) {
        let firstName = CustomerDetails.firstName === null || CustomerDetails.firstName === 'NaN' || CustomerDetails.firstName === undefined ? '' : CustomerDetails.firstName;
        let secondName = CustomerDetails.secondName === null || CustomerDetails.secondName === 'NaN' || CustomerDetails.secondName === undefined ? '' : CustomerDetails.secondName;
        let lastName = CustomerDetails.lastName === null || CustomerDetails.lastName === 'NaN' || CustomerDetails.lastName === undefined ? '' : CustomerDetails.lastName;

        return (firstName + " " + secondName + " " + lastName)
    }

    return (
        <div>
            <Grid container spacing={3}>
                <Grid item md={1} xs={12}>
                    <Avatar
                        alt={CustomerDetails.firstName}
                        src={
                            CustomerDetails.customerBiometricData === null ? null :
                                'data:image/jpg;base64,' + CustomerDetails.customerBiometricData
                        }
                        className={classes.avatar} >
                    </Avatar>
                </Grid>
                <Grid item md={11} xs={12}>
                    <Box>
                        <NameTextTypography
                            variant="h5"  >
                            {
                                CustomerName(CustomerDetails)
                            }
                        </NameTextTypography >
                        <CaptionTextTypography
                            variant="caption" >
                            {CustomerDetails.nic}
                        </CaptionTextTypography>
                    </Box>
                </Grid>
            </Grid>
        </div>
    )
}