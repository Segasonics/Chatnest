import { QueueInterface } from './queue.interface.js';
import { ScheduledJob } from '../../models/ScheduledJob.js';
import { Workspace } from '../../models/Workspace.js';
import { getProvider } from '../messaging/provider.factory.js';

class InMemoryQueueService extends QueueInterface {
  constructor() {
    super();
    this.timer = null;
  }

  start() {
    if (this.timer) return;
    this.timer = setInterval(() => {
      this.processDueJobs().catch((error) => console.error('Queue process error', error));
    }, 10000);
  }

  stop() {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  }

  async enqueue(type, runAt, payload) {
    const job = await ScheduledJob.create({
      workspaceId: payload.workspaceId,
      type,
      runAt,
      payload,
      status: 'pending'
    });
    return job;
  }

  async cancel(jobId) {
    await ScheduledJob.findByIdAndUpdate(jobId, { $set: { status: 'cancelled' } });
  }

  async processDueJobs() {
    const now = new Date();
    const dueJobs = await ScheduledJob.find({
      status: 'pending',
      runAt: { $lte: now }
    }).limit(50);

    for (const job of dueJobs) {
      try {
        job.status = 'running';
        await job.save();

        if (job.type === 'reminder') {
          const workspace = await Workspace.findById(job.workspaceId);
          if (workspace) {
            const provider = getProvider(workspace);
            await provider.sendMessage({
              workspace,
              to: job.payload.to,
              body: job.payload.body,
              conversationId: job.payload.conversationId
            });
          }
        }

        job.status = 'done';
      } catch (error) {
        job.status = 'failed';
        job.payload = {
          ...job.payload,
          error: error.message
        };
      }
      await job.save();
    }
  }
}

export const queueService = new InMemoryQueueService();
