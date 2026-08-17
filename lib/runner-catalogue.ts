export interface RunnerModelOption {
  modelId: string;
  displayName: string;
}

export interface RunnerCatalogueItem {
  runnerId: string;
  displayName: string;
  models: RunnerModelOption[];
}

export interface RunnerCatalogueResponse {
  runners: RunnerCatalogueItem[];
}

export function mapUpstreamRunners(raw: unknown): RunnerCatalogueResponse {
  if (!raw || typeof raw !== "object") {
    throw new Error("invalid runner catalogue payload");
  }
  const rec = raw as Record<string, unknown>;
  const rows = Array.isArray(rec.runners) ? rec.runners : [];
  return {
    runners: rows
      .filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === "object")
      .map((row) => ({
        runnerId: String(row.runner_id ?? ""),
        displayName: String(row.display_name ?? row.runner_id ?? ""),
        models: mapModels(row.models),
      }))
      .filter((row) => Boolean(row.runnerId)),
  };
}

function mapModels(raw: unknown): RunnerModelOption[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === "object")
    .map((row) => ({
      modelId: String(row.model_id ?? ""),
      displayName: String(row.display_name ?? row.model_id ?? ""),
    }))
    .filter((row) => Boolean(row.modelId));
}

export function modelsForRunner(
  catalogue: RunnerCatalogueResponse | null,
  runnerId: string,
): RunnerModelOption[] {
  if (!catalogue) return [];
  return catalogue.runners.find((row) => row.runnerId === runnerId)?.models ?? [];
}
