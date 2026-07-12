"use client";

import React, { useState } from "react";
import { WifiOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/useT";

interface RequiresInternetProps {
  toolName: string;
  onCheckConnection: () => Promise<boolean>;
}

export function RequiresInternet({ toolName, onCheckConnection }: RequiresInternetProps) {
  const t = useT();
  const [isChecking, setIsChecking] = useState(false);

  const handleCheck = async () => {
    setIsChecking(true);
    const online = await onCheckConnection();
    setIsChecking(false);

    if (online) {
      import("sonner").then(({ toast }) => {
        toast.success(t("requiresInternet.toast.restored"));
      });
    } else {
      import("sonner").then(({ toast }) => {
        toast.error(t("requiresInternet.toast.stillOffline"));
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-card border border-border/80 rounded-2xl shadow-xl flex flex-col items-center text-center gap-4 animate-fade-in">
      <div className="w-12 h-12 rounded-full bg-destructive/15 flex items-center justify-center border border-destructive/20 text-destructive animate-pulse">
        <WifiOff className="w-6 h-6" />
      </div>

      <div className="space-y-1.5">
        <h3 className="font-bold text-base text-foreground">{t("requiresInternet.title")}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t("requiresInternet.desc", { toolName })}
        </p>
      </div>

      <Button
        variant="outline"
        size="sm"
        disabled={isChecking}
        onClick={handleCheck}
        className="w-full gap-2 text-xs border-border hover:bg-muted font-bold active:scale-[0.98] transition-all"
      >
        {isChecking ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            {t("requiresInternet.checking")}
          </>
        ) : (
          t("requiresInternet.checkButton")
        )}
      </Button>
    </div>
  );
}
