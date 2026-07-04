import { protectedFetchJson } from "@/services/auth.service";
import type { MatchResult } from "@/types/match-result";
import {
  toQueryString,
  type Paginated,
  type PaginationQuery,
} from "@/types/pagination";

export async function getMyMatchResults(query: PaginationQuery = {}) {
  return protectedFetchJson<Paginated<MatchResult>>(
    `/match-results/my${toQueryString(query)}`,
    { method: "GET" },
    "Không thể tải kết quả phù hợp",
  );
}
