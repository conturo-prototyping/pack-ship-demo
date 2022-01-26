import React, { useEffect, useState } from "react";
import Search from "../components/Search";
import PackShipTabs from "../components/Tabs";
import UnfinishedBatchesCheckbox from "../components/UnFinishedBatchesCheckbox";
import { API } from "../services/server";
import { Box, Button, Grid } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { Link } from "react-router-dom";
import { ROUTE_SHIPMENTS } from "../router/router";
import CommonButton from "../common/Button";
import PackingSlipDialog from "../packing_slip/PackingSlipDialog";
import PackingQueueTable from "./tables/PackingQueueTable";
import HistoryTable from "./tables/HistoryTable";

const useStyle = makeStyles((theme) => ({
  topBarGrid: {
    paddingBottom: "20px",
  },
  navButton: {
    paddingTop: "20px",
  },
}));

const PackingQueue = () => {
  const classes = useStyle();

  const [isShowUnfinishedBatches, setIsShowUnfinishedBatches] = useState(true);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState(null);
  const [packingQueue, setPackingQueue] = useState([]);
  const [filteredPackingQueue, setFilteredPackingQueue] = useState([]);
  const [filteredSelectedIds, setFilteredSelectedIds] = useState([]);
  const [packingSlipOpen, setPackingSlipOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (isShowUnfinishedBatches) {
        return await API.getAllWorkOrders();
      } else {
        return await API.getPackingQueue();
      }
    }

    fetchData().then((data) => {
      let tableData = [];
      data?.forEach((e) => {
        tableData.push({
          id: e._id,
          orderNumber: e.orderNumber,
          part: `${e.partNumber} - ${e.partRev}`,
          partDescription: e.partDescription,
          batchQty: e.batchQty,
          fulfilledQty: e.packedQty,
        });
      });
      setPackingQueue(tableData);
      console.log(packingQueue)
      setFilteredPackingQueue(tableData);
    });
  }, [isShowUnfinishedBatches]);

  function onPackingSlipClick() {
    setPackingSlipOpen(true);
  }

  function onPackingSlipClose() {
    setPackingSlipOpen(false);
  }

  function onQueueRowClick(selectionModel, tableData) {
    setSelectedOrderIds(selectionModel);
    setFilteredSelectedIds(selectionModel);
    for (const item of tableData) {
      // All selected items will have the same order number
      // so we just take the first one
      if (selectionModel.length > 0 && item.id === selectionModel[0]) {
        setSelectedOrderNumber(item.orderNumber);
        break;
      }
      // If nothing selected set it to null
      if (selectionModel.length === 0) {
        setSelectedOrderNumber(null);
      }
    }
  }

  function onUnfinishedBatchesClick() {
    setIsShowUnfinishedBatches(!isShowUnfinishedBatches);
  }

  function onSearch(value) {
    const filtered = packingQueue.filter(
      (order) =>
        order.orderNumber.toLowerCase().includes(value.toLowerCase()) ||
        order.part.toLowerCase().includes(value.toLowerCase())
    );

    let filteredSelectedIds = [];
    filtered.forEach((e) => {
      if (selectedOrderIds.includes(e.id)) {
        filteredSelectedIds.push(e.id);
      }
    });
    setFilteredSelectedIds(filteredSelectedIds);
    setFilteredPackingQueue(filtered);
  }

  return (
    <Box p="40px">
      <Grid
        className={classes.topBarGrid}
        container
        justifyContent="start"
        spacing={2}
      >
        <Grid container item xs={"auto"}>
          <CommonButton
            label="Make Packing Slip"
            disabled={selectedOrderIds.length === 0}
            onClick={onPackingSlipClick}
          />
        </Grid>
        <Grid container justifyContent="start" item xs={6}>
          <Search onSearch={onSearch} />
        </Grid>
        <Grid container item xs justifyContent="flex-end">
          <UnfinishedBatchesCheckbox
            onChange={onUnfinishedBatchesClick}
            checked={isShowUnfinishedBatches}
          />
        </Grid>
      </Grid>

      <PackShipTabs
        queueData={filteredPackingQueue}
        queueTab={
          <PackingQueueTable
            onRowClick={onQueueRowClick}
            tableData={filteredPackingQueue}
            selectedOrderNumber={selectedOrderNumber}
            selectionOrderIds={filteredSelectedIds}
          />
        }
        historyTab={<HistoryTable />}
      />

      <PackingSlipDialog
        open={packingSlipOpen}
        onClose={onPackingSlipClose}
        orderNum={selectedOrderNumber}
        parts={packingQueue.filter((e) => selectedOrderIds.includes(e.id))}
      />

      <Grid
        className={classes.navButton}
        container
        item
        xs
        justifyContent="flex-end"
      >
        <Button component={Link} to={ROUTE_SHIPMENTS} variant="contained">
          Shipments
        </Button>
      </Grid>
    </Box>
  );
};

export default PackingQueue;
