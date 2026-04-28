import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { BooleanField } from "@/components/fields/BooleanField";
import { NumberField } from "@/components/fields/NumberField";
import { TextField } from "@/components/fields/TextField";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DerivationEditor } from "./DerivationEditor";
import { TimelineEditor } from "@/components/timelines/TimelineEditor";
import type { ActionData, ActionDerivation, NumericValue, TimelinePatch } from "@/models/actionData";
import type { KnownTimelineType } from "@/models/timelineTypes";

const actionFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  command: z.string().optional(),
  animStateName: z.string().optional(),
  animBegin: z.union([z.string(), z.number()]).optional(),
  animEnd: z.union([z.string(), z.number()]).optional(),
  animSpeed: z.union([z.string(), z.number()]).optional(),
  dirChangeable: z.boolean().optional(),
  nextActionId: z.string().optional(),
});

type ActionFormValue = z.infer<typeof actionFormSchema>;

interface ActionEditorProps {
  action: ActionData | null;
  actionIndex: number;
  selectedTimelineId: string | null;
  highlightedValidationPath: string | null;
  onUpdateAction: (patch: Partial<ActionData>) => void;
  onSelectTimeline: (id: string) => void;
  onAddTimeline: (type: KnownTimelineType) => void;
  onUpdateTimeline: (timelineId: string, patch: TimelinePatch) => void;
  onDuplicateTimeline: (timelineId: string) => void;
  onDeleteTimeline: (timelineId: string) => void;
  onMoveTimeline: (timelineId: string, direction: "up" | "down") => void;
  onUpdateDerivations: (derivations: ActionDerivation[]) => void;
}

export const ActionEditor = ({
  action,
  actionIndex,
  selectedTimelineId,
  highlightedValidationPath,
  onUpdateAction,
  onSelectTimeline,
  onAddTimeline,
  onUpdateTimeline,
  onDuplicateTimeline,
  onDeleteTimeline,
  onMoveTimeline,
  onUpdateDerivations,
}: ActionEditorProps) => {
  const { control, reset } = useForm<ActionFormValue>({
    resolver: zodResolver(actionFormSchema),
    values: action ?? {},
  });

  useEffect(() => {
    reset(action ?? {});
  }, [action, reset]);

  if (!action) {
    return (
      <div className="grid h-full place-items-center rounded-lg border border-dashed border-border bg-white text-muted-foreground">
        打开 JSON 或新增动作后开始编辑。
      </div>
    );
  }

  const patch = (field: keyof ActionFormValue, value: NumericValue | boolean | string) => onUpdateAction({ [field]: value });
  const actionPath = `[${actionIndex}]`;
  const isHighlighted = (path: string) => highlightedValidationPath === path || Boolean(highlightedValidationPath?.startsWith(`${path}.`));

  return (
    <div className="grid gap-5 pb-8">
      <Card className="overflow-hidden">
        <CardHeader className="relative border-b border-border bg-white after:absolute after:bottom-0 after:left-0 after:h-2 after:w-24 after:bg-[#ECD53F]">
          <CardTitle className="flex items-center justify-between">
            <span className="font-mono text-xl font-black text-black">{action.id || "Untitled Action"}</span>
            <span className="font-mono text-xs text-muted-foreground">{action.animStateName || "no animator state"}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 pt-4">
          <div className="grid gap-3 xl:grid-cols-4">
            <Controller name="id" control={control} render={({ field }) => <TextField label="ID" value={field.value} validationPath={`${actionPath}.id`} highlighted={isHighlighted(`${actionPath}.id`)} onChange={(value) => { field.onChange(value); patch("id", value); }} />} />
            <Controller name="name" control={control} render={({ field }) => <TextField label="Name" value={field.value} validationPath={`${actionPath}.name`} highlighted={isHighlighted(`${actionPath}.name`)} onChange={(value) => { field.onChange(value); patch("name", value); }} />} />
            <Controller name="command" control={control} render={({ field }) => <TextField label="Command" value={field.value} validationPath={`${actionPath}.command`} highlighted={isHighlighted(`${actionPath}.command`)} onChange={(value) => { field.onChange(value); patch("command", value); }} />} />
            <Controller name="animStateName" control={control} render={({ field }) => <TextField label="Anim State" value={field.value} validationPath={`${actionPath}.animStateName`} highlighted={isHighlighted(`${actionPath}.animStateName`)} onChange={(value) => { field.onChange(value); patch("animStateName", value); }} />} />
          </div>
          <div className="grid gap-3 xl:grid-cols-5">
            <Controller name="animBegin" control={control} render={({ field }) => <NumberField preserveString label="Anim Begin" value={field.value} validationPath={`${actionPath}.animBegin`} highlighted={isHighlighted(`${actionPath}.animBegin`)} onChange={(value) => { field.onChange(value); patch("animBegin", value); }} />} />
            <Controller name="animEnd" control={control} render={({ field }) => <NumberField preserveString label="Anim End" value={field.value} validationPath={`${actionPath}.animEnd`} highlighted={isHighlighted(`${actionPath}.animEnd`)} onChange={(value) => { field.onChange(value); patch("animEnd", value); }} />} />
            <Controller name="animSpeed" control={control} render={({ field }) => <NumberField label="Anim Speed" value={field.value} validationPath={`${actionPath}.animSpeed`} highlighted={isHighlighted(`${actionPath}.animSpeed`)} onChange={(value) => { field.onChange(value); patch("animSpeed", value); }} />} />
            <Controller name="nextActionId" control={control} render={({ field }) => <TextField label="Next Action" value={field.value} validationPath={`${actionPath}.nextActionId`} highlighted={isHighlighted(`${actionPath}.nextActionId`)} onChange={(value) => { field.onChange(value); patch("nextActionId", value); }} />} />
            <Controller name="dirChangeable" control={control} render={({ field }) => <BooleanField label="Dir Changeable" checked={field.value} validationPath={`${actionPath}.dirChangeable`} highlighted={isHighlighted(`${actionPath}.dirChangeable`)} onChange={(value) => { field.onChange(value); patch("dirChangeable", value); }} />} />
          </div>
        </CardContent>
      </Card>

      <TimelineEditor
        action={action}
        actionIndex={actionIndex}
        selectedTimelineId={selectedTimelineId}
        highlightedValidationPath={highlightedValidationPath}
        onSelectTimeline={onSelectTimeline}
        onAddTimeline={onAddTimeline}
        onUpdateTimeline={onUpdateTimeline}
        onDuplicateTimeline={onDuplicateTimeline}
        onDeleteTimeline={onDeleteTimeline}
        onMoveTimeline={onMoveTimeline}
      />

      <DerivationEditor derivations={action.derivations ?? []} actionIndex={actionIndex} highlightedValidationPath={highlightedValidationPath} onChange={onUpdateDerivations} />
    </div>
  );
};
