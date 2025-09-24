import { Queue ,QueueEvents } from 'bullmq';

const connection = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
};


export const purchaseOrderQueue = new Queue('purchaseOrderQueue', { connection });
export const purchaseOrderQueueEvents = new QueueEvents('purchaseOrderQueue', { connection });
export const grnQueue = new Queue('grnQueue', { connection });
export const grnQueueEvents = new QueueEvents('grnQueue', { connection });
export const purchaseInvoiceQueue = new Queue('purchaseInvoiceQueue', { connection });
export const purchaseInvoiceQueueEvents = new QueueEvents('purchaseInvoiceQueue', { connection });
export const salesOrderQueue = new Queue('salesOrderQueue', { connection });
export const salesOrderQueueEvents = new QueueEvents('salesOrderQueue', { connection });
export const salesIndentQueue = new Queue('salesIndentQueue', { connection });
export const salesIndentQueueEvents = new QueueEvents('salesIndentQueue', { connection });