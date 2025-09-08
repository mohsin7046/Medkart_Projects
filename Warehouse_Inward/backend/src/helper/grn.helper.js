import { STATUS } from "../utilities/constant.js";
import { decimalConversion } from "../utilities/decimal.conversion.js";

export const determineStatus = (poItems, receivedItems, tx) => {
  let statusPO = '';
  let statusGRN = '';

  return poItems.reduce(async (promise, poItem) => {
    await promise;
    const receivedItem = receivedItems[poItem.product_id];

    if (!receivedItem) throw new Error(`Item ${poItem.product_id} not found in GRN items`);

    const shortage = receivedItem.shortage_qty || 0;

    if (receivedItem.recevied_qty > receivedItem.ordered_qty && shortage < 0) {
      statusPO = STATUS.CANCELLED;
      statusGRN = STATUS.CANCELLED;
      return;
    } else if (receivedItem.recevied_qty < receivedItem.ordered_qty && shortage > 0) {
      statusPO = STATUS.PARTIAL_RECEVIED;
    }

    const lastProduct = await tx.product.findFirst({
      where: { id: poItem.product_id, deleted_at: null },
      select: { last_purchase_price: true }
    });

    if (lastProduct) {
      const allowedMRP = lastProduct.last_purchase_price * 1.2;
      if (receivedItem.item_mrp > allowedMRP) {
        statusPO = STATUS.CANCELLED;
        statusGRN = STATUS.CANCELLED;
      }
    }
  }, Promise.resolve()).then(() => ({ statusPO, statusGRN }));
};


export const calculateItemsTotal = (items) => {
  return items.map(item => ({
    ...item,
    expiry_date:new Date(item.expiry_date),
    totalAmount: decimalConversion(item.recevied_qty * item.item_price)
  }));
};