"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isMetricsSeriesEmpty, useMetrics, type MetricsOp } from "@/hooks/use-metrics";
import { useTranslation } from "@/lib/i18n";

function asRecord(data: unknown): Record<string, unknown> | null {
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return data as Record<string, unknown>;
  }
  return null;
}

function JsonBlock({ data }: { data: unknown }) {
  return (
    <pre className="mt-3 max-h-72 overflow-auto rounded-md border border-border bg-surface p-3 text-xs text-foreground">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

function MetricsPanelBody({
  op,
  data,
  isLoading,
  error,
  t,
}: {
  op: MetricsOp;
  data: unknown;
  isLoading: boolean;
  error: Error | null;
  t: (key: string) => string;
}) {
  if (isLoading) {
    return <p className="text-sm text-muted-foreground">{t("loading")}</p>;
  }
  if (error) {
    return <p className="text-sm text-danger">{error.message}</p>;
  }
  if (isMetricsSeriesEmpty(op, data)) {
    return <p className="text-sm text-muted-foreground">{t("empty")}</p>;
  }

  if (op === "delivery-scorecard") {
    const rec = asRecord(data);
    if (!rec) {
      return <p className="text-sm text-muted-foreground">{t("empty")}</p>;
    }
    const rework = asRecord(rec.rework_rate);
    const closed = asRecord(rec.initiatives_closed_with_evidence);
    const coverage = asRecord(rec.factory_coverage_pct);
    return (
      <div className="space-y-3 text-sm">
        <p>
          <span className="text-muted-foreground">{t("scorecard.asOf")}: </span>
          {String(rec.as_of ?? "")}
        </p>
        {(
          [
            ["scorecard.rework", rework],
            ["scorecard.initiativesClosed", closed],
            ["scorecard.factoryCoverage", coverage],
          ] as const
        ).map(([labelKey, framing]) => (
          <div key={labelKey} className="rounded-md border border-border p-3">
            <p className="font-medium">{t(labelKey)}</p>
            <p className="text-muted-foreground">
              {t("scorecard.cumulative")}: {String(framing?.cumulative ?? "—")}
            </p>
            <p className="text-muted-foreground">
              {t("scorecard.trailing90d")}: {String(framing?.trailing_90d_delta ?? "—")}
            </p>
          </div>
        ))}
        <details>
          <summary className="cursor-pointer text-xs text-muted-foreground">
            {t("raw.title")}
          </summary>
          <JsonBlock data={data} />
        </details>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">{t("raw.title")}</p>
      <JsonBlock data={data} />
    </div>
  );
}

export function MetricsPanels() {
  const { t } = useTranslation("metrics");
  const [filters, setFilters] = useState({ model_id: "", prompt_revision: "" });
  const [applied, setApplied] = useState(filters);

  const runs = useMetrics("runs");
  const skill = useMetrics("skill-efficacy", applied);
  const factory = useMetrics("factory-effectiveness");
  const scorecard = useMetrics("delivery-scorecard");

  const panels: Array<{
    op: MetricsOp;
    titleKey: string;
    descKey: string;
    query: ReturnType<typeof useMetrics>;
  }> = [
    {
      op: "runs",
      titleKey: "panel.runs.title",
      descKey: "panel.runs.description",
      query: runs,
    },
    {
      op: "skill-efficacy",
      titleKey: "panel.skill.title",
      descKey: "panel.skill.description",
      query: skill,
    },
    {
      op: "factory-effectiveness",
      titleKey: "panel.factory.title",
      descKey: "panel.factory.description",
      query: factory,
    },
    {
      op: "delivery-scorecard",
      titleKey: "panel.scorecard.title",
      descKey: "panel.scorecard.description",
      query: scorecard,
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="mb-4 font-medium">{t("panel.skill.title")}</h2>
        <form
          className="grid max-w-2xl gap-3 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            setApplied({ ...filters });
          }}
        >
          <div className="space-y-1">
            <Label htmlFor="metrics-model">{t("filters.modelId")}</Label>
            <Input
              id="metrics-model"
              value={filters.model_id}
              onChange={(e) => setFilters((p) => ({ ...p, model_id: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="metrics-prompt">{t("filters.promptRevision")}</Label>
            <Input
              id="metrics-prompt"
              value={filters.prompt_revision}
              onChange={(e) => setFilters((p) => ({ ...p, prompt_revision: e.target.value }))}
            />
          </div>
          <div className="md:col-span-2">
            <Button type="submit">{t("filters.apply")}</Button>
          </div>
        </form>
      </Card>

      {panels.map((panel) => (
        <Card key={panel.op}>
          <h2 className="mb-1 font-medium">{t(panel.titleKey)}</h2>
          <p className="mb-4 text-sm text-muted-foreground">{t(panel.descKey)}</p>
          <MetricsPanelBody
            op={panel.op}
            data={panel.query.payload?.data}
            isLoading={panel.query.isLoading}
            error={panel.query.error}
            t={t}
          />
        </Card>
      ))}
    </div>
  );
}
