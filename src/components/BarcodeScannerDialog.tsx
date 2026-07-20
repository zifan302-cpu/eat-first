import type { IScannerControls } from "@zxing/browser";
import { Camera, Keyboard, LoaderCircle, ScanLine, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Messages } from "../i18n/en-GB";
import type { AddFoodInput } from "../hooks/useFoodActions";
import type { LocaleCode } from "../types/food";
import { lookupBarcodeProduct, parseScannedBarcode } from "../lib/barcode";

interface BarcodeScannerDialogProps {
  open: boolean;
  locale: LocaleCode;
  t: Messages;
  onClose: () => void;
  onUseDraft: (draft: Partial<AddFoodInput>) => void;
}

type ScanStatus = "idle" | "camera" | "lookup" | "ready" | "not_found" | "error";

export function BarcodeScannerDialog({
  open,
  locale,
  t,
  onClose,
  onUseDraft
}: BarcodeScannerDialogProps): JSX.Element {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const lookupControllerRef = useRef<AbortController | null>(null);
  const handledCodeRef = useRef<string | null>(null);
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [manualCode, setManualCode] = useState("");
  const [draft, setDraft] = useState<Partial<AddFoodInput> | null>(null);

  const stopCamera = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
  }, []);

  const inspectCode = useCallback(
    async (rawCode: string) => {
      const parsed = parseScannedBarcode(rawCode);
      if (!parsed) {
        setStatus("error");
        return;
      }
      if (handledCodeRef.current === parsed.gtin) return;
      handledCodeRef.current = parsed.gtin;
      stopCamera();
      setManualCode(parsed.gtin);
      setStatus("lookup");

      lookupControllerRef.current?.abort();
      const controller = new AbortController();
      lookupControllerRef.current = controller;
      try {
        const product = await lookupBarcodeProduct(parsed.gtin, locale, controller.signal);
        const nextDraft: Partial<AddFoodInput> = {
          name: product?.name ?? "",
          category: product?.category ?? "other",
          quantityText: product?.quantityText,
          barcode: parsed.gtin,
          source: "barcode",
          dateLabelType: parsed.dateLabelType ?? "none",
          labelDate: parsed.labelDate
        };
        setDraft(nextDraft);
        setStatus(product ? "ready" : "not_found");
      } catch (error) {
        if ((error as Error).name !== "AbortError") setStatus("error");
      }
    },
    [locale, stopCamera]
  );

  const startCamera = useCallback(async () => {
    stopCamera();
    handledCodeRef.current = null;
    setDraft(null);
    setStatus("camera");
    const video = videoRef.current;
    if (!video) return;

    try {
      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      const reader = new BrowserMultiFormatReader(undefined, { delayBetweenScanAttempts: 150 });
      controlsRef.current = await reader.decodeFromConstraints(
        { video: { facingMode: { ideal: "environment" } }, audio: false },
        video,
        (result) => {
          if (result) void inspectCode(result.getText());
        }
      );
    } catch {
      setStatus("error");
    }
  }, [inspectCode, stopCamera]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      setStatus("idle");
      setDraft(null);
      setManualCode("");
      handledCodeRef.current = null;
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(
    () => () => {
      stopCamera();
      lookupControllerRef.current?.abort();
    },
    [stopCamera]
  );

  function close() {
    stopCamera();
    lookupControllerRef.current?.abort();
    onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="barcode-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      className="m-auto max-h-[90vh] w-[calc(100%_-_2rem)] max-w-sm overflow-y-auto rounded-[1.6rem] border border-ink/20 bg-paper-soft p-0 text-ink shadow-lift backdrop:bg-ink/45"
    >
      <header className="border-b border-paper-line bg-ink p-5 text-paper">
        <div className="flex items-center justify-between gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-[0.9rem] bg-paper/10 text-[#D8CFAE]">
            <ScanLine className="h-5 w-5" aria-hidden />
          </span>
          <button
            type="button"
            onClick={close}
            aria-label={t.actions.close}
            className="grid h-10 w-10 place-items-center rounded-full text-paper/75 hover:bg-paper/10"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <p className="mt-4 text-[0.65rem] font-black uppercase tracking-[0.18em] text-[#D8CFAE]">
          {t.barcode.eyebrow}
        </p>
        <h2 id="barcode-dialog-title" className="mt-2 font-editorial text-2xl font-black leading-tight">
          {t.barcode.dialogTitle}
        </h2>
        <p className="mt-2 text-sm font-medium leading-6 text-paper/72">{t.barcode.dialogBody}</p>
      </header>

      <div className="space-y-4 p-5">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[1.2rem] bg-ink">
          <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
          {status !== "camera" ? (
            <div className="absolute inset-0 grid place-items-center p-6 text-center text-paper/72">
              <Camera className="mx-auto h-8 w-8" aria-hidden />
              <p className="mt-3 text-sm font-bold">{t.barcode.cameraHint}</p>
            </div>
          ) : (
            <div className="pointer-events-none absolute inset-[16%] rounded-[1rem] border-2 border-[#E6B84B] shadow-[0_0_0_999px_rgba(28,42,34,0.28)]" />
          )}
        </div>

        <button type="button" onClick={() => void startCamera()} className="fresh-button-primary w-full">
          <Camera className="mr-2 inline h-4 w-4" aria-hidden />
          {status === "camera" ? t.barcode.scanning : t.barcode.startCamera}
        </button>

        <div className="flex items-center gap-3 text-xs font-black text-ink-muted">
          <span className="h-px flex-1 bg-paper-line" />
          {t.barcode.orManual}
          <span className="h-px flex-1 bg-paper-line" />
        </div>

        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            handledCodeRef.current = null;
            void inspectCode(manualCode);
          }}
        >
          <label className="min-w-0 flex-1">
            <span className="sr-only">{t.barcode.codeLabel}</span>
            <input
              inputMode="numeric"
              autoComplete="off"
              value={manualCode}
              onChange={(event) => setManualCode(event.target.value)}
              placeholder={t.barcode.codePlaceholder}
              className="fresh-field font-mono"
            />
          </label>
          <button type="submit" className="fresh-button-secondary px-3" aria-label={t.barcode.lookup}>
            <Keyboard className="h-4 w-4" aria-hidden />
          </button>
        </form>

        {status === "lookup" ? (
          <p className="flex items-center gap-2 rounded-[1rem] bg-leaf-50 p-3 text-sm font-bold text-leaf-700">
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> {t.barcode.lookingUp}
          </p>
        ) : null}

        {status === "ready" && draft ? (
          <div className="rounded-[1rem] border border-leaf-500/25 bg-leaf-50 p-4">
            <p className="text-xs font-black uppercase tracking-wider text-leaf-700">{t.barcode.found}</p>
            <p className="mt-1 font-editorial text-lg font-black text-ink">{draft.name}</p>
            {draft.quantityText ? <p className="mt-1 text-sm text-ink-muted">{draft.quantityText}</p> : null}
          </div>
        ) : null}

        {status === "not_found" && draft ? (
          <p className="rounded-[1rem] border border-[#E6B84B]/40 bg-[#F3E4CD] p-3 text-sm font-bold text-[#70431C]">
            {t.barcode.notFound}
          </p>
        ) : null}

        {status === "error" ? (
          <p className="rounded-[1rem] border border-tomato/20 bg-[#F3DDD3] p-3 text-sm font-bold text-tomato">
            {t.barcode.error}
          </p>
        ) : null}

        {draft ? (
          <button
            type="button"
            onClick={() => {
              onUseDraft(draft);
              close();
            }}
            className="fresh-button-primary w-full"
          >
            {t.barcode.useDraft}
          </button>
        ) : null}

        <p className="text-xs font-semibold leading-5 text-ink-muted">{t.barcode.boundary}</p>
      </div>
    </dialog>
  );
}
