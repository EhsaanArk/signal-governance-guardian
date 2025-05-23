
import * as React from "react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface EnhancedDatePickerProps {
  date: DateRange | undefined;
  onDateChange: (date: DateRange | undefined) => void;
  className?: string;
}

const DATE_PRESETS = [
  {
    label: "Today",
    getValue: () => ({
      from: startOfDay(new Date()),
      to: endOfDay(new Date())
    })
  },
  {
    label: "Yesterday", 
    getValue: () => {
      const yesterday = subDays(new Date(), 1);
      return {
        from: startOfDay(yesterday),
        to: endOfDay(yesterday)
      };
    }
  },
  {
    label: "Last 7 days",
    getValue: () => ({
      from: startOfDay(subDays(new Date(), 6)),
      to: endOfDay(new Date())
    })
  },
  {
    label: "Last 30 days",
    getValue: () => ({
      from: startOfDay(subDays(new Date(), 29)),
      to: endOfDay(new Date())
    })
  },
  {
    label: "Last 90 days",
    getValue: () => ({
      from: startOfDay(subDays(new Date(), 89)),
      to: endOfDay(new Date())
    })
  },
  {
    label: "All time",
    getValue: () => ({
      from: new Date(2020, 0, 1),
      to: new Date(2030, 11, 31)
    })
  }
];

export function EnhancedDatePicker({
  date,
  onDateChange,
  className
}: EnhancedDatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handlePresetClick = (preset: typeof DATE_PRESETS[0]) => {
    const newRange = preset.getValue();
    onDateChange(newRange);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDateChange(undefined);
  };

  const handleCalendarSelect = (selectedDate: DateRange | undefined) => {
    if (selectedDate?.from && selectedDate?.to) {
      // Ensure proper time boundaries for selected dates
      const adjustedRange = {
        from: startOfDay(selectedDate.from),
        to: endOfDay(selectedDate.to)
      };
      onDateChange(adjustedRange);
    } else {
      onDateChange(selectedDate);
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "MMM dd, yyyy")} -{" "}
                  {format(date.to, "MMM dd, yyyy")}
                </>
              ) : (
                format(date.from, "MMM dd, yyyy")
              )
            ) : (
              <span>Pick a date range</span>
            )}
            {date && (
              <X 
                className="ml-auto h-4 w-4 hover:text-destructive" 
                onClick={handleClear}
              />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            {/* Preset buttons */}
            <div className="flex flex-col border-r">
              <div className="p-3 border-b">
                <h4 className="font-medium text-sm">Quick Select</h4>
              </div>
              <div className="p-2 space-y-1">
                {DATE_PRESETS.map((preset) => (
                  <Button
                    key={preset.label}
                    variant="ghost"
                    className="w-full justify-start text-sm h-8"
                    onClick={() => handlePresetClick(preset)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Calendar */}
            <div>
              <div className="p-3 border-b">
                <h4 className="font-medium text-sm">Custom Range</h4>
              </div>
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={handleCalendarSelect}
                numberOfMonths={1}
                className="p-3 pointer-events-auto"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
