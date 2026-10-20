import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router";

import { ApiClientError, post } from "@/api/client";
import { setToken } from "@/auth/token";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { AuthLayout } from "@/layouts/auth-layout";

interface LoginResponse {
  token: string;
  pid: string;
  name: string;
  is_verified: boolean;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    try {
      await post("/api/auth/register", { name, email, password });
      // Registration does not return a token, so sign in with the same
      // credentials right away — one less step for the user.
      const res = await post<LoginResponse>("/api/auth/login", {
        email,
        password,
      });
      setToken(res.token);
      await queryClient.invalidateQueries({ queryKey: ["session"] });
      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Could not reach the server. Is `cargo loco start` running?",
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      description="Start with a workspace, a typed API, and a green test suite."
      footer={
        <>
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input
              id="name"
              name="name"
              autoComplete="name"
              placeholder="Ada Lovelace"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </Field>
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
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </Field>
          {error && <FieldError>{error}</FieldError>}
          <Field>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Creating account…" : "Create account"}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </AuthLayout>
  );
}
