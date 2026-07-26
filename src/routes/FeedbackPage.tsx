import {
  Check,
  Clipboard,
  Download,
  MessageSquareText,
  RotateCcw,
  Share2
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { useAppState } from "../hooks/useAppState";
import { useLocale } from "../hooks/useLocale";
import { FEEDBACK_DRAFT_KEY } from "../lib/constants";
import { cx } from "../lib/ui";

const feedbackSteps = [
  "added_food",
  "understood_priorities",
  "handled_food",
  "used_frozen_area",
  "generated_recipe",
  "updated_after_cooking"
] as const;
type FeedbackStep = (typeof feedbackSteps)[number];

const painPoints = [
  "none",
  "adding",
  "priorities",
  "actions",
  "freezing",
  "recipes",
  "cooking_update",
  "other"
] as const;
type PainPoint = (typeof painPoints)[number];

const returnIntents = ["yes", "maybe", "no"] as const;
type ReturnIntent = (typeof returnIntents)[number];

interface FeedbackDraft {
  steps: FeedbackStep[];
  painPoint: PainPoint;
  helpful: number;
  returnIntent: ReturnIntent | "";
  note: string;
}

function loadDraft(observedSteps: FeedbackStep[]): FeedbackDraft {
  const fallback: FeedbackDraft = {
    steps: observedSteps,
    painPoint: "none",
    helpful: 0,
    returnIntent: "",
    note: ""
  };
  try {
    const parsed = JSON.parse(localStorage.getItem(FEEDBACK_DRAFT_KEY) ?? "") as Partial<FeedbackDraft>;
    const steps = Array.isArray(parsed.steps)
      ? parsed.steps.filter((step): step is FeedbackStep =>
          feedbackSteps.includes(step as FeedbackStep)
        )
      : observedSteps;
    return {
      steps,
      painPoint: painPoints.includes(parsed.painPoint as PainPoint)
        ? (parsed.painPoint as PainPoint)
        : "none",
      helpful:
        typeof parsed.helpful === "number" && parsed.helpful >= 1 && parsed.helpful <= 5
          ? parsed.helpful
          : 0,
      returnIntent: returnIntents.includes(parsed.returnIntent as ReturnIntent)
        ? (parsed.returnIntent as ReturnIntent)
        : "",
      note: typeof parsed.note === "string" ? parsed.note.slice(0, 600) : ""
    };
  } catch {
    return fallback;
  }
}

export function FeedbackPage(): JSX.Element {
  const { state } = useAppState();
  const { locale, t } = useLocale();
  const observedSteps = useMemo<FeedbackStep[]>(() => {
    const actions = state.foods.flatMap((food) => food.actionHistory);
    const steps: FeedbackStep[] = [];
    if (state.foods.length > 0) steps.push("added_food");
    if (actions.some((action) =>
      ["partially_used", "eaten", "frozen", "discarded"].includes(action.type)
    )) steps.push("handled_food");
    if (actions.some((action) => action.type === "frozen" || action.type === "restored")) {
      steps.push("used_frozen_area");
    }
    if (state.recipeHistory.length > 0) steps.push("generated_recipe");
    if (state.recipeHistory.some((entry) => entry.cooked)) steps.push("updated_after_cooking");
    return steps;
  }, [state.foods, state.recipeHistory]);
  const [draft, setDraft] = useState<FeedbackDraft>(() => loadDraft(observedSteps));
  const [summary, setSummary] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(FEEDBACK_DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // The form remains usable even if private browsing blocks local storage.
    }
  }, [draft]);

  function toggleStep(step: FeedbackStep) {
    setDraft((current) => ({
      ...current,
      steps: current.steps.includes(step)
        ? current.steps.filter((item) => item !== step)
        : [...current.steps, step]
    }));
  }

  function buildSummary(): string {
    const completed =
      draft.steps.length > 0
        ? draft.steps.map((step) => t.feedbackForm.steps[step]).join(t.recipe.summarySeparator)
        : t.feedbackForm.noneCompleted;
    return [
      t.feedbackForm.summaryTitle,
      `${t.feedbackForm.summaryVersion}: V0.11.1`,
      `${t.feedbackForm.summaryDate}: ${new Date().toLocaleDateString(locale)}`,
      `${t.feedbackForm.summarySteps}: ${completed}`,
      `${t.feedbackForm.summaryPain}: ${t.feedbackForm.painPoints[draft.painPoint]}`,
      `${t.feedbackForm.summaryHelpful}: ${draft.helpful || "-"}/5`,
      `${t.feedbackForm.summaryReturn}: ${
        draft.returnIntent ? t.feedbackForm.returnIntents[draft.returnIntent] : "-"
      }`,
      `${t.feedbackForm.summaryNote}: ${draft.note.trim() || "-"}`
    ].join("\n");
  }

  function generateSummary() {
    setSummary(buildSummary());
    setMessage(t.feedbackForm.generated);
  }

  async function copySummary() {
    const value = summary || buildSummary();
    setSummary(value);
    try {
      await navigator.clipboard.writeText(value);
      setMessage(t.feedbackForm.copied);
    } catch {
      setMessage(t.feedbackForm.copyFallback);
    }
  }

  async function shareSummary() {
    const value = summary || buildSummary();
    setSummary(value);
    if (!navigator.share) {
      await copySummary();
      return;
    }
    try {
      await navigator.share({ title: t.feedbackForm.summaryTitle, text: value });
      setMessage(t.feedbackForm.shared);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      setMessage(t.feedbackForm.shareFallback);
    }
  }

  function downloadSummary() {
    const value = summary || buildSummary();
    setSummary(value);
    const blob = new Blob([value], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `eat-first-feedback-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage(t.feedbackForm.downloaded);
  }

  function resetDraft() {
    localStorage.removeItem(FEEDBACK_DRAFT_KEY);
    setDraft({
      steps: observedSteps,
      helpful: 0,
      returnIntent: "",
      painPoint: "none",
      note: ""
    });
    setSummary("");
    setMessage("");
  }

  const ready = draft.helpful > 0 && Boolean(draft.returnIntent);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={t.feedbackForm.eyebrow}
        title={t.feedbackForm.title}
        body={t.feedbackForm.body}
        action={
          <Link to="/settings" className="text-xs font-black text-leaf-700">
            {t.nav.settings}
          </Link>
        }
      />

      <section className="fresh-card p-4">
        <h2 className="font-editorial text-lg font-black text-ink">
          {t.feedbackForm.stepsTitle}
        </h2>
        <p className="mt-1 text-xs font-medium leading-5 text-ink-muted">
          {t.feedbackForm.stepsBody}
        </p>
        <div className="mt-3 space-y-2">
          {feedbackSteps.map((step) => (
            <label
              key={step}
              className="flex min-h-11 items-center gap-3 rounded-[0.9rem] border border-paper-line bg-paper-soft px-3 text-sm font-bold text-ink"
            >
              <input
                type="checkbox"
                checked={draft.steps.includes(step)}
                onChange={() => toggleStep(step)}
                className="h-4 w-4 accent-leaf-700"
              />
              {t.feedbackForm.steps[step]}
            </label>
          ))}
        </div>
      </section>

      <section className="fresh-card space-y-5 p-4">
        <label className="block">
          <span className="mb-2 block font-editorial text-lg font-black text-ink">
            {t.feedbackForm.painTitle}
          </span>
          <select
            value={draft.painPoint}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                painPoint: event.target.value as PainPoint
              }))
            }
            className="fresh-field"
          >
            {painPoints.map((point) => (
              <option key={point} value={point}>{t.feedbackForm.painPoints[point]}</option>
            ))}
          </select>
        </label>

        <fieldset>
          <legend className="font-editorial text-lg font-black text-ink">
            {t.feedbackForm.helpfulTitle}
          </legend>
          <div className="mt-2 grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                aria-pressed={draft.helpful === rating}
                onClick={() => setDraft((current) => ({ ...current, helpful: rating }))}
                className={cx(
                  "min-h-11 rounded-[0.8rem] border text-sm font-black",
                  draft.helpful === rating
                    ? "border-ink bg-ink text-paper"
                    : "border-paper-line bg-paper-soft text-ink-muted"
                )}
              >
                {rating}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="font-editorial text-lg font-black text-ink">
            {t.feedbackForm.returnTitle}
          </legend>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {returnIntents.map((intent) => (
              <button
                key={intent}
                type="button"
                aria-pressed={draft.returnIntent === intent}
                onClick={() =>
                  setDraft((current) => ({ ...current, returnIntent: intent }))
                }
                className={cx(
                  "min-h-11 rounded-[0.8rem] border px-2 text-xs font-black",
                  draft.returnIntent === intent
                    ? "border-ink bg-ink text-paper"
                    : "border-paper-line bg-paper-soft text-ink-muted"
                )}
              >
                {t.feedbackForm.returnIntents[intent]}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="block">
          <span className="mb-2 block font-editorial text-lg font-black text-ink">
            {t.feedbackForm.noteTitle}
          </span>
          <textarea
            value={draft.note}
            maxLength={600}
            rows={5}
            onChange={(event) =>
              setDraft((current) => ({ ...current, note: event.target.value }))
            }
            placeholder={t.feedbackForm.notePlaceholder}
            className="fresh-field resize-y"
          />
        </label>
      </section>

      <section className="fresh-card p-4">
        <div className="flex items-start gap-3">
          <MessageSquareText className="mt-0.5 h-5 w-5 shrink-0 text-leaf-700" aria-hidden />
          <div>
            <h2 className="font-editorial text-lg font-black text-ink">
              {t.feedbackForm.shareTitle}
            </h2>
            <p className="mt-1 text-xs font-medium leading-5 text-ink-muted">
              {t.feedbackForm.privacy}
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled={!ready}
          onClick={generateSummary}
          className="fresh-button-primary mt-4 w-full disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Check className="mr-2 inline h-4 w-4" aria-hidden />
          {t.feedbackForm.generate}
        </button>

        {summary ? (
          <div className="mt-4 space-y-3">
            <textarea
              readOnly
              value={summary}
              rows={10}
              aria-label={t.feedbackForm.summaryTitle}
              className="fresh-field resize-y text-xs leading-5"
            />
            <div className="grid grid-cols-3 gap-2">
              <button type="button" onClick={() => void shareSummary()} className="fresh-button-primary">
                <Share2 className="mr-1 inline h-4 w-4" aria-hidden />
                {t.feedbackForm.share}
              </button>
              <button type="button" onClick={() => void copySummary()} className="fresh-button-secondary">
                <Clipboard className="mr-1 inline h-4 w-4" aria-hidden />
                {t.feedbackForm.copy}
              </button>
              <button type="button" onClick={downloadSummary} className="fresh-button-secondary">
                <Download className="mr-1 inline h-4 w-4" aria-hidden />
                {t.feedbackForm.download}
              </button>
            </div>
          </div>
        ) : null}

        {message ? (
          <p role="status" className="mt-3 text-sm font-bold leading-5 text-leaf-700">
            {message}
          </p>
        ) : null}

        <button
          type="button"
          onClick={resetDraft}
          className="mt-4 flex min-h-10 w-full items-center justify-center gap-2 text-xs font-black text-ink-muted"
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
          {t.feedbackForm.reset}
        </button>
      </section>
    </div>
  );
}
