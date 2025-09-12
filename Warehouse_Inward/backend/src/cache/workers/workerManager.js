import { Worker } from 'bullmq';
import { productLogger } from '../../utilities/logger.js';

const connection = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
};

export const createWorker = (queueName, handler) => {
  const worker = new Worker(queueName, handler, {
    connection,
    concurrency: 1,
    limiter: {
      max: 5,
      duration: 1000,
    },
  });

  worker.on('completed', job => {
    productLogger.info(`✅ ${queueName} Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    productLogger.error(`❌ ${queueName} Job ${job.id} failed: ${err.message}`);
  });

  return worker;
};
