import { Flow } from '../../models/Flow.js';

function findNode(flow, nodeId) {
  return flow.nodes.find((node) => node.id === nodeId);
}

export async function runFlowStep({ workspaceId, conversation, inboundText }) {
  const activeFlowId = conversation.state?.activeFlowId;
  if (!activeFlowId) {
    return { consumed: false };
  }

  const flow = await Flow.findOne({ _id: activeFlowId, workspaceId, isActive: true });
  if (!flow) {
    conversation.state.activeFlowId = undefined;
    conversation.state.currentNodeId = undefined;
    await conversation.save();
    return { consumed: false };
  }

  const currentNode = findNode(flow, conversation.state.currentNodeId || flow.startNodeId || flow.nodes[0]?.id);
  if (!currentNode) return { consumed: false };

  if (currentNode.type === 'menu') {
    const input = inboundText.trim();
    const option = currentNode.options.find((opt) => opt.key === input || opt.label.toLowerCase() === input.toLowerCase());

    if (!option) {
      return {
        consumed: true,
        response: `Please choose one of: ${currentNode.options
          .map((opt) => `${opt.key} (${opt.label})`)
          .join(', ')}`
      };
    }

    const nextNode = findNode(flow, option.nextId);
    conversation.state.currentNodeId = nextNode?.id;
    await conversation.save();

    if (!nextNode) {
      return { consumed: true, response: 'Flow ended.' };
    }

    return { consumed: true, response: nextNode.prompt || 'Done.' };
  }

  if (currentNode.type === 'message') {
    const nextId = currentNode.config?.nextId;
    if (nextId) conversation.state.currentNodeId = nextId;
    await conversation.save();
    return { consumed: true, response: currentNode.prompt || '' };
  }

  if (currentNode.type === 'capture') {
    conversation.state.captureMode = currentNode.config?.mode || 'lead_name';
    conversation.state.currentNodeId = currentNode.config?.nextId;
    await conversation.save();
    return { consumed: true, response: currentNode.prompt || 'Please share details.' };
  }

  if (currentNode.type === 'appointment') {
    conversation.state.appointmentPending = true;
    await conversation.save();
    return {
      consumed: true,
      response: currentNode.prompt || 'Please provide appointment time in ISO format.'
    };
  }

  if (currentNode.type === 'end') {
    conversation.state.activeFlowId = undefined;
    conversation.state.currentNodeId = undefined;
    await conversation.save();
    return { consumed: true, response: currentNode.prompt || 'Thank you.' };
  }

  return { consumed: false };
}

export async function activateDefaultFlow(workspaceId, conversation) {
  const flow = await Flow.findOne({ workspaceId, isActive: true }).sort({ createdAt: -1 });
  if (!flow) return null;

  conversation.state.activeFlowId = flow._id;
  conversation.state.currentNodeId = flow.startNodeId || flow.nodes[0]?.id;
  await conversation.save();

  const node = flow.nodes.find((item) => item.id === conversation.state.currentNodeId);
  return node?.prompt || null;
}
