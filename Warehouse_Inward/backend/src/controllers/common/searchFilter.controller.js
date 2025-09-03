import { catchAsync } from "../../utilities/tryCatchAsyncHandler.js";
import { FEILD, SEARCHFILTERNAME } from "../../utilities/constant.js";
import { errorResponse, successResponse } from "../../utilities/response.js";


export const searchFilterCommon = catchAsync(async (req, res) => {
    
  let { name,search, page = 1,status, limit = 10 } = req.query

   limit = Number(limit);
   page = Number(page);
   console.log(name);
   

   if (!SEARCHFILTERNAME[name]) {
    return errorResponse(res,`Invalid name: ${name}`,400)
  }

  let query = {};
  if (search && FEILD[name]) {
    query.OR = FEILD[name].map((item) => ({
      [item]: { contains: search, mode: 'insensitive' }
    }))
  }

  if (status) {
    query.status = status
  }

  const model = SEARCHFILTERNAME[name];

  const skip = (page - 1) * limit;

  const whereCondition = {
    deleted_at: null,
    ...query,
  };

  const [items, totalItems] = await Promise.all([
    model.findMany({
      where: whereCondition,
      skip,
      take: Number(limit),
    }),
    model.count({
      where: whereCondition,
    }),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  const finaldata = {
    data: items,
    metadata: {
      page,
      limit,
      totalPages,
      totalItems,
    },
  };

  return successResponse(res,finaldata,"Sucessfully search or filter the item",200) 
})