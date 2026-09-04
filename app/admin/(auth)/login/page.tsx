import type { Metadata } from "next";
import { SignInForm } from "@/components/forms/SignInForm";

export const metadata: Metadata = {
  title: "Admin Sign In | Mian Tayyab Steel",
  robots: { index: false },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-neutral-100 bg-white p-8">
        <div className="mb-6 flex items-center gap-2 text-neutral-950">
          <span aria-hidden="true" className="h-6 w-1.5 bg-brand-600" />
          <span className="text-xl font-bold tracking-tight">MTS Admin</span>
        </div>
        <SignInForm />
      </div>
    </div>
  );
}
