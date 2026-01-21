import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

export function useApplicantProfile() {
  return useQuery({
    queryKey: [api.applicants.getProfile.path],
    queryFn: async () => {
      const res = await fetch(api.applicants.getProfile.path, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch profile");
      return api.applicants.getProfile.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateApplicantProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.applicants.updateProfile.input>) => {
      const validated = api.applicants.updateProfile.input.parse(data);
      const res = await fetch(api.applicants.updateProfile.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return api.applicants.updateProfile.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.applicants.getProfile.path] }),
  });
}

export function useApplicantsList() {
  return useQuery({
    queryKey: [api.applicants.list.path],
    queryFn: async () => {
      const res = await fetch(api.applicants.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch applicants");
      return api.applicants.list.responses[200].parse(await res.json());
    },
  });
}
