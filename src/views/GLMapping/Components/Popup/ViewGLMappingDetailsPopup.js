import React, { useState, useEffect } from 'react';
import { makeStyles} from '@material-ui/core';
import MaterialTable from 'material-table';
import { Modal } from 'react-responsive-modal';
import Fade from '@material-ui/core/Fade';

const useStyles = makeStyles((theme) => ({
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    paper: {

        padding: theme.spacing(2, 4, 3),
        width: '45rem',
        maxHeight: '50rem'
    },
}));

export const ViewGLMappingPopup = ({
    GLMapingAccountDataList, ViewDetilsPopup, setViewDetilsPopup, PopupTitle
}) => {

    const classes = useStyles();
    const handleOpen = () => {
        setViewDetilsPopup(true);
    };

    const handleClose = () => {
        setViewDetilsPopup(false);
    };


    const columns = [
        { title: 'Account Name', field: 'accountName' },
        {
            title: 'Credit / Debit',
            field: 'entryType',
            lookup: {
                1: 'Credit',
                2: 'Debit',
            }
        },
    ];

    return (
        <div>
            <Modal
                open={ViewDetilsPopup}
                onClose={handleClose}
                center
                animationDuration={300}

            >
                <Fade in={ViewDetilsPopup}>

                    <div className={classes.paper}>
                        <h2>{PopupTitle}</h2><br />
                        <MaterialTable
                            title={false}
                            data={GLMapingAccountDataList}
                            columns={columns}
                            options={{
                                selection: false,
                                search: true,
                                actionsColumnIndex: -1,
                                columnResizable: true,
                                pageSize: 5
                            }}
                        />
                    </div>
                </Fade>
            </Modal>
        </div>
    )
}