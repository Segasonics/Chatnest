import { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';

const templates = [
  {
    id: 'greeting',
    label: 'Greeting',
    body: 'Hi! Thanks for reaching out to us. How can I help you today?'
  },
  {
    id: 'pricing',
    label: 'Pricing',
    body: 'Our plans start at $49/month. Would you like details on Pro or Team?'
  },
  {
    id: 'hours',
    label: 'Business Hours',
    body: 'We are open Monday–Saturday, 9am–7pm.'
  },
  {
    id: 'location',
    label: 'Location',
    body: 'We are located at 90 Market Street. Let me know if you need directions.'
  },
  {
    id: 'handoff',
    label: 'Human Handoff',
    body: 'I’m looping in a team member now. Please share your name and best time to contact you.'
  }
];

const defaultForm = {
  triggerType: 'keyword',
  triggerValue: '',
  responseType: 'text',
  responseText: '',
  responseAssetId: '',
  templateId: '',
  isActive: true
};

function RuleEditorModal({ open, initialRule, onClose, onSave, loading, assets = [] }) {
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (!initialRule) {
      setForm(defaultForm);
      return;
    }

    setForm({
      ...defaultForm,
      ...initialRule,
      templateId: '',
      responseAssetId:
        typeof initialRule.responseAssetId === 'string'
          ? initialRule.responseAssetId
          : initialRule.responseAssetId?._id || ''
    });
  }, [initialRule]);

  const showText = form.responseType === 'text' || form.responseType === 'template';
  const showAsset = form.responseType === 'asset';
  const selectedAsset = assets.find((asset) => asset._id === form.responseAssetId);
  const isImageAsset = selectedAsset?.type === 'image' || /\.(png|jpe?g|gif|webp)$/i.test(selectedAsset?.originalUrl || '');
  const disableSave =
    loading ||
    !form.triggerValue.trim() ||
    (showText && !form.responseText.trim()) ||
    (showAsset && !form.responseAssetId);

  return (
    <Modal open={open} onClose={onClose} title={initialRule ? 'Edit Rule' : 'Create Rule'}>
      <div className="space-y-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-300">Trigger type</span>
          <select
            value={form.triggerType}
            onChange={(e) => setForm((s) => ({ ...s, triggerType: e.target.value }))}
            className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2"
          >
            <option value="keyword">keyword</option>
            <option value="contains">contains</option>
            <option value="regex">regex</option>
          </select>
        </label>
        <Input
          label="Trigger value"
          value={form.triggerValue}
          onChange={(e) => setForm((s) => ({ ...s, triggerValue: e.target.value }))}
        />
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-300">Response type</span>
          <select
            value={form.responseType}
            onChange={(e) =>
              setForm((s) => ({
                ...s,
                responseType: e.target.value,
                responseAssetId: e.target.value === 'asset' ? s.responseAssetId : '',
                templateId: e.target.value === 'template' ? s.templateId : '',
                responseText: e.target.value === 'asset' ? s.responseText : s.responseText
              }))
            }
            className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2"
          >
            <option value="text">text</option>
            <option value="asset">asset (image/pdf)</option>
            <option value="template">template</option>
          </select>
        </label>
        {form.responseType === 'template' ? (
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-300">Template picker</span>
            <select
              value={form.templateId}
              onChange={(e) => {
                const selected = templates.find((tpl) => tpl.id === e.target.value);
                setForm((s) => ({
                  ...s,
                  templateId: e.target.value,
                  responseText: selected?.body || s.responseText
                }));
              }}
              className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2"
            >
              <option value="">Choose template</option>
              {templates.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {showText ? (
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-300">
              {form.responseType === 'template' ? 'Template text' : 'Response text'}
            </span>
            <textarea
              value={form.responseText}
              onChange={(e) => setForm((s) => ({ ...s, responseText: e.target.value }))}
              className="h-28 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
              placeholder="Type the reply content..."
            />
          </label>
        ) : null}
        {showAsset ? (
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-300">Select asset</span>
            <select
              value={form.responseAssetId}
              onChange={(e) => setForm((s) => ({ ...s, responseAssetId: e.target.value }))}
              className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2"
            >
              <option value="">Choose asset</option>
              {assets.map((asset) => (
                <option key={asset._id} value={asset._id}>
                  {asset.fileName} ({asset.type})
                </option>
              ))}
            </select>
            {!assets.length ? (
              <span className="text-xs text-amber-300">
                No assets uploaded yet. Upload a PNG/JPG/PDF in the workspace overview.
              </span>
            ) : null}
            {selectedAsset ? (
              <div className="mt-2 rounded-xl border border-slate-700 bg-slate-900/50 p-2 text-xs text-slate-200">
                <p className="text-slate-400">Preview</p>
                {isImageAsset ? (
                  <img
                    src={selectedAsset.originalUrl}
                    alt={selectedAsset.fileName}
                    className="mt-2 max-h-32 rounded-lg border border-slate-700 object-cover"
                  />
                ) : (
                  <a
                    href={selectedAsset.originalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-emerald-300 underline"
                  >
                    Open {selectedAsset.fileName}
                  </a>
                )}
              </div>
            ) : null}
          </label>
        ) : null}
        <label className="flex items-center gap-2 text-sm text-slate-200">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm((s) => ({ ...s, isActive: e.target.checked }))}
          />
          Active rule
        </label>
        <Button onClick={() => onSave(form)} disabled={disableSave}>
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </Modal>
  );
}

export default RuleEditorModal;
