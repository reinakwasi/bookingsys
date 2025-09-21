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
      className={cn("p-6 w-full", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full",
        month: "space-y-6 w-full min-w-[320px] sm:min-w-[380px]",
        caption: "flex justify-center pt-3 pb-6 relative items-center",
        caption_label: "text-xl sm:text-2xl font-bold text-slate-900 px-16 sm:px-20",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "h-12 w-12 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-[#C49B66] p-0 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
        ),
        nav_button_previous: "absolute left-4 sm:left-6",
        nav_button_next: "absolute right-4 sm:right-6",
        table: "w-full border-collapse mt-6",
        head_row: "flex w-full mb-4",
        head_cell: "text-slate-700 font-bold text-base sm:text-lg w-full flex-1 text-center py-3 uppercase tracking-wider",
        row: "flex w-full mt-2",
        cell: "text-center p-1 relative flex-1 focus-within:relative focus-within:z-20",
        day: cn(
          "h-12 w-12 sm:h-14 sm:w-14 mx-auto p-0 font-semibold text-base sm:text-lg rounded-xl transition-all duration-300 hover:bg-slate-100 hover:scale-110 focus:outline-none focus:ring-3 focus:ring-[#C49B66] focus:ring-offset-2 cursor-pointer"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-gradient-to-r from-[#C49B66] to-[#D4AF37] text-white hover:from-[#B8935C] hover:to-[#C19B26] shadow-xl hover:shadow-2xl font-bold transform scale-110 border-2 border-white",
        day_today: "bg-slate-200 text-slate-900 font-bold border-3 border-[#C49B66] hover:bg-slate-300 shadow-lg",
        day_outside:
          "text-slate-400 opacity-60 hover:text-slate-500 hover:opacity-80",
        day_disabled: "text-slate-300 opacity-40 cursor-not-allowed hover:bg-transparent hover:scale-100",
        day_range_middle:
          "aria-selected:bg-slate-100 aria-selected:text-slate-900",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-slate-700" {...props} />,
        IconRight: ({ ...props }) => <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-slate-700" {...props} />,
      } as any}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
