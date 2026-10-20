import { ArrowLeft, Pencil, Pin, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import { useNote, useRemoveNote } from "@/api/notes";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { usePageTitle } from "@/hooks/use-page-title";
import { formatDate, relativeTime } from "@/lib/format";

export function NoteShowPage() {
  const { id: idParam } = useParams<{ id: string }>();
  const id = Number(idParam);
  const navigate = useNavigate();
  const { data, isPending, isError, error, refetch } = useNote(id);
  const removeNote = useRemoveNote();
  const [confirmOpen, setConfirmOpen] = useState(false);

  usePageTitle(data?.title ?? "Note");

  if (!Number.isFinite(id) || id <= 0) {
    return (
      <EmptyState
        icon={<span className="text-lg">?</span>}
        title="Invalid note"
        description="The link does not contain a valid note id."
        action={
          <Button variant="outline" onClick={() => navigate("/notes")}>
            Back to notes
          </Button>
        }
      />
    );
  }

  if (isPending) {
    return <LoadingState label="Loading note…" />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Note not found"
        description={error.message}
        onRetry={() => void refetch()}
      />
    );
  }

  function handleDelete() {
    if (!data) {
      return;
    }
    removeNote.mutate(data.id, {
      onSuccess: () => {
        toast.success("Note deleted");
        navigate("/notes", { replace: true });
      },
      onError: (removeError) => toast.error(removeError.message),
    });
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
        <Link to="/notes">
          <ArrowLeft /> All notes
        </Link>
      </Button>

      <PageHeader
        title={data.title}
        description={`Updated ${relativeTime(data.updated_at)} · Created ${formatDate(data.created_at)}`}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to={`/notes/${data.id}/edit`}>
                <Pencil /> Edit
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Delete note"
              onClick={() => setConfirmOpen(true)}
            >
              <Trash2 />
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          {data.pinned ? (
            <Badge>
              <Pin className="size-3 fill-current" /> Pinned
            </Badge>
          ) : (
            <Badge variant="secondary">Not pinned</Badge>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {data.body || "This note has no body yet."}
          </p>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-xs text-muted-foreground">
          <Separator />
          <span>Note #{data.id} · owner set server-side from the JWT</span>
        </CardFooter>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this note?"
        description={`"${data.title}" will be removed permanently.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
