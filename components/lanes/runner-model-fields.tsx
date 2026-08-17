"use client";

import { Label } from "@/components/ui/label";
import { useRunnerCatalogue } from "@/hooks/use-runner-catalogue";
import { useTranslation } from "@/lib/i18n";
import { modelsForRunner } from "@/lib/runner-catalogue";

const selectClass = "flex h-9 w-full rounded-md border border-border bg-background px-3 text-sm";

export function RunnerModelFields({
  runner,
  modelId,
  onRunnerChange,
  onModelChange,
  idPrefix,
}: {
  runner: string;
  modelId: string;
  onRunnerChange: (runnerId: string) => void;
  onModelChange: (modelId: string) => void;
  idPrefix: string;
}) {
  const { t } = useTranslation("initiatives");
  const catalogue = useRunnerCatalogue();
  const runners = catalogue.catalogue?.runners ?? [];
  const models = modelsForRunner(catalogue.catalogue, runner);

  return (
    <>
      <div className="space-y-1">
        <Label htmlFor={`${idPrefix}-runner`}>{t("picker.runner")}</Label>
        <select
          id={`${idPrefix}-runner`}
          className={selectClass}
          value={runner}
          onChange={(e) => {
            const next = e.target.value;
            onRunnerChange(next);
            const first = modelsForRunner(catalogue.catalogue, next)[0];
            onModelChange(first?.modelId ?? "");
          }}
          required
        >
          <option value="">{t("picker.runnerPlaceholder")}</option>
          {runners.map((row) => (
            <option key={row.runnerId} value={row.runnerId}>
              {row.displayName}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <Label htmlFor={`${idPrefix}-model`}>{t("picker.modelId")}</Label>
        <select
          id={`${idPrefix}-model`}
          className={selectClass}
          value={modelId}
          onChange={(e) => onModelChange(e.target.value)}
          required
          disabled={!runner}
        >
          <option value="">{t("picker.modelPlaceholder")}</option>
          {models.map((row) => (
            <option key={row.modelId} value={row.modelId}>
              {row.displayName}
            </option>
          ))}
        </select>
      </div>
      {catalogue.error ? (
        <p className="md:col-span-2 text-sm text-danger">{catalogue.error.message}</p>
      ) : null}
    </>
  );
}
