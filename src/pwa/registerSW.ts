const APP_CACHE_PREFIX = "eat-first-";
const DEV_RESET_KEY = "eat-first:dev-sw-reset";

async function removeDevelopmentServiceWorker(): Promise<void> {
  const wasControlled = Boolean(navigator.serviceWorker.controller);
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((registration) => registration.unregister()));

  if ("caches" in window) {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter((name) => name.startsWith(APP_CACHE_PREFIX))
        .map((name) => caches.delete(name))
    );
  }

  // An unregistered worker can keep controlling the current document until
  // the next navigation. Reload once, never in a loop, to detach it cleanly.
  if (wasControlled && sessionStorage.getItem(DEV_RESET_KEY) !== "done") {
    sessionStorage.setItem(DEV_RESET_KEY, "done");
    window.location.reload();
  }
}

export function registerSW(): void {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  if (import.meta.env.DEV) {
    window.addEventListener(
      "load",
      () => {
        void removeDevelopmentServiceWorker();
      },
      { once: true }
    );
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // PWA support is progressive; the app should still run without SW.
    });
  }, { once: true });
}
