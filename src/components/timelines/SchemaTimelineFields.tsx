import { useEffect, useState } from "react";
import { BooleanField } from "@/components/fields/BooleanField";
import { JsonTextArea } from "@/components/fields/JsonTextArea";
import { NumberField } from "@/components/fields/NumberField";
import { SelectField } from "@/components/fields/SelectField";
import { StringArrayField } from "@/components/fields/StringArrayField";
import { TextField } from "@/components/fields/TextField";
import type { TimelineData } from "@/models/actionData";
import { cn } from "@/lib/utils";
import {
  humanizeIdentifier,
  type CSharpFieldSchema,
  type CSharpTypeSchema,
  type TimelineSchemaRegistry,
} from "@/schema/csharpTimelineSchema";

interface SchemaTimelineFieldsProps {
  schema: CSharpTypeSchema;
  timeline: TimelineData;
  basePath: string;
  highlightedValidationPath: string | null;
  registry: TimelineSchemaRegistry;
  onChange: (patch: Partial<TimelineData>) => void;
}

interface UnknownJsonFieldProps {
  label: string;
  value: unknown;
  validationPath: string;
  highlighted: boolean;
  onChange: (value: unknown) => void;
}

const cloneValue = <T,>(value: T): T => {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
};

const setNestedValue = (target: Record<string, unknown>, path: string[], value: unknown) => {
  let cursor = target;
  for (let index = 0; index < path.length - 1; index += 1) {
    const segment = path[index];
    const next = cursor[segment];
    cursor[segment] = next && typeof next === "object" && !Array.isArray(next) ? cloneValue(next) : {};
    cursor = cursor[segment] as Record<string, unknown>;
  }
  cursor[path[path.length - 1]] = value;
};

const isPathHighlighted = (highlightedValidationPath: string | null, path: string) =>
  highlightedValidationPath === path || Boolean(highlightedValidationPath?.startsWith(`${path}.`));

const UnknownJsonField = ({ label, value, validationPath, highlighted, onChange }: UnknownJsonFieldProps) => {
  const [rawJson, setRawJson] = useState(() => JSON.stringify(value ?? null, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);

  useEffect(() => {
    setRawJson(JSON.stringify(value ?? null, null, 2));
    setJsonError(null);
  }, [value]);

  return (
    <JsonTextArea
      label={`${label} JSON`}
      value={rawJson}
      validationPath={validationPath}
      highlighted={highlighted}
      onChange={(nextValue) => {
        setRawJson(nextValue);
        try {
          const parsed = JSON.parse(nextValue);
          setJsonError(null);
          onChange(parsed);
        } catch (error) {
          setJsonError(error instanceof Error ? error.message : "JSON 解析失败。");
        }
      }}
      error={jsonError}
    />
  );
};

const DynamicFieldGroup = ({
  fields,
  value,
  basePath,
  highlightedValidationPath,
  registry,
  onChange,
}: {
  fields: CSharpFieldSchema[];
  value: Record<string, unknown>;
  basePath: string;
  highlightedValidationPath: string | null;
  registry: TimelineSchemaRegistry;
  onChange: (path: string[], value: unknown) => void;
}) => {
  const structuredFields = fields.filter((field) => field.kind === "object");
  const flatFields = fields.filter((field) => field.kind !== "object");

  return (
    <div className="grid gap-3">
      {flatFields.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
          {flatFields.map((field) => {
            const fieldPath = `${basePath}.${field.name}`;
            const fieldValue = value[field.name];
            const highlighted = isPathHighlighted(highlightedValidationPath, fieldPath);
            const label = humanizeIdentifier(field.name);

            switch (field.kind) {
              case "boolean":
                return (
                  <BooleanField
                    key={fieldPath}
                    label={label}
                    checked={fieldValue as boolean | undefined}
                    validationPath={fieldPath}
                    highlighted={highlighted}
                    onChange={(nextValue) => onChange([field.name], nextValue)}
                  />
                );
              case "number":
                return (
                  <NumberField
                    key={fieldPath}
                    label={label}
                    value={fieldValue as number | string | undefined}
                    validationPath={fieldPath}
                    highlighted={highlighted}
                    onChange={(nextValue) => onChange([field.name], nextValue)}
                  />
                );
              case "string":
                return (
                  <TextField
                    key={fieldPath}
                    label={label}
                    value={fieldValue as string | number | undefined}
                    validationPath={fieldPath}
                    highlighted={highlighted}
                    onChange={(nextValue) => onChange([field.name], nextValue)}
                  />
                );
              case "stringArray":
                return (
                  <StringArrayField
                    key={fieldPath}
                    label={label}
                    value={Array.isArray(fieldValue) ? fieldValue.filter((item): item is string => typeof item === "string") : []}
                    validationPath={fieldPath}
                    highlighted={highlighted}
                    onChange={(nextValue) => onChange([field.name], nextValue)}
                  />
                );
              case "enum":
                return (
                  <SelectField
                    key={fieldPath}
                    label={label}
                    value={typeof fieldValue === "number" ? String(fieldValue) : fieldValue === undefined ? "0" : String(fieldValue)}
                    validationPath={fieldPath}
                    highlighted={highlighted}
                    options={(registry.enums[field.typeName] ?? []).map((option, index) => ({ value: String(index), label: option }))}
                    onChange={(nextValue) => onChange([field.name], Number(nextValue))}
                  />
                );
              default:
                return (
                  <div key={fieldPath} className="col-span-full">
                    <UnknownJsonField
                      label={label}
                      value={fieldValue}
                      validationPath={fieldPath}
                      highlighted={highlighted}
                      onChange={(nextValue) => onChange([field.name], nextValue)}
                    />
                  </div>
                );
            }
          })}
        </div>
      ) : null}

      {structuredFields.map((field) => {
        const fieldPath = `${basePath}.${field.name}`;
        const nestedValue = value[field.name];
        const nestedSchema = registry.types[field.typeName];

        if (!nestedSchema) {
          return (
            <UnknownJsonField
              key={fieldPath}
              label={humanizeIdentifier(field.name)}
              value={nestedValue}
              validationPath={fieldPath}
              highlighted={isPathHighlighted(highlightedValidationPath, fieldPath)}
              onChange={(nextValue) => onChange([field.name], nextValue)}
            />
          );
        }

        return (
          <div
            key={fieldPath}
            data-validation-path={fieldPath}
            className={cn(
              "grid gap-3 rounded-md border border-border bg-white p-3",
              isPathHighlighted(highlightedValidationPath, fieldPath) && "border-destructive bg-destructive/10 ring-2 ring-destructive",
            )}
          >
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              {humanizeIdentifier(field.name)}
            </div>
            <DynamicFieldGroup
              fields={nestedSchema.fields}
              value={(nestedValue as Record<string, unknown> | undefined) ?? {}}
              basePath={fieldPath}
              highlightedValidationPath={highlightedValidationPath}
              registry={registry}
              onChange={(nestedPath, nextValue) => onChange([field.name, ...nestedPath], nextValue)}
            />
          </div>
        );
      })}
    </div>
  );
};

export const SchemaTimelineFields = ({
  schema,
  timeline,
  basePath,
  highlightedValidationPath,
  registry,
  onChange,
}: SchemaTimelineFieldsProps) => (
  <DynamicFieldGroup
    fields={schema.fields}
    value={timeline as Record<string, unknown>}
    basePath={basePath}
    highlightedValidationPath={highlightedValidationPath}
    registry={registry}
    onChange={(path, nextValue) => {
      if (path.length === 1) {
        onChange({ [path[0]]: nextValue } as Partial<TimelineData>);
        return;
      }

      const topLevelKey = path[0];
      const nextTopLevelValue = cloneValue(
        ((timeline as Record<string, unknown>)[topLevelKey] as Record<string, unknown> | undefined) ?? {},
      );
      setNestedValue(nextTopLevelValue, path.slice(1), nextValue);
      onChange({ [topLevelKey]: nextTopLevelValue } as Partial<TimelineData>);
    }}
  />
);
