import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import WorkspaceShell from '../components/layout/WorkspaceShell';
import FlowBuilder from '../components/flows/FlowBuilder';
import FlowSimulator from '../components/flows/FlowSimulator';
import Button from '../components/common/Button';
import {
  useCreateFlowMutation,
  useDeleteFlowMutation,
  useGetFlowsQuery,
  useUpdateFlowMutation
} from '../features/flows/flowsApi';

function createBlankFlow() {
  return {
    name: 'New Flow',
    isActive: true,
    startNodeId: 'start',
    nodes: [{ id: 'start', type: 'menu', prompt: 'Choose option', options: [], config: {} }]
  };
}

function FlowsPage() {
  const { workspaceId } = useParams();
  const { data, refetch } = useGetFlowsQuery(workspaceId);
  const [createFlow, { isLoading: creating }] = useCreateFlowMutation();
  const [updateFlow, { isLoading: updating }] = useUpdateFlowMutation();
  const [deleteFlow, { isLoading: deleting }] = useDeleteFlowMutation();
  const flows = useMemo(() => data?.data || [], [data]);
  const [selectedFlowId, setSelectedFlowId] = useState('new');
  const [draftFlow, setDraftFlow] = useState(createBlankFlow());

  const selectedFlow = useMemo(
    () => flows.find((flow) => flow._id === selectedFlowId) || null,
    [flows, selectedFlowId]
  );

  useEffect(() => {
    if (selectedFlowId === 'new') return;
    if (selectedFlowId && !selectedFlow) {
      setSelectedFlowId(flows[0]?._id || 'new');
    }
  }, [flows, selectedFlow, selectedFlowId]);

  useEffect(() => {
    if (!selectedFlow) {
      setDraftFlow(createBlankFlow());
      return;
    }

    setDraftFlow({
      name: selectedFlow.name,
      nodes: selectedFlow.nodes || [],
      startNodeId: selectedFlow.startNodeId,
      isActive: selectedFlow.isActive
    });
  }, [selectedFlow]);

  const isLoading = creating || updating || deleting;
  const saveLabel = selectedFlow ? 'Update Flow' : 'Create Flow';

  return (
    <WorkspaceShell workspaceId={workspaceId} title="Flow Builder + Simulator">
      <div className="glass-panel mb-4 flex flex-wrap items-end gap-3 rounded-2xl p-4">
        <div className="min-w-56 flex-1">
          <label className="text-sm text-slate-300">Select flow</label>
          <select
            value={selectedFlowId}
            onChange={(e) => setSelectedFlowId(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[#2a3942] bg-[#121d24] px-3 py-2 text-sm"
          >
            <option value="new">New Draft</option>
            {flows.map((flow) => (
              <option key={flow._id} value={flow._id}>
                {flow.name}
              </option>
            ))}
          </select>
        </div>
        <Button variant="secondary" onClick={() => setSelectedFlowId('new')}>
          New Flow
        </Button>
        <Button
          variant="ghost"
          onClick={async () => {
            if (!selectedFlow) return;
            try {
              await deleteFlow({ workspaceId, flowId: selectedFlow._id }).unwrap();
              await refetch();
              toast.success('Flow deleted');
              setSelectedFlowId('new');
            } catch (error) {
              toast.error(error?.data?.message || 'Failed to delete flow');
            }
          }}
          disabled={!selectedFlow || deleting}
        >
          Delete Selected
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <FlowBuilder
          initialFlow={selectedFlow}
          onDraftChange={setDraftFlow}
          saveLabel={saveLabel}
          onSave={async (payload) => {
            try {
              if (selectedFlow?._id) {
                await updateFlow({ workspaceId, flowId: selectedFlow._id, ...payload }).unwrap();
                await refetch();
                toast.success('Flow updated');
              } else {
                const created = await createFlow({ workspaceId, ...payload }).unwrap();
                await refetch();
                toast.success('Flow created');
                if (created?.data?._id) setSelectedFlowId(created.data._id);
              }
            } catch (error) {
              toast.error(error?.data?.message || 'Failed to save flow');
            }
          }}
          loading={isLoading}
        />
        <FlowSimulator flow={draftFlow} />
      </div>
    </WorkspaceShell>
  );
}

export default FlowsPage;
