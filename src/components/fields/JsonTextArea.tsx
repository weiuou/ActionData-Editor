import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface JsonTextAreaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  highlighted?: boolean;
  validationPath?: string;
}

export const JsonTextArea = ({ label, value, onChange, error, highlighted = false, validationPath }: JsonTextAreaProps) => (
  <label
    data-validation-path={validationPath}
    className={cn("grid gap-1.5 rounded-md transition", highlighted && "bg-destructive/10 p-2 ring-2 ring-destructive")}
  >
    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
    <Textarea className="min-h-56 font-mono text-xs" value={value} onChange={(event) => onChange(event.target.value)} />
    {error ? <span className="text-xs text-destructive">{error}</span> : null}
  </label>
);
