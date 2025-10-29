import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import EventDetailModal from './EventDetailModal'

// Mock project data with events (this would come from your API)
const mockProjectEvents = [
  {
    id: 1,
    jo_number: 'JO-2024-001',
    name: 'Metro Manila Infrastructure',
    project_days: [
      { date: '2025-01-01', location: 'EDSA Makati' },
      { date: '2025-01-03', location: 'EDSA Ortigas' },
      { date: '2025-01-09', location: 'BGC Taguig' },
      { date: '2025-01-12', location: 'Makati CBD' },
      { date: '2025-01-15', location: 'Ortigas Center' },
      { date: '2025-01-21', location: 'Alabang' },
      { date: '2025-01-22', location: 'QC Triangle' },
      { date: '2025-01-30', location: 'Mandaluyong' },
      { date: '2025-01-31', location: 'Final Inspection' }
    ],
    status: 'ongoing'
  },
  {
    id: 2,
    jo_number: 'JO-2024-002',
    name: 'Cebu Commercial Complex',
    project_days: [
      { date: '2025-01-07', location: 'Site Preparation' },
      { date: '2025-01-14', location: 'Foundation Work' },
      { date: '2025-01-28', location: 'Structural Work' }
    ],
    status: 'upcoming'
  },
  {
    id: 3,
    jo_number: 'JO-2024-003',
    name: 'Davao Residential Village',
    project_days: [
      { date: '2025-01-16', location: 'Phase 1 Area A' },
      { date: '2025-01-17', location: 'Phase 1 Area B' },
      { date: '2025-01-23', location: 'Phase 2 Planning' }
    ],
    status: 'ongoing'
  },
  {
    id: 4,
    jo_number: 'JO-2024-004',
    name: 'Baguio Tourism Center',
    project_days: [
      { date: '2025-01-02', location: 'Session Road' },
      { date: '2025-01-10', location: 'Main Building' }
    ],
    status: 'completed'
  }
]

const CalendarView = () => {
  const navigate = useNavigate()
  const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 1)) // January 2025
  const [selectedEvent, setSelectedEvent] = useState<{
    id: number
    jo_number: string
    name: string
    status: string
    location: string
  } | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)

  // Generate calendar data
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)
    const firstDayWeekday = firstDayOfMonth.getDay() // 0 = Sunday
    const daysInMonth = lastDayOfMonth.getDate()

    // Create calendar grid (6 weeks x 7 days = 42 cells)
    const calendarDays = []

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDayWeekday; i++) {
      calendarDays.push(null)
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateString = date.toISOString().split('T')[0]

      // Find events for this date
      const dayEvents: Array<{
        id: number
        jo_number: string
        name: string
        status: string
        location: string
      }> = []

      mockProjectEvents.forEach(project => {
        project.project_days.forEach(projectDay => {
          if (projectDay.date === dateString) {
            dayEvents.push({
              id: project.id,
              jo_number: project.jo_number,
              name: project.name,
              status: project.status,
              location: projectDay.location
            })
          }
        })
      })

      calendarDays.push({
        date: day,
        fullDate: dateString,
        events: dayEvents
      })
    }

    return {
      days: calendarDays,
      monthName: firstDayOfMonth.toLocaleDateString('en-US', { month: 'long' }),
      year: year
    }
  }, [currentDate])

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const handleEventClick = (event: any, isMobile = false) => {
    if (isMobile || window.innerWidth < 768) {
      // On mobile, show modal first
      setSelectedEvent(event)
      setShowEventModal(true)
    } else {
      // On desktop, navigate directly
      navigate(`/project/${event.jo_number}`)
    }
  }

  const handleViewProject = (joNumber: string) => {
    navigate(`/project/${joNumber}`)
  }

  const getEventColor = (status: string, index: number) => {
    const colors = {
      ongoing: [
        'bg-blue-100 text-blue-800 border border-blue-200',
        'bg-indigo-100 text-indigo-800 border border-indigo-200'
      ],
      upcoming: [
        'bg-green-100 text-green-800 border border-green-200',
        'bg-emerald-100 text-emerald-800 border border-emerald-200'
      ],
      completed: [
        'bg-gray-100 text-gray-700 border border-gray-200',
        'bg-slate-100 text-slate-700 border border-slate-200'
      ],
      cancelled: [
        'bg-red-100 text-red-800 border border-red-200',
        'bg-pink-100 text-pink-800 border border-pink-200'
      ]
    }
    return colors[status as keyof typeof colors]?.[index % 2] || 'bg-gray-100 text-gray-700 border border-gray-200'
  }

  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  return (
    <div className="space-y-6">
      {/* Main Calendar */}
      <Card className="bg-white">
        <CardContent className="p-6">
          {/* Calendar Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
                <select
                  value={currentDate.getMonth()}
                  onChange={(e) => setCurrentDate(new Date(currentDate.getFullYear(), parseInt(e.target.value), 1))}
                  className="bg-transparent border-none font-semibold text-xl focus:outline-none cursor-pointer hover:text-blue-600 transition-colors"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i} value={i}>
                      {new Date(2025, i, 1).toLocaleDateString('en-US', { month: 'long' })}
                    </option>
                  ))}
                </select>
                <select
                  value={currentDate.getFullYear()}
                  onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value), currentDate.getMonth(), 1))}
                  className="bg-transparent border-none font-semibold text-xl focus:outline-none cursor-pointer hover:text-blue-600 transition-colors ml-1"
                >
                  {Array.from({ length: 10 }, (_, i) => (
                    <option key={i} value={2020 + i}>
                      {2020 + i}
                    </option>
                  ))}
                </select>
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                title="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Today
              </button>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                title="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            {/* Day Headers */}
            {dayNames.map((day, index) => (
              <div
                key={day}
                className={`bg-blue-50 p-3 text-center text-sm font-semibold text-blue-900 border-b border-gray-200 ${index === 0 || index === 6 ? 'bg-blue-100' : ''
                  }`}
              >
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {calendarData.days.map((day, index) => {
              const isToday = day && new Date().toDateString() === new Date(day.fullDate).toDateString()
              const isWeekend = index % 7 === 0 || index % 7 === 6

              return (
                <div
                  key={index}
                  className={`min-h-[100px] md:min-h-[120px] p-1.5 md:p-2 border-b border-r border-gray-200 transition-colors hover:bg-gray-50 ${day ? (isWeekend ? 'bg-gray-25' : 'bg-white') : 'bg-gray-50'
                    } ${isToday ? 'bg-blue-50 border-blue-200' : ''}`}
                >
                  {day && (
                    <>
                      {/* Day Number */}
                      <div className={`text-sm font-medium mb-1 ${isToday
                          ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs'
                          : 'text-gray-900'
                        }`}>
                        {day.date}
                      </div>

                      {/* Events */}
                      <div className="space-y-0.5">
                        {day.events.slice(0, 3).map((event, eventIndex) => (
                          <button
                            key={`${event.id}-${eventIndex}`}
                            onClick={() => handleEventClick(event)}
                            title={`${event.name} - ${event.location}`}
                            className={`w-full text-left px-1.5 py-0.5 rounded text-xs font-medium truncate transition-all duration-200 hover:shadow-sm hover:scale-[1.02] hover:z-10 relative ${getEventColor(event.status, eventIndex)}`}
                          >
                            {event.name}
                          </button>
                        ))}
                        {day.events.length > 3 && (
                          <div className="text-xs text-gray-500 px-1.5 py-0.5">
                            +{day.events.length - 3} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-200 rounded"></div>
              <span className="text-gray-600">Ongoing Projects</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-200 rounded"></div>
              <span className="text-gray-600">Upcoming Projects</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-200 rounded"></div>
              <span className="text-gray-600">Completed Projects</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Detail Modal */}
      <EventDetailModal
        isOpen={showEventModal}
        onClose={() => {
          setShowEventModal(false)
          setSelectedEvent(null)
        }}
        event={selectedEvent}
        onViewProject={handleViewProject}
      />
    </div>
  )
}

export default CalendarView