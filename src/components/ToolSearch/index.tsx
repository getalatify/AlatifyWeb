"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Search, X } from "lucide-react";
import Link from "next/link";
import { searchTools, SEARCHABLE_TOOLS } from "@/lib/tools/search";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function ToolSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const results = query ? searchTools(query).map(r => r.tool) : SEARCHABLE_TOOLS;

  useEffect(() => {
    setMounted(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        !(dropdownRef.current && dropdownRef.current.contains(target))
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const isMobile = window.innerWidth < 640;
        
        let left: number;
        let width: number;
        
        if (isMobile) {
          width = window.innerWidth - 32; // calc(100vw - 2rem)
          const leftVal = rect.right + window.scrollX - width;
          left = Math.max(16, leftVal);
        } else {
          width = 400; // sm:w-[400px]
          left = rect.left + window.scrollX;
          if (left + width > window.innerWidth - 16) {
            left = Math.max(16, window.innerWidth - width - 16);
          }
        }
        
        setCoords({
          top: rect.bottom + window.scrollY,
          left,
          width,
        });
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, { capture: true });

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, { capture: true });
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    } else {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[selectedIndex]) {
        router.push(results[selectedIndex].route);
        setIsOpen(false);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-secondary/50 hover:bg-secondary rounded-md border border-border/50 transition-colors"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline-block">Search tools...</span>
        <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {isOpen && mounted && coords && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: "absolute",
            top: `${coords.top + 8}px`,
            left: `${coords.left}px`,
            width: `${coords.width}px`,
            zIndex: 9999,
          }}
          className="bg-background border border-border rounded-xl shadow-lg overflow-hidden flex flex-col"
        >
          <div className="flex items-center p-3 border-b border-border/50">
            <Search className="w-5 h-5 text-muted-foreground shrink-0 mr-2" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search for tools..."
              className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground text-foreground"
            />
            {query && (
              <button onClick={() => setQuery("")} className="p-1 hover:bg-secondary rounded-full transition-colors text-muted-foreground">
                 <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="max-h-[300px] overflow-y-auto py-2">
            {results.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No tool found for &quot;{query}&quot;.
              </div>
            ) : (
              <div className="flex flex-col gap-1 px-2">
                {results.map((tool, index) => (
                  <Link
                    key={tool.id}
                    href={tool.route}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex flex-col px-3 py-2 rounded-lg transition-colors cursor-pointer outline-none",
                      selectedIndex === index
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-secondary/50 text-foreground"
                    )}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-sm">{tool.name}</span>
                        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-secondary/50 text-muted-foreground border border-border/50">
                           {tool.category}
                        </span>
                    </div>
                    <span className="text-xs text-muted-foreground truncate mt-0.5">
                      {tool.description}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
