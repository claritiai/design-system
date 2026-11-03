'use client';
// Clariti's reply bar, as its chat has it (from AI Elements): a form around an input group, with the files picked,
// pasted or dropped on it, a text field where Enter sends, a footer for the tools and the send button. An app lays it
// out from these parts. The files reach `onSubmit` as data URLs, with the text.
import { ImageIcon, Loader2Icon, PlusIcon, SquareIcon, XIcon, CornerDownLeftIcon } from 'lucide-react';
import {
  type ChangeEventHandler, Children, type ClipboardEventHandler, type ComponentProps, createContext, type FormEvent,
  type FormEventHandler, Fragment, type HTMLAttributes, type KeyboardEventHandler, type ReactNode, type RefObject,
  useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import {
  cn, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, InputGroup, InputGroupAddon,
  InputGroupButton, InputGroupTextarea, type GroupButtonSize,
} from './ui';

/** A file as the AI SDK's messages carry it. */
export type PromptInputFile = { type: 'file'; mediaType: string; filename?: string; url: string };
/** Where a chat's answer is: as the AI SDK's `useChat` reports it. */
export type PromptInputStatus = 'submitted' | 'streaming' | 'ready' | 'error';

type Attached = PromptInputFile & { id: string; size?: number };
type AttachmentsContext = {
  files: Attached[];
  add: (files: File[] | FileList) => void;
  remove: (id: string) => void;
  clear: () => void;
  openFileDialog: () => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
};

const Attachments = createContext<AttachmentsContext | null>(null);

/** The files on the bar, and the calls that add, remove and pick them. Inside a PromptInput. */
export const usePromptInputAttachments = () => {
  const context = useContext(Attachments);
  if (!context) throw new Error('usePromptInputAttachments must be used within a PromptInput');
  return context;
};

/** The files on the bar, each drawn by `children`; nothing while there are none. */
export function PromptInputAttachments({ children, className, ...props }: Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  children: (attachment: Attached) => ReactNode;
}) {
  const attachments = usePromptInputAttachments();
  if (!attachments.files.length) return null;
  return (
    <div className={cn('flex w-full flex-wrap items-center gap-2 p-3', className)} {...props}>
      {attachments.files.map((file) => <Fragment key={file.id}>{children(file)}</Fragment>)}
    </div>
  );
}

/**
 * A file on the bar as Clariti's chat draws it: a picture as a thumbnail, anything else by its type, the name and
 * extension under it, and a button on hover that takes it off. `compact` is the smaller card of a chat docked beside
 * a design. Outside a PromptInput, `onRemove` takes it off instead, and `href` opens it.
 */
export function PromptInputAttachmentPreview({ data, compact, className, onRemove, href }: {
  data: PromptInputFile & { id: string };
  compact?: boolean;
  className?: string;
  onRemove?: () => void;
  href?: string;
}) {
  const attachments = useContext(Attachments);
  const takeOff = onRemove ?? (attachments ? () => attachments.remove(data.id) : undefined);
  const isImage = data.mediaType?.startsWith('image/') && data.url;
  const filename = data.filename || (isImage ? 'Image' : 'Attachment');
  const ext = filename.split('.').pop()?.toUpperCase() || '';
  return (
    <div className={cn(`group relative ${compact ? 'w-28' : 'w-36'} rounded-lg border border-border bg-muted/30 overflow-hidden`, className)}>
      {takeOff ? (
        <button
          type="button"
          onClick={takeOff}
          className={`absolute ${compact ? 'top-1 right-1' : 'top-1.5 right-1.5'} z-10 p-0.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80`}
          aria-label="Remove attachment"
        >
          <XIcon className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        </button>
      ) : null}
      {href ? <a href={href} target="_blank" rel="noreferrer" aria-label={`Open ${filename}`} className="absolute inset-0" /> : null}
      {isImage ? (
        <div className="aspect-[4/3] w-full overflow-hidden">
          <img src={data.url} alt={filename} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="aspect-[4/3] w-full flex items-center justify-center bg-muted/50">
          <svg className={`${compact ? 'w-6 h-6' : 'w-8 h-8'} text-muted-foreground/40`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      <div className={compact ? 'px-1.5 py-1' : 'px-2 py-1.5'}>
        <p className={`${compact ? 'text-[10px]' : 'text-[11px]'} font-medium text-foreground truncate`}>{filename}</p>
        {ext && <p className={`${compact ? 'text-[9px]' : 'text-[10px]'} text-muted-foreground`}>{ext}</p>}
      </div>
    </div>
  );
}

/** The menu item that opens the file picker, and closes the menu so the page answers again once a file is picked. Inside PromptInputActionMenuContent. */
export const PromptInputActionAddAttachments = ({ label = 'Add photos or files', ...props }: ComponentProps<typeof DropdownMenuItem> & { label?: string }) => {
  const attachments = usePromptInputAttachments();
  return (
    <DropdownMenuItem {...props} onSelect={() => attachments.openFileDialog()}>
      <ImageIcon className="mr-2 size-4" /> {label}
    </DropdownMenuItem>
  );
};

export type PromptInputMessage = { text: string; files: PromptInputFile[] };

export type PromptInputProps = Omit<HTMLAttributes<HTMLFormElement>, 'onSubmit' | 'onError'> & {
  accept?: string;
  multiple?: boolean;
  /** Takes files dropped anywhere on the page, not only on the bar. */
  globalDrop?: boolean;
  maxFiles?: number;
  /** Bytes, per file. */
  maxFileSize?: number;
  /** Bytes, all the files together: they travel in the request as data URLs, a third larger than the files. */
  maxTotalFileSize?: number;
  onError?: (err: { code: 'max_files' | 'max_file_size' | 'max_total_size' | 'accept'; message: string }) => void;
  /** Rejecting keeps the files on the bar, for the person to try again. */
  onSubmit: (message: PromptInputMessage, event: FormEvent<HTMLFormElement>) => void | Promise<void>;
  /** The class of the input group inside the form. */
  groupClassName?: string;
};

/**
 * The reply bar's form. It keeps the files on the bar, takes a pick, a paste or a drop, and checks them against
 * `accept` and the limits, calling `onError` for what stays out. On send it empties the text at once, and the files
 * once `onSubmit` has gone through.
 */
export const PromptInput = ({
  className, accept, multiple, globalDrop, maxFiles, maxFileSize, maxTotalFileSize, onError, onSubmit, groupClassName, children, ...props
}: PromptInputProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  const [files, setFiles] = useState<Attached[]>([]);
  const openFileDialog = useCallback(() => { inputRef.current?.click(); }, []);

  const matchesAccept = useCallback((f: File) => {
    if (!accept || accept.trim() === '') return true;
    for (const token of accept.split(',').map((t) => t.trim().toLowerCase())) {
      if (token.endsWith('/*')) {
        if (f.type.toLowerCase().startsWith(token.slice(0, -1))) return true;
        continue;
      }
      if (token.includes('/')) {
        if (f.type.toLowerCase() === token) return true;
        continue;
      }
      if (token.startsWith('.') && f.name.toLowerCase().endsWith(token)) return true;
    }
    return false;
  }, [accept]);

  const add = useCallback((fileList: File[] | FileList) => {
    const incoming = Array.from(fileList);
    const accepted = incoming.filter((f) => matchesAccept(f));
    if (incoming.length && accepted.length === 0) {
      onError?.({ code: 'accept', message: 'No files match the accepted types.' });
      return;
    }
    const sized = accepted.filter((f) => (maxFileSize ? f.size <= maxFileSize : true));
    if (accepted.length > 0 && sized.length === 0) {
      onError?.({ code: 'max_file_size', message: 'All files exceed the maximum size.' });
      return;
    }
    setFiles((prev) => {
      const capacity = typeof maxFiles === 'number' ? Math.max(0, maxFiles - prev.length) : undefined;
      let capped = typeof capacity === 'number' ? sized.slice(0, capacity) : sized;
      if (typeof capacity === 'number' && sized.length > capacity) onError?.({ code: 'max_files', message: 'Too many files. Some were not added.' });
      // The files on the bar already count toward the combined budget.
      if (typeof maxTotalFileSize === 'number') {
        let total = prev.reduce((sum, it) => sum + (it.size ?? 0), 0);
        const within: File[] = [];
        let overflowed = false;
        for (const file of capped) {
          if (total + file.size > maxTotalFileSize) { overflowed = true; continue; }
          total += file.size;
          within.push(file);
        }
        if (overflowed) {
          onError?.({ code: 'max_total_size', message: 'Attachments exceed the combined size limit. Remove a file or send in smaller batches.' });
        }
        capped = within;
      }
      return prev.concat(capped.map((file) => ({
        id: crypto.randomUUID(), type: 'file' as const, url: URL.createObjectURL(file), mediaType: file.type, filename: file.name, size: file.size,
      })));
    });
  }, [matchesAccept, maxFiles, maxFileSize, maxTotalFileSize, onError]);

  const remove = (id: string) => setFiles((prev) => {
    const found = prev.find((file) => file.id === id);
    if (found?.url) URL.revokeObjectURL(found.url);
    return prev.filter((file) => file.id !== id);
  });
  const clear = () => setFiles((prev) => {
    for (const file of prev) if (file.url) URL.revokeObjectURL(file.url);
    return [];
  });

  // A drop on the bar, or with `globalDrop` anywhere on the page.
  useEffect(() => {
    const target = globalDrop ? document : formRef.current;
    if (!target) return;
    const onDragOver = (e: Event) => {
      if ((e as DragEvent).dataTransfer?.types?.includes('Files')) e.preventDefault();
    };
    const onDrop = (e: Event) => {
      const data = (e as DragEvent).dataTransfer;
      if (data?.types?.includes('Files')) e.preventDefault();
      if (data?.files && data.files.length > 0) add(data.files);
    };
    target.addEventListener('dragover', onDragOver);
    target.addEventListener('drop', onDrop);
    return () => {
      target.removeEventListener('dragover', onDragOver);
      target.removeEventListener('drop', onDrop);
    };
  }, [add, globalDrop]);

  // The pictures' addresses go when the bar does; a file taken off or sent gives its own back.
  const latest = useRef(files);
  useEffect(() => { latest.current = files; }, [files]);
  useEffect(() => () => { for (const f of latest.current) if (f.url) URL.revokeObjectURL(f.url); }, []);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    if (event.currentTarget.files) add(event.currentTarget.files);
    event.currentTarget.value = '';
  };

  const toDataUrl = async (url: string): Promise<string> => {
    const blob = await (await fetch(url)).blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const ctx = useMemo<AttachmentsContext>(
    () => ({ files, add, remove, clear, openFileDialog, fileInputRef: inputRef }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [files, add, openFileDialog],
  );

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const text = (new FormData(form).get('message') as string) || '';
    // Emptied at once, so what the person types while the files convert is kept.
    form.reset();
    void Promise.all(files.map(async ({ id: _id, size: _size, ...item }) => (
      item.url.startsWith('blob:') ? { ...item, url: await toDataUrl(item.url) } : item
    ))).then((converted) => {
      try {
        const result = onSubmit({ text, files: converted }, event);
        if (result instanceof Promise) result.then(clear).catch(() => { /* kept on the bar, to try again */ });
        else clear();
      } catch {
        // kept on the bar, to try again
      }
    });
  };

  return (
    <Attachments.Provider value={ctx}>
      <input accept={accept} aria-label="Upload files" className="hidden" multiple={multiple} onChange={handleChange} ref={inputRef} title="Upload files" type="file" />
      <form ref={formRef} className={cn('w-full', className)} onSubmit={handleSubmit} {...props}>
        <InputGroup className={cn('overflow-hidden', groupClassName)}>{children}</InputGroup>
      </form>
    </Attachments.Provider>
  );
};

/**
 * The text field: Enter sends unless the send button is disabled, Shift+Enter starts a new line, Backspace in an
 * empty field takes the last file off, and a pasted file joins the others.
 */
export const PromptInputTextarea = ({ className, placeholder = 'What would you like to know?', ...props }: ComponentProps<typeof InputGroupTextarea>) => {
  const attachments = usePromptInputAttachments();
  const [isComposing, setIsComposing] = useState(false);

  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === 'Enter') {
      if (isComposing || e.nativeEvent.isComposing || e.shiftKey) return;
      e.preventDefault();
      const form = e.currentTarget.form;
      const submit = form?.querySelector('button[type="submit"]') as HTMLButtonElement | null;
      if (submit?.disabled) return;
      form?.requestSubmit();
    }
    if (e.key === 'Backspace' && e.currentTarget.value === '' && attachments.files.length > 0) {
      e.preventDefault();
      const last = attachments.files.at(-1);
      if (last) attachments.remove(last.id);
    }
  };

  const handlePaste: ClipboardEventHandler<HTMLTextAreaElement> = (event) => {
    const items = event.clipboardData?.items;
    if (!items) return;
    const files: File[] = [];
    for (const item of items) {
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }
    if (files.length > 0) {
      event.preventDefault();
      attachments.add(files);
    }
  };

  return (
    <InputGroupTextarea
      className={cn('field-sizing-content max-h-48 min-h-16', className)}
      name="message"
      onCompositionEnd={() => setIsComposing(false)}
      onCompositionStart={() => setIsComposing(true)}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      placeholder={placeholder}
      {...props}
    />
  );
};

/** The row under the text: the tools on one side, the send button on the other. */
export const PromptInputFooter = ({ className, ...props }: Omit<ComponentProps<typeof InputGroupAddon>, 'align'>) => (
  <InputGroupAddon align="block-end" className={cn('justify-between gap-1', className)} {...props} />
);

export const PromptInputTools = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex items-center gap-1', className)} {...props} />
);

/** A tool button: an icon, or an icon with a word. */
export const PromptInputButton = ({ variant = 'ghost', className, size, ...props }: ComponentProps<typeof InputGroupButton>) => {
  const newSize: GroupButtonSize = size ?? (Children.count(props.children) > 1 ? 'sm' : 'icon-sm');
  return <InputGroupButton className={cn(className)} size={newSize} type="button" variant={variant} {...props} />;
};

export const PromptInputActionMenu = (props: ComponentProps<typeof DropdownMenu>) => <DropdownMenu {...props} />;

/** The menu's button: a plus unless it is given its own icon. */
export const PromptInputActionMenuTrigger = ({ className, children, ...props }: ComponentProps<typeof PromptInputButton>) => (
  <DropdownMenuTrigger asChild>
    <PromptInputButton className={className} {...props}>{children ?? <PlusIcon className="size-4" />}</PromptInputButton>
  </DropdownMenuTrigger>
);

export const PromptInputActionMenuContent = ({ className, ...props }: ComponentProps<typeof DropdownMenuContent>) => (
  <DropdownMenuContent align="start" className={cn(className)} {...props} />
);

/** The send button: its icon follows `status`, a stop square while an answer streams, unless it is given its own. */
export const PromptInputSubmit = ({ className, variant = 'default', size = 'icon-sm', status, children, ...props }: ComponentProps<typeof InputGroupButton> & {
  status?: PromptInputStatus;
}) => {
  let Icon = <CornerDownLeftIcon className="size-4" />;
  if (status === 'submitted') Icon = <Loader2Icon className="size-4 animate-spin" />;
  else if (status === 'streaming') Icon = <SquareIcon className="size-4" />;
  else if (status === 'error') Icon = <XIcon className="size-4" />;
  return (
    <InputGroupButton aria-label="Submit" className={cn(className)} size={size} type="submit" variant={variant} {...props}>
      {children ?? Icon}
    </InputGroupButton>
  );
};
