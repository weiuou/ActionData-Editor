import type { ActionDataDocument, BattleData, NumericValue, TimelineData } from "@/models/actionData";
import { isKnownTimelineType } from "@/models/timelineTypes";
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
    pushIssue(issues, "warning", `${path}.damage`, "damage 不应为负数。", actionId, timelineId);
  }

  const criticalRateEx = toNumber(battleData.criticalRateEx);
  if (criticalRateEx !== null && (criticalRateEx < 0 || criticalRateEx > 1)) {
    pushIssue(issues, "warning", `${path}.criticalRateEx`, "criticalRateEx 通常应在 0 到 1 之间。", actionId, timelineId);
  }
};

const validateTimeline = (
  timeline: TimelineData,
  issues: ValidationIssue[],
  actionId: string | undefined,
  actionIndex: number,
  timelineIndex: number,
) => {
  const path = `[${actionIndex}].TimelineDatas[${timelineIndex}]`;

  if (isEmpty(timeline.$type)) {
    pushIssue(issues, "error", `${path}.$type`, "TimelineData 缺少 $type。", actionId, timeline.__editorId);
  } else if (!isKnownTimelineType(timeline.$type)) {
    pushIssue(issues, "warning", `${path}.$type`, `未知 TimelineData 类型：${timeline.$type}`, actionId, timeline.__editorId);
  }

  const begin = toNumber(timeline.timingBegin);
  const end = toNumber(timeline.timingEnd);

  if (timeline.timingBegin === undefined || timeline.timingEnd === undefined) {
    pushIssue(issues, "warning", path, "TimelineData 缺少 timingBegin 或 timingEnd。", actionId, timeline.__editorId);
  }

  if (begin !== null && end !== null && begin >= end) {
    pushIssue(issues, "error", path, "timingBegin 必须小于 timingEnd。", actionId, timeline.__editorId);
  }

  if ("battleData" in timeline) {
    validateBattleData(timeline.battleData as BattleData | undefined, issues, `${path}.battleData`, actionId, timeline.__editorId);
  }
};

export const validateActionData = (document: ActionDataDocument | null): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (!document) {
    return issues;
  }

  if (!Array.isArray(document)) {
    pushIssue(issues, "error", "root", "根节点必须是 ActionData 数组。 异常", undefined, undefined);
    return issues;
  }

  if (document.length === 0) {
    pushIssue(issues, "warning", "root", "当前 ActionData 为空。", undefined, undefined);
  }

  const actionIds = new Map<string, number>();

  document.forEach((action, actionIndex) => {
    if (isEmpty(action.id)) {
      pushIssue(issues, "error", `[${actionIndex}].id`, "Action 缺少 id。", action.__editorId);
      return;
    }

    const id = action.id?.trim() ?? "";
    if (actionIds.has(id)) {
      pushIssue(issues, "error", `[${actionIndex}].id`, `Action id 重复：${id}`, action.__editorId);
    } else {
      actionIds.set(id, actionIndex);
    }
  });

  document.forEach((action, actionIndex) => {
    const actionId = action.__editorId;
    const id = action.id?.trim() ?? "";

    if (isEmpty(action.animStateName)) {
      pushIssue(issues, "warning", `[${actionIndex}].animStateName`, "animStateName 为空。", actionId);
    }

    if (isEmpty(action.command)) {
      pushIssue(issues, "warning", `[${actionIndex}].command`, "command 为空。", actionId);
    }

    if (action.nextActionId && !actionIds.has(action.nextActionId)) {
      pushIssue(issues, "error", `[${actionIndex}].nextActionId`, `nextActionId 指向不存在的动作：${action.nextActionId}`, actionId);
    }

    if (!Array.isArray(action.TimelineDatas)) {
      pushIssue(issues, "error", `[${actionIndex}].TimelineDatas`, "TimelineDatas 必须是数组。", actionId);
    } else if (action.TimelineDatas.length === 0) {
      pushIssue(issues, "warning", `[${actionIndex}].TimelineDatas`, "TimelineDatas 为空。", actionId);
    } else {
      action.TimelineDatas.forEach((timeline, timelineIndex) => validateTimeline(timeline, issues, actionId, actionIndex, timelineIndex));
    }

    action.derivations?.forEach((derivation, derivationIndex) => {
      const path = `[${actionIndex}].derivations[${derivationIndex}]`;
      const nextActionId = derivation.nextActionId?.trim();

      if (nextActionId && !actionIds.has(nextActionId)) {
        pushIssue(issues, "error", `${path}.nextActionId`, `派生动作不存在：${nextActionId}`, actionId);
      }

      if (nextActionId && nextActionId === id) {
        pushIssue(issues, "warning", `${path}.nextActionId`, "派生动作指向自身。", actionId);
      }

      const min = toNumber(derivation.checkPeriod?.min);
      const max = toNumber(derivation.checkPeriod?.max);
      if (min !== null && max !== null && min > max) {
        pushIssue(issues, "error", `${path}.checkPeriod`, "checkPeriod.min 必须小于等于 max。", actionId);
      }
    });
  });

  return issues;
};
