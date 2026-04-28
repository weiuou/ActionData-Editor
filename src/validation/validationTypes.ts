export interface ValidationIssue {
  severity: "error" | "warning";
  path: string;
  message: string;
  actionId?: string;
  timelineId?: string;
}
