"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { authFetch } from "@/lib/auth-fetch";
import { t, useTranslation } from "@/lib/i18n";

interface GrantedProgramme {
  programmeId: string;
  tenantId: string | null;
  programmeName: string | null;
}

interface EnterListResponse {
  programmes: GrantedProgramme[];
  entered: { programmeId: string; tenantId: string | null } | null;
}

async function readError(res: Response, fallbackKey: string): Promise<Error> {
  const body = (await res.json().catch(() => null)) as { error?: string } | null;
  return new Error(body?.error ?? t(fallbackKey));
}

export function ProgrammeEnter() {
  const { t: tp } = useTranslation("programmes");
  const queryClient = useQueryClient();
  const list = useQuery({
    queryKey: ["auth", "programme", "list"],
    queryFn: async () => {
      const res = await authFetch("/api/auth/programme");
      if (!res.ok) throw await readError(res, "programmes.errors.loadFailed");
      return (await res.json()) as EnterListResponse;
    },
  });
  const enter = useMutation({
    mutationFn: async (programmeId: string) => {
      const res = await authFetch("/api/auth/programme", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ programmeId }),
      });
      if (!res.ok) throw await readError(res, "programmes.errors.actionFailed");
      return (await res.json()) as { ok: boolean; programmeId: string; tenantId: string | null };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["auth", "programme"] });
    },
  });
  const leave = useMutation({
    mutationFn: async () => {
      const res = await authFetch("/api/auth/programme?op=leave", { method: "POST" });
      if (!res.ok) throw await readError(res, "programmes.errors.actionFailed");
      return (await res.json()) as { ok: boolean };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["auth", "programme"] });
    },
  });

  const programmes = list.data?.programmes ?? [];
  const enteredId = list.data?.entered?.programmeId ?? null;

  return (
    <Card className="max-w-xl">
      <h2 className="mb-1 font-medium">{tp("enter.title")}</h2>
      <p className="mb-4 text-sm text-muted-foreground">{tp("enter.description")}</p>

      {list.isLoading ? (
        <p className="text-sm text-muted-foreground">{tp("loading")}</p>
      ) : list.error ? (
        <p className="text-sm text-danger" role="alert">
          {list.error.message}
        </p>
      ) : programmes.length === 0 ? (
        <p className="text-sm text-muted-foreground">{tp("enter.empty")}</p>
      ) : (
        <ul className="space-y-3">
          {programmes.map((row) => {
            const active = enteredId === row.programmeId;
            return (
              <li
                key={row.programmeId}
                className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0"
              >
                <div>
                  <p className="font-medium">{row.programmeName ?? row.programmeId}</p>
                  {active ? (
                    <p className="text-sm text-muted-foreground">{tp("enter.current")}</p>
                  ) : null}
                </div>
                {active ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={leave.isPending}
                    onClick={() => leave.mutate()}
                  >
                    {tp("actions.leave")}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    disabled={enter.isPending}
                    onClick={() => enter.mutate(row.programmeId)}
                  >
                    {tp("actions.enter")}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {enter.isError ? (
        <p className="mt-3 text-sm text-danger" role="alert">
          {enter.error.message}
        </p>
      ) : null}
      {leave.isError ? (
        <p className="mt-3 text-sm text-danger" role="alert">
          {leave.error.message}
        </p>
      ) : null}
      {enter.isSuccess ? (
        <p className="mt-3 text-sm text-muted-foreground">{tp("enter.success")}</p>
      ) : null}
      {leave.isSuccess ? (
        <p className="mt-3 text-sm text-muted-foreground">{tp("enter.leaveSuccess")}</p>
      ) : null}
    </Card>
  );
}
