import { PrismaClient } from "@prisma/client";
import { parse } from "uuid";
const prisma = new PrismaClient();

export const createGRN = async (req, res) => {
  const {
    purchase_order_number,
    received_date,
    items,
    total_amount,
    damaged_qty,
    shortage_qty,
    status,
  } = req.body;

  console.log("From Frontend",req.body);
  
  if (
    !purchase_order_number ||
    !received_date ||
    !items ||
    items.length === 0 ||
    !total_amount
  ) {
    return res.status(400).json({ error: "Please fill all required fields" });
  }

  try {
    
    const existingPO = await prisma.purchaseOrder.findUnique({
      where: { order_number: purchase_order_number },
      include:{purchaseOrderItems:true}
    });

    if (!existingPO) {
      return res.status(404).json({ error: "Purchase order not found" });
    }

    if (["completed","cancelled"].includes(existingPO.status)) {
      return res.status(400).json({ error: "GRN already created for this order" });
    }

    let statusUpdate = "";
    
    for(const poItem of existingPO.purchaseOrderItems){
      const receivedItem = items.find((i) => i.product_code === poItem.product_code);
      if(!receivedItem){
        return res.status(400).json({ error: `Received item with product code ${poItem.product_code} not found in PO items` });
      }

      if(receivedItem.recevied_qty > poItem.quantity || shortage_qty < 0){
        statusUpdate = "cancelled";
        break;
      }else if(receivedItem.recevied_qty < poItem.quantity || shortage_qty > 0){
        statusUpdate = "partial received";
      }

      const lastGRNItem = await prisma.goodReceiptNoteItem.findFirst({
        where: { product_code: poItem.product_code },
        orderBy: { id: 'desc' },
      });

      if(lastGRNItem){
        const allowedMRP = lastGRNItem.item_mrp * 1.2;
        if(parseFloat(receivedItem.item_mrp) > allowedMRP){
          statusUpdate = "cancelled";
          break;
        }
      }
    }
    if(statusUpdate === "cancelled"){
      const updatePO =  await prisma.purchaseOrder.update({
        where: { order_number: purchase_order_number },
        data: { status: "cancelled" },
      });
      return res.status(400).json({ error: "Received quantity or MRP is not valid" });
    }

    if(statusUpdate === "" || statusUpdate !== "partial received"){
      statusUpdate = "completed";
    }
    
    const grn_number = `GRN-${Date.now()}`;
    const newGRN = await prisma.goodReceiptNote.create({
      data: {
        grn_number,
        order_number: purchase_order_number,
        received_date: new Date(received_date),
        damaged_qty: parseInt(damaged_qty) || 0,
        shortage_qty: parseInt(shortage_qty) || 0,
        goodReceiptNoteItems: {
          create: items.map((item) => ({
            product_code: item.product_code,
            batch_number: item.batch_number,
            expiry_date: new Date(item.expiry_date),
            recevied_qty: parseInt(item.recevied_qty),
            item_price: parseFloat(item.item_price),
            item_mrp: parseFloat(item.item_mrp),
            totalAmount: parseFloat(item.totalAmount),
          })),
        },
        total_amount: parseFloat(total_amount),
        status,
      },
    });

   const updatePO =  await prisma.purchaseOrder.update({
      where: { order_number: purchase_order_number },
      data: { status: statusUpdate },
    });

    if(!updatePO){
      return res.status(500).json({ error: "Failed to update Purchase Order status" });
    }

    console.log("Fomrm backend",newGRN);
    
    res.status(201).json(newGRN);
  } catch (error) {
    console.error("Error creating GRN:", error);
    res.status(500).json({ error: "Failed to create GRN" });
  }
};


export const getAllGRNs = async (req, res) => {
    try {
        const grns = await prisma.goodReceiptNote.findMany({
        include: { goodReceiptNoteItems: true },
        orderBy: { received_date: "desc" },
        });
        res.status(200).json(grns);
    } catch (error) {
        console.error("Error fetching GRNs:", error);
        res.status(500).json({ error: "Failed to fetch GRNs" });
    }
}


export const deleteGRN = async (req, res) => {
  try {
    const { grn_number } = req.body;
    console.log(grn_number);
    
    const existingGRN = await prisma.goodReceiptNote.findUnique({
      where: { grn_number: grn_number },
    });

    if (!existingGRN) {
      return res.status(404).json({ error: "GRN not found" });
    }

    const deleteGRNItems = await prisma.goodReceiptNoteItem.deleteMany({
      where: { grn_id: existingGRN.id },
    });

    const deletedGRN = await prisma.goodReceiptNote.delete({
      where: {  grn_number: grn_number },
    });

    if(!deletedGRN){
      return res.status(404).json({ error: "GRN not found" });
    }

    res.status(200).json(deletedGRN);
  } catch (error) {
    console.error("Error deleting GRN:", error);
    res.status(500).json({ error: "Failed to delete GRN" });
  }
}
