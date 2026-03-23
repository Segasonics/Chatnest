import { Appointment } from '../../models/Appointment.js';
import { Lead } from '../../models/Lead.js';
import { queueService } from '../scheduler/inMemoryQueue.service.js';

function parseDate(input) {
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

export async function bookAppointment({ workspaceId, conversation, input }) {
  const appointmentAt = parseDate(input);
  if (!appointmentAt) {
    return {
      success: false,
      message: 'Please send appointment time in ISO format, e.g. 2026-03-12T15:00:00Z'
    };
  }

  const lead = await Lead.findOne({ workspaceId, customerNumber: conversation.customerNumber });

  const appointment = await Appointment.create({
    workspaceId,
    conversationId: conversation._id,
    customerNumber: conversation.customerNumber,
    customerName: lead?.name,
    serviceInterest: lead?.interest,
    appointmentAt
  });

  if (lead) {
    lead.status = 'booked';
    await lead.save();
  }

  const reminder24h = new Date(appointmentAt.getTime() - 24 * 60 * 60 * 1000);
  const reminder1h = new Date(appointmentAt.getTime() - 60 * 60 * 1000);

  await queueService.enqueue('reminder', reminder24h, {
    workspaceId,
    conversationId: conversation._id,
    to: conversation.customerNumber,
    body: `Reminder: your appointment is scheduled at ${appointmentAt.toISOString()}`
  });

  await queueService.enqueue('reminder', reminder1h, {
    workspaceId,
    conversationId: conversation._id,
    to: conversation.customerNumber,
    body: `Upcoming appointment in 1 hour: ${appointmentAt.toISOString()}`
  });

  return {
    success: true,
    appointment
  };
}
