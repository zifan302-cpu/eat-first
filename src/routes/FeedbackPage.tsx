import {
  CheckCircle2,
  ExternalLink,
  LoaderCircle,
  MessageSquareText,
  ShieldCheck
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { useAppState } from "../hooks/useAppState";
import { useLocale } from "../hooks/useLocale";
import {
  buildTallyEmbedUrl,
  buildTallyPublicUrl,
  collectObservedFeedbackSteps,
  isTallyEvent,
  type FeedbackInstallMode
} from "../lib/feedback";

declare global {
  interface Window {
    Tally?: {
      loadEmbeds: () => void;
    };
  }
}

type EmbedStatus = "loading" | "ready" | "slow" | "submitted";

function getInstallMode(): FeedbackInstallMode {
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches ||
    navigatorWithStandalone.standalone
    ? "standalone"
    : "browser";
}

export function FeedbackPage(): JSX.Element {
  const { state } = useAppState();
  const { locale, t } = useLocale();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const installMode = useMemo(getInstallMode, []);
  const observedSteps = useMemo(
    () => collectObservedFeedbackSteps(state),
    [state.foods, state.recipeHistory]
  );
  const feedbackContext = useMemo(
    () => ({ locale, installMode, observedSteps }),
    [installMode, locale, observedSteps]
  );
  const embedUrl = useMemo(
    () => buildTallyEmbedUrl(feedbackContext),
    [feedbackContext]
  );
  const publicUrl = useMemo(
    () => buildTallyPublicUrl(feedbackContext),
    [feedbackContext]
  );
  const [status, setStatus] = useState<EmbedStatus>("loading");

  useEffect(() => {
    setStatus("loading");

    const loadEmbed = () => {
      if (window.Tally) {
        window.Tally.loadEmbeds();
        return;
      }

      const iframe = iframeRef.current;
      const fallbackUrl = iframe?.dataset.tallySrc;
      if (iframe && fallbackUrl && !iframe.src) iframe.src = fallbackUrl;
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://tally.so") return;
      if (isTallyEvent(event.data, "Tally.FormLoaded")) setStatus("ready");
      if (isTallyEvent(event.data, "Tally.FormSubmitted")) {
        setStatus("submitted");
        try {
          localStorage.setItem(
            "eat-first:v1:feedback-submitted-at",
            new Date().toISOString()
          );
        } catch {
          // Submission still succeeds if private browsing blocks local storage.
        }
      }
    };

    window.addEventListener("message", handleMessage);

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://tally.so/widgets/embed.js"]'
    );
    if (window.Tally) {
      loadEmbed();
    } else if (existingScript) {
      existingScript.addEventListener("load", loadEmbed, { once: true });
      existingScript.addEventListener("error", loadEmbed, { once: true });
    } else {
      const script = document.createElement("script");
      script.src = "https://tally.so/widgets/embed.js";
      script.async = true;
      script.onload = loadEmbed;
      script.onerror = loadEmbed;
      document.body.appendChild(script);
    }

    const slowTimer = window.setTimeout(() => {
      setStatus((current) => (current === "loading" ? "slow" : current));
    }, 10_000);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.clearTimeout(slowTimer);
      existingScript?.removeEventListener("load", loadEmbed);
      existingScript?.removeEventListener("error", loadEmbed);
    };
  }, [embedUrl]);

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
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-leaf-700" aria-hidden />
          <div>
            <h2 className="font-editorial text-lg font-black text-ink">
              {t.feedbackForm.privacyTitle}
            </h2>
            <p className="mt-1 text-xs font-medium leading-5 text-ink-muted">
              {t.feedbackForm.privacyBody}
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-[0.7rem] font-black text-ink-muted">
          <span className="rounded-full bg-paper-soft px-3 py-1.5">
            {t.feedbackForm.contextVersion}
          </span>
          <span className="rounded-full bg-paper-soft px-3 py-1.5">{locale}</span>
          <span className="rounded-full bg-paper-soft px-3 py-1.5">
            {t.feedbackForm.installModes[installMode]}
          </span>
          <span className="rounded-full bg-paper-soft px-3 py-1.5">
            {t.feedbackForm.observedCount.replace(
              "{count}",
              String(observedSteps.length)
            )}
          </span>
        </div>
      </section>

      {locale === "en-GB" ? (
        <p className="rounded-[1rem] border border-gold-200 bg-gold-50 px-4 py-3 text-xs font-bold leading-5 text-ink-muted">
          {t.feedbackForm.pilotLanguage}
        </p>
      ) : null}

      {status === "submitted" ? (
        <section role="status" className="fresh-card border-leaf-200 bg-leaf-50 p-5">
          <CheckCircle2 className="h-7 w-7 text-leaf-700" aria-hidden />
          <h2 className="mt-3 font-editorial text-xl font-black text-ink">
            {t.feedbackForm.submittedTitle}
          </h2>
          <p className="mt-1 text-sm font-medium leading-6 text-ink-muted">
            {t.feedbackForm.submittedBody}
          </p>
        </section>
      ) : (
        <section className="fresh-card overflow-hidden p-2">
          <div className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-ink-muted">
            {status === "loading" ? (
              <LoaderCircle className="h-4 w-4 animate-spin text-leaf-700" aria-hidden />
            ) : (
              <MessageSquareText className="h-4 w-4 text-leaf-700" aria-hidden />
            )}
            <span>
              {status === "slow"
                ? t.feedbackForm.loadSlow
                : status === "ready"
                  ? t.feedbackForm.loaded
                  : t.feedbackForm.loading}
            </span>
          </div>
          <iframe
            key={embedUrl}
            ref={iframeRef}
            data-tally-src={embedUrl}
            src={embedUrl}
            loading="lazy"
            width="100%"
            height="820"
            frameBorder="0"
            marginHeight={0}
            marginWidth={0}
            title={t.feedbackForm.embedTitle}
            className="min-h-[46rem] w-full rounded-[1rem] bg-white"
          />
        </section>
      )}

      <a
        href={publicUrl}
        target="_blank"
        rel="noreferrer"
        className="fresh-button-secondary flex w-full items-center justify-center gap-2"
      >
        {t.feedbackForm.openExternal}
        <ExternalLink className="h-4 w-4" aria-hidden />
      </a>
    </div>
  );
}
