import { TrainFront } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";

interface AuthLayoutProps {
  title: string;
  description: string;
  footer?: ReactNode;
  children: ReactNode;
}

export function AuthLayout({
  title,
  description,
  footer,
  children,
}: AuthLayoutProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-muted p-10 lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,var(--border)_1px,transparent_0)] [background-size:24px_24px] opacity-60"
        />
        <Link to="/" className="relative flex items-center gap-2 font-semibold">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <TrainFront className="size-4" />
          </div>
          Herman Loco
        </Link>
        <div className="relative max-w-md space-y-4">
          <p className="text-2xl leading-snug font-medium tracking-tight text-balance">
            A Loco starter that boots green: auth, typed API, typed UI, and a
            test suite that already passes.
          </p>
          <p className="text-sm text-muted-foreground">
            Rust on the backend, React on the frontend, one contract between
            them generated from your Rust DTOs.
          </p>
        </div>
        <p className="relative text-xs text-muted-foreground">
          Loco 1.2 · Rust · React · shadcn/ui
        </p>
      </div>

      <div className="flex flex-col items-center justify-center gap-6 p-6 md:p-10">
        <Link
          to="/"
          className="flex items-center gap-2 font-semibold lg:hidden"
        >
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <TrainFront className="size-4" />
          </div>
          Herman Loco
        </Link>
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          {children}
          {footer && <div className="text-center text-sm">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
