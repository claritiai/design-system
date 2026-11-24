// Where a file is dropped or picked: a dashed area with an icon, what to do and what happens to the file. A click
// opens the file chooser; a file dropped on it, or chosen, goes to `onFiles`.
import { Upload } from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';
import { cn } from '../shell/cn';

export function FileDrop({ title, detail, accept, multiple, onFiles, className }: {
  title: ReactNode;
  detail?: ReactNode;
  /** The chooser's file types (".ifc", say). */
  accept?: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  className?: string;
}) {
  const id = useId();
  const [over, setOver] = useState(false);
  return (
    <label htmlFor={id}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); onFiles([...e.dataTransfer.files]); }}
      className={cn('flex cursor-pointer items-center gap-4 rounded-surface border-2 border-dashed px-6 py-6 transition-colors',
        over ? 'border-foreground/60 bg-muted/60' : 'border-border bg-card hover:border-foreground/40', className)}>
      <Upload aria-hidden className="size-8 shrink-0 text-muted-foreground" strokeWidth={1.6} />
      <span className="flex min-w-0 flex-col gap-1">
        <span className="text-[15px] font-semibold text-foreground">{title}</span>
        {detail ? <span className="text-[13px] text-muted-foreground">{detail}</span> : null}
      </span>
      <input id={id} type="file" hidden accept={accept} multiple={multiple}
        onChange={(e) => { const files = [...(e.target.files ?? [])]; e.target.value = ''; if (files.length) onFiles(files); }} />
    </label>
  );
}
