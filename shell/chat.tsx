'use client';
// The chat frame every Clariti app shares: the thread's header, a 720px thread column on a 14px rhythm, the
// person's turns in a muted bubble, and a flat bordered reply bar with an ink send button. It knows nothing about
// what answers: the app passes the messages and a form action.
import { ArrowDown, ArrowLeft, ArrowUp, Square } from 'lucide-react';
import { useRef } from 'react';
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
 * in a side panel. `compact` is the tighter chat docked beside a design: 13px text, 12px between messages.
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
 * clears after its action. `large` is the opening composer of a new chat, `note` the line under it. While an answer
 * is coming (`busy`) nothing sends, and with `onStop` the send button stops the answer instead.
 */
export function ChatComposer({ action, placeholder = 'Reply…', autoFocus, note, large, busy, onStop }: {
  action: (form: FormData) => void | Promise<void>;
  placeholder?: string;
  autoFocus?: boolean;
  note?: React.ReactNode;
  large?: boolean;
  busy?: boolean;
  onStop?: () => void;
}) {
  const form = useRef<HTMLFormElement>(null);
  return (
    <div className={large ? 'w-full' : 'shrink-0 max-w-[720px] mx-auto w-full px-5 pb-4 pt-2'}>
      <form
        ref={form}
        action={action}
        className="flex flex-col rounded-control border border-border bg-card focus-within:border-muted-foreground/50 transition-colors"
      >
        <textarea
          name="text"
          required
          autoFocus={autoFocus}
          placeholder={placeholder}
          rows={large ? 3 : 1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              if (!busy && e.currentTarget.value.trim()) form.current?.requestSubmit();
            }
          }}
          className={`w-full resize-none bg-transparent px-3 pt-3 outline-none placeholder:text-muted-foreground/60 ${large ? 'min-h-20 text-sm' : 'min-h-9 text-[13px]'}`}
        />
        <div className="flex items-center justify-end px-2 pb-2">
          <Send busy={busy} onStop={onStop} />
        </div>
      </form>
      {note ? <p className="text-center text-[11px] text-muted-foreground/80 mt-2">{note}</p> : null}
    </div>
  );
}
