import { Workspace } from '../../models/Workspace.js';
import { User } from '../../models/User.js';
import { ApiError } from '../../utils/apiError.js';

export async function consumeWorkspaceQuota(workspaceId, amount = 1) {
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) throw new ApiError(404, 'NOT_FOUND', 'Workspace not found');

  const owner = await User.findById(workspace.ownerId);
  if (!owner) throw new ApiError(404, 'NOT_FOUND', 'Workspace owner not found');

  if (owner.messageCreditsRemaining < amount) {
    throw new ApiError(402, 'QUOTA_EXCEEDED', 'Monthly message quota exceeded');
  }

  owner.messageCreditsRemaining -= amount;
  await owner.save();
  return owner.messageCreditsRemaining;
}
