import { useEffect, useState, useCallback } from "react";

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(true);

  const recheck = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined") return true;

    if (!navigator.onLine) {
      setIsOnline(false);
      return false;
    }

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 3000);

    try {
      const response = await fetch(`/api/ping?t=${Date.now()}`, {
        method: "GET",
        cache: "no-store",
        signal: controller.signal,
      });
      clearTimeout(id);

      const online = response.ok || response.status === 204;
      setIsOnline(online);
      return online;
    } catch {
      clearTimeout(id);
      setIsOnline(false);
      return false;
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      recheck();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [recheck]);

  return { isOnline, recheck };
}
