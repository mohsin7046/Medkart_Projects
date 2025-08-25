import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

export const createPurchaseOrder = async (req, res) => {
  try {
    const { vendor_code, order_date, expected_delivery_date, total_amount, items } = req.body;
    console.log("From fronetnd",req.body);


    items.map((item)=>{
      if(parseFloat(item.item_mrp) < parseFloat(item.item_price) ){
        return res.status(400).json({error:`MRP is not less than price in product ${item.product_code}`})
      }
    })

    const order_number = "ORD-" + uuidv4().replace(/-/g, "").substring(0, 8).toUpperCase();

    const newPurchaseOrder = await prisma.purchaseOrder.create({
      data: {
        vendor_code: vendor_code,
        order_date: new Date(order_date),  
        order_number,                      
        expected_delivery_date: new Date(expected_delivery_date),
        total_amount,
        status: "pending",
        purchaseOrderItems: {
          create: items.map(item => ({
            product_code: item.product_code,
            quantity: parseInt(item.quantity),
            item_price: parseInt(item.item_price),
            item_mrp: parseInt(item.item_mrp),
            totalAmount: parseInt(item.totalAmount),
          })),
        },
      },
    });

    res.status(201).json(newPurchaseOrder);

  } catch (error) {
    console.error("Error creating purchase order:", error);
    res.status(500).json({ error: "Failed to create purchase order" });
  }
};


export const getAllPurchaseOrders = async (req, res) => {
    try {
        const orders = await prisma.purchaseOrder.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                purchaseOrderItems: true,
            },
        });

        res.status(200).json(orders);
    } catch (error) {
        console.error("Error fetching purchase orders:", error);
        res.status(500).json({ error: "Failed to fetch purchase orders" });
    }
}

export const deletePurchaseOrder = async (req, res) => {
  try {
    const { purchase_order_number } = req.body;
    console.log(purchase_order_number);
    
    const existingPO = await prisma.goodReceiptNote.findFirst({
      where: { order_number: purchase_order_number },
    })

    if(existingPO && existingPO.status === 'completed'){
      return res.status(400).json({ error: "Cannot delete purchase order with completed GRN" });
    }
    
    const deleteOrderItem = await prisma.purchaseOrderItem.deleteMany({
      where: { order_number: purchase_order_number },
    });

    
    const deletedOrder = await prisma.purchaseOrder.delete({
      where: { order_number: purchase_order_number },
    });

    if(!deletedOrder){
      return res.status(404).json({ error: "Purchase order not found" });
    }

    res.status(200).json({ message: "Purchase order deleted successfully", deletedOrder });
  } catch (error) {
    console.error("Error deleting purchase order:", error);
    res.status(500).json({ error: "Failed to delete purchase order" });
  }
}

export const updatePurchaseOrder = async (req, res) => {
  const formData = req.body;
  
  try {
    if (!formData.id) {
      return res.status(400).json({ error: "Purchase Order ID is required for update" });
    }

    const updatedOrder = await prisma.purchaseOrder.update({
      where: { order_number: formData.order_number },
      data: {
        vendor_code: formData.vendor_code,
        order_date: new Date(formData.order_date),
        expected_delivery_date: new Date(formData.expected_delivery_date),
        total_amount: formData.total_amount,
        purchaseOrderItems: {
          deleteMany: {order_number: formData.order_number},  
          create: formData.items.map(item => ({
            product_code: item.product_code,
            quantity: parseInt(item.quantity),
            item_price: parseInt(item.item_price),
            item_mrp: parseInt(item.item_mrp),
            totalAmount: parseInt(item.totalAmount),
          })),
        },
      },
      include: { purchaseOrderItems: true }, 
    });

    return res.json(updatedOrder);
  } catch (error) {
    console.error("Error updating Purchase Order:", error);
    return res.status(500).json({ error: "Failed to update purchase order" });
  }
};
