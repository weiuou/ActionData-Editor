import { Copy, Plus, Trash2, ArrowDown, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { TimelineItemEditor } from "./TimelineItemEditor";
import type { ActionData } from "@/models/actionData";
import { TIMELINE_TYPE_OPTIONS, type KnownTimelineType, timelineTypeLabel } from "@/models/timelineTypes";
import { cn } from "@/lib/utils";

interface TimelineEditorProps {
  action: ActionData;
  actionIndex: number;
  selectedTimelineId: string | null;
  highlightedValidationPath: string | null;
  onSelectTimeline: (id: string) => void;
  onAddTimeline: (type: KnownTimelineType) => void;
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
  const timelines = action.TimelineDatas ?? [];
  const selectedTimeline = timelines.find((timeline) => timeline.__editorId === selectedTimelineId) ?? timelines[0];
  const selectedTimelineIndex = selectedTimeline ? timelines.findIndex((timeline) => timeline.__editorId === selectedTimeline.__editorId) : -1;
  const isHighlighted = (path: string) => highlightedValidationPath === path || Boolean(highlightedValidationPath?.startsWith(`${path}.`));

  return (
    <section className="grid gap-4">
      <div className="flex items-end justify-between gap-3 border-b border-border pb-3">
        <div>
          <h2 className="font-mono text-2xl font-black leading-none text-black">TimelineDatas</h2>
          <p className="mt-2 text-sm text-muted-foreground">按 `$type` 编辑动作期间的移动、碰撞与特效事件。</p>
        </div>
        <Select className="w-56" defaultValue="" onChange={(event) => event.target.value && onAddTimeline(event.target.value as KnownTimelineType)}>
          <option value="" disabled>
            新增 Timeline
          </option>
          {TIMELINE_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="grid content-start gap-2">
          {timelines.map((timeline, index) => {
            const timelinePath = `[${actionIndex}].TimelineDatas[${index}]`;

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
                <span className="font-mono text-xs text-muted-foreground">{timeline.timingBegin ?? "?"} → {timeline.timingEnd ?? "?"}</span>
              </div>
              <div className="mt-2 text-sm font-black text-black">{timelineTypeLabel(timeline.$type)}</div>
              <div className="mt-3 flex gap-1 opacity-75">
                <Button size="icon" variant="ghost" type="button" onClick={(event) => { event.stopPropagation(); onMoveTimeline(timeline.__editorId, "up"); }}><ArrowUp className="h-3.5 w-3.5" /></Button>
                <Button size="icon" variant="ghost" type="button" onClick={(event) => { event.stopPropagation(); onMoveTimeline(timeline.__editorId, "down"); }}><ArrowDown className="h-3.5 w-3.5" /></Button>
                <Button size="icon" variant="ghost" type="button" onClick={(event) => { event.stopPropagation(); onDuplicateTimeline(timeline.__editorId); }}><Copy className="h-3.5 w-3.5" /></Button>
                <Button size="icon" variant="ghost" type="button" onClick={(event) => { event.stopPropagation(); onDeleteTimeline(timeline.__editorId); }}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </button>
            );
          })}
          {timelines.length === 0 ? (
            <div className="rounded-md border border-dashed border-border bg-white p-6 text-center text-sm text-muted-foreground">
              还没有 TimelineData。
              <div className="mt-3 flex justify-center">
                <Button type="button" size="sm" onClick={() => onAddTimeline(TIMELINE_TYPE_OPTIONS[0].value)}>
                  <Plus className="h-4 w-4" /> 添加第一个事件
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        <div>{selectedTimeline ? <TimelineItemEditor timeline={selectedTimeline} actionIndex={actionIndex} timelineIndex={selectedTimelineIndex} highlightedValidationPath={highlightedValidationPath} onChange={(patch) => onUpdateTimeline(selectedTimeline.__editorId, patch)} /> : null}</div>
      </div>
    </section>
  );
};
