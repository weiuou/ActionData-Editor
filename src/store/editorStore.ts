import { create } from "zustand";
import type { ActionData, ActionDataDocument, ActionDerivation, TimelineData, TimelinePatch } from "@/models/actionData";
import { createDefaultAction, createDefaultTimeline, createEditorId } from "@/models/defaults";
import { type KnownTimelineType } from "@/models/timelineTypes";
import { cloneForEditor, parseActionDataJson, serializeActionDataJson } from "@/io/jsonCodec";
import { openJsonFile, saveJsonFile, saveJsonFileAs } from "@/io/tauriFileIo";
import { reorder } from "@/lib/utils";
import { validateActionData } from "@/validation/validateActionData";
import type { ValidationIssue } from "@/validation/validationTypes";

interface EditorState {
  filePath: string | null;
  document: ActionDataDocument | null;
  selectedActionId: string | null;
  selectedTimelineId: string | null;
  validationIssues: ValidationIssue[];
  dirty: boolean;
  lastError: string | null;

  openFile: () => Promise<void>;
  saveFile: () => Promise<void>;
  saveFileAs: () => Promise<void>;
  loadFromText: (text: string, path?: string | null) => void;
  validate: () => void;
  clearError: () => void;

  selectAction: (actionId: string | null) => void;
  selectTimeline: (timelineId: string | null) => void;
  updateAction: (actionId: string, patch: Partial<ActionData>) => void;
  addAction: () => void;
  duplicateAction: (actionId: string) => void;
  deleteAction: (actionId: string) => void;
  moveAction: (actionId: string, direction: "up" | "down") => void;

  updateTimeline: (actionId: string, timelineId: string, patch: TimelinePatch) => void;
  addTimeline: (actionId: string, type: KnownTimelineType) => void;
  duplicateTimeline: (actionId: string, timelineId: string) => void;
  deleteTimeline: (actionId: string, timelineId: string) => void;
  moveTimeline: (actionId: string, timelineId: string, direction: "up" | "down") => void;

  updateDerivations: (actionId: string, derivations: ActionDerivation[]) => void;
}

const prepareDuplicatedTimeline = (timeline: TimelineData): TimelineData => ({
  ...cloneForEditor(timeline),
  __editorId: createEditorId(),
});

const prepareDuplicatedDerivation = (derivation: ActionDerivation): ActionDerivation => ({
  ...cloneForEditor(derivation),
  __editorId: createEditorId(),
});

const withValidation = (document: ActionDataDocument | null) => validateActionData(document);

const confirmDirty = (dirty: boolean) => !dirty || window.confirm("当前文件有未保存修改，是否继续？");

export const useEditorStore = create<EditorState>((set, get) => ({
  filePath: null,
  document: null,
  selectedActionId: null,
  selectedTimelineId: null,
  validationIssues: [],
  dirty: false,
  lastError: null,

  openFile: async () => {
    if (!confirmDirty(get().dirty)) {
      return;
    }

    try {
      const result = await openJsonFile();
      if (!result) {
        return;
      }
      get().loadFromText(result.contents, result.path);
    } catch (error) {
      set({ lastError: error instanceof Error ? error.message : "打开文件失败" });
    }
  },

  saveFile: async () => {
    const { document, filePath } = get();
    if (!document) {
      return;
    }

    try {
      const contents = serializeActionDataJson(document);
      if (!filePath) {
        const savedPath = await saveJsonFileAs(contents);
        if (savedPath) {
          set({ filePath: savedPath, dirty: false });
        }
        return;
      }

      await saveJsonFile(filePath, contents);
      set({ dirty: false });
    } catch (error) {
      set({ lastError: error instanceof Error ? error.message : "保存文件失败" });
    }
  },

  saveFileAs: async () => {
    const { document } = get();
    if (!document) {
      return;
    }

    try {
      const savedPath = await saveJsonFileAs(serializeActionDataJson(document));
      if (savedPath) {
        set({ filePath: savedPath, dirty: false });
      }
    } catch (error) {
      set({ lastError: error instanceof Error ? error.message : "另存为失败" });
    }
  },

  loadFromText: (text, path = null) => {
    const result = parseActionDataJson(text);
    if (!result.ok) {
      set({ lastError: result.error });
      return;
    }

    set({
      filePath: path,
      document: result.document,
      selectedActionId: result.document[0]?.__editorId ?? null,
      selectedTimelineId: null,
      validationIssues: withValidation(result.document),
      dirty: false,
      lastError: null,
    });
  },

  validate: () => set((state) => ({ validationIssues: withValidation(state.document) })),
  clearError: () => set({ lastError: null }),

  selectAction: (actionId) => set({ selectedActionId: actionId, selectedTimelineId: null }),
  selectTimeline: (timelineId) => set({ selectedTimelineId: timelineId }),

  updateAction: (actionId, patch) =>
    set((state) => {
      const document = state.document?.map((action) =>
        action.__editorId === actionId ? { ...action, ...patch } : action,
      ) ?? null;
      return { document, dirty: true, validationIssues: withValidation(document) };
    }),

  addAction: () =>
    set((state) => {
      const document = [...(state.document ?? []), createDefaultAction(state.document?.length ?? 0)];
      const selectedActionId = document[document.length - 1]?.__editorId ?? null;
      return { document, selectedActionId, selectedTimelineId: null, dirty: true, validationIssues: withValidation(document) };
    }),

  duplicateAction: (actionId) =>
    set((state) => {
      const source = state.document?.find((action) => action.__editorId === actionId);
      if (!source || !state.document) {
        return state;
      }

      const duplicate: ActionData = {
        ...cloneForEditor(source),
        __editorId: createEditorId(),
        id: `${source.id ?? "Action"}_copy`,
        name: `${source.name ?? "动作"} Copy`,
        TimelineDatas: source.TimelineDatas?.map(prepareDuplicatedTimeline) ?? [],
        derivations: source.derivations?.map(prepareDuplicatedDerivation) ?? [],
      };
      const index = state.document.findIndex((action) => action.__editorId === actionId);
      const document = [...state.document];
      document.splice(index + 1, 0, duplicate);
      return {
        document,
        selectedActionId: duplicate.__editorId,
        selectedTimelineId: null,
        dirty: true,
        validationIssues: withValidation(document),
      };
    }),

  deleteAction: (actionId) =>
    set((state) => {
      const document = state.document?.filter((action) => action.__editorId !== actionId) ?? null;
      const selectedActionId = state.selectedActionId === actionId ? document?.[0]?.__editorId ?? null : state.selectedActionId;
      return { document, selectedActionId, selectedTimelineId: null, dirty: true, validationIssues: withValidation(document) };
    }),

  moveAction: (actionId, direction) =>
    set((state) => {
      if (!state.document) {
        return state;
      }
      const index = state.document.findIndex((action) => action.__editorId === actionId);
      const document = reorder(state.document, index, direction);
      return { document, dirty: true, validationIssues: withValidation(document) };
    }),

  updateTimeline: (actionId, timelineId, patch) =>
    set((state) => {
      const document = state.document?.map((action) => {
        if (action.__editorId !== actionId) {
          return action;
        }
        return {
          ...action,
          TimelineDatas: action.TimelineDatas?.map((timeline) =>
            timeline.__editorId === timelineId ? ({ ...timeline, ...patch } as TimelineData) : timeline,
          ) ?? [],
        };
      }) ?? null;
      return { document, dirty: true, validationIssues: withValidation(document) };
    }),

  addTimeline: (actionId, type) =>
    set((state) => {
      const timeline = createDefaultTimeline(type);
      const document = state.document?.map((action) =>
        action.__editorId === actionId
          ? { ...action, TimelineDatas: [...(action.TimelineDatas ?? []), timeline] }
          : action,
      ) ?? null;
      return { document, selectedTimelineId: timeline.__editorId, dirty: true, validationIssues: withValidation(document) };
    }),

  duplicateTimeline: (actionId, timelineId) =>
    set((state) => {
      let selectedTimelineId = state.selectedTimelineId;
      const document = state.document?.map((action) => {
        if (action.__editorId !== actionId) {
          return action;
        }
        const timelines = action.TimelineDatas ?? [];
        const index = timelines.findIndex((timeline) => timeline.__editorId === timelineId);
        if (index < 0) {
          return action;
        }
        const duplicate = prepareDuplicatedTimeline(timelines[index]);
        selectedTimelineId = duplicate.__editorId;
        const next = [...timelines];
        next.splice(index + 1, 0, duplicate);
        return { ...action, TimelineDatas: next };
      }) ?? null;
      return { document, selectedTimelineId, dirty: true, validationIssues: withValidation(document) };
    }),

  deleteTimeline: (actionId, timelineId) =>
    set((state) => {
      const document = state.document?.map((action) =>
        action.__editorId === actionId
          ? { ...action, TimelineDatas: action.TimelineDatas?.filter((timeline) => timeline.__editorId !== timelineId) ?? [] }
          : action,
      ) ?? null;
      return {
        document,
        selectedTimelineId: state.selectedTimelineId === timelineId ? null : state.selectedTimelineId,
        dirty: true,
        validationIssues: withValidation(document),
      };
    }),

  moveTimeline: (actionId, timelineId, direction) =>
    set((state) => {
      const document = state.document?.map((action) => {
        if (action.__editorId !== actionId) {
          return action;
        }
        const timelines = action.TimelineDatas ?? [];
        const index = timelines.findIndex((timeline) => timeline.__editorId === timelineId);
        return { ...action, TimelineDatas: reorder(timelines, index, direction) };
      }) ?? null;
      return { document, dirty: true, validationIssues: withValidation(document) };
    }),

  updateDerivations: (actionId, derivations) =>
    set((state) => {
      const document = state.document?.map((action) =>
        action.__editorId === actionId ? { ...action, derivations } : action,
      ) ?? null;
      return { document, dirty: true, validationIssues: withValidation(document) };
    }),
}));
