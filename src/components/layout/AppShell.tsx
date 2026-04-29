import { useEffect, useState } from "react";
import { ActionEditor } from "@/components/actions/ActionEditor";
import { ActionList } from "@/components/actions/ActionList";
import { Toolbar } from "@/components/layout/Toolbar";
import { ValidationDialog } from "@/components/layout/ValidationPanel";
import { useEditorStore } from "@/store/editorStore";
import type { ValidationIssue } from "@/validation/validationTypes";

export const AppShell = () => {
  const store = useEditorStore();
  const actions = store.document ?? [];
  const selectedAction = actions.find((action) => action.__editorId === store.selectedActionId) ?? null;
  const selectedActionIndex = selectedAction ? actions.findIndex((action) => action.__editorId === selectedAction.__editorId) : -1;
  const errorCount = store.validationIssues.filter((issue) => issue.severity === "error").length;
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [highlightedValidationPath, setHighlightedValidationPath] = useState<string | null>(null);

  const scrollToIssue = (path: string) => {
    window.setTimeout(() => {
      const target = document.querySelector<HTMLElement>(`[data-validation-path="${CSS.escape(path)}"]`)
        ?? document.querySelector<HTMLElement>(`[data-validation-path^="${CSS.escape(path)}."]`);
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
  };

  const validateAndOpen = () => {
    store.validate();
    setValidationDialogOpen(true);
  };

  useEffect(() => {
    void store.restoreLastFile();
  }, []);

  useEffect(() => {
    if (!highlightedValidationPath) {
      return;
    }

    const clearHighlight = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-validation-path]")) {
        return;
      }
      setHighlightedValidationPath(null);
    };

    window.addEventListener("pointerdown", clearHighlight);
    return () => window.removeEventListener("pointerdown", clearHighlight);
  }, [highlightedValidationPath]);

  const selectIssue = (issue: ValidationIssue) => {
    if (issue.actionId) {
      store.selectAction(issue.actionId);
    }
    if (issue.timelineId) {
      store.selectTimeline(issue.timelineId);
    }
    setHighlightedValidationPath(issue.path);
    setValidationDialogOpen(false);
    scrollToIssue(issue.path);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <Toolbar
        filePath={store.filePath}
        dirty={store.dirty}
        issueCount={store.validationIssues.length}
        errorCount={errorCount}
        onOpen={store.openFile}
        onSave={store.saveFile}
        onSaveAs={store.saveFileAs}
        onValidate={validateAndOpen}
      />
      {store.lastError ? (
        <button className="border-b border-destructive bg-white px-8 py-2 text-left text-sm text-destructive" onClick={store.clearError}>
          {store.lastError}
        </button>
      ) : null}
      <main className="grid min-h-0 flex-1 grid-cols-[320px_minmax(0,1fr)] gap-4 p-4">
        <ActionList
          actions={actions}
          selectedActionId={store.selectedActionId}
          onSelect={store.selectAction}
          onAdd={store.addAction}
          onDuplicate={store.duplicateAction}
          onDelete={store.deleteAction}
          onMove={store.moveAction}
        />
        <section className="min-h-0 overflow-auto rounded-lg border border-border bg-white p-4 simple-card-shadow">
          <ActionEditor
            action={selectedAction}
            actionIndex={selectedActionIndex}
            selectedTimelineId={store.selectedTimelineId}
            highlightedValidationPath={highlightedValidationPath}
            onUpdateAction={(patch) => selectedAction && store.updateAction(selectedAction.__editorId, patch)}
            onSelectTimeline={store.selectTimeline}
            onAddTimeline={(type) => selectedAction && store.addTimeline(selectedAction.__editorId, type)}
            onUpdateTimeline={(timelineId, patch) => selectedAction && store.updateTimeline(selectedAction.__editorId, timelineId, patch)}
            onDuplicateTimeline={(timelineId) => selectedAction && store.duplicateTimeline(selectedAction.__editorId, timelineId)}
            onDeleteTimeline={(timelineId) => selectedAction && store.deleteTimeline(selectedAction.__editorId, timelineId)}
            onMoveTimeline={(timelineId, direction) => selectedAction && store.moveTimeline(selectedAction.__editorId, timelineId, direction)}
            onUpdateDerivations={(derivations) => selectedAction && store.updateDerivations(selectedAction.__editorId, derivations)}
          />
        </section>
      </main>
      <ValidationDialog
        issues={store.validationIssues}
        open={validationDialogOpen}
        onClose={() => setValidationDialogOpen(false)}
        onSelectIssue={selectIssue}
      />
    </div>
  );
};
