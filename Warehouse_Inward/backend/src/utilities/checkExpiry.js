import { SETEXPIRY } from "./constant.js";

export const checkExpiry = (exp_date) => {
  const valid_exp_date = new Date();
  valid_exp_date.setMonth(valid_exp_date.getMonth() + SETEXPIRY.expiryMonth);

  return new Date(exp_date) <= valid_exp_date;
};
