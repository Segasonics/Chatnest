import { useEffect, useMemo, useState } from 'react';
import Button from '../common/Button';

const nodeTypes = ['message', 'menu', 'capture', 'appointment', 'end'];
const captureModes = ['lead_name', 'lead_interest', 'lead_time'];

const formatNodeLabel = (node) => {
  const prompt = node?.prompt?.trim();
  if (!prompt) return `${node.id} — ${node.type}`;
  const short = prompt.length > 28 ? `${prompt.slice(0, 28)}...` : prompt;
  return `${node.id} — ${short}`;
};

function normalizeNode(node, fallbackId = 'start') {
  return {
    id: node?.id || fallbackId,
    type: node?.type || 'message',
    prompt: node?.prompt || '',
    options: Array.isArray(node?.options) ? node.options : [],
    config: node?.config || {}
  };
}

function buildInitialState(flow) {
  const baseNodes =
    flow?.nodes?.length > 0
      ? flow.nodes.map((node, index) => normalizeNode(node, index === 0 ? 'start' : `node_${index}`))
      : [normalizeNode({ id: 'start', type: 'menu', prompt: 'Choose option', options: [] })];

  return {
    name: flow?.name || 'New Flow',
    nodes: baseNodes,
    startNodeId: flow?.startNodeId || baseNodes[0]?.id || 'start',
    isActive: flow?.isActive ?? true
  };
}

function FlowBuilder({ initialFlow, onSave, onDraftChange, loading, saveLabel = 'Save Flow' }) {
  const initialState = useMemo(() => buildInitialState(initialFlow), [initialFlow]);
  const [name, setName] = useState(initialState.name);
  const [nodes, setNodes] = useState(initialState.nodes);
  const [startNodeId, setStartNodeId] = useState(initialState.startNodeId);
  const [isActive, setIsActive] = useState(initialState.isActive);

  useEffect(() => {
    setName(initialState.name);
    setNodes(initialState.nodes);
    setStartNodeId(initialState.startNodeId);
    setIsActive(initialState.isActive);
  }, [initialState]);

  useEffect(() => {
    if (!nodes.some((node) => node.id === startNodeId)) {
      setStartNodeId(nodes[0]?.id || 'start');
    }
  }, [nodes, startNodeId]);

  useEffect(() => {
    onDraftChange?.({ name: name.trim() || 'New Flow', nodes, startNodeId, isActive });
  }, [name, nodes, startNodeId, isActive, onDraftChange]);

  const addNode = () => {
    const id = `node_${Date.now()}`;
    setNodes((prev) => [...prev, { id, type: 'message', prompt: '', options: [], config: {} }]);
  };

  const updateNode = (id, patch) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch } : n)));
  };

  const changeNodeType = (id, type) => {
    setNodes((prev) =>
      prev.map((node) => {
        if (node.id !== id) return node;

        const nextConfig = node.config || {};

        if (type === 'menu') {
          return {
            ...node,
            type,
            options: node.options?.length ? node.options : [{ key: '1', label: 'Option 1', nextId: '' }],
            config: {}
          };
        }

        if (type === 'capture') {
          return {
            ...node,
            type,
            options: [],
            config: { mode: nextConfig.mode || 'lead_name', nextId: nextConfig.nextId || '' }
          };
        }

        if (type === 'appointment') {
          return {
            ...node,
            type,
            options: [],
            config: { nextId: nextConfig.nextId || '', sendReminders: nextConfig.sendReminders ?? true }
          };
        }

        if (type === 'message') {
          return {
            ...node,
            type,
            options: [],
            config: { nextId: nextConfig.nextId || '' }
          };
        }

        return { ...node, type, options: [], config: {} };
      })
    );
  };

  const updateNodeConfig = (id, patch) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === id
          ? {
              ...node,
              config: { ...(node.config || {}), ...patch }
            }
          : node
      )
    );
  };

  const addOption = (nodeId) => {
    setNodes((prev) =>
      prev.map((node) => {
        if (node.id !== nodeId) return node;
        const nextIndex = (node.options?.length || 0) + 1;
        return {
          ...node,
          options: [...(node.options || []), { key: String(nextIndex), label: `Option ${nextIndex}`, nextId: '' }]
        };
      })
    );
  };

  const updateOption = (nodeId, optionIndex, patch) => {
    setNodes((prev) =>
      prev.map((node) => {
        if (node.id !== nodeId) return node;
        const options = [...(node.options || [])];
        options[optionIndex] = { ...options[optionIndex], ...patch };
        return { ...node, options };
      })
    );
  };

  const removeOption = (nodeId, optionIndex) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === nodeId ? { ...node, options: (node.options || []).filter((_, i) => i !== optionIndex) } : node
      )
    );
  };

  const removeNode = (id) => {
    setNodes((prev) =>
      prev
        .filter((node) => node.id !== id)
        .map((node) => ({
          ...node,
          options: (node.options || []).map((option) =>
            option.nextId === id ? { ...option, nextId: '' } : option
          ),
          config: node.config?.nextId === id ? { ...node.config, nextId: '' } : node.config
        }))
    );
  };

  const nodeIdSet = useMemo(() => new Set(nodes.map((node) => node.id)), [nodes]);
  const hasDuplicateNodeIds = nodeIdSet.size !== nodes.length;
  const canSave = Boolean(name.trim()) && nodes.length > 0 && !hasDuplicateNodeIds;

  return (
    <div className="space-y-4">
      <div className="glass-panel rounded-2xl p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="md:col-span-2">
            <label className="text-sm text-slate-300">Flow name</label>
            <input
              className="mt-1 w-full rounded-xl border border-[#2a3942] bg-[#121d24] px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Main Sales Flow"
            />
          </div>
          <div>
            <label className="text-sm text-slate-300">Start node</label>
            <select
              value={startNodeId}
              onChange={(e) => setStartNodeId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#2a3942] bg-[#121d24] px-3 py-2 text-sm"
            >
              {nodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {formatNodeLabel(node)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <label className="mt-3 inline-flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Active flow
        </label>
        {hasDuplicateNodeIds ? (
          <p className="mt-2 text-xs text-rose-300">Node IDs must be unique before saving.</p>
        ) : null}
      </div>

      <div className="space-y-3">
        {nodes.map((node) => (
          <article key={node.id} className="glass-panel rounded-2xl p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm text-slate-300">Node: {node.id}</p>
              <button
                className="text-xs text-rose-300 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => removeNode(node.id)}
                disabled={nodes.length === 1}
              >
                Remove
              </button>
            </div>
            <div className="grid gap-2 md:grid-cols-4">
              <input
                value={node.id}
                readOnly
                className="rounded-xl border border-[#2a3942] bg-[#0f191f] px-3 py-2 text-sm text-[#8fa3ad]"
              />
              <select
                value={node.type}
                onChange={(e) => changeNodeType(node.id, e.target.value)}
                className="rounded-xl border border-[#2a3942] bg-[#121d24] px-2 py-2 text-sm"
              >
                {nodeTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <input
                value={node.prompt}
                onChange={(e) => updateNode(node.id, { prompt: e.target.value })}
                placeholder="Prompt"
                className="md:col-span-2 rounded-xl border border-[#2a3942] bg-[#121d24] px-3 py-2 text-sm"
              />
            </div>

            {node.type === 'menu' ? (
              <div className="mt-3 rounded-xl border border-[#2a3942] bg-[#111b21]/80 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wide text-[#8fa3ad]">Menu options</p>
                  <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => addOption(node.id)}>
                    Add Option
                  </Button>
                </div>
                <div className="space-y-2">
                  {(node.options || []).map((option, optionIndex) => (
                    <div key={`${node.id}_${optionIndex}`} className="grid gap-2 md:grid-cols-4">
                      <input
                        value={option.key || ''}
                        onChange={(e) => updateOption(node.id, optionIndex, { key: e.target.value })}
                        placeholder="Key (e.g. 1)"
                        className="rounded-xl border border-[#2a3942] bg-[#121d24] px-3 py-2 text-sm"
                      />
                      <input
                        value={option.label || ''}
                        onChange={(e) => updateOption(node.id, optionIndex, { label: e.target.value })}
                        placeholder="Label"
                        className="rounded-xl border border-[#2a3942] bg-[#121d24] px-3 py-2 text-sm"
                      />
                      <select
                        value={option.nextId || ''}
                        onChange={(e) => updateOption(node.id, optionIndex, { nextId: e.target.value })}
                        className="rounded-xl border border-[#2a3942] bg-[#121d24] px-3 py-2 text-sm"
                      >
                        <option value="">End flow</option>
                        {nodes
                          .filter((candidate) => candidate.id !== node.id)
                          .map((candidate) => (
                            <option key={candidate.id} value={candidate.id}>
                              {formatNodeLabel(candidate)}
                            </option>
                          ))}
                      </select>
                      <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => removeOption(node.id, optionIndex)}>
                        Remove Option
                      </Button>
                    </div>
                  ))}
                  {!node.options?.length ? (
                    <p className="text-xs text-[#8fa3ad]">No options yet. Add at least one option for menu branching.</p>
                  ) : null}
                </div>
              </div>
            ) : null}

            {node.type === 'message' || node.type === 'capture' || node.type === 'appointment' ? (
              <div className="mt-3 grid gap-2 md:grid-cols-3">
                <div>
                  <label className="text-xs uppercase tracking-wide text-[#8fa3ad]">Next node</label>
                  <select
                    value={node.config?.nextId || ''}
                    onChange={(e) => updateNodeConfig(node.id, { nextId: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-[#2a3942] bg-[#121d24] px-3 py-2 text-sm"
                  >
                    <option value="">End flow</option>
                    {nodes
                      .filter((candidate) => candidate.id !== node.id)
                      .map((candidate) => (
                        <option key={candidate.id} value={candidate.id}>
                          {formatNodeLabel(candidate)}
                        </option>
                      ))}
                  </select>
                </div>

                {node.type === 'capture' ? (
                  <div>
                    <label className="text-xs uppercase tracking-wide text-[#8fa3ad]">Capture mode</label>
                    <select
                      value={node.config?.mode || 'lead_name'}
                      onChange={(e) => updateNodeConfig(node.id, { mode: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-[#2a3942] bg-[#121d24] px-3 py-2 text-sm"
                    >
                      {captureModes.map((mode) => (
                        <option key={mode} value={mode}>
                          {mode}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}

                {node.type === 'appointment' ? (
                  <label className="mt-5 inline-flex items-center gap-2 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={Boolean(node.config?.sendReminders)}
                      onChange={(e) => updateNodeConfig(node.id, { sendReminders: e.target.checked })}
                    />
                    Schedule reminders
                  </label>
                ) : null}
              </div>
            ) : null}
          </article>
        ))}
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={addNode}>
          Add Node
        </Button>
        <Button onClick={() => onSave({ name: name.trim(), nodes, startNodeId, isActive })} disabled={loading || !canSave}>
          {loading ? 'Saving...' : saveLabel}
        </Button>
      </div>
    </div>
  );
}

export default FlowBuilder;
