import { STATUS } from "../utilities/constant.js";
import { prisma } from "../utilities/import.config.js";
import { grnLogger } from "../utilities/logger.js";

export class GRNRepository {


  async createGRN(data) {
    try {
      console.log(data);
      
      const newGRN = await prisma.goodReceiptNote.create({
        data: {
          grn_number:data.grn_number,
          order_id: data.order_id,
          received_date: data.received_date,
          goodReceiptNoteItems: { create: data.goodReceiptNoteItems },
          total_amount:data.total_amount,
          status: data.status|| STATUS.PENDING
        }
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
          total_amount:data.total_amount,
          status: data.status || STATUS.PENDING,
          goodReceiptNoteItems: {
            deleteMany: { grn_id: data.grn_id },
            create: data.goodReceiptNoteItems
          }
        }
      });
      if(!updatedGRN){
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
          status:STATUS.CANCELLED,
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
        include: {
          purchaseOrder: { select: { order_number: true } },
          goodReceiptNoteItems: true,
        },
      });
    } catch (error) {
      grnLogger.error(`Error fetching GRN by ID (${id}): ${error.message}`);
      throw error;
    }
  }


  async existingGRNById(grn_id){
    try {
      return await prisma.goodReceiptNote.findFirst({
        where: { id: grn_id, deleted_at: null },
      });
    } catch (error) {
      grnLogger.error(`Error finding existing GRN (grn_id: ${grn_id}) | ${error.message}`);
      throw error;
  }
}

async updateGRNStatus( grn_id, status) {
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
