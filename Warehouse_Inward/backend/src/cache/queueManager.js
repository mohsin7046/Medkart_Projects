import { Queue } from 'bullmq';
import { redisClient } from './redisClient.js';

const connection = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
};


export const productQueue = new Queue('productQueue', { connection });
export const vendorQueue = new Queue('vendorQueue', { connection });
export const poQueue = new Queue('poQueue', { connection });
export const grnQueue = new Queue('grnQueue', { connection });
export const salesOrderQueue = new Queue('salesOrderQueue', { connection });
