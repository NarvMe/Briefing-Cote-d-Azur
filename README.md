# ⛵ Sailing Briefing

*Disclaimer: Claude Cowork and Claude Code Hobby project*

Passwortgeschützte Törn-Briefing-App mit mehreren Revieren (Côte d'Azur, Dalmatien).

🔗 **[→ Zur App](https://narvme.github.io/Sailing-Briefing/)**

---

## Release Notes

### Version 4.4 — 30.04.2026
- 🆕 What's-New-Popup zeigt Änderungen jetzt nach Versionsnummern gruppiert
- 🛠️ Bugfix: Schließbuttons in Popups reagieren auf iPhone zuverlässig
- 🛠️ Bugfix: Cookie-Banner schließt jetzt auch auf kleinen Bildschirmen sofort
- 📱 Mobile-Layout für iPhone optimiert (iPad bleibt Hauptziel)

### Version 4.3 — 30.04.2026
- 🔑 PostHog-Key eingetragen — Tracking aktiv nach Banner-Zustimmung

### Version 4.2 — 30.04.2026
- 📊 PostHog-Analytics (EU-Cloud, anonym, opt-out per default)
- 🛡️ Cookie-Banner für DSGVO-Zustimmung
- 🔍 Tab-Verweildauer und Funnel-Schritte werden gemessen
- 📄 [`ANALYTICS.md`](./ANALYTICS.md) dokumentiert den Tracking-Plan

### Version 4.1 — 26.04.2026
- ⛵ Umbenannt zu **Sailing Briefing** (Repo + App-Titel + Apple Home-Screen)
- 🎨 Segelboot-Emoji als Favicon und Apple-Touch-Icon
- 🔁 Service-Worker-Pfad relativ (überlebt Repo-Rename)

### Version 4.0 — 26.04.2026
- 🌍 **Zweites Revier**: Kroatien / Dalmatien hinzugefügt
- 🔀 Region-Umschalter oben rechts (Auswahl in `localStorage` persistiert)
- 🌬️ Bora & Jugo Wind-Indikatoren statt Mistral wenn Adria gewählt
- ⚓ Skipper-Notizen für 8 Buchten (Tatinja, Lučice, Gradina, Milna, …)
- 🗺️ Karte zeigt automatisch die richtigen Marker je Revier
- 📋 Nationalpark-Bojeninfo (Kornati, Mljet) + Reservierungs-Plattformen

### Version 3.6 — 26.04.2026
- 📍 Marker-Positionen aller Häfen, Buchten und Calanques korrigiert (lagen teilweise auf Land)

### Version 3.5 — 26.04.2026
- 📸 Luftbild jedes Ortes im Bottom Sheet (Esri World Imagery)

### Version 3.4 — 26.04.2026
- 🛰️ Satellitenbild-Toggle auf der Karte (unter dem Zoom-Button, Esri World Imagery)

### Version 3.3 — 26.04.2026
- 🛠️ Lizenzen-Popup öffnet korrekt (DOM-Reihenfolge Fix)
- 🗺️ Karte über volle Bildschirmbreite

### Version 3.2 — 26.04.2026
- ⚖️ Lizenzen & APIs — Popup im Footer

### Version 3.1 — 26.04.2026
- 🛠️ Bugfix: Karte im Karten-Tab korrekt angezeigt

### Version 3.0 — 26.04.2026
- 🗺️ OpenSeaMap-Overlay
- ⚓ SVG-Icons für Marker
- 📋 Bottom Sheet statt Popup

### Version 2.4 — 26.04.2026
- 💬 "Was ist neu"-Popup

### Version 2.2 — 26.04.2026
- 🔄 Service Worker Auto-Update

### Version 2.0 — 25.04.2026
- 📍 Heimathafen-Pin Rolland
- 🌬️ Mistral-Sektion & Indikator

### Version 1.0 — 24.04.2026
- Erstveröffentlichung
