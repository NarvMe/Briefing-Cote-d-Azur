/**
 * Sailing Briefing — Analytics Helper
 *
 * Robust gegen "PostHog noch nicht geladen": alle Events werden in einer
 * Queue gehalten und gefluscht, sobald PostHog bereit ist (loaded-Callback
 * im Snippet feuert ein 'phLoaded' CustomEvent).
 *
 * Globaler Namespace: window.SailingAnalytics
 */
(function () {
  'use strict';

  var queue = [];
  var currentMenu = null;
  var currentMenuStart = null;
  var currentRoute = null;       // Sub-View innerhalb eines Menüs (z.B. Tagesplan A/B, Kroatien-Route a/b/c)
  var currentRouteStart = null;

  function isReady() {
    return typeof window.posthog !== 'undefined' && window.posthog.__loaded;
  }

  function safeCapture(name, props) {
    try { window.posthog.capture(name, props || {}); } catch (e) { /* swallow */ }
  }

  function flushQueue() {
    while (queue.length) {
      var item = queue.shift();
      safeCapture(item[0], item[1]);
    }
  }

  document.addEventListener('phLoaded', flushQueue);

  function trackEvent(name, properties) {
    properties = properties || {};
    if (isReady()) safeCapture(name, properties);
    else queue.push([name, properties]);
  }

  // ── Menu (Tabs) ──────────────────────────────────────────────
  function trackMenuOpen(menuName, extraProps) {
    if (currentMenu && currentMenu !== menuName) {
      // Aktive Sub-Route gehört immer zum alten Menu — vor Menu-Close abschließen
      if (currentRoute) trackRouteClose(currentRoute);
      trackMenuClose(currentMenu);
    }
    currentMenu = menuName;
    currentMenuStart = performance.now();
    trackEvent('menu_open', Object.assign({ menu_name: menuName }, extraProps || {}));
  }

  function trackMenuClose(menuName, durationMs) {
    if (!menuName) menuName = currentMenu;
    if (!menuName) return;
    if (typeof durationMs !== 'number') {
      durationMs = currentMenuStart != null
        ? Math.round(performance.now() - currentMenuStart)
        : 0;
    }
    trackEvent('menu_duration', { menu_name: menuName, duration_ms: durationMs });
    if (menuName === currentMenu) {
      currentMenu = null;
      currentMenuStart = null;
    }
  }

  // ── Route (Sub-Views innerhalb eines Tabs) ───────────────────
  function trackRouteOpen(routeName, extraProps) {
    if (currentRoute && currentRoute !== routeName) {
      trackRouteClose(currentRoute);
    }
    currentRoute = routeName;
    currentRouteStart = performance.now();
    trackEvent('route_open', Object.assign({ route_name: routeName }, extraProps || {}));
  }

  function trackRouteClose(routeName, durationMs) {
    if (!routeName) routeName = currentRoute;
    if (!routeName) return;
    if (typeof durationMs !== 'number') {
      durationMs = currentRouteStart != null
        ? Math.round(performance.now() - currentRouteStart)
        : 0;
    }
    trackEvent('route_duration', { route_name: routeName, duration_ms: durationMs });
    if (routeName === currentRoute) {
      currentRoute = null;
      currentRouteStart = null;
    }
  }

  // ── Funnel ───────────────────────────────────────────────────
  function trackFunnelStep(funnelName, step, properties) {
    properties = properties || {};
    trackEvent('funnel_step', Object.assign({
      funnel_name: funnelName,
      step: step
    }, properties));
  }

  // ── Lifecycle: pagehide + visibilitychange ───────────────────
  // beforeunload feuert auf iOS Safari nicht zuverlässig — pagehide schon.
  // visibilitychange behandelt App-in-Hintergrund (Tab-Wechsel, Lock-Screen).

  function flushDurations(reason) {
    if (!isReady()) return;
    var now = performance.now();
    if (currentMenu) {
      var menuDur = currentMenuStart != null ? Math.round(now - currentMenuStart) : 0;
      safeCapture('menu_duration', { menu_name: currentMenu, duration_ms: menuDur, unload: reason === 'pagehide', end_reason: reason });
    }
    if (currentRoute) {
      var routeDur = currentRouteStart != null ? Math.round(now - currentRouteStart) : 0;
      safeCapture('route_duration', { route_name: currentRoute, duration_ms: routeDur, unload: reason === 'pagehide', end_reason: reason });
    }
  }

  window.addEventListener('pagehide', function () { flushDurations('pagehide'); });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      // App ging in den Hintergrund: aktuelle Verweildauern absenden, Counter pausieren
      flushDurations('hidden');
      // Start-Zeitpunkte zurücksetzen, damit beim erneuten Sichtbarwerden
      // nicht die Hintergrundzeit fälschlich mitgezählt wird.
      if (currentMenu) currentMenuStart = null;
      if (currentRoute) currentRouteStart = null;
    } else {
      // Wieder sichtbar: Counter neu starten
      var now = performance.now();
      if (currentMenu) currentMenuStart = now;
      if (currentRoute) currentRouteStart = now;
    }
  });

  // Public API
  window.SailingAnalytics = {
    trackEvent: trackEvent,
    trackMenuOpen: trackMenuOpen,
    trackMenuClose: trackMenuClose,
    trackRouteOpen: trackRouteOpen,
    trackRouteClose: trackRouteClose,
    trackFunnelStep: trackFunnelStep
  };
})();
