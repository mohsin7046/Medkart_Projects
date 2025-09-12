//sudo service redis-server start
import Redis from 'ioredis';
import { productLogger } from '../utilities/logger.js';

const redisClient = new Redis({
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOST,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redisClient.on('connect', () => {
  productLogger.info('✅ Connected to Redis server (ioredis)');
});

redisClient.on('error', (err) => {
  productLogger.error('❌ Redis error: ' + err.message);
});


export const cacheSet = async (key, value, ttl = 3600) => {
  try {
    const val = JSON.stringify(value);
    await redisClient.set(key, val, 'EX', ttl); 
    productLogger.info(`✅ Cache set for key: ${key}`);
  } catch (err) {
    productLogger.error(`❌ Cache set failed for key: ${key} | ${err.message}`);
  }
};

export const cacheGet = async (key) => {
  try {
    const data = await redisClient.get(key);
    if (!data) return null;
    return JSON.parse(data);
  } catch (err) {
    productLogger.error(`❌ Cache get failed for key: ${key} | ${err.message}`);
    return null;
  }
};

export const cacheDelete = async (key) => {
  try {
    await redisClient.del(key);
    productLogger.info(`✅ Cache deleted for key: ${key}`);
  } catch (err) {
    productLogger.error(`❌ Cache delete failed for key: ${key} | ${err.message}`);
  }
};

export { redisClient };
