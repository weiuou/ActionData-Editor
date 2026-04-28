import { Input } from "@/components/ui/input";
import type { NumericValue } from "@/models/actionData";
import { cn } from "@/lib/utils";

interface NumberFieldProps {
  label: string;
  value: NumericValue | undefined;
  onChange: (value: NumericValue) => void;
  preserveString?: boolean;
  highlighted?: boolean;
  validationPath?: string;
}

export const NumberField = ({ label, value, onChange, preserveString = false, highlighted = false, validationPath }: NumberFieldProps) => (
  <label
    data-validation-path={validationPath}
    className={cn("grid gap-1.5 rounded-md transition", highlighted && "bg-destructive/10 p-2 ring-2 ring-destructive")}
  >
    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
    <Input
      type="number"
      step="any"
      value={value ?? ""}
      onChange={(event) => {
        const next = event.target.value;
        onChange(preserveString ? next : next === "" ? "" : Number(next));
      }}
    />
  </label>
);
