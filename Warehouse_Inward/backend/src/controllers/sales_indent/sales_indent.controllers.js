import { successResponse } from '../../utilities/response.js'
import { catchAsync } from '../../utilities/tryCatchAsyncHandler.js'
import { ENTITY, STATUSCODE } from '../../utilities/constant.js'
import { getSalesIndentByIdService } from '../../services/salesIndent.service.js'

export const getSalesIndentById = catchAsync(async (req, res) => {
    req.component = ENTITY.so

    const { id } = req.params;

    console.log(id);
    
    const getIndentByIdData = await getSalesIndentByIdService(id);

    return successResponse(res, getIndentByIdData, "Sale Indent Fetch successfully by Id", STATUSCODE.OK);
})