import React, { useState, useEffect, Fragment, useRef } from 'react';
import {
    Card,
    makeStyles,
    Container
} from '@material-ui/core';
import Page from 'src/components/Page';
import { trackPromise } from 'react-promise-tracker';
import authService from 'src/utils/permissionAuth';
import { useNavigate } from 'react-router-dom';
import { useAlert } from 'react-alert';

const useStyles = makeStyles(theme => ({
    root: {
        backgroundColor: theme.palette.background.dark,
        minHeight: '100%',
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3)
    },
    avatar: {
        marginRight: theme.spacing(2)
    },
    colorCancel: {
        backgroundColor: 'red'
    },
    colorRecord: {
        backgroundColor: 'green'
    }
}));

const screenCode = 'POWERBIDASHBOARD';

export default function PowerBiDashboardView(props) {
    const [title, setTitle] = useState('PowerBi Dashboard');
    const classes = useStyles();
    const navigate = useNavigate();

    useEffect(() => {
        trackPromise(getPermission());
    }, []);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(
            p => p.permissionCode == 'VIEWPOWERBIDASHBOARD'
        );

        if (isAuthorized === undefined) {
            navigate('/404');
        }
    }

    return (
        <Fragment>
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Card>
                        <iframe title="Estate Demo with accounts" width="1140" height="541.25" src="https://app.powerbi.com/reportEmbed?reportId=4768b543-47cd-490f-b0a0-5a303525c09d&autoAuth=true&ctid=3aeefe37-b091-4761-8b44-17f32ed9efbb" frameborder="0" allowFullScreen="true"></iframe>
                    </Card>
                </Container>
            </Page>
        </Fragment >
    );
}
