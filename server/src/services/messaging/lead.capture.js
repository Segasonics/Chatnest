import { Lead } from '../../models/Lead.js';

export async function handleLeadCapture(conversation, inboundText, workspaceId) {
  if (!conversation.state?.captureMode || conversation.state.captureMode === 'none') {
    return { consumed: false };
  }

  const lead = await Lead.findOneAndUpdate(
    { workspaceId, customerNumber: conversation.customerNumber },
    {
      $setOnInsert: {
        status: 'new'
      }
    },
    { upsert: true, new: true }
  );

  const mode = conversation.state.captureMode;

  if (mode === 'lead_name') {
    lead.name = inboundText.trim();
    conversation.state.captureMode = 'lead_interest';
    await lead.save();
    await conversation.save();
    return {
      consumed: true,
      response: 'Great, what service are you interested in?'
    };
  }

  if (mode === 'lead_interest') {
    lead.interest = inboundText.trim();
    conversation.state.captureMode = 'lead_time';
    lead.status = 'qualified';
    await lead.save();
    await conversation.save();
    return {
      consumed: true,
      response: 'Thanks. What is your preferred time?'
    };
  }

  if (mode === 'lead_time') {
    lead.preferredTime = inboundText.trim();
    conversation.state.captureMode = 'none';
    await lead.save();
    await conversation.save();
    return {
      consumed: true,
      response: 'Perfect. Our team will contact you shortly to confirm.'
    };
  }

  return { consumed: false };
}
