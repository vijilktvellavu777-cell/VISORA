import { redirect } from "next/navigation";

export default function NewSegmentRedirect() {
  redirect("/audience/segments/new");
}
