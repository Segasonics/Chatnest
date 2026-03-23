import { useEffect, useMemo, useState } from 'react';
import Button from '../common/Button';

function FlowSimulator({ flow }) {
  const [log, setLog] = useState([]);
  const [input, setInput] = useState('');
  const [currentNodeId, setCurrentNodeId] = useState('');
  const [isFinished, setIsFinished] = useState(false);

  const nodeMap = useMemo(() => {
    const map = new Map();
    (flow?.nodes || []).forEach((node) => map.set(node.id, node));
    return map;
  }, [flow]);

  useEffect(() => {
    setLog([]);
    setInput('');
    setIsFinished(false);
    const startId = flow?.startNodeId || flow?.nodes?.[0]?.id || '';
    setCurrentNodeId(startId);
  }, [flow]);

  const reset = () => {
    setLog([]);
    setInput('');
    setIsFinished(false);
    const startId = flow?.startNodeId || flow?.nodes?.[0]?.id || '';
    setCurrentNodeId(startId);
  };

  const appendLog = (userInput, response) => {
    setLog((prev) => [...prev, { input: userInput, response }]);
  };

  const runStep = () => {
    if (!flow) return;
    if (isFinished) return;

    const node = nodeMap.get(currentNodeId) || nodeMap.get(flow.startNodeId) || flow.nodes?.[0];
    if (!node) return;

    if (node.type === 'menu') {
      const normalized = input.trim();
      if (!normalized) {
        const optionHint = (node.options || []).map((opt) => `${opt.key} (${opt.label})`).join(', ');
        appendLog('', `${node.prompt}${optionHint ? ` Options: ${optionHint}` : ''}`);
        return;
      }

      const option = (node.options || []).find(
        (opt) => opt.key === normalized || opt.label?.toLowerCase() === normalized.toLowerCase()
      );

      if (!option) {
        const valid = (node.options || []).map((opt) => opt.key).join(', ');
        appendLog(normalized, `Please choose a valid option: ${valid || 'No options configured'}`);
        setInput('');
        return;
      }

      const nextNode = option.nextId ? nodeMap.get(option.nextId) : null;
      if (!nextNode) {
        appendLog(normalized, 'Flow ended.');
        setInput('');
        setIsFinished(true);
        return;
      }

      appendLog(normalized, nextNode.prompt || 'Done.');
      setCurrentNodeId(nextNode.id);
      setInput('');
      if (nextNode.type === 'end') setIsFinished(true);
      return;
    }

    if (node.type === 'message') {
      appendLog(input.trim(), node.prompt || '');
      setInput('');
      const nextId = node.config?.nextId;
      if (nextId && nodeMap.has(nextId)) {
        setCurrentNodeId(nextId);
      } else {
        setIsFinished(true);
      }
      return;
    }

    if (node.type === 'capture') {
      const mode = node.config?.mode || 'lead_name';
      appendLog(input.trim(), node.prompt || `Capture mode: ${mode}`);
      setInput('');
      const nextId = node.config?.nextId;
      if (nextId && nodeMap.has(nextId)) {
        setCurrentNodeId(nextId);
      } else {
        setIsFinished(true);
      }
      return;
    }

    if (node.type === 'appointment') {
      appendLog(input.trim(), node.prompt || 'Please provide appointment time in ISO format.');
      setInput('');
      const nextId = node.config?.nextId;
      if (nextId && nodeMap.has(nextId)) {
        setCurrentNodeId(nextId);
      } else {
        setIsFinished(true);
      }
      return;
    }

    appendLog(input.trim(), node.prompt || 'Flow finished.');
    setInput('');
    setIsFinished(true);
  };

  return (
    <div className="glass-panel rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-emerald-200">Flow Simulator</h3>
        <p className="text-xs text-[#8fa3ad]">Current node: {currentNodeId || 'N/A'}</p>
      </div>
      <div className="chat-surface h-56 space-y-2 overflow-y-auto rounded-xl p-3 text-sm">
        {log.map((row, i) => (
          <div key={i} className="space-y-1">
            <p className="text-emerald-300">You: {row.input || '(empty)'}</p>
            <p className="text-slate-200">Bot: {row.response}</p>
          </div>
        ))}
        {!log.length ? <p className="text-xs text-[#8fa3ad]">Press Run to start from the start node.</p> : null}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full rounded-xl border border-[#2a3942] bg-[#121d24] px-3 py-2 text-sm"
          placeholder="Try input (for menu nodes use option key)"
        />
        <Button onClick={runStep} disabled={!flow || isFinished}>
          {isFinished ? 'Done' : 'Run'}
        </Button>
        <Button variant="ghost" onClick={reset}>
          Reset
        </Button>
      </div>
    </div>
  );
}

export default FlowSimulator;

