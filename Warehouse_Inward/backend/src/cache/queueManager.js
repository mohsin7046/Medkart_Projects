import { Queue ,QueueEvents } from 'bullmq';
import { redisClient } from './redisClient.js';

const connection = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
};


export const appQueue = new Queue('appQueue', { connection });
export const appQueueEvents = new QueueEvents('appQueue', { connection });