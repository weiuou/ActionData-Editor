import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TextFieldProps {
  label: string;
  value: string | number | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  highlighted?: boolean;
  validationPath?: string;
}

export const TextField = ({ label, value, onChange, placeholder, highlighted = false, validationPath }: TextFieldProps) => (
  <label
    data-validation-path={validationPath}
    className={cn("grid gap-1.5 rounded-md transition", highlighted && "bg-destructive/10 p-2 ring-2 ring-destructive")}
  >
    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
    <Input value={value ?? ""} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
  </label>
);
