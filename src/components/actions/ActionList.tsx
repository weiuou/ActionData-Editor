import { useRef, useState, type PointerEvent } from "react";
import { Copy, GripVertical, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ActionData, ActionDataDocument } from "@/models/actionData";
import { cn } from "@/lib/utils";

interface ActionListProps {
  actions: ActionDataDocument;
  selectedActionId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
}

interface DragState {
  id: string;
  pointerId: number;
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
}

const accentColors = ["#ECD53F", "#512BD4", "#003D8F", "#40AEF0", "#EC1C24", "#006600", "#FF6600"];
const LONG_PRESS_MS = 260;

const ActionCardContent = ({ action, index, color }: { action: ActionData; index: number; color: string }) => (
  <>
    <div className="absolute inset-y-0 left-0 w-1.5" style={{ backgroundColor: color }} />
    <div className="ml-2 flex min-w-0 items-center gap-2 pr-16">
      <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="shrink-0 font-mono text-[11px] text-muted-foreground">#{index + 1}</span>
      <span className="truncate text-sm font-black text-black">{action.id || "Untitled"}</span>
      <span className="truncate text-sm text-muted-foreground">{action.name || action.animStateName || "未命名动作"}</span>
    </div>
    <div className="ml-8 mt-1 flex items-center gap-2 pr-16">
      <span className="rounded-sm border border-border bg-muted px-2 py-0.5 font-mono text-[10px] text-foreground">{action.command || "NO CMD"}</span>
      <span className="truncate font-mono text-[10px] text-muted-foreground">{action.animStateName || "no state"}</span>
    </div>
  </>
);

export const ActionList = ({ actions, selectedActionId, onSelect, onAdd, onDuplicate, onDelete, onMove }: ActionListProps) => {
  const pressTimerRef = useRef<number | null>(null);
  const didDragRef = useRef(false);
  const pendingActionIdRef = useRef<string | null>(null);
  const capturedElementRef = useRef<HTMLDivElement | null>(null);
  const colorByActionIdRef = useRef(new Map<string, string>());
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const getActionColor = (actionId: string) => {
    let color = colorByActionIdRef.current.get(actionId);
    if (!color) {
      color = accentColors[colorByActionIdRef.current.size % accentColors.length];
      colorByActionIdRef.current.set(actionId, color);
    }
    return color;
  };

  const clearPressTimer = () => {
    if (pressTimerRef.current !== null) {
      window.clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  const beginPress = (event: PointerEvent<HTMLDivElement>, actionId: string) => {
    if ((event.target as HTMLElement).closest("[data-action-control]")) {
      return;
    }

    clearPressTimer();
    didDragRef.current = false;
    pendingActionIdRef.current = actionId;

    const element = event.currentTarget;
    const pointerId = event.pointerId;
    const rect = element.getBoundingClientRect();
    const pointer = {
      pointerId,
      x: event.clientX,
      y: event.clientY,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      width: rect.width,
      height: rect.height,
    };

    pressTimerRef.current = window.setTimeout(() => {
      element.setPointerCapture(pointerId);
      capturedElementRef.current = element;
      document.body.classList.add("dragging-action-card");
      setDragState({ id: actionId, ...pointer });
      setHoverId(actionId);
      didDragRef.current = true;
    }, LONG_PRESS_MS);
  };

  const updateHover = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragState) {
      return;
    }

    event.preventDefault();
    setDragState((state) => state ? { ...state, x: event.clientX, y: event.clientY } : state);

    const element = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null;
    const actionCard = element?.closest<HTMLElement>("[data-action-id]");
    const nextHoverId = actionCard?.dataset.actionId ?? null;
    if (nextHoverId !== dragState.id) {
      setHoverId(nextHoverId);
    }
  };

  const finishPress = (event?: PointerEvent<HTMLDivElement>) => {
    clearPressTimer();

    const capturedElement = capturedElementRef.current;
    if (capturedElement && event && capturedElement.hasPointerCapture(event.pointerId)) {
      capturedElement.releasePointerCapture(event.pointerId);
    }

    if (dragState && hoverId && dragState.id !== hoverId) {
      const fromIndex = actions.findIndex((action) => action.__editorId === dragState.id);
      const toIndex = actions.findIndex((action) => action.__editorId === hoverId);
      const distance = Math.abs(toIndex - fromIndex);
      const direction = toIndex > fromIndex ? "down" : "up";

      for (let step = 0; step < distance; step += 1) {
        onMove(dragState.id, direction);
      }
    }

    document.body.classList.remove("dragging-action-card");
    capturedElementRef.current = null;
    setDragState(null);
    setHoverId(null);
    pendingActionIdRef.current = null;
  };

  const handleClick = (actionId: string) => {
    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }
    onSelect(actionId);
  };

  const draggedActionIndex = dragState ? actions.findIndex((action) => action.__editorId === dragState.id) : -1;
  const draggedAction = draggedActionIndex >= 0 ? actions[draggedActionIndex] : null;

  return (
    <aside className="flex min-h-0 flex-col rounded-lg border border-border bg-white simple-card-shadow">
      <div className="flex items-end justify-between border-b border-border p-4">
        <div>
          <div className="text-sm text-muted-foreground">动作列表</div>
          <div className="flex items-end gap-2">
            <div className="font-mono text-[30px] font-black leading-none text-black">{actions.length}</div>
            <div className="pb-1 text-xs text-muted-foreground">长按卡片拖动排序</div>
          </div>
        </div>
        <Button size="sm" onClick={onAdd}>
          <Plus className="h-4 w-4" /> 新建
        </Button>
      </div>
      <div className="min-h-0 flex-1 select-none space-y-1.5 overflow-auto p-2.5" onPointerMove={updateHover} onPointerUp={finishPress} onPointerCancel={finishPress}>
        {actions.map((action, index) => {
          const isDragging = dragState?.id === action.__editorId;
          const isHoverTarget = hoverId === action.__editorId && dragState && dragState.id !== action.__editorId;
          const color = getActionColor(action.__editorId);

          return (
            <div
              key={action.__editorId}
              data-action-id={action.__editorId}
              role="button"
              tabIndex={0}
              onClick={() => handleClick(action.__editorId)}
              onPointerDown={(event) => beginPress(event, action.__editorId)}
              className={cn(
                "group relative w-full cursor-grab touch-none overflow-hidden rounded-md border border-border bg-white p-2.5 text-left transition-[border,box-shadow,transform,opacity] duration-150 hover:border-black hover:shadow-sm active:cursor-grabbing",
                selectedActionId === action.__editorId && "border-black shadow-sm",
                isDragging && "opacity-25",
                isHoverTarget && "translate-y-1 border-black shadow-md",
              )}
            >
              <ActionCardContent action={action} index={index} color={color} />
              <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 opacity-70 transition group-hover:opacity-100" data-action-control>
                <Button size="icon" variant="ghost" type="button" onClick={(event) => { event.stopPropagation(); onDuplicate(action.__editorId); }}><Copy className="h-3.5 w-3.5" /></Button>
                <Button size="icon" variant="ghost" type="button" onClick={(event) => { event.stopPropagation(); onDelete(action.__editorId); }}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          );
        })}
      </div>

      {dragState && draggedAction ? (
        <div
          className="pointer-events-none fixed z-50 select-none overflow-hidden rounded-md border border-black bg-white p-2.5 text-left shadow-2xl transition-none"
          style={{
            left: dragState.x - dragState.offsetX,
            top: dragState.y - dragState.offsetY,
            width: dragState.width,
            minHeight: dragState.height,
            transform: "rotate(-0.35deg) scale(1.015)",
          }}
        >
          <ActionCardContent action={draggedAction} index={draggedActionIndex} color={getActionColor(draggedAction.__editorId)} />
        </div>
      ) : null}
    </aside>
  );
};
