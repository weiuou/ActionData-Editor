import { Plus, Trash2 } from "lucide-react";
import { NumberField } from "@/components/fields/NumberField";
import { TextField } from "@/components/fields/TextField";
import { Button } from "@/components/ui/button";
import type { ActionDerivation } from "@/models/actionData";
import { createEditorId } from "@/models/defaults";

interface DerivationEditorProps {
  derivations: ActionDerivation[];
  actionIndex: number;
  highlightedValidationPath: string | null;
  onChange: (derivations: ActionDerivation[]) => void;
}

export const DerivationEditor = ({ derivations, actionIndex, highlightedValidationPath, onChange }: DerivationEditorProps) => {
  const update = (index: number, patch: Partial<ActionDerivation>) => {
    onChange(derivations.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  };

  const isHighlighted = (path: string) => highlightedValidationPath === path || Boolean(highlightedValidationPath?.startsWith(`${path}.`));

  return (
    <section className="grid gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-mono text-2xl font-black leading-none text-white drop-shadow">Derivations</h2>
          <p className="text-sm text-white/80 drop-shadow">配置连招派生窗口与下一个动作。</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange([...derivations, { __editorId: createEditorId(), priority: 0, checkPeriod: { min: 0, max: 1 }, fastExitTime: 0, nextActionId: "" }])}
        >
          <Plus className="h-4 w-4" /> 新增派生
        </Button>
      </div>

      {derivations.map((derivation, index) => {
        const basePath = `[${actionIndex}].derivations[${index}]`;

        return (
        <div key={derivation.__editorId} data-validation-path={basePath} className="grid gap-3 rounded-md border border-border bg-white p-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">DERIVATION #{index + 1}</span>
            <Button type="button" variant="ghost" size="icon" onClick={() => onChange(derivations.filter((_, itemIndex) => itemIndex !== index))}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
            <NumberField label="Priority" value={derivation.priority} validationPath={`${basePath}.priority`} highlighted={isHighlighted(`${basePath}.priority`)} onChange={(priority) => update(index, { priority })} />
            <NumberField label="Check Min" value={derivation.checkPeriod?.min} validationPath={`${basePath}.checkPeriod`} highlighted={isHighlighted(`${basePath}.checkPeriod`)} onChange={(min) => update(index, { checkPeriod: { ...(derivation.checkPeriod ?? {}), min } })} />
            <NumberField label="Check Max" value={derivation.checkPeriod?.max} validationPath={`${basePath}.checkPeriod`} highlighted={isHighlighted(`${basePath}.checkPeriod`)} onChange={(max) => update(index, { checkPeriod: { ...(derivation.checkPeriod ?? {}), max } })} />
            <NumberField label="Fast Exit" value={derivation.fastExitTime} validationPath={`${basePath}.fastExitTime`} highlighted={isHighlighted(`${basePath}.fastExitTime`)} onChange={(fastExitTime) => update(index, { fastExitTime })} />
            <TextField label="Next Action" value={derivation.nextActionId} validationPath={`${basePath}.nextActionId`} highlighted={isHighlighted(`${basePath}.nextActionId`)} onChange={(nextActionId) => update(index, { nextActionId })} />
          </div>
        </div>
        );
      })}
    </section>
  );
};
