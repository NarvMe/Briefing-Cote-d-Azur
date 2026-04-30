/**
 * Sailing Briefing — Consent Banner (DSGVO/CH)
 *
 * Zeigt beim ersten Besuch ein Banner unten am Bildschirm.
 * Speichert die Entscheidung in localStorage unter 'phConsent'.
 * Steuert PostHog opt_in_capturing() / opt_out_capturing().
 *
 * Globaler Namespace: window.SailingConsent
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'phConsent';

  function getConsent() {
    return localStorage.getItem(STORAGE_KEY); // 'granted' | 'denied' | null
  }

  function setConsent(state) {
    localStorage.setItem(STORAGE_KEY, state);
    if (typeof window.posthog !== 'undefined') {
      try {
        if (state === 'granted') window.posthog.opt_in_capturing();
        else window.posthog.opt_out_capturing();
      } catch (e) { /* swallow */ }
    }
  }

  function buildBanner() {
    var wrap = document.createElement('div');
    wrap.id = 'consent-banner';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-label', 'Datenschutz-Einstellungen');
    wrap.innerHTML =
      '<div class="cb-text">' +
        '🛡️ Diese App nutzt <strong>PostHog (EU-Cloud)</strong> für anonyme ' +
        'Nutzungsstatistik (kein Cross-Site-Tracking, keine Werbe-Cookies). ' +
        'Hilfst du, sie besser zu machen?' +
      '</div>' +
      '<div class="cb-buttons">' +
        '<button type="button" class="cb-deny">Ablehnen</button>' +
        '<button type="button" class="cb-accept">Akzeptieren</button>' +
      '</div>';
    document.body.appendChild(wrap);

    wrap.querySelector('.cb-accept').addEventListener('click', function () {
      setConsent('granted');
      hideBanner();
    });
    wrap.querySelector('.cb-deny').addEventListener('click', function () {
      setConsent('denied');
      hideBanner();
    });

    // Slide in next frame
    requestAnimationFrame(function () { wrap.classList.add('cb-visible'); });
  }

  function hideBanner() {
    var wrap = document.getElementById('consent-banner');
    if (!wrap) return;
    // Mark as hiding immediately to give visual feedback even if removal takes a frame
    wrap.classList.add('cb-hiding');
    wrap.classList.remove('cb-visible');
    // Remove from DOM after the (shorter) transition; fallback in case transitionend doesn't fire
    var removed = false;
    var remove = function () {
      if (removed) return;
      removed = true;
      if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
    };
    wrap.addEventListener('transitionend', remove, { once: true });
    setTimeout(remove, 250);
  }

  function showBanner() {
    if (!document.getElementById('consent-banner')) buildBanner();
  }

  function init() {
    // Footer-Link "Datenschutz-Einstellungen ändern"
    var link = document.getElementById('open-consent');
    if (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        localStorage.removeItem(STORAGE_KEY);
        showBanner();
      });
    }
    // First-Visit Banner (kurz verzögert, damit Seite gerendert ist)
    if (!getConsent()) setTimeout(showBanner, 700);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Public API
  window.SailingConsent = {
    showBanner: showBanner,
    hideBanner: hideBanner,
    getConsent: getConsent,
    setConsent: setConsent
  };
})();
