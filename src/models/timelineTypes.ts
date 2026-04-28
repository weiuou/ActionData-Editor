export const TIMELINE_TYPES = {
  moveState: "MoveStateData, Assembly-CSharp",
  moveStraight: "MoveStraightData, Assembly-CSharp",
  jointColl: "JointCollData, Assembly-CSharp",
  effectSpawn: "EffectSpawnData, Assembly-CSharp",
  weaponColl: "WeaponCollData, Assembly-CSharp",
} as const;

export type KnownTimelineType = (typeof TIMELINE_TYPES)[keyof typeof TIMELINE_TYPES];

export const TIMELINE_TYPE_OPTIONS: Array<{ value: KnownTimelineType; label: string }> = [
  { value: TIMELINE_TYPES.moveState, label: "Move State" },
  { value: TIMELINE_TYPES.moveStraight, label: "Move Straight" },
  { value: TIMELINE_TYPES.jointColl, label: "Joint Collision" },
  { value: TIMELINE_TYPES.effectSpawn, label: "Effect Spawn" },
  { value: TIMELINE_TYPES.weaponColl, label: "Weapon Collision" },
];

export const isKnownTimelineType = (value: string): value is KnownTimelineType =>
  Object.values(TIMELINE_TYPES).includes(value as KnownTimelineType);

export const timelineTypeLabel = (value: string) =>
  TIMELINE_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? value;
