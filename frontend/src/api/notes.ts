import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";

import { del, get, post, put } from "@/api/client";
import type { ApiClientError } from "@/api/client";
import type { CreateNote } from "@/bindings/CreateNote";
import type { NoteDto } from "@/bindings/NoteDto";
import type { NoteStats } from "@/bindings/NoteStats";
import type { Page } from "@/bindings/Page";
import type { UpdateNote } from "@/bindings/UpdateNote";

export interface ListNotesParams {
  page?: number;
  page_size?: number;
  q?: string;
  pinned?: boolean;
}

export const noteKeys = {
  all: ["notes"] as const,
  list: (params?: ListNotesParams) => ["notes", "list", params ?? {}] as const,
  detail: (id: number) => ["notes", "detail", id] as const,
  stats: ["notes", "stats"] as const,
};

function buildQueryString(params?: ListNotesParams): string {
  if (!params) {
    return "";
  }

  const search = new URLSearchParams();
  if (params.page !== undefined) {
    search.set("page", String(params.page));
  }
  if (params.page_size !== undefined) {
    search.set("page_size", String(params.page_size));
  }
  if (params.q) {
    search.set("q", params.q);
  }
  if (params.pinned !== undefined) {
    search.set("pinned", String(params.pinned));
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

export function useListNotes(
  params?: ListNotesParams,
): UseQueryResult<Page<NoteDto>, ApiClientError> {
  return useQuery({
    queryKey: noteKeys.list(params),
    queryFn: () => get<Page<NoteDto>>(`/api/notes${buildQueryString(params)}`),
  });
}

export function useNoteStats(): UseQueryResult<NoteStats, ApiClientError> {
  return useQuery({
    queryKey: noteKeys.stats,
    queryFn: () => get<NoteStats>("/api/notes/stats"),
  });
}

export function useNote(id: number): UseQueryResult<NoteDto, ApiClientError> {
  return useQuery({
    queryKey: noteKeys.detail(id),
    queryFn: () => get<NoteDto>(`/api/notes/${id}`),
    enabled: Number.isFinite(id) && id > 0,
  });
}

export function useCreateNote(): UseMutationResult<
  NoteDto,
  ApiClientError,
  CreateNote
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateNote) => post<NoteDto>("/api/notes", data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: noteKeys.all });
    },
  });
}

export interface UpdateNoteVariables {
  id: number;
  data: UpdateNote;
}

export function useUpdateNote(): UseMutationResult<
  NoteDto,
  ApiClientError,
  UpdateNoteVariables
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: UpdateNoteVariables) =>
      put<NoteDto>(`/api/notes/${id}`, data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: noteKeys.all });
      void queryClient.invalidateQueries({
        queryKey: noteKeys.detail(variables.id),
      });
    },
  });
}

export function useRemoveNote(): UseMutationResult<
  void,
  ApiClientError,
  number
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => del(`/api/notes/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: noteKeys.all });
    },
  });
}
