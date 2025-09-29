import { catchAsync } from "../../utilities/tryCatchAsyncHandler.js";
import { DETAILSFETCH, FEILD, SEARCHFILTERNAME } from "../../utilities/constant.js";
import { errorResponse, successResponse } from "../../utilities/response.js";
import { buildFilter } from "../../utilities/builderFilter.js";
import { STATUSCODE } from "../../utilities/constant.js";
import {buildSelect} from '../../utilities/builtSelectForDb.js'

export const getAllOrFiltered = catchAsync(async (req, res) => {
 
  const filters = req.query;
  const { name, field } = filters;

  if (!SEARCHFILTERNAME[name]) {
    return errorResponse(res, `Invalid name: ${name}`, STATUSCODE.BAD_REQUEST);
  } 

  const model = SEARCHFILTERNAME[name];
  const allFields = FEILD[name];


  const where = buildFilter(filters, {
    name: { field: "name", type: "string" },
    search: { field: "search", type: "exact" },
    page: { field: "page", type: "number" },
    limit: { field: "limit", type: "number" },
    status: { field: "status", type: "exact" },
    sortby: { field: "sortby", type: "exact" },
  });

  const { limit = 10, search, page = 1, status, sortby } = where;

  let query = {};

  if (search) {
    if (field) {
      query.OR = [
        { [field]: { contains: search, mode: "insensitive" } },
      ];
    } else if (allFields?.length) {
      query.OR = allFields.map((item) => ({
        [item]: { contains: search, mode: "insensitive" },  
      }));
    }
  }      

  if (status) {
    query.status = status;
  }

  const skip = (page - 1) * limit;

  const whereCondition = {
    deleted_at: null,
    ...query,
  };

  let orderBy = {};
  if (sortby) {
    const [sortField, direction] = sortby.split(",");
    orderBy = {
      [sortField]: direction?.toLowerCase() === "d" ? "desc" : "asc",
    };
  }

   
  const fieldsToFetch = DETAILSFETCH[name] || [];
  const {select} = buildSelect(fieldsToFetch);

  const [items, totalItems] = await Promise.all([
    model.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy,
      select
    }),
    model.count({ where: whereCondition }),
  ]);

  const totalPages = Math.ceil(totalItems / limit);


  return successResponse(
    res,
    {
      data: items,
      metadata: {
        page,
        limit,
        totalPages,
        totalItems,
      },
    },
    `${name} fetched successfully`,
    STATUSCODE.OK
  );
});
