// Shared verbatim between the layout and next.config's strict report-only CSP
// hash. Changing one without the other would cause a policy violation.
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
