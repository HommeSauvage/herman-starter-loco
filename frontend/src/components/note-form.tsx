import { useState } from "react";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export interface NoteFormValues {
  title: string;
  body: string;
  pinned: boolean;
}

interface NoteFormProps {
  defaultValues?: NoteFormValues;
  submitLabel: string;
  isPending: boolean;
  error?: string | null;
  onSubmit: (values: NoteFormValues) => void;
  onCancel: () => void;
}

export function NoteForm({
  defaultValues,
  submitLabel,
  isPending,
  error,
  onSubmit,
  onCancel,
}: NoteFormProps) {
  const [title, setTitle] = useState(defaultValues?.title ?? "");
  const [body, setBody] = useState(defaultValues?.body ?? "");
  const [pinned, setPinned] = useState(defaultValues?.pinned ?? false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ title, body, pinned });
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="title">Title</FieldLabel>
          <Input
            id="title"
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What is this note about?"
            required
            autoFocus
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="body">Body</FieldLabel>
          <Textarea
            id="body"
            name="body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Write it down before it is gone."
            className="min-h-64 resize-y"
          />
          <FieldDescription>
            Plain text for now. A markdown renderer is a small, contained change
            when the product needs one.
          </FieldDescription>
        </Field>
        <Field orientation="horizontal">
          <Checkbox
            id="pinned"
            checked={pinned}
            onCheckedChange={(checked) => setPinned(checked === true)}
          />
          <div className="grid gap-1">
            <FieldLabel htmlFor="pinned">Pin this note</FieldLabel>
            <FieldDescription>
              Pinned notes sort to the top of the list.
            </FieldDescription>
          </div>
        </Field>
        {error && <FieldError>{error}</FieldError>}
        <Field orientation="horizontal">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving…" : submitLabel}
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
