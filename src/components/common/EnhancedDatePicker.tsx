
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

// Helper function to create normalized dates that work consistently with UTC comparisons
const createNormalizedDate = (year: number, month: number, day: number) => {
  return new Date(year, month, day, 12, 0, 0, 0); // Use noon to avoid timezone edge cases
};

const DATE_PRESETS = [
  {
    label: "Today",
    getValue: () => {
      const today = new Date();
      return {
        from: createNormalizedDate(today.getFullYear(), today.getMonth(), today.getDate()),
        to: createNormalizedDate(today.getFullYear(), today.getMonth(), today.getDate())
      };
    }
  },
  {
    label: "Yesterday", 
    getValue: () => {
      const yesterday = subDays(new Date(), 1);
      return {
        from: createNormalizedDate(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()),
        to: createNormalizedDate(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())
      };
    }
  },
  {
    label: "Last 7 days",
    getValue: () => {
      const end = new Date();
      const start = subDays(end, 6);
      return {
        from: createNormalizedDate(start.getFullYear(), start.getMonth(), start.getDate()),
        to: createNormalizedDate(end.getFullYear(), end.getMonth(), end.getDate())
      };
    }
  },
  {
    label: "Last 30 days",
    getValue: () => {
      const end = new Date();
      const start = subDays(end, 29);
      return {
        from: createNormalizedDate(start.getFullYear(), start.getMonth(), start.getDate()),
        to: createNormalizedDate(end.getFullYear(), end.getMonth(), end.getDate())
      };
    }
  },
  {
    label: "Last 90 days",
    getValue: () => {
      const end = new Date();
      const start = subDays(end, 89);
      return {
        from: createNormalizedDate(start.getFullYear(), start.getMonth(), start.getDate()),
        to: createNormalizedDate(end.getFullYear(), end.getMonth(), end.getDate())
      };
    }
  },
  {
    label: "All time",
    getValue: () => ({
      from: createNormalizedDate(2020, 0, 1),
      to: createNormalizedDate(2030, 11, 31)
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
    console.log('Preset selected:', preset.label, newRange);
    onDateChange(newRange);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDateChange(undefined);
  };

  const handleCalendarSelect = (selectedDate: DateRange | undefined) => {
    if (selectedDate?.from && selectedDate?.to) {
      // Normalize the selected dates to avoid timezone issues
      const adjustedRange = {
        from: createNormalizedDate(
          selectedDate.from.getFullYear(),
          selectedDate.from.getMonth(),
          selectedDate.from.getDate()
        ),
        to: createNormalizedDate(
          selectedDate.to.getFullYear(),
          selectedDate.to.getMonth(),
          selectedDate.to.getDate()
        )
      };
      console.log('Calendar selection adjusted:', adjustedRange);
      onDateChange(adjustedRange);
    } else if (selectedDate?.from) {
      // Single date selection - normalize it
      const normalizedDate = createNormalizedDate(
        selectedDate.from.getFullYear(),
        selectedDate.from.getMonth(),
        selectedDate.from.getDate()
      );
      onDateChange({ from: normalizedDate, to: undefined });
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
