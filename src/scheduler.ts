import { Worker } from "./worker/worker";
import { getRedisClient } from "./redis";

function checkForever() {
  const worker = new Worker(getRedisClient);

  console.log('Initial check for work');
  worker.checkForWork()
  .catch(err => console.error('Failed to work', err))
  .then(() => {
    console.log('Starting loop');
    setInterval(() => worker.checkForWork(), 1000);
  })
}

checkForever();