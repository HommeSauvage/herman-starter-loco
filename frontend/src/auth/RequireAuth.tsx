import { Navigate, Outlet, useLocation } from "react-router";

import { useSession } from "@/auth/session";

export function RequireAuth() {
  const { token } = useSession();
  const location = useLocation();

  if (token === null) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  return <Outlet />;
}
