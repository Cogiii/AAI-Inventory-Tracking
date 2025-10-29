import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCalendarViewEvents } from '@/hooks/useCalendar'
import Loader from '@/components/ui/Loader'

const CalendarView = () => {
  const navigate = useNavigate()
  const [currentDate, setCurrentDate] = useState(new Date())

  // Fetch calendar events for the current view
  const { data: calendarEventsResponse, isLoading, error } = useCalendarViewEvents(currentDate)
  const projectEvents = calendarEventsResponse?.data || []

  // Generate calendar data
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)
    const firstDayWeekday = firstDayOfMonth.getDay()
    const daysInMonth = lastDayOfMonth.getDate()

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

      projectEvents.forEach(project => {
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
  }, [currentDate, projectEvents])

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

  const handleEventClick = (event: any) => {
    navigate(`/project/${event.jo_number}`)
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

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-96">
              <Loader />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-96 text-red-600">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Failed to load calendar events</h3>
                <p className="text-sm text-gray-600">
                  {error instanceof Error ? error.message : 'An error occurred while fetching calendar data.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

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
                            className={`w-full text-left px-1.5 py-0.5 rounded text-xs font-medium truncate transition-all duration-200 hover:shadow-md hover:-translate-y-[3px] hover:brightness-95 hover:z-10 relative will-change-transform ${getEventColor(event.status, eventIndex)}`}
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
    </div>
  )
}

export default CalendarView