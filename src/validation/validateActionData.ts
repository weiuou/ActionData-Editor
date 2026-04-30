import type { ActionDataDocument, BattleData, NumericValue, TimelineData } from "@/models/actionData";
import { isKnownTimelineType } from "@/models/timelineTypes";
import { getTimelineSchemaForType, type TimelineSchemaRegistry } from "@/schema/csharpTimelineSchema";
import type { ValidationIssue } from "./validationTypes";

const toNumber = (value: NumericValue | unknown): number | null => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const isEmpty = (value: unknown) => typeof value !== "string" || value.trim() === "";

const pushIssue = (
  issues: ValidationIssue[],
  severity: ValidationIssue["severity"],
  path: string,
  message: string,
  actionId?: string,
  timelineId?: string,
) => {
  issues.push({ severity, path, message, actionId, timelineId });
};

const validateBattleData = (
  battleData: BattleData | undefined,
  issues: ValidationIssue[],
  path: string,
  actionId?: string,
  timelineId?: string,
) => {
  if (!battleData) {
    return;
  }

  const damage = toNumber(battleData.damage);
  if (damage !== null && damage < 0) {
    pushIssue(issues, "warning", `${path}.damage`, "damage should not be negative.", actionId, timelineId);
  }

  const criticalRateEx = toNumber(battleData.criticalRateEx);
  if (criticalRateEx !== null && (criticalRateEx < 0 || criticalRateEx > 1)) {
    pushIssue(issues, "warning", `${path}.criticalRateEx`, "criticalRateEx is usually between 0 and 1.", actionId, timelineId);
  }
};

const validateTimeline = (
  timeline: TimelineData,
  issues: ValidationIssue[],
  actionId: string | undefined,
  actionIndex: number,
  timelineIndex: number,
  timelineSchemaRegistry: TimelineSchemaRegistry | null,
) => {
  const path = `[${actionIndex}].TimelineDatas[${timelineIndex}]`;
  const hasDynamicSchema = Boolean(getTimelineSchemaForType(timelineSchemaRegistry, timeline.$type));

  if (isEmpty(timeline.$type)) {
    pushIssue(issues, "error", `${path}.$type`, "TimelineData is missing $type.", actionId, timeline.__editorId);
  } else if (!isKnownTimelineType(timeline.$type) && !hasDynamicSchema) {
    pushIssue(issues, "warning", `${path}.$type`, `Unknown TimelineData type: ${timeline.$type}`, actionId, timeline.__editorId);
  }

  const begin = toNumber(timeline.timingBegin);
  const end = toNumber(timeline.timingEnd);

  if (timeline.timingBegin === undefined || timeline.timingEnd === undefined) {
    pushIssue(issues, "warning", path, "TimelineData is missing timingBegin or timingEnd.", actionId, timeline.__editorId);
  }

  if (begin !== null && end !== null && begin >= end) {
    pushIssue(issues, "error", path, "timingBegin must be less than timingEnd.", actionId, timeline.__editorId);
  }

  if ("battleData" in timeline) {
    validateBattleData(timeline.battleData as BattleData | undefined, issues, `${path}.battleData`, actionId, timeline.__editorId);
  }
};

export const validateActionData = (
  document: ActionDataDocument | null,
  timelineSchemaRegistry: TimelineSchemaRegistry | null = null,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (!document) {
    return issues;
  }

  if (!Array.isArray(document)) {
    pushIssue(issues, "error", "root", "Root node must be an ActionData array.");
    return issues;
  }

  if (document.length === 0) {
    pushIssue(issues, "warning", "root", "ActionData is empty.");
  }

  const actionIds = new Map<string, number>();

  document.forEach((action, actionIndex) => {
    if (isEmpty(action.id)) {
      pushIssue(issues, "error", `[${actionIndex}].id`, "Action is missing id.", action.__editorId);
      return;
    }

    const id = action.id?.trim() ?? "";
    if (actionIds.has(id)) {
      pushIssue(issues, "error", `[${actionIndex}].id`, `Duplicate Action id: ${id}`, action.__editorId);
    } else {
      actionIds.set(id, actionIndex);
    }
  });

  document.forEach((action, actionIndex) => {
    const actionId = action.__editorId;
    const id = action.id?.trim() ?? "";

    if (isEmpty(action.animStateName)) {
      pushIssue(issues, "warning", `[${actionIndex}].animStateName`, "animStateName is empty.", actionId);
    }

    if (isEmpty(action.command)) {
      pushIssue(issues, "warning", `[${actionIndex}].command`, "command is empty.", actionId);
    }

    if (action.nextActionId && !actionIds.has(action.nextActionId)) {
      pushIssue(issues, "error", `[${actionIndex}].nextActionId`, `nextActionId points to a missing action: ${action.nextActionId}`, actionId);
    }

    if (!Array.isArray(action.TimelineDatas)) {
      pushIssue(issues, "error", `[${actionIndex}].TimelineDatas`, "TimelineDatas must be an array.", actionId);
    } else if (action.TimelineDatas.length === 0) {
      pushIssue(issues, "warning", `[${actionIndex}].TimelineDatas`, "TimelineDatas is empty.", actionId);
    } else {
      action.TimelineDatas.forEach((timeline, timelineIndex) =>
        validateTimeline(timeline, issues, actionId, actionIndex, timelineIndex, timelineSchemaRegistry),
      );
    }

    action.derivations?.forEach((derivation, derivationIndex) => {
      const path = `[${actionIndex}].derivations[${derivationIndex}]`;
      const nextActionId = derivation.nextActionId?.trim();

      if (nextActionId && !actionIds.has(nextActionId)) {
        pushIssue(issues, "error", `${path}.nextActionId`, `Derived action does not exist: ${nextActionId}`, actionId);
      }

      if (nextActionId && nextActionId === id) {
        pushIssue(issues, "warning", `${path}.nextActionId`, "Derived action points to itself.", actionId);
      }

      const min = toNumber(derivation.checkPeriod?.min);
      const max = toNumber(derivation.checkPeriod?.max);
      if (min !== null && max !== null && min > max) {
        pushIssue(issues, "error", `${path}.checkPeriod`, "checkPeriod.min must be less than or equal to max.", actionId);
      }
    });
  });

  return issues;
};
