import Bee from 'bee-queue';
import SubscriptionMail from '../app/jobs/SubscriptionMail';
import redisConfig from '../config/redis';

const jobs = [SubscriptionMail];

class Queue {
  constructor() {
    this.queues = {};

    this.init();
  }

  init() {
    jobs.forEach(({ key, handle }) => {
      this.queues[key] = {
        bee: new Bee(key, {
          redis: redisConfig,
        }),
        handle,
      };
    });
  }

  // Incluindo o job na fila
  add(queue, job) {
    return this.queues[queue].bee.createJob(job).save();
  }

  // Toda vez que tiver um novo job, será processado em background
  processQueue() {
    jobs.forEach(job => {
      const { bee, handle } = this.queues[job.key];

      // Ficará "ouvindo" o evento failed
      bee.on('failed', this.handleFailure).process(handle);
    });
  }

  handleFailure(job, err) {
    console.log(`Queue ${job.queue.name}: FAILED`, err);
  }
}

export default new Queue();
