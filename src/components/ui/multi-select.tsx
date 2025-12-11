import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export type Option = {
  label: string
  value: string
}

interface MultiSelectProps {
  options: Option[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  className?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select...",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = React.useCallback((optionValue: string) => {
    const isSelected = selected.includes(optionValue)
    if (isSelected) {
      onChange(selected.filter((item) => item !== optionValue))
    } else {
      onChange([...selected, optionValue])
    }
  }, [selected, onChange])

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between h-8 px-2", className)}
          type="button"
        >
          <div className="flex gap-1 flex-wrap truncate">
            {selected.length === 0 && <span className="text-muted-foreground font-normal text-xs">{placeholder}</span>}
            {selected.length > 0 && selected.length <= 1 && (
               <span className="text-xs truncate">
                  {options.find((option) => option.value === selected[0])?.label || selected[0]}
               </span>
            )}
            {selected.length > 1 && (
               <span className="text-xs">
                 {selected.length} selected
               </span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0 z-[100]" align="start" sideOffset={5} side="bottom">
        <Command>
          <CommandInput placeholder="Search..." className="h-8 text-xs" />
          <CommandList>
            <CommandEmpty>No item found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    // Keep the popover open for multi-pick while toggling the selection
                    handleSelect(option.value)
                    setOpen(true)
                  }}
                  className="text-xs cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-3 w-3",
                      selected.includes(option.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
