import type { ActionData, ActionDataDocument, ActionDerivation, TimelineData } from "@/models/actionData";
import { createEditorId } from "@/models/defaults";
import { actionDataDocumentSchema } from "@/validation/actionDataSchemas";

export type ParseResult =
  | { ok: true; document: ActionDataDocument }
  | { ok: false; error: string };

const withTimelineIds = (timeline: unknown): TimelineData => {
  if (!timeline || typeof timeline !== "object") {
    return { __editorId: createEditorId(), $type: "" };
  }

  return {
    ...(timeline as Record<string, unknown>),
    __editorId: createEditorId(),
  } as TimelineData;
};

const withDerivationIds = (derivation: unknown): ActionDerivation => {
  if (!derivation || typeof derivation !== "object") {
    return { __editorId: createEditorId() };
  }

  return {
    ...(derivation as Record<string, unknown>),
    __editorId: createEditorId(),
  } as ActionDerivation;
};

const withActionIds = (action: unknown): ActionData => {
  const rawAction = action && typeof action === "object" ? (action as Record<string, unknown>) : {};
  const timelines = Array.isArray(rawAction.TimelineDatas) ? rawAction.TimelineDatas.map(withTimelineIds) : rawAction.TimelineDatas;
  const derivations = Array.isArray(rawAction.derivations) ? rawAction.derivations.map(withDerivationIds) : rawAction.derivations;

  return {
    ...rawAction,
    __editorId: createEditorId(),
    TimelineDatas: timelines as TimelineData[] | undefined,
    derivations: derivations as ActionDerivation[] | undefined,
  } as ActionData;
};

const stripEditorIds = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(stripEditorIds);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([key]) => key !== "__editorId")
        .map(([key, nested]) => [key, stripEditorIds(nested)]),
    );
  }

  return value;
};

export const parseActionDataJson = (text: string): ParseResult => {
  try {
    const parsed = JSON.parse(text);
    const result = actionDataDocumentSchema.safeParse(parsed);

    if (!result.success) {
      return {
        ok: false,
        error: result.error.issues.map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`).join("\n"),
      };
    }

    return {
      ok: true,
      document: result.data.map(withActionIds),
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "无法解析 JSON",
    };
  }
};

export const serializeActionDataJson = (document: ActionDataDocument): string =>
  `${JSON.stringify(stripEditorIds(document), null, 2)}\n`;

export const cloneForEditor = <T>(value: T): T => JSON.parse(JSON.stringify(stripEditorIds(value)));
