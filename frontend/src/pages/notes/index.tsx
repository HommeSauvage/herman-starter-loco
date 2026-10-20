import { MoreHorizontal, Pin, Plus, Search, StickyNote } from "lucide-react";
import { useDeferredValue, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

import { useListNotes, useRemoveNote } from "@/api/notes";
import type { NoteDto } from "@/bindings/NoteDto";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePageTitle } from "@/hooks/use-page-title";
import { relativeTime } from "@/lib/format";

const PAGE_SIZE = 10;

type Filter = "all" | "pinned";

function NoteRow({ note, onDelete }: { note: NoteDto; onDelete: () => void }) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <TableRow>
      <TableCell className="max-w-0">
        <div className="flex items-center gap-2">
          {note.pinned && (
            <Pin className="size-3.5 shrink-0 fill-current text-muted-foreground" />
          )}
          <Link
            to={`/notes/${note.id}`}
            className="truncate font-medium underline-offset-4 hover:underline"
          >
            {note.title}
          </Link>
        </div>
        <p className="truncate text-sm text-muted-foreground">{note.body}</p>
      </TableCell>
      <TableCell className="hidden text-sm whitespace-nowrap text-muted-foreground sm:table-cell">
        {relativeTime(note.updated_at)}
      </TableCell>
      <TableCell className="w-10 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Note actions">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/notes/${note.id}`}>View</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={`/notes/${note.id}/edit`}>Edit</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => setConfirmOpen(true)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Delete this note?"
          description={`"${note.title}" will be removed permanently.`}
          onConfirm={onDelete}
        />
      </TableCell>
    </TableRow>
  );
}

export function NotesIndexPage() {
  usePageTitle("Notes");

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const deferredSearch = useDeferredValue(search);

  const { data, isPending, isError, error, refetch } = useListNotes({
    page,
    page_size: PAGE_SIZE,
    q: deferredSearch.trim() || undefined,
    pinned: filter === "pinned" ? true : undefined,
  });
  const removeNote = useRemoveNote();

  function handleDelete(id: number) {
    removeNote.mutate(id, {
      onSuccess: () => toast.success("Note deleted"),
      onError: (err) => toast.error(err.message),
    });
  }

  const totalPages = data?.total_pages ?? 0;
  const isFiltered = deferredSearch.trim().length > 0 || filter !== "all";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notes"
        description="A reference module: typed API, user-scoped queries, tests."
        actions={
          <Button asChild>
            <Link to="/notes/new">
              <Plus /> New note
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search notes…"
            aria-label="Search notes"
            className="pl-8"
          />
        </div>
        <Tabs
          value={filter}
          onValueChange={(value) => {
            setFilter(value as Filter);
            setPage(1);
          }}
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pinned">Pinned</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isPending ? (
        <LoadingState label="Loading notes…" />
      ) : isError ? (
        <ErrorState
          description={error.message}
          onRetry={() => void refetch()}
        />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          icon={<StickyNote />}
          title={isFiltered ? "No notes match" : "No notes yet"}
          description={
            isFiltered
              ? "Try a different search, or clear the pinned filter."
              : "Notes are the starter's reference CRUD module. Create one to see the whole stack."
          }
          action={
            isFiltered ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setFilter("all");
                }}
              >
                Clear filters
              </Button>
            ) : (
              <Button asChild>
                <Link to="/notes/new">
                  <Plus /> New note
                </Link>
              </Button>
            )
          }
        />
      ) : (
        <Card className="overflow-hidden py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Note</TableHead>
                <TableHead className="hidden sm:table-cell">Updated</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((note) => (
                <NoteRow
                  key={note.id}
                  note={note}
                  onDelete={() => handleDelete(note.id)}
                />
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
            <span>
              {data.total_items} {data.total_items === 1 ? "note" : "notes"}
            </span>
            <div className="flex items-center gap-2">
              <span className="tabular-nums">
                {data.page} / {Math.max(totalPages, 1)}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={data.page <= 1}
                onClick={() => setPage((current) => Math.max(current - 1, 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={data.page >= totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
