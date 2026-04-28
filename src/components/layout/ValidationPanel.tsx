import { AlertTriangle, CircleAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ValidationIssue } from "@/validation/validationTypes";
import { cn } from "@/lib/utils";

interface ValidationDialogProps {
  issues: ValidationIssue[];
  open: boolean;
  onClose: () => void;
  onSelectIssue: (issue: ValidationIssue) => void;
}

export const ValidationDialog = ({ issues, open, onClose, onSelectIssue }: ValidationDialogProps) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/35 px-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-label="校验结果">
      <div className="relative flex max-h-[82vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-black bg-white simple-card-shadow">
        <div className="relative border-b border-black bg-white p-5">
          <div className="absolute inset-x-0 top-0 h-2 bg-[#EC1C24]" />
          <div className="flex items-start justify-between gap-4 pt-1">
            <div>
              <div className="text-sm text-muted-foreground">校验结果</div>
              <div className="mt-1 flex items-end gap-3">
                <div className="font-mono text-[42px] font-black leading-none text-black">{issues.length}</div>
                <div className="pb-1 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">issues</div>
              </div>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="关闭校验结果">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-2 overflow-auto bg-[#fafafa] p-4">
          {issues.length === 0 ? (
            <div className="rounded-md border border-black bg-white p-5 text-sm text-black">
              <div className="mb-3 h-2 w-20 bg-[#40AEF0]" />
              没有发现校验问题。
            </div>
          ) : null}
          {issues.map((issue, index) => (
            <button
              key={`${issue.path}-${index}`}
              onClick={() => onSelectIssue(issue)}
              className={cn(
                "relative w-full overflow-hidden rounded-md border bg-white p-4 pb-6 text-left transition hover:-translate-y-0.5 hover:border-black hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black",
                issue.severity === "error" ? "border-destructive" : "border-border",
              )}
            >
              <div className={cn("absolute inset-x-0 bottom-0 h-2", issue.severity === "error" ? "bg-[#EC1C24]" : "bg-[#ECD53F]")} />
              <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-black">
                {issue.severity === "error" ? <CircleAlert className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                {issue.severity}
              </div>
              <div className="text-sm leading-5 text-black">{issue.message}</div>
              <div className="mt-2 break-all font-mono text-[11px] text-muted-foreground">{issue.path}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
