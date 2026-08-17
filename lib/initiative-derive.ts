import { fleetRepoKey } from "@/lib/fleet-rows";

export { fleetRepoKey };

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function waveRows(data: unknown): Record<string, unknown>[] {
  const waves = asRecord(data)?.waves;
  if (!Array.isArray(waves)) return [];
  return waves.map(asRecord).filter((row): row is Record<string, unknown> => row !== null);
}

function textField(row: Record<string, unknown>, key: string): string {
  const value = row[key];
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

/** Tenant workspace_root + admitted org/repo — same layout gateflow uses on select. */
export function deriveRepoWorkspacePath(
  workspaceRoot: string | null | undefined,
  org: string,
  repo: string,
): string | null {
  const base = (workspaceRoot ?? "").trim().replace(/\/+$/, "");
  const o = org.trim();
  const r = repo.trim();
  if (!base.startsWith("/") || !o || !r) return null;
  return `${base}/${o}/${r}`;
}

export function waveIdsFromMap(data: unknown): string[] {
  return waveRows(data)
    .map((row) => textField(row, "wave_id"))
    .filter(Boolean);
}

export function waveTicketIdsFromMap(data: unknown): string[] {
  return waveRows(data)
    .map((row) => textField(row, "ticket_id"))
    .filter(Boolean);
}
