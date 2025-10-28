import {} from 'react'
import Overview from './components/Overview'
import Projects from './components/Projects'
import InventoryLogs from './components/InventoryLogs'
import ActivityLogs from './components/ActivityLogs'
// import StockDetails from './components/StockDetails'

const Dashboard = () => {
  return (
    <div className="space-y-6 p-10">
      <Overview />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* PROJECTS */}
          <Projects />

          {/* Inventory Flow/LOGS */}
          <InventoryLogs />
        </div>

        <div className="lg:col-span-1">
          {/* Activity Logs */}
          <ActivityLogs />
        </div>
      </div>
    </div>
  )
}

export default Dashboard