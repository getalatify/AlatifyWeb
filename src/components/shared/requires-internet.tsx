"use client";

import React, { useState } from "react";
import { WifiOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RequiresInternetProps {
  toolName: string;
  onCheckConnection: () => Promise<boolean>;
}

export function RequiresInternet({ toolName, onCheckConnection }: RequiresInternetProps) {
  const [isChecking, setIsChecking] = useState(false);

  const handleCheck = async () => {
    setIsChecking(true);
    const online = await onCheckConnection();
    setIsChecking(false);

    if (online) {
      import("sonner").then(({ toast }) => {
        toast.success("Connection restored! You can now use the tool.");
      });
    } else {
      import("sonner").then(({ toast }) => {
        toast.error("Still offline. Please check your internet connection.");
      });
    }
  };

  return (
    <div className="glass-fake flex flex-col items-center justify-center text-center p-8 rounded-xl max-w-md mx-auto my-12 border border-border bg-card/50">
      <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-4">
        {isChecking ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <WifiOff className="w-6 h-6" />
        )}
      </div>
      <h3 className="text-xl font-semibold mb-2">Connection Required</h3>
      <p className="text-muted-foreground text-sm mb-6">
        The <strong>{toolName}</strong> tool requires an active internet connection to download AI weights or fetch external databases.
      </p>
      <Button
        variant="secondary"
        onClick={handleCheck}
        disabled={isChecking}
        className="w-full sm:w-auto"
      >
        {isChecking ? "Checking..." : "Check Connection"}
      </Button>
    </div>
  );
}
