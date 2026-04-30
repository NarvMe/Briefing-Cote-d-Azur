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

  /**
   * Generischer Event-Tracker. Funktioniert auch vor PostHog-Load
   * (Events werden gequeued).
   */
  function trackEvent(name, properties) {
    properties = properties || {};
    if (isReady()) safeCapture(name, properties);
    else queue.push([name, properties]);
  }

  /**
   * Wird beim Öffnen eines Menüs/Tabs aufgerufen. Schließt automatisch
   * das vorher offene Menü und sendet dessen Verweildauer.
   */
  function trackMenuOpen(menuName, extraProps) {
    if (currentMenu && currentMenu !== menuName) {
      trackMenuClose(currentMenu);
    }
    currentMenu = menuName;
    currentMenuStart = performance.now();
    trackEvent('menu_open', Object.assign({ menu_name: menuName }, extraProps || {}));
  }

  /**
   * Schließt explizit ein Menü und sendet die Verweildauer.
   * Wird automatisch von trackMenuOpen() für das vorige Menü aufgerufen.
   */
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

  /**
   * Explizite Funnel-Schritte. Properties werden mit funnel_name + step
   * angereichert und unter Event 'funnel_step' gesendet.
   *
   * Beispiel:
   *   trackFunnelStep('toern_vorbereitung', 'overview')
   *   trackFunnelStep('marker_exploration', 'marker_clicked', { name: 'Cassis' })
   */
  function trackFunnelStep(funnelName, step, properties) {
    properties = properties || {};
    trackEvent('funnel_step', Object.assign({
      funnel_name: funnelName,
      step: step
    }, properties));
  }

  // Beim Verlassen der Seite das aktuell offene Menü sauber abschließen.
  // sendBeacon-fähig: PostHog nutzt navigator.sendBeacon im pageleave-Modus.
  window.addEventListener('beforeunload', function () {
    if (currentMenu && isReady()) {
      var durationMs = currentMenuStart != null
        ? Math.round(performance.now() - currentMenuStart)
        : 0;
      safeCapture('menu_duration', {
        menu_name: currentMenu,
        duration_ms: durationMs,
        unload: true
      });
    }
  });

  // Public API
  window.SailingAnalytics = {
    trackEvent: trackEvent,
    trackMenuOpen: trackMenuOpen,
    trackMenuClose: trackMenuClose,
    trackFunnelStep: trackFunnelStep
  };
})();
