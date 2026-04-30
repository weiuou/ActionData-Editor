import type { ActionData, BattleData, EffectSpawn, TimelineData } from "./actionData";
import { TIMELINE_TYPES, type KnownTimelineType } from "./timelineTypes";
import { buildDefaultObjectForType, getTimelineSchemaForType, type TimelineSchemaRegistry } from "@/schema/csharpTimelineSchema";

export const createEditorId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `editor-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const defaultBattleData = (): BattleData => ({
  damage: 0,
  damageInterval: 1,
  damageDamping: 0,
  criticalRateEx: 0,
  makeBreak: false,
  impartType: 0,
});

export const defaultEffectSpawn = (): EffectSpawn => ({
  objCode: "",
  relativeX: 0,
  relativeY: 0,
  relativeZ: 0,
  rotationX: 0,
  rotationY: 0,
  rotationZ: 0,
  followYou: false,
  destroyWhenColl: true,
});

export const createDefaultAction = (existingCount: number): ActionData => ({
  __editorId: createEditorId(),
  id: `New_Action_${existingCount + 1}`,
  name: "新动作",
  command: "",
  animStateName: "",
  animBegin: "0",
  animEnd: "1",
  animSpeed: 1,
  dirChangeable: false,
  TimelineDatas: [],
  nextActionId: "",
  derivations: [],
});

export const createDefaultTimeline = (type: KnownTimelineType | string, registry: TimelineSchemaRegistry | null = null): TimelineData => {
  const base = {
    __editorId: createEditorId(),
    $type: type,
    timingBegin: 0,
    timingEnd: 1,
  };

  switch (type) {
    case TIMELINE_TYPES.moveState:
      return {
        ...base,
        useGhostLayer: false,
        useGravity: true,
        useCommand: false,
        moveVelMultiAddition: 0,
        useRootMotion: false,
      };
    case TIMELINE_TYPES.moveStraight:
      return {
        ...base,
        useGhostLayer: false,
        useGravity: true,
        useCommand: false,
        moveVelMultiAddition: 0,
        useRootMotion: false,
        speed: 0,
      };
    case TIMELINE_TYPES.jointColl:
      return {
        ...base,
        joints: [],
        battleData: defaultBattleData(),
      };
    case TIMELINE_TYPES.effectSpawn:
      return {
        ...base,
        effectSpawn: defaultEffectSpawn(),
        battleData: defaultBattleData(),
      };
    case TIMELINE_TYPES.weaponColl:
      return {
        ...base,
        battleData: defaultBattleData(),
      };
    default: {
      const schema = getTimelineSchemaForType(registry, type);
      if (!schema) {
        return base;
      }
      const dynamicDefaults = buildDefaultObjectForType(schema.name, registry ?? { types: {}, enums: {}, timelineClassNames: [] });
      return {
        ...base,
        ...(dynamicDefaults ?? {}),
      };
    }
  }
};
