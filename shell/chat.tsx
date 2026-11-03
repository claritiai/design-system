'use client';
// The chat frame every Clariti app shares: the thread's header and a 720px thread column on a 14px rhythm. The turns
// and the reply bar are Clariti's own (message.tsx, prompt-input.tsx). It knows nothing about what answers.
import { ArrowDown, ArrowLeft } from 'lucide-react';
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
