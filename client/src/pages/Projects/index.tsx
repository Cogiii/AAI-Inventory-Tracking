import ProjectStats from './components/ProjectStats.tsx'
import ProjectTable from './components/ProjectTable.tsx'
import CreateProjectModal from './components/CreateProjectModal.tsx'
import { UpdatesBanner } from '@/components/ui/UpdatesBanner'

const Projects = () => {
  return (
    <div className="space-y-6 p-10">
      {/* Real-time updates banner */}
      <UpdatesBanner entity="project" message="New project updates available" />

      {/* Stats Overview */}
      <ProjectStats />

      {/* Projects Table */}
      <ProjectTable />

      {/* Modals */}
      <CreateProjectModal />
    </div>
  )
}

export default Projects