import { useNavigate } from "react-router";
import { toast } from "sonner";

import { useCreateNote } from "@/api/notes";
import { NoteForm } from "@/components/note-form";
import type { NoteFormValues } from "@/components/note-form";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { usePageTitle } from "@/hooks/use-page-title";

export function NoteNewPage() {
  usePageTitle("New note");
  const navigate = useNavigate();
  const createNote = useCreateNote();

  function handleSubmit(values: NoteFormValues) {
    createNote.mutate(
      {
        title: values.title,
        body: values.body,
        pinned: values.pinned,
      },
      {
        onSuccess: (note) => {
          toast.success("Note created");
          navigate(`/notes/${note.id}`, { replace: true });
        },
        onError: (error) => toast.error(error.message),
      },
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <PageHeader
        title="New note"
        description="The form writes to the typed API and the list updates itself."
      />
      <Card>
        <CardContent>
          <NoteForm
            submitLabel="Create note"
            isPending={createNote.isPending}
            error={createNote.error?.message}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/notes")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
