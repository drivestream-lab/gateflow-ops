/** Pure helpers for the meta PR picker + operator-shaped spec start (INIT-019). */

export type Cap01Tone = "ready" | "missing_label" | "stale" | "blocked" | "unverified";

export interface MetaPrCheckpoint {
  checkpointId: string;
  verdict: string;
  checkedSha: string | null;
  staleReason: string | null;
  missingItems: { kind: string; name: string }[];
}

export interface MetaPrSpecRunJoin {
  org: string;
  repo: string;
  specRunId: string;
}

export interface MetaPrPickerItem {
  number: number;
  htmlUrl: string;
  title: string;
  state: string;
  merged: boolean;
  initiativeId: string;
  checkpoint: MetaPrCheckpoint;
  specRuns: MetaPrSpecRunJoin[];
  onboarded: boolean;
}

export function pickerPullsPath(refresh = false): string {
  return refresh ? "/api/gateflow/meta/pulls?refresh=true" : "/api/gateflow/meta/pulls";
}

export function onboardedPullsPath(): string {
  return "/api/gateflow/meta/pulls/onboarded";
}

export function onboardPullPath(): string {
  return "/api/gateflow/meta/pulls/onboard";
}

export interface MetaPrPickerResponse {
  metaOrg: string;
  metaRepo: string;
  items: MetaPrPickerItem[];
}

export interface SpecStartFields {
  initiativeId: string;
  org?: string;
  repo?: string;
  metaPrUrl: string;
  baseBranch: string;
  runner: string;
  modelId: string;
}

export function classifyCap01(checkpoint: MetaPrCheckpoint): Cap01Tone {
  if (checkpoint.verdict === "satisfied") return "ready";
  if (checkpoint.staleReason) return "stale";
  if (checkpoint.verdict === "could_not_verify") return "unverified";
  const kinds = new Set(checkpoint.missingItems.map((item) => item.kind));
  if (kinds.has("blocking_label")) return "blocked";
  if (kinds.has("label")) return "missing_label";
  return "blocked";
}

export function specRunForRepo(item: MetaPrPickerItem, org: string, repo: string): string | null {
  const match = item.specRuns.find((row) => row.org === org && row.repo === repo);
  return match?.specRunId ?? null;
}

export function canStartSpec(item: MetaPrPickerItem, org: string, repo: string): boolean {
  return (
    item.onboarded &&
    item.checkpoint.verdict === "satisfied" &&
    Boolean(org && repo) &&
    specRunForRepo(item, org, repo) == null
  );
}

export type SpecLaneStatus = "not_started" | "open" | "closed";

const BOARD_TICKETS_NODE = "board-tickets-action";

/** Spec lane row status. Closed when the spec run is at board-tickets-action (Spec PR merged). */
export function classifySpecLaneStatus(args: {
  specRunId: string | null;
  workflowNode?: string | null;
  nextStepNodeId?: string | null;
}): SpecLaneStatus {
  if (!args.specRunId) return "not_started";
  const node = (args.workflowNode ?? args.nextStepNodeId ?? "").trim();
  if (node === BOARD_TICKETS_NODE) return "closed";
  return "open";
}

export type SpecProgressTone = "running" | "draft_pr" | "unknown";

/** Spec progress copy — a Draft Spec PR is never “spec done”. */
export function classifySpecProgress(data: Record<string, unknown> | null): SpecProgressTone {
  if (!data) return "unknown";
  const status = String(data.spec_run_status ?? "").toLowerCase();
  if (status === "active") return "running";
  if (data.draft_spec_pr_number != null) return "draft_pr";
  return "unknown";
}

/** Operator spec start — never send paths, start_node, or spec branch_slug. */
export function buildSpecStartBody(fields: SpecStartFields): Record<string, string> {
  const body: Record<string, string> = {
    meta_pr_url: fields.metaPrUrl,
    initiative_id: fields.initiativeId,
    base_branch: fields.baseBranch,
    runner: fields.runner,
    model_id: fields.modelId,
  };
  if (fields.org && fields.repo) {
    body.org = fields.org;
    body.repo = fields.repo;
  }
  return body;
}

function upstreamRefuseReason(raw: unknown): string {
  if (!raw || typeof raw !== "object") return "";
  const rec = raw as Record<string, unknown>;
  const err = rec.error;
  if (!err || typeof err !== "object") return "";
  const details = (err as Record<string, unknown>).details;
  if (!details || typeof details !== "object") return "";
  const reason = (details as Record<string, unknown>).reason;
  return typeof reason === "string" ? reason : "";
}

/** Map gateflow picker refuse to a stable i18n key. Never leak PAT or URLs. */
export function pickerUpstreamRefuseKey(status: number, raw: unknown): string {
  const reason = upstreamRefuseReason(raw);
  if (reason === "meta_repo_forbidden" || reason === "programme_pat_missing") {
    return "initiatives.errors.pickerForbidden";
  }
  if (reason === "meta_pr_wrong_repo") return "initiatives.errors.onboardWrongRepo";
  if (reason === "not_init_meta_pr") return "initiatives.errors.onboardNotInit";
  if (reason === "meta_pr_not_onboarded") return "initiatives.errors.metaPrNotOnboarded";
  if (status === 404) return "initiatives.errors.pickerNotFound";
  return "initiatives.errors.pickerFailed";
}

export function mapUpstreamPickerItem(raw: unknown): MetaPrPickerItem {
  return mapUpstreamItem(raw);
}

export function mapUpstreamPicker(raw: unknown): MetaPrPickerResponse {
  if (!raw || typeof raw !== "object") {
    throw new Error("invalid picker payload");
  }
  const rec = raw as Record<string, unknown>;
  const itemsRaw = Array.isArray(rec.items) ? rec.items : [];
  return {
    metaOrg: String(rec.meta_org ?? ""),
    metaRepo: String(rec.meta_repo ?? ""),
    items: itemsRaw.map(mapUpstreamItem),
  };
}

function mapSpecRuns(raw: unknown): MetaPrSpecRunJoin[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === "object")
    .map((row) => ({
      org: String(row.org ?? ""),
      repo: String(row.repo ?? ""),
      specRunId: String(row.spec_run_id ?? ""),
    }))
    .filter((row) => Boolean(row.org && row.repo && row.specRunId));
}

function mapUpstreamItem(raw: unknown): MetaPrPickerItem {
  const rec = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const checkpointRaw =
    rec.checkpoint && typeof rec.checkpoint === "object"
      ? (rec.checkpoint as Record<string, unknown>)
      : {};
  const missingRaw = Array.isArray(checkpointRaw.missing_items) ? checkpointRaw.missing_items : [];
  return {
    number: Number(rec.number ?? 0),
    htmlUrl: String(rec.html_url ?? ""),
    title: String(rec.title ?? ""),
    state: String(rec.state ?? ""),
    merged: Boolean(rec.merged),
    initiativeId: String(rec.initiative_id ?? ""),
    specRuns: mapSpecRuns(rec.spec_runs),
    onboarded: Boolean(rec.onboarded),
    checkpoint: {
      checkpointId: String(checkpointRaw.checkpoint_id ?? ""),
      verdict: String(checkpointRaw.verdict ?? ""),
      checkedSha: checkpointRaw.checked_sha == null ? null : String(checkpointRaw.checked_sha),
      staleReason: checkpointRaw.stale_reason == null ? null : String(checkpointRaw.stale_reason),
      missingItems: missingRaw
        .filter(
          (item): item is Record<string, unknown> => Boolean(item) && typeof item === "object",
        )
        .map((item) => ({
          kind: String(item.kind ?? ""),
          name: String(item.name ?? ""),
        })),
    },
  };
}
