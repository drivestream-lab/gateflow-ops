"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/auth-fetch";
import { t } from "@/lib/i18n";
import {
  onboardedPullsPath,
  onboardPullPath,
  pickerPullsPath,
  type MetaPrPickerItem,
  type MetaPrPickerResponse,
} from "@/lib/meta-pr-picker";

const CATALOGUE_QUERY_KEY = ["gateflow", "meta", "pulls"] as const;
const ONBOARDED_QUERY_KEY = ["gateflow", "meta", "pulls", "onboarded"] as const;

async function fetchPicker(refresh = false): Promise<MetaPrPickerResponse> {
  const res = await authFetch(pickerPullsPath(refresh));
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? t("initiatives.errors.pickerFailed"));
  }
  return res.json() as Promise<MetaPrPickerResponse>;
}

async function fetchOnboarded(): Promise<MetaPrPickerResponse> {
  const res = await authFetch(onboardedPullsPath());
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? t("initiatives.errors.pickerFailed"));
  }
  return res.json() as Promise<MetaPrPickerResponse>;
}

export function useMetaPrPicker(options?: {
  enabled?: boolean;
  scope?: "catalogue" | "onboarded";
}) {
  const queryClient = useQueryClient();
  const scope = options?.scope ?? "catalogue";
  const query = useQuery({
    queryKey: scope === "onboarded" ? ONBOARDED_QUERY_KEY : CATALOGUE_QUERY_KEY,
    queryFn: () => (scope === "onboarded" ? fetchOnboarded() : fetchPicker(false)),
    enabled: options?.enabled ?? true,
    retry: false,
  });

  async function hardRefresh(): Promise<void> {
    const data = await fetchPicker(true);
    queryClient.setQueryData(CATALOGUE_QUERY_KEY, data);
  }

  const onboard = useMutation({
    mutationFn: async (htmlUrl: string): Promise<MetaPrPickerItem> => {
      const res = await authFetch(onboardPullPath(), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ html_url: htmlUrl }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? t("initiatives.errors.onboardFailed"));
      }
      return res.json() as Promise<MetaPrPickerItem>;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CATALOGUE_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ONBOARDED_QUERY_KEY });
    },
  });

  return {
    picker: query.data ?? null,
    isLoading: query.isPending,
    isRefreshing: query.isFetching,
    error:
      query.error instanceof Error
        ? query.error
        : query.error
          ? new Error(String(query.error))
          : null,
    refetch: query.refetch,
    hardRefresh,
    onboard,
  };
}
