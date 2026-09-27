"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { FilterOption } from "@/lib/data/filter-options";

// Radix Select doesn't allow an empty-string item value, so "no filter" uses a sentinel.
const ALL = "__all__";

interface SelectFilterProps {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  className?: string;
}

export function SelectFilter({ label, value, options, onChange, className }: SelectFilterProps) {
  const active = Boolean(value);
  return (
    <Select value={value || ALL} onValueChange={(v) => onChange(v === ALL ? "" : v)}>
      <SelectTrigger
        aria-label={label}
        className={cn(
          "h-9 w-auto min-w-36 gap-2 rounded-full",
          active && "border-primary-500 bg-primary-50 text-primary-800 dark:bg-primary-900/40 dark:text-primary-200",
          className,
        )}
      >
        <SelectValue placeholder={label}>
          {active ? options.find((o) => o.value === value)?.label ?? value : label}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>All {label.toLowerCase()}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
