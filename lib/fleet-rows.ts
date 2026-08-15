export interface FleetMember {
  org: string;
  repo: string;
}

export interface FleetCatalogueCandidate {
  org: string;
  repo: string;
  service_key: string;
  status: string;
}

export interface FleetRow {
  org: string;
  repo: string;
  serviceKey: string | null;
  status: string | null;
  inFleet: boolean;
}

export function fleetRepoKey(org: string, repo: string): string {
  return `${org}/${repo}`;
}

export function composeFleetRows(
  active: FleetMember[],
  candidates: FleetCatalogueCandidate[],
): { active: FleetRow[]; candidates: FleetRow[] } {
  const activeKeys = new Set(active.map((row) => fleetRepoKey(row.org, row.repo)));
  const catalogueByKey = new Map(
    candidates.map((row) => [fleetRepoKey(row.org, row.repo), row] as const),
  );

  return {
    active: active.map((row) => {
      const match = catalogueByKey.get(fleetRepoKey(row.org, row.repo));
      return {
        org: row.org,
        repo: row.repo,
        serviceKey: match?.service_key ?? null,
        status: match?.status ?? null,
        inFleet: true,
      };
    }),
    candidates: candidates
      .filter((row) => !activeKeys.has(fleetRepoKey(row.org, row.repo)))
      .map((row) => ({
        org: row.org,
        repo: row.repo,
        serviceKey: row.service_key,
        status: row.status,
        inFleet: false,
      })),
  };
}
