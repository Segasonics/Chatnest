import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import WorkspaceShell from '../components/layout/WorkspaceShell';
import QuotaUsageCard from '../components/billing/QuotaUsageCard';
import UploadDropzone from '../components/uploads/UploadDropzone';
import KnowledgePanel from '../components/knowledge/KnowledgePanel';
import { useGetConversationsQuery } from '../features/inbox/inboxApi';
import {
  useConnectMetaProviderMutation,
  useDisconnectMetaProviderMutation,
  useGetMetaSignupConfigQuery,
  useGetMetaWebhookStatusQuery,
  useGetWorkspaceQuery,
  useUploadAssetMutation
} from '../features/workspaces/workspaceApi';
import { useDeleteAssetMutation, useGetAssetsQuery } from '../features/assets/assetsApi';
import { useGetBillingMeQuery } from '../features/billing/billingApi';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { Link } from 'react-router-dom';
import { formatDate } from '../utils/format';

function safeParseJson(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function extractEmbeddedSignupPayload(raw) {
  const parsed = typeof raw === 'string' ? safeParseJson(raw) : raw;
  if (!parsed || typeof parsed !== 'object') return null;

  const envelope = parsed.data && typeof parsed.data === 'object' ? parsed.data : parsed;
  const phoneNumberId =
    envelope.phone_number_id || envelope.phoneNumberId || envelope.phone_number?.id;
  const businessAccountId =
    envelope.waba_id || envelope.business_account_id || envelope.businessAccountId;
  const phoneNumber =
    envelope.display_phone_number || envelope.phone_number || envelope.displayPhoneNumber;

  return {
    event: parsed.event || parsed.type || envelope.event,
    phoneNumberId: phoneNumberId ? String(phoneNumberId) : '',
    businessAccountId: businessAccountId ? String(businessAccountId) : '',
    phoneNumber: phoneNumber ? String(phoneNumber) : ''
  };
}

function loadFacebookSdk(appId, version = 'v21.0') {
  return new Promise((resolve, reject) => {
    if (!appId) {
      reject(new Error('META_APP_ID missing'));
      return;
    }

    const initSdk = () => {
      if (!window.FB) {
        reject(new Error('Facebook SDK not available'));
        return;
      }
      window.FB.init({
        appId,
        cookie: true,
        xfbml: true,
        version
      });
      resolve(window.FB);
    };

    if (window.FB) {
      initSdk();
      return;
    }

    window.fbAsyncInit = initSdk;
    const existing = document.getElementById('facebook-jssdk');
    if (existing) return;

    const script = document.createElement('script');
    script.id = 'facebook-jssdk';
    script.async = true;
    script.defer = true;
    // Ensure Cloudflare Rocket Loader does not delay/alter the FB SDK.
    script.setAttribute('data-cfasync', 'false');
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.onerror = () => reject(new Error('Failed to load Facebook SDK'));
    document.body.appendChild(script);
  });
}

function formatBytes(value) {
  const size = Number(value || 0);
  if (!size) return '0 B';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function WorkspaceOverviewPage() {
  const { workspaceId } = useParams();
  const { data } = useGetWorkspaceQuery(workspaceId);
  const { data: conversationsData } = useGetConversationsQuery(workspaceId, { skip: !workspaceId });
  const { data: metaConfigData } = useGetMetaSignupConfigQuery(workspaceId);
  const { data: webhookStatusData, isFetching: webhookChecking } =
    useGetMetaWebhookStatusQuery(workspaceId);
  const { data: billingData } = useGetBillingMeQuery();
  const [uploadAsset] = useUploadAssetMutation();
  const { data: assetsData } = useGetAssetsQuery(workspaceId, { skip: !workspaceId });
  const [deleteAsset, { isLoading: deletingAsset }] = useDeleteAssetMutation();
  const [connectMetaProvider, { isLoading: connectingMeta }] = useConnectMetaProviderMutation();
  const [disconnectMetaProvider, { isLoading: disconnectingMeta }] =
    useDisconnectMetaProviderMutation();
  const [metaForm, setMetaForm] = useState({
    accessToken: '',
    phoneNumberId: '',
    businessAccountId: '',
    phoneNumber: ''
  });
  const [embeddedMeta, setEmbeddedMeta] = useState({
    phoneNumberId: '',
    businessAccountId: '',
    phoneNumber: ''
  });
  const [pendingCode, setPendingCode] = useState('');
  const [pendingAccessToken, setPendingAccessToken] = useState('');
  const [embeddedStatus, setEmbeddedStatus] = useState('');
  const [embeddedDebug, setEmbeddedDebug] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingConnect, setPendingConnect] = useState(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const autoConnectRef = useRef(false);

  const workspace = data?.data;
  const billing = billingData?.data;
  const metaConfig = metaConfigData?.data;
  const webhookStatus = webhookStatusData?.data;
  const conversations = conversationsData?.data?.items || [];
  const assets = assetsData?.data || [];
  const isMetaConnected =
    workspace?.whatsappProvider === 'meta' &&
    (workspace?.providerPhoneNumberId || workspace?.phoneNumber);

  useEffect(() => {
    const handler = (event) => {
      if (
        event.origin !== 'https://www.facebook.com' &&
        event.origin !== 'https://web.facebook.com'
      ) {
        return;
      }

      const payload = extractEmbeddedSignupPayload(event.data);
      if (!payload) return;

      if (payload.event === 'CANCEL') {
        setEmbeddedStatus('Embedded signup cancelled');
        return;
      }

      if (!payload.phoneNumberId && !payload.businessAccountId && !payload.phoneNumber) return;

      setEmbeddedMeta((prev) => ({
        phoneNumberId: payload.phoneNumberId || prev.phoneNumberId,
        businessAccountId: payload.businessAccountId || prev.businessAccountId,
        phoneNumber: payload.phoneNumber || prev.phoneNumber
      }));
      setEmbeddedDebug({
        receivedAt: new Date().toISOString(),
        origin: event.origin,
        raw: typeof event.data === 'string' ? event.data : JSON.stringify(event.data, null, 2),
        payload
      });
      setMetaForm((prev) => ({
        ...prev,
        phoneNumberId: payload.phoneNumberId || prev.phoneNumberId,
        businessAccountId: payload.businessAccountId || prev.businessAccountId,
        phoneNumber: payload.phoneNumber || prev.phoneNumber
      }));
      setEmbeddedStatus('Embedded signup data received. Completing connection...');
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  useEffect(() => {
    const token = pendingCode || pendingAccessToken;
    if (!token || !embeddedMeta.phoneNumberId || autoConnectRef.current) return;

    autoConnectRef.current = true;
    const payload = {
      id: workspaceId,
      phoneNumberId: embeddedMeta.phoneNumberId,
      businessAccountId: embeddedMeta.businessAccountId || undefined,
      phoneNumber: embeddedMeta.phoneNumber || undefined
    };
    if (pendingCode) payload.code = pendingCode;
    if (!pendingCode && pendingAccessToken) payload.accessToken = pendingAccessToken;

    if (isMetaConnected) {
      setPendingConnect(payload);
      setConfirmOpen(true);
      setEmbeddedStatus('Already connected. Disconnect to continue.');
      setPendingCode('');
      setPendingAccessToken('');
      autoConnectRef.current = false;
      return;
    }

    connectMetaProvider(payload)
      .unwrap()
      .then(() => {
        toast.success('Meta provider connected via embedded signup');
        setEmbeddedStatus('Connected');
        setMetaForm({ accessToken: '', phoneNumberId: '', businessAccountId: '', phoneNumber: '' });
        setEmbeddedMeta({ phoneNumberId: '', businessAccountId: '', phoneNumber: '' });
      })
      .catch((error) => {
        toast.error(error?.data?.message || 'Meta connect failed');
        setEmbeddedStatus('Connect failed. Try manual connect.');
      })
      .finally(() => {
        setPendingCode('');
        setPendingAccessToken('');
        autoConnectRef.current = false;
      });
  }, [
    connectMetaProvider,
    embeddedMeta.businessAccountId,
    embeddedMeta.phoneNumber,
    embeddedMeta.phoneNumberId,
    isMetaConnected,
    pendingAccessToken,
    pendingCode,
    workspaceId
  ]);

  const startEmbeddedSignup = async () => {
    try {
      if (!metaConfig?.appId || !metaConfig?.configId) {
        toast.error('Missing META_APP_ID or META_CONFIG_ID in server config');
        return;
      }

      setEmbeddedStatus('Opening Meta Embedded Signup...');
      const fb = await loadFacebookSdk(metaConfig.appId, metaConfig.apiVersion || 'v21.0');

      fb.login(
        (response) => {
          console.log('Embedded signup: FB.login response', response);
          const code = response?.authResponse?.code;
          const accessToken = response?.authResponse?.accessToken;

          console.log(code);

          if (code) {
            setPendingCode(code);
            setEmbeddedStatus('Authorization code received. Waiting for phone info...');
            return;
          }

          if (accessToken) {
            setPendingAccessToken(accessToken);
            setEmbeddedStatus('Access token received. Waiting for phone info...');
            return;
          }

          setEmbeddedStatus('Embedded signup did not return code/token');
          toast.error('Embedded signup was not completed');
        },
        {
          // Trigger WhatsApp Embedded Signup flow after FB auth.
          // If the popup never appears, check Meta app domain settings and config_id.
          config_id: metaConfig.configId,
          response_type: 'code',
          override_default_response_type: true,
          extras: { setup: {}, config_id: metaConfig.configId, sessionInfoVersion: 3 },
          scope: 'business_management,whatsapp_business_management,whatsapp_business_messaging'
        }
      );
    } catch (error) {
      toast.error(error.message || 'Could not start embedded signup');
      setEmbeddedStatus('Failed to initialize Embedded Signup');
    }
  };

  const connectWithGuard = async (payload) => {
    if (isMetaConnected) {
      setPendingConnect(payload);
      setConfirmOpen(true);
      return;
    }
    try {
      await connectMetaProvider(payload).unwrap();
      toast.success('Meta provider connected');
      setMetaForm({ accessToken: '', phoneNumberId: '', businessAccountId: '', phoneNumber: '' });
    } catch (error) {
      toast.error(error?.data?.message || 'Meta connect failed');
    }
  };

  return (
    <WorkspaceShell workspaceId={workspaceId} title={workspace?.name || 'Workspace'}>
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <QuotaUsageCard plan={billing?.plan} remaining={billing?.messageCreditsRemaining} />
          <div className="glass-panel rounded-2xl p-4">
            <p className="text-sm text-slate-300">Connected Number</p>
            <h3 className="mt-2 text-xl text-white">
              {workspace?.phoneNumber || 'Not connected yet'}
            </h3>
            <p className="mt-1 text-sm text-slate-400">Provider: {workspace?.whatsappProvider}</p>
            <div className="mt-4 rounded-xl border border-slate-700 bg-slate-900/40 p-3">
              <p className="text-sm font-semibold text-slate-200">Connect Meta Cloud API</p>
              <p className="mt-1 text-xs text-slate-400">
                Use Embedded Signup for per-business onboarding, or manual token input as fallback.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button className="text-xs" disabled={connectingMeta} onClick={startEmbeddedSignup}>
                  Start Embedded Signup
                </Button>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                {webhookChecking ? (
                  <span className="rounded-full border border-slate-600/70 bg-slate-900/60 px-2 py-1 text-slate-300">
                    Checking webhook...
                  </span>
                ) : webhookStatus?.configured ? (
                  <span
                    className={`rounded-full border px-2 py-1 ${
                      webhookStatus?.reachable
                        ? 'border-emerald-300/50 bg-emerald-500/10 text-emerald-200'
                        : 'border-amber-300/50 bg-amber-500/10 text-amber-200'
                    }`}
                  >
                    {webhookStatus?.reachable ? 'Webhook verified' : 'Webhook not verified'}
                  </span>
                ) : (
                  <span className="rounded-full border border-slate-600/70 bg-slate-900/60 px-2 py-1 text-slate-300">
                    Webhook not configured
                  </span>
                )}
              </div>
              {embeddedStatus ? (
                <p className="mt-2 text-[11px] text-emerald-300">Status: {embeddedStatus}</p>
              ) : null}
              {embeddedDebug ? (
                <div className="mt-3 rounded-xl border border-slate-700 bg-slate-900/60 p-3 text-[11px] text-slate-200">
                  <p className="text-slate-400">Embedded Signup Debug</p>
                  <p className="mt-1 text-slate-400">Origin: {embeddedDebug.origin}</p>
                  <p className="text-slate-400">Received: {embeddedDebug.receivedAt}</p>
                  <pre className="mt-2 whitespace-pre-wrap text-[10px] text-slate-300">
                    {embeddedDebug.raw}
                  </pre>
                </div>
              ) : null}
              <div className="mt-3 grid gap-2">
                <input
                  value={metaForm.accessToken}
                  onChange={(e) => setMetaForm((s) => ({ ...s, accessToken: e.target.value }))}
                  className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs"
                  placeholder="Meta access token"
                />
                <input
                  value={metaForm.phoneNumberId}
                  onChange={(e) => setMetaForm((s) => ({ ...s, phoneNumberId: e.target.value }))}
                  className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs"
                  placeholder="Phone Number ID"
                />
                <input
                  value={metaForm.businessAccountId}
                  onChange={(e) =>
                    setMetaForm((s) => ({ ...s, businessAccountId: e.target.value }))
                  }
                  className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs"
                  placeholder="Business Account ID (optional)"
                />
                <input
                  value={metaForm.phoneNumber}
                  onChange={(e) => setMetaForm((s) => ({ ...s, phoneNumber: e.target.value }))}
                  className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs"
                  placeholder="Display phone number (optional)"
                />
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                Manual connect fallback (token + ids) if popup is blocked or incomplete.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  className="text-xs"
                  disabled={connectingMeta}
                  onClick={async () => {
                    await connectWithGuard({ id: workspaceId, ...metaForm });
                  }}
                >
                  {connectingMeta ? 'Connecting...' : 'Connect Meta'}
                </Button>
                {isMetaConnected ? (
                  <Button
                    variant="ghost"
                    className="text-xs"
                    disabled={disconnectingMeta}
                    onClick={async () => {
                      try {
                        await disconnectMetaProvider(workspaceId).unwrap();
                        toast.success('Meta provider disconnected');
                      } catch (error) {
                        toast.error(error?.data?.message || 'Disconnect failed');
                      }
                    }}
                  >
                    Disconnect
                  </Button>
                ) : null}
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                Webhook callback: {metaConfig?.callbackUrl || 'Set PUBLIC_API_URL in server env'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="glass-panel rounded-2xl p-4">
            <p className="text-sm text-slate-300">Quick actions</p>
            <div className="mt-3 grid gap-2">
              <Link
                to={`/w/${workspaceId}/inbox`}
                className="rounded-xl border border-[#2a3942] bg-[#121d24] px-3 py-2 text-sm text-white transition hover:border-emerald-300"
              >
                Open Inbox
              </Link>
              <Link
                to={`/w/${workspaceId}/rules`}
                className="rounded-xl border border-[#2a3942] bg-[#121d24] px-3 py-2 text-sm text-white transition hover:border-emerald-300"
              >
                Manage Rules
              </Link>
              <Link
                to={`/w/${workspaceId}/flows`}
                className="rounded-xl border border-[#2a3942] bg-[#121d24] px-3 py-2 text-sm text-white transition hover:border-emerald-300"
              >
                Edit Flows
              </Link>
            </div>
          </div>
          <div className="glass-panel rounded-2xl p-4 lg:col-span-2">
            <p className="text-sm text-slate-300">Recent conversations</p>
            <div className="mt-3 space-y-2">
              {!conversations.length ? (
                <p className="text-sm text-slate-500">No conversations yet.</p>
              ) : (
                conversations.slice(0, 5).map((item) => (
                  <div
                    key={item._id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#2a3942] bg-[#121d24] px-3 py-2 text-sm text-white"
                  >
                    <div>
                      <p className="font-semibold">{item.customerNumber}</p>
                      <p className="text-xs text-slate-400">{formatDate(item.lastMessageAt)}</p>
                    </div>
                    <Link to={`/w/${workspaceId}/inbox`} className="text-xs text-emerald-300">
                      View
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <UploadDropzone
          onUpload={async (file) => {
            try {
              await uploadAsset({ id: workspaceId, file }).unwrap();
              toast.success('Asset uploaded');
            } catch (error) {
              toast.error(error?.data?.message || 'Upload failed');
            }
          }}
        />

        <div className="glass-panel rounded-2xl p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-slate-300">Uploaded assets</p>
            <span className="text-xs text-slate-500">{assets.length} files</span>
          </div>
          <div className="mt-3 space-y-2">
            {!assets.length ? (
              <p className="text-sm text-slate-500">No assets yet. Upload a PNG/JPG/PDF above.</p>
            ) : (
              assets.slice(0, 6).map((asset) => (
                <div
                  key={asset._id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#2a3942] bg-[#121d24] px-3 py-2 text-sm text-white"
                >
                  <div>
                    <p className="font-semibold">{asset.fileName}</p>
                    <p className="text-xs text-slate-400">
                      {asset.type} · {formatBytes(asset.size)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={asset.originalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-emerald-300"
                    >
                      Open
                    </a>
                    <button
                      className="text-xs text-rose-300 disabled:opacity-50"
                      disabled={deletingAsset}
                      onClick={async () => {
                        if (!window.confirm(`Delete ${asset.fileName}?`)) return;
                        try {
                          await deleteAsset({ workspaceId, assetId: asset._id }).unwrap();
                          toast.success('Asset deleted');
                        } catch (error) {
                          toast.error(error?.data?.message || 'Delete failed');
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <KnowledgePanel workspaceId={workspaceId} />
      </div>

      <Modal
        open={confirmOpen}
        title="Disconnect current number?"
        onClose={() => {
          if (confirmBusy) return;
          setConfirmOpen(false);
          setPendingConnect(null);
        }}
      >
        <p className="text-sm text-slate-300">
          This workspace already has a connected WhatsApp number. Disconnect it first to connect a
          new number.
        </p>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <Button
            variant="ghost"
            className="text-xs"
            disabled={confirmBusy}
            onClick={() => {
              setConfirmOpen(false);
              setPendingConnect(null);
            }}
          >
            Cancel
          </Button>
          <Button
            className="text-xs"
            disabled={confirmBusy}
            onClick={async () => {
              if (!pendingConnect) return;
              setConfirmBusy(true);
              try {
                await disconnectMetaProvider(workspaceId).unwrap();
                await connectMetaProvider(pendingConnect).unwrap();
                toast.success('Number replaced successfully');
                setMetaForm({
                  accessToken: '',
                  phoneNumberId: '',
                  businessAccountId: '',
                  phoneNumber: ''
                });
                setEmbeddedMeta({ phoneNumberId: '', businessAccountId: '', phoneNumber: '' });
                setEmbeddedStatus('Connected');
              } catch (error) {
                toast.error(error?.data?.message || 'Unable to replace number');
              } finally {
                setConfirmBusy(false);
                setConfirmOpen(false);
                setPendingConnect(null);
              }
            }}
          >
            {confirmBusy ? 'Working...' : 'Disconnect & Continue'}
          </Button>
        </div>
      </Modal>
    </WorkspaceShell>
  );
}

export default WorkspaceOverviewPage;
