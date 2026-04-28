import { useMemo, useState } from "react";
import { JsonTextArea } from "@/components/fields/JsonTextArea";
import { BooleanField } from "@/components/fields/BooleanField";
import { NumberField } from "@/components/fields/NumberField";
import { TextField } from "@/components/fields/TextField";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BattleData, EffectSpawn, TimelineData } from "@/models/actionData";
import { TIMELINE_TYPES, timelineTypeLabel } from "@/models/timelineTypes";

interface TimelineItemEditorProps {
  timeline: TimelineData;
  actionIndex: number;
  timelineIndex: number;
  highlightedValidationPath: string | null;
  onChange: (patch: Partial<TimelineData>) => void;
}

const updateBattleData = (battleData: BattleData | undefined, patch: Partial<BattleData>) => ({
  ...(battleData ?? {}),
  ...patch,
});

const updateEffectSpawn = (effectSpawn: EffectSpawn | undefined, patch: Partial<EffectSpawn>) => ({
  ...(effectSpawn ?? {}),
  ...patch,
});

const BattleDataFields = ({ value, basePath, isHighlighted, onChange }: { value?: BattleData; basePath: string; isHighlighted: (path: string) => boolean; onChange: (value: BattleData) => void }) => (
  <div data-validation-path={basePath} className="grid gap-3 rounded-md border border-border bg-white p-3">
    <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Battle Data</div>
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
      <NumberField label="Damage" value={value?.damage} validationPath={`${basePath}.damage`} highlighted={isHighlighted(`${basePath}.damage`)} onChange={(damage) => onChange(updateBattleData(value, { damage }))} />
      <NumberField label="Interval" value={value?.damageInterval} validationPath={`${basePath}.damageInterval`} highlighted={isHighlighted(`${basePath}.damageInterval`)} onChange={(damageInterval) => onChange(updateBattleData(value, { damageInterval }))} />
      <NumberField label="Damping" value={value?.damageDamping} validationPath={`${basePath}.damageDamping`} highlighted={isHighlighted(`${basePath}.damageDamping`)} onChange={(damageDamping) => onChange(updateBattleData(value, { damageDamping }))} />
      <NumberField label="Critical" value={value?.criticalRateEx} validationPath={`${basePath}.criticalRateEx`} highlighted={isHighlighted(`${basePath}.criticalRateEx`)} onChange={(criticalRateEx) => onChange(updateBattleData(value, { criticalRateEx }))} />
      <NumberField label="Impart" value={value?.impartType} validationPath={`${basePath}.impartType`} highlighted={isHighlighted(`${basePath}.impartType`)} onChange={(impartType) => onChange(updateBattleData(value, { impartType }))} />
      <BooleanField label="Make Break" checked={value?.makeBreak} validationPath={`${basePath}.makeBreak`} highlighted={isHighlighted(`${basePath}.makeBreak`)} onChange={(makeBreak) => onChange(updateBattleData(value, { makeBreak }))} />
    </div>
  </div>
);

const EffectSpawnFields = ({ value, basePath, isHighlighted, onChange }: { value?: EffectSpawn; basePath: string; isHighlighted: (path: string) => boolean; onChange: (value: EffectSpawn) => void }) => (
  <div data-validation-path={basePath} className="grid gap-3 rounded-md border border-border bg-white p-3">
    <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Effect Spawn</div>
    <TextField label="Obj Code" value={value?.objCode} validationPath={`${basePath}.objCode`} highlighted={isHighlighted(`${basePath}.objCode`)} onChange={(objCode) => onChange(updateEffectSpawn(value, { objCode }))} />
    <div className="grid grid-cols-3 gap-3">
      <NumberField label="Relative X" value={value?.relativeX} validationPath={`${basePath}.relativeX`} highlighted={isHighlighted(`${basePath}.relativeX`)} onChange={(relativeX) => onChange(updateEffectSpawn(value, { relativeX }))} />
      <NumberField label="Relative Y" value={value?.relativeY} validationPath={`${basePath}.relativeY`} highlighted={isHighlighted(`${basePath}.relativeY`)} onChange={(relativeY) => onChange(updateEffectSpawn(value, { relativeY }))} />
      <NumberField label="Relative Z" value={value?.relativeZ} validationPath={`${basePath}.relativeZ`} highlighted={isHighlighted(`${basePath}.relativeZ`)} onChange={(relativeZ) => onChange(updateEffectSpawn(value, { relativeZ }))} />
      <NumberField label="Rotation X" value={value?.rotationX} validationPath={`${basePath}.rotationX`} highlighted={isHighlighted(`${basePath}.rotationX`)} onChange={(rotationX) => onChange(updateEffectSpawn(value, { rotationX }))} />
      <NumberField label="Rotation Y" value={value?.rotationY} validationPath={`${basePath}.rotationY`} highlighted={isHighlighted(`${basePath}.rotationY`)} onChange={(rotationY) => onChange(updateEffectSpawn(value, { rotationY }))} />
      <NumberField label="Rotation Z" value={value?.rotationZ} validationPath={`${basePath}.rotationZ`} highlighted={isHighlighted(`${basePath}.rotationZ`)} onChange={(rotationZ) => onChange(updateEffectSpawn(value, { rotationZ }))} />
    </div>
    <div className="grid grid-cols-2 gap-3">
      <BooleanField label="Follow You" checked={value?.followYou} validationPath={`${basePath}.followYou`} highlighted={isHighlighted(`${basePath}.followYou`)} onChange={(followYou) => onChange(updateEffectSpawn(value, { followYou }))} />
      <BooleanField label="Destroy When Coll" checked={value?.destroyWhenColl} validationPath={`${basePath}.destroyWhenColl`} highlighted={isHighlighted(`${basePath}.destroyWhenColl`)} onChange={(destroyWhenColl) => onChange(updateEffectSpawn(value, { destroyWhenColl }))} />
    </div>
  </div>
);

export const TimelineItemEditor = ({ timeline, actionIndex, timelineIndex, highlightedValidationPath, onChange }: TimelineItemEditorProps) => {
  const [rawJson, setRawJson] = useState(() => JSON.stringify(timeline, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);
  const isUnknown = !Object.values(TIMELINE_TYPES).includes(timeline.$type as never);

  const header = useMemo(() => timelineTypeLabel(timeline.$type), [timeline.$type]);
  const timelinePath = `[${actionIndex}].TimelineDatas[${timelineIndex}]`;
  const isHighlighted = (path: string) => highlightedValidationPath === path || Boolean(highlightedValidationPath?.startsWith(`${path}.`));

  const updateRawJson = (value: string) => {
    setRawJson(value);
    try {
      const parsed = JSON.parse(value);
      setJsonError(null);
      onChange(parsed);
    } catch (error) {
      setJsonError(error instanceof Error ? error.message : "JSON 无效");
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="relative bg-white after:absolute after:bottom-0 after:left-0 after:h-2 after:w-24 after:bg-[#40AEF0]">
        <CardTitle>{header}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Timing Begin" value={timeline.timingBegin} validationPath={`${timelinePath}.timingBegin`} highlighted={isHighlighted(`${timelinePath}.timingBegin`) || isHighlighted(timelinePath)} onChange={(timingBegin) => onChange({ timingBegin })} />
          <NumberField label="Timing End" value={timeline.timingEnd} validationPath={`${timelinePath}.timingEnd`} highlighted={isHighlighted(`${timelinePath}.timingEnd`) || isHighlighted(timelinePath)} onChange={(timingEnd) => onChange({ timingEnd })} />
        </div>

        {timeline.$type === TIMELINE_TYPES.moveState || timeline.$type === TIMELINE_TYPES.moveStraight ? (
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
              <BooleanField label="Ghost Layer" checked={timeline.useGhostLayer as boolean} validationPath={`${timelinePath}.useGhostLayer`} highlighted={isHighlighted(`${timelinePath}.useGhostLayer`)} onChange={(useGhostLayer) => onChange({ useGhostLayer })} />
              <BooleanField label="Gravity" checked={timeline.useGravity as boolean} validationPath={`${timelinePath}.useGravity`} highlighted={isHighlighted(`${timelinePath}.useGravity`)} onChange={(useGravity) => onChange({ useGravity })} />
              <BooleanField label="Use Command" checked={timeline.useCommand as boolean} validationPath={`${timelinePath}.useCommand`} highlighted={isHighlighted(`${timelinePath}.useCommand`)} onChange={(useCommand) => onChange({ useCommand })} />
              <BooleanField label="Root Motion" checked={timeline.useRootMotion as boolean} validationPath={`${timelinePath}.useRootMotion`} highlighted={isHighlighted(`${timelinePath}.useRootMotion`)} onChange={(useRootMotion) => onChange({ useRootMotion })} />
              <NumberField label="Velocity Add" value={timeline.moveVelMultiAddition as number} validationPath={`${timelinePath}.moveVelMultiAddition`} highlighted={isHighlighted(`${timelinePath}.moveVelMultiAddition`)} onChange={(moveVelMultiAddition) => onChange({ moveVelMultiAddition })} />
              {timeline.$type === TIMELINE_TYPES.moveStraight ? (
                <NumberField label="Speed" value={timeline.speed as number} validationPath={`${timelinePath}.speed`} highlighted={isHighlighted(`${timelinePath}.speed`)} onChange={(speed) => onChange({ speed })} />
              ) : null}
            </div>
          </div>
        ) : null}

        {timeline.$type === TIMELINE_TYPES.jointColl ? (
          <>
            <TextField
              label="Joints"
              value={Array.isArray(timeline.joints) ? timeline.joints.join(", ") : ""}
              placeholder="coll_handR, coll_handL"
              validationPath={`${timelinePath}.joints`}
              highlighted={isHighlighted(`${timelinePath}.joints`)}
              onChange={(value) => onChange({ joints: value.split(",").map((item) => item.trim()).filter(Boolean) })}
            />
            <BattleDataFields value={timeline.battleData as BattleData | undefined} basePath={`${timelinePath}.battleData`} isHighlighted={isHighlighted} onChange={(battleData) => onChange({ battleData })} />
          </>
        ) : null}

        {timeline.$type === TIMELINE_TYPES.weaponColl ? (
          <BattleDataFields value={timeline.battleData as BattleData | undefined} basePath={`${timelinePath}.battleData`} isHighlighted={isHighlighted} onChange={(battleData) => onChange({ battleData })} />
        ) : null}

        {timeline.$type === TIMELINE_TYPES.effectSpawn ? (
          <>
            <EffectSpawnFields value={timeline.effectSpawn as EffectSpawn | undefined} basePath={`${timelinePath}.effectSpawn`} isHighlighted={isHighlighted} onChange={(effectSpawn) => onChange({ effectSpawn })} />
            <BattleDataFields value={timeline.battleData as BattleData | undefined} basePath={`${timelinePath}.battleData`} isHighlighted={isHighlighted} onChange={(battleData) => onChange({ battleData })} />
          </>
        ) : null}

        {isUnknown ? <JsonTextArea label="Raw Timeline JSON" value={rawJson} validationPath={timelinePath} highlighted={isHighlighted(timelinePath)} onChange={updateRawJson} error={jsonError} /> : null}
      </CardContent>
    </Card>
  );
};
