import { isRouteErrorResponse, Link, useRouteError } from "react-router";

import { ErrorState } from "@/components/error-state";
import { Button } from "@/components/ui/button";

export function RouteError() {
  const error = useRouteError();

  const description = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : "An unexpected error stopped this page from rendering.";

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <ErrorState
        title="This page crashed"
        description={description}
        action={
          <Button asChild>
            <Link to="/">Back to dashboard</Link>
          </Button>
        }
      />
    </div>
  );
}
