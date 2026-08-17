"use client";

import type { FormEvent, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { t } from "@/lib/i18n";

export function LaneStartDialog({
  title,
  children,
  submitLabel,
  pending,
  error,
  onClose,
  onSubmit,
}: {
  title: string;
  children: ReactNode;
  submitLabel: string;
  pending: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: () => void;
}) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <Card className="w-full max-w-lg space-y-4">
        <h2 className="font-medium">{title}</h2>
        <form className="grid gap-3 md:grid-cols-2" onSubmit={handleSubmit}>
          {children}
          <div className="md:col-span-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
              {t("common.actions.cancel")}
            </Button>
            <Button type="submit" disabled={pending}>
              {submitLabel}
            </Button>
          </div>
          {error ? <p className="md:col-span-2 text-sm text-danger">{error}</p> : null}
        </form>
      </Card>
    </div>
  );
}
