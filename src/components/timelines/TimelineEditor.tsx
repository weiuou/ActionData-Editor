import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Copy, Plus, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useEditorStore } from "@/store/editorStore";
import { TimelineItemEditor } from "./TimelineItemEditor";
import type { ActionData } from "@/models/actionData";
import { TIMELINE_TYPE_OPTIONS, timelineTypeLabel } from "@/models/timelineTypes";
import { cn } from "@/lib/utils";
import { getTimelineSchemaForType, getTimelineTypeOptions, humanizeIdentifier } from "@/schema/csharpTimelineSchema";

interface TimelineEditorProps {
  action: ActionData;
  actionIndex: number;
  selectedTimelineId: string | null;
  highlightedValidationPath: string | null;
  onSelectTimeline: (id: string) => void;
  onAddTimeline: (type: string) => void;
  onUpdateTimeline: (timelineId: string, patch: object) => void;
  onDuplicateTimeline: (timelineId: string) => void;
  onDeleteTimeline: (timelineId: string) => void;
  onMoveTimeline: (timelineId: string, direction: "up" | "down") => void;
}

const timelineColors = ["#003D8F", "#40AEF0", "#512BD4", "#EC1C24", "#83B81A"];

export const TimelineEditor = ({
  action,
  actionIndex,
  selectedTimelineId,
  highlightedValidationPath,
  onSelectTimeline,
  onAddTimeline,
  onUpdateTimeline,
  onDuplicateTimeline,
  onDeleteTimeline,
  onMoveTimeline,
}: TimelineEditorProps) => {
  const schemaDirectoryPath = useEditorStore((state) => state.schemaDirectoryPath);
  const loadTimelineSchemas = useEditorStore((state) => state.loadTimelineSchemas);
  const timelineSchemaRegistry = useEditorStore((state) => state.timelineSchemaRegistry);
  const [refreshToast, setRefreshToast] = useState<string | null>(null);
  const timelines = action.TimelineDatas ?? [];
  const hasTimelines = timelines.length > 0;
  const timelineTypeOptions = getTimelineTypeOptions(timelineSchemaRegistry, TIMELINE_TYPE_OPTIONS);
  const selectedTimeline = timelines.find((timeline) => timeline.__editorId === selectedTimelineId) ?? timelines[0];
  const selectedTimelineIndex = selectedTimeline ? timelines.findIndex((timeline) => timeline.__editorId === selectedTimeline.__editorId) : -1;
  const isHighlighted = (path: string) => highlightedValidationPath === path || Boolean(highlightedValidationPath?.startsWith(`${path}.`));

  useEffect(() => {
    if (!refreshToast) {
      return;
    }

    const timeoutId = window.setTimeout(() => setRefreshToast(null), 2400);
    return () => window.clearTimeout(timeoutId);
  }, [refreshToast]);

  const refreshTimelines = async () => {
    if (!schemaDirectoryPath) {
      return;
    }

    const count = await loadTimelineSchemas(schemaDirectoryPath);
    setRefreshToast(`已加载 ${count} 个 Timeline 类型`);
  };

  return (
    <section className="grid gap-4">
      <div className="flex items-end justify-between gap-3 border-b border-white/25 pb-3">
        <div>
          <h2 className="font-mono text-2xl font-black leading-none text-white drop-shadow">TimelineDatas</h2>
          <p className="mt-2 text-sm text-white/80 drop-shadow">按 `$type` 编辑动作期间的移动、碰撞与特效事件。</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!schemaDirectoryPath}
            onClick={() => void refreshTimelines()}
          >
            <RefreshCw className="h-4 w-4" />
            刷新 Timeline
          </Button>
          <Select className="w-56" defaultValue="" onChange={(event) => event.target.value && onAddTimeline(event.target.value)}>
            <option value="" disabled>
              新增 Timeline
            </option>
            {timelineTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {refreshToast ? (
        <div className="pointer-events-none fixed right-8 top-24 z-40 rounded-md border border-black bg-white px-4 py-2 text-sm font-medium text-black shadow-lg">
          {refreshToast}
        </div>
      ) : null}

      <div className={cn("grid gap-4", hasTimelines && "lg:grid-cols-[280px_1fr]")}>
        <div className="grid content-start gap-2">
          {timelines.map((timeline, index) => {
            const timelinePath = `[${actionIndex}].TimelineDatas[${index}]`;
            const timelineSchema = getTimelineSchemaForType(timelineSchemaRegistry, timeline.$type);
            const fallbackLabel = timelineTypeLabel(timeline.$type);
            const timelineLabel = fallbackLabel !== timeline.$type
              ? fallbackLabel
              : timelineSchema
                ? humanizeIdentifier(timelineSchema.name.replace(/Data$/, ""))
                : timeline.$type;

            return (
              <button
                key={timeline.__editorId}
                data-validation-path={timelinePath}
                className={cn(
                  "relative overflow-hidden rounded-md border border-border bg-white p-3 pb-5 text-left transition hover:-translate-y-0.5 hover:border-black hover:shadow-md",
                  selectedTimeline?.__editorId === timeline.__editorId && "border-black shadow-md",
                  isHighlighted(timelinePath) && "border-destructive bg-destructive/10 ring-2 ring-destructive",
                )}
                onClick={() => onSelectTimeline(timeline.__editorId)}
              >
                <div className="absolute inset-x-0 bottom-0 h-2" style={{ backgroundColor: timelineColors[index % timelineColors.length] }} />
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-muted-foreground">#{index + 1}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {timeline.timingBegin ?? "?"} to {timeline.timingEnd ?? "?"}
                  </span>
                </div>
                <div className="mt-2 text-sm font-black text-black">{timelineLabel}</div>
                <div className="mt-3 flex gap-1 opacity-75">
                  <Button size="icon" variant="ghost" type="button" onClick={(event) => { event.stopPropagation(); onMoveTimeline(timeline.__editorId, "up"); }}>
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" type="button" onClick={(event) => { event.stopPropagation(); onMoveTimeline(timeline.__editorId, "down"); }}>
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" type="button" onClick={(event) => { event.stopPropagation(); onDuplicateTimeline(timeline.__editorId); }}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" type="button" onClick={(event) => { event.stopPropagation(); onDeleteTimeline(timeline.__editorId); }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </button>
            );
          })}
          {!hasTimelines ? (
            <div className="rounded-md border border-dashed border-border bg-white p-6 text-center text-sm text-muted-foreground">
              还没有 TimelineData。
              <div className="mt-3 flex justify-center">
                <Button type="button" size="sm" onClick={() => timelineTypeOptions[0] && onAddTimeline(timelineTypeOptions[0].value)}>
                  <Plus className="h-4 w-4" />
                  添加第一个事件
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        {hasTimelines ? (
          <div>
            {selectedTimeline ? (
              <TimelineItemEditor
                timeline={selectedTimeline}
                actionIndex={actionIndex}
                timelineIndex={selectedTimelineIndex}
                highlightedValidationPath={highlightedValidationPath}
                onChange={(patch) => onUpdateTimeline(selectedTimeline.__editorId, patch)}
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
};
