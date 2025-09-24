"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday, addMonths, subMonths, isBefore, startOfDay, differenceInDays } from "date-fns"

interface CalendarProps {
  selected?: Date
  onSelect?: (date: Date) => void
  disabled?: (date: Date) => boolean
  className?: string
  mode?: "single"
  minDate?: Date
  maxDate?: Date
}

function Calendar({ selected, onSelect, disabled, className, mode = "single", minDate, maxDate }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date())
  
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  
  // Get the first day of the week for the month (0 = Sunday)
  const startDay = getDay(monthStart)
  
  // Create empty cells for days before the month starts
  const emptyCells = Array.from({ length: startDay }, (_, i) => (
    <div key={`empty-${i}`} className="calendar-cell"></div>
  ))
  
  const handlePrevMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1))
  }
  
  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1))
  }
  
  const handleDayClick = (day: Date) => {
    // Check if date is disabled by custom disabled function
    if (disabled && disabled(day)) return
    
    // Check if date is before minDate (today by default)
    const today = startOfDay(new Date())
    const dayToCheck = startOfDay(day)
    
    if (minDate && isBefore(dayToCheck, startOfDay(minDate))) return
    if (!minDate && isBefore(dayToCheck, today)) return
    
    // Check if date is after maxDate
    if (maxDate && isBefore(startOfDay(maxDate), dayToCheck)) return
    
    if (onSelect) onSelect(day)
  }
  
  const isDateDisabled = (day: Date) => {
    // Custom disabled function takes priority
    if (disabled && disabled(day)) return true
    
    // Check against minDate (today by default)
    const today = startOfDay(new Date())
    const dayToCheck = startOfDay(day)
    
    if (minDate && isBefore(dayToCheck, startOfDay(minDate))) return true
    if (!minDate && isBefore(dayToCheck, today)) return true
    
    // Check against maxDate
    if (maxDate && isBefore(startOfDay(maxDate), dayToCheck)) return true
    
    return false
  }
  
  return (
    <div className={`calendar-container ${className || ''}`}>
      {/* Header */}
      <div className="calendar-header">
        <button onClick={handlePrevMonth} className="calendar-nav-button">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h2 className="calendar-title">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button onClick={handleNextMonth} className="calendar-nav-button">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      
      {/* Day headers */}
      <div className="calendar-weekdays">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="calendar-weekday">{day}</div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="calendar-grid">
        {emptyCells}
        {days.map(day => {
          const isDisabled = isDateDisabled(day)
          const isSelected = selected && isSameDay(day, selected)
          const isTodayDate = isToday(day)
          
          return (
            <button
              key={day.toISOString()}
              onClick={() => handleDayClick(day)}
              disabled={isDisabled}
              className={`calendar-day ${isSelected ? 'selected' : ''} ${isTodayDate ? 'today' : ''} ${isDisabled ? 'disabled' : ''}`}
            >
              {format(day, 'd')}
            </button>
          )
        })}
      </div>
    </div>
  )
}

Calendar.displayName = "Calendar"

export { Calendar }
