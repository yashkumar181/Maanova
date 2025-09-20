"use client"
import * as React from "react"
import { Check, PlusCircle, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
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

interface TagSelectorProps {
  predefinedTags: string[];
  selectedTags: string[];
  onTagChange: (tags: string[]) => void;
  maxTags?: number;
}

export function TagSelector({ predefinedTags, selectedTags, onTagChange, maxTags = 5 }: TagSelectorProps) {
  
  const handleSelect = (tag: string) => {
    let newSelectedTags;
    if (selectedTags.includes(tag)) {
      newSelectedTags = selectedTags.filter((t) => t !== tag);
    } else {
      if (selectedTags.length < maxTags) {
        newSelectedTags = [...selectedTags, tag];
      } else {
        return; // Limit reached
      }
    }
    onTagChange(newSelectedTags);
  };

  const handleRemove = (tagToRemove: string) => {
    const newSelectedTags = selectedTags.filter((tag) => tag !== tagToRemove);
    onTagChange(newSelectedTags);
  };

  return (
    <div className="space-y-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="w-full justify-start text-left font-normal">
            <PlusCircle className="mr-2 h-4 w-4" />
            <span>{selectedTags.length > 0 ? `${selectedTags.length} / ${maxTags} selected` : "Select Tags..."}</span>
          </Button>
        </PopoverTrigger>
        {/* --- 1. Added Animation Classes --- */}
        <PopoverContent 
          className="w-[--radix-popover-trigger-width] p-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2" 
          align="start"
        >
          <Command>
            <CommandInput placeholder="Search tags..." />
            <CommandList>
              <CommandEmpty>No tags found.</CommandEmpty>
              <CommandGroup>
                {predefinedTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <CommandItem
                      key={tag}
                      onSelect={() => handleSelect(tag)}
                    >
                      <div className={cn("mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary", isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible")}>
                        <Check className="h-4 w-4" />
                      </div>
                      <span>{tag}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {/* --- 2. New Dedicated Display Area for Selected Tags --- */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {tag}
              {/* --- 3. Removable Badges with 'X' Icon --- */}
              <button
                type="button"
                onClick={() => handleRemove(tag)}
                className="rounded-full hover:bg-muted-foreground/20 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
