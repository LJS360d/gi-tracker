import { createSignal, createResource, Show, onMount, lazy, Suspense, For } from "solid-js";

const BetChart = lazy(() => import("./BetChart"));

const DISPLAY_NAME_KEY = "bets_display_name";

function getStoredDisplayName(): string {
  if (typeof localStorage === "undefined") return "";
  return localStorage.getItem(DISPLAY_NAME_KEY) ?? "";
}

type Question = { id: number; title: string; answerType: string; order: number };
type CountItem = { value: string; count: number };

const EMPTY_COUNTS: CountItem[] = [];

async function fetchQuestions(): Promise<Question[]> {
  const r = await fetch("/api/bets/questions");
  const data = await r.json();
  if (!r.ok) throw new Error(data.error ?? "Failed to load questions");
  return data.questions;
}

async function fetchCounts(): Promise<Record<number, CountItem[]>> {
  const r = await fetch("/api/bets/answers");
  const data = await r.json();
  if (!r.ok) throw new Error(data.error ?? "Failed to load counts");
  return data.countsByQuestionId ?? {};
}

export default function BetsPage() {
  const [displayName, setDisplayName] = createSignal("");
  onMount(() => setDisplayName(getStoredDisplayName()));

  const [questionsResource] = createResource(fetchQuestions);
  const [countsResource, { refetch: refetchCounts }] = createResource(fetchCounts);
  const [submitting, setSubmitting] = createSignal<number | null>(null);
  const [error, setError] = createSignal<string | null>(null);

  const questions = () => questionsResource() ?? [];
  const countsByQ = () => countsResource() ?? {};

  function persistName(name: string) {
    setDisplayName(name);
    try {
      localStorage.setItem(DISPLAY_NAME_KEY, name);
    } catch (_) { }
  }

  async function submit(questionId: number, value: string) {
    setError(null);
    setSubmitting(questionId);
    try {
      const name = displayName().trim();
      if (!name) return;
      const r = await fetch("/api/bets/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, displayName: name, value }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Submit failed");
      refetchCounts();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div class="w-full px-4 py-4 md:px-6 md:py-6 md:max-w-2xl md:mx-auto space-y-5 md:space-y-6">
      <h1 class="text-xl font-light text-neutral-100 md:text-2xl">Previsioni</h1>

      <Show when={questionsResource.error}>
        <p class="text-red-400">{questionsResource.error?.message}</p>
      </Show>

      <Show when={questions().length === 0 && !questionsResource.loading}>
        <p class="text-neutral-400">Nessuna domanda al momento.</p>
      </Show>

      <Show when={error()}>
        <p class="text-red-400 text-sm">{error()}</p>
      </Show>

      <div class="space-y-1.5">
        <label for="bets-display-name" class="block text-sm text-neutral-400">Nome (usato per tutte le previsioni)</label>
        <input
          id="bets-display-name"
          type="text"
          placeholder="Come vuoi essere chiamato (es. Mario)"
          class="w-full min-h-[48px] px-4 py-3 text-base rounded-xl bg-neutral-800 border border-neutral-600 text-neutral-100 placeholder-neutral-500 touch-manipulation"
          value={displayName()}
          onInput={(e) => persistName(e.currentTarget.value)}
          maxLength={100}
        />
      </div>

      <For each={questions()}>
        {(q) => (
          <QuestionCard
            question={q}
            counts={countsByQ()[q.id] ?? EMPTY_COUNTS}
            displayName={displayName()}
            submitting={submitting() === q.id}
            onSubmit={submit}
          />
        )}
      </For>
    </div>
  );
}

type CardProps = {
  question: Question;
  counts: CountItem[];
  displayName: string;
  submitting: boolean;
  onSubmit: (questionId: number, value: string) => void;
};

function QuestionCard(props: CardProps) {
  const [value, setValue] = createSignal("");

  const isBool = () => props.question.answerType === "boolean";
  const isNumber = () => props.question.answerType === "number";

  function handleSubmit(e: Event) {
    e.preventDefault();
    let val = value().trim();
    if (isBool()) val = val.toLowerCase() === "sì" || val.toLowerCase() === "si" || val.toLowerCase() === "yes" ? "true" : "false";
    props.onSubmit(props.question.id, val);
    setValue("");
  }

  const inputClass = "w-full min-h-[48px] px-4 py-3 text-base rounded-xl bg-neutral-800 border border-neutral-600 text-neutral-100 placeholder-neutral-500 touch-manipulation";
  const btnClass = "w-full min-h-[48px] px-4 py-3 text-base rounded-xl bg-neutral-700 active:bg-neutral-600 disabled:opacity-50 disabled:pointer-events-none text-neutral-100 touch-manipulation md:hover:bg-neutral-600";

  return (
    <article class="rounded-xl border border-neutral-800 bg-[#1a1a1a] overflow-hidden">
      <div class="p-4 md:p-5">
        <h2 class="text-lg font-medium text-neutral-100">{props.question.title}</h2>

        <div class="h-44 md:h-48 mt-3 rounded-lg">
          <Suspense fallback={<div class="w-full h-full flex items-center justify-center skeleton" />}>
            <BetChart counts={props.counts} class="w-full h-full" />
          </Suspense>
        </div>

        <form onSubmit={handleSubmit} class="mt-4 flex flex-col gap-3">
          <Show when={isBool()}>
            <input
              type="text"
              placeholder="Sì / No"
              class={inputClass}
              value={value()}
              onInput={(e) => setValue(e.currentTarget.value)}
            />
          </Show>
          <Show when={isNumber()}>
            <input
              type="number"
              placeholder="Numero (es. giorni)"
              class={inputClass}
              value={value()}
              onInput={(e) => setValue(e.currentTarget.value)}
            />
          </Show>
          <Show when={!isBool() && !isNumber()}>
            <input
              type="text"
              placeholder="La tua risposta"
              class={inputClass}
              value={value()}
              onInput={(e) => setValue(e.currentTarget.value)}
            />
          </Show>
          <button type="submit" class={btnClass} disabled={props.submitting || !props.displayName.trim()}>
            {props.submitting ? "Invio…" : "Invia previsione"}
          </button>
        </form>
      </div>
    </article>
  );
}
