import { protectedFetchJson } from "@/services/auth.service";
import type { MatchResult } from "@/types/match-result";

export async function getMyMatchResults() {
  return protectedFetchJson<MatchResult[]>(
    "/match-results/my",
    { method: "GET" },
    "Không thể tải kết quả phù hợp",
  );
}
