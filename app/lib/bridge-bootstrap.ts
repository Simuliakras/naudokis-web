// Injected inline by the root layout so a click on a [data-nk-redirect] trigger is
// captured before React hydrates. It runs under the enforced policy's script
// 'unsafe-inline'; next.config no longer hash-allowlists it, because the strict
// script-src it was written for could never converge under SSG (see cspProbes).
export const BRIDGE_BOOTSTRAP = `(() => {
  const eventName = "nk:redirect";
  document.addEventListener("click", (event) => {
    if (window.__nkBridgeReady) return;
    const target = event.target;
    const trigger = target && target.closest && target.closest("[data-nk-redirect]");
    if (!trigger) return;
    event.preventDefault();
    const payload = {
      title: trigger.getAttribute("data-nk-redirect-title") || "",
      body: trigger.getAttribute("data-nk-redirect-body") || "",
      appPath: trigger.getAttribute("data-nk-redirect-target") || undefined,
    };
    window.__nkPendingRedirect = payload;
    window.dispatchEvent(new CustomEvent(eventName, { detail: payload }));
  }, true);
})();`;
