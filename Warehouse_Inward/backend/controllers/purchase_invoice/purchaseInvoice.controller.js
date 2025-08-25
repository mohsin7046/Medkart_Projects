import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createPurchaseInvoice = async (req, res) => {
  try {
    const { grn_number, invoice_date, total_amount, items } = req.body;

    console.log(req.body);

    if (!grn_number || !invoice_date || !total_amount) {
      return res.status(400).json({ error: "Please fill all required fields" });
    }

    items.map((item) => {
      if (parseFloat(item.item_mrp) < parseFloat(item.item_price)) {
        return res
          .status(400)
          .json({
            error: `MRP is not less than price in product ${item.product_code}`,
          });
      }
    });

    const existingGRN = await prisma.goodReceiptNote.findUnique({
      where: { grn_number },
    });

    if (!existingGRN) {
      return res.status(400).json({ error: "GRN is not exist" });
    }

    if (["completed,cancelled"].includes(existingGRN.status)) {
      return res
        .status(400)
        .json({ error: "Purchase Invoice already created for this GRN" });
    }

    let total = 0;
    for (let item of items) {
      const product = await prisma.product.findUnique({
        where: { product_code: item.product_code },
        select: { gst_percentage: true },
      });

      const gst = product?.gst_percentage || 0;
      const sum = item.totalAmount + (item.totalAmount * gst) / 100;
      total += sum;
    }

    const invoice_number = `INV-${Date.now()}`;

    const invoice = await prisma.purchaseInvoice.create({
      data: {
        grn_number,
        invoice_number,
        invoice_date: new Date(invoice_date),
        total_amount: parseInt(total),
        PurchaseInvoiceItem: {
          create: items.map((item) => ({
            product_code: item.product_code,
            quantity: parseInt(item.quantity),
            item_price: parseFloat(item.item_price),
            item_mrp: parseFloat(item.item_mrp),
            totalAmount: parseFloat(item.totalAmount),
          })),
        },
      },
    });
    if (!invoice) {
      return res
        .status(500)
        .json({ error: "Failed to create purchase invoice" });
    }

    const updateGRN = await prisma.goodReceiptNote.update({
      where: { grn_number },
      data: {
        status: "completed",
      },
    });

    if (!updateGRN) {
      return res.status(400).json({ error: "GRN status is not updated" });
    }

    res.status(201).json(invoice);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Failed to create purchase invoice" });
  }
};

export const getAllPurchaseInvoices = async (req, res) => {
  try {
    const invoices = await prisma.purchaseInvoice.findMany({
      include: {
        PurchaseInvoiceItem: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    console.log(invoices);

    res.status(200).json(invoices);
  } catch (error) {
    console.error("Error fetching purchase invoices:", error);
    res.status(500).json({ error: "Failed to fetch purchase invoices" });
  }
};

export const deletePurchaseInvoice = async (req, res) => {
  try {
    const { invoice_number } = req.body;
    console.log(invoice_number);

    if (!invoice_number) {
      return res.status(400).json({ error: "All feilds are required" });
    }

    await prisma.purchaseInvoiceItem.deleteMany({
      where: { invoice_number: invoice_number },
    });

    const deletedInvoice = await prisma.purchaseInvoice.delete({
      where: { invoice_number },
    });

    if (!deletedInvoice) {
      return res.status(404).json({ error: "Purchase invoice is not deleted" });
    }
    res.status(200).json(deletedInvoice);
  } catch (error) {
    console.error("Error deleting purchase invoices:", error);
    res.status(500).json({ error: "Failed to deleting purchase invoices" });
  }
};
