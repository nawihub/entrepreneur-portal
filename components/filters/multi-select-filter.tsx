"use client";

import { ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { FilterOption } from "@/lib/data/filter-options";

interface MultiSelectFilterProps {
  label: string;
  values: string[];
  options: FilterOption[];
  onChange: (values: string[]) => void;
}

/** Any-of filter: matches items having at least one of the selected values. */
export function MultiSelectFilter({ label, values, options, onChange }: MultiSelectFilterProps) {
  const active = values.length > 0;
  const summary = !active
    ? label
    : values.length === 1
      ? options.find((o) => o.value === values[0])?.label ?? values[0]
      : `${label} · ${values.length}`;

  function toggle(value: string, checked: boolean) {
    onChange(checked ? [...values, value] : values.filter((v) => v !== value));
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className={cn(
            "flex h-9 min-w-36 items-center justify-between gap-2 rounded-full border border-input bg-card px-3 text-sm shadow-sm transition-colors hover:bg-muted/60",
            active && "border-primary-500 bg-primary-50 text-primary-800 dark:bg-primary-900/40 dark:text-primary-200",
          )}
        >
          <span className="truncate">{summary}</span>
          <ChevronDown className="size-4 shrink-0 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-2">
        <div className="max-h-72 overflow-y-auto">
          {options.map((option) => {
            const id = `${label}-${option.value}`;
            return (
              <label
                key={option.value}
                htmlFor={id}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-sm hover:bg-muted"
              >
                <Checkbox id={id} checked={values.includes(option.value)} onCheckedChange={(c) => toggle(option.value, c === true)} />
                {option.label}
              </label>
            );
          })}
        </div>
        {active && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="mt-1 w-full rounded-lg px-2 py-1.5 text-left text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Clear {label.toLowerCase()}
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}
