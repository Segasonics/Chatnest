import { Rule } from '../../models/Rule.js';
import { Conversation } from '../../models/Conversation.js';
import { Message } from '../../models/Message.js';
import { Asset } from '../../models/Asset.js';
import { getProvider } from './provider.factory.js';
import { runFlowStep, activateDefaultFlow } from './flow.runner.js';
import { handleLeadCapture } from './lead.capture.js';
import { bookAppointment } from './appointment.service.js';
import { consumeWorkspaceQuota } from '../quota/quota.service.js';
import { answerQuestionWithRag } from '../rag/knowledge.service.js';

function normalize(text) {
  return (text || '').trim().toLowerCase();
}

function ruleMatches(rule, incoming) {
  const text = normalize(incoming);
  const trigger = normalize(rule.triggerValue);

  if (rule.triggerType === 'keyword') return text === trigger;
  if (rule.triggerType === 'contains') return text.includes(trigger);

  if (rule.triggerType === 'regex') {
    try {
      const regex = new RegExp(rule.triggerValue, 'i');
      return regex.test(incoming);
    } catch {
      return false;
    }
  }

  return false;
}

export async function processIncomingMessage({ workspace, event }) {
  const conversation = await Conversation.findOneAndUpdate(
    { workspaceId: workspace._id, customerNumber: event.from },
    { $set: { lastMessageAt: new Date(), status: 'open' } },
    { upsert: true, new: true }
  );

  await Message.create({
    workspaceId: workspace._id,
    conversationId: conversation._id,
    direction: 'in',
    body: event.body,
    mediaUrl: event.mediaUrl,
    providerMessageId: event.providerMessageId
  });

  if (conversation.state?.appointmentPending) {
    const booking = await bookAppointment({
      workspaceId: workspace._id,
      conversation,
      input: event.body
    });

    if (booking.success) {
      conversation.state.appointmentPending = false;
      await conversation.save();
      await sendAutomatedReply({
        workspace,
        conversation,
        to: event.from,
        body: `Booked! Appointment confirmed for ${booking.appointment.appointmentAt.toISOString()}`
      });
      return;
    }

    await sendAutomatedReply({
      workspace,
      conversation,
      to: event.from,
      body: booking.message
    });
    return;
  }

  const leadCaptureResult = await handleLeadCapture(conversation, event.body, workspace._id);
  if (leadCaptureResult.consumed) {
    await sendAutomatedReply({
      workspace,
      conversation,
      to: event.from,
      body: leadCaptureResult.response
    });
    return;
  }

  const flowResult = await runFlowStep({
    workspaceId: workspace._id,
    conversation,
    inboundText: event.body
  });

  if (flowResult.consumed && flowResult.response) {
    await sendAutomatedReply({
      workspace,
      conversation,
      to: event.from,
      body: flowResult.response
    });
    return;
  }

  const rules = await Rule.find({ workspaceId: workspace._id, isActive: true }).populate(
    'responseAssetId',
    'originalUrl fileName type'
  );
  const matchedRule = rules.find((rule) => ruleMatches(rule, event.body));

  if (matchedRule) {
    if (matchedRule.responseType === 'asset') {
      let assetUrl = matchedRule.responseAssetId?.originalUrl;
      if (!assetUrl && matchedRule.responseAssetId) {
        const asset = await Asset.findById(matchedRule.responseAssetId);
        assetUrl = asset?.originalUrl;
      }

      if (assetUrl) {
        await sendAutomatedReply({
          workspace,
          conversation,
          to: event.from,
          body: matchedRule.responseText || '',
          mediaUrl: assetUrl,
          triggerMatched: `${matchedRule.triggerType}:${matchedRule.triggerValue}`
        });
        return;
      }
    }

    await sendAutomatedReply({
      workspace,
      conversation,
      to: event.from,
      body: matchedRule.responseText,
      triggerMatched: `${matchedRule.triggerType}:${matchedRule.triggerValue}`
    });
    return;
  }

  const ragResult = await answerQuestionWithRag({
    workspaceId: workspace._id,
    question: event.body
  });

  if (ragResult.answered && ragResult.answer) {
    await sendAutomatedReply({
      workspace,
      conversation,
      to: event.from,
      body: ragResult.answer,
      triggerMatched: 'rag:auto'
    });
    return;
  }

  const startedMessage = await activateDefaultFlow(workspace._id, conversation);
  if (startedMessage) {
    await sendAutomatedReply({
      workspace,
      conversation,
      to: event.from,
      body: startedMessage
    });
  }
}

export async function sendAutomatedReply({ workspace, conversation, to, body, mediaUrl, triggerMatched }) {
  await consumeWorkspaceQuota(workspace._id, 1);

  // Twilio setup quick reference:
  // 1) workspace.whatsappProvider = 'twilio'
  // 2) server/.env -> TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM
  // 3) Twilio Sandbox inbound webhook -> https://<public-url>/api/webhooks/whatsapp/<workspaceId>
  // 4) For local dev, expose backend with ngrok and set TWILIO_WEBHOOK_BASE_URL.
  const provider = getProvider(workspace);
  const result = await provider.sendMessage({
    workspace,
    to,
    body,
    mediaUrl,
    conversationId: conversation._id
  });

  if (triggerMatched) {
    await Message.findOneAndUpdate(
      { providerMessageId: result.providerMessageId },
      { $set: { triggerMatched } }
    );
  }

  return result;
}
