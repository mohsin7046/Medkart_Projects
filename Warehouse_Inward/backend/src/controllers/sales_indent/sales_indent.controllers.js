import { successResponse } from '../../utilities/response.js'
import { catchAsync } from '../../utilities/tryCatchAsyncHandler.js'
import { STATUSCODE } from '../../utilities/constant.js'
import { getFlattenedSalesIndentByIdService } from '../../services/salesIndent.service.js'

export const getSalesIndentById = catchAsync(async (req, res) => {
  
    const { id } = req.params;

    console.log(id);
    
    const getIndentByIdData = await getFlattenedSalesIndentByIdService(id);

    return successResponse(res, getIndentByIdData, "Sale Indent Fetch successfully by Id", STATUSCODE.OK);
})