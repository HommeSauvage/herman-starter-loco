import { useSyncExternalStore } from "react";

const TOKEN_KEY = "auth_token";
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeToken(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getToken(): string | null {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
  emit();
}

export function clearToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
  emit();
}

/** The token as React state — re-renders on login and logout. */
export function useToken(): string | null {
  return useSyncExternalStore(subscribeToken, getToken, () => null);
}
