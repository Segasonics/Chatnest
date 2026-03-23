import { nanoid } from 'nanoid';
import { MessagingProvider } from './provider.interface.js';
import { Message } from '../../models/Message.js';
import { Conversation } from '../../models/Conversation.js';

export class MockProvider extends MessagingProvider {
  async sendMessage({ workspace, to, body, mediaUrl, conversationId }) {
    const providerMessageId = `mock_${nanoid(12)}`;

    let convoId = conversationId;
    if (!convoId) {
      const conversation = await Conversation.findOneAndUpdate(
        { workspaceId: workspace._id, customerNumber: to },
        { $set: { lastMessageAt: new Date() } },
        { upsert: true, new: true }
      );
      convoId = conversation._id;
    }

    await Message.create({
      workspaceId: workspace._id,
      conversationId: convoId,
      direction: 'out',
      body,
      mediaUrl,
      providerMessageId
    });

    console.log(`[MockProvider] -> ${to}: ${body}`);
    return { providerMessageId };
  }

  parseWebhook(req) {
    const payload = req.body || {};
    if (Array.isArray(payload.events)) {
      return payload.events.map((event) => ({
        from: event.from,
        body: event.body || '',
        mediaUrl: event.mediaUrl,
        providerMessageId: event.id || `incoming_${nanoid(8)}`,
        receivedAt: event.receivedAt ? new Date(event.receivedAt) : new Date()
      }));
    }

    if (payload.from) {
      return [
        {
          from: payload.from,
          body: payload.body || '',
          mediaUrl: payload.mediaUrl,
          providerMessageId: payload.id || `incoming_${nanoid(8)}`,
          receivedAt: new Date()
        }
      ];
    }

    return [];
  }

  verifyWebhook() {
    return true;
  }
}
