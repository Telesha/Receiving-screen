import React, { Fragment } from "react";
import MaterialTable from "material-table";
import FirstPage from "@material-ui/icons/FirstPage";
import LastPage from "@material-ui/icons/LastPage";
import Search from "@material-ui/icons/Search";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import ChevronRight from "@material-ui/icons/ChevronRight";
import ClearIcon from "@material-ui/icons/Clear";
import ArrowDownward from "@material-ui/icons/ArrowDownward";
import VisibilityRoundedIcon from "@material-ui/icons/VisibilityRounded";

export function LoadingMaterialTable({ title, columns, data, isButtonView }) 
{
    return (
        <Fragment>
            <MaterialTable
                title={title}
                columns={columns}
                data={data}
                options={{
                    filtering: false,
                    headerStyle: {
                        backgroundColor: "#f5f5f5",
                        color: "#00000",
                    },
                }}
                icons={{
                    FirstPage: () => <FirstPage />,
                    LastPage: () => <LastPage />,
                    NextPage: () => <ChevronRight />,
                    PreviousPage: () => <ChevronLeft />,
                    Search: () => <Search />,
                    ResetSearch: () => <ClearIcon />,
                    SortArrow: () => <ArrowDownward />,
                    VisibilityRounded: () =>
                        isButtonView ? <VisibilityRoundedIcon /> : null,
                }}
            />
        </Fragment>
    );
}
