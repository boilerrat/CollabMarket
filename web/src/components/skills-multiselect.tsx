"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";

type Props = {
  selected: string[];
  onChange: (skills: string[]) => void;
  options?: string[];
  placeholder?: string;
};

export function SkillsMultiSelect({ selected, onChange, options = [], placeholder = "Add skills" }: Props) {
  const set = useMemo(() => new Set(selected.map((s) => s.toLowerCase())), [selected]);
  const toggle = (skill: string) => {
    const norm = skill.trim();
    if (!norm) return;
    const exists = set.has(norm.toLowerCase());
    const next = exists ? selected.filter((s) => s.toLowerCase() !== norm.toLowerCase()) : [...selected, norm];
    onChange(next);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {selected.map((s) => (
        <Badge key={s} variant="secondary" className="cursor-pointer" onClick={() => toggle(s)}>
          {s}
        </Badge>
      ))}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">{placeholder}</Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-64" align="start">
          <Command>
            <CommandInput placeholder="Search skills..." />
            <CommandList>
              <CommandEmpty>No results.</CommandEmpty>
              <CommandGroup>
                {options.map((opt) => (
                  <CommandItem key={opt} value={opt} onSelect={() => toggle(opt)}>
                    {opt}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}


