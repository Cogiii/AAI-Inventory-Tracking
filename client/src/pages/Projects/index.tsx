import ProjectStats from './components/ProjectStats.tsx'
import ProjectTable from './components/ProjectTable.tsx'

const Projects = () => {
  return (
    <div className="space-y-6 p-10">
      {/* Stats Overview */}
      <ProjectStats />

      {/* Projects Table */}
      <ProjectTable />
    </div>
  )
}

export default Projects