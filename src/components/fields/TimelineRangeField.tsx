import { Input } from "@/components/ui/input";
import type { NumericValue } from "@/models/actionData";
import { cn } from "@/lib/utils";

interface TimelineRangeFieldProps {
  begin: NumericValue | undefined;
  end: NumericValue | undefined;
  beginHighlighted?: boolean;
  endHighlighted?: boolean;
  beginValidationPath?: string;
  endValidationPath?: string;
  highlighted?: boolean;
  validationPath?: string;
  onChange: (value: { timingBegin: number; timingEnd: number }) => void;
}

const STEP = 0.01;

const toNumber = (value: NumericValue | undefined, fallback: number) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const normalize = (value: number) => Number(value.toFixed(2));

export const TimelineRangeField = ({
  begin,
  end,
  beginHighlighted = false,
  endHighlighted = false,
  beginValidationPath,
  endValidationPath,
  highlighted = false,
  validationPath,
  onChange,
}: TimelineRangeFieldProps) => {
  const beginValue = toNumber(begin, 0);
  const endValue = toNumber(end, 1);
  const lowerBound = Math.min(beginValue, endValue);
  const upperBound = Math.max(beginValue, endValue);
  const sliderMin = Math.min(0, Math.floor(lowerBound * 10) / 10);
  const sliderMax = Math.max(1, Math.ceil(upperBound * 10) / 10, sliderMin + STEP);
  const range = sliderMax - sliderMin || 1;
  const beginPercent = ((beginValue - sliderMin) / range) * 100;
  const endPercent = ((endValue - sliderMin) / range) * 100;

  const updateBegin = (nextBegin: number) => {
    const safeBegin = normalize(clamp(nextBegin, sliderMin, endValue - STEP));
    onChange({ timingBegin: safeBegin, timingEnd: normalize(endValue) });
  };

  const updateEnd = (nextEnd: number) => {
    const safeEnd = normalize(clamp(nextEnd, beginValue + STEP, sliderMax));
    onChange({ timingBegin: normalize(beginValue), timingEnd: safeEnd });
  };

  return (
    <div
      data-validation-path={validationPath}
      className={cn(
        "grid gap-3 rounded-md border border-border bg-white p-4 transition",
        highlighted && "border-destructive bg-destructive/10 ring-2 ring-destructive",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Timing Range</div>
          <div className="mt-1 text-sm text-foreground">拖动滑块修改开始和结束时间</div>
        </div>
        <div className="flex gap-2 font-mono text-xs text-muted-foreground">
          <span>Start {beginValue.toFixed(2)}</span>
          <span>End {endValue.toFixed(2)}</span>
        </div>
      </div>

      <div className="relative h-10">
        <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-muted" />
        <div
          className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-[#40AEF0]"
          style={{ left: `${beginPercent}%`, width: `${Math.max(endPercent - beginPercent, 0)}%` }}
        />
        <input
          className="timeline-slider pointer-events-none absolute inset-0 z-20 h-full w-full appearance-none bg-transparent"
          type="range"
          min={sliderMin}
          max={sliderMax}
          step={STEP}
          value={beginValue}
          onChange={(event) => updateBegin(Number(event.target.value))}
        />
        <input
          className="timeline-slider pointer-events-none absolute inset-0 z-30 h-full w-full appearance-none bg-transparent"
          type="range"
          min={sliderMin}
          max={sliderMax}
          step={STEP}
          value={endValue}
          onChange={(event) => updateEnd(Number(event.target.value))}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label
          data-validation-path={beginValidationPath}
          className={cn("grid gap-1.5 rounded-md transition", beginHighlighted && "bg-destructive/10 p-2 ring-2 ring-destructive")}
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Timing Begin</span>
          <Input
            type="number"
            step="any"
            value={begin ?? ""}
            onChange={(event) => {
              const next = event.target.value;
              if (next === "") {
                return;
              }
              updateBegin(Number(next));
            }}
          />
        </label>
        <label
          data-validation-path={endValidationPath}
          className={cn("grid gap-1.5 rounded-md transition", endHighlighted && "bg-destructive/10 p-2 ring-2 ring-destructive")}
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Timing End</span>
          <Input
            type="number"
            step="any"
            value={end ?? ""}
            onChange={(event) => {
              const next = event.target.value;
              if (next === "") {
                return;
              }
              updateEnd(Number(next));
            }}
          />
        </label>
      </div>
    </div>
  );
};
