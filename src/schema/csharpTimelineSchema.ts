export type CSharpFieldKind = "boolean" | "number" | "string" | "stringArray" | "enum" | "object" | "unknown";

export interface CSharpFieldSchema {
  name: string;
  typeName: string;
  kind: CSharpFieldKind;
  defaultValue?: boolean | number | string;
}

export interface CSharpTypeSchema {
  name: string;
  kind: "class" | "struct";
  baseType?: string;
  fields: CSharpFieldSchema[];
}

export interface TimelineSchemaRegistry {
  types: Record<string, CSharpTypeSchema>;
  enums: Record<string, string[]>;
  timelineClassNames: string[];
}

interface PendingType {
  type: CSharpTypeSchema | { name: string; kind: "enum"; values: string[]; baseType?: string };
  braceDepth: number;
  hasOpenedBody: boolean;
  pendingDefaultValue?: boolean | number | string;
}

const primitiveKinds: Record<string, CSharpFieldKind> = {
  bool: "boolean",
  byte: "number",
  short: "number",
  int: "number",
  long: "number",
  float: "number",
  double: "number",
  decimal: "number",
  string: "string",
};

const typeDeclarationPattern = /public\s+(class|struct|enum)\s+(\w+)(?:\s*:\s*([\w.<>]+))?/;
const fieldPattern = /public\s+([\w.]+(?:\[\])?)\s+(\w+)\s*;/;
const defaultValuePattern = /\[DefaultValue\((.+)\)\]/;

const countBraces = (line: string) => ({
  open: (line.match(/\{/g) ?? []).length,
  close: (line.match(/\}/g) ?? []).length,
});

const parseDefaultValue = (rawValue: string): boolean | number | string | undefined => {
  const value = rawValue.trim();
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  if (/^-?\d+(?:\.\d+)?[fFdDmM]?$/.test(value)) {
    return Number(value.replace(/[fFdDmM]$/, ""));
  }
  return undefined;
};

const resolveFieldKind = (typeName: string, enumMap: Record<string, string[]>, typeMap: Record<string, CSharpTypeSchema>): CSharpFieldKind => {
  if (primitiveKinds[typeName]) {
    return primitiveKinds[typeName];
  }
  if (typeName === "string[]") {
    return "stringArray";
  }
  if (enumMap[typeName]) {
    return "enum";
  }
  if (typeMap[typeName]) {
    return "object";
  }
  return "unknown";
};

const normalizeField = (
  field: CSharpFieldSchema,
  enumMap: Record<string, string[]>,
  typeMap: Record<string, CSharpTypeSchema>,
): CSharpFieldSchema => ({
  ...field,
  kind: resolveFieldKind(field.typeName, enumMap, typeMap),
});

const parseEnumValuesFromLine = (line: string) =>
  line
    .replace(/\/\/.*$/, "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

export const timelineTypeToClassName = (typeValue: string) => typeValue.split(",")[0]?.trim() ?? typeValue;

export const classNameToTimelineType = (className: string) => `${className}, Assembly-CSharp`;

export const humanizeIdentifier = (value: string) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());

export const getTimelineTypeOptions = (registry: TimelineSchemaRegistry | null, fallback: Array<{ value: string; label: string }>) => {
  const options = new Map<string, string>(fallback.map((option) => [option.value, option.label]));
  for (const className of registry?.timelineClassNames ?? []) {
    const typeValue = classNameToTimelineType(className);
    if (!options.has(typeValue)) {
      options.set(typeValue, humanizeIdentifier(className.replace(/Data$/, "")));
    }
  }
  return Array.from(options, ([value, label]) => ({ value, label }));
};

export const getTimelineSchemaForType = (registry: TimelineSchemaRegistry | null, typeValue: string) =>
  registry?.types[timelineTypeToClassName(typeValue)] ?? null;

const createEmptyRegistry = (): TimelineSchemaRegistry => ({
  types: {},
  enums: {},
  timelineClassNames: [],
});

export const parseCSharpSchemaFiles = (sources: Array<{ path: string; contents: string }>): TimelineSchemaRegistry => {
  const registry = createEmptyRegistry();
  const pendingTypes: CSharpTypeSchema[] = [];
  const pendingEnums: Array<{ name: string; values: string[]; baseType?: string }> = [];

  for (const source of sources) {
    const lines = source.contents.split(/\r?\n/);
    let pending: PendingType | null = null;

    for (const line of lines) {
      if (!pending) {
        const declaration = line.match(typeDeclarationPattern);
        if (!declaration) {
          continue;
        }

        const [, kind, name, baseType] = declaration;
        if (kind === "enum") {
          pending = {
            type: { name, kind: "enum", values: [], baseType },
            braceDepth: 0,
            hasOpenedBody: false,
          };
        } else {
          pending = {
            type: { name, kind: kind as "class" | "struct", baseType, fields: [] },
            braceDepth: 0,
            hasOpenedBody: false,
          };
        }
      }

      const currentPending = pending;
      const braceCounts = countBraces(line);
      if (braceCounts.open > 0) {
        currentPending.hasOpenedBody = true;
      }
      currentPending.braceDepth += braceCounts.open - braceCounts.close;

      if (currentPending.type.kind === "enum") {
        if (currentPending.hasOpenedBody && currentPending.braceDepth >= 1 && !line.includes("{") && !line.includes("}")) {
          for (const value of parseEnumValuesFromLine(line)) {
            currentPending.type.values.push(value);
          }
        }
      } else if (currentPending.hasOpenedBody && currentPending.braceDepth === 1) {
        const defaultValueMatch = line.match(defaultValuePattern);
        if (defaultValueMatch) {
          currentPending.pendingDefaultValue = parseDefaultValue(defaultValueMatch[1]);
        }

        if (!line.includes("(")) {
          const fieldMatch = line.match(fieldPattern);
          if (fieldMatch) {
            const [, typeName, name] = fieldMatch;
            currentPending.type.fields.push({
              name,
              typeName,
              kind: "unknown",
              defaultValue: currentPending.pendingDefaultValue,
            });
            currentPending.pendingDefaultValue = undefined;
          }
        }
      }

      if (currentPending.hasOpenedBody && currentPending.braceDepth <= 0) {
        if (currentPending.type.kind === "enum") {
          pendingEnums.push(currentPending.type);
        } else {
          pendingTypes.push(currentPending.type);
        }
        pending = null;
      }
    }
  }

  for (const entry of pendingEnums) {
    registry.enums[entry.name] = entry.values;
  }

  for (const type of pendingTypes) {
    registry.types[type.name] = {
      ...type,
      fields: type.fields.map((field) => normalizeField(field, registry.enums, registry.types)),
    };
  }

  for (const [name, type] of Object.entries(registry.types)) {
    registry.types[name] = {
      ...type,
      fields: type.fields.map((field) => normalizeField(field, registry.enums, registry.types)),
    };

    if (type.baseType === "TimelineData") {
      registry.timelineClassNames.push(name);
    }
  }

  registry.timelineClassNames.sort((left, right) => left.localeCompare(right));
  return registry;
};

const cloneValue = <T,>(value: T): T => {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
};

const buildDefaultValueForField = (field: CSharpFieldSchema, registry: TimelineSchemaRegistry): unknown => {
  if (field.defaultValue !== undefined) {
    return field.defaultValue;
  }

  switch (field.kind) {
    case "boolean":
      return false;
    case "number":
      return 0;
    case "string":
      return "";
    case "stringArray":
      return [];
    case "enum":
      return 0;
    case "object":
      return buildDefaultObjectForType(field.typeName, registry) ?? {};
    default:
      return null;
  }
};

export const buildDefaultObjectForType = (typeName: string, registry: TimelineSchemaRegistry): Record<string, unknown> | null => {
  const schema = registry.types[typeName];
  if (!schema) {
    return null;
  }

  return schema.fields.reduce<Record<string, unknown>>((result, field) => {
    const defaultValue = buildDefaultValueForField(field, registry);
    if (defaultValue !== null) {
      result[field.name] = cloneValue(defaultValue);
    }
    return result;
  }, {});
};
