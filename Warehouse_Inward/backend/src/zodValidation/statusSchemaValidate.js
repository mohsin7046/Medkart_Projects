import {z} from 'zod'

export const statusSchema = (type, exclude = []) =>
  z.string().refine(
    (val) =>
      EACHSTATUS[type].includes(val) && !exclude.includes(val),
    {
      message: `Invalid status for ${type}. Allowed: ${EACHSTATUS[type]
        .filter((s) => !exclude.includes(s))
        .join(", ")}`,
    }
  );