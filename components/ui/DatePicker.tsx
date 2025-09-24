'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar, ChevronLeft, ChevronRight, CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DatePickerProps {
  value?: string
  onChange: (date: string) => void
  placeholder?: string
  disabled?: boolean
  minDate?: string
  maxDate?: string
  className?: string
  id?: string
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  disabled = false,
  minDate,
  maxDate,
  className,
  id
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  )

  useEffect(() => {
    if (value) {
      setSelectedDate(new Date(value))
      setCurrentMonth(new Date(value))
    }
  }, [value])

  const today = new Date()
  const minDateTime = minDate ? new Date(minDate) : today
  const maxDateTime = maxDate ? new Date(maxDate) : null

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const isDateDisabled = (date: Date) => {
    if (date < minDateTime) return true
    if (maxDateTime && date > maxDateTime) return true
    return false
  }

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false
    return date.toDateString() === selectedDate.toDateString()
  }

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString()
  }

  const handleDateSelect = (date: Date) => {
    if (isDateDisabled(date)) return
    
    setSelectedDate(date)
    onChange(date.toISOString().split('T')[0])
    setIsOpen(false)
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1)
      } else {
        newMonth.setMonth(prev.getMonth() + 1)
      }
      return newMonth
    })
  }

  const formatDisplayDate = (date: Date | null) => {
    if (!date) return placeholder
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const days = getDaysInMonth(currentMonth)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          className={cn(
            "w-full h-12 justify-start text-left font-normal rounded-2xl border-2 border-slate-200 hover:border-[#C49B66]/50 focus:border-[#C49B66] focus:ring-[#C49B66]/20 transition-all duration-300 px-4",
            !selectedDate && "text-muted-foreground",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-[#C49B66]" />
          {formatDisplayDate(selectedDate)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white/95 backdrop-blur-md border border-slate-200 shadow-2xl rounded-2xl" align="start">
        <div className="p-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="h-8 w-8 p-0 hover:bg-[#C49B66]/10 rounded-xl"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-semibold text-slate-700">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="h-8 w-8 p-0 hover:bg-[#C49B66]/10 rounded-xl"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {daysOfWeek.map(day => (
              <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => {
              if (!date) {
                return <div key={index} className="h-8 w-8" />
              }

              const disabled = isDateDisabled(date)
              const selected = isDateSelected(date)
              const todayDate = isToday(date)

              return (
                <Button
                  key={date.toISOString()}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDateSelect(date)}
                  disabled={disabled}
                  className={cn(
                    "h-8 w-8 p-0 text-sm rounded-lg hover:bg-[#C49B66]/10 transition-colors",
                    selected && "bg-[#C49B66] text-white hover:bg-[#C49B66]/90",
                    todayDate && !selected && "bg-slate-100 font-semibold",
                    disabled && "text-slate-300 cursor-not-allowed hover:bg-transparent"
                  )}
                >
                  {date.getDate()}
                </Button>
              )
            })}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mt-4 pt-3 border-t border-slate-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDateSelect(today)}
              disabled={isDateDisabled(today)}
              className="flex-1 text-xs hover:bg-[#C49B66]/10 rounded-xl"
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedDate(null)
                onChange('')
                setIsOpen(false)
              }}
              className="flex-1 text-xs hover:bg-slate-100 rounded-xl"
            >
              Clear
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
