"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4 sm:p-6 w-full max-w-sm mx-auto", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full",
        month: "space-y-4 w-full min-w-[280px] sm:min-w-[320px]",
        caption: "flex justify-center pt-2 pb-4 relative items-center",
        caption_label: "text-lg sm:text-xl font-bold text-slate-900 px-12 sm:px-16",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "h-9 w-9 sm:h-10 sm:w-10 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 p-0 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
        ),
        nav_button_previous: "absolute left-2 sm:left-4",
        nav_button_next: "absolute right-2 sm:right-4",
        table: "w-full border-collapse mt-4",
        head_row: "flex w-full mb-2",
        head_cell: "text-slate-600 font-semibold text-sm sm:text-base w-full flex-1 text-center py-2 uppercase tracking-wide",
        row: "flex w-full mt-1",
        cell: "text-center p-0 relative flex-1 focus-within:relative focus-within:z-20",
        day: cn(
          "h-10 w-10 sm:h-12 sm:w-12 mx-auto p-0 font-medium text-sm sm:text-base rounded-lg transition-all duration-200 hover:bg-slate-100 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#C49B66] focus:ring-offset-2"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-gradient-to-r from-[#C49B66] to-[#D4AF37] text-white hover:from-[#B8935C] hover:to-[#C19B26] shadow-lg hover:shadow-xl font-bold transform scale-105",
        day_today: "bg-slate-100 text-slate-900 font-bold border-2 border-[#C49B66] hover:bg-slate-200",
        day_outside:
          "text-slate-400 opacity-50 hover:text-slate-500 hover:opacity-75",
        day_disabled: "text-slate-300 opacity-30 cursor-not-allowed hover:bg-transparent hover:scale-100",
        day_range_middle:
          "aria-selected:bg-slate-100 aria-selected:text-slate-900",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" {...props} />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" {...props} />,
      } as any}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
