"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <div className="p-4">
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn("w-full max-w-md mx-auto", className)}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4 w-full",
          caption: "flex justify-center pt-1 relative items-center mb-4",
          caption_label: "text-lg font-semibold text-gray-900",
          nav: "space-x-1 flex items-center",
          nav_button: "h-8 w-8 bg-white hover:bg-gray-50 border border-gray-200 rounded-md p-0 transition-colors",
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse mt-4",
          head_row: "grid grid-cols-7 mb-2",
          head_cell: "text-gray-500 font-medium text-sm text-center py-2",
          row: "grid grid-cols-7 w-full",
          cell: "text-center p-0.5 relative",
          day: "h-9 w-9 mx-auto p-0 font-normal text-sm rounded-md hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors cursor-pointer flex items-center justify-center",
          day_selected: "bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700",
          day_today: "bg-blue-100 text-blue-900 font-semibold",
          day_outside: "text-gray-400 opacity-50",
          day_disabled: "text-gray-300 opacity-50 cursor-not-allowed hover:bg-transparent",
          day_hidden: "invisible",
          ...classNames,
        }}
        components={{
          IconLeft: () => <ChevronLeft className="h-4 w-4 text-gray-600" />,
          IconRight: () => <ChevronRight className="h-4 w-4 text-gray-600" />,
        } as any}
        {...props}
      />
    </div>
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
