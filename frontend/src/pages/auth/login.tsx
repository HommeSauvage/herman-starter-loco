import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router";

import { ApiClientError, post } from "@/api/client";
import { setToken } from "@/auth/token";
import type { LoginResponse } from "@/bindings/LoginResponse";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { usePageTitle } from "@/hooks/use-page-title";
import { AuthLayout } from "@/layouts/auth-layout";

interface LocationState {
  from?: string;
}

export function LoginPage() {
  usePageTitle("Sign in");
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const from = (location.state as LocationState | null)?.from ?? "/";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    try {
      const res = await post<LoginResponse>("/api/auth/login", {
        email,
        password,
      });
      setToken(res.token);
      await queryClient.invalidateQueries({ queryKey: ["session"] });
      navigate(from, { replace: true });
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
      title="Welcome back"
      description="Sign in to your workspace."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="font-medium underline-offset-4 hover:underline"
          >
            Create one
          </Link>
        </>
      }
    >
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
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <FieldDescription>
              <Link
                to="/forgot-password"
                className="underline-offset-4 hover:underline"
              >
                Forgot your password?
              </Link>
            </FieldDescription>
          </Field>
          {error && <FieldError>{error}</FieldError>}
          <Field>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Signing in…" : "Sign in"}
            </Button>
            <FieldDescription className="text-center">
              Demo login after{" "}
              <code className="font-mono">cargo loco db seed</code>:{" "}
              <button
                type="button"
                className="font-mono underline-offset-4 hover:underline"
                onClick={() => {
                  setEmail("user1@example.com");
                  setPassword("1234");
                }}
              >
                user1@example.com / 1234
              </button>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    </AuthLayout>
  );
}
