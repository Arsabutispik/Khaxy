"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface VariableTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement> | string) => void;
}

export function VariableTextarea({
  value,
  onChange,
  className,
  ...props
}: VariableTextareaProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [query, setQuery] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const t = useTranslations("VariableTextarea");

  const VARIABLES = [
    {
      label: t("user_mention.label"),
      value: "{user}",
      detail: t("user_mention.detail"),
    },
    {
      label: t("username.label"),
      value: "{name}",
      detail: t("username.detail"),
    },
    {
      label: t("server_name.label"),
      value: "{server}",
      detail: t("server_name.detail"),
    },
    {
      label: t("member_count.label"),
      value: "{memberCount}",
      detail: t("member_count.detail"),
    },
    {
      label: t("join_position.label"),
      value: "{joinPosition}",
      detail: t("join_position.detail"),
    },
    {
      label: t("created_at.label"),
      value: "{createdAt}",
      detail: t("created_at.detail"),
    },
    {
      label: t("created_ago.label"),
      value: "{createdAgo}",
      detail: t("created_ago.detail"),
    },
  ];

  // --- STRICT FILTER LOGIC ---
  // Only matches the actual variable string (e.g. "{server}")
  const filteredVariables = VARIABLES.filter((v) => {
    const search = query.toLowerCase();
    // Check against the variable text itself
    return v.value.toLowerCase().includes(search);
  });

  // Reset selection when query results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Auto-scroll
  useEffect(() => {
    if (showMenu && listRef.current) {
      const activeItem = listRef.current.children[selectedIndex] as HTMLElement;
      if (activeItem) {
        activeItem.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex, showMenu]);

  // Native Escape Listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (showMenu && e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        setShowMenu(false);
      }
    };

    if (showMenu) {
      window.addEventListener("keydown", handleGlobalKeyDown, true);
    }
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown, true);
    };
  }, [showMenu]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPosition = e.target.selectionStart;

    onChange(e);

    // Look backwards from cursor for "{"
    const textBeforeCursor = newValue.slice(0, cursorPosition);
    const lastOpenBraceIndex = textBeforeCursor.lastIndexOf("{");

    if (lastOpenBraceIndex !== -1) {
      // Extract text between "{" and cursor
      const currentQuery = textBeforeCursor.slice(lastOpenBraceIndex + 1);

      // Valid if no closing brace, no spaces, no newlines
      if (
        !currentQuery.includes("}") &&
        !currentQuery.includes(" ") &&
        !currentQuery.includes("\n")
      ) {
        setQuery(currentQuery);
        setShowMenu(true);
        return;
      }
    }

    setShowMenu(false);
    setQuery("");
  };

  const insertVariable = (variableValue: string) => {
    if (!textareaRef.current) return;

    const cursorPosition = textareaRef.current.selectionStart;
    const text = value;
    const lastOpenBraceIndex = text.lastIndexOf("{", cursorPosition - 1);

    if (lastOpenBraceIndex !== -1) {
      const before = text.substring(0, lastOpenBraceIndex);
      const after = text.substring(cursorPosition);
      const newValue = `${before}${variableValue}${after}`;

      onChange(newValue);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const newCursorPos = lastOpenBraceIndex + variableValue.length;
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    }
    setShowMenu(false);
    setQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showMenu || filteredVariables.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredVariables.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(
        (prev) =>
          (prev - 1 + filteredVariables.length) % filteredVariables.length,
      );
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      e.stopPropagation();
      insertVariable(filteredVariables[selectedIndex].value);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={cn(
          "w-full bg-zinc-900/50 text-gray-200 placeholder-zinc-600 focus:outline-none resize-none text-sm font-mono leading-relaxed custom-scrollbar p-4 rounded-md border border-white/5 focus:border-blue-500/50 transition-colors",
          className,
        )}
        {...props}
      />

      {showMenu && filteredVariables.length > 0 && (
        <div className="absolute left-0 top-full mt-2 w-auto min-w-[200px] bg-black border border-[#121a1d] rounded-md shadow-2xl overflow-hidden z-50 flex flex-col animate-in fade-in zoom-in-95 duration-100">
          <div className="bg-[#121a1d] px-3 py-2 text-[10px] uppercase font-bold text-zinc-500 tracking-wider flex justify-between">
            <span>{t("suggestions")}</span>
          </div>
          <div
            ref={listRef}
            className="max-h-[200px] overflow-y-auto custom-scrollbar p-1"
          >
            {filteredVariables.map((v, index) => (
              <button
                key={v.value}
                type="button"
                onClick={() => insertVariable(v.value)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-[4px] text-left text-sm transition-colors",
                  index === selectedIndex
                    ? "bg-[#404249] text-white"
                    : "text-zinc-400 hover:bg-[#35373C] hover:text-gray-200",
                )}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="flex flex-col">
                  <span className="font-bold text-xs">{v.value}</span>
                  <span className="text-[10px] opacity-70">{v.label}</span>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono ml-4">
                  {v.detail}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
