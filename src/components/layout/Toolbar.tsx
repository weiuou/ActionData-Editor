import { AlertCircle, FolderOpen, Save, SaveAll, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ToolbarProps {
  filePath: string | null;
  dirty: boolean;
  issueCount: number;
  errorCount: number;
  onOpen: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onValidate: () => void;
}

export const Toolbar = ({ filePath, dirty, issueCount, errorCount, onOpen, onSave, onSaveAs, onValidate }: ToolbarProps) => (
  <header className="flex items-start justify-between gap-8 border-b border-border bg-[#fafafa] px-8 py-6">
    <div className="min-w-0">
      <h1 className="font-mono text-[34px] font-black leading-none tracking-tight text-black">ActionData Studio</h1>
      <div className="mt-3 flex min-w-0 items-center gap-3 text-sm text-muted-foreground">
        <span className="h-3 w-3 rounded-sm bg-[#ecd53f] ring-1 ring-black/10" />
        <span className="truncate font-mono">{filePath ?? "未打开 ActionData.json"}</span>
        {dirty ? <span className="rounded-sm bg-black px-2 py-0.5 font-mono text-xs text-white">UNSAVED</span> : null}
      </div>
    </div>
    <div className="flex shrink-0 flex-col items-end gap-4">
      <div className="flex items-center gap-5 text-sm text-foreground">
        <div className="flex items-center gap-2">
          {errorCount > 0 ? <AlertCircle className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
          <span>{issueCount} issues</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onOpen}><FolderOpen className="h-4 w-4" /> 打开</Button>
        <Button variant="outline" onClick={onSave} disabled={!filePath && !dirty}><Save className="h-4 w-4" /> 保存</Button>
        <Button variant="outline" onClick={onSaveAs} disabled={!filePath && !dirty}><SaveAll className="h-4 w-4" /> 另存为</Button>
        <Button onClick={onValidate}><ShieldCheck className="h-4 w-4" /> 校验</Button>
      </div>
    </div>
  </header>
);
