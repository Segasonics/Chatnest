import { useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import WorkspaceShell from '../components/layout/WorkspaceShell';
import RulesTable from '../components/rules/RulesTable';
import RuleEditorModal from '../components/rules/RuleEditorModal';
import Button from '../components/common/Button';
import {
  useCreateRuleMutation,
  useDeleteRuleMutation,
  useGetRulesQuery,
  useUpdateRuleMutation
} from '../features/rules/rulesApi';
import { useGetAssetsQuery } from '../features/assets/assetsApi';

function RulesPage() {
  const { workspaceId } = useParams();
  const { data } = useGetRulesQuery(workspaceId);
  const { data: assetsData } = useGetAssetsQuery(workspaceId);
  const [createRule, { isLoading: creating }] = useCreateRuleMutation();
  const [updateRule, { isLoading: updating }] = useUpdateRuleMutation();
  const [deleteRule] = useDeleteRuleMutation();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const rules = data?.data || [];
  const assets = assetsData?.data || [];

  const onSave = async (form) => {
    try {
      if (editing?._id) {
        await updateRule({ workspaceId, ruleId: editing._id, ...form }).unwrap();
        toast.success('Rule updated');
      } else {
        await createRule({ workspaceId, ...form }).unwrap();
        toast.success('Rule created');
      }
      setModalOpen(false);
      setEditing(null);
    } catch (error) {
      toast.error(error?.data?.message || 'Save failed');
    }
  };

  const onDelete = async (rule) => {
    if (!window.confirm('Delete this rule?')) return;
    try {
      await deleteRule({ workspaceId, ruleId: rule._id }).unwrap();
      toast.success('Rule deleted');
    } catch (error) {
      toast.error(error?.data?.message || 'Delete failed');
    }
  };

  return (
    <WorkspaceShell
      workspaceId={workspaceId}
      title="Flows & Rules"
      rightSlot={<Button onClick={() => setModalOpen(true)}>New Rule</Button>}
    >
      <RulesTable
        rules={rules}
        onEdit={(rule) => {
          setEditing(rule);
          setModalOpen(true);
        }}
        onDelete={onDelete}
      />

      <RuleEditorModal
        open={modalOpen}
        initialRule={editing}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSave={onSave}
        loading={creating || updating}
        assets={assets}
      />
    </WorkspaceShell>
  );
}

export default RulesPage;
