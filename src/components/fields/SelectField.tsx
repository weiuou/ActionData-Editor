import { Select } from "@/components/ui/select";

interface SelectFieldProps {
  label: string;
  value: string | number | undefined;
  onChange: (value: string) => void;
  options: Array<{ value: string | number; label: string }>;
}

export const SelectField = ({ label, value, onChange, options }: SelectFieldProps) => (
  <label className="grid gap-1.5">
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
