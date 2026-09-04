"use client";

import { useActionState } from "react";
import { signIn } from "@/lib/actions/auth";
import { initialSignInFormState } from "@/lib/validation/auth";
import { FormField, formInputClasses } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

export function SignInForm() {
  const [state, formAction, pending] = useActionState(signIn, initialSignInFormState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <FormField label="Email" htmlFor="email" required>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={formInputClasses}
        />
      </FormField>

      <FormField label="Password" htmlFor="password" required>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={formInputClasses}
        />
      </FormField>

      {state.status === "error" && (
        <p role="alert" className="text-body-sm text-red-600">
          {state.message}
        </p>
      )}

      <Button type="submit" variant="primary" disabled={pending} className="w-full">
        {pending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
