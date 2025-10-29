import ProjectStats from './components/ProjectStats.tsx'
import ProjectTable from './components/ProjectTable.tsx'
import CreateProjectModal from './components/CreateProjectModal.tsx'

const Projects = () => {
  return (
    <div className="space-y-6 p-10">
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