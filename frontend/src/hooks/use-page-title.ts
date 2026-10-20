import { useEffect } from "react";

/** Keeps the document title in step with the page. */
export function usePageTitle(title: string | null): void {
  useEffect(() => {
    document.title = title ? `${title} · Herman Loco` : "Herman Loco";
  }, [title]);
}
