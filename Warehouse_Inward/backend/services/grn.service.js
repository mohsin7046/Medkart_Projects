import { prisma } from "../utilities/import.config.js";

export const findPOByOrderNumber = async (order_number) => {
  return await prisma.purchaseOrder.findUnique({
    where: { order_number },
    include: { purchaseOrderItems: true },
  });
};

export const findGRNByNumber = async (grn_number) => {
  return await prisma.goodReceiptNote.findUnique({
    where: { grn_number },
    include: { goodReceiptNoteItems: true },
  });
};

export const createGRNRecord = async (data) => {
  return await prisma.goodReceiptNote.create({ data });
};

export const updateGRNRecord = async (grn_number, data) => {
  return await prisma.goodReceiptNote.update({
    where: { grn_number },
    data,
  });
};

export const deleteGRNRecord = async (grn_number) => {
  return await prisma.goodReceiptNote.delete({
    where: { grn_number },
  });
};

export const deleteGRNItemsById = async (grn_id) => {
  return await prisma.goodReceiptNoteItem.deleteMany({ where: { grn_id } });
};
