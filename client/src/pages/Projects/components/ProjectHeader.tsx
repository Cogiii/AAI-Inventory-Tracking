import { FolderOpen, Plus } from 'lucide-react'

const ProjectHeader = () => {
  return (
    <div className="space-y-6 bg-gray p-7 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FolderOpen className="h-8 w-8 text-gray-custom" />
          <h1 className="text-2xl font-semibold text-gray-custom">Projects Management</h1>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>
      <p className="text-gray-600">Manage and track all your construction projects and job orders</p>
    </div>
  )
}

export default ProjectHeader