import { z } from "zod";

export const numericValueSchema = z.union([z.number(), z.string()]);

export const percentageRangeSchema = z
  .object({
    min: numericValueSchema.optional(),
    max: numericValueSchema.optional(),
  })
  .passthrough();

export const battleDataSchema = z
  .object({
    damage: numericValueSchema.optional(),
    damageInterval: numericValueSchema.optional(),
    damageDamping: numericValueSchema.optional(),
    criticalRateEx: numericValueSchema.optional(),
    makeBreak: z.boolean().optional(),
    impartType: z.union([z.number(), z.string()]).optional(),
  })
  .passthrough();

export const effectSpawnSchema = z
  .object({
    objCode: z.string().optional(),
    relativeX: numericValueSchema.optional(),
    relativeY: numericValueSchema.optional(),
    relativeZ: numericValueSchema.optional(),
    rotationX: numericValueSchema.optional(),
    rotationY: numericValueSchema.optional(),
    rotationZ: numericValueSchema.optional(),
    followYou: z.boolean().optional(),
    destroyWhenColl: z.boolean().optional(),
  })
  .passthrough();

export const derivationSchema = z
  .object({
    priority: numericValueSchema.optional(),
    checkPeriod: percentageRangeSchema.optional(),
    fastExitTime: numericValueSchema.optional(),
    nextActionId: z.string().optional(),
  })
  .passthrough();

export const timelineSchema = z
  .object({
    $type: z.string(),
    timingBegin: numericValueSchema.optional(),
    timingEnd: numericValueSchema.optional(),
    joints: z.array(z.string()).optional(),
    battleData: battleDataSchema.optional(),
    effectSpawn: effectSpawnSchema.optional(),
  })
  .passthrough();

export const actionSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().optional(),
    command: z.string().optional(),
    animStateName: z.string().optional(),
    animBegin: numericValueSchema.optional(),
    animEnd: numericValueSchema.optional(),
    animSpeed: numericValueSchema.optional(),
    dirChangeable: z.boolean().optional(),
    TimelineDatas: z.array(timelineSchema).optional(),
    nextActionId: z.string().optional(),
    derivations: z.array(derivationSchema).optional(),
  })
  .passthrough();

export const actionDataDocumentSchema = z.array(actionSchema);
