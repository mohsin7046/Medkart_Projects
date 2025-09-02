import { prisma } from '../../utilities/import.config.js'
import { findPOByOrderNumber, getALLGRNService, findGRNByNumber, createGRNRecord, updateGRNRecord, deleteGRNRecord, deleteGRNItemsById, searchFilterGRNService } from '../../services/grn.service.js'
import { errorResponse, successResponse } from '../../utilities/response.js'
import { FEILD, STATUS } from '../../utilities/constant.js'
import { Validate } from '../../zodValidation/validate.zod.js'
import { updateGoodReceiptNoteSchema } from '../../zodValidation/grnValidation/grnUpdate.zod.js'
import { createGoodReceiptNoteSchema } from '../../zodValidation/grnValidation/grnCreate.zod.js'

export const createGRN = async (req, res) => {
  const data = Validate(createGoodReceiptNoteSchema)

  if (!data) {
    return errorResponse(res, "All feilds are required", 400)
  }

  data.items.map((item) => {
    if (parseFloat(item.item_mrp) < parseFloat(item.item_price)) {
      return res
        .status(400)
        .json({
          error: `MRP is not less than price in product ${item.product_code}`
        })
    }
  })

  try {
    const existingPO = await findPOByOrderNumber(purchase_order_number);

    if (!existingPO) {
      return errorResponse(res, "'Purchase order not found'", 400)
    }

    if ([STATUS.COMPLETED, STATUS.CANCELLED].includes(existingPO.status)) {
      return errorResponse(res, "'GRN already created for this order'", 400)
    }

    const createGRN = await createGRNRecord(existingPO, data);

    if (!createGRN) {
      return errorResponse(res, "GRN isnot created", 400);
    }

    return successResponse(res, createGRN, "Successfully created GRN", 200)
  } catch (error) {
    console.error('Error creating GRN:', error)
    return errorResponse(res, 'Failed to create GRN', 500);
  }
}


export const getAllGRNs = async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const orderBy = req.query.orderBy;

    const getGRNS = await getALLGRNService(page, limit, orderBy);
    if (!getGRNS) {
      return errorResponse(res, "GRN not fetched", 400)
    }
    return successResponse(res, getGRNS, "Successfully get all GRN")
  } catch (error) {
    console.error('Error fetching GRNs:', error)
    return errorResponse(res, "'Failed to fetch GRNs'", 500)
  }
}

export const updateGRN = async (req, res) => {
  try {
    const data = Validate(updateGoodReceiptNoteSchema);

    if (!data) {
      return errorResponse(res, "All feilds are required", 400)
    }

    const existingGRN = await findGRNByNumber(data.grn_number);

    if (!existingGRN) {
      return errorResponse(res, 'GRN not found', 400)
    }

    const updateGRN = await updateGRNRecord(existingGRN, data);

    if (!updateGRN) {
      return errorResponse(res, "GRN is not updated", 400)
    }

    return successResponse(res, updateGRN, "Successfully updated GRN", 200)
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to updated GRN", 500)
  }
}

export const deleteGRN = async (req, res) => {
  try {
    const { grn_number } = req.body

    const existingGRN = await findGRNByNumber(grn_number);

    if (!existingGRN) {
      return errorResponse(res, 'GRN not found', 400)
    }

    const deleteGRNItems = deleteGRNItemsById(grn_number);

    const deletedGRN = deleteGRNRecord(grn_number);

    if (!deletedGRN) {
      return errorResponse(res, 'GRN not found', 400)
    }

    return successResponse(res, deleteGRN, "GRN deleted succesfully", 200)
  } catch (error) {
    console.error('Error deleting GRN:', error)
    return errorResponse(res, "Failed to delete GRN", 500)
  }
}


export const searchFilterGRN = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;

    if (search) {
      query.OR = FEILD.GRN_FEILD.map((item) => ({
        [item]: { contains: search, mode: 'insensitive' }
      }));
    }

    if (status) {
      query.status = status;
    }

    const getSearchFilter = await searchFilterGRNService(query, page, limit);

    if (!getSearchFilter) {
      return errorResponse(res, "Product not searched or filtered", 400);
    }

    return successResponse(res, getSearchFilter, "Successfully Search or filter the product", 200);

  } catch (error) {
    console.error('Error searching or filtering product:', error);
    return errorResponse(res, "FAiled to searched or filtered Products", 500);
  }
};
