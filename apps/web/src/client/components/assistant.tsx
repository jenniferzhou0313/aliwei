"use client";

import {
  AssistantRuntimeProvider,
  useAuiState,
} from "@assistant-ui/react";
import { AssistantChatTransport, useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { lastAssistantMessageIsCompleteWithToolCalls, type UIMessage } from "ai";
import { Thread } from "@aliwei/ui/assistant-ui/thread";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@aliwei/ui/primitives/sidebar";
import { Separator } from "@aliwei/ui/primitives/separator";
import { cn } from "@aliwei/ui/cn";
import {
  FileSearchIcon,
  LanguagesIcon,
  NotebookPenIcon,
  TargetIcon,
  type LucideIcon,
} from "lucide-react";
import type { Agent, AgentId, ThreadMeta } from "@aliwei/domain/types";
import { AGENTS, findAgent } from "@aliwei/domain/agents";
import { ThreadContext } from "@/client/contexts/thread-context";
import { ThreadListSidebar } from "@/client/components/threadlist-sidebar";
import { AskUserToolUI } from "@aliwei/ui/assistant-ui/ask-user-tool";
import { apiFetch, apiUrl } from "@/client/lib/api";
import { useCallback, useContext, useEffect, useRef, useState, type FC } from "react";

function ThreadCompletionDetector({ onComplete }: { onComplete: () => void }) {
  const isRunning = useAuiState((s) => s.thread.isRunning);
  const prevRef = useRef(false);

  useEffect(() => {
    if (prevRef.current && !isRunning) {
      onComplete();
    }
    prevRef.current = isRunning;
  }, [isRunning, onComplete]);

  return null;
}

const AGENT_ICONS: Record<AgentId, LucideIcon> = {
  jargon: LanguagesIcon,
  weekly: NotebookPenIcon,
  okr: TargetIcon,
  review: FileSearchIcon,
  start: LanguagesIcon,   // start never renders an icon in the toolbar, placeholder only
};

const AgentWelcome: FC = () => {
  const { activeAgent } = useContext(ThreadContext);

  if (!activeAgent) {
    return (
      <div className="flex flex-col items-center gap-2 px-4 text-center">
        <h1 className="text-3xl font-semibold tracking-normal">阿里职场 AI 助手</h1>
        <p className="text-muted-foreground text-sm">周报、OKR、复盘、黑话翻译，一个对话搞定</p>
      </div>
    );
  }

  return (
    <div className="flex max-w-xl flex-col items-center gap-3 px-4 text-center">
      {(() => {
        const Icon = AGENT_ICONS[activeAgent.id];
        return <Icon aria-hidden="true" className="h-12 w-12 shrink-0" />;
      })()}
      <h2 className="text-xl font-semibold">{activeAgent.label}</h2>
      <p className="text-muted-foreground whitespace-pre-line text-sm leading-relaxed">
        {activeAgent.starter}
      </p>
    </div>
  );
};

function AgentButtons() {
  const { activeAgent, newThread } = useContext(ThreadContext);

  return (
    <div className="mx-auto grid w-full max-w-[44rem] grid-cols-2 gap-2 px-1 sm:grid-cols-4">
      {AGENTS.map((agent) => (
        <button
          key={agent.id}
          type="button"
          onClick={() => newThread(agent)}
          className={cn(
            "flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 py-2.5",
            "text-center text-sm font-medium transition-colors",
            activeAgent?.id === agent.id
              ? "border-primary bg-primary/10 text-primary"
              : "border-border/70 bg-card/70 text-card-foreground hover:bg-accent hover:text-accent-foreground",
          )}
        >
          {(() => {
            const Icon = AGENT_ICONS[agent.id];
            return <Icon aria-hidden="true" className="h-6 w-6 shrink-0" />;
          })()}
          <span>{agent.label}</span>
        </button>
      ))}
    </div>
  );
}

type ChatViewProps = {
  threadId: string;
  initialMessages: UIMessage[];
  activeAgent: Agent | null;
  onMessagesChanged: () => void;
};

function ChatView({ threadId, initialMessages, activeAgent, onMessagesChanged }: ChatViewProps) {
  const runtime = useChatRuntime({
    messages: initialMessages,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    transport: new AssistantChatTransport({
      api: apiUrl("/chat"),
      credentials: "include",
      body: {
        threadId,
        agentId: activeAgent?.id ?? null,
      },
    }),
  });

  const stableOnMessagesChanged = useCallback(
    () => onMessagesChanged(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ThreadCompletionDetector onComplete={stableOnMessagesChanged} />
      <AskUserToolUI />
      <Thread components={{ Welcome: AgentWelcome, ComposerFooter: AgentButtons }} />
    </AssistantRuntimeProvider>
  );
}

type ThreadState = {
  id: string;
  messages: UIMessage[];
};

export const Assistant: FC = () => {
  const [thread, setThread] = useState<ThreadState>(() => ({
    id: crypto.randomUUID(),
    messages: [],
  }));
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const [threads, setThreads] = useState<ThreadMeta[]>([]);

  const refreshThreads = useCallback(async () => {
    try {
      const res = await apiFetch("/threads");
      if (res.ok) setThreads(await res.json());
    } catch {
      // ignore network errors — stale list is fine
    }
  }, []);

  useEffect(() => {
    refreshThreads();
  }, [refreshThreads]);

  const newThread = useCallback((agent?: Agent) => {
    setThread({ id: crypto.randomUUID(), messages: [] });
    setActiveAgent(agent ?? null);
  }, []);

  const switchToThread = useCallback(
    async (threadId: string) => {
      const res = await apiFetch(`/threads/${threadId}/messages`);
      const msgs: UIMessage[] = res.ok ? await res.json() : [];
      setThread({ id: threadId, messages: msgs });

      const meta = threads.find((t) => t.id === threadId);
      setActiveAgent(findAgent(meta?.agentId));
    },
    [threads],
  );

  const deleteThread = useCallback(
    async (threadId: string) => {
      await apiFetch(`/threads/${threadId}`, { method: "DELETE" });
      if (threadId === thread.id) newThread();
      await refreshThreads();
    },
    [thread.id, newThread, refreshThreads],
  );

  const requestAgentSwitch = useCallback(() => {
    // Implemented in Task 7
  }, []);

  const contextValue = {
    threads,
    activeThreadId: thread.id,
    activeAgent,
    newThread,
    switchToThread,
    deleteThread,
    requestAgentSwitch,
  };

  return (
    <ThreadContext.Provider value={contextValue}>
      <SidebarProvider>
        <div className="flex h-dvh w-full pr-0.5">
          <ThreadListSidebar />
          <SidebarInset>
            <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger />
              <Separator orientation="vertical" className="border-border mr-2 h-4" />
              <span className="text-sm font-medium text-muted-foreground">阿里职场 AI 助手</span>
            </header>
            <div className="flex flex-col h-[calc(100dvh-3.5rem)]">
              <div className="flex-1 overflow-hidden">
                <ChatView
                  key={thread.id}
                  threadId={thread.id}
                  initialMessages={thread.messages}
                  activeAgent={activeAgent}
                  onMessagesChanged={refreshThreads}
                />
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ThreadContext.Provider>
  );
};
