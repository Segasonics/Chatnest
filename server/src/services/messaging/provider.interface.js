export class MessagingProvider {
  async sendMessage(_payload) {
    throw new Error('sendMessage must be implemented');
  }

  parseWebhook(_req) {
    throw new Error('parseWebhook must be implemented');
  }

  verifyWebhook(_req) {
    throw new Error('verifyWebhook must be implemented');
  }
}
