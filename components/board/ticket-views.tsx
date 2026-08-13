"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  isBoardCreateIdempotentReplay,
  isBoardTicketListEmpty,
  useBoardTickets,
  useCreateBoardTicket,
  useLinkBoardTicket,
  useUpdateBoardTicketStatus,
} from "@/hooks/use-board";
import { useTranslation } from "@/lib/i18n";

function JsonBlock({ data }: { data: unknown }) {
  return (
    <pre className="mt-3 max-h-72 overflow-auto rounded-md border border-border bg-surface p-3 text-xs text-foreground">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

export function TicketViews() {
  const { t } = useTranslation("board");

  const [listForm, setListForm] = useState({
    org: "",
    repo: "",
    initiative_id: "",
    type: "",
    state: "open",
  });
  const [listApplied, setListApplied] = useState<typeof listForm | null>(null);
  const [listArmed, setListArmed] = useState(false);

  const [createForm, setCreateForm] = useState({
    org: "",
    repo: "",
    title: "",
    body: "",
    ticket_type: "Feature" as "EPIC" | "Feature",
    initiative_id: "",
    project_number: "",
    parent_ticket_id: "",
    idempotency_key: "",
  });

  const [statusForm, setStatusForm] = useState({
    ticket_id: "",
    org: "",
    repo: "",
    column: "",
    state: "",
  });

  const [linkForm, setLinkForm] = useState({
    ticket_id: "",
    org: "",
    repo: "",
    pr_number: "",
  });

  const list = useBoardTickets(
    {
      org: listApplied?.org ?? "",
      repo: listApplied?.repo ?? "",
      initiative_id: listApplied?.initiative_id,
      type: listApplied?.type,
      state: listApplied?.state,
    },
    { enabled: listArmed && Boolean(listApplied) },
  );

  const create = useCreateBoardTicket();
  const updateStatus = useUpdateBoardTicketStatus();
  const link = useLinkBoardTicket();

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="mb-4 font-medium">{t("list.title")}</h2>
        <form
          className="grid max-w-3xl gap-3 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            setListApplied({ ...listForm });
            setListArmed(true);
          }}
        >
          <div className="space-y-1">
            <Label htmlFor="board-org">{t("list.org")}</Label>
            <Input
              id="board-org"
              value={listForm.org}
              onChange={(e) => setListForm((p) => ({ ...p, org: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="board-repo">{t("list.repo")}</Label>
            <Input
              id="board-repo"
              value={listForm.repo}
              onChange={(e) => setListForm((p) => ({ ...p, repo: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="board-init">{t("list.initiativeId")}</Label>
            <Input
              id="board-init"
              value={listForm.initiative_id}
              onChange={(e) => setListForm((p) => ({ ...p, initiative_id: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="board-type">{t("list.type")}</Label>
            <select
              id="board-type"
              className="flex h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
              value={listForm.type}
              onChange={(e) => setListForm((p) => ({ ...p, type: e.target.value }))}
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
              className="flex h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
              value={listForm.state}
              onChange={(e) => setListForm((p) => ({ ...p, state: e.target.value }))}
            >
              <option value="open">{t("list.state.open")}</option>
              <option value="closed">{t("list.state.closed")}</option>
              <option value="all">{t("list.state.all")}</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <Button type="submit">{t("list.submit")}</Button>
          </div>
        </form>
        <div className="mt-4">
          {!listArmed ? null : list.isLoading ? (
            <p className="text-sm text-muted-foreground">{t("loading")}</p>
          ) : list.error ? (
            <p className="text-sm text-danger">{list.error.message}</p>
          ) : isBoardTicketListEmpty(list.payload?.data) ? (
            <p className="text-sm text-muted-foreground">{t("list.empty")}</p>
          ) : (
            <JsonBlock data={list.payload?.data} />
          )}
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 font-medium">{t("create.title")}</h2>
        <form
          className="grid max-w-3xl gap-3 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            const projectNumber = createForm.project_number.trim()
              ? Number(createForm.project_number)
              : undefined;
            create.mutate({
              org: createForm.org,
              repo: createForm.repo,
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
          <div className="space-y-1">
            <Label htmlFor="create-org">{t("create.org")}</Label>
            <Input
              id="create-org"
              value={createForm.org}
              onChange={(e) => setCreateForm((p) => ({ ...p, org: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="create-repo">{t("create.repo")}</Label>
            <Input
              id="create-repo"
              value={createForm.repo}
              onChange={(e) => setCreateForm((p) => ({ ...p, repo: e.target.value }))}
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="create-title">{t("create.titleField")}</Label>
            <Input
              id="create-title"
              value={createForm.title}
              onChange={(e) => setCreateForm((p) => ({ ...p, title: e.target.value }))}
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="create-body">{t("create.body")}</Label>
            <Input
              id="create-body"
              value={createForm.body}
              onChange={(e) => setCreateForm((p) => ({ ...p, body: e.target.value }))}
            />
          </div>
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
              onChange={(e) => setCreateForm((p) => ({ ...p, parent_ticket_id: e.target.value }))}
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="create-idem">{t("create.idempotencyKey")}</Label>
            <Input
              id="create-idem"
              value={createForm.idempotency_key}
              onChange={(e) => setCreateForm((p) => ({ ...p, idempotency_key: e.target.value }))}
            />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={create.isPending}>
              {t("create.submit")}
            </Button>
          </div>
        </form>
        <div className="mt-4">
          {create.error ? (
            <p className="text-sm text-danger">{create.error.message}</p>
          ) : create.data ? (
            <>
              <p className="text-sm text-accent">
                {isBoardCreateIdempotentReplay(create.data.data)
                  ? t("create.replay")
                  : t("create.created")}
              </p>
              <JsonBlock data={create.data.data} />
            </>
          ) : null}
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 font-medium">{t("status.title")}</h2>
        <form
          className="grid max-w-3xl gap-3 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            updateStatus.mutate({
              ticket_id: statusForm.ticket_id,
              org: statusForm.org,
              repo: statusForm.repo,
              column: statusForm.column || undefined,
              state: statusForm.state || undefined,
            });
          }}
        >
          <div className="space-y-1">
            <Label htmlFor="status-id">{t("status.ticketId")}</Label>
            <Input
              id="status-id"
              value={statusForm.ticket_id}
              onChange={(e) => setStatusForm((p) => ({ ...p, ticket_id: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="status-org">{t("status.org")}</Label>
            <Input
              id="status-org"
              value={statusForm.org}
              onChange={(e) => setStatusForm((p) => ({ ...p, org: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="status-repo">{t("status.repo")}</Label>
            <Input
              id="status-repo"
              value={statusForm.repo}
              onChange={(e) => setStatusForm((p) => ({ ...p, repo: e.target.value }))}
            />
          </div>
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
          <div className="md:col-span-2">
            <Button type="submit" disabled={updateStatus.isPending}>
              {t("status.submit")}
            </Button>
          </div>
        </form>
        <div className="mt-4">
          {updateStatus.error ? (
            <p className="text-sm text-danger">{updateStatus.error.message}</p>
          ) : updateStatus.data ? (
            <JsonBlock data={updateStatus.data.data} />
          ) : null}
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 font-medium">{t("link.title")}</h2>
        <form
          className="grid max-w-3xl gap-3 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            link.mutate({
              ticket_id: linkForm.ticket_id,
              org: linkForm.org,
              repo: linkForm.repo,
              pr_number: Number(linkForm.pr_number),
            });
          }}
        >
          <div className="space-y-1">
            <Label htmlFor="link-id">{t("link.ticketId")}</Label>
            <Input
              id="link-id"
              value={linkForm.ticket_id}
              onChange={(e) => setLinkForm((p) => ({ ...p, ticket_id: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="link-org">{t("link.org")}</Label>
            <Input
              id="link-org"
              value={linkForm.org}
              onChange={(e) => setLinkForm((p) => ({ ...p, org: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="link-repo">{t("link.repo")}</Label>
            <Input
              id="link-repo"
              value={linkForm.repo}
              onChange={(e) => setLinkForm((p) => ({ ...p, repo: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="link-pr">{t("link.prNumber")}</Label>
            <Input
              id="link-pr"
              value={linkForm.pr_number}
              onChange={(e) => setLinkForm((p) => ({ ...p, pr_number: e.target.value }))}
            />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={link.isPending}>
              {t("link.submit")}
            </Button>
          </div>
        </form>
        <div className="mt-4">
          {link.error ? (
            <p className="text-sm text-danger">{link.error.message}</p>
          ) : link.data ? (
            <JsonBlock data={link.data.data} />
          ) : null}
        </div>
      </Card>
    </div>
  );
}
