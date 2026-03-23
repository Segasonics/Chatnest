import { getWorkspaceAnalytics } from '../services/analytics/analytics.service.js';

export async function getAnalytics(req, res) {
  const data = await getWorkspaceAnalytics(req.workspace._id);
  res.json({ success: true, data });
}
