import { CanvasWizard } from "@/components/canvas-wizard";

export default async function EditCanvasPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CanvasWizard canvasId={id} />;
}
