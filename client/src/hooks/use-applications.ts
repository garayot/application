import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

export function usePositions() {
  return useQuery({
    queryKey: [api.positions.list.path],
    queryFn: async () => {
      const res = await fetch(api.positions.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch positions");
      return api.positions.list.responses[200].parse(await res.json());
    },
  });
}

export function useSchools() {
  return useQuery({
    queryKey: [api.schools.list.path],
    queryFn: async () => {
      const res = await fetch(api.schools.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch schools");
      return api.schools.list.responses[200].parse(await res.json());
    },
  });
}

export function useMajors() {
  return useQuery({
    queryKey: [api.majors.list.path],
    queryFn: async () => {
      const res = await fetch(api.majors.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch majors");
      return api.majors.list.responses[200].parse(await res.json());
    },
  });
}

export function useMyApplications() {
  return useQuery({
    queryKey: [api.applications.listMy.path],
    queryFn: async () => {
      const res = await fetch(api.applications.listMy.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch applications");
      return api.applications.listMy.responses[200].parse(await res.json());
    },
  });
}

export function useAllApplications() {
  return useQuery({
    queryKey: [api.applications.listAll.path],
    queryFn: async () => {
      const res = await fetch(api.applications.listAll.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch applications");
      return api.applications.listAll.responses[200].parse(await res.json());
    },
  });
}

export function useApplication(id: number) {
  return useQuery({
    queryKey: [api.applications.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.applications.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch application");
      return api.applications.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.applications.create.input>) => {
      const res = await fetch(api.applications.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to submit application");
      return api.applications.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.applications.listMy.path] }),
  });
}

export function useCreateIER() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number, data: z.infer<typeof api.ier.create.input> }) => {
      const url = buildUrl(api.ier.create.path, { id });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to submit IER");
      return api.ier.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.applications.listAll.path] });
      queryClient.invalidateQueries({ queryKey: [api.applications.get.path] });
    },
  });
}

export function useCreateIES() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number, data: z.infer<typeof api.ies.create.input> }) => {
      const url = buildUrl(api.ies.create.path, { id });
      // Coerce decimals to numbers or strings as schema expects
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to submit IES");
      return api.ies.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.applications.listAll.path] });
      queryClient.invalidateQueries({ queryKey: [api.applications.get.path] });
    },
  });
}

export function useCreateCAR() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number, data: z.infer<typeof api.car.create.input> }) => {
      const url = buildUrl(api.car.create.path, { id });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to submit CAR");
      return api.car.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.applications.listAll.path] });
      queryClient.invalidateQueries({ queryKey: [api.applications.get.path] });
    },
  });
}
