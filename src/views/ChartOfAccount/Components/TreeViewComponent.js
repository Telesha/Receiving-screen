import React, { useState, useEffect, createContext } from 'react';
import PropTypes from 'prop-types';
import {
    makeStyles,
    withStyles
} from '@material-ui/core';
import SvgIcon from '@material-ui/core/SvgIcon';
import TreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';
import Collapse from '@material-ui/core/Collapse';
import { useSpring, animated } from 'react-spring';

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.dark,
        minHeight: '100%',
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3)
    },
    rootTreeView: {
        // height: 264,
        // flexGrow: 1,
        // maxWidth: 400,
    },
}));


function MinusSquare(props) {
    return (
        <SvgIcon fontSize="inherit" style={{ width: 14, height: 14 }} {...props}>
            {/* tslint:disable-next-line: max-line-length */}
            <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 11.023h-11.826q-.375 0-.669.281t-.294.682v0q0 .401.294 .682t.669.281h11.826q.375 0 .669-.281t.294-.682v0q0-.401-.294-.682t-.669-.281z" />
        </SvgIcon>
    );
}

function PlusSquare(props) {
    return (
        <SvgIcon fontSize="inherit" style={{ width: 14, height: 14 }} {...props}>
            {/* tslint:disable-next-line: max-line-length */}
            <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 12.977h-4.923v4.896q0 .401-.281.682t-.682.281v0q-.375 0-.669-.281t-.294-.682v-4.896h-4.923q-.401 0-.682-.294t-.281-.669v0q0-.401.281-.682t.682-.281h4.923v-4.896q0-.401.294-.682t.669-.281v0q.401 0 .682.281t.281.682v4.896h4.923q.401 0 .682.281t.281.682v0q0 .375-.281.669t-.682.294z" />
        </SvgIcon>
    );
}

function CloseSquare(props) {
    return (
        <SvgIcon className="close" fontSize="inherit" style={{ width: 14, height: 14 }} {...props}>
            {/* tslint:disable-next-line: max-line-length */}
            <path d="M17.485 17.512q-.281.281-.682.281t-.696-.268l-4.12-4.147-4.12 4.147q-.294.268-.696.268t-.682-.281-.281-.682.294-.669l4.12-4.147-4.12-4.147q-.294-.268-.294-.669t.281-.682.682-.281.696 .268l4.12 4.147 4.12-4.147q.294-.268.696-.268t.682.281 .281.669-.294.682l-4.12 4.147 4.12 4.147q.294.268 .294.669t-.281.682zM22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0z" />
        </SvgIcon>
    );
}

function TransitionComponent(props) {
    const style = useSpring({
        from: { opacity: 0, transform: 'translate3d(20px,0,0)' },
        to: { opacity: props.in ? 1 : 0, transform: `translate3d(${props.in ? 0 : 20}px,0,0)` },
    });

    return (
        <animated.div style={style}>
            <Collapse {...props} />
        </animated.div>
    );
}

TransitionComponent.propTypes = {
    /**
     * Show the component; triggers the enter or exit states
     */
    in: PropTypes.bool,
};

const StyledTreeItem = withStyles((theme) => ({
    iconContainer: {
        '& .close': {
            opacity: 0.3,
        },
    },
    group: {
        marginLeft: 7,
        paddingLeft: 18,
        marginTop: 3,
        borderLeft: `1px dashed #CCCCCC`,
    },
}))((props) => <TreeItem {...props} TransitionComponent={TransitionComponent} />);

export const TreeViewPopulate = ({
    ChartsOfAccountDetailsList
}) => {

    const classes = useStyles();
    function loadAccountType() {
        let accountTypeNodeArray = []
        for (const parendObject of ChartsOfAccountDetailsList) {
            accountTypeNodeArray.push(
                <StyledTreeItem nodeId={parendObject.id} label={<div><span style={{ color: '#CCCCCC' }}>---------- </span>{parendObject.accountNumber + " : " + parendObject.accountName}</div>}>
                    {
                        loadParent(parendObject)
                    }
                </StyledTreeItem>)
        }
        return accountTypeNodeArray
    }

    function loadParent(parendObject) {
        let parentNodeArray = []
        parendObject.parentHeaderList.forEach(parentHeaderObject => {
            if (parendObject.id === parentHeaderObject.accountTypeID && parendObject.accountName === parentHeaderObject.accountTypeName) {
                parentNodeArray.push(
                    <StyledTreeItem
                        nodeId={"01" + parentHeaderObject.id.toString()}
                        label={<div><span style={{ color: '#CCCCCC' }}>---------- </span>{parentHeaderObject.accountNumber + " : " + parentHeaderObject.accountName}</div>}
                    >
                        {
                            loadChild(parentHeaderObject)
                        }
                    </StyledTreeItem>
                )
            }
        });
        return parentNodeArray
    }

    function loadChild(parentHeaderObject) {
        let childNodeArray = []
        parentHeaderObject.childHeadderList.forEach(childHeaderObject => {
            if (parentHeaderObject.id === childHeaderObject.parentHeaderID && parentHeaderObject.accountTypeName === childHeaderObject.accountTypeName) {
                childNodeArray.push(
                    <StyledTreeItem
                        nodeId={"001" + childHeaderObject.id.toString()}
                        label={<div><span style={{ color: '#CCCCCC' }}>---------- </span>{childHeaderObject.accountNumber + " : " + childHeaderObject.accountName}</div>}
                    >
                        {
                            loadLedger(childHeaderObject)
                        }
                    </StyledTreeItem>
                )
            }
        });
        return childNodeArray
    }

    function loadLedger(childHeaderObject) {
        let ledgerNodeArray = []
        childHeaderObject.ledgerAccountList.forEach(ledgerObject => {
            if (childHeaderObject.id === ledgerObject.childHeaderID && childHeaderObject.accountTypeName === ledgerObject.accountTypeName) {
                ledgerNodeArray.push(
                    <StyledTreeItem
                        nodeId={"0001" + ledgerObject.ledgerAccountID.toString()}
                        label={<div><span style={{ color: '#CCCCCC' }}>---------- </span>{ledgerObject.ledgerAccountCode + " : " + ledgerObject.ledgerAccountName}</div>}
                    >
                    </StyledTreeItem>
                )
            }
        });
        return ledgerNodeArray;
    }

    return (
        <TreeView
            className={classes.rootTreeView}
            defaultExpanded={['1']}
            defaultCollapseIcon={<MinusSquare />}
            defaultExpandIcon={<PlusSquare />}
            defaultEndIcon={<CloseSquare />}
        >
            {
                loadAccountType()
            }
        </TreeView>
    )
}