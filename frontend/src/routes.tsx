import { createBrowserRouter } from "react-router";

import { RequireAuth } from "@/auth/RequireAuth";
import { AppLayout } from "@/layouts/app-layout";
import { ForgotPasswordPage } from "@/pages/auth/forgot-password";
import { LoginPage } from "@/pages/auth/login";
import { RegisterPage } from "@/pages/auth/register";
import { DashboardPage } from "@/pages/dashboard";
import { NotFoundPage } from "@/pages/not-found";
import { NotesIndexPage } from "@/pages/notes";
import { NoteEditPage } from "@/pages/notes/edit";
import { NoteNewPage } from "@/pages/notes/new";
import { NoteShowPage } from "@/pages/notes/show";
import { RouteError } from "@/pages/route-error";
import { Root } from "@/root";

export const router = createBrowserRouter([
  {
    element: <Root />,
    errorElement: <RouteError />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { index: true, element: <DashboardPage /> },
              { path: "notes", element: <NotesIndexPage /> },
              { path: "notes/new", element: <NoteNewPage /> },
              { path: "notes/:id", element: <NoteShowPage /> },
              { path: "notes/:id/edit", element: <NoteEditPage /> },
            ],
          },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
