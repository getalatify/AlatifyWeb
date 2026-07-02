"use client";

import { useEffect, useRef, useState } from "react";
import { useWorkingImage, WorkingImage } from "./WorkingImageProvider";

export function useHandoffInput() {
  const { consumeWorkingImage } = useWorkingImage();
  const [handoff, setHandoff] = useState<WorkingImage | null>(null);
  const consumedRef = useRef(false);

  useEffect(() => {
    if (consumedRef.current) return;
    consumedRef.current = true;

    const img = consumeWorkingImage();
    if (img) {
      setHandoff(img);
    }
  }, [consumeWorkingImage]);

  return handoff;
}
