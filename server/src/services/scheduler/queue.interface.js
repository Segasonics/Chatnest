export class QueueInterface {
  async enqueue(_type, _runAt, _payload) {
    throw new Error('enqueue not implemented');
  }

  async cancel(_jobId) {
    throw new Error('cancel not implemented');
  }

  async processDueJobs() {
    throw new Error('processDueJobs not implemented');
  }
}
