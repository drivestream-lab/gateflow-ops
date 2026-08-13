/**
 * Map gateflow ProgrammeReadModel / catalogue candidates for BFF JSON.
 */

export interface UpstreamCatalogueCandidate {
  org: string;
  repo: string;
  service_key: string;
  status: string;
}

export interface CatalogueCandidateClient {
  org: string;
  repo: string;
  serviceKey: string;
  status: string;
}

export interface UpstreamProgrammeReadModel {
  id: string;
  name: string;
  tenant_id: string;
  workspace_root: string;
  meta_org: string;
  meta_repo: string;
  meta_ref?: string | null;
  repo_catalogue?: UpstreamCatalogueCandidate[] | null;
}

export interface ProgrammeClient {
  id: string;
  name: string;
  tenantId: string;
  workspaceRoot: string;
  metaOrg: string;
  metaRepo: string;
  metaRef: string | null;
  repoCatalogue: CatalogueCandidateClient[];
}

export function mapCatalogueCandidate(raw: UpstreamCatalogueCandidate): CatalogueCandidateClient {
  return {
    org: raw.org,
    repo: raw.repo,
    serviceKey: raw.service_key,
    status: raw.status,
  };
}

export function mapProgrammeReadModel(raw: UpstreamProgrammeReadModel): ProgrammeClient {
  const catalogue = Array.isArray(raw.repo_catalogue) ? raw.repo_catalogue : [];
  return {
    id: raw.id,
    name: raw.name,
    tenantId: raw.tenant_id,
    workspaceRoot: raw.workspace_root,
    metaOrg: raw.meta_org,
    metaRepo: raw.meta_repo,
    metaRef: raw.meta_ref ?? null,
    repoCatalogue: catalogue.map(mapCatalogueCandidate),
  };
}
