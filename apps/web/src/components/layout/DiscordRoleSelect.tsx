"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { SafeRole } from "@/types/types.js";

interface DiscordRoleSelectProps {
  label: string;
  value?: string | null;
  roles: SafeRole[];
  onChange: (value: string | undefined) => void;
  placeholder?: string;
}

export function DiscordRoleSelect({
  label,
  value,
  roles,
  onChange,
  placeholder = "Select a role",
}: DiscordRoleSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const selectedRole = roles.find((r) => r.id === value);

  const getRoleColor = (color: number) => {
    return color !== 0 ? `#${color.toString(16).padStart(6, "0")}` : "#99aab5";
  };

  const filteredRoles = useMemo(() => {
    return [...roles]
      .sort((a, b) => b.position - a.position)
      .filter((r) => r.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [roles, searchQuery]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          // Changed justify-center to justify-between to space out the text and icons
          className="group flex items-center justify-between md:justify-center w-full md:w-auto px-3 py-2.5 bg-black hover:bg-zinc-900 border border-white/10 rounded-md transition-all text-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          aria-label={label}
        >
          <span className="flex items-center gap-2 truncate mr-2">
            {selectedRole ? (
              <>
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0 border border-white/10"
                  style={{ backgroundColor: getRoleColor(selectedRole.color) }}
                />
                <span
                  className="font-medium truncate"
                  style={{
                    color:
                      getRoleColor(selectedRole.color) !== "#99aab5"
                        ? getRoleColor(selectedRole.color)
                        : undefined,
                  }}
                >
                  {selectedRole.name}
                </span>
              </>
            ) : (
              <span className="text-zinc-500">{placeholder}</span>
            )}
          </span>

          <div className="flex items-center gap-1">
            {/* Clear Button Logic */}
            {selectedRole && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation(); // Stop dialog from opening
                  onChange(undefined);
                }}
                className="p-0.5 rounded-sm hover:bg-white/20 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </span>
            )}

            <ChevronDown className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors flex-shrink-0" />
          </div>
        </button>
      </DialogTrigger>

      <DialogContent className="bg-black border border-white/10 text-gray-100 max-w-[440px] p-0 gap-0 shadow-2xl overflow-hidden">
        <DialogHeader className="p-4 pb-2 bg-black border-b border-white/5">
          <DialogTitle className="text-xs font-bold uppercase text-zinc-500 tracking-wider">
            {label}
          </DialogTitle>
        </DialogHeader>

        <div className="p-3 bg-black">
          <div className="relative">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search roles..."
              className="w-full bg-zinc-900/50 text-gray-200 text-sm rounded-md px-2 py-2 pl-9 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500 border border-transparent focus:border-blue-500/50"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600" />
          </div>
        </div>

        <div className="max-h-[350px] overflow-y-auto p-2 space-y-[2px] custom-scrollbar bg-black">
          {filteredRoles.length > 0 ? (
            filteredRoles.map((role) => (
              <DialogClose asChild key={role.id}>
                <button
                  onClick={() => {
                    onChange(role.id);
                    setSearchQuery("");
                  }}
                  className={cn(
                    "w-full flex items-center px-3 py-2 rounded-sm group transition-all text-sm mb-0.5",
                    value === role.id
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-gray-200",
                  )}
                >
                  <span
                    className={cn(
                      "w-3 h-3 rounded-full mr-3 flex-shrink-0 border border-white/10",
                    )}
                    style={{ backgroundColor: getRoleColor(role.color) }}
                  />

                  <span
                    className={cn(
                      "font-medium flex-1 text-left truncate",
                      role.name === "@everyone" ? "opacity-70" : "",
                    )}
                  >
                    {role.name}
                  </span>

                  {value === role.id && (
                    <Check className="w-4 h-4 text-white flex-shrink-0" />
                  )}
                </button>
              </DialogClose>
            ))
          ) : (
            <div className="text-center py-8 text-zinc-600 text-sm">
              No roles found
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
