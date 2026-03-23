import { Message } from '../../models/Message.js';
import { Lead } from '../../models/Lead.js';
import { Rule } from '../../models/Rule.js';

export async function getWorkspaceAnalytics(workspaceId) {
  const since = new Date();
  since.setDate(since.getDate() - 13);
  since.setHours(0, 0, 0, 0);

  const [messageVolume, inboundCount, outboundCount, leadCount, bookedCount, topTriggers, messageSeries, leadSeries] =
    await Promise.all([
      Message.countDocuments({ workspaceId }),
      Message.countDocuments({ workspaceId, direction: 'in' }),
      Message.countDocuments({ workspaceId, direction: 'out' }),
      Lead.countDocuments({ workspaceId }),
      Lead.countDocuments({ workspaceId, status: 'booked' }),
      Message.aggregate([
        { $match: { workspaceId, direction: 'out', triggerMatched: { $exists: true, $ne: null } } },
        { $group: { _id: '$triggerMatched', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),
      Message.aggregate([
        { $match: { workspaceId, createdAt: { $gte: since } } },
        {
          $group: {
            _id: {
              day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              direction: '$direction'
            },
            count: { $sum: 1 }
          }
        }
      ]),
      Lead.aggregate([
        { $match: { workspaceId, createdAt: { $gte: since } } },
        {
          $group: {
            _id: {
              day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              status: '$status'
            },
            count: { $sum: 1 }
          }
        }
      ])
    ]);

  const replyRate = inboundCount > 0 ? Number((outboundCount / inboundCount).toFixed(2)) : 0;
  const conversionRate = leadCount > 0 ? Number((bookedCount / leadCount).toFixed(2)) : 0;

  const dayMap = new Map();
  for (let i = 0; i < 14; i += 1) {
    const day = new Date(since);
    day.setDate(since.getDate() + i);
    const key = day.toISOString().slice(0, 10);
    dayMap.set(key, { date: key, inbound: 0, outbound: 0, leads: 0, booked: 0 });
  }

  messageSeries.forEach((row) => {
    const key = row._id?.day;
    if (!dayMap.has(key)) return;
    const entry = dayMap.get(key);
    if (row._id.direction === 'in') entry.inbound += row.count;
    if (row._id.direction === 'out') entry.outbound += row.count;
  });

  leadSeries.forEach((row) => {
    const key = row._id?.day;
    if (!dayMap.has(key)) return;
    const entry = dayMap.get(key);
    entry.leads += row.count;
    if (row._id.status === 'booked') entry.booked += row.count;
  });

  const daily = Array.from(dayMap.values());

  return {
    messageVolume,
    inboundCount,
    outboundCount,
    replyRate,
    leadCount,
    bookedCount,
    conversionRate,
    topTriggers,
    daily,
    ruleCount: await Rule.countDocuments({ workspaceId, isActive: true })
  };
}
