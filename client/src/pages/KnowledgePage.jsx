import { useParams } from 'react-router-dom';
import WorkspaceShell from '../components/layout/WorkspaceShell';
import KnowledgePanel from '../components/knowledge/KnowledgePanel';

function KnowledgePage() {
  const { workspaceId } = useParams();

  return (
    <WorkspaceShell workspaceId={workspaceId} title="AI Knowledge">
      <KnowledgePanel workspaceId={workspaceId} />
    </WorkspaceShell>
  );
}

export default KnowledgePage;
