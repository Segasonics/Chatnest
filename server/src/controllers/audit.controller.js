import { AuditLog } from '../models/AuditLog.js';
import { parsePagination } from '../utils/pagination.js';

export async function getAuditLogs(req, res) {
  const { page, limit, skip } = parsePagination(req.query);
  const query = { workspaceId: req.workspace._id };

  const [items, total] = await Promise.all([
    AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('actorUserId', 'name email')
      .lean(),
    AuditLog.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: {
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
}
