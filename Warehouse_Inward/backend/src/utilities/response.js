import { STATUSCODE } from "./constant.js"

export const successResponse = (
  res,
  data,
  message = 'Success',
  status = STATUSCODE.OK
) => {
  return res.status(status).json({
    success: true,
    message,
    data
  })
}

export const errorResponse = (
  res,
  message = 'Something went wrong',
  status = STATUSCODE.INTERNAL_SERVER_ERROR
) => {
  return res.status(status).json({
    success: false,
    message
  })
}
