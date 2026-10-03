import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "TutoBell",
  description: "Register as a student or teacher on TutoBell.",
};

export default function TutoBellLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${sans.className} min-h-screen bg-white text-[#0f172a]`}>{children}</div>;
}
