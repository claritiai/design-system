'use client';
// The chat frame every Clariti app shares: the thread's header, a 720px thread column on a 14px rhythm, the
// person's turns in a muted bubble, and a flat bordered reply bar with an ink send button. It knows nothing about
// what answers: the app passes the messages and a form action.
import { ArrowDown, ArrowLeft, ArrowUp, FileText, Paperclip, Square, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { StickToBottom, useStickToBottomContext } from 'use-stick-to-bottom';

/** The thread's title row. `icon` is an element, so a server page can pass one. */
export function ChatHeader({ title, icon, onBack, backLabel = 'Back', backTitle, pill, actions }: {
  title: string;
  icon?: React.ReactNode;
  onBack?: () => void;
  backLabel?: string;
  backTitle?: string;
  pill?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="shrink-0 flex items-center gap-2 px-4 py-3 border-b border-border/50">
      {onBack ? (
        <button
          onClick={onBack}
          aria-label={backLabel}
          title={backTitle ?? backLabel}
          className="p-1 -ml-1 rounded-tight text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
      ) : null}
      {icon ? <span className="shrink-0 flex text-foreground [&>svg]:w-[15px] [&>svg]:h-[15px]">{icon}</span> : null}
      <span className="text-[13px] font-semibold text-foreground truncate">{title}</span>
      {pill ? <span className="shrink-0">{pill}</span> : null}
      {actions ? <span className="shrink-0 ml-auto flex items-center gap-2">{actions}</span> : null}
    </div>
  );
}

/**
 * The scrolling thread. It opens at the latest message and follows a streaming answer while the person stays at the
 * bottom; scrolled up, it stays put and offers a button back down. Answers take its full width when it is narrow, as
 * in a side panel. `compact` is the tighter chat docked beside a design: 12px between messages, inset 16px inside
 * 16px gutters, and 13px as the thread's own text size (a message may set its own).
 */
export function ChatThread({ children, compact }: { children: React.ReactNode; compact?: boolean }) {
  return (
    <StickToBottom
      className={`relative flex-1 min-h-0 overflow-y-hidden ${compact ? 'px-4 text-[13px] leading-[1.55]' : ''}`}
      initial="smooth"
      resize="smooth"
      role="log"
    >
      <StickToBottom.Content className={`@container max-w-[720px] mx-auto w-full flex flex-col ${compact ? 'gap-3 p-4' : 'gap-3.5 py-5 px-5'}`}>
        {children}
      </StickToBottom.Content>
      <BackDown />
    </StickToBottom>
  );
}

function BackDown() {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();
  if (isAtBottom) return null;
  return (
    <button
      type="button"
      onClick={() => scrollToBottom()}
      aria-label="Latest message"
      className="absolute bottom-4 left-1/2 -translate-x-1/2 inline-flex size-9 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-xs hover:bg-accent dark:border-input dark:bg-input/30 dark:hover:bg-input/50"
    >
      <ArrowDown className="size-4" />
    </button>
  );
}

export function ChatMessage({ from, children }: { from: 'user' | 'assistant'; children: React.ReactNode }) {
  return from === 'user' ? (
    <div className="ml-auto flex w-fit max-w-[80%] flex-col overflow-hidden rounded-lg bg-secondary px-4 py-3 text-sm text-foreground whitespace-pre-wrap">{children}</div>
  ) : (
    <div className="flex w-full max-w-full @xl:max-w-[80%] min-w-0 flex-col gap-2 text-sm text-foreground">{children}</div>
  );
}

/**
 * A file in a message or waiting on the reply bar: a picture as a thumbnail, anything else by name. `href` opens it,
 * `onRemove` takes it off the bar, and `busy` dims it while it uploads.
 */
export function ChatFile({ name, src, href, onRemove, busy }: { name: string; src?: string; href?: string; onRemove?: () => void; busy?: boolean }) {
  const body = src ? (
    <img src={src} alt={name} className="size-16 rounded-lg border border-border object-cover" />
  ) : (
    <span className="inline-flex h-9 max-w-48 items-center gap-1.5 rounded-lg border border-border bg-muted px-2.5 text-xs text-muted-foreground">
      <FileText className="size-3.5 shrink-0" />
      <span className="truncate">{name}</span>
    </span>
  );
  return (
    <span className={`group relative inline-flex ${busy ? 'opacity-50' : ''}`} title={name}>
      {href ? <a href={href} target="_blank" rel="noreferrer">{body}</a> : body}
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${name}`}
          className="absolute -right-1.5 -top-1.5 inline-flex size-5 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-hairline hover:text-foreground"
        >
          <X className="size-3" />
        </button>
      ) : null}
    </span>
  );
}

function Send({ busy, onStop }: { busy?: boolean; onStop?: () => void }) {
  const { pending } = useFormStatus();
  const button = 'inline-flex size-8 items-center justify-center rounded-control bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-20';
  if (busy && onStop) {
    return (
      <button type="button" onClick={onStop} aria-label="Stop" title="Stop" className={button}>
        <Square className="size-3 fill-current" />
      </button>
    );
  }
  return (
    <button type="submit" disabled={pending || busy} aria-label="Send" className={button}>
      <ArrowUp className="size-4" />
    </button>
  );
}

/**
 * The reply bar: a form posting `text` to `action`. Enter sends, Shift+Enter starts a new line, and the form
 * clears after its action. `large` is the opening composer of a new chat, `note` the line under it, `compact` the
 * bar of a compact chat (see ChatThread). `inline` is a bar on one row, for a page to start a chat from: `icon`, the
 * field, the paperclip and send side by side, the field growing with its text. While an answer
 * is coming (`busy`) nothing sends, and with `onStop` the send button stops the answer instead. `fieldRef` reaches the
 * field, for an app that fills it in.
 *
 * With `onFiles`, files can come along: a paperclip picks them (`accept` as for a file input), and a file pasted or
 * dropped on the bar arrives the same way. The app keeps them and shows them in `attachments`, above the text;
 * `tools` sits beside the paperclip.
 */
export function ChatComposer({ action, placeholder = 'Reply…', autoFocus, note, large, compact, inline, icon, fieldRef, busy, onStop, onFiles, accept, attachments, tools }: {
  action: (form: FormData) => void | Promise<void>;
  placeholder?: string;
  autoFocus?: boolean;
  note?: React.ReactNode;
  large?: boolean;
  compact?: boolean;
  inline?: boolean;
  icon?: React.ReactNode;
  fieldRef?: React.Ref<HTMLTextAreaElement>;
  busy?: boolean;
  onStop?: () => void;
  onFiles?: (files: File[]) => void;
  accept?: string;
  attachments?: React.ReactNode;
  tools?: React.ReactNode;
}) {
  const form = useRef<HTMLFormElement>(null);
  const picker = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const take = (list: FileList | null | undefined) => {
    const files = [...(list ?? [])];
    if (files.length && onFiles) onFiles(files);
    return files.length > 0;
  };
  // An inline field grows with its text up to its max height, and drops back to one row once the form has sent.
  const grow = (el: HTMLTextAreaElement) => { el.style.height = 'auto'; el.style.height = `${el.scrollHeight}px`; };
  const send = inline ? async (data: FormData) => {
    await action(data);
    const el = form.current?.querySelector('textarea');
    if (el) el.style.height = '';
  } : action;
  const field = (
    <textarea
      ref={fieldRef}
      name="text"
      required
      autoFocus={autoFocus}
      placeholder={placeholder}
      rows={large ? 3 : 1}
      onInput={inline ? (e) => grow(e.currentTarget) : undefined}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
          e.preventDefault();
          if (!busy && e.currentTarget.value.trim()) form.current?.requestSubmit();
        }
      }}
      className={`resize-none bg-transparent outline-none placeholder:text-muted-foreground/60 ${
        inline ? 'min-w-0 flex-1 max-h-40 px-1.5 py-1.5 text-sm' : `w-full px-3 pt-3 ${large ? 'min-h-20 text-sm' : 'min-h-9 text-[13px]'}`
      }`}
    />
  );
  const clip = onFiles ? (
    <>
      <input ref={picker} type="file" multiple accept={accept} hidden onChange={(e) => { take(e.currentTarget.files); e.currentTarget.value = ''; }} />
      <button
        type="button"
        onClick={() => picker.current?.click()}
        aria-label="Attach files"
        title="Attach files"
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-control text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <Paperclip className="size-4" />
      </button>
    </>
  ) : null;
  return (
    <div className={large || inline ? 'w-full' : compact ? 'shrink-0 w-full px-4 pb-3 pt-1' : 'shrink-0 max-w-[720px] mx-auto w-full px-5 pb-4 pt-2'}>
      <form
        ref={form}
        action={send}
        onPaste={onFiles ? (e) => { if (take(e.clipboardData?.files)) e.preventDefault(); } : undefined}
        onDragOver={onFiles ? (e) => { if (e.dataTransfer.types.includes('Files')) { e.preventDefault(); setDragging(true); } } : undefined}
        onDragLeave={onFiles ? () => setDragging(false) : undefined}
        onDrop={onFiles ? (e) => { setDragging(false); if (take(e.dataTransfer.files)) e.preventDefault(); } : undefined}
        className={`flex flex-col rounded-control border bg-card focus-within:border-muted-foreground/50 transition-colors ${inline ? 'shadow-hairline' : ''} ${dragging ? 'border-foreground' : 'border-border'}`}
      >
        {attachments ? <div className="flex flex-wrap gap-2 px-3 pt-3">{attachments}</div> : null}
        {inline ? (
          <div className="flex items-end gap-1 py-1.5 pl-3 pr-1.5">
            {icon ? <span className="flex h-8 shrink-0 items-center text-ai-accent [&>svg]:size-4">{icon}</span> : null}
            {field}
            {clip}
            {tools}
            <Send busy={busy} onStop={onStop} />
          </div>
        ) : (
          <>
            {field}
            <div className="flex items-center gap-1 px-2 pb-2">
              {clip}
              {tools}
              <span className="flex-1" />
              <Send busy={busy} onStop={onStop} />
            </div>
          </>
        )}
      </form>
      {note ? <p className="text-center text-[11px] text-muted-foreground/80 mt-2">{note}</p> : null}
    </div>
  );
}
