import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router";

import { post } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { AuthLayout } from "@/layouts/auth-layout";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    try {
      await post("/api/auth/forgot", { email });
    } finally {
      setIsPending(false);
      setSent(true);
    }
  }

  return (
    <AuthLayout
      title="Reset your password"
      description="We will email you a link to choose a new password."
      footer={
        <Link
          to="/login"
          className="font-medium underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        <p className="text-sm text-muted-foreground">
          If an account exists for <span className="font-medium">{email}</span>,
          the reset link is on its way. In development, mail is stubbed — set
          <code className="mx-1 font-mono">mailer.stub: false</code> and run
          Mailpit to read it.
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </Field>
            <Field>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Sending…" : "Send reset link"}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      )}
    </AuthLayout>
  );
}
