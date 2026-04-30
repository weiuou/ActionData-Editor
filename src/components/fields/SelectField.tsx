import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface SelectFieldProps {
  label: string;
  value: string | number | undefined;
  onChange: (value: string) => void;
  options: Array<{ value: string | number; label: string }>;
  highlighted?: boolean;
  validationPath?: string;
}

export const SelectField = ({ label, value, onChange, options, highlighted = false, validationPath }: SelectFieldProps) => (
  <label
    data-validation-path={validationPath}
    className={cn("grid gap-1.5 rounded-md transition", highlighted && "bg-destructive/10 p-2 ring-2 ring-destructive")}
  >
    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
    <Select value={value ?? ""} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => (
        <option key={String(option.value)} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  </label>
);
