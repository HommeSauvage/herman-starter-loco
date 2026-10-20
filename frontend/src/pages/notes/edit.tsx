import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import { useNote, useUpdateNote } from "@/api/notes";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { NoteForm } from "@/components/note-form";
import type { NoteFormValues } from "@/components/note-form";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePageTitle } from "@/hooks/use-page-title";

export function NoteEditPage() {
  const { id: idParam } = useParams<{ id: string }>();
  const id = Number(idParam);
  const navigate = useNavigate();
  const { data, isPending, isError, error, refetch } = useNote(id);
  const updateNote = useUpdateNote();

  usePageTitle(data ? `Edit ${data.title}` : "Edit note");

  function handleSubmit(values: NoteFormValues) {
    updateNote.mutate(
      {
        id,
        data: {
          title: values.title,
          body: values.body,
          pinned: values.pinned,
        },
      },
      {
        onSuccess: (note) => {
          toast.success("Note saved");
          navigate(`/notes/${note.id}`, { replace: true });
        },
        onError: (updateError) => toast.error(updateError.message),
      },
    );
  }

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

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <PageHeader title="Edit note" description="Changes save in place." />
      <Card>
        <CardContent>
          <NoteForm
            key={data.updated_at}
            defaultValues={{
              title: data.title,
              body: data.body,
              pinned: data.pinned,
            }}
            submitLabel="Save changes"
            isPending={updateNote.isPending}
            error={updateNote.error?.message}
            onSubmit={handleSubmit}
            onCancel={() => navigate(`/notes/${data.id}`)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
