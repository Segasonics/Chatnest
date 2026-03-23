import { Lead } from '../models/Lead.js';
import { ApiError } from '../utils/apiError.js';

export async function listLeads(req, res) {
  const leads = await Lead.find({ workspaceId: req.workspace._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: leads });
}

export async function updateLead(req, res) {
  const lead = await Lead.findOneAndUpdate(
    { _id: req.params.leadId, workspaceId: req.workspace._id },
    { $set: req.body },
    { new: true }
  );

  if (!lead) throw new ApiError(404, 'NOT_FOUND', 'Lead not found');
  res.json({ success: true, data: lead });
}
