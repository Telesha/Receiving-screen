import React, { useState, useEffect, createContext } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Box,
    Card,
    Grid,
    makeStyles,
    Container,
    CardHeader,
    CardContent,
    Divider
} from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import { LoadingComponent } from 'src/utils/newLoader';
import { TreeViewPopulate } from './../Components/TreeViewComponent';


const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.dark,
        minHeight: '100%',
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3)
    }
}));

export default function ChartOfAccountTreeViewListing(props) {

    const { groupID, factoryID } = useParams();
    const classes = useStyles();
    const navigate = useNavigate();
    const handleClick = () => {
        navigate('/app/chartOfAccount/listing');
    }

    const [FIlteredObjectList, setFIlteredObjectList] = useState([])

    useEffect(() => {
        let decryptedGroupID = atob(groupID.toString());
        let decryptedFactoryID = atob(factoryID.toString());

        trackPromise(GetChartOfAccountDetails(decryptedGroupID, decryptedFactoryID))

    }, [])

    async function GetChartOfAccountDetails(groupID, factoryID) {
        const result = await services.GetChartOfAccountDetailsByGroupIDAndFactoryID(groupID, factoryID);

        let tempAccountTypeArray = result.accountTypeDetailsList;
        let tempParentHeaderArray = result.parentHeaderDetailsList
        let tempChildHeaderArray = result.childHeaderDetailsList;
        let tempLedgerAccountArray = result.ledgerAccountDetailsList;

        let parentChildArray = [];
        let parentAccountTypeArray = [];
        let childLedgerAccountArray = [];

        for (const childIterator of tempChildHeaderArray) {
            let childObject = {
                id: childIterator.childHeaderID,
                accountNumber: childIterator.childHeaderCode,
                accountName: childIterator.childHeaderName,
                accountTypeName: childIterator.accountTypeName,
                accountTypeID: childIterator.accountTypeID,
                ledgerAccountList: [],
                parentHeaderID: childIterator.parentHeaderID
            }

            for (const ledgerObject of tempLedgerAccountArray) {
                if (childIterator.childHeaderID === ledgerObject.childHeaderID && childIterator.accountTypeName === ledgerObject.accountTypeName) {
                    childObject.ledgerAccountList.push(ledgerObject)
                }
            }
            childLedgerAccountArray.push(childObject)
        }

        for (const parentIterator of tempParentHeaderArray) {
            let parentObject = {
                id: parentIterator.parentHeaderID,
                accountNumber: parentIterator.parentHeaderCode,
                accountName: parentIterator.parentHeaderName,
                accountTypeName: parentIterator.accountTypeName,
                accountTypeID: parentIterator.accountTypeID,
                childHeadderList: []
            }

            for (const childLedgerObject of childLedgerAccountArray) {
                if (parentIterator.parentHeaderID === childLedgerObject.parentHeaderID && parentIterator.accountTypeName === childLedgerObject.accountTypeName) {
                    parentObject.childHeadderList.push(childLedgerObject)
                }
            }

            parentChildArray.push(parentObject);
        }

        for (const accountIterator of tempAccountTypeArray) {
            let accountObject = {
                id: accountIterator.accountTypeID,
                accountNumber: accountIterator.accountTypeCode,
                accountName: accountIterator.accountTypeName,
                parentHeaderList: []
            }
            for (const parentChildObject of parentChildArray) {
                if (accountIterator.accountTypeID === parentChildObject.accountTypeID && accountIterator.accountTypeName === parentChildObject.accountTypeName) {
                    accountObject.parentHeaderList.push(parentChildObject)
                }
            }
            parentAccountTypeArray.push(accountObject);
        }
        setFIlteredObjectList(parentAccountTypeArray)
    }

    function cardTitle(titleName) {
        return (
            <Grid container spacing={1}>
                <Grid item md={10} xs={12}>
                    {titleName}
                </Grid>
                <Grid item md={2} xs={12}>
                    <PageHeader
                        onClick={handleClick}
                    />
                </Grid>
            </Grid>
        )
    }

    return (
        <Page
            className={classes.root}
            title="Accounts Hierarchy"
        >
            <LoadingComponent />
            <Container maxWidth={false}>
                <Box mt={0}>
                    <Card>
                        <CardHeader
                            title={cardTitle("Accounts Hierarchy")}
                        />
                        <PerfectScrollbar>
                            <Divider />
                            <CardContent>
                                <TreeViewPopulate
                                    ChartsOfAccountDetailsList={FIlteredObjectList}
                                />
                            </CardContent>
                        </PerfectScrollbar>
                    </Card>
                </Box>
            </Container>
        </Page>
    )
}