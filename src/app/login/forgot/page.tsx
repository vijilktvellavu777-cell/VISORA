import { Suspense } from "react";
import { ForgotPasswordPage } from "@/components/forgot-password-page";

export default function ForgotPasswordRoutePage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordPage />
    </Suspense>
  );
}
