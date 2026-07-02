"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useWorkingImage, Provenance } from "@/lib/chaining/WorkingImageProvider";
import { CHAIN_MAP, AI_TOOL_IDS } from "@/lib/chaining/chain-map";
import { TOOLS } from "@/lib/tools/registry";
import { Button } from "@/components/ui/button";

interface ContinueWithProps {
  currentToolId: string;
  outputBlob: Blob;
  outputFileName: string;
  provenance: Provenance;
  onStartOver?: () => void;
}

export function ContinueWith({
  currentToolId,
  outputBlob,
  outputFileName,
  provenance,
  onStartOver,
}: ContinueWithProps) {
  const { setWorkingImage, clearWorkingImage } = useWorkingImage();
  const router = useRouter();

  // candidates = CHAIN_MAP[currentToolId] ?? []
  const allCandidates = CHAIN_MAP[currentToolId] ?? [];
  
  // if provenance.aiProcessingBlocked, remove any AI_TOOL_IDS from candidates
  const candidates = provenance.aiProcessingBlocked
    ? allCandidates.filter((id) => !AI_TOOL_IDS.includes(id))
    : allCandidates;

  if (candidates.length === 0) return null;

  const handleContinue = (candidate: string) => {
    setWorkingImage({
      blob: outputBlob,
      fileName: outputFileName,
      provenance: {
        ...provenance,
        sourceToolId: currentToolId,
      },
    });
    router.push(`/tools/${candidate}`);
  };

  const handleStartOver = () => {
    clearWorkingImage();
    if (onStartOver) {
      onStartOver();
    }
  };

  return (
    <div className="flex flex-col gap-3 py-4 border-t border-border/40 w-full select-none animate-fade-in">
      <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest block">
        Next Steps
      </span>
      <div className="flex flex-col sm:flex-row gap-2 w-full">
        {candidates.map((candidate) => {
          const tool = TOOLS.find((t) => t.id === candidate);
          const displayName = tool ? tool.name : candidate;
          return (
            <Button
              key={candidate}
              onClick={() => handleContinue(candidate)}
              className="flex-1 py-5 rounded-xl font-bold bg-card border border-border/60 hover:bg-accent/40 hover:text-accent-foreground text-foreground shadow-sm active:scale-[0.98] transition-all duration-150 text-xs gap-1.5"
            >
              Continue with {displayName} →
            </Button>
          );
        })}
      </div>
      <div className="flex justify-center sm:justify-start">
        <button
          onClick={handleStartOver}
          className="text-[11px] text-muted-foreground hover:text-foreground font-semibold underline underline-offset-4 cursor-pointer transition-colors"
        >
          Start over
        </button>
      </div>
    </div>
  );
}
