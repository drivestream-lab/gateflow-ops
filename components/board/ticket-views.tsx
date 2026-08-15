"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  boardTicketsFromListData,
  isBoardCreateIdempotentReplay,
  useBoardTickets,
  useCreateBoardTicket,
  useLinkBoardTicket,
  useUpdateBoardTicketStatus,
  type BoardTicketRow,
} from "@/hooks/use-board";
import { useTenant } from "@/hooks/use-tenant";
import { useTranslation } from "@/lib/i18n";

type Panel =
  | { kind: "create" }
  | { kind: "status"; ticket: BoardTicketRow }
  | { kind: "link"; ticket: BoardTicketRow }
  | null;

function repoKey(org: string, repo: string): string {
  return `${org}/${repo}`;
}

export function TicketViews() {
  const { t } = useTranslation("board");
  const tenant = useTenant();
  const repos = useMemo(() => tenant.tenant?.repos ?? [], [tenant.tenant?.repos]);

  const [selected, setSelected] = useState("");
  const [filters, setFilters] = useState({ initiative_id: "", type: "", state: "open" });
  const [panel, setPanel] = useState<Panel>(null);

  const [createForm, setCreateForm] = useState({
    title: "",
    body: "",
    ticket_type: "Feature" as "EPIC" | "Feature",
    initiative_id: "",
    project_number: "",
    parent_ticket_id: "",
    idempotency_key: "",
  });
  const [statusForm, setStatusForm] = useState({ column: "", state: "" });
  const [linkForm, setLinkForm] = useState({ pr_number: "" });

  useEffect(() => {
    if (!selected && repos[0]) {
      setSelected(repoKey(repos[0].org, repos[0].repo));
    }
  }, [repos, selected]);

  const [org, repo] = useMemo(() => {
    const [o, r] = selected.split("/");
    return [o ?? "", r ?? ""];
  }, [selected]);

  const list = useBoardTickets(
    {
      org,
      repo,
      initiative_id: filters.initiative_id,
      type: filters.type,
      state: filters.state === "all" ? "" : filters.state,
    },
    { enabled: Boolean(org && repo) },
  );
  const tickets = boardTicketsFromListData(list.payload?.data);
  const create = useCreateBoardTicket();
  const updateStatus = useUpdateBoardTicketStatus();
  const link = useLinkBoardTicket();

  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="min-w-48 space-y-1">
          <Label htmlFor="board-repo">{t("list.repo")}</Label>
          <select
            id="board-repo"
            className="flex h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="">{t("list.repoPlaceholder")}</option>
            {repos.map((row) => (
              <option key={repoKey(row.org, row.repo)} value={repoKey(row.org, row.repo)}>
                {row.org}/{row.repo}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="board-type">{t("list.type")}</Label>
          <select
            id="board-type"
            className="flex h-9 rounded-md border border-border bg-background px-3 text-sm"
            value={filters.type}
            onChange={(e) => setFilters((p) => ({ ...p, type: e.target.value }))}
          >
            <option value="">{t("list.type.all")}</option>
            <option value="EPIC">{t("list.type.epic")}</option>
            <option value="Feature">{t("list.type.feature")}</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="board-state">{t("list.state")}</Label>
          <select
            id="board-state"
            className="flex h-9 rounded-md border border-border bg-background px-3 text-sm"
            value={filters.state}
            onChange={(e) => setFilters((p) => ({ ...p, state: e.target.value }))}
          >
            <option value="open">{t("list.state.open")}</option>
            <option value="closed">{t("list.state.closed")}</option>
            <option value="all">{t("list.state.all")}</option>
          </select>
        </div>
        <div className="min-w-40 space-y-1">
          <Label htmlFor="board-init">{t("list.initiativeId")}</Label>
          <Input
            id="board-init"
            value={filters.initiative_id}
            onChange={(e) => setFilters((p) => ({ ...p, initiative_id: e.target.value }))}
          />
        </div>
        <Button type="button" disabled={!org || !repo} onClick={() => setPanel({ kind: "create" })}>
          {t("create.title")}
        </Button>
      </div>

      {repos.length === 0 && !tenant.isLoading ? (
        <p className="text-sm text-muted-foreground">{t("list.emptyFleet")}</p>
      ) : !org || !repo ? (
        <p className="text-sm text-muted-foreground">{t("list.repoPlaceholder")}</p>
      ) : list.isLoading ? (
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      ) : list.error ? (
        <p className="text-sm text-danger">{list.error.message}</p>
      ) : tickets.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("list.empty")}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-2 pr-3 font-medium">{t("list.columns.title")}</th>
                <th className="py-2 pr-3 font-medium">{t("list.columns.type")}</th>
                <th className="py-2 pr-3 font-medium">{t("list.columns.state")}</th>
                <th className="py-2 pr-3 font-medium">{t("list.columns.column")}</th>
                <th className="py-2 pr-3 font-medium">{t("list.columns.initiative")}</th>
                <th className="py-2 pr-3 font-medium">{t("list.columns.links")}</th>
                <th className="py-2 font-medium">{t("list.columns.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((row) => (
                <tr key={row.ticketId} className="border-b border-border">
                  <td className="py-2 pr-3">{row.title ?? row.ticketId}</td>
                  <td className="py-2 pr-3">{row.ticketType ?? "—"}</td>
                  <td className="py-2 pr-3">{row.state ?? "—"}</td>
                  <td className="py-2 pr-3">{row.column ?? "—"}</td>
                  <td className="py-2 pr-3 font-mono text-xs">{row.initiativeId ?? "—"}</td>
                  <td className="py-2 pr-3 font-mono text-xs">{row.linkRef ?? "—"}</td>
                  <td className="py-2">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setStatusForm({ column: row.column ?? "", state: row.state ?? "" });
                          setPanel({ kind: "status", ticket: row });
                        }}
                      >
                        {t("actions.status")}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setLinkForm({ pr_number: "" });
                          setPanel({ kind: "link", ticket: row });
                        }}
                      >
                        {t("actions.link")}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {panel?.kind === "create" ? (
        <form
          className="mt-6 grid max-w-xl gap-3 border-t border-border pt-4"
          onSubmit={(e) => {
            e.preventDefault();
            const projectNumber = createForm.project_number.trim()
              ? Number(createForm.project_number)
              : undefined;
            create.mutate({
              org,
              repo,
              title: createForm.title,
              body: createForm.body || undefined,
              ticket_type: createForm.ticket_type,
              initiative_id: createForm.initiative_id,
              project_number:
                projectNumber !== undefined && Number.isFinite(projectNumber)
                  ? Math.trunc(projectNumber)
                  : undefined,
              parent_ticket_id: createForm.parent_ticket_id || undefined,
              idempotency_key: createForm.idempotency_key || undefined,
            });
          }}
        >
          <h3 className="font-medium">{t("create.title")}</h3>
          <div className="space-y-1">
            <Label htmlFor="create-title">{t("create.titleField")}</Label>
            <Input
              id="create-title"
              value={createForm.title}
              onChange={(e) => setCreateForm((p) => ({ ...p, title: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="create-body">{t("create.body")}</Label>
            <Input
              id="create-body"
              value={createForm.body}
              onChange={(e) => setCreateForm((p) => ({ ...p, body: e.target.value }))}
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="create-type">{t("create.type")}</Label>
              <select
                id="create-type"
                className="flex h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
                value={createForm.ticket_type}
                onChange={(e) =>
                  setCreateForm((p) => ({
                    ...p,
                    ticket_type: e.target.value as "EPIC" | "Feature",
                  }))
                }
              >
                <option value="EPIC">{t("list.type.epic")}</option>
                <option value="Feature">{t("list.type.feature")}</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="create-init">{t("create.initiativeId")}</Label>
              <Input
                id="create-init"
                value={createForm.initiative_id}
                onChange={(e) => setCreateForm((p) => ({ ...p, initiative_id: e.target.value }))}
              />
            </div>
          </div>
          <details>
            <summary className="cursor-pointer text-sm text-muted-foreground">
              {t("create.advanced")}
            </summary>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="create-proj">{t("create.projectNumber")}</Label>
                <Input
                  id="create-proj"
                  value={createForm.project_number}
                  onChange={(e) => setCreateForm((p) => ({ ...p, project_number: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="create-parent">{t("create.parentTicketId")}</Label>
                <Input
                  id="create-parent"
                  value={createForm.parent_ticket_id}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, parent_ticket_id: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label htmlFor="create-idem">{t("create.idempotencyKey")}</Label>
                <Input
                  id="create-idem"
                  value={createForm.idempotency_key}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, idempotency_key: e.target.value }))
                  }
                />
              </div>
            </div>
          </details>
          <div className="flex gap-2">
            <Button type="submit" disabled={create.isPending}>
              {t("create.submit")}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setPanel(null)}>
              {t("create.cancel")}
            </Button>
          </div>
          {create.error ? <p className="text-sm text-danger">{create.error.message}</p> : null}
          {create.data ? (
            <p className="text-sm text-accent">
              {isBoardCreateIdempotentReplay(create.data.data)
                ? t("create.replay")
                : t("create.created")}
            </p>
          ) : null}
        </form>
      ) : null}

      {panel?.kind === "status" ? (
        <form
          className="mt-6 grid max-w-xl gap-3 border-t border-border pt-4"
          onSubmit={(e) => {
            e.preventDefault();
            updateStatus.mutate({
              ticket_id: panel.ticket.ticketId,
              org,
              repo,
              column: statusForm.column || undefined,
              state: statusForm.state || undefined,
            });
          }}
        >
          <h3 className="font-medium">{t("status.title")}</h3>
          <div className="space-y-1">
            <Label htmlFor="status-col">{t("status.column")}</Label>
            <Input
              id="status-col"
              value={statusForm.column}
              onChange={(e) => setStatusForm((p) => ({ ...p, column: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="status-state">{t("status.state")}</Label>
            <Input
              id="status-state"
              value={statusForm.state}
              onChange={(e) => setStatusForm((p) => ({ ...p, state: e.target.value }))}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={updateStatus.isPending}>
              {t("status.submit")}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setPanel(null)}>
              {t("create.cancel")}
            </Button>
          </div>
          {updateStatus.error ? (
            <p className="text-sm text-danger">{updateStatus.error.message}</p>
          ) : null}
        </form>
      ) : null}

      {panel?.kind === "link" ? (
        <form
          className="mt-6 grid max-w-xl gap-3 border-t border-border pt-4"
          onSubmit={(e) => {
            e.preventDefault();
            link.mutate({
              ticket_id: panel.ticket.ticketId,
              org,
              repo,
              pr_number: Number(linkForm.pr_number),
            });
          }}
        >
          <h3 className="font-medium">{t("link.title")}</h3>
          <div className="space-y-1">
            <Label htmlFor="link-pr">{t("link.prNumber")}</Label>
            <Input
              id="link-pr"
              value={linkForm.pr_number}
              onChange={(e) => setLinkForm({ pr_number: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={link.isPending}>
              {t("link.submit")}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setPanel(null)}>
              {t("create.cancel")}
            </Button>
          </div>
          {link.error ? <p className="text-sm text-danger">{link.error.message}</p> : null}
        </form>
      ) : null}
    </Card>
  );
}
