import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import WorkspaceShell from '../components/layout/WorkspaceShell';
import LeadsTable from '../components/leads/LeadsTable';
import { useGetLeadsQuery, useUpdateLeadMutation } from '../features/leads/leadsApi';

function LeadsPage() {
  const { workspaceId } = useParams();
  const { data } = useGetLeadsQuery(workspaceId);
  const [updateLead] = useUpdateLeadMutation();

  const leads = data?.data || [];

  return (
    <WorkspaceShell workspaceId={workspaceId} title="Contacts & Leads">
      <LeadsTable
        leads={leads}
        onStatusChange={async (lead, status) => {
          try {
            await updateLead({ workspaceId, leadId: lead._id, status }).unwrap();
            toast.success('Lead updated');
          } catch (error) {
            toast.error(error?.data?.message || 'Failed to update lead');
          }
        }}
      />
    </WorkspaceShell>
  );
}

export default LeadsPage;
