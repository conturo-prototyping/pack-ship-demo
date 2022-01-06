import React, { useEffect, useState } from "react";
import MakePackingSlipButton from "./buttons/MakePackingSlip";
import Search from "./Search";
import PackingQueueTabs from "./Tabs";
import UnfinishedBatchesCheckbox from "./UnFinishedBatchesCheckbox";
import { API } from "../services/server";
import { Box, Grid } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";

const useStyle = makeStyles((theme) => ({
  topBarGrid: {
    paddingBottom: "20px",
  },
}));

const PackingQueue = () => {
  const classes = useStyle();

  const [isShowUnfinishedBatches, setIsShowUnfinishedBatches] = useState(true);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState(null);
  const [packingQueue, setPackingQueue] = useState([]);
  const [filteredPackingQueue, setFilteredPackingQueue] = useState([]);

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
      setFilteredPackingQueue(tableData);
    });
  }, [isShowUnfinishedBatches]);

  function onQueueRowClick(selectionModel, tableData) {
    setSelectedOrderIds(selectionModel);
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
      (order) => order.orderNumber.includes(value) || order.part.includes(value)
    );

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
          <MakePackingSlipButton disabled={selectedOrderIds.length === 0} />
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

      <PackingQueueTabs
        queueData={filteredPackingQueue}
        onQueueRowClick={onQueueRowClick}
        selectedOrderNumber={selectedOrderNumber}
      />
    </Box>
  );
};

export default PackingQueue;