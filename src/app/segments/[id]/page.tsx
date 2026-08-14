import { redirect } from "next/navigation";

export default async function SegmentDetailRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/audience/segments/${id}`);
}
