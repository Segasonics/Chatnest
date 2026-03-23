import { useMemo, useState } from 'react';
import { formatDate } from '../../utils/format';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { useGetAssetsQuery } from '../../features/assets/assetsApi';
import { useUploadAssetMutation } from '../../features/workspaces/workspaceApi';
import toast from 'react-hot-toast';

function isImageUrl(url = '') {
  return /\.(png|jpe?g|gif|webp)$/i.test(url);
}

function ChatThread({ conversationData, onSend, workspaceId }) {
  const [text, setText] = useState('');
  const [showAttachments, setShowAttachments] = useState(false);
  const [caption, setCaption] = useState('');
  const [toNumber, setToNumber] = useState('');
  const { data: assetsData } = useGetAssetsQuery(workspaceId, { skip: !workspaceId });
  const [uploadAsset, { isLoading: uploading }] = useUploadAssetMutation();
  const assets = useMemo(() => assetsData?.data || [], [assetsData]);
  const isNewChat = !conversationData?.conversation;

  const send = () => {
    if (!text.trim()) return;
    if (isNewChat && !toNumber.trim()) {
      toast.error('Enter a customer number to start a chat.');
      return;
    }
    onSend({ body: text, to: isNewChat ? toNumber.trim() : undefined });
    setText('');
  };

  return (
    <div className="glass-panel flex h-[70vh] flex-col rounded-2xl p-3">
      <div className="mb-3 border-b border-[#2a3942] pb-3 text-sm text-[#d1d7db]">
        {conversationData?.conversation?.customerNumber || 'Start a new chat'}
      </div>
      {isNewChat ? (
        <div className="mb-3 rounded-xl border border-[#2a3942] bg-[#121d24] p-3">
          <label className="text-xs text-slate-400">Customer WhatsApp number</label>
          <input
            value={toNumber}
            onChange={(e) => setToNumber(e.target.value)}
            className="mt-2 w-full rounded-xl border border-[#2a3942] bg-[#0f1a20] px-3 py-2 text-sm text-white"
            placeholder="+15551234567"
          />
          <p className="mt-2 text-[11px] text-slate-500">
            Use E.164 format. The first message will create the conversation.
          </p>
        </div>
      ) : null}
      <div className="chat-surface flex-1 space-y-2 overflow-y-auto rounded-xl p-3">
        {(conversationData?.messages || []).length === 0 ? (
          <p className="text-sm text-slate-500">No messages yet.</p>
        ) : (
          (conversationData?.messages || []).map((msg) => (
          <div
            key={msg._id}
            className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
              msg.direction === 'out' ? 'bubble-out ml-auto' : 'bubble-in'
            }`}
          >
            <p>{msg.body || '(media)'}</p>
            {msg.mediaUrl ? (
              <div className="mt-2 space-y-2">
                {isImageUrl(msg.mediaUrl) ? (
                  <img
                    src={msg.mediaUrl}
                    alt="attachment"
                    className="max-h-40 rounded-lg border border-[#2a3942] object-cover"
                  />
                ) : null}
                <a
                  href={msg.mediaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-emerald-200 underline"
                >
                  View attachment
                </a>
              </div>
            ) : null}
            <div className="mt-1 flex items-center justify-between text-[10px] text-[#8fa3ad]">
              <span>{formatDate(msg.createdAt)}</span>
              <span>{msg.direction === 'out' ? 'Sent' : 'Received'}</span>
            </div>
          </div>
          ))
        )}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          className="w-full rounded-xl border border-[#2a3942] bg-[#121d24] px-3 py-2 text-sm"
          placeholder="Type message"
        />
        <Button variant="ghost" onClick={() => setShowAttachments(true)}>
          Attach
        </Button>
        <Button onClick={send}>Send</Button>
      </div>

      <Modal open={showAttachments} title="Send Attachment" onClose={() => setShowAttachments(false)}>
        <div className="space-y-3">
          <label className="text-sm text-slate-300">Caption (optional)</label>
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100"
            placeholder="Add a message with this attachment"
          />
          <div>
            <p className="text-sm text-slate-300">Upload new asset</p>
            <input
              type="file"
              className="mt-2 block w-full text-sm text-slate-300"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const result = await uploadAsset({ id: workspaceId, file }).unwrap();
                  const uploaded = result?.data;
                  if (uploaded?.originalUrl) {
                    if (isNewChat && !toNumber.trim()) {
                      toast.error('Enter a customer number to start a chat.');
                      return;
                    }
                    await onSend({
                      body: caption,
                      mediaUrl: uploaded.originalUrl,
                      to: isNewChat ? toNumber.trim() : undefined
                    });
                    toast.success('Attachment sent');
                    setCaption('');
                    setShowAttachments(false);
                  }
                } catch (error) {
                  toast.error(error?.data?.message || 'Upload failed');
                }
              }}
            />
            {uploading ? <p className="mt-1 text-xs text-slate-400">Uploading...</p> : null}
          </div>
          <div>
            <p className="text-sm text-slate-300">Or select existing asset</p>
            <div className="mt-2 max-h-40 space-y-2 overflow-y-auto">
              {!assets.length ? (
                <p className="text-xs text-slate-500">No assets available.</p>
              ) : (
                assets.map((asset) => (
                  <button
                    key={asset._id}
                    className="flex w-full items-center justify-between rounded-xl border border-[#2a3942] bg-[#121d24] px-3 py-2 text-left text-sm text-white hover:border-emerald-300"
                    onClick={async () => {
                      try {
                        if (isNewChat && !toNumber.trim()) {
                          toast.error('Enter a customer number to start a chat.');
                          return;
                        }
                        await onSend({
                          body: caption,
                          mediaUrl: asset.originalUrl,
                          to: isNewChat ? toNumber.trim() : undefined
                        });
                        toast.success('Attachment sent');
                        setCaption('');
                        setShowAttachments(false);
                      } catch (error) {
                        toast.error(error?.data?.message || 'Failed to send');
                      }
                    }}
                  >
                    <span>{asset.fileName}</span>
                    <span className="text-xs text-slate-400">{asset.type}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ChatThread;

