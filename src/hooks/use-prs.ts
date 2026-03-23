import { invoke } from "@tauri-apps/api/core";
import { useQuery } from "@tanstack/react-query";

export interface PullRequest {
  number: number;
  title: string;
  state: string;
  url: string;
  head_branch: string;
}

export function usePRs() {
  return useQuery({
    queryKey: ["open-prs"],
    queryFn: () => invoke<PullRequest[]>("list_open_prs"),
    staleTime: Infinity,
  });
}
