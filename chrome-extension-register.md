# Chrome Extension Registration Copy

## Title
KeyVid

## Summary
Control online videos with keyboard shortcuts on sites you choose

## Description
KeyVid lets you control HTML5 videos on registered websites with keyboard shortcuts. Add the current site from the popup, or manually enter a site URL such as `example.com` or `https://example.com/watch`. Registered sites can be edited, removed, and shown or hidden from the popup.

- `→` / `←`: seek 5 seconds
- `↑` / `↓`: adjust volume
- `Space`: play / pause
- `F`: fullscreen
- `M`: mute

Only registered sites are enabled, so the extension stays focused and does not control videos everywhere. Site settings are stored locally in your browser.

## Current Project State

- Manifest version: Chrome Extension Manifest V3
- Extension version: `1.1.0`
- Default popup: `popup.html`
- Content script: `content.js`
- YouTube helper bridge: `youtube-bridge.js`
- Storage key: `allowedSites`
- Local-only data: registered site hostnames

## Current Features

- Keyboard controls for HTML5 video playback on registered sites
- Current-site enable/disable from the popup
- Manual site URL entry from the popup
- Site URL normalization from full URL to hostname
- Registered site editing
- Registered site deletion with trash icon button
- Registered sites list with show/hide toggle
- Popup preview fallback when opened directly as `file://`
- YouTube volume synchronization through `youtube-bridge.js`
- On-screen playback feedback indicator with KeyVid green styling

## Category
Accessibility

## Language
English

## Single Purpose Description
KeyVid has one narrow purpose: it lets users control HTML5 video playback on websites they register with keyboard shortcuts.

## Permission Justification

### activeTab justification
KeyVid uses `activeTab` to read the current tab URL in the popup so the user can register or remove the site they are viewing. It does not access tabs for unrelated purposes.

### scripting justification
KeyVid uses `scripting` for the extension behavior needed to support video keyboard controls on pages. The video-control logic only activates on registered sites.

### storage justification
KeyVid uses `storage` to save the user's list of registered websites locally in the browser so the extension only works on approved sites.

### host permission justification
KeyVid's content script is declared for all URLs so it can detect whether the current site is registered, but the video-control logic remains disabled unless the hostname matches the user's locally stored approved site list. KeyVid does not use host access for unrelated tracking, analytics, or browsing data collection.

## File Inventory

- `manifest.json`: Chrome extension manifest, permissions, action popup, content script, icons, and web-accessible YouTube bridge
- `popup.html`: KeyVid popup UI and styling
- `popup.js`: popup behavior for current-site toggle, manual site add/edit/delete, registered site show/hide, local storage sync, and file-preview fallback data
- `content.js`: site access check, video detection, keyboard shortcut handling, fullscreen/mute/playback controls, volume sync, and on-screen feedback indicator
- `youtube-bridge.js`: helper script for YouTube player volume and mute synchronization
- `icon.png`: extension icon
- `store-icon.png`: store listing icon
- `screenshot.png`: current store/UI screenshot reference
- `chrome-extension-register.md`: registration, privacy, and project copy

## Privacy Policy Form Copy

```json
{
  "id": "keyvid",
  "name": "KeyVid",
  "slug": "keyvid",
  "category": "Accessibility",
  "status": "Published",
  "platform": "Chrome Extension",
  "version": "1.1.0",
  "language": "English",
  "description": "Controls HTML5 video playback with keyboard shortcuts on registered websites.",
  "longDescription": "KeyVid is a lightweight browser extension that lets users control HTML5 video playback with keyboard shortcuts on websites they register. Users can add the current site, manually enter a site URL, edit registered sites, remove registered sites, and show or hide the registered site list. It runs locally in the browser, stores only the approved site list in local storage, and does not send user data to external servers.",
  "github": "https://github.com/tono/KeyVid",
  "chromeStore": "https://chromewebstore.google.com/detail/keyvid/",
  "privacyPath": "/extensions/keyvid/privacy",
  "privacyPolicy": {
    "productName": "KeyVid",
    "lastUpdated": "2026-05-06",
    "summary": "KeyVid does not collect, transmit, or share personal or technical data. The extension stores only the user's registered website list locally in the browser so it can enable video shortcuts on approved sites.",
    "contactEmail": "whltn8282@gmail.com",
    "sections": [
      {
        "title": "1. Overview",
        "body": "KeyVid is a Chrome extension that adds keyboard shortcuts for video playback on websites the user registers. Users can manage the registered site list in the popup. KeyVid operates locally in the browser and does not communicate with external servers."
      },
      {
        "title": "2. Data Collection",
        "body": "KeyVid does not collect personal information, browsing history, analytics, technical identifiers, or usage logs. It stores only the list of websites the user chooses to register, and that list stays in the browser's local storage."
      },
      {
        "title": "3. Data Use",
        "body": "The locally stored site list is used only to decide where KeyVid should activate and to let users manage that list in the popup. No data is used for advertising, profiling, analytics, or any purpose unrelated to video control on registered sites."
      },
      {
        "title": "4. Data Sharing",
        "body": "KeyVid does not sell, share, or transmit user data to third parties, advertisers, analytics providers, or external services."
      },
      {
        "title": "5. Permissions",
        "body": "KeyVid uses minimum browser permissions needed to read the current tab URL in the popup, inject its content script on approved sites, and store the user's registered website list locally."
      },
      {
        "title": "6. Children's Privacy",
        "body": "KeyVid is not designed for children and does not knowingly collect personal information from users of any age."
      },
      {
        "title": "7. Changes to This Policy",
        "body": "If this policy changes, the last updated date will be revised to match the current version. The policy will continue to reflect how the extension actually behaves."
      },
      {
        "title": "8. Contact",
        "body": "If you have questions about this privacy policy, contact whltn8282@gmail.com."
      }
    ],
    "dataPractices": [
      {
        "category": "personal",
        "title": "Personal data (name, email, identifiers)",
        "collects": false,
        "description": "KeyVid does not collect or transmit personal information.",
        "sharedWithThirdParties": false
      },
      {
        "category": "usage",
        "title": "Usage data or analytics",
        "collects": false,
        "description": "KeyVid does not collect analytics, behavioral tracking, or usage logs.",
        "sharedWithThirdParties": false
      },
      {
        "category": "technical",
        "title": "Technical information",
        "collects": false,
        "description": "KeyVid does not collect device, browser, system, or network information.",
        "sharedWithThirdParties": false
      },
      {
        "category": "none",
        "title": "Local site registration only",
        "collects": false,
        "description": "The extension stores only the user's registered website list locally in the browser and does not send that list to any external server.",
        "sharedWithThirdParties": false
      }
    ],
    "thirdPartiesDescription": "KeyVid does not send user data to external APIs, analytics tools, advertising platforms, or third-party services."
  }
}
```
