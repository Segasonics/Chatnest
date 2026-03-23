import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import WorkspaceShell from '../components/layout/WorkspaceShell';
import InboxConversationList from '../components/inbox/InboxConversationList';
import ChatThread from '../components/inbox/ChatThread';
import { useGetConversationByIdQuery, useGetConversationsQuery, useSendMessageMutation } from '../features/inbox/inboxApi';

function InboxPage() {
  const { workspaceId } = useParams();
  const [activeId, setActiveId] = useState(null);
  const { data: conversationsData } = useGetConversationsQuery(workspaceId);
  const conversations = conversationsData?.data?.items || [];

  useEffect(() => {
    if (!activeId && conversations.length) setActiveId(conversations[0]._id);
  }, [activeId, conversations]);

  const activeConversation = useMemo(
    () => conversations.find((item) => item._id === activeId),
    [conversations, activeId]
  );

  const { data: conversationData } = useGetConversationByIdQuery(
    { workspaceId, conversationId: activeId },
    { skip: !activeId }
  );

  const [sendMessage] = useSendMessageMutation();

  const onSend = async ({ body = '', mediaUrl, to } = {}) => {
    const targetNumber = to || activeConversation?.customerNumber;
    if (!targetNumber) {
      toast.error('Enter a customer number to start a chat.');
      return;
    }
    try {
      const result = await sendMessage({
        workspaceId,
        to: targetNumber,
        body,
        mediaUrl,
        conversationId: activeId
      }).unwrap();
      if (result?.data?.conversationId) {
        setActiveId(result.data.conversationId);
      }
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to send message');
    }
  };

  return (
    <WorkspaceShell workspaceId={workspaceId} title="Live Inbox">
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <InboxConversationList conversations={conversations} activeId={activeId} onSelect={setActiveId} />
        <ChatThread conversationData={conversationData?.data} onSend={onSend} workspaceId={workspaceId} />
      </div>
    </WorkspaceShell>
  );
}

export default InboxPage;
