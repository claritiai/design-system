'use client';
// What goes inside a Clariti chat's messages, taken from Clariti's own chat so every app's answers read the same: an
// answer's markdown, one chain per turn of what the agent did (its thinking and its tools, on a thin rail), the
// follow-up and starter chips, and the wait before the first word. chatParts lays a message out from its parts as the
// AI SDK streams them: thinking and tool steps gather into one chain until text or a card interrupts. It knows no
// tools: the app names each one (`toolLabel`) and may show a card for it, or for one of its data parts (`card`).
import { Brain, CheckCircle, ChevronDown, File as FileIcon, Loader2, XCircle } from 'lucide-react';
import { memo, useEffect, useRef, useState } from 'react';
import { Streamdown, type StreamdownProps } from 'streamdown';

/** One part of a message, as the AI SDK streams it (its UIMessage parts), with the fields shown here. */
export type ChatPart = {
  type: string;
  text?: string;
  state?: string;
  toolName?: string;
  toolCallId?: string;
  providerExecuted?: boolean;
  mediaType?: string;
  url?: string;
  filename?: string;
};
export type ChatPartsMessage = { id: string; role: string; parts: ChatPart[] };

/**
 * A link in an answer: a page of the same app opens where the chat is, any other in a new tab. The markdown's
 * sanitiser marks every link for a new tab, so the target is set here, not taken from it. With `newTab`, every link
 * opens in a new tab.
 */
function AnswerLink({ href, children, className, newTab, node: _node, target: _target, rel: _rel, ...props }: React.ComponentProps<'a'> & { node?: unknown; newTab?: boolean }) {
  const here = !newTab && !!href && (href.startsWith('/') || href.startsWith('#')) && !href.startsWith('//');
  return (
    <a
      {...props}
      href={href}
      data-streamdown="link"
      className={`wrap-anywhere font-medium text-foreground underline decoration-border hover:decoration-foreground ${className ?? ''}`}
      {...(here ? {} : { target: '_blank', rel: 'noreferrer' })}
    >
      {children}
    </a>
  );
}

function AnswerTable(props: React.ComponentProps<'table'>) {
  return (
    <div className="overflow-x-auto">
      <table {...props} />
    </div>
  );
}

const ANSWER_COMPONENTS = { a: AnswerLink, table: AnswerTable } as StreamdownProps['components'];
const NEW_TAB_COMPONENTS = { a: (props: React.ComponentProps<typeof AnswerLink>) => <AnswerLink {...props} newTab />, table: AnswerTable } as StreamdownProps['components'];

/**
 * An answer's text as markdown, streamed as it comes. `components` replaces how an element renders. `newTab` opens
 * every link in a new tab, a page of the same app too: for a chat beside work that leaving the page would lose.
 */
export const ChatAnswer = memo(
  ({ children, components, newTab, className = '' }: { children: string; components?: StreamdownProps['components']; newTab?: boolean; className?: string }) => (
    <Streamdown
      className={`size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_h1]:text-base [&_h2]:text-[15px] [&_h3]:text-sm [&_h1]:mt-4 [&_h2]:mt-4 [&_h3]:mt-3 ${className}`}
      components={{ ...(newTab ? NEW_TAB_COMPONENTS : ANSWER_COMPONENTS), ...components }}
    >
      {children}
    </Streamdown>
  ),
  (a, b) => a.children === b.children && a.components === b.components && a.newTab === b.newTab,
);
ChatAnswer.displayName = 'ChatAnswer';

/** Text that shimmers while something is under way. */
export function ChatShimmer({ children, className = '' }: { children: string; className?: string }) {
  return (
    <span
      className={`relative inline-block bg-[length:250%_100%,auto] bg-clip-text text-transparent [background-repeat:no-repeat,padding-box] animate-[chat-shimmer_2s_linear_infinite] ${className}`}
      style={{
        backgroundImage: `linear-gradient(90deg, #0000 calc(50% - ${children.length * 2}px), var(--color-background), #0000 calc(50% + ${children.length * 2}px)), linear-gradient(var(--color-muted-foreground), var(--color-muted-foreground))`,
      }}
    >
      {children}
    </span>
  );
}

export type ChatStep =
  | { kind: 'thinking'; key: string; text: string; streaming: boolean }
  | { kind: 'tool'; key: string; label: string; state: string };

/** How long the agent thought: counted while it thinks, closed again a second after. */
function Thinking({ text, streaming }: { text: string; streaming: boolean }) {
  const [open, setOpen] = useState(false);
  const [seconds, setSeconds] = useState<number | null>(null);
  const started = useRef<number | null>(null);
  useEffect(() => {
    if (streaming) {
      started.current ??= Date.now();
    } else if (started.current !== null) {
      setSeconds(Math.ceil((Date.now() - started.current) / 1000));
      started.current = null;
    }
  }, [streaming]);
  return (
    <div className="not-prose">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <Brain className="size-4 shrink-0" />
        {streaming ? <ChatShimmer>Thinking…</ChatShimmer> : <span>{seconds ? `Thought for ${seconds} seconds` : 'Thought for a few seconds'}</span>}
        <ChevronDown className={`size-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? (
        <div className="mt-2 pl-6 text-sm text-muted-foreground">
          <Streamdown>{text}</Streamdown>
        </div>
      ) : null}
    </div>
  );
}

function ToolStep({ label, state }: { label: string; state: string }) {
  if (['input-streaming', 'input-available', 'approval-requested', 'approval-responded'].includes(state)) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground" data-state="in-progress">
        <span className="relative flex size-4 shrink-0 items-center justify-center">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/40" />
          <span className="relative inline-flex size-2 rounded-full bg-primary" />
        </span>
        <ChatShimmer className="text-sm">{label}</ChatShimmer>
      </div>
    );
  }
  if (state === 'output-error' || state === 'output-denied') {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive/70" data-state="error">
        <span className="flex size-4 shrink-0 items-center justify-center"><XCircle size={14} /></span>
        <span>{label}</span>
      </div>
    );
  }
  if (state === 'output-available') {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground" data-state="complete">
        <span className="flex size-4 shrink-0 items-center justify-center"><CheckCircle size={14} className="text-status-pass" /></span>
        <span>{label}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="flex size-4 shrink-0 items-center justify-center"><span className="inline-flex size-2 rounded-full bg-muted-foreground/50" /></span>
      <span>{label}</span>
    </div>
  );
}

/** One turn's steps in order, joined by a thin rail: thinking, a tool, thinking again… `data-chat-steps` and `data-step` name them for an app's tests. */
export function ChatSteps({ steps }: { steps: ChatStep[] }) {
  if (!steps.length) return null;
  return (
    <div className="not-prose flex flex-col" data-chat-steps="">
      {steps.map((step, i) => {
        const last = i === steps.length - 1;
        return (
          <div key={step.key} className={`relative ${last ? '' : 'pb-2'}`} data-step={step.kind}>
            {last ? null : <span aria-hidden className="absolute bottom-[-1px] left-[7.5px] top-[19px] w-px bg-border" />}
            {step.kind === 'thinking' ? <Thinking text={step.text} streaming={step.streaming} /> : <ToolStep label={step.label} state={step.state} />}
          </div>
        );
      })}
    </div>
  );
}

/** Follow-up chips under an answer: each sends its words. They wrap rather than scroll, so a narrow panel shows all. */
export function ChatSuggestions({ suggestions, onPick }: { suggestions: string[]; onPick: (text: string) => void }) {
  if (!suggestions.length) return null;
  return (
    <div className="flex w-full min-w-0 flex-wrap items-start gap-2 py-1">
      {suggestions.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onPick(s)}
          className="inline-flex max-w-full min-w-0 cursor-pointer items-center justify-center whitespace-normal rounded-full border border-border bg-background px-4 text-left text-sm font-medium text-foreground shadow-xs outline-hidden transition-all hover:bg-accent focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:border-input dark:bg-input/30 dark:hover:bg-input/50"
        >
          {s}
        </button>
      ))}
    </div>
  );
}

/**
 * Starter questions above the reply bar of an empty chat: each sends at once. They line up with a reply bar inset
 * 20px, as ChatComposer's is; `compact` lines them up with one inset 16px, as in a chat docked beside a design.
 */
export function ChatStarters({ prompts, onPick, compact }: { prompts: string[]; onPick: (text: string) => void; compact?: boolean }) {
  if (!prompts.length) return null;
  return (
    <div className={`w-full min-w-0 pt-1 pb-1 ${compact ? 'px-4' : 'max-w-[720px] mx-auto px-5'}`}>
      <div className="flex flex-wrap gap-1.5">
        {prompts.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPick(p)}
            className="max-w-full min-w-0 rounded-lg border border-border px-3 py-1 text-left text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

/** The wait after the person sends and before anything of the answer shows, a step smaller in a compact chat. */
export function ChatWaiting({ messages, busy, compact }: { messages: ChatPartsMessage[]; busy: boolean; compact?: boolean }) {
  if (!busy) return null;
  const last = messages[messages.length - 1];
  const showing = last?.role === 'assistant' && last.parts.some((p) =>
    p.type === 'step-start' ? false : p.type === 'reasoning' ? !!p.text?.trim() || p.state === 'streaming' : true);
  if (showing) return null;
  return (
    <div className={`flex items-center gap-2 py-2 text-muted-foreground ${compact ? 'text-xs' : 'text-sm'}`}>
      <Loader2 aria-hidden className={`shrink-0 animate-spin motion-reduce:animate-none ${compact ? 'size-4' : 'size-5'}`} />
      <span>Thinking…</span>
    </div>
  );
}

const isTool = (part: ChatPart) => part.type.startsWith('tool-') || part.type === 'dynamic-tool';
const toolOf = (part: ChatPart) => part.toolName ?? part.type.replace(/^tool-/, '');

/**
 * A message laid out from its parts. Text is markdown (`components` and `newTab` as for ChatAnswer); thinking and tool
 * parts gather into one ChatSteps until text, a card, something `after` a tool or a file interrupts, so a turn reads
 * chain, card, chain. A tool shows as a step named by `toolLabel`, unless `card` returns something for it: then the
 * card stands for it. `after` may add something after a tool's step or card, such as a link to what the tool made. A
 * data part (`data-…`) shows only what `card` returns for it, asked by the part's type. Tools the provider ran, and
 * parts it does not know, show nothing. `streaming` says whether the message is still coming: once it is not (it
 * finished, or the person stopped it), no step shows as under way.
 */
export function chatParts(message: ChatPartsMessage, o: {
  toolLabel: (tool: string) => string;
  card?: (part: ChatPart, tool: string, index: number) => React.ReactNode;
  after?: (part: ChatPart, tool: string, index: number) => React.ReactNode;
  components?: StreamdownProps['components'];
  newTab?: boolean;
  streaming?: boolean;
}): React.ReactNode[] {
  const live = o.streaming ?? true;
  const out: React.ReactNode[] = [];
  const steps: ChatStep[] = [];
  const flush = () => {
    if (!steps.length) return;
    out.push(<ChatSteps key={`${message.id}-steps-${steps[0].key}`} steps={[...steps]} />);
    steps.length = 0;
  };
  const push = (node: React.ReactNode) => { flush(); out.push(node); };
  const parts = message.parts;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part.type === 'text') {
      if (part.text?.trim()) push(<ChatAnswer key={`${message.id}-text-${i}`} components={o.components} newTab={o.newTab}>{part.text}</ChatAnswer>);
    } else if (part.type === 'reasoning') {
      // Consecutive thinking reads as one step, keyed by its first part so it keeps its state as more stream in; an
      // empty one shows only while it may still fill.
      const first = i;
      let text = part.text ?? '';
      let state = part.state;
      while (parts[i + 1]?.type === 'reasoning') { i++; text += parts[i].text ?? ''; state = parts[i].state; }
      const streaming = live && state === 'streaming';
      if (text.trim() || streaming) steps.push({ kind: 'thinking', key: `r-${first}`, text, streaming });
    } else if (isTool(part)) {
      const tool = toolOf(part);
      if (part.providerExecuted || tool === 'code_execution') continue;
      const card = o.card?.(part, tool, i);
      if (card) push(<div key={`${message.id}-card-${i}`} className="contents">{card}</div>);
      else steps.push({ kind: 'tool', key: `t-${i}`, label: o.toolLabel(tool), state: live || part.state?.startsWith('output') ? part.state ?? '' : 'stopped' });
      const after = o.after?.(part, tool, i);
      if (after) push(<div key={`${message.id}-after-${i}`} className="contents">{after}</div>);
    } else if (part.type.startsWith('data-')) {
      const card = o.card?.(part, part.type, i);
      if (card) push(<div key={`${message.id}-data-${i}`} className="contents">{card}</div>);
    } else if (part.type === 'file') {
      if (part.mediaType?.startsWith('image/')) {
        push(<img key={`${message.id}-file-${i}`} src={part.url} alt={part.filename || 'Image'} className="max-w-full rounded-lg" />);
      } else if (part.filename) {
        push(
          <span key={`${message.id}-file-${i}`} className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1.5 text-xs text-muted-foreground">
            <FileIcon aria-hidden className="size-3.5 shrink-0" />
            {part.filename}
          </span>,
        );
      }
    }
  }
  flush();
  return out;
}
