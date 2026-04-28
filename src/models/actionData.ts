import type { KnownTimelineType } from "./timelineTypes";

export type NumericValue = number | string;

export interface EditorMeta {
  __editorId: string;
}

export interface PercentageRange {
  min?: NumericValue;
  max?: NumericValue;
  [key: string]: unknown;
}

export interface BattleData {
  damage?: NumericValue;
  damageInterval?: NumericValue;
  damageDamping?: NumericValue;
  criticalRateEx?: NumericValue;
  makeBreak?: boolean;
  impartType?: number | string;
  [key: string]: unknown;
}

export interface EffectSpawn {
  objCode?: string;
  relativeX?: NumericValue;
  relativeY?: NumericValue;
  relativeZ?: NumericValue;
  rotationX?: NumericValue;
  rotationY?: NumericValue;
  rotationZ?: NumericValue;
  followYou?: boolean;
  destroyWhenColl?: boolean;
  [key: string]: unknown;
}

export interface ActionDerivation extends EditorMeta {
  priority?: NumericValue;
  checkPeriod?: PercentageRange;
  fastExitTime?: NumericValue;
  nextActionId?: string;
  [key: string]: unknown;
}

export interface BaseTimelineData extends EditorMeta {
  $type: string;
  timingBegin?: NumericValue;
  timingEnd?: NumericValue;
  [key: string]: unknown;
}

export interface MoveStateData extends BaseTimelineData {
  $type: "MoveStateData, Assembly-CSharp";
  useGhostLayer?: boolean;
  useGravity?: boolean;
  useCommand?: boolean;
  moveVelMultiAddition?: NumericValue;
  useRootMotion?: boolean;
}

export interface MoveStraightData extends BaseTimelineData {
  $type: "MoveStraightData, Assembly-CSharp";
  useGhostLayer?: boolean;
  useGravity?: boolean;
  useCommand?: boolean;
  moveVelMultiAddition?: NumericValue;
  useRootMotion?: boolean;
  speed?: NumericValue;
}

export interface JointCollData extends BaseTimelineData {
  $type: "JointCollData, Assembly-CSharp";
  joints?: string[];
  battleData?: BattleData;
}

export interface EffectSpawnData extends BaseTimelineData {
  $type: "EffectSpawnData, Assembly-CSharp";
  effectSpawn?: EffectSpawn;
  battleData?: BattleData;
}

export interface WeaponCollData extends BaseTimelineData {
  $type: "WeaponCollData, Assembly-CSharp";
  battleData?: BattleData;
}

export interface UnknownTimelineData extends BaseTimelineData {
  $type: string;
}

export type TimelineData =
  | MoveStateData
  | MoveStraightData
  | JointCollData
  | EffectSpawnData
  | WeaponCollData
  | UnknownTimelineData;

export interface ActionData extends EditorMeta {
  id?: string;
  name?: string;
  command?: string;
  animStateName?: string;
  animBegin?: NumericValue;
  animEnd?: NumericValue;
  animSpeed?: NumericValue;
  dirChangeable?: boolean;
  TimelineDatas?: TimelineData[];
  nextActionId?: string;
  derivations?: ActionDerivation[];
  [key: string]: unknown;
}

export type ActionDataDocument = ActionData[];

export type TimelinePatch = Partial<TimelineData> & { $type?: KnownTimelineType | string };
