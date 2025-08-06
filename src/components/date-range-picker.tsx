
"use client";

import * as React from "react";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { DateRange } from "react-day-picker";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "./ui/separator";

interface DateRangePickerProps extends React.ComponentProps<"div"> {
    dateRange?: DateRange;
    onDateRangeChange: (dateRange: DateRange) => void;
    disabled?: boolean;
}

type Preset = {
    label: string;
    range: () => DateRange;
}

export function DateRangePicker({ className, dateRange, onDateRangeChange, disabled }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const presets: Preset[] = [
    { label: "Today", range: () => ({ from: new Date(), to: new Date() }) },
    { label: "Yesterday", range: () => ({ from: subDays(new Date(), 1), to: subDays(new Date(), 1) }) },
    { label: "This week", range: () => ({ from: startOfWeek(new Date()), to: endOfWeek(new Date()) })},
    { label: "Last week", range: () => {
        const today = new Date();
        const lastWeekStart = startOfWeek(subDays(today, 7));
        const lastWeekEnd = endOfWeek(subDays(today, 7));
        return { from: lastWeekStart, to: lastWeekEnd };
    }},
    { label: "Last 7 days", range: () => ({ from: subDays(new Date(), 6), to: new Date() })},
    { label: "Last 14 days", range: () => ({ from: subDays(new Date(), 13), to: new Date() })},
    { label: "Last 30 days", range: () => ({ from: subDays(new Date(), 29), to: new Date() })},
    { label: "This month", range: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) })},
    { label: "Last month", range: () => {
        const today = new Date();
        const lastMonthStart = startOfMonth(subDays(today, 30));
        const lastMonthEnd = endOfMonth(subDays(today, 30));
        return { from: lastMonthStart, to: lastMonthEnd };
    }},
     { label: "This year", range: () => ({ from: startOfYear(new Date()), to: endOfYear(new Date()) })},
      { label: "Last year", range: () => {
        const today = new Date();
        const lastYearStart = startOfYear(subDays(today, 365));
        const lastYearEnd = endOfYear(subDays(today, 365));
        return { from: lastYearStart, to: lastYearEnd };
    }},
  ];

  const handlePresetClick = (preset: Preset) => {
    onDateRangeChange(preset.range());
    // No need to close popover here, user might want to adjust
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
            disabled={disabled}
          >
             <div className="flex-1">
                {dateRange?.from ? (
                dateRange.to ? (
                    <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                    </>
                ) : (
                    format(dateRange.from, "LLL dd, y")
                )
                ) : (
                <span>Pick a date</span>
                )}
            </div>
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="flex w-auto p-0" align="start">
          <div className="flex">
            <div className="w-48 p-2">
                <div className="flex flex-col space-y-1">
                    {presets.map(preset => (
                        <Button
                            key={preset.label}
                            variant="ghost"
                            className="w-full justify-start font-normal h-8 px-2"
                            onClick={() => handlePresetClick(preset)}
                        >
                           {preset.label}
                        </Button>
                    ))}
                </div>
            </div>
            <Separator orientation="vertical" className="h-auto" />
            <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={(range) => range && onDateRangeChange(range)}
                numberOfMonths={2}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
