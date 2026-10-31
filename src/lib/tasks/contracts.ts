import type { Priority, Status } from "./types";

export interface TaskFilters {
  search?: string;
  status?: Status | "all";
  priority?: Priority | "all";
}

export interface TaskStats {
  total: number;
  done: number;
  inProgress: number;
}
