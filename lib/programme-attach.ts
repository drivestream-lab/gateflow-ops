/**
 * Shape attach-tenant-admin upstream responses for the browser.
 * Never forward gateflow-minted access_token to the client.
 */

export interface UpstreamAttachTenantAdminResponse {
  user_id: string;
  tenant_id: string;
  programme_id: string;
  access_token?: string;
  created: boolean;
}

export interface AttachTenantAdminClientResponse {
  userId: string;
  tenantId: string;
  programmeId: string;
  created: boolean;
}

export function stripAttachAccessToken(
  raw: UpstreamAttachTenantAdminResponse,
): AttachTenantAdminClientResponse {
  return {
    userId: raw.user_id,
    tenantId: raw.tenant_id,
    programmeId: raw.programme_id,
    created: Boolean(raw.created),
  };
}
