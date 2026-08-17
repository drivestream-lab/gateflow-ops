import { describe, expect, it } from "vitest";
import {
  buildSpecStartBody,
  canStartSpec,
  classifyCap01,
  classifySpecLaneStatus,
  classifySpecProgress,
  mapUpstreamPicker,
  onboardedPullsPath,
  onboardPullPath,
  pickerPullsPath,
  pickerUpstreamRefuseKey,
  type MetaPrPickerItem,
} from "@/lib/meta-pr-picker";

function item(overrides: Partial<MetaPrPickerItem> = {}): MetaPrPickerItem {
  return {
    number: 9,
    htmlUrl: "https://github.com/acme/prayog-meta/pull/9",
    title: "INIT-ACME-001",
    state: "open",
    merged: false,
    initiativeId: "INIT-ACME-001",
    specRuns: [],
    onboarded: true,
    checkpoint: {
      checkpointId: "prd-impact-acceptance",
      verdict: "satisfied",
      checkedSha: "abc",
      staleReason: null,
      missingItems: [],
    },
    ...overrides,
  };
}

describe("classifyCap01", () => {
  it("maps satisfied to ready", () => {
    expect(classifyCap01(item().checkpoint)).toBe("ready");
  });

  it("maps stale_reason to stale", () => {
    expect(
      classifyCap01({
        ...item().checkpoint,
        verdict: "not_satisfied",
        staleReason: "stale — new commits since approval",
      }),
    ).toBe("stale");
  });

  it("maps missing label", () => {
    expect(
      classifyCap01({
        ...item().checkpoint,
        verdict: "not_satisfied",
        missingItems: [{ kind: "label", name: "impact-map-lgtm" }],
      }),
    ).toBe("missing_label");
  });
});

describe("canStartSpec", () => {
  it("allows attested onboarded rows with no spec run on that repo", () => {
    expect(canStartSpec(item(), "acme", "widget")).toBe(true);
  });

  it("refuses catalogue rows that are not onboarded", () => {
    expect(canStartSpec(item({ onboarded: false }), "acme", "widget")).toBe(false);
  });

  it("refuses when that repo already has a spec run", () => {
    expect(
      canStartSpec(
        item({ specRuns: [{ org: "acme", repo: "widget", specRunId: "run-1" }] }),
        "acme",
        "widget",
      ),
    ).toBe(false);
  });

  it("allows start on a second repo when another repo already has a spec run", () => {
    expect(
      canStartSpec(
        item({ specRuns: [{ org: "acme", repo: "widget", specRunId: "run-1" }] }),
        "acme",
        "ops",
      ),
    ).toBe(true);
  });
});

describe("buildSpecStartBody", () => {
  it("omits paths, start_node, and branch_slug", () => {
    const body = buildSpecStartBody({
      initiativeId: "INIT-ACME-001",
      org: "acme",
      repo: "widget",
      metaPrUrl: "https://github.com/acme/prayog-meta/pull/9",
      baseBranch: "develop",
      runner: "cursor",
      modelId: "cursor/auto",
    });
    expect(body.workspace_path).toBeUndefined();
    expect(body.meta_workspace_path).toBeUndefined();
    expect(body.start_node).toBeUndefined();
    expect(body.branch_slug).toBeUndefined();
    expect(body.meta_pr_url).toBe("https://github.com/acme/prayog-meta/pull/9");
    expect(body.org).toBe("acme");
    expect(body.repo).toBe("widget");
  });

  it("omits org and repo so gateflow can derive the admitted fleet repo", () => {
    const body = buildSpecStartBody({
      initiativeId: "INIT-ACME-001",
      metaPrUrl: "https://github.com/acme/prayog-meta/pull/9",
      baseBranch: "develop",
      runner: "cursor",
      modelId: "cursor/auto",
    });
    expect(body.org).toBeUndefined();
    expect(body.repo).toBeUndefined();
  });
});

describe("pickerPullsPath", () => {
  it("omits refresh on the cached list path", () => {
    expect(pickerPullsPath()).toBe("/api/gateflow/meta/pulls");
  });

  it("asks gateflow to bypass Redis on hard refresh", () => {
    expect(pickerPullsPath(true)).toBe("/api/gateflow/meta/pulls?refresh=true");
  });
});

describe("onboard paths", () => {
  it("uses the admitted-set and onboard BFF routes", () => {
    expect(onboardedPullsPath()).toBe("/api/gateflow/meta/pulls/onboarded");
    expect(onboardPullPath()).toBe("/api/gateflow/meta/pulls/onboard");
  });
});

describe("classifySpecLaneStatus", () => {
  it("is not started when there is no spec run", () => {
    expect(classifySpecLaneStatus({ specRunId: null })).toBe("not_started");
  });

  it("is closed when the spec run is at board-tickets-action", () => {
    expect(
      classifySpecLaneStatus({
        specRunId: "run-1",
        workflowNode: "board-tickets-action",
      }),
    ).toBe("closed");
  });

  it("is open while the Spec PR is still the live output", () => {
    expect(
      classifySpecLaneStatus({
        specRunId: "run-1",
        workflowNode: "spec-pr-action",
      }),
    ).toBe("open");
  });
});

describe("mapUpstreamPicker", () => {
  it("maps snake_case gateflow rows", () => {
    const mapped = mapUpstreamPicker({
      meta_org: "acme",
      meta_repo: "prayog-meta",
      items: [
        {
          number: 1,
          html_url: "https://github.com/acme/prayog-meta/pull/1",
          title: "INIT-ACME-001",
          state: "open",
          merged: false,
          initiative_id: "INIT-ACME-001",
          spec_runs: [{ org: "acme", repo: "widget", spec_run_id: "run-1" }],
          checkpoint: {
            checkpoint_id: "prd-impact-acceptance",
            verdict: "satisfied",
            checked_sha: "abc",
            stale_reason: null,
            missing_items: [],
          },
        },
      ],
    });
    expect(mapped.metaOrg).toBe("acme");
    expect(mapped.items[0]?.initiativeId).toBe("INIT-ACME-001");
    expect(mapped.items[0]?.specRuns).toEqual([
      { org: "acme", repo: "widget", specRunId: "run-1" },
    ]);
    expect(mapped.items[0]?.onboarded).toBe(false);
  });

  it("maps onboarded true from the catalogue flag", () => {
    const mapped = mapUpstreamPicker({
      meta_org: "acme",
      meta_repo: "prayog-meta",
      items: [
        {
          number: 1,
          html_url: "https://github.com/acme/prayog-meta/pull/1",
          title: "INIT-ACME-001",
          state: "open",
          merged: false,
          initiative_id: "INIT-ACME-001",
          onboarded: true,
          spec_runs: [],
          checkpoint: {
            checkpoint_id: "prd-impact-acceptance",
            verdict: "satisfied",
            checked_sha: "abc",
            stale_reason: null,
            missing_items: [],
          },
        },
      ],
    });
    expect(mapped.items[0]?.onboarded).toBe(true);
  });
});

describe("pickerUpstreamRefuseKey", () => {
  it("maps meta_repo_forbidden to pickerForbidden", () => {
    expect(
      pickerUpstreamRefuseKey(422, {
        error: { details: { reason: "meta_repo_forbidden", status_code: 403 } },
      }),
    ).toBe("initiatives.errors.pickerForbidden");
  });

  it("maps missing meta repo to pickerNotFound", () => {
    expect(pickerUpstreamRefuseKey(404, {})).toBe("initiatives.errors.pickerNotFound");
  });

  it("maps onboard refuse reasons", () => {
    expect(
      pickerUpstreamRefuseKey(422, { error: { details: { reason: "meta_pr_wrong_repo" } } }),
    ).toBe("initiatives.errors.onboardWrongRepo");
    expect(
      pickerUpstreamRefuseKey(422, { error: { details: { reason: "not_init_meta_pr" } } }),
    ).toBe("initiatives.errors.onboardNotInit");
    expect(
      pickerUpstreamRefuseKey(422, { error: { details: { reason: "meta_pr_not_onboarded" } } }),
    ).toBe("initiatives.errors.metaPrNotOnboarded");
  });
});

describe("classifySpecProgress", () => {
  it("never treats a draft PR as spec done", () => {
    expect(
      classifySpecProgress({
        spec_run_status: "stopped",
        draft_spec_pr_number: 12,
      }),
    ).toBe("draft_pr");
  });

  it("marks an active spec run as running", () => {
    expect(classifySpecProgress({ spec_run_status: "active" })).toBe("running");
  });
});
