"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Command, CommandGroup, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface MultiSelectProps {
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  className?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleUnselect = (option: string) => {
    onChange(selected.filter((s) => s !== option))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={cn(
          "w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background rounded-md cursor-pointer",
          className
        )}>
          <div className="flex gap-1 flex-wrap">
            {selected.map((option) => (
              <Badge
                key={option}
                variant="secondary"
                className="mr-1 mb-1"
              >
                {option}
                <button
                  type="button"
                  className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUnselect(option)
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onClick={() => handleUnselect(option)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {selected.length === 0 && (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command className="w-full">
          <CommandGroup className="max-h-[200px] overflow-auto">
            {options.map((option) => {
              const isSelected = selected.includes(option)
              return (
                <CommandItem
                  key={option}
                  onSelect={() => {
                    if (isSelected) {
                      onChange(selected.filter((s) => s !== option))
                    } else {
                      onChange([...selected, option])
                    }
                    // Don't close popover when selecting
                    // setOpen(false)
                  }}
                  className="cursor-pointer"
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      isSelected ? "bg-primary text-primary-foreground" : "opacity-50"
                    )}
                  >
                    {isSelected && <span>✓</span>}
                  </div>
                  {option}
                </CommandItem>
              )
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
