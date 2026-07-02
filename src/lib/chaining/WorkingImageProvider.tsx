"use client";

import React, { createContext, useContext, useState } from "react";

export type ImageSourceType = "user-upload" | "stock-unsplash" | "stock-pexels" | "stock-pixabay";

export interface Provenance {
  sourceToolId: string;
  sourceType: ImageSourceType;
  aiProcessingBlocked: boolean;
}

export interface WorkingImage {
  blob: Blob;
  fileName: string;
  provenance: Provenance;
}

interface WorkingImageContextProps {
  workingImage: WorkingImage | null;
  setWorkingImage: (img: WorkingImage) => void;
  clearWorkingImage: () => void;
  consumeWorkingImage: () => WorkingImage | null;
}

const WorkingImageContext = createContext<WorkingImageContextProps | undefined>(undefined);

export function WorkingImageProvider({ children }: { children: React.ReactNode }) {
  const [workingImage, setWorkingImageState] = useState<WorkingImage | null>(null);

  const setWorkingImage = (img: WorkingImage) => {
    setWorkingImageState(img);
  };

  const clearWorkingImage = () => {
    setWorkingImageState(null);
  };

  const consumeWorkingImage = () => {
    if (!workingImage) return null;
    const img = workingImage;
    setWorkingImageState(null);
    return img;
  };

  return (
    <WorkingImageContext.Provider
      value={{
        workingImage,
        setWorkingImage,
        clearWorkingImage,
        consumeWorkingImage,
      }}
    >
      {children}
    </WorkingImageContext.Provider>
  );
}

export function useWorkingImage() {
  const context = useContext(WorkingImageContext);
  if (!context) {
    throw new Error("useWorkingImage must be used within a WorkingImageProvider");
  }
  return context;
}
