# Chrome Web Store listing copy

Paste these into the Developer Dashboard fields when you submit the extension.
None of this is shown to users until you publish.

---

## Item name

stopme: a cat judges your screen time

(The manifest name is "stopme". You can use a longer name here for the store.)

## Summary (132 characters max)

A cat sits in the corner of your browser and judges how you spend your time online. Productive? It approves. Doomscrolling? It does not.

## Description

stopme puts a small cartoon cat in the corner of your screen. It watches which
sites you visit and how long you linger, then reacts.

Stay on something productive and the cat approves. Sink into a doomscroll and it
gets judgy. It is a gentle, slightly passive-aggressive nudge to get off the
sites you keep telling yourself you will close.

Features:
- A cat that changes mood based on the site you are on
- You decide which sites count as distracting or productive in the settings
- Speech bubbles with commentary
- Optional sound
- Everything stays on your own computer. No accounts, no servers, no tracking.

Open the settings (click the cat icon) to set your own distracting and
productive sites.

## Category

Choose: Productivity (or Fun)

## Language

English

---

## Single purpose description (required field)

stopme displays an animated cat that reacts to the user's browsing activity to
encourage less time on distracting websites.

---

## Permission justifications (you get one field per permission)

### tabs

Used to detect which website is currently active and how long the user stays on
it, so the cat can react to the right site. The extension does not store or
transmit browsing history off the device.

### storage

Used to save the user's own settings (which sites they marked distracting or
productive) and local usage counts. All data is stored locally on the user's
device with chrome.storage.local.

### Host permission (all sites / <all_urls>)

The cat is meant to appear and react on any website the user visits, so the
content script must run on all sites. No site content is read, collected, or
sent anywhere. Only the tab's address and time-on-site are used, and they stay
on the device.

---

## Data usage disclosures (checkboxes in the dashboard)

When the dashboard asks "What user data do you collect?":

- Check: Website content / Web history (because you read the active tab URL)
- Then certify all of the following, which are true for this extension:
  - You do NOT sell or transfer user data to third parties (outside approved use cases)
  - You do NOT use or transfer data for purposes unrelated to the item's single purpose
  - You do NOT use or transfer data to determine creditworthiness or for lending

Privacy policy URL: (host PRIVACY.md and paste the link here, see PUBLISHING.md)
