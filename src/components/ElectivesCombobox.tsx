import { CheckIcon, ChevronsUpDown } from "lucide-react"

import * as React from "react"

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

import electives from "./data/electives.json";

type Elective = (typeof electives)[number]
interface ComboboxWithCheckboxProps {
  selectedElectives: Elective[]
  setSelectedElectives: React.Dispatch<React.SetStateAction<Elective[]>>
}

export default function ElectivesCombobox({ selectedElectives, setSelectedElectives }: ComboboxWithCheckboxProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="noShadow"
          role="combobox"
          aria-expanded={open}
          className="w-full min-w-[280px] justify-between"
        >
          <span className="truncate">
            {selectedElectives.length > 0 ? selectedElectives.join(", ") : "Оберіть предмети..."}
          </span>
          <ChevronsUpDown className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0 border-0" align="start">
        <Command className="**:data-[slot=command-input-wrapper]:h-11">
          <CommandInput placeholder="Пошук предметів..." />
          <CommandList>
            <CommandEmpty>Пердметів не знайдено.</CommandEmpty>
            <CommandGroup className="p-2 [&_[cmdk-group-items]]:flex [&_[cmdk-group-items]]:flex-col [&_[cmdk-group-items]]:gap-1">
              {electives.map((elective) => (
                <CommandItem
                  key={elective}
                  value={elective}
                  onSelect={(currentValue) => {
                    setSelectedElectives(
                      selectedElectives.some((f) => f === currentValue)
                        ? selectedElectives.filter(
                          (f) => f !== currentValue,
                        )
                        : [...selectedElectives, elective],
                    )
                  }}
                >
                  <div
                    className="border-border pointer-events-none size-5 shrink-0 rounded-base border-2 transition-all select-none *:[svg]:opacity-0 data-[selected=true]:*:[svg]:opacity-100"
                    data-selected={selectedElectives.some(
                      (f) => f === elective,
                    )}
                  >
                    <CheckIcon className="size-4 text-current" />
                  </div>
                  {elective}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
