# 📊 Analytics — Tracking-Plan

PostHog (EU-Cloud) — anonym, opt-out per default. Aktiviert nur nach
expliziter Nutzer-Zustimmung über das Consent-Banner.

- **Project:** EU-Cloud (`https://eu.i.posthog.com`)
- **API-Key:** in `index.html` (Konstante `POSTHOG_API_KEY`)
- **Person Profiles:** `identified_only` (spart Quota — bisher nur anonym)
- **Auto-Capture:** an (Klicks, Form-Submits, Pageleave)
- **Default-Status:** opt-out (kein Tracking bis Banner-Zustimmung)

---

## Auto-getrackte Events (PostHog Standard)

| Event           | Wann                                      | Quelle      |
| --------------- | ----------------------------------------- | ----------- |
| `$pageview`     | Beim ersten Laden der entschlüsselten App | PostHog SDK |
| `$pageleave`    | Beim Verlassen der Seite                  | PostHog SDK |
| `$autocapture`  | Klicks, Form-Submits, Inputs              | PostHog SDK |

---

## Custom Events

### `menu_open`
Tab/Menü wurde geöffnet. **Verweildauer-Start**.

| Property    | Typ    | Beispiel        |
| ----------- | ------ | --------------- |
| `menu_name` | string | `weather`       |
| `region`    | string | `cote-azur`     |
| `initial`   | bool   | `true` beim Laden |

### `menu_duration`
Tab/Menü wurde verlassen. Verweildauer in Millisekunden.
Wird auch beim `beforeunload` gefeuert.

| Property      | Typ    | Beispiel    |
| ------------- | ------ | ----------- |
| `menu_name`   | string | `weather`   |
| `duration_ms` | number | `42_500`    |
| `unload`      | bool   | nur bei beforeunload |

### `region_switch`
Nutzer hat zwischen Côte d'Azur und Kroatien gewechselt.

| Property | Typ    | Beispiel     |
| -------- | ------ | ------------ |
| `from`   | string | `cote-azur`  |
| `to`     | string | `croatia`    |

### `marker_click`
Marker auf der Karte angeklickt → Bottom Sheet geöffnet.

| Property | Typ    | Beispiel              |
| -------- | ------ | --------------------- |
| `name`   | string | `Cassis — Port`       |
| `type`   | string | `port-check`          |
| `lat`    | number | `43.2148`             |
| `lng`    | number | `5.5395`              |

### `funnel_step`
Generisches Funnel-Event mit `funnel_name` + `step`.

| Property      | Typ    | Beispiel                |
| ------------- | ------ | ----------------------- |
| `funnel_name` | string | `toern_vorbereitung`    |
| `step`        | string | `map-panel`             |
| (...)         | mixed  | je nach Funnel          |

---

## Definierte Funnels

### 1. `toern_vorbereitung`
Klassische Vorbereitungs-Reihenfolge.

```
overview  →  map-panel  →  plan  →  check
```

**Auswertung in PostHog:**
- Funnel-Insight mit Event = `funnel_step`
- Filter: `funnel_name = "toern_vorbereitung"`
- Steps in Reihenfolge: `step = "overview"`, `"map-panel"`, `"plan"`, `"check"`

### 2. `marker_exploration`
Karte → Marker-Klick → externer Link.

```
map-panel geöffnet  →  marker_clicked  →  $autocapture (externer Link)
```

**Auswertung:**
- Step 1: Event `funnel_step` mit `funnel_name = "toern_vorbereitung"` und `step = "map-panel"`
- Step 2: Event `funnel_step` mit `funnel_name = "marker_exploration"` und `step = "marker_clicked"`
- Step 3: Event `$autocapture` mit `$event_type = "click"` und `$external_click = true` (PostHog setzt das automatisch bei externen Links)

### 3. `wetter_check`
Wetter-Tab geöffnet, Mistral/Bora-Indikator gesehen.

```
weather_opened  →  (Verweildauer > 5 s)
```

**Auswertung:**
- Event `funnel_step` mit `step = "weather_opened"`
- Korreliert mit `menu_duration` (`menu_name = "weather"`, `duration_ms > 5000`)

### 4. `region_switch`
Nutzer wechselt zwischen Revieren.

```
region_switch.switched
```

---

## Verwendung im Code

```js
// Generisches Event
window.SailingAnalytics.trackEvent('test', { foo: 'bar' });

// Menü öffnen (Verweildauer startet)
window.SailingAnalytics.trackMenuOpen('weather', { region: 'cote-azur' });

// Menü explizit schließen (passiert sonst automatisch beim nächsten Open)
window.SailingAnalytics.trackMenuClose('weather');

// Funnel-Schritt
window.SailingAnalytics.trackFunnelStep('toern_vorbereitung', 'overview');
```

**Aus der Browser-Konsole testen:**

```js
window.SailingAnalytics.trackEvent('test', { foo: 'bar' });
// → Erscheint im PostHog-Dashboard unter Events
```

---

## Neue Events hinzufügen

1. **Im Code:** `window.SailingAnalytics.trackEvent('mein_event', { ... })`
2. **In dieser Datei:** Eintrag unter "Custom Events" anlegen mit Trigger und Properties
3. **In PostHog:** Event taucht beim ersten Auftreten automatisch in der Liste auf

---

## DSGVO-Konformität

- **EU-Cloud:** Daten bleiben in der EU (Frankfurt)
- **Opt-out per default:** PostHog feuert keine Events, bevor `phConsent = 'granted'` in `localStorage` steht
- **Banner:** beim ersten Besuch, mit "Akzeptieren" und "Ablehnen"
- **Widerruf:** Footer-Link "Datenschutz-Einstellungen" öffnet Banner erneut
- **Keine Cross-Site-Cookies:** PostHog setzt nur First-Party-Cookies in der eigenen Domain
- **Anonym:** kein `posthog.identify()` aufgerufen — Distinct-IDs sind anonyme UUIDs

---

## API-Key eintragen

In `index.html` (verschlüsselt) und der unverschlüsselten Quell-HTML
die Konstante ersetzen:

```js
var POSTHOG_API_KEY = 'phc_xxxxxxxxxxxxxxxxxxxxxxxxxx'; // dein echter Key
```

Solange der Platzhalter `YOUR_POSTHOG_API_KEY` drin steht, wird PostHog
**gar nicht initialisiert** — also kein Tracking, kein Banner-Spam,
kein Konsolen-Fehler.
