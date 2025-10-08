import { STATUS } from "../utilities/constant.js";
import { prisma } from "../utilities/import.config.js";
import { grnLogger } from "../utilities/logger.js";

export class GRNRepository {

  async createGRN(data) {
    console.log(data);
    
    try {

      const newGRN = await prisma.goodReceiptNote.create({
        data: {
          grn_number: data.grn_number,
          vendor_id: data.vendor_id,
          gate_pass_id: data.gate_pass_id,
          total_amount: data.total_amount,
          total_qty: data.total_qty,
          total_products: data.total_products,
          status: data.status,
          goodReceiptNoteItems: {
            create: data.goodReceiptNoteItems.map((item) => ({
              product_id: item.product_id,
              batch_number: item.batch_number,
              expiry_date: item.expiry_date,
              billed_qty: item.billed_qty,
              item_ptr: item.item_ptr,
              item_mrp: item.item_mrp,
              total_amount: item.total_amount,
            })),
          },
        },
        include: {
          goodReceiptNoteItems: true,
        },
      });

      return newGRN;

    } catch (error) {
      grnLogger.error("Error creating GRN: " + error.message);
      throw error;
    }
  }

  async updateGRN(grn_id, data) {
    try {
      const updatedGRN = await prisma.goodReceiptNote.update({
        where: { id: grn_id },
        data: {
          received_date: data.received_date,
          total_amount: data.total_amount,
          status: data.status || STATUS.PENDING,
          goodReceiptNoteItems: {
            deleteMany: { grn_id: data.grn_id },
            create: data.goodReceiptNoteItems
          }
        }
      });
      if (!updatedGRN) {
        throw new Error('GRN not found');
      }
      return updatedGRN
    } catch (error) {
      grnLogger.error("Error updating GRN: " + error.message);
      throw error;
    }
  }

  async deleteGRN(grn_id) {
    try {
      return await prisma.goodReceiptNote.update({
        where: { id: grn_id },
        data: {
          deleted_at: new Date(),
          status: STATUS.CANCELLED,
        },
      });
    } catch (error) {
      grnLogger.error("Error deleting GRN: " + error.message);
      throw error;
    }
  }


  async deleteGRNItems(grn_id) {
    try {
      return await prisma.goodReceiptNoteItem.updateMany({
        where: { grn_id },
        data: { deleted_at: new Date() },
      });
    } catch (error) {
      grnLogger.error("Error deleting GRN items: " + error.message);
      throw error;
    }
  }


  async getGRNById(id) {
    try {
      return await prisma.goodReceiptNote.findUnique({
        where: { id: parseInt(id) },
        select: {
          id: true,
          grn_number: true,
          gate_pass_id: true,
          total_amount: true,
          total_qty: true,
          total_products: true,
          status:true,
          vendor: {
            select: {
              id: true,
              name: true,
            },
          },
          goodReceiptNoteItems: {
            select: {
              id: true,
              product: {
                select: {
                  id: true,
                  name: true,
                },
              },
              batch_number: true,
              expiry_date: true,
              billed_qty: true,
              item_ptr: true,
              item_mrp: true,
              total_amount: true,
            },
          },
        },
      });

    } catch (error) {
      grnLogger.error(`Error fetching GRN by ID (${id}): ${error.message}`);
      throw error;
    }
  }


  async existingGRNById(grn_id) {
    try {
      return await prisma.goodReceiptNote.findFirst({
        where: { id: grn_id, deleted_at: null },
      });
    } catch (error) {
      grnLogger.error(`Error finding existing GRN (grn_id: ${grn_id}) | ${error.message}`);
      throw error;
    }
  }

  async updateGRNStatus(grn_id, status) {
    try {
      return await prisma.goodReceiptNote.update({
        where: { id: grn_id },
        data: { status },
      });
    } catch (error) {
      grnLogger.error("Error updating GRN status: " + error.message);
      throw error;
    }
  }
}
