export const CANVAS_WIZARD_DRAFT_KEY = "visora-canvas-wizard-draft";
export const CANVAS_WIZARD_CREATING_KEY = "visora-canvas-wizard-creating";

export function clearCanvasWizardDraftSession() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(CANVAS_WIZARD_DRAFT_KEY);
  sessionStorage.removeItem(CANVAS_WIZARD_CREATING_KEY);
}

export async function waitForCanvasWizardDraftId(timeoutMs = 8000): Promise<string | null> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const id = sessionStorage.getItem(CANVAS_WIZARD_DRAFT_KEY);
    if (id) return id;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return null;
}
