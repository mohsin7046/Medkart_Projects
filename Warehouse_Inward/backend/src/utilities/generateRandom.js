export const generateRandom = (prefix = "") => {
  const now = new Date();
  const dateStr = now.toISOString().replace(/[-:.TZ]/g, "").slice(0, 17);
  const randomStr = Math.floor(Math.random() * 10000).toString().padStart(4, "0"); 
  return `${prefix}${dateStr}${randomStr}`;
}
