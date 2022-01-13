import React from "react";
import makeStyles from "@mui/styles/makeStyles";
import { DataGrid } from "@mui/x-data-grid";
import {
  Typography,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
} from "@mui/material";
import HelpTooltip from "../../components/HelpTooltip";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandLess";
import { styled } from "@mui/system";

const useStyle = makeStyles((theme) => ({
  root: {
    width: "100%",
    height: "fit-content",
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
  },
  fulfilledQtyHeader: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
  },
  help: {
    paddingLeft: "10px",
  },
  table: {
    backgroundColor: "white",
    "& .MuiDataGrid-columnHeaderCheckbox .MuiDataGrid-columnHeaderTitleContainer":
      {
        display: "none",
      },
  },
}));

const ThisDataGrid = styled(DataGrid)`
  // .MuiDataGrid-viewport,
  .MuiDataGrid-row
  // .MuiDataGrid-root
  // .MuiDataGrid-renderingZone,
  // .MuiDataGrid-virtualScroller,
  // .MuiDataGrid-virtualScrollerContent
  {
    max-height: fit-content !important;
  }

  .MuiDataGrid-renderingZone {
    max-height: none !important;
  }

  // .MuiDataGrid-virtualScrollerRenderZone {
  //   max-height: fit-content !important;
  // }

  .MuiDataGrid-cell {
    // lineHeight: 'unset !important',
    // maxHeight: 'none !important',
    // whiteSpace: 'normal',
    max-height: fit-content !important;
    overflow: auto;
    height: auto;
    // white-space: initial !important;
    line-height: none !important;
    // display: flex !important;
    align-items: center;
    padding-top: 0px !important;
    padding-bottom: 0px !important;
  }
`;

const PackingSlipDrowdown = ({ params }) => {
  return (
    <div style={{ width: "100%" }}>
      <List>
        <ListItemButton fullWidth>
          {params.row.open ? <ExpandLess /> : <ExpandMore />}
          <ListItemText primary={params.row.packingSlipId.split("-")[1]} />
        </ListItemButton>
        <Collapse in={params.row.open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {params.row.items.map((e) => (
              <ListItem key={e.customerId} divider>
                <ListItemText
                  primary={`${e.item} (${e.qty !== undefined ? e.qty : "-"})`}
                />
              </ListItem>
            ))}
          </List>
        </Collapse>
      </List>
    </div>
  );
};

const ShippingQueueTable = ({
  tableData,
  setTableData,
  onRowClick,
  selectedCustomerId,
  selectionOrderIds,
}) => {
  const classes = useStyle();

  const columns = [
    {
      field: "orderNumber",
      flex: 1,
      renderHeader: (params) => {
        return <Typography sx={{ fontWeight: 900 }}>Order</Typography>;
      },
    },
    {
      field: "packingSlipId",
      renderCell: (params) => {
        return <PackingSlipDrowdown params={params} />;
      },
      flex: 2,
      renderHeader: (params) => {
        return <Typography sx={{ fontWeight: 900 }}>Packing Slip</Typography>;
      },
    },
    {
      field: "dueDate",
      flex: 1,
      renderHeader: (params) => {
        return (
          <div className={classes.fulfilledQtyHeader}>
            <Typography sx={{ fontWeight: 900 }}>Due Date</Typography>
            <HelpTooltip tooltipText="This includes number of items that have been packed as well as number of items that have shipped." />
          </div>
        );
      },
    },
  ];

  return (
    <div className={classes.root}>
      <ThisDataGrid
        sx={{ border: "none" }}
        className={classes.table}
        autoHeight
        disableSelectionOnClick={true}
        isRowSelectable={(params) => {
          // If orders are selected, disable selecting of
          // other orders if the order number does not match
          // that if the selected order
          if (
            selectedCustomerId !== null &&
            selectedCustomerId !== params.row.customerId
          ) {
            return false;
          }
          return true;
        }}
        onSelectionModelChange={(selectionModel, _) => {
          onRowClick(selectionModel, tableData);
        }}
        onRowClick={(params) => {
          let tmpData = [...tableData];
          const tmpIndex = tmpData.findIndex((e) => {
            return e.id === params.id;
          });
          tmpData[tmpIndex].open = !tmpData || !tmpData[tmpIndex].open;
          setTableData(tmpData);
        }}
        selectionModel={selectionOrderIds}
        rows={tableData}
        rowHeight={65}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10]}
        checkboxSelection
        editMode="row"
      />
    </div>
  );
};

export default ShippingQueueTable;
