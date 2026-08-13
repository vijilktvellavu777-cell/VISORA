"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui";

export function LaunchCanvasButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function launch() {
    setBusy(true);
    await fetch(`/api/canvas/${id}/launch`, { method: "POST" });
    setBusy(false);
    router.refresh();
  }

  return <Button onClick={launch}>{busy ? "Launching…" : "Launch"}</Button>;
}
