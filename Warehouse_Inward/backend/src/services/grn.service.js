import { prisma } from '../utilities/import.config.js'
import { PREFIX, SETEXPIRY, STATUS } from '../utilities/constant.js'
import { generateRandom } from '../utilities/generateRandom.js'
import { decimalConversion } from '../utilities/decimal.conversion.js'
import { calculateItemsTotal, validateGRNItems } from '../helper/grn.helper.js'
import { grnLogger } from '../utilities/logger.js'
import { grnQueue, grnQueueEvents } from '../cache/queueManager.js'
import { PurchaseOrderRepository } from '../repository/purchaseOrder.repository.js'
import { GRNRepository } from '../repository/grn.repository.js'
import { success } from 'zod'
import { errorObject } from 'bullmq'

const purchaseOrderRepo = new PurchaseOrderRepository();
const grnRepo = new GRNRepository();


export const createGRNRecordService = async (data) => {
  console.log('Creating GRN with data:', data);

  const existingPO = await purchaseOrderRepo.findPOByOrderVendorId({
    vendor_id: data.vendor_id,
    include: { products: true }
  });

  if (!existingPO) {
    grnLogger.error('Purchase Order not found while creating the GRN');
    throw new Error('Purchase order not found');
  }


  if ([STATUS.COMPLETED, STATUS.CANCELLED].includes(existingPO.status)) {
    grnLogger.error('GRN already created for this order');
    throw new Error('GRN already created for this order');
  }

  console.log('Existing PO:', existingPO);

  return await prisma.$transaction(async (tx) => {
    try {

      const validationResult = await validateGRNItems(data, existingPO, tx);

      console.log(validationResult);

      const grnStatus = validationResult.isValid ? STATUS.COMPLETED : STATUS.ONHOLD;

      const grn_number = generateRandom(PREFIX.GRN);

     if (!validationResult.isValid) {
        throw {
          message: "GRN validation failed",
          validation_result: validationResult,
        };
      }

      const changedData = {
        grn_number,
        vendor_id: data.vendor_id,
        gate_pass_id: data.gate_pass_id,
        goodReceiptNoteItems: data.items,
        total_amount: data.total_amount,
        total_qty: data.total_qty,
        total_products: data.total_products,
        status: grnStatus,
        validation_errors: validationResult.isValid ? null : JSON.stringify(validationResult.errors),
        remarks: validationResult.isValid
          ? 'GRN created successfully - all validations passed'
          : `GRN on hold - ${validationResult.errors.length} validation error(s) found`
      };


      if (!validationResult.isValid) {
        grnLogger.warn(`GRN will be created with ON_HOLD status due to validation errors:`);
        validationResult.errors.forEach(err => {
          grnLogger.warn(`  - [${err.type}] ${err.message}`);
        });
      }

      const job = await grnQueue.add(
        'grn:create',
        {
          module: 'grn',
          operation: 'create',
          payload: { data: changedData }
        },
        {
          attempts: 3,
          backoff: { type: 'fixed', delay: 2000 },
          removeOnComplete: true,
        }
      );

      const newGRN = await job.waitUntilFinished(grnQueueEvents);

      if (!newGRN || newGRN.status !== 'success') {
        grnLogger.error('❌ Failed to create GRN via queue');
        throw new Error(newGRN?.message || 'GRN creation failed');
      }

      await purchaseOrderRepo.updatePurchaseOrder({
        id: existingPO.id,
        data: {
          status: validationResult.isValid ? STATUS.COMPLETED : STATUS.PENDING
        }
      });

      await prisma.gatePass.update({
        where: { id: data.gate_pass_id },
        data: {
          status: validationResult.isValid ? STATUS.INWARDCOMPLETED : STATUS.GRNINPROGRESS
        }
      })

      if (validationResult.isValid) {
        for (const item of data.items) {
          await tx.product.update({
            where: { id: item.product_id },
            data: {
              inventory_qty: {
                increment: item.billed_qty
              }
            }
          });
        }

        grnLogger.info(`✅ GRN created successfully with id: ${newGRN.data.id}`);
      } else {
        grnLogger.warn(`⚠️ GRN created with ON_HOLD status, id: ${newGRN.data.id}. Inventory not updated.`);
      }

      return {
        ...newGRN,
        validation_result: validationResult,
        status: grnStatus
      };

    } catch (error) {
      grnLogger.error(`GRN creation failed: ${error.message}`);
      throw error;
    }
  });
};


export const updateGRNRecordService = async (data) => {
  console.log('Updating GRN with data:', data);

  const existingGRN = await grnRepo.getGRNById(data.grn_id);

  if (!existingGRN) {
    grnLogger.error('GRN not found while updating');
    throw new Error('GRN not found');
  }


  if ([STATUS.COMPLETED, STATUS.CANCELLED].includes(existingGRN.status)) {
    grnLogger.error('Cannot update a completed or cancelled GRN');
    throw new Error('Cannot update a completed or cancelled GRN');
  }


  const existingPO = await purchaseOrderRepo.findPOByOrderVendorId({
    vendor_id: data.vendor_id,
    include: { products: true },
  });

  if (!existingPO) {
    grnLogger.error('Purchase Order not found while updating GRN');
    throw new Error('Purchase order not found');
  }

  if ([STATUS.CANCELLED].includes(existingPO.status)) {
    grnLogger.error('Cannot update GRN for a cancelled Purchase Order');
    throw new Error('Cannot update GRN for a cancelled Purchase Order');
  }

  console.log('Existing GRN:', existingGRN);
  console.log('Existing PO:', existingPO);

  return await prisma.$transaction(async (tx) => {
    try {

      const validationResult = await validateGRNItems(data, existingPO, tx);

      const grnStatus = validationResult.isValid ? STATUS.COMPLETED : STATUS.ONHOLD;

      if (!validationResult.isValid) {
        throw {
          message: "GRN validation failed",
          validation_result: validationResult,
        };
      }

      const changedData = {
        grn_id: data.grn_id,
        vendor_id: data.vendor_id,
        gate_pass_id: data.gate_pass_id,
        goodReceiptNoteItems: data.items,
        total_amount: data.total_amount,
        total_qty: data.total_qty,
        total_products: data.total_products,
        status: grnStatus,
        validation_errors: validationResult.isValid ? null : JSON.stringify(validationResult.errors),
        remarks: validationResult.isValid
          ? 'GRN updated successfully - all validations passed'
          : `GRN on hold - ${validationResult.errors.length} validation error(s) found`
      };

      if (!validationResult.isValid) {
        grnLogger.warn(`GRN will be updated with ON_HOLD status due to validation errors:`);
        validationResult.errors.forEach(err => {
          grnLogger.warn(`  - [${err.type}] ${err.message}`);
        });
      }

      const job = await grnQueue.add(
        'grn:update',
        {
          module: 'grn',
          operation: 'update',
          payload: { data: changedData },
        },
        {
          attempts: 3,
          backoff: { type: 'fixed', delay: 2000 },
          removeOnComplete: true,
        }
      );

      const updatedGRN = await job.waitUntilFinished(grnQueueEvents);

      if (!updatedGRN || updatedGRN.status !== 'success') {
        grnLogger.error('❌ Failed to update GRN via queue');
        throw new Error(updatedGRN?.message || 'GRN update failed');
      }

      await purchaseOrderRepo.updatePurchaseOrder({
        id: existingPO.id,
        data: {
          status: validationResult.isValid ? STATUS.COMPLETED : STATUS.PENDING
        }
      });

      await prisma.gatePass.update({
        where: { id: data.gate_pass_id },
        data: {
          status: validationResult.isValid ? STATUS.INWARDCOMPLETED : STATUS.GRNINPROGRESS
        }
      })

      if (validationResult.isValid) {
        for (const item of data.items) {
          await tx.product.update({
            where: { id: item.product_id },
            data: {
              inventory_qty: {
                increment: item.billed_qty
              }
            }
          });
        }

        grnLogger.info(`✅ GRN created successfully with id: ${updatedGRN.data.id}`);
      } else {
        grnLogger.warn(`⚠️ GRN created with ON_HOLD status, id: ${updatedGRN.data.id}. Inventory not updated.`);
      }

      return {
        ...updatedGRN,
        validation_result: validationResult,
        status: grnStatus
      };

    } catch (error) {
      grnLogger.error(`GRN update failed: ${error.message}`);
      throw error;
    }
  });
};



export const deleteGRNRecordService = async (grn_id) => {

  const module = 'grn';
  const operation = 'delete';
  const job = await grnQueue.add(`${module}:${operation}`, {
    module,
    operation,
    payload: { grn_id }
  }, {
    attempts: 3,
    backoff: { type: 'fixed', delay: 2000 },
    removeOnComplete: true,
  });

  const deleteGRN = await job.waitUntilFinished(grnQueueEvents);

  if (!deleteGRN || deleteGRN.status !== 'success') {
    grnLogger.error('❌ Failed to create GRN via queue');
    throw new Error(deleteGRN?.message || 'GRN creation failed');
  }

  return deleteGRN
}


export const getGRNByIdService = async (id) => {

  const data = await grnRepo.getGRNById(id);
  if (!data) throw new Error('GRN not found');
  console.log(data);
  return data;
}

