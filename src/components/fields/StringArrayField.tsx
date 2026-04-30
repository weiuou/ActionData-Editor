import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface StringArrayFieldProps {
  label: string;
  value: string[] | undefined;
  onChange: (value: string[]) => void;
  placeholder?: string;
  highlighted?: boolean;
  validationPath?: string;
}

const splitPattern = /[\s,]+/;

const normalizeTokens = (value: string) =>
  value
    .split(splitPattern)
    .map((item) => item.trim())
    .filter(Boolean);

export const StringArrayField = ({
  label,
  value,
  onChange,
  placeholder,
  highlighted = false,
  validationPath,
}: StringArrayFieldProps) => {
  const [draft, setDraft] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const items = value ?? [];

  useEffect(() => {
    setDraft("");
  }, [items.join("\u0000")]);

  const commitDraft = (rawValue: string) => {
    const nextItems = normalizeTokens(rawValue);
    if (nextItems.length === 0) {
      setDraft("");
      return;
    }

    onChange([...items, ...nextItems]);
    setDraft("");
  };

  return (
    <label
      data-validation-path={validationPath}
      className={cn("grid gap-1.5 rounded-md transition", highlighted && "bg-destructive/10 p-2 ring-2 ring-destructive")}
    >
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <div className="flex min-h-[3.5rem] flex-wrap items-center gap-2 rounded-[5px] border border-input bg-white px-3 py-2 transition focus-within:border-black focus-within:ring-2 focus-within:ring-black/10">
        {items.map((item, index) => (
          <span key={`${item}-${index}`} className="inline-flex items-center gap-2 rounded-full bg-[#d8ecff] px-3 py-1 text-sm font-medium text-[#0a63c9]">
            {item}
            <button
              type="button"
              className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[#0a63c9] transition hover:bg-[#b9dbff]"
              onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <Input
          className="h-8 min-w-[12rem] flex-1 border-0 px-0 py-0 shadow-none focus-visible:ring-0"
          value={draft}
          placeholder={items.length === 0 ? placeholder : undefined}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => commitDraft(draft)}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          onKeyDown={(event) => {
            if (event.key === "Backspace" && draft.length === 0 && items.length > 0) {
              onChange(items.slice(0, -1));
              return;
            }

            if (isComposing) {
              return;
            }

            if (event.key === "Enter" || event.key === "," || event.key === " ") {
              event.preventDefault();
              commitDraft(draft);
            }
          }}
          onPaste={(event) => {
            const pasted = event.clipboardData.getData("text");
            if (!splitPattern.test(pasted)) {
              return;
            }
            event.preventDefault();
            commitDraft(`${draft} ${pasted}`);
          }}
        />
      </div>
    </label>
  );
};
