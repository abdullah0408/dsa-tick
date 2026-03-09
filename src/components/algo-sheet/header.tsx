import { RiCodeSSlashLine } from "@remixicon/react";

export function AlgoSheetHeader() {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-20 shadow-sm">
      <div className="w-full mx-auto px-4 sm:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-1 border border-border">
            <RiCodeSSlashLine className="size-4 text-primary-foreground" />
          </div>
          <h1 className="text-sm font-bold tracking-tight text-foreground uppercase">
            Algo<span className="text-muted-foreground">Sheet</span>
          </h1>
        </div>
        <div className="text-xs text-muted-foreground font-medium">
          Workspace Mode
        </div>
      </div>
    </header>
  );
}
