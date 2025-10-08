import { SETEXPIRY, STATUS } from "../utilities/constant.js";
import { checkExpiry } from '../utilities/checkExpiry.js'
import { decimalConversion } from "../utilities/decimal.conversion.js";
import { grnLogger } from "../utilities/logger.js";

export const validateMRPvsPTR = (item) => {
  if (item.item_mrp < item.item_ptr) {
    throw new Error(`MRP cannot be less than PTR for product ${item.product_id}`);
  }
  return true;
};


export const validateExpiryDate = (expiryDate) => {
  if (checkExpiry(expiryDate)) {
    throw new Error(`Expiry date must be at least ${SETEXPIRY.expiryMonth} months from now`);
  }
  return true;
};


export const validatePTRMRPRatio = async (item, vendorId, tx) => {
  const ratioData = await tx.productVendorMrpPtrRatio.findFirst({
    where: {
      product_id: item.product_id,
      vendor_id: vendorId,
      deleted_at: null,
    },
    select: {
      mrp_ptr_ratio: true,
    },
  });

  if (!ratioData) {
    throw new Error(`PTR/MRP ratio not found for product ${item.product_id}`);
  }

  const expectedRatio = ratioData.mrp_ptr_ratio;
  const actualRatio = item.item_ptr / item.item_mrp;
  const ptrDeviation = Math.abs(expectedRatio - actualRatio);
  console.log(expectedRatio, " ", actualRatio);


  if (ptrDeviation > 0.02) {
    throw new Error(
      `PTR deviation exceeds ₹0.02 for product ${item.product_id} — expected ratio: ${expectedRatio.toFixed(4)}, actual ratio: ${actualRatio.toFixed(4)}`
    );
  }

  return true;
};

export const validateReceivedProducts = (poItems, receivedItems) => {
  const poProductIds = poItems.map((item) => item.product_id);
  const receivedProductIds = Object.keys(receivedItems).map(Number);

  const unorderedProducts = receivedProductIds.filter(
    (id) => !poProductIds.includes(id)
  );

  if (unorderedProducts.length > 0) {
    return unorderedProducts.map((id) => ({
      product_id: id,
      message: `Unordered product found`
    }));
  }

  return [];
};



export const validateReceivedQuantity = (poItem, receivedItem) => {
  if (!receivedItem) {
    throw new Error(`Item ${poItem.product_id} not found in GRN items`);
  }

  if (poItem.ordered_qty < receivedItem.billed_qty) {
    throw new Error(`Received qty (${receivedItem.billed_qty}) is more than ordered qty (${poItem.ordered_qty}) for product ${poItem.product_id}`);
  }

  if (poItem.ordered_qty > receivedItem.billed_qty) {
    throw new Error(`Received qty (${receivedItem.billed_qty}) is less than ordered qty (${poItem.ordered_qty}) for product ${poItem.product_id}`);
  }

  return true;
};


export const validateMRPDeviation = async (receivedItem, tx) => {
  const lastProduct = await tx.product.findFirst({
    where: { id: receivedItem.product_id, deleted_at: null },
    select: { last_purchase_price: true }
  });

  if (lastProduct && lastProduct.last_purchase_price) {
    const allowed20Percent = lastProduct.last_purchase_price * 1.2;
    const allowed10Percent = lastProduct.last_purchase_price * 1.1;

    if (receivedItem.item_mrp > allowed20Percent) {
      throw new Error(`MRP deviation exceeds 20% of last purchase price for product ${receivedItem.product_id}`);
    }

    if (receivedItem.item_mrp > allowed10Percent) {
      throw new Error(`MRP deviation exceeds 10% of last purchase price for product ${receivedItem.product_id}`);
    }
  }

  return true;
};


export const validateGatePassAmount = async (gatePassId, totalAmount, tx) => {
  const gatePassData = await tx.gatePass.findUnique({
    where: { id: gatePassId }
  });

  if (!gatePassData) {
    throw new Error("GatePass not found for the GRN");
  }

  if (totalAmount !== gatePassData.invoice_amount) {
    throw new Error(`Total amount (${totalAmount}) mismatch with GatePass invoice amount (${gatePassData.invoice_amount})`);
  }

  return gatePassData;
};


export const validateGRNItems = async (data, existingPO, tx) => {
  const validationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  const receivedMap = data.items.reduce((map, item) => {
    map[item.product_id] = item;
    return map;
  }, {});


  for (const item of data.items) {
    // 1. Validate MRP vs PTR
    try {
      validateMRPvsPTR(item);
    } catch (error) {
      validationResult.isValid = false;
      validationResult.errors.push({
        type: 'MRP_PTR_VALIDATION',
        product_id: item.product_id,
        message: error.message
      });
    }

    // 2. Validate expiry date
    try {
      validateExpiryDate(item.expiry_date);
    } catch (error) {
      validationResult.isValid = false;
      validationResult.errors.push({
        type: 'EXPIRY_VALIDATION',
        product_id: item.product_id,
        message: error.message
      });
    }

    // 3. Validate PTR/MRP ratio
    try {
      await validatePTRMRPRatio(item, data.vendor_id, tx);
    } catch (error) {
      validationResult.isValid = false;
      validationResult.errors.push({
        type: 'PTR_MRP_RATIO_VALIDATION',
        product_id: item.product_id,
        message: error.message
      });
    }
  }


  try {
 
  const errors = validateReceivedProducts(existingPO.products, receivedMap);
  if (errors.length > 0) {
    validationResult.isValid = false;
    validationResult.errors.push(
      ...errors.map((err) => ({
        type: 'UNORDERED_PRODUCT',
        product_id: err.product_id,
        message: err.message
      }))
    );
  }

} catch (error) {

  validationResult.isValid = false;

  validationResult.errors.push({
    type: 'UNORDERED_PRODUCT',
    product_id: error.product_id || null,
    message: error.message || 'Unknown validation error'
  });
}


  // 5. Validate quantities and MRP deviation for each PO item
  for (const poItem of existingPO.products) {
    const receivedItem = receivedMap[poItem.product_id];
    
    // Validate quantity
    try {
      validateReceivedQuantity(poItem, receivedItem);
    } catch (error) {
      validationResult.isValid = false;
      validationResult.errors.push({
        type: 'QUANTITY_MISMATCH',
        product_id: poItem.product_id,
        message: error.message
      });
    }

    // Validate MRP deviation
    try {
      await validateMRPDeviation(receivedItem, tx);
    } catch (error) {
      validationResult.isValid = false;
      validationResult.errors.push({
        type: 'MRP_DEVIATION',
        product_id: receivedItem.product_id,
        message: error.message
      });
    }
  }

  // 6. Validate gate pass amount
  try {
    await validateGatePassAmount(data.gate_pass_id, data.total_amount, tx);
  } catch (error) {
    validationResult.isValid = false;
    validationResult.errors.push({
      type: 'GATE_PASS_AMOUNT_MISMATCH',
      message: error.message
    });
  }

  return validationResult;
};


export const calculateItemsTotal = (items) => {
  return items.map(item => ({
    product_id: item.product_id,
    batch_number: item.batch_number,
    expiry_date: new Date(item.expiry_date),
    billed_qty: item.billed_qty,
    item_ptr: item.item_ptr,
    item_mrp: item.item_mrp,
    total_amount: decimalConversion(item.billed_qty * item.item_ptr)
  }));
};


// export const allocateInventoryToSalesOrders = async (grnItems, tx) => {
//   for (const item of grnItems) {
//     const { product_id, billed_qty } = item;
//     let remainingQty = billed_qty;

//     // Step 1: Find active SalesIndents for this product
//     const salesIndents = await tx.salesIndent.findMany({
//       where: {
//         product_id,
//         total_remain_product: { gt: 0 },
//         status: { notIn: [STATUS.OPEN] },
//         deleted_at: null
//       },
//       include: {
//         salesOrders: {
//           where: {
//             salesOrder: {
//               status: { in: [STATUS.PROCESSING, STATUS.PARTIAL_RECEVIED] },
//               deleted_at: null
//             }
//           },
//           include: {
//             salesOrder: {
//               include: {
//                 products: {
//                   where: {
//                     product_id,
//                     remaining_qty: { gt: 0 }
//                   }
//                 }
//               }
//             }
//           },
//           orderBy: {
//             salesOrder: {
//               created_at: 'asc'
//             }
//           }
//         }
//       },
//       orderBy: {
//         created_at: 'asc'
//       }
//     });

//     console.log("Fount SalesIndent", salesIndents);


//     // Step 2: Allocate inventory through each SalesIndent
//     for (const indent of salesIndents) {
//       if (remainingQty <= 0) break;

//       let indentAllocatedQty = 0;
//       let total_allocated_sales_order = 0;

//       // Step 3: Process each sales order linked to this indent
//       for (const indentSO of indent.salesOrders) {
//         if (remainingQty <= 0) break;

//         const salesOrder = indentSO.salesOrder;

//         console.log("SaleOrder", salesOrder);

//         if (!salesOrder || salesOrder.products.length === 0) continue;

//         const soProduct = salesOrder.products[0]; // Product already filtered by product_id

//         const qtyToAllocate = Math.min(remainingQty, soProduct.remaining_qty);

//         // Step 4: Update sales order product allocation
//         await tx.salesOrderProduct.update({
//           where: { id: soProduct.id },
//           data: {
//             allocated_qty: soProduct.allocated_qty + qtyToAllocate,
//             remaining_qty: Math.max(0, soProduct.remaining_qty - qtyToAllocate)
//           }
//         });

//         remainingQty -= qtyToAllocate;
//         indentAllocatedQty += qtyToAllocate;

//         // Step 5: Check if entire sales order is fulfilled
//         const allProducts = await tx.salesOrderProduct.findMany({
//           where: {
//             sales_order_id: salesOrder.id,
//             deleted_at: null
//           }
//         });

//         const allAllocated = allProducts.every(p => p.remaining_qty === 0);

//         const partiallyAllocated = allProducts.some(
//           p => p.allocated_qty > 0 && p.remaining_qty > 0
//         );

//         // Step 6: Update sales order status
//         const newStatus = allAllocated
//           ? STATUS.ALLOCATED
//           : (partiallyAllocated ? STATUS.PARTIAL_RECEVIED : STATUS.PROCESSING);

//           total_allocated_sales_order = allAllocated ? total_allocated_sales_order + 1 : total_allocated_sales_order;

//         console.log("new Status to SaleOrder", newStatus);

//         await tx.salesOrder.update({
//           where: { id: salesOrder.id },
//           data: { status: newStatus }
//         });

//         grnLogger.info(
//           `Allocated ${qtyToAllocate} units of product ${product_id} to SO ${salesOrder.sales_order_number} via Indent ${indent.indent_number}`
//         );
//       }

//       console.log("Total Allocated SalesORder",total_allocated_sales_order);
      

//       // Step 7: Update SalesIndent remaining quantity
//       if (indentAllocatedQty > 0) {
//         await tx.salesIndent.update({
//           where: { id: indent.id },
//           data: {
//             total_remain_product: indent.total_remain_product - indentAllocatedQty,
//             total_sales_order:Math.min(indent.total_sales_order - total_allocated_sales_order),
//             status: indent.total_remain_product - indentAllocatedQty === 0
//               ? STATUS.CLOSED
//               : indent.status
//           }
//         });

//         grnLogger.info(
//           `Updated Indent ${indent.indent_number}: allocated ${indentAllocatedQty} units, remaining ${indent.total_remain_product - indentAllocatedQty}`
//         );
//       }
//     }

//     // Step 8: Log remaining unallocated inventory
//     if (remainingQty > 0) {
//       grnLogger.info(
//         `${remainingQty} units of product ${product_id} added to inventory (no pending indents/orders)`
//       );
//     }
//   }
// };