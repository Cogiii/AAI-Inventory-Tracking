import { useParams } from 'react-router-dom'
import ProjectInfo from './components/ProjectInfo'
import ProjectDays from './components/ProjectDays'
import ProjectItems from './components/ProjectItems'
import ProjectPersonnel from './components/ProjectPersonnel'
import ProjectLogs from './components/ProjectLogs'

const ProjectDetail = () => {
  const { joNumber } = useParams<{ joNumber: string }>()

  return (
    <div className="space-y-6 p-10">
      {/* Project Information */}
      <ProjectInfo joNumber={joNumber} />
      
      {/* Project Days */}
      <ProjectDays joNumber={joNumber} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Items (Stocks) */}
        <ProjectItems joNumber={joNumber} />
        
        {/* Project Personnel (Employees) */}
        <ProjectPersonnel joNumber={joNumber} />
      </div>

      {/* Project Logs */}
      <ProjectLogs joNumber={joNumber} />
    </div>
  )
}

export default ProjectDetail