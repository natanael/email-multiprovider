import * as redis from 'redis';

let client: redis.RedisClient;

export function getRedisClient(): redis.RedisClient {
  if (client && client.connected) {
    return client;
  }
  client = redis.createClient(Number(process.env.REDIS_PORT || 6379), process.env.REDIS_HOST);
  return client;
}

