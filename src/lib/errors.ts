export function friendlyDataError(error: unknown, fallback = "Something went wrong while saving local data."): string {
  const message = error instanceof Error ? error.message : "";
  const normalized = message.toLowerCase();

  if (normalized.includes("quota") || normalized.includes("storage")) {
    return "Browser storage space may be full. Export a backup, remove unused browser data, then try again.";
  }
  if (normalized.includes("indexeddb") || normalized.includes("database")) {
    return "Local database is unavailable. Check browser permissions, reload the app, and restore a backup if needed.";
  }
  if (normalized.includes("security") || normalized.includes("private browsing")) {
    return "This browser mode may block local storage. Use a regular browser window, then try again.";
  }
  return message || fallback;
}