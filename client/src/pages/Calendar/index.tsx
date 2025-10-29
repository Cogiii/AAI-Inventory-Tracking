import { } from 'react'

import CalendarView from './components/CalendarView'

const Calendar = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Project Calendar</h1>
      </div>

      {/* Calendar Component */}
      <CalendarView />
    </div>
  )
}

export default Calendar