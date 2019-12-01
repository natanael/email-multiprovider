import * as redis from 'redis';

let client: redis.RedisClient;

export function getRedisClient(): redis.RedisClient {
  if (client && client.connected) {
    return client;
  }
  console.log('Redis host:', process.env.REDIS_HOST);
  client = redis.createClient({host: process.env.REDIS_HOST});
  return client;
}

