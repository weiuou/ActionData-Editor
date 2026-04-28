import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface BooleanFieldProps {
  label: string;
  checked: boolean | undefined;
  onChange: (checked: boolean) => void;
  highlighted?: boolean;
  validationPath?: string;
}

export const BooleanField = ({ label, checked, onChange, highlighted = false, validationPath }: BooleanFieldProps) => (
  <label
    data-validation-path={validationPath}
    className={cn(
      "flex items-center gap-3 rounded-[5px] border border-border bg-white px-3 py-2 transition hover:border-black",
      highlighted && "border-destructive bg-destructive/10 ring-2 ring-destructive",
    )}
  >
    <Checkbox checked={Boolean(checked)} onChange={(event) => onChange(event.target.checked)} />
    <span className="text-sm font-medium">{label}</span>
  </label>
);
